
import { FeedItem, FeedOptions } from '../types';

const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const generateRssXml = (options: FeedOptions, items: FeedItem[]): string => {
  const channelItems = items.map(item => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
      ${item.pubDate ? `<pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>` : ''}
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(options.title)}</title>
    <link>${escapeXml(options.siteUrl)}</link>
    <description>${escapeXml(options.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(options.feedUrl)}" rel="self" type="application/rss+xml" />
    ${channelItems}
  </channel>
</rss>`;
};
