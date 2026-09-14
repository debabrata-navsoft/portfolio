export interface FAQResponse {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQSaveResponse {
  message: string;
  faq: FAQResponse;
}

export interface FAQApiResponse {
  message: string;
}

export interface FAQForm {
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
}
