# Website assets

Reusable website media lives here, separate from application source and research documents.

```text
assets/
├── shared/
│   ├── logos/dashboard-logo.png
│   ├── icons/
│   └── backgrounds/
├── aquasense/{images,videos}/
├── factsafe/{images,videos}/
└── firescout/{images,videos}/
```

Use descriptive lowercase hyphenated filenames. Put resources used by several projects under `shared/` and reference the same file; put project-specific images and videos under that project's directory. Empty directories contain `.gitkeep` placeholders. Documentation screenshots and original design archives belong in [documents/references](../documents/references/), not in the browser media area.

Vite's `frontend/vite.config.ts` explicitly sets `publicDir: '../assets'`. A file at `assets/shared/logos/dashboard-logo.png` is served as `/shared/logos/dashboard-logo.png`, not `/assets/shared/logos/dashboard-logo.png`. Vite copies these public resources unchanged into `frontend/dist/` during production builds. React should use `${import.meta.env.BASE_URL}shared/logos/dashboard-logo.png`; HTML should use `%BASE_URL%shared/logos/dashboard-logo.png`. Apply the same base-path handling to video and dynamic asset URLs. Public files are not fingerprinted; use a new filename when cache invalidation is needed.

Do not place private documents here: this entire directory is public in development and copied into production output. Its README and placeholders may also be served. Source imports, generated SVG icons, CSS, components, package-owned Leaflet images and runtime configuration stay in their supported source/dependency locations. There was no `frontend/public/` at migration time; do not introduce a second public directory expecting Vite to serve it automatically.

Docker Compose builds the frontend from the repository root so `frontend/Dockerfile` can copy both `frontend/` and `assets/`. For a standalone frontend image run `docker build -f frontend/Dockerfile .` from the repository root. See the [migration inventory](../documents/development/RESOURCE_INVENTORY.md) for original locations and retained runtime files.
