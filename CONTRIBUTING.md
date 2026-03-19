# Contributing to Mishmarot

Thank you for your interest in contributing to Mishmarot. This project monitors antisemitism globally to empower those who protect Jewish communities. Contributions that advance that mission are welcome.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/mishmarot.git`
3. Install dependencies: `npm install`
4. Start local infrastructure: `docker compose up -d`
5. Copy environment: `cp .env.example .env`
6. Run the dev server: `npm run dev`

## Development Workflow

- Create a feature branch from `main`
- Write code and tests
- Ensure `npm run lint` and `npm run build` pass
- Submit a pull request with a clear description

## Areas Where Help Is Needed

- **Source ingestion workers**: Implementing parsers for FBI, OSCE, ADL, and future data sources
- **Map visualization**: deck.gl layer implementations for the globe view
- **Taxonomy refinement**: Reviewing and improving the incident classification system
- **Documentation**: Methodology docs, API docs, and contributor guides
- **Internationalization**: Supporting multiple languages in the dashboard

## Code of Conduct

All contributors must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## Data Sensitivity

This project handles data about hate crimes. When contributing:

- **Never include raw hateful content** in code, comments, tests, or documentation
- Use categorical descriptors (e.g., "antisemitic slur") rather than reproducing actual language
- Test data should use clearly synthetic incidents, never real ones
- Be mindful that this data represents real harm to real people

## Questions?

Open an issue or discussion on GitHub.
