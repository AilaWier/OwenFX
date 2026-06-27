import { Software } from './types';

const notionToken = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID ?? '';

/**
 * Fetch software entries from Notion database using the Notion API directly.
 * Uses raw fetch so we don't depend on @notionhq/client type quirks.
 */
export async function getSoftwareFromNotion(): Promise<Software[]> {
  if (!notionToken || !databaseId) {
    console.warn('[Notion] Missing NOTION_TOKEN or NOTION_DATABASE_ID');
    return [];
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        sorts: [{ property: 'UpdatedAt', direction: 'descending' }],
      }),
    });

    if (!response.ok) {
      console.error('[Notion] API error:', response.status, await response.text());
      return [];
    }

    const data = await response.json();
    return data.results
      .map((page: any): Software | null => {
        try {
          const props = page.properties;
          return {
            id: page.id,
            title: props.Name?.title?.[0]?.plain_text ?? 'Untitled',
            description: props.Description?.rich_text?.[0]?.plain_text ?? '',
            category: props.Category?.select?.name ?? 'Uncategorized',
            tags: props.Tags?.multi_select?.map((t: any) => t.name) ?? [],
            downloadUrl: props.DownloadUrl?.url ?? '',
            updatedAt: props.UpdatedAt?.date?.start ?? '',
            featured: props.Featured?.checkbox ?? false,
            imageUrl: props.Image?.url ?? undefined,
            version: props.Version?.rich_text?.[0]?.plain_text ?? undefined,
            size: props.Size?.rich_text?.[0]?.plain_text ?? undefined,
            platform: props.Platform?.select?.name ?? undefined,
          };
        } catch (e) {
          console.error('[Notion] Failed to parse page:', page.id, e);
          return null;
        }
      })
      .filter((s: Software | null): s is Software => s !== null);
  } catch (error) {
    console.error('[Notion] Failed to fetch database:', error);
    return [];
  }
}
