export interface EducationResponse {
  _id?: string;
  school: string;
  degree: string;
  years: string;
}

export interface EducationForm {
  school: string;
  degree: string;
  years: string;
}

export interface EducationSaveResponse {
  message: string;
  education: EducationResponse;
}

export interface EducationApiResponse {
  message: string;
}
