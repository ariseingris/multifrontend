# AquaSense — Website content collection and section research brief for Codex

## 0. Purpose
Research public business websites and prepare the **content of each website page/section**, not a financial model, investor report, stock analysis, or frontend redesign. Source basis: user-provided `01_AQUASENSE_MARKETING_TAI_CHINH.md.docx`, especially feedback on page 3 and example menus/screenshots on pages 4–6. Maintain a reusable research structure for later FactSafe and FireScout tasks.

## 1. The user's editorial correction (highest priority)
The source explicitly says: “bỏ hết mấy cái kinh tế, kinh doanh, chỉ đáp ứng những gì web đáng để có” — remove the finance/business-analysis framing and concentrate on the content a good marketing/product website should actually show. This does **not** mean omit a visitor-friendly explanation of customer benefits; it means avoid investment-model metrics, EBITDA/ARR/CAC/financial projections, TAM/SAM/SOM, and pricing claims without an approved basis.

## 2. What the attached screenshots actually demonstrate
### Screenshot on page 4: grouped website navigation
- SEA-BASED SOLUTIONS: Environmental Monitoring → Wireless Sensors, Cloud Communications; Cameras → Biomass Estimation, Underwater Video Streaming; Precision Aquaculture Platform → Farm Management Software, Cloud Communications.
- LAND-BASED SOLUTIONS: Design Services, Consulting.
- RESOURCES: Announcements, Insights Blog, Case Studies, Customer Knowledge Hub, Resource Library.
- A note mentions Fish Tracking.
### Screenshot on page 5
- SOLUTIONS and SERVICES as distinct top-level groups; examples include NexTrak System, Consulting and Fine-Scale Positioning.
### Screenshot on page 6
- News and Resources dropdown: Announcements, News Coverage, Case Studies, Insights Blog, Resource Library.
- About Us dropdown: Who We Are, Events, Careers.
- Other controls: Log In, Search, Contact Us.

These are **examples of information architecture**, NOT proof that AquaSense offers fish tracking, biomass estimation, cameras, positioning, consulting, customer accounts, or documented customer case studies. Do not copy their text/content or reuse protected images.

## 3. AquaSense candidate sitemap for editorial research
1. Home — hero, core problem, solution, benefits, how it works, product demonstration, CTA.
2. Solutions — Environmental Monitoring; Water Quality Parameters (DO, pH, ORP, salinity, temperature); Alerts and Monitoring Dashboard; Connectivity, if actually documented.
3. Services — Deployment / Setup / Maintenance / Consulting only if the project proposal actually commits to them; otherwise label as **proposed** or omit.
4. Resources — Guides, FAQ, Insights Blog, Industry News, Resource Library; create a content plan before creating empty pages.
5. Case Studies / Pilot — distinguish proposed pilots, third-party public cases, and documented AquaSense pilot outcomes; do not imply AquaSense deployments have occurred.
6. About Us — project purpose, development stage, team details that are approved for publication.
7. Contact — request demo / partnership / pilot; don't invent contact details.
8. Optional: product demo linked to existing simulator, explicitly labeled simulated.

## 4. Required research scope per competitor
Inspect, when accessible, the following official websites and relevant pages: RYNAN Smart Aquaculture (https://rynanaquaculture.com/), RYNAN Technologies Vietnam (https://rynantech.vn/), Innovasea environmental monitoring (https://www.innovasea.com/aquaculture/environmental-monitoring/), and AKVA group (https://www.akvagroup.com/). Add other relevant verified sites only if they add unique material.

For each site/page, capture:
- Company, country, exact URL, page title, access date, publication/update date if visible.
- Navigation hierarchy and **actual** menu labels, grouped by category.
- Page sections and their order (hero, solution, benefits, product features, explanation, resources, case studies, FAQ, CTA, etc.).
- For each section: its *purpose*, concise faithful paraphrase, type of content/evidence displayed, examples of CTAs, media type, and whether it is suitable for AquaSense.
- Relevant public numbers only if they directly support visitor-facing claims; preserve units, geography, dates, and context.
- Trust cues (named case study, independent validation, product documentation, certification) without transferring them to AquaSense.
- Content gaps, paywall/access errors, and uncertainty.

Respect website access rules and copyright. Do not bulk-copy full pages or protected images. Prefer public official pages; cite exact links.

## 5. Capture schema (one record per page or section)
Use Markdown or JSON with fields:
- `project`, `company`, `country`, `source_url`, `page_title`, `accessed_at`, `section_path`, `section_type`, `heading_paraphrase`, `visitor_goal`, `summary`, `content_elements`, `cta_type`, `media_type`, `numbers_with_units_and_year`, `source_claim_class`, `relevance_to_aquasense`, `feature_supported_by_project_docs`, `editorial_recommendation`, `verification_notes`.
Classes: `OFFICIAL_COMPANY_CLAIM`, `THIRD_PARTY_VERIFIED`, `PROJECT_PROPOSAL`, `UNVERIFIED`.

For screenshot-derived facts, cite the **uploaded document, page number**; for public website facts, cite a **working external URL**. Never present something merely seen in a competitor menu as an existing AquaSense feature.

## 6. Output files — documentation only
Store under the repository's documentation convention, preferably:
`documents/research/aquasense/WEBSITE_MENU_BENCHMARK.md`
`documents/research/aquasense/WEBSITE_SECTION_INVENTORY.md`
`documents/research/aquasense/RESOURCES_CONTENT_PLAN.md`
`documents/research/aquasense/WEBSITE_COPY_DRAFT.md`
`documents/research/aquasense/SOURCE_AND_CLAIM_REGISTER.md`

Each section in `WEBSITE_COPY_DRAFT.md` should contain: title, 1–3 paragraphs of publishable Vietnamese copy, proposed CTA, supporting links, and publication status (`READY`, `NEEDS_REVIEW`, `UNSUPPORTED`). Do not invent product outcomes, certifications, partnerships, service commitments or contact details. Identify `COMING_SOON` sections clearly rather than publishing fabricated articles.

## 7. Workflow
1. Read AGENTS.md and existing research docs; inspect attached/reference document when available.
2. Audit existing research to avoid duplicate work.
3. Browse company sites; extract menu structure and page sections; preserve exact URLs.
4. Build cross-company comparison: recurring sections vs optional sections.
5. Propose AquaSense sitemap with prioritized navigation and content per page.
6. Draft original Vietnamese copy based only on supported claims.
7. Produce a Resources content plan (at least 8 article ideas), each with target reader, guiding question, proposed outline, credible sources, and publication readiness.
8. Check links and verify claims; flag unresolved items.
9. Record this task in `DEVELOPMENT_LOG.md`, per AGENTS.md. Do not add inline source comments.
10. Report files written and incomplete research. Do NOT edit frontend code or push without user authorization.

## 8. Completion criteria
- Screenshots' menu groups are accurately captured and contextualized.
- 4+ competitor websites examined where accessible, with transparent coverage.
- Site sections grouped by visitor job, and each has evidence/source and a relevance judgment.
- Proposed AquaSense navigation, page descriptions, and Resources editorial pipeline created.
- All marketing copy is original and not misleading about current maturity.
- Research files created; no changes to simulator/dashboard.

## 9. Codex execution instruction
Execute this research now. Do not merely suggest tools or create a plan. If network/browser tools are unavailable, produce a clearly marked *source-limited* draft using existing documents and list the exact URLs still requiring inspection; do not fabricate website reviews.
