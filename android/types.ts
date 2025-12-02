export interface Topic {
  id: string;
  query: string;
  icon: string;
}

export interface ArticleCard {
  id: string;
  topic_id: string | null;
  title: string;
  summary: string;
  image_url: string | null;
  source_url: string | null;
  published_date: string | null;
  citations: string[];
  is_archived: boolean;
  is_read: boolean;
}
