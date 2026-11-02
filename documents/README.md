# Development documents

Store non-runtime research, specifications, plans, design references and project history here. Preserve useful original PDFs, DOCX, PPTX, Markdown and archives; do not discard original research sources without authorization.

```text
documents/
├── research/
│   ├── aquasense/
│   ├── factsafe/
│   └── firescout/
├── specifications/
├── development/
└── references/
    ├── screenshots/
    └── figma-react-patch.zip
```

- `research/<project>/`: marketing, financial, business and competitor research for the named project. No original research reports were present during this migration.
- `specifications/`: source-of-truth technical specifications and implementation plans, including Codex task specifications.
- `development/`: delivery reports, troubleshooting, implementation notes, model documentation and the [complete resource inventory](development/RESOURCE_INVENTORY.md).
- `references/`: historical executive summary, Figma starter archive and documentation-only screenshots. The archive is preserved as a reference and is not applied to runtime code.

Use relative Markdown links and update all consumers when moving documents. Historical directory-tree examples describe their original repository state; the inventory provides the current path mapping. Previous entries in the append-only development log retain their original paths as historical evidence.

Required exceptions remain in place: root [AGENTS.md](../AGENTS.md), [README.md](../README.md), [DEVELOPMENT_LOG.md](../DEVELOPMENT_LOG.md), component setup guides [frontend/README.md](../frontend/README.md) and [simulator/README.md](../simulator/README.md), and the authoritative [docs/BUGBOOK.md](../docs/BUGBOOK.md). Any root BUGBOOK.md, package manifests and runtime configuration must also remain at the paths required by their workflows.

Record every coding task in the root development log. Confirmed bug fixes must also update the existing BUGBOOK and link that entry from the development log. New website images and videos belong in [assets/](../assets/), which is browser-accessible; this documents directory is not a Vite public directory.
