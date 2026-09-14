export interface SkillResponse {
  _id: string;
  name: string;
  imageUrl?: string;
  websiteUrl?: string;
  category: string;
  percentage?: number;
}

export interface SkillFormData {
  name: string;
  websiteUrl: string;
  category: string;
  percentage: number;
}

export interface SkillSaveResponse {
  message: string;
  skill: SkillResponse;
}

export interface SkillApiResponse {
  message: string;
}
