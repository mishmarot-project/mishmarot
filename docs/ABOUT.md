# About Mishmarot

## Mission

**Provide timely, verified, multi-source situational awareness of antisemitic incidents worldwide through an open-source platform, empowering those who protect Jewish communities to make informed decisions and those who study antisemitism to do so with better data.**

## Why This Exists

No unified, real-time, open-source platform currently aggregates antisemitism incident data across geographic boundaries, online and offline domains, or organizational silos. The data exists across at least 15 major sources (government statistics, civil society databases, academic surveys, media monitoring systems) but it is fragmented across PDF reports, proprietary databases, restricted APIs, and annual publications with 3–12 month reporting lags.

The consequences of that fragmentation are concrete. A community security director preparing for the High Holidays cannot see, in one view, what is happening at synagogues in London, Berlin, Paris, and New York. A campus Hillel professional cannot compare their university's threat environment to national trends in real time. A journalist covering a spike in incidents cannot cross-reference FBI, ADL, and European data without weeks of manual aggregation. A researcher cannot access standardized, multi-source datasets without navigating incompatible taxonomies and restricted-access portals.

This platform exists to close those gaps.

## What This Platform Does

This is a **situational awareness dashboard**: a continuously updated, multi-source picture of antisemitic incidents worldwide. It aggregates, normalizes, and cross-references data from government agencies, civil society organizations, media monitoring systems, and academic databases into a single, searchable, map-based interface.

Every incident is scored for confidence based on source reliability and independent corroboration. Every data source is documented with its methodology, update frequency, and known limitations. Every classification decision is transparent and traceable.

The platform serves five primary user groups with distinct but overlapping needs:

**Community security professionals** who need operational threat awareness across geographies, understanding what is happening now, not what happened last quarter. The Secure Community Network (SCN), which protects over 12,400 Jewish facilities across North America, has described the current environment as "the most elevated threat environment in modern history." This platform provides the global context that local security assessments require.

**Campus professionals** (Hillel directors, Jewish student life staff, campus security coordinators) who need cross-campus visibility. Each university operates its own bias reporting system with inconsistent definitions and no cross-institutional integration. Antisemitic incidents on US campuses reached record levels in 2024, yet only 21% of Jewish students who experience antisemitism report it anywhere.

**Journalists** covering antisemitism who need machine-readable, standardized data with clear sourcing. The closure of ProPublica's Documenting Hate project in 2019 left a significant gap in collaborative hate-crime journalism infrastructure. Journalists currently rely on annual reports published months after the incidents they describe.

**Policy advocates** at organizations like ADL, AJC, and JFNA who use incident data in legislative testimony, grant applications, and advocacy campaigns. They need geographic breakdowns for state-specific strategies, year-over-year trend comparisons, and presentation-ready data exports.

**Researchers** studying antisemitism who face a data access crisis driven by social media API shutdowns, prohibitive costs, fragmented databases with incompatible schemas, and the absence of standardized, bulk-downloadable datasets with version control and citation support.

## What This Platform Is Not

The mission is deliberately bounded. Clarity about what we do not do is as important as clarity about what we do.

**We are not a response coordination platform.** SCN's Project RAIN and the Jewish Security Operations Command Center (JSOCC) handle real-time threat response for the Jewish community. We provide situational awareness, not incident management or response coordination. Duplicating that capability would be redundant and potentially dangerous.

**We are not a social media takedown tool.** CyberWell monitors and flags antisemitic content on social media platforms for removal. We may display aggregated statistics about online antisemitism, but we do not reproduce hateful content, facilitate platform reporting, or maintain databases of individual social media posts.

**We are not an advocacy or lobbying platform.** ADL, AJC, and dozens of other organizations advocate for policy changes, legislation, and institutional action against antisemitism. Our role is to provide accurate, transparent, methodologically sound data that any organization, regardless of its advocacy position, can use. The platform does not take positions on legislation, institutional policies, or political disputes.

**We are not a general hate crime tracker.** We monitor antisemitism specifically, with depth over breadth. Attempting to track all forms of hate simultaneously would dilute the domain expertise, taxonomic precision, and partnership relationships that make the platform credible. Other organizations (Stop AAPI Hate, Tell MAMA, SPLC) serve other communities. We may share infrastructure patterns with them (the architecture is designed to be replicable), but the data and domain focus is antisemitism.

**We are not building community features.** There are no forums, comment sections, user profiles, or social features. We do not accept user-generated incident reports. Intake systems (ADL's reporting form, CST's reporting portal, RIAS's reporting network, Hillel's ReportCampusHate.org) already exist and are operated by organizations with the training and resources to handle sensitive reports. We aggregate their outputs; we do not compete with their inputs.

## How We Define Antisemitism

