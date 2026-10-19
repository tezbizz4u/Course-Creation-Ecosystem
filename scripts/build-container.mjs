import {lookup} from 'node:dns/promises';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
const args=['--config','/workspace/.docker','build'];
// Docker's build network does not inherit the workspace's proxy host mapping.
// Preserve its configured route and TLS trust without embedding credentials.
const hosts=new Set();
for(const name of ['HTTP_PROXY','HTTPS_PROXY']){
 if(!process.env[name])continue;
 const host=new URL(process.env[name]).hostname;
 if(!hosts.has(host)){const address=await lookup(host,{family:4});args.push('--add-host',host+':'+address.address);hosts.add(host)}
 args.push('--build-arg',name);
}
if(process.env.NO_PROXY)args.push('--build-arg','NO_PROXY');
const ca=process.env.NODE_EXTRA_CA_CERTS;
if(ca&&existsSync(ca))args.push('--secret','id=cloud_ca,src='+ca);
args.push('-t','course-studio:local','.');
const child=spawn('docker',args,{stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
