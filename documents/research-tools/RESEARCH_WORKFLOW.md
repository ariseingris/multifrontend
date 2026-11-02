# Public competitor intelligence workflow

Use [setup](SETUP_GUIDE.md), [tool decisions](TOOL_COMPARISON.md), [dataset contract](DATASET_CONTRACT.md) and [pilot coverage](../research/shared/2026-10-27_coverage.md). Scope is business websites and customer evidence; do not modify existing dashboards.

1. Read AGENTS.md and inspect Git status. Preserve unrelated edits. Record run date, tools and limits. Define buyer geography, sector and business question before expanding the pilot.
2. Discover with existing web search: `company official water quality monitoring`, `company industrial gas detection case study`, or `company firefighting UAV thermal rescue`. Use official-domain searches for pricing, specifications and customer stories. Treat search snippets as leads.
3. Inspect the exact official page with web open. Confirm domain, title, page category and relevant text; follow citations to their original publisher. A working search result is not proof that its page remains accessible. Record failures instead of bypassing them.
4. Before automated extraction batches, inspect robots.txt and relevant terms, choose an identifiable user agent and obey restrictions, delays and site-specific limits. If permission cannot be established, stop batch extraction. This pilot used bounded page-by-page inspection, not recursive crawling; robots checks were incomplete and do not authorize future crawls. Do not retry 403/429/CAPTCHA with proxies or stealth settings. Do not access login-only documents or submit forms.
5. When text is incomplete, use existing Playwright navigation and a read-only DOM evaluation. Extract page URL/title, visible h1–h3, and visible links/buttons with CTA text and destination. Exclude cookie overlays, hidden carousel clones and navigation duplicates. Compare with page body context. Do not collect entire copyrighted sites or competitor assets. A useful read-only expression is below; review site-specific scope before use.

```javascript
() => {
  const visible = element => element.getClientRects().length > 0;
  const unique = values => [...new Set(values)];
  return {
    url: location.href,
    title: document.title,
    headings: unique([...document.querySelectorAll('main h1,main h2,main h3')]
      .filter(visible).map(element => element.textContent.trim()).filter(Boolean)),
    callsToAction: [...document.querySelectorAll('main a,main button')]
      .filter(visible).map(element => ({text: element.textContent.trim(), url: element.href || null}))
      .filter(item => /contact|demo|quote|learn|buy|download/i.test(item.text))
  };
}
```

Some sites have no `main`; inspect their structure before adjusting selectors. Do not interpret a blank extraction as proof a section is absent. The pilot used broader heading selectors on two sites and manually excluded cookie/carousel noise; the expression above is a reusable starting point, not a universally tested extractor.

6. Normalize into `documents/research/<project>/YYYY-MM-DD_sources.json` using the contract. Keep short excerpts only when needed; otherwise paraphrase. Record numerical qualifiers, units, currency, period, geography, product model, baseline and test conditions. Use null or an explicit unavailable note for missing fields. Do not promote company claims to independent verification.
7. Validate and export using `python3 scripts/research_dataset.py --export documents/research/*/YYYY-MM-DD_sources.json` with the actual date substituted. Review generated registers. Validator success proves structure, not facts.
8. Write `<PROJECT>_MARKETING.md` and `<PROJECT>_EVIDENCE.md`. Cite source IDs linking to the dated register and direct official URLs. Separate observations from PROJECT_ASSUMPTION recommendations. Compare buyer problems, benefits, trust, CTA strategies and proof rather than copying competitor wording or layout.
9. Verify at least two directly readable official company sites per project. Reopen numerical sources and check surrounding qualifiers. Record source access separately from claim verification. Recheck source/pricing before publishing; dated research is a snapshot, not an automated monitor.
10. Review actual diffs, validate local links and dataset records, append DEVELOPMENT_LOG.md. Update docs/BUGBOOK.md only for a confirmed implementation bug. Do not commit or push without explicit authorization.

Optional next pass: use public official annual reports for financials, government/industry sources for market context and actual customer interviews for local buyer priorities. Keyword ideas from page language may be recorded as hypotheses, never fabricated search-volume metrics. Add a paid SEO provider only after a specific data gap, budget, retention terms and user approval are established.
