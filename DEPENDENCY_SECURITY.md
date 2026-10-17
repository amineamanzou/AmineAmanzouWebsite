# Dependency audit policy

CI, production image publication and Docker builds use `npm run audit:dependencies`.
The command audits both production and development dependencies and preserves the
full npm audit report in the build log. Every moderate, high or critical finding
blocks the build. Info and low findings remain visible without blocking it.
There are no package or advisory exceptions.

Registry errors, malformed reports and audit process failures fail closed. Tests
cover severity enforcement, invalid reports and the command's exit behavior.

Image workflows disable caching for the Node build stage so each image build
queries the current advisory database. Local image verification must also use
`docker build --no-cache`.

A clean npm report means the resolved versions are outside the affected ranges
currently reported by npm. It does not by itself prove that a particular advisory
has been fixed or officially withdrawn; verify that separately with upstream sources.
