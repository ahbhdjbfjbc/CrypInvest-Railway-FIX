#!/usr/bin/env node
/** CrypInvest encrypted MongoDB backup. */
const fs=require('fs');const path=require('path');const crypto=require('crypto');const {spawn}=require('child_process');require('dotenv').config();
const {pipeline}=require('stream/promises');
(async()=>{try{
 if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required.');
 if(!/^[0-9a-fA-F]{64}$/.test(String(process.env.BACKUP_ENCRYPTION_KEY||'')))throw new Error('BACKUP_ENCRYPTION_KEY must be a 32-byte hex key.');
 const outDir=path.resolve(process.env.BACKUP_DIR||'backups');fs.mkdirSync(outDir,{recursive:true});const stamp=new Date().toISOString().replace(/[:.]/g,'-');const plain=path.join(outDir,`crypinvest-${stamp}.archive.gz`);const encrypted=path.join(outDir,`crypinvest-${stamp}.archive.gz.enc`);
 await new Promise((resolve,reject)=>{const p=spawn('mongodump',['--uri',process.env.MONGODB_URI,`--archive=${plain}`,'--gzip'],{stdio:'inherit'});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(new Error(`mongodump failed with exit code ${code}`)));});
 const stat=fs.statSync(plain);if(stat.size<128)throw new Error('Backup archive is unexpectedly small.');
 const key=Buffer.from(process.env.BACKUP_ENCRYPTION_KEY,'hex'),iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);await pipeline(fs.createReadStream(plain),cipher,fs.createWriteStream(encrypted));const tag=cipher.getAuthTag();
 const body=fs.readFileSync(encrypted);fs.writeFileSync(encrypted,Buffer.concat([Buffer.from('CIBAK1'),iv,tag,body]));fs.unlinkSync(plain);
 const encryptedStat=fs.statSync(encrypted);const manifest=path.join(outDir,`crypinvest-${stamp}.json`);fs.writeFileSync(manifest,JSON.stringify({application:'CrypInvest',createdAt:new Date().toISOString(),archive:path.basename(encrypted),sizeBytes:encryptedStat.size,encrypted:true,algorithm:'AES-256-GCM',note:'Keep BACKUP_ENCRYPTION_KEY outside the repository. Restore requires decrypting this archive first.'},null,2));console.log(`BACKUP_OK ${path.basename(encrypted)} (${encryptedStat.size} bytes)`);console.log(`Manifest: ${path.basename(manifest)}`);
}catch(e){console.error('ERROR:',e.message);process.exitCode=1}})();
