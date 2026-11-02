# Research dataset contract

Version 1; 2026-10-27. Each project has a dated JSON array and generated Markdown register. One record per exact source page per project; `id` is globally unique. A source reused in two reports is referenced by ID, not entered twice. Keep meaningful query parameters and the actual final page URL; omit tracking parameters when doing so preserves content. Cross-project reuse should refer to a canonical shared source in future runs rather than duplicating full reports.

| Fields | Representation and meaning |
| --- | --- |
| `id`, `project` | Stable ID; project is aquasense, factsafe or firescout |
| `company_name`, `country`, `industry` | Publisher/company name (public agencies allowed); country is null unless established, with office versus domicile scope stated |
| `official_website_url`, `source_page_url` | Credential-free HTTPS origin/site and exact inspected page; third-party publishers use their own official site |
| `page_title`, `page_category` | Observed title and homepage/solution/product/specification/pricing/case_study/category/industry_report role |
| `date_accessed`, `publication_date` | ISO calendar dates. Access date is actual session date; publication date null when absent. Copyright year is not publication date |
| `product_or_solution`, `target_customers`, `value_proposition` | Product text, buyer array and concise proposition. Buyer role normalization is analyst interpretation unless attributed |
| `website_sections`, `marketing_claims`, `calls_to_action` | Arrays; observed sections, paraphrased claims and brief CTA labels; hidden cookie/carousel duplication excluded |
| `pricing_or_business_model` | Public business terms or null. Null means not collected/established, not necessarily undisclosed everywhere |
| `quantitative_figures` | Array of fully scoped claim objects, described below; empty means no admitted figure |
| `original_source_context` | Section, customer, baseline or attribution chain needed to interpret the source |
| `evidence_classification`, `confidence_level` | Enum labels below; confidence concerns support/provenance, not proof of vendor effectiveness |
| `notes_and_limitations` | Array; missing data, restricted access, inference limits and follow-ups |
| `access_status`, `extraction_method` | READABLE, PARTIAL or SEARCH_ONLY; tool/channel actually used |

Every quantitative object requires `claim`, `value`, `unit`, `currency`, `time_period`, `scope`, `source_context`, `evidence_classification`, `confidence_level`, `limitations`. All are nonempty strings except currency, which may be null. Values retain qualifiers such as “up to”, “nearly”, ranges or inequalities. Explicitly say when a baseline, test method or reference year is unavailable. The parent URL is the exact source for each figure. Publication date and measurement period are distinct. No silent unit conversions, currency conversions or market-size calculations.

Evidence labels:

- `VERIFIED_OFFICIAL_SOURCE`: inspected authoritative primary publication supports the statement; does not mean independently audited or universally current.
- `COMPANY_CLAIM`: company specification, testimonial, benefit or commercial assertion, including vendor-hosted customer stories. Official hosting alone does not make an effectiveness claim independently verified.
- `THIRD_PARTY_REPORT`: publisher reports another party's estimate; preserve the attribution chain.
- `PROJECT_ASSUMPTION`: proposed persona, hypothesis or project positioning requiring validation; never imply it is a competitor fact.
- `UNVERIFIED`: snippets or claims lacking direct inspection. SEARCH_ONLY records must use this label and do not count toward accessible-site minimums.

Confidence: HIGH = direct, unambiguous source support; MEDIUM = identifiable company statement or incomplete methodology; LOW = indirect, inaccessible or ambiguous. Reports explicitly mark recommendations as PROJECT_ASSUMPTION. Empty arrays and nulls preserve missing data; do not manufacture estimates to fill the schema.

`scripts/research_dataset.py` enforces this field contract, types, classifications, HTTPS syntax, dates, duplicate IDs and page URLs, and figure provenance fields. It is a purpose-built validator, not a general JSON Schema engine. It does not verify URL availability, robots rules, factual truth, correct arithmetic, content licensing or figure accuracy; those require documented source inspection. There are no derived financial calculations in this pilot.
