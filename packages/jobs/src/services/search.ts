import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
);

const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME || 'clips');

export type SearchableClip = {
  objectID: string;
  clipId: string;
  title: string;
  description: string | null;
  language: string;
  tags: string[];
  tagSlugs: string[];
  creatorId: string;
  creatorName: string;
  transcriptSnippet: string | null;
  durationSec: number;
  thumbnailUrl: string | null;
  audioUrl: string | null;
  publishedAt: number; // Unix timestamp
  likeCount: number;
  playCount: number;
  completionRate: number;
};

export class SearchService {
  /**
   * Index a clip for search
   */
  static async indexClip(clip: SearchableClip): Promise<void> {
    try {
      await index.saveObject(clip);
    } catch (error) {
      console.error('Search indexing error:', error);
      throw new Error('Failed to index clip');
    }
  }

  /**
   * Update a clip in the search index
   */
  static async updateClip(
    clipId: string,
    updates: Partial<SearchableClip>
  ): Promise<void> {
    try {
      await index.partialUpdateObject({
        objectID: clipId,
        ...updates,
      });
    } catch (error) {
      console.error('Search update error:', error);
      throw new Error('Failed to update clip in search index');
    }
  }

  /**
   * Remove a clip from the search index
   */
  static async removeClip(clipId: string): Promise<void> {
    try {
      await index.deleteObject(clipId);
    } catch (error) {
      console.error('Search deletion error:', error);
      throw new Error('Failed to remove clip from search index');
    }
  }

  /**
   * Bulk index multiple clips
   */
  static async bulkIndexClips(clips: SearchableClip[]): Promise<void> {
    try {
      await index.saveObjects(clips);
    } catch (error) {
      console.error('Bulk search indexing error:', error);
      throw new Error('Failed to bulk index clips');
    }
  }

  /**
   * Search for clips
   */
  static async search(
    query: string,
    options?: {
      language?: string;
      tagSlugs?: string[];
      creatorId?: string;
      page?: number;
      hitsPerPage?: number;
    }
  ) {
    try {
      const filters: string[] = [];

      if (options?.language) {
        filters.push(`language:${options.language}`);
      }

      if (options?.tagSlugs && options.tagSlugs.length > 0) {
        const tagFilters = options.tagSlugs.map((tag) => `tagSlugs:${tag}`).join(' OR ');
        filters.push(`(${tagFilters})`);
      }

      if (options?.creatorId) {
        filters.push(`creatorId:${options.creatorId}`);
      }

      const result = await index.search(query, {
        filters: filters.length > 0 ? filters.join(' AND ') : undefined,
        page: options?.page || 0,
        hitsPerPage: options?.hitsPerPage || 20,
        attributesToRetrieve: [
          'clipId',
          'title',
          'description',
          'language',
          'tags',
          'creatorName',
          'creatorId',
          'transcriptSnippet',
          'durationSec',
          'thumbnailUrl',
        ],
      });

      return result;
    } catch (error) {
      console.error('Search query error:', error);
      throw new Error('Failed to search clips');
    }
  }
}
