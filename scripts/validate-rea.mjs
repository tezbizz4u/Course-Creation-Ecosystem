import { spawnSync } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root='/workspace/rea';
const evidence='/workspace/scratch/rea-validation';
await mkdir(evidence,{recursive:true});
function run(args){
  const result=spawnSync(process.execPath,[root+'/scripts/rea.mjs',...args],{cwd:root,encoding:'utf8',timeout:90000,maxBuffer:16*1024*1024});
  if(result.error)throw result.error;
  assert.equal(result.status,0,result.stderr+'\n'+result.stdout.slice(0,1000));
  return JSON.parse(result.stdout);
}
const mcp=run(['mcp','doctor','--json']);
assert.equal(mcp.healthy,true);
assert.equal(mcp.inventory.tools.observed,mcp.inventory.tools.expected);
assert.equal(mcp.request_flow.ok,true);
await writeFile(evidence+'/mcp.json',JSON.stringify(mcp,null,2)+'\n');
const js=run(['analyze-javascript-application',root+'/tests/conformance/readiness/javascript-cli','--json']);
assert.equal(js.operation,'analyze_javascript_application');
assert.equal(js.subject.name,'javascript-cli');
assert.equal(js.normalized_result.integrity_contradictions.length,0);
assert.ok(js.normalized_result.graph.nodes.length>0);
assert.ok(JSON.stringify(js.normalized_result).includes('node:child_process'));
await writeFile(evidence+'/javascript.json',JSON.stringify(js,null,2)+'\n');
console.log(`PASS: REA production MCP handshake (${mcp.inventory.tools.observed} tools), target-free request, and static JavaScript fixture analysis (${js.evidence_id}).`);
