import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
test('CI image fixture supplies every required Docker release metadata argument',()=>{
  const path=process.env.CI_WORKFLOW_FIXTURE || '.github/workflows/ci.yml';
  const workflow=JSON.parse(execFileSync('ruby',['-ryaml','-rjson','-e','puts JSON.generate(YAML.load_file(ARGV[0]))',path],{encoding:'utf8'}));
  const steps=workflow.jobs.verify.steps, build=steps.find(s=>s.name==='Build image');
  const supplied=new Set(build.with['build-args'].split('\n').map(line=>line.split('=')[0]));
  const required=[...readFileSync('Dockerfile','utf8').matchAll(/^ARG ([A-Z_]+)$/gm)].map(match=>match[1]);
  for(const name of required)assert.ok(supplied.has(name),`Missing required Docker build argument: ${name}`);
  const freeze=steps.findIndex(s=>s.name==='Freeze image fixture build identity');
  assert.ok(freeze>=0&&freeze<steps.indexOf(build));
  assert.match(steps[freeze].run,/parisDate/);
  assert.match(steps[freeze].run,/productionConfiguration\(\{productAnalytics:false\}\)/);
  assert.equal(build.with.push,false);
});