This platform adopts the **International Holocaust Remembrance Alliance (IHRA) Working Definition of Antisemitism** as its primary classification framework. The IHRA definition is used by 45 governments, the European Commission, the U.S. Department of State, and the major civil society organizations whose data we aggregate, including ADL, CST, RIAS, and the ENMA network. Operational consistency with our data sources requires definitional alignment with them.

The platform is also designed for **definitional transparency**. Every incident in our database preserves its source-native classification, the specific IHRA examples it was evaluated against (if applicable), and metadata sufficient for researchers using alternative frameworks, including the Jerusalem Declaration on Antisemitism (JDA), to re-filter the dataset according to their own criteria. Our schema captures multiple dimensions of classification: what happened (incident type and severity), the ideological content expressed (antisemitic manifestation), and the degree of explicitness (particularly for online content).

This approach (operational alignment with the dominant institutional framework, combined with full transparency about classification decisions) is the most defensible position for a platform that aims to be trusted by security professionals, useful to researchers, and honest about the complexities of defining antisemitism in practice. The platform documents its classification methodology, including source-to-canonical taxonomy mappings, in versioned specifications published in the project repository.

## How We Handle Sensitive Data

Building a hate-tracking dashboard carries responsibilities that a typical data platform does not. We are guided by three principles:

### Don't Center the Aggressor

Following the "Oxygen of Amplification" framework developed by Data & Society, we never reproduce specific hateful content: no slurs, no symbols, no manifestos. Incident summaries use categorical descriptors ("antisemitic slur," "Nazi imagery," "Holocaust denial content") rather than reproducing the actual language or images. The public-facing dashboard shows patterns, trends, and aggregate statistics. Raw incident details are accessible only to vetted researchers under data-use agreements.

### Protect the Vulnerable, Not Just Their Data

Geographic data is subject to deliberate precision constraints. Public users see aggregated data at regional or state level. Researcher-tier access provides county-level monthly data. Partner-tier access offers full incident detail under data-use agreements. All geographic data is subject to a minimum 72-hour delay to prevent targeting of active response scenes. Localities below a population threshold of 20,000 are suppressed to prevent community identification. These constraints apply universally. No override mechanism exists.

Incident data involving individuals is stripped of personally identifiable information during ingestion. The sanitization pipeline removes names, specific addresses, identifying physical descriptions, and any other details that could enable re-identification when combined with publicly available information.

### Verification Before Publication

Every incident is assigned a confidence tier:

- **Confirmed**: Corroborated by law enforcement or multiple independent sources with media verification
- **Verified**: Verified by trained staff at a partner organization with at least one independent source
- **Credible**: Single credible report awaiting corroboration, displayed with a visible indicator
- **Unverified**: Self-reported and pending review, withheld from public display

The public dashboard displays only Confirmed and Verified incidents by default. Credible incidents are shown with clear visual differentiation. Unverified incidents never appear on the public interface. Source freshness (when each data feed was last updated) is displayed transparently on every view.

## Data Sources and Methodology

The platform aggregates data from government agencies, civil society organizations, media monitoring systems, and academic databases. Each source is documented with its methodology, update frequency, geographic coverage, known limitations, and the mapping between its native classification system and our canonical taxonomy.

We do not modify, editorialize, or selectively filter source data. When sources disagree (as they routinely do, given different methodologies, definitions, and reporting thresholds), we display both and let users see the discrepancy. The gap between FBI's roughly 2,000 annual anti-Jewish hate crime reports and ADL's 9,000+ is not an error to resolve; it is a fact about the state of reporting infrastructure that users should understand.

Our classification taxonomy is versioned and published. When categories are added, renamed, or restructured, the version number is incremented and the change is documented. Researchers who cite our data can specify the taxonomy version they used, ensuring reproducibility.

Complete methodological documentation, including source mapping tables, normalization rules, and deduplication heuristics, is maintained in the project repository at `docs/methodology/`.

## Open Source and Governance

This project is released under the **Apache License 2.0**. The source code, data processing pipelines, classification methodology, and taxonomy mappings are all publicly available. We believe that transparency about how antisemitism data is collected, classified, and presented is not just a technical choice but an ethical obligation. Anyone can verify our methodology, reproduce our analysis, or build on our infrastructure.

The project follows a phased governance model. In its current phase, it operates under a single maintainer within a dedicated GitHub organization, with published contributing guidelines, a code of conduct, and a governance document describing the path toward shared governance. As partnerships develop, an advisory board representing community security, academic research, and civil society will guide data policy, classification decisions, and partnership priorities. The long-term goal is fiscal sponsorship through an established entity that can receive grants, execute data-use agreements, and provide institutional continuity.

---

*This document is versioned alongside the project source code. The current version reflects the project's founding principles and initial architecture. It will be updated as partnerships develop and the platform evolves, with all changes tracked in version control.*
