# Research environment and setup

Audit: 2026-10-27, repository branch `feat/firescout-uav-dashboard`, HEAD `798915b86f79810c667fc661667aa1727f7a4e5a`. The working tree was already substantially dirty. Existing repository AGENTS.md and resource rules were read. No dashboard, package manifest, credential, permission setting or global configuration was changed.

## Available stack

| Capability | Audit result |
| --- | --- |
| Discovery and extraction | Session web search/open tested against official company pages; no separate API key requested |
| Browser | Existing Playwright MCP navigation and DOM evaluation passed on Innovasea and AKVA; Chrome present |
| Structured export | New repository `scripts/research_dataset.py`; Python standard library only; no pip/npm install |
| Global configured MCP names | `gemini-notebook-mcp`, `openaiDeveloperDocs`, `playwright`, `github`; configured does not imply operational. Only Playwright tested for this task |
| Exposed connected tool families | Playwright and Codex Apps connectors, including Plugin Management, Google services, Sites and Pets; unrelated accounts were not queried |
| System skills on disk | imagegen, openai-docs, skill-creator, skill-installer, review-agent. Presence on disk does not mean enabled for this turn |
| Session plugin skills | Google Drive/Docs/Sheets/Slides/comments, Plugin Management, Sites/remix, Work Pets create/read/update, as advertised by the environment |
| Project skills | No SKILL.md found under repository `.agents` or `.codex`; no competitor research skill installed |
| Existing dependencies | Node v22.22.1, npm, Python 3.14.4 and Chrome available; Python Playwright, Crawl4AI, BeautifulSoup and jsonschema absent from active interpreter. The existing browser MCP operates independently of Python Playwright |

Safe TOML inspection printed server names, key names and executable names only. Environment inspection checked credential-variable names without reading values. No named Firecrawl/DataForSEO/Ahrefs/Semrush credential variable was found; this does not prove there are no credentials in other stores. Existing configured GitHub environment credentials were not printed or tested. Never dump configuration or `.env` files for troubleshooting.

## Network and authorization

- Built-in web search/open and external Playwright navigation work. Availability is channel-specific.
- Python HTTPS to Innovasea robots.txt failed with sandbox DNS resolution error. The required approved escalation retry reached HTTP 403; no alternate identity/proxy/access-control workaround attempted.
- Browser had third-party console warnings/errors but returned company titles and DOM content. No forms submitted, files uploaded, marketing emails sent, logins performed, CAPTCHA handled or paid calls made.
- Existing tools may be subject to host account/plan quotas; they are not represented as an unlimited free service. Python validation has no external service cost.
- Firecrawl and Ahrefs directory entries exist but are not installed/connected. Paid APIs, new accounts requiring consent, broad permissions and global Codex configuration changes remain approval-gated under the user's task instructions.

## Run locally

From repository root:

```bash
python3 scripts/research_dataset.py documents/research/*/2026-10-27_sources.json
python3 scripts/research_dataset.py --export documents/research/*/2026-10-27_sources.json
```

The first command validates; the second also regenerates adjacent source-register Markdown. Neither performs network requests. Running `--export` replaces generated registers, not authored reports. For a new research run use `YYYY-MM-DD_sources.json` and the actual access date. Read [the contract](DATASET_CONTRACT.md) and [workflow](RESEARCH_WORKFLOW.md) first.

In Codex, ask to follow the workflow using available web search/open and the existing Playwright MCP. If either tool is absent, confirm the available session tools first; do not silently assume globally configured servers are exposed. A standard browser and manually entered records provide the fallback. No standalone unattended discovery/crawler CLI was installed. See [comparison](TOOL_COMPARISON.md) before considering an additional crawler.
