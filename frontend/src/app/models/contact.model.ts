export interface ContactResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSaveResponse {
  message: string;
  contact: ContactResponse;
}

export interface ContactApiResponse {
  message: string;
}
