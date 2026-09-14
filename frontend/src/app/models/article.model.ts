import { FacetOption, ListQuery, PagedResponse } from './filter.model';

export interface ArticleResponse {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  tags: string[];
  published: boolean;
  estimatedReadingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListFilters {
  tags: FacetOption[];
  readingTimes: FacetOption[];
}

export interface ArticleListResponse extends PagedResponse<ArticleResponse> {
  filters: ArticleListFilters;
}

export interface ArticleQuery extends ListQuery {
  tag?: string[];
  readingTime?: string[];
  published?: boolean;
}

export interface ArticleSaveResponse {
  message: string;
  blog: ArticleResponse;
}

export interface ArticleApiResponse {
  message: string;
}

export interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
  imageFile: File | null;
}
