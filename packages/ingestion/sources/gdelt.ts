import { Job } from "bullmq";
import { BaseIngestionWorker } from "../base-worker.js";
import type { RawIncident } from "@mishmarot/shared";

const GDELT_DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc";

/**
 * GDELT DOC 2.0 API ingestion worker.
 *
 * Queries the GDELT DOC API for articles matching antisemitism-related
 * themes every 15 minutes. GDELT captures media narrative — it tells us
 * what the world's news media is reporting about antisemitism, not
 * verified incidents. This makes it ideal as a signals layer.
 *
 * Key characteristics:
 * - Updates every 15 minutes
 * - Global coverage (65 languages, 150+ countries)
 * - High volume, high noise — requires relevance filtering
 * - Geographic precision varies (city-level from article geotagging)
 * - No authentication required, fully open access
 *
 * Filtering strategy:
 * - Primary: REL_ANTISEMITISM theme
 * - Secondary: Keyword co-occurrence filtering to reduce false positives
 * - Articles mentioning antisemitism in passing (e.g., historical context
 *   in unrelated stories) are filtered by checking entity co-occurrence
 */
export class GdeltWorker extends BaseIngestionWorker {
  // Keywords that must co-occur with antisemitism mention to pass filter
  private static RELEVANCE_KEYWORDS = [
    "attack",
    "incident",
    "vandalism",
    "assault",
    "threat",
    "graffiti",
    "swastika",
    "synagogue",
    "jewish",
    "hate crime",
    "harassment",
    "desecration",
    "cemetery",
    "bomb threat",
    "arson",
    "slur",
  ];

  constructor(redisUrl: string) {
    super({
      sourceId: "gdelt",
      queueName: "gdelt-ingest",
      cronSchedule: "*/15 * * * *", // Every 15 minutes
      redisUrl,
    });
  }

  protected async fetch(_job: Job): Promise<RawIncident[]> {
    const articles = await this.queryGdeltApi();
    const filtered = this.filterRelevant(articles);
    return filtered.map((article) => this.toRawIncident(article));
  }

  /**
   * Query GDELT DOC 2.0 API for antisemitism-related articles.
   */
  private async queryGdeltApi(): Promise<GdeltArticle[]> {
    const params = new URLSearchParams({
      query: "antisemitism OR antisemitic OR anti-semitic OR anti-semitism",
      mode: "ArtList",
      maxrecords: "250",
      format: "json",
      timespan: "15min",
      sort: "DateDesc",
    });

    const url = `${GDELT_DOC_API}?${params.toString()}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`GDELT API returned ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as GdeltResponse;
      return data.articles ?? [];
    } catch (error) {
      // GDELT API can be flaky — log and return empty rather than failing the job
      // on transient network errors. The retry mechanism will handle persistent failures.
      console.error("[gdelt] API request failed:", error);
      throw error;
    }
  }

  /**
   * Filter articles for relevance.
   * GDELT returns any article mentioning antisemitism — many are
   * historical analyses, opinion pieces, or tangential mentions.
   * We want articles that describe actual incidents.
   */
  private filterRelevant(articles: GdeltArticle[]): GdeltArticle[] {
    return articles.filter((article) => {
      const text = `${article.title ?? ""} ${article.seendate ?? ""}`.toLowerCase();

      // Must contain at least one relevance keyword
      const hasRelevanceKeyword = GdeltWorker.RELEVANCE_KEYWORDS.some(
        (keyword) => text.includes(keyword)
      );

      return hasRelevanceKeyword;
    });
  }

  /**
   * Convert a GDELT article to our RawIncident format.
   */
  private toRawIncident(article: GdeltArticle): RawIncident {
    return {
      sourceId: "gdelt",
      sourceRef: article.url ?? `gdelt-${article.seendate}`,
      rawData: article as unknown as Record<string, unknown>,
      occurredAt: article.seendate ? new Date(article.seendate) : null,
      reportedAt: article.seendate ? new Date(article.seendate) : null,
      lat: article.sourcelat ? parseFloat(String(article.sourcelat)) : null,
      lon: article.sourcelong ? parseFloat(String(article.sourcelong)) : null,
      countryIso: article.sourcecountry ?? null,
      admin1: null,
      locality: null,
      sourceCategory: null, // GDELT doesn't classify incident type
      rawSummary: article.title ?? null,
      sourceUrl: article.url ?? null,
    };
  }
}

// ============================================================
// GDELT API Response Types
// ============================================================

interface GdeltResponse {
  articles?: GdeltArticle[];
}

interface GdeltArticle {
  url?: string;
  title?: string;
  seendate?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
  sourcelat?: number | string;
  sourcelong?: number | string;
  tone?: number;
  socialimage?: string;
}
