export interface Story {
  slug: string;
  title: string;
  url: string;
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
  /** Fetch a single story and return its markdown body (no frontmatter) */
  crawlStory(story: Story): Promise<string>;
}
