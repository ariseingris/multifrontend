# Repository-wide coding instructions

- At the end of every coding task or session, review the actual changes and append a dated session entry to the root `DEVELOPMENT_LOG.md`. Record partial work when a session is interrupted, when possible.
- Preserve all previous log entries. Report actual changes, technical decisions, successful and unsuccessful work, commands and validation results, checks not run and why, unresolved issues, next steps, and Git branch/commit and committed or uncommitted status. Never invent timestamps, results, or commit hashes.
- Avoid unnecessary inline comments in new code. Preserve legally required license and copyright notices and essential compiler, framework, lint, and type directives.

## 3.4 No Code Comments — External Documentation Policy

### Core Rule

AI agents MUST NOT add explanatory comments to source code.

This rule applies to all programming languages used in the repository, including TypeScript, JavaScript, JSX, TSX, Python, HTML, and CSS.

Prohibited:
- Single-line explanatory comments.
- Multi-line explanatory comments.
- JSX comments.
- HTML explanatory comments.
- CSS explanatory comments.
- TODO, FIXME, HACK, and NOTE comments.
- Commented-out code.
- Comments explaining implementation decisions, algorithms, business logic, or architecture.

### Self-Documenting Code

All newly written or modified code must be self-documenting.

Agents must:
- Use descriptive variable and function names.
- Keep functions focused and readable.
- Use meaningful component and type names.
- Extract complex logic into clearly named functions when appropriate.
- Avoid unnecessary abstractions or excessive fragmentation solely to replace comments.

Do not remove or alter technically necessary directives, legally required notices, or third-party license headers.

Existing comments outside the task scope do not need to be removed unless explicitly requested.

### External Documentation Requirement

All explanations that would normally be written as code comments MUST instead be documented in:

`DEVELOPMENT_LOG.md`

This file must be located at the repository root.

At the end of EVERY requested coding task, the agent MUST create or update this Markdown file.

The log must include:

1. Task objective.
2. Start and completion date/time, when available.
3. Files created, modified, and deleted.
4. Features implemented or bugs fixed.
5. Important technical decisions and their rationale.
6. Algorithms or calculations that require explanation.
7. Architectural changes and compatibility considerations.
8. Tests and verification commands executed.
9. Actual test results, including failures or checks not performed.
10. Known limitations and unresolved issues.
11. Recommended next steps.
12. Git branch and commit status, when available.

### Logging Rules

- Append a new entry for each completed task.
- Never overwrite or delete previous entries.
- Do not fabricate test results or implementation details.
- Clearly distinguish implemented functionality from proposed functionality.
- Record unsuccessful attempts when relevant.
- Keep entries concise but sufficiently detailed for another developer or AI agent to resume work.
- Use Markdown headings, tables, and code blocks where useful.

### Relationship with BUGBOOK.md

`DEVELOPMENT_LOG.md` records ALL development tasks and technical decisions.

`BUGBOOK.md` records confirmed bugs, root causes, reproduction steps, fixes, and prevention rules.

When a task fixes a confirmed bug:

1. Record the task in `DEVELOPMENT_LOG.md`.
2. Add or update the corresponding entry in `BUGBOOK.md`.
3. Reference the BUGBOOK entry from the development log.

Do not duplicate extensive bug analysis across both files.

### Mandatory Task Completion Workflow

Every coding task must finish with:

```text
IMPLEMENT
    ↓
TEST
    ↓
VERIFY
    ↓
UPDATE DEVELOPMENT_LOG.md
    ↓
UPDATE BUGBOOK.md (if applicable)
    ↓
FINAL REPORT
```

An agent MUST NOT declare a task complete before updating the development log.

If a task cannot be completed, document the partial results, blockers, and remaining work.

### Final Report

At the end of each task, provide:

- Summary of implementation.
- Validation results.
- Updated documentation files.
- Known issues.
- Next steps.

All explanatory documentation belongs in Markdown files, not inline source code comments.

**Priority: Self-documenting code + persistent Markdown documentation.**

The existing repository BUGBOOK workflow remains authoritative; its current location is [`docs/BUGBOOK.md`](docs/BUGBOOK.md). Confirmed bug fixes must update that file and link the corresponding entry from `DEVELOPMENT_LOG.md`.

## 3.5 Repository Resource Management Policy

- Place new shared media in `assets/shared/`, using `logos/`, `icons/`, or `backgrounds/` as appropriate. Reuse one canonical copy across projects.
- Place project-specific media in `assets/aquasense/`, `assets/factsafe/`, or `assets/firescout/`, using `images/` and `videos/` as appropriate. Use descriptive, consistent filenames.
- Store non-runtime research, specifications, development notes, design references and historical documents in the corresponding `documents/` directory. Project research belongs in `documents/research/{aquasense,factsafe,firescout}/`. Preserve useful original formats and sources.
- Do not scatter new images or technical Markdown documents across unrelated directories. Consult `assets/README.md`, `documents/README.md`, and `documents/development/RESOURCE_INVENTORY.md` before reorganizing resources.
- Keep root workflow files (`AGENTS.md`, `README.md`, `DEVELOPMENT_LOG.md`, any root `BUGBOOK.md`, package manifests and configuration) at their required locations. Keep the authoritative `docs/BUGBOOK.md` and component-local setup guides in place. Source-of-truth specifications live in `documents/specifications/`; preserve or consistently update all consumers when moving them.
- Keep application source, React components, runtime configuration and simulator code in their runtime directories. Vite explicitly serves root `assets/` through `publicDir`; reference public media with `import.meta.env.BASE_URL` in React or `%BASE_URL%` in HTML. Files in `frontend/src/` imported by code and any future `frontend/public/` files must be audited before relocation; changing publicDir requires a migration of their references. The Docker build must include the canonical assets directory.
- Update imports, CSS URLs, scripts and documentation links whenever files move. Audit references first, verify build/type checking and asset loading, and avoid duplicate copies. Do not assume root files are browser-accessible without explicit configuration.
- Do not add explanatory source-code comments. Preserve mandatory directives and legal notices as required by Section 3.4. Record explanations, decisions, migration paths and actual verification results in root `DEVELOPMENT_LOG.md` at the end of every coding task.
- Preserve all BUGBOOK reporting requirements. Confirmed bug fixes must update `docs/BUGBOOK.md` and link its corresponding entry from `DEVELOPMENT_LOG.md`.
- Do not perform unrelated refactoring. Preserve uncommitted work and do not commit or push without user approval.
