import { FacetOption, ListQuery, PagedResponse } from './filter.model';

export interface ProjectResponse {
  _id: string;
  title: string;
  slug: string;
  overview: string;
  description: string;
  category: string;
  projectCardImage: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  projectDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectListFilters {
  categories: FacetOption[];
  technologies: FacetOption[];
}

export interface ProjectListResponse extends PagedResponse<ProjectResponse> {
  filters: ProjectListFilters;
}

export interface ProjectQuery extends ListQuery {
  category?: string[];
  technology?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface ProjectSaveResponse {
  message: string;
  project: ProjectResponse;
}

export interface ProjectApiResponse {
  message: string;
}

export interface ProjectForm {
  title: string;
  slug: string;
  projectDate: string;
  overview: string;
  description: string;
  category: string;
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  projectCardImageFile: File | null;
  imageFile: File | null;
}

export interface ProjectTabs {
  id: string;
  label: string;
}
