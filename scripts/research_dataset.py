import argparse
import datetime
import json
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit


CLASSIFICATIONS = {
    "VERIFIED_OFFICIAL_SOURCE", "COMPANY_CLAIM", "THIRD_PARTY_REPORT",
    "PROJECT_ASSUMPTION", "UNVERIFIED",
}
TEXT_FIELDS = {
    "id", "project", "company_name", "industry", "official_website_url",
    "source_page_url", "page_title", "page_category", "date_accessed",
    "product_or_solution", "value_proposition", "original_source_context",
    "evidence_classification", "confidence_level", "access_status", "extraction_method",
}
LIST_FIELDS = {"target_customers", "website_sections", "marketing_claims", "calls_to_action", "quantitative_figures", "notes_and_limitations"}
NULLABLE_FIELDS = {"country", "publication_date", "pricing_or_business_model"}
FIGURE_FIELDS = {"claim", "value", "unit", "currency", "time_period", "scope", "source_context", "evidence_classification", "confidence_level", "limitations"}


def canonical_url(value):
    parts = urlsplit(value)
    if parts.scheme != "https" or not parts.hostname or parts.username or parts.password:
        raise ValueError("Expected credential-free HTTPS URL")
    return urlunsplit((parts.scheme, parts.netloc.lower(), parts.path.rstrip("/"), parts.query, ""))


def validate(records):
    if not isinstance(records, list) or not records:
        raise ValueError("Dataset must be a nonempty array")
    identifiers, urls = set(), set()
    for record in records:
        identifier = record.get("id", "unknown")
        if set(record) != TEXT_FIELDS | LIST_FIELDS | NULLABLE_FIELDS:
            raise ValueError(f"{identifier}: missing or unexpected fields")
        if any(not isinstance(record[field], str) or not record[field].strip() for field in TEXT_FIELDS):
            raise ValueError(f"{identifier}: text fields must be nonempty strings")
        if any(not isinstance(record[field], list) for field in LIST_FIELDS):
            raise ValueError(f"{identifier}: expected arrays")
        if any(record[field] is not None and (not isinstance(record[field], str) or not record[field].strip()) for field in NULLABLE_FIELDS):
            raise ValueError(f"{identifier}: expected null or nonempty text")
        for field in LIST_FIELDS - {"quantitative_figures"}:
            if any(not isinstance(item, str) or not item.strip() for item in record[field]):
                raise ValueError(f"{identifier}: {field} must contain nonempty strings")
        if record["project"] not in {"aquasense", "factsafe", "firescout"}:
            raise ValueError(f"{identifier}: unsupported project")
        if record["evidence_classification"] not in CLASSIFICATIONS:
            raise ValueError(f"{identifier}: unsupported classification")
        if record["confidence_level"] not in {"HIGH", "MEDIUM", "LOW"}:
            raise ValueError(f"{identifier}: unsupported confidence")
        if record["access_status"] not in {"READABLE", "PARTIAL", "SEARCH_ONLY"}:
            raise ValueError(f"{identifier}: unsupported access status")
        if record["access_status"] == "SEARCH_ONLY" and record["evidence_classification"] != "UNVERIFIED":
            raise ValueError(f"{identifier}: search-only evidence must remain unverified")
        datetime.date.fromisoformat(record["date_accessed"])
        if record["publication_date"] is not None:
            datetime.date.fromisoformat(record["publication_date"])
        canonical_url(record["official_website_url"])
        url_key = (record["project"], canonical_url(record["source_page_url"]))
        if record["id"] in identifiers or url_key in urls:
            raise ValueError(f"{identifier}: duplicate ID or project URL")
        identifiers.add(record["id"])
        urls.add(url_key)
        for figure in record["quantitative_figures"]:
            if set(figure) != FIGURE_FIELDS:
                raise ValueError(f"{identifier}: incomplete figure provenance")
            for field in FIGURE_FIELDS - {"currency"}:
                if not isinstance(figure[field], str) or not figure[field].strip():
                    raise ValueError(f"{identifier}: figure {field} must be nonempty text")
            if figure["currency"] is not None and (not isinstance(figure["currency"], str) or not figure["currency"].strip()):
                raise ValueError(f"{identifier}: invalid currency")
            if figure["evidence_classification"] not in CLASSIFICATIONS or figure["confidence_level"] not in {"HIGH", "MEDIUM", "LOW"}:
                raise ValueError(f"{identifier}: invalid figure evidence labels")
    return records


def markdown(records):
    lines = ["# Source register", "", "Generated from the adjacent JSON dataset. Source facts and vendor claims retain their labels. Buyer personas are analyst interpretations unless explicitly attributed. Null means unavailable or not established in this pilot.", ""]
    for record in records:
        lines.extend([f"## {record['id']}", ""])
        for key, value in record.items():
            if isinstance(value, list):
                lines.append(f"**{key}:**")
                lines.append("")
                for item in value:
                    lines.append("- " + (json.dumps(item, ensure_ascii=False) if isinstance(item, dict) else item))
                if not value:
                    lines.append("Unavailable / none recorded.")
                lines.append("")
            else:
                rendered = "Unavailable / not established" if value is None else value
                if key.endswith("_url"):
                    rendered = f"[{value}]({value})"
                lines.extend([f"**{key}:** {rendered}", ""])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("datasets", nargs="+", type=Path)
    parser.add_argument("--export", action="store_true")
    arguments = parser.parse_args()
    all_records = []
    for path in arguments.datasets:
        records = validate(json.loads(path.read_text()))
        all_records.extend(records)
        if arguments.export:
            path.with_suffix(".md").write_text(markdown(records), encoding="utf-8")
        print(f"PASS {path}: {len(records)} records")
    validate(all_records)
    print(f"PASS combined dataset: {len(all_records)} unique records")


if __name__ == "__main__":
    main()
