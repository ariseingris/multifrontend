# Source and claim register — AquaSense website content

Access date: 2026-10-28 (Asia/Bangkok). Research concerns website content and information architecture; no financial analysis. Public company claims are not independent validation. No customer outreach or form submission was performed.

## Evidence policy

`YES_DEMO` means supported only as a synthetic software demonstration. `PARTIAL` requires explicit scope qualification. `PROPOSED` is an editorial recommendation, not an available product. `NO` means not supported by the repository material inspected, not proof that a capability can never exist. READY means evidence-safe draft wording, not approval to publish or a tested website feature. NEEDS_REVIEW requires editorial/product confirmation; UNSUPPORTED must not publish as a current capability. COMING_SOON is a planning label, never a fabricated article.

## Local sources and reference limitations

- P01: [Research brief](AQUASENSE_CODEX_WEBSITE_CONTENT_RESEARCH.md), §§1–2. The requested root file was not present; this canonical document was read. It transcribes feedback from `01_AQUASENSE_MARKETING_TAI_CHINH.md.docx`, p.3 and navigation screenshots pp.4–6. No original DOCX/PDF was found by repository file search, and no original attachment was accessible in this session. Screenshot details below are second-hand transcription, not independent image inspection.
- P02: [Project fact sheet](PROJECT_FACT_SHEET.md); [existing claim registry](CLAIM_REGISTRY.md). Prior research dated 2026-10-27 was reviewed, retained and not treated as fresh web inspection.
- P03: [Current config](../../../frontend/src/projects/aquasense/config.ts): five metrics, three scenarios, `aiEngine: false`; inspected read-only.
- P04: [Continuous simulation report](../../development/AQUASENSE_CONTINUOUS_SIMULATION.md), Model and lifecycle / Telemetry: synthetic inputs, no validated diagnosis, in-memory histories and simulated intervention. Historical test results were not rerun or claimed as current validation.
- P05: [Scenario specification](../../specifications/MULTIFRONTEND_SCENARIOS_CODEX_SPEC.md) and [master plan](../../specifications/DEMO_FRONTEND_MASTER_PLAN.md) are design context; proposed hardware/AI is not deployment evidence.

## Public source ledger

All entries below were opened with the web research tool on the access date. Titles are returned page titles or visible headings. Publication/update date is not visible unless noted. Country identifies company context, not AquaSense service coverage. Extracted text establishes content order, not visual layout or complete dropdown behavior. I06 was reopened to verify the contact form text; submission behavior was not tested.

