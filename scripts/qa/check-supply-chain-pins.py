#!/usr/bin/env python3

from __future__ import annotations

import os
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
USES = re.compile(r"\\buses:\\s*['\\\"]?([^'\\\"#\\s]+)")
SHA = re.compile(r"^[0-9a-f]{40}$")
DIGEST = re.compile(r"^sha256:[0-9a-f]{64}$")
SKIP_DIRS = {".git", ".astro", "dist", "node_modules"}
errors = []

for workflow in sorted((ROOT / ".github" / "workflows").glob("*.y*ml")):
    for line_number, line in enumerate(workflow.read_text(encoding="utf-8").splitlines(), 1):
        match = USES.search(line)
        if not match:
            continue
        reference = match.group(1)
        if reference.startswith("./"):
            continue
        action, separator, version = reference.rpartition("@")
        if not separator:
            errors.append(f"{workflow.relative_to(ROOT)}:{line_number}: missing action ref")
        elif action.startswith("docker://"):
            if not DIGEST.fullmatch(version):
                errors.append(f"{workflow.relative_to(ROOT)}:{line_number}: mutable container action {reference}")
        elif not SHA.fullmatch(version):
            errors.append(f"{workflow.relative_to(ROOT)}:{line_number}: mutable action {reference}")

for directory, subdirectories, files in os.walk(ROOT):
    subdirectories[:] = [
        name for name in subdirectories if name not in SKIP_DIRS and not name.startswith(".venv")
    ]
    for filename in files:
        if not filename.startswith("Dockerfile"):
            continue
        dockerfile = Path(directory) / filename
        for line_number, line in enumerate(dockerfile.read_text(encoding="utf-8").splitlines(), 1):
            stripped = line.strip()
            if not stripped.upper().startswith("FROM "):
                continue
            tokens = stripped.split()
            image = next((token for token in tokens[1:] if not token.startswith("--")), "")
            if not re.search(r"@sha256:[0-9a-f]{64}$", image):
                errors.append(f"{dockerfile.relative_to(ROOT)}:{line_number}: mutable base image {image}")

if errors:
    raise SystemExit("Supply-chain pinning check failed:\\n" + "\\n".join(f"- {error}" for error in errors))

print("Supply-chain pinning checks passed")
