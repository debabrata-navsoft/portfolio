export interface AboutResponse {
  _id?: string;
  description: string;
  email: string;
  location: string;
  images: string[];
}
export interface AboutSaveResponse {
  message: string;
  about: AboutResponse;
}

export interface AboutForm {
  description: string;
  email: string;
  location: string;
  imageFiles: (File | null)[]; // fixed length 4, one slot per image
  existingImages: (string | null)[]; // same 4 slots: the saved URL, or null when empty/replaced
}
