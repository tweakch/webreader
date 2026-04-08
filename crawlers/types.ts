export interface Story {
  slug: string;
  title: string;
  url: string;
}

export type FrontmatterValue = string | number;

export interface CrawledStory {
  /** Story markdown body (without frontmatter). */
  body: string;
  /** Optional adapter-specific frontmatter fields to merge. */
  frontmatter?: Record<string, FrontmatterValue>;
}

export interface SourceAdapter {
  /** Machine-readable id — used as the subdirectory name under stories/ */
  id: string;
  /** Human-readable label for READMEs */
  label: string;
  /** URL of the story list page */
  listUrl: string;
  /** Fetch and return all stories available from this source */
  getStoryList(): Promise<Story[]>;
  /**
   * Fetch a single story.
   * Returning a string is supported for backwards compatibility.
   */
  crawlStory(story: Story): Promise<string | CrawledStory>;
}
