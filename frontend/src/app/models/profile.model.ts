export interface ProfileResponse {
  _id?: string;
  imageUrl: string;

  heroGradientText: string;
  heroHeading: string;
  introduction: string;
  profileDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileSaveResponse {
  message: string;
  profile: ProfileResponse;
}

export interface ProfileImageResponse {
  message: string;
  imageUrl: string;
}

export interface ResumeResponse {
  message?: string;
  resumeUrl: string;
}

export type ProfileForm = {
  heroGradientText: string;
  heroHeading: string;
  introduction: string;
  profileDescription: string;
};
