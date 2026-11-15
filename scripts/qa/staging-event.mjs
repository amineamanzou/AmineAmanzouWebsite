import { readFileSync } from 'node:fs';

// Invoked only after the exact digest passes scan, signature and provenance verification.
const { IMAGE_REF, GITHUB_SHA, GITHUB_RUN_ID, GITHUB_RUN_ATTEMPT,
  GITHUB_REPOSITORY, GITHUB_REF, GITHUB_EVENT_NAME } = process.env;
if (GITHUB_REPOSITORY !== 'amineamanzou/AmineAmanzouWebsite' || GITHUB_REF !== 'refs/heads/dev' ||
    !['push', 'workflow_dispatch'].includes(GITHUB_EVENT_NAME) ||
    !/^ghcr\.io\/amineamanzou\/amineamanzou-website@sha256:[a-f0-9]{64}$/.test(IMAGE_REF ?? '') ||
    !/^[a-f0-9]{40}$/.test(GITHUB_SHA ?? '') || !/^[1-9][0-9]*$/.test(GITHUB_RUN_ID ?? '') ||
    !/^[1-9][0-9]*$/.test(GITHUB_RUN_ATTEMPT ?? '')) throw new Error('Invalid staging release identity');
const timestamp = new Date().toISOString();
process.stdout.write(JSON.stringify({
  schemaVersion: '2.0', eventType: 'staging-deploy', environment: 'staging',
  repository: GITHUB_REPOSITORY, workflow: 'Build and Deploy Staging', job: 'release',
  runId: GITHUB_RUN_ID, sourceRunId: GITHUB_RUN_ID, runAttempt: GITHUB_RUN_ATTEMPT,
  version: JSON.parse(readFileSync(new URL('../../package.json', import.meta.url))).version,
  ref: GITHUB_REF, sha: GITHUB_SHA, eventName: GITHUB_EVENT_NAME,
  status: 'completed', conclusion: 'success', startedAt: timestamp, completedAt: timestamp,
  imageName: IMAGE_REF.split('@')[0], imageDigest: IMAGE_REF.split('@')[1], imageRef: IMAGE_REF,
  checks: { plumber: 'not_applicable', trivy: 'success', codeql: 'not_applicable',
    scorecard: 'not_applicable', gitleaks: 'not_applicable', cosign: 'success', attestation: 'success' },
}) + '\n');
