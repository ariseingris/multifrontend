# Website menu benchmark and proposed AquaSense architecture

Research date: 2026-10-28. Sources and claim decisions: [register](SOURCE_AND_CLAIM_REGISTER.md). Actual page content: [inventory](WEBSITE_SECTION_INVENTORY.md). Observed link groups below are not automatically verified desktop dropdowns. No React changes are part of this research.

## Marketing feedback and reference screenshots

The canonical [brief, §§1–2](AQUASENSE_CODEX_WEBSITE_CONTENT_RESEARCH.md) transcribes the supplied `01_AQUASENSE_MARKETING_TAI_CHINH.md.docx`:

- p.3: prioritize useful website content; remove finance/business-analysis framing. Visitor benefits remain appropriate when qualified.
- p.4: SEA-BASED SOLUTIONS → Environmental Monitoring → Wireless Sensors / Cloud Communications; Cameras → Biomass Estimation / Underwater Video Streaming; Precision Aquaculture Platform → Farm Management Software / Cloud Communications. LAND-BASED SOLUTIONS → Design Services / Consulting. RESOURCES → Announcements / Insights Blog / Case Studies / Customer Knowledge Hub / Resource Library. Fish Tracking is also mentioned.
- p.5: SOLUTIONS and SERVICES are distinct groups, with NexTrak System, Consulting and Fine-Scale Positioning as examples.
- p.6: News and Resources → Announcements / News Coverage / Case Studies / Insights Blog / Resource Library. About Us → Who We Are / Events / Careers. Utility controls: Log In / Search / Contact Us.

These are reference-document observations transcribed by the brief. The original document was not available for independent visual verification. They demonstrate grouping, not AquaSense capabilities. Tracking, cameras, biomass, consulting and accounts remain Q06–Q07 unsupported.

## Observed navigation and contents

| Website / exact source | Observed labels and grouping | What the destination contains | Relevance and AquaSense support |
| --- | --- | --- | --- |
| [RYNAN Aquaculture](https://rynanaquaculture.com/) R01–R05 | Footer Navigate: Home, TOMGOXY, Our Products, About Us, Sustainability, Blog, Contact Us, Career Opportunities, Privacy; RYNAN Businesses cross-links | TOMGOXY explains integrated pond operation with FAQ/gallery; Blog has explainers/events; About names team; Contact routes enquiry intent | Useful separation of solution, learning and enquiry. Q01–Q03 demo only; engineering, recruitment and corporate ecosystem not supported |
| [RYNAN Vietnam](https://rynantech.vn/) V01–V04 | Trang Chủ, Giới Thiệu, Dịch Vụ, Giải Pháp, Thiên Địch, Thủy Sản, Sản Phẩm, Tin Tức, Liên Hệ; footer FAQ/privacy/terms | Data/cloud services; aquaculture equipment; news cards; direct contact and form | Vietnamese labels are useful. Broad cross-industry catalogue is unnecessary; services Q07 and contacts Q11 await evidence |
| [Innovasea](https://www.innovasea.com/) I01–I06 | Aquaculture and Fish Tracking; footer Announcements, Case Studies, News Coverage, Resource Library, Insights Blog; About Us, Events, Company News, Careers; Log In → Fathom/Realfish Pro; search/contact | Monitoring explains sensor-to-dashboard flow; resources filter content types; cases name customers; About explains mission/team | Adopt task and content-type grouping; only simulated dashboard/alerts supported. Fish tracking/accounts and institutional claims unsupported |
| [AKVA group](https://www.akvagroup.com/) A01–A07 | Visible homepage Show news, Show blog, Log in. Sea based page: Products, Deep farming & lice control, Precision feeding. Media: Document archive, Media archive, Webinars. Service & support - Land Based and Our offices confirmed as page headings | Sector overview, support contacts/agreements/FAQ, technical and media library, authored biology article, company values | Use clear support responsibilities only after approval. Full top-menu hierarchy unavailable in extracted text; do not present these headings as a verified dropdown. AquaSense hardware/service breadth unsupported |

RYNAN's two domains are four-site coverage but only one company group. Each entry above links an inspected source; detailed records distinguish observed text from proposed architecture.

## Recurring versus optional patterns

Recurring across inspected sites: explain the offering, provide updates/learning material, establish identity, offer a contact route. Named evidence is especially clear in R02 and I04. Services deserve a separate page only when scope and delivery responsibility exist (V02/A03). Login, careers, webinars, press assets, geographic directories and sea/land segmentation depend on organizational scale; they are optional, not AquaSense launch requirements. A large mega-menu would overstate current content depth.

## Proposed AquaSense sitemap

All paths below are proposed destinations, not implemented routes. P0 is initial content priority; P1 follows content review; P2 is evidence-gated. Collapse short pages into anchors until enough approved material exists.

| Priority / navigation | Proposed path and children | Content and visitor task | Evidence / release gate |
| --- | --- | --- | --- |
| P0 Trang chủ | `/` | Hero with prototype label → problem → five metrics → workflow → simulated demo → limitations → contact invitation | Q01–Q03/Q10; copy D01–D04 |
| P0 Giải pháp | `/giai-phap` → Giám sát môi trường; Thông số nước; Bảng điều khiển và cảnh báo | Explain each metric, units, synthetic input and how to read change over time | Q01–Q03; no hardware/connectivity claims; D05–D07 |
| P0 Xem demo | Existing demonstration destination to be verified during handoff | Explain normal cycle, dawn oxygen and fouling; simulated-data notice before entering | Q03; D08; existing local launch instructions in P04, no invented public demo URL |
| P0 Tài nguyên | `/tai-nguyen` → Hướng dẫn demo; Câu hỏi thường gặp | Start with useful finished content, add explainers when reviewed | Q12; plan RCP01–RCP08; D09–D10 |
| P0 Về AquaSense | `/ve-aquasense` | Purpose, prototype maturity, evidence boundaries | Q10; D15; biographies await approval |
| P0 Liên hệ | `/lien-he` | Demo enquiry / research collaboration / pilot discussion; fields: name, return channel, purpose, optional context | Q11; D16; cannot launch working CTA without channel, owner and privacy review |
| P1 Tin tức within Tài nguyên | `/tai-nguyen/tin-tuc` | Dated development notes; industry links clearly attributed | Q12; D11; keep hidden until a substantive post exists |
| P1 Thư viện within Tài nguyên | `/tai-nguyen/thu-vien` | Reviewed demo guide and glossary; file version/date/format | Q12; D12; no empty download buttons |
| P2 Dịch vụ | `/dich-vu` | Proposed scoping, setup, training and maintenance responsibilities | Q07; D13; omit from launch until authorized scope exists |
| P2 Thử nghiệm / Case Studies | `/thu-nghiem` | Future pilot method, results and limitations; separately tagged external examples | Q08; D14; never imply completed AquaSense pilot |

No Search until the library merits it; no Log In, Careers, cameras, biomass, positioning or cloud-communications menu at launch. Do not split “sea-based/land-based” for a pond-monitoring demonstrator. Footer should eventually contain verified contact, privacy and terms; legal text and organization identity require review.

## Editorial handoff

Primary route: understand prototype → inspect simulated workflow → read limitations → request a conversation. Each page needs an owner, review date, evidence IDs and real destination for every CTA. Use original Vietnamese wording in [copy draft](WEBSITE_COPY_DRAFT.md), not translations of vendor slogans. No financial analysis, fabricated projects or unapproved product specifications are required.