| ID | Company / country | Exact source and title | Visible date / access note |
| --- | --- | --- | --- |
| R01 | RYNAN Smart Aquaculture / Vietnam / Singapore | [Smart Shrimp Farming Technology](https://rynanaquaculture.com/) | No publication/update date visible. |
| R02 | RYNAN Smart Aquaculture / Vietnam / Singapore | [TOMGOXY Intensive Shrimp Farm](https://rynanaquaculture.com/tomgoxy) | No publication/update date visible. |
| R03 | RYNAN Smart Aquaculture / Vietnam / Singapore | [RYNAN Aquaculture Blog](https://rynanaquaculture.com/blog) | Index contains dated posts, including 2026-09-15; articles not all opened. |
| R04 | RYNAN Smart Aquaculture / Vietnam / Singapore | [Learn More About Us](https://rynanaquaculture.com/about) | No publication/update date visible. |
| R05 | RYNAN Smart Aquaculture / Vietnam / Singapore | [Contact Us](https://rynanaquaculture.com/contact-us) | No publication/update date visible. |
| V01 | RYNAN Technologies Vietnam / Vietnam | [Trang Chủ](https://rynantech.vn/) | News card dated 2026-10-13; not a homepage update date. |
| V02 | RYNAN Technologies Vietnam / Vietnam | [Dịch Vụ](https://rynantech.vn/dich-vu/) | No publication/update date visible. |
| V03 | RYNAN Technologies Vietnam / Vietnam | [Thủy sản](https://rynantech.vn/thuy-san/) | No publication/update date visible. |
| V04 | RYNAN Technologies Vietnam / Vietnam | [Liên Hệ](https://rynantech.vn/lien-he/) | No publication/update date visible. |
| I01 | Innovasea / United States / international | [Sustainable Aquaculture Technology](https://www.innovasea.com/) | No publication/update date visible. |
| I02 | Innovasea / United States / international | [Real-Time Environmental Monitoring Solutions](https://www.innovasea.com/aquaculture/environmental-monitoring/) | No publication/update date visible. |
| I03 | Innovasea / United States / international | [Sustainable Aquaculture & Fish Tracking Resources](https://www.innovasea.com/resources/) | Announcement card 2026-09-22; runtime deprecation text also exposed. |
| I04 | Innovasea / United States / international | [Aquaculture & Fish Tracking Case Studies](https://www.innovasea.com/case-studies/) | No publication/update date visible. |
| I05 | Innovasea / United States / international | [Sustainable Aquaculture & Fish Tracking](https://www.innovasea.com/about/) | No publication/update date visible. |
| I06 | Innovasea / United States / international | [Aquaculture & Fish Tracking Solutions / Contact Us](https://www.innovasea.com/contact/) | Form text inspected; JavaScript required; not submitted. |
| A01 | AKVA group / Norway | [AKVA group - Home](https://www.akvagroup.com/) | News cards include 2026-10-19 and 2026-10-14; JS-limited navigation. |
| A02 | AKVA group / Norway | [Sea based](https://www.akvagroup.com/sea-based/) | No publication/update date visible. |
| A03 | AKVA group / Norway | [Service & support - Land Based](https://www.akvagroup.com/service-support/land-based/) | No publication/update date visible. |
| A04 | AKVA group / Norway | [Media](https://www.akvagroup.com/media/) | No publication/update date visible. |
| A05 | AKVA group / Norway | [The importance of biofilters](https://www.akvagroup.com/blog/the-importance-of-biofilters) | No publication date visible; named author. |
| A06 | AKVA group / Norway | [About us](https://www.akvagroup.com/about-us/) | No publication/update date visible. |
| A07 | AKVA group / Norway | [Our offices](https://www.akvagroup.com/contact/our-offices/) | No publication/update date visible. |

Four requested websites were examined, representing three company groups: the two RYNAN domains are related, not independent competitors. No additional company was needed to fill the main content categories. AKVA's full dropdown and dedicated case-study coverage remain incomplete because the text extraction omits the full navigation; accessible pages were followed directly. Gated manuals were not accessed. Innovasea external coverage links were observed, not independently verified. No claims are classified THIRD_PARTY_VERIFIED in this new research.

## AquaSense claim decisions

| ID | Proposed feature or claim | Support / classification | Permitted wording and publication decision | Evidence / next proof needed |
| --- | --- | --- | --- | --- |
| Q01 | Five water parameters | YES_DEMO / PROJECT_PROPOSAL with current demo artifact | READY: demo mô phỏng DO (mg/L), pH, ORP (mV), độ mặn (ppt), nhiệt độ (°C) | P03–P04; real sensor models and calibration absent |
| Q02 | Timeline, dashboard, alerts | YES_DEMO / PROJECT_PROPOSAL with current demo artifact | READY when qualified as simulated | P03–P04; field latency/reliability not measured |
| Q03 | Normal, dawn oxygen drop, probe fouling | YES_DEMO / PROJECT_PROPOSAL with current demo artifact | READY: three demonstration scenarios | P03–P04; not customer incidents |
| Q04 | Detect/diagnose probe failure in real ponds | NO / UNVERIFIED | UNSUPPORTED; only simulated fouling scenario | P04; requires field reference measurements |
| Q05 | Physical sensors, LoRa/4G, cloud/offline, SMS/Zalo | NO / UNVERIFIED | UNSUPPORTED as available features | Need hardware/network/channel specifications and integration validation |
| Q06 | Automatic aerator actuation, camera, biomass, tracking | NO / UNVERIFIED | UNSUPPORTED; do not copy competitor menus | P01/P04; physical integration absent |
| Q07 | Deployment, consulting, maintenance, training, SLA | NO / UNVERIFIED | NEEDS_REVIEW as proposed scope; UNSUPPORTED as current service | Need approved service scope, owners and delivery terms |
| Q08 | Successful pilot, customer quotes, partnerships | NO / UNVERIFIED | UNSUPPORTED; publish third-party examples only with attribution | Need pilot records, consent, methods and limitations |
| Q09 | AI prediction accuracy, certification, yield/energy guarantees | NO / UNVERIFIED | UNSUPPORTED | P03 aiEngine false; independent tests/certificates absent |
| Q10 | Purpose and software demonstrator stage | YES_DEMO / PROJECT_PROPOSAL with current demo artifact | READY: nguyên mẫu trình diễn theo dõi môi trường ao nuôi | P02–P04 |
| Q11 | Contact form, email, phone, response time | PROPOSED / UNVERIFIED | NEEDS_REVIEW; no live contact CTA until verified | Need owner, working channel, privacy/consent text and submission check |
| Q12 | Guides, news, library, case-study area | PROPOSED / PROJECT_PROPOSAL | Draft labels only; COMING_SOON until content exists | This research proposes IA; does not implement pages |

No competitor numerical performance claims are reproduced as AquaSense evidence. We deliberately omit vendor outcome percentages because they add no necessary support to the proposed website copy. Demo thresholds are configuration choices, not universal safe husbandry limits. No new clinical/chemical treatment, dosage or operational prescription is offered.

## Follow-up evidence requests

Obtain the original marketing reference to visually verify pp.3–6; approve project identity/team and real contact channel; confirm service responsibilities and hardware scope; obtain consented pilot evidence before case studies. Recheck menus in a rendered browser before a frontend handoff. No financial-model follow-up is required by this brief.
