import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

for (const kind of ['production-deploy', 'security']) {
  test(`${kind} emits a versioned event with immutable release evidence`, () => {
    const dir = mkdtempSync(join(tmpdir(), 'cicd-event-'));
    try {
      const out = join(dir, 'event.json');
      const digest = `sha256:${'a'.repeat(64)}`;
      execFileSync(process.execPath, ['scripts/qa/emit-cicd-event.mjs',
        '--kind', kind, '--image-name', 'ghcr.io/amineamanzou/amineamanzou-website',
        '--image-digest', digest, '--check', 'trivy=success', '--out', out]);
      const event = JSON.parse(readFileSync(out, 'utf8'));
      assert.equal(event.schemaVersion, '2.0');
      assert.equal(event.version, JSON.parse(readFileSync('package.json', 'utf8')).version);
      assert.match(event.version, /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/);
      assert.equal(event.eventType, kind);
      assert.equal(event.imageRef, `ghcr.io/amineamanzou/amineamanzou-website@${digest}`);
      assert.equal(event.checks.trivy, 'success');
      assert.equal(event.checks.cosign, 'not_applicable');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
}
