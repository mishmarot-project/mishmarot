# Methodology

This directory documents how Mishmarot ingests, normalizes, deduplicates, and verifies incident data.

## Documents (planned)

- `ingestion.md` — How each data source is fetched, parsed, and stored
- `normalization.md` — How source-native categories map to the canonical taxonomy
- `deduplication.md` — How cross-source duplicate detection works
- `verification.md` — How confidence tiers are assigned and maintained
- `privacy.md` — Geographic suppression, temporal delay, and PII handling
- `sanitization.md` — How hateful content is stripped from incident summaries

Each document will be completed as the corresponding feature is implemented.
