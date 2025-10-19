
export interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
}

export interface FeedOptions {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
}
