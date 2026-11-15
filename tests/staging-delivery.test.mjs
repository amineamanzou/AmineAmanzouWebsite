import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const env = { GITHUB_REPOSITORY: 'amineamanzou/AmineAmanzouWebsite', GITHUB_REF: 'refs/heads/dev',
  GITHUB_EVENT_NAME: 'push', GITHUB_SHA: 'a'.repeat(40), GITHUB_RUN_ID: '123', GITHUB_RUN_ATTEMPT: '2',
  IMAGE_REF: `ghcr.io/amineamanzou/amineamanzou-website@sha256:${'b'.repeat(64)}` };
const emit = (patch = {}) => spawnSync(process.execPath, ['scripts/qa/staging-event.mjs'],
  { env: { ...process.env, ...env, ...patch }, encoding: 'utf8' });

test('verified staging event binds dev source, run, attempt and immutable image', () => {
  const result = emit();
  assert.equal(result.status, 0, result.stderr);
  const event = JSON.parse(result.stdout);
  assert.equal(event.schemaVersion, '2.0');
  assert.equal(event.eventType, 'staging-deploy');
  assert.equal(event.environment, 'staging');
  assert.equal(event.sha, env.GITHUB_SHA);
  assert.equal(event.sourceRunId, env.GITHUB_RUN_ID);
  assert.equal(event.runId, env.GITHUB_RUN_ID);
  assert.equal(event.runAttempt, env.GITHUB_RUN_ATTEMPT);
  assert.equal(event.imageRef, env.IMAGE_REF);
  assert.equal(event.imageDigest, `sha256:${'b'.repeat(64)}`);
  assert.equal(event.version, JSON.parse(readFileSync('package.json')).version);
  for (const check of ['trivy', 'cosign', 'attestation']) assert.equal(event.checks[check], 'success');
});

test('staging event refuses untrusted or incomplete publication identity', () => {
  for (const patch of [{ GITHUB_REF: 'refs/heads/main' }, { GITHUB_EVENT_NAME: 'pull_request' },
    { GITHUB_REPOSITORY: 'attacker/fork' }, { GITHUB_SHA: 'dev' }, { GITHUB_RUN_ID: '0' },
    { GITHUB_RUN_ATTEMPT: '' }, { IMAGE_REF: 'ghcr.io/amineamanzou/amineamanzou-website:main' },
    { IMAGE_REF: env.IMAGE_REF.replace('amineamanzou-website', 'other') }]) {
    const result = emit(patch);
    assert.notEqual(result.status, 0, JSON.stringify(patch));
    assert.equal(result.stdout, '', 'failed validation must emit no event');
  }
});

test('staging workflow separates PR validation from dev-only publication and preserves exact gates', () => {
  const workflow = readFileSync('.github/workflows/build-staging.yml', 'utf8');
  assert.match(workflow, /branches: \[dev\]/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/dev' && \(github\.event_name == 'push' \|\| github\.event_name == 'workflow_dispatch'\)/);
  assert.match(workflow, /needs: quality/);
  assert.match(workflow, /github.repository == 'amineamanzou\/AmineAmanzouWebsite'/);
  assert.match(workflow, /staging-\$\{\{ github.sha \}\}-\$\{\{ github.run_id \}\}-\$\{\{ github.run_attempt \}\}/);
  assert.doesNotMatch(workflow, /:main|:latest|refs\/heads\/main|imagetools create|schedule:|continue-on-error:/);
  assert.match(workflow, /SITE_URL=https:\/\/amineamanzou.fr/);
  assert.match(workflow, /PUBLIC_BROWSER_OBSERVABILITY_ENABLED=false/);
  assert.match(workflow, /PUBLIC_PRODUCT_ANALYTICS_ENABLED=false/);
  for (const gate of ['trivy_pushed_digest', 'cosign_verify', 'verify_attestation']) assert.match(workflow, new RegExp(`id: ${gate}`));
  const emitAt = workflow.indexOf('node scripts/qa/staging-event.mjs');
  assert.ok(emitAt > workflow.indexOf('id: verify_attestation'));
  assert.doesNotMatch(workflow.slice(workflow.lastIndexOf('- name:', emitAt), emitAt), /always\(\)/);
  assert.match(workflow, /--source-ref "refs\/heads\/dev"/);
  assert.match(workflow, /--source-digest "\$\{\{ github.sha \}\}"/);
  assert.match(workflow, /name: cicd-event-staging/);
  assert.match(workflow, /node --test tests\/\*\.test.mjs/);
});

test('staging release gates scan and verify the exact digest before publishing evidence', () => {
  const workflow = JSON.parse(execFileSync('ruby', ['-ryaml', '-rjson', '-e',
    'puts JSON.generate(YAML.load_file(ARGV[0]))', '.github/workflows/build-staging.yml'], { encoding: 'utf8' }));
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.equal(workflow.jobs.quality.permissions, undefined);
  const steps = workflow.jobs.release.steps;
  const step = id => steps.find(value => value.id === id);
  const image = '${{ env.IMAGE_NAME }}@${{ steps.push.outputs.digest }}';
  assert.equal(step('trivy_pushed_digest').with['image-ref'], image);
  assert.equal(step('trivy_pushed_digest').with.severity, 'CRITICAL');
  assert.equal(step('trivy_pushed_digest').with['exit-code'], '1');
  assert.equal(step('push').with.push, true);
  assert.equal(step('push').with.sbom, true);
  assert.equal(step('push').with.provenance, 'mode=min,version=v1');
  assert.equal(step('attest_provenance').with['subject-digest'], '${{ steps.push.outputs.digest }}');
  assert.equal(step('attest_sbom').with['subject-digest'], '${{ steps.push.outputs.digest }}');
  for (const id of ['cosign_sign', 'cosign_verify', 'verify_attestation']) {
    assert.equal(step(id).env.IMAGE_REF, image);
    assert.equal(step(id).if, undefined);
  }
  const eventAt = steps.findIndex(value => value.run?.includes('node scripts/qa/staging-event.mjs'));
  for (const id of ['trivy_pushed_digest', 'cosign_verify', 'verify_attestation']) {
    assert.ok(steps.indexOf(step(id)) < eventAt);
    assert.equal(step(id)['continue-on-error'], undefined);
  }
  assert.equal(steps[eventAt].if, undefined);
  assert.equal(steps[eventAt].env.IMAGE_REF, image);
  const production = readFileSync('.github/workflows/deploy-production.yml', 'utf8');
  for (const value of steps.filter(value => value.uses)) assert.ok(production.includes(value.uses), `Unapproved action reference: ${value.uses}`);
});
