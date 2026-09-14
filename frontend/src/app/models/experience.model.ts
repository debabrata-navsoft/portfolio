export interface ExperienceResponse {
  _id?: string;
  company: string;
  role: string;
  years: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceForm {
  company: string;
  role: string;
  years: string;
}

export interface ExperienceSaveResponse {
  message: string;
  experience: ExperienceResponse;
}

export interface ExperienceApiResponse {
  message: string;
}
