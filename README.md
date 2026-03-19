# Mishmarot

**Global Antisemitism Situational Awareness Dashboard**

Provide timely, verified, multi-source situational awareness of antisemitic incidents worldwide through an open-source platform, empowering those who protect Jewish communities to make informed decisions and those who study antisemitism to do so with better data.

> **מִשְׁמָרוֹת** (mishmarot) — the 24 priestly watches that maintained continuous guard over the Temple through rotating communal responsibility.

---

## Status

🚧 **Early development** — the project is in the scaffolding phase. Core infrastructure is being built. Data sources are not yet live.

## Architecture

Mishmarot is a monorepo containing a web dashboard, data ingestion workers, and shared
libraries. Production runs on a Kubernetes cluster behind a CDN with DDoS protection and
TLS termination. The database is PostgreSQL with PostGIS for spatial queries. See the
Quick Start section for running locally.

## Data Sources (MVP)

| Source | Coverage | Update Frequency | API | License |
|--------|----------|-----------------|-----|---------|
| GDELT Project | Global | Every 15 min | REST (open) | Open access |
| FBI Crime Data | United States | Annual | REST (API key) | CC0 Public Domain |
| OSCE/ODIHR | 57 OSCE states | Annual | Web export | Open access |
| ADL H.E.A.T. Map | United States | Monthly | No formal API | Partnership recommended |

## Project Structure

```
mishmarot/
├── apps/web/              # Next.js 16 dashboard (App Router)
├── packages/
│   ├── db/                # Drizzle ORM schema + migrations
│   ├── ingestion/         # BullMQ worker base + source implementations
│   ├── privacy/           # Geographic suppression, temporal delay, access tiers
│   └── shared/            # Types, constants, taxonomy definitions
├── workers/               # Worker entry point and Dockerfile
├── docs/
│   ├── taxonomy/          # Classification system specification
│   └── methodology/       # Ingestion, normalization, and verification docs
└── docker-compose.yml     # Local development stack
```

## Quick Start

```bash
# Clone
git clone https://github.com/mishmarot-project/mishmarot.git
cd mishmarot

# Start local infrastructure (PostgreSQL + PostGIS, Redis)
docker compose up -d

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run the development server
npm run dev

# In a separate terminal, run workers
npm run workers:dev
```

## Classification System

Mishmarot uses a three-dimensional taxonomy aligned with major monitoring organizations:

- **Dimension 1: Severity** — what happened (extreme violence → harassment/speech)
- **Dimension 2: Manifestation** — ideological content (modern, othering, post-Shoah, Israel-related, religious)
- **Dimension 3: Explicitness** — how overt the antisemitism is (explicit → coded → ambiguous)

The taxonomy maps to ADL (US), CST (UK), RIAS/ENMA (Germany/EU), and Decoding Antisemitism (academic) classification systems. See [docs/taxonomy/](docs/taxonomy/) for the full specification.

## Definition Framework

Mishmarot adopts the **IHRA Working Definition of Antisemitism** as its primary classification framework, consistent with the organizations whose data we aggregate. The platform preserves source-native classifications and supports definition-transparent querying for researchers using alternative frameworks.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[Apache License 2.0](LICENSE)

## Links

- **Website**: [mishmarot.org](https://mishmarot.org)
- **About**: [docs/ABOUT.md](docs/ABOUT.md)
- **Governance**: [GOVERNANCE.md](GOVERNANCE.md)
- **Security**: [SECURITY.md](SECURITY.md)
