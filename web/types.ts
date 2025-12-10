export interface Topic {
  id: string;
  query: string;
  createdAt: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ArticleCard {
  id: string;
  topicId: string;
  topicQuery: string;
  title: string;
  teaser: string; // Brief information
  content: string; // Detailed text
  imageUrl: string;
  generatedAt: number;
  sources: GroundingSource[];
  isRead: boolean;
  isArchived: boolean;
}

export interface AppState {
  topics: Topic[];
  activeCards: ArticleCard[];
  archivedCards: ArticleCard[];
  lastFetchDate: string | null;
}

export type TabView = 'feed' | 'topics' | 'archive' | 'settings';