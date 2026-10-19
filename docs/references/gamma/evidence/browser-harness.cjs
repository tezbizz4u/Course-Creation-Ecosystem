const {chromium}=require('/workspace/Course-Creation-Ecosystem/node_modules/playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
(async()=>{
 const slug=process.argv[2]||'home'; const tag=slug.replaceAll('/','-'); const url=slug==='home'?'https://gamma.app/':'https://gamma.app/'+slug;
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,env:{...process.env,HOME:'/workspace/scratch/browser-home'},proxy:{server:process.env.HTTPS_PROXY||process.env.HTTP_PROXY},args:['--remote-debugging-port=9333']});
 try {
 const page=await browser.newPage();
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
 console.log('Browser page:',await page.title());
 const targets=await (await fetch('http://127.0.0.1:9333/json/list')).json();
 const target=targets.find(x=>x.type==='page'&&x.url.startsWith('https://gamma.app'));
 const input=JSON.parse(fs.readFileSync('/workspace/scratch/rea-references/gamma-scenario.json','utf8'));
 input.start_url={url}; input.capture.at_end=['dom','accessibility','url']; input.browser={mode:'connect',cdp_endpoint:'http://127.0.0.1:9333',target_id:target.id};
 fs.writeFileSync('/workspace/scratch/rea-references/gamma-'+tag+'-scenario.json',JSON.stringify(input,null,2));
 const out=fs.openSync('/workspace/scratch/rea-references/gamma-'+tag+'-result.json','w');
 const child=spawn(process.execPath,['/workspace/rea/scripts/rea.mjs','capture-browser-scenario','/workspace/scratch/rea-references/gamma-'+tag+'-scenario.json','--format','json'],{stdio:['ignore',out,'inherit']});
 const code=await new Promise(r=>child.on('exit',r));fs.closeSync(out);console.log('REA exit:',code);
 } finally {await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
