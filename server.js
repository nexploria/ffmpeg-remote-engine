const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Autorise tous les domaines (temporaire)

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { spawn } from "child_process";
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

const { PORT=8080, API_KEY="", SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET="renders" } = process.env;
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Missing SUPABASE env"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const app = express();

// Enhanced CORS configuration
app.use(cors({ 
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
}));
app.use(morgan("tiny")); 
app.use(express.json({ limit: "10mb" }));

// API Key validation - supports both x-api-key and Authorization Bearer
app.use((req,res,next)=>{ 
  const k = req.get("x-api-key") || req.get("authorization")?.replace("Bearer ", "");
  if(!API_KEY || k === API_KEY) return next(); 
  res.status(401).json({ok:false,error:"unauthorized"}); 
});

// Utilise FFmpeg système (installé dans le Dockerfile)
function runFFmpeg(args,cwd){
  console.log(`[FFmpeg] Exécution: ffmpeg ${args.join(' ')}`);
  const startTime = Date.now();
  return new Promise((resolve,reject)=>{
    const p=spawn("ffmpeg",args,{cwd});
    let log="";
    p.stdout.on("data",d=>log+=d.toString());
    p.stderr.on("data",d=>{
      const msg = d.toString();
      log+=msg;
      // Log progression
      if(msg.includes('time=')) console.log(`[FFmpeg Progress] ${msg.match(/time=[\d:.]+/)?.[0]}`);
    });
    p.on("error",reject);
    p.on("close",c=>{
      const duration = Date.now() - startTime;
      console.log(`[FFmpeg] Terminé en ${duration}ms`);
      return c===0?resolve(log):reject(new Error(log));
    });
  });
}
async function downloadTo(filePath,url){const r=await fetch(url); if(!r.ok) throw new Error(`Download failed ${r.status} ${url}`); const buf=Buffer.from(await r.arrayBuffer()); await fs.writeFile(filePath,buf);}

app.get("/health",(_req,res)=>res.json({ok:true}));
app.post("/probe",async(_req,res)=>{try{res.json({ok:true,out:await runFFmpeg(["-version"])});}catch(e){res.status(500).json({ok:false,error:String(e)})}});

app.post("/render",async(req,res)=>{
  res.setTimeout(1000*60*15);
  const { images=[], imageDuration=3, fps=30, width=1920, height=1080, voiceover, subtitles, outputName=`render-${Date.now()}.mp4` }=req.body||{};
  if(!Array.isArray(images)||!images.length) return res.status(400).json({ok:false,error:"images[] required"});
  if(!voiceover) return res.status(400).json({ok:false,error:"voiceover required"});
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),"render-"));
  try{
    const localImgs=[];
    for(let i=0;i<images.length;i++){const p=path.join(tmp,`img-${String(i).padStart(3,"0")}.jpg`); await downloadTo(p,images[i]); localImgs.push(p);}
    const voice=path.join(tmp,"voice.mp3"); await downloadTo(voice,voiceover);
    let subs=""; if(subtitles){subs=path.join(tmp,"subs.srt"); await downloadTo(subs,subtitles);}

    const listTxt=path.join(tmp,"list.txt"); let txt=""; 
    for(const img of localImgs){ txt+=`file '${img.replace(/'/g,"'\\''")}'\n`; txt+=`duration ${imageDuration}\n`; }
    txt+=`file '${localImgs.at(-1).replace(/'/g,"'\\''")}'\n`; await fs.writeFile(listTxt,txt,"utf8");

    const out=path.join(tmp,outputName);
    const vfBase=`scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p`;
    const vf=subtitles?`${vfBase},subtitles='${subs.replace(/\\/g,"\\\\").replace(/:/g,"\\:")}'`:vfBase;

    const args=["-y","-f","concat","-safe","0","-i",listTxt,"-r",String(fps),"-i",voice,"-vf",vf,"-c:v","libx264","-preset","veryfast","-crf","23","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-shortest","-movflags","+faststart",out];
    await runFFmpeg(args,tmp);

    const buf=await fs.readFile(out); const key=`renders/${outputName}`;
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(key,buf,{contentType:"video/mp4",upsert:true});
    if(error) throw error;
    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(key);
    res.json({ ok:true, url:data.publicUrl, bytes:buf.length });
  }catch(e){ console.error(e); res.status(500).json({ok:false,error:String(e)}); }
  finally{ try{await fs.rm(tmp,{recursive:true,force:true});}catch{} }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});


