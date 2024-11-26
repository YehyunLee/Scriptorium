export interface Template {
  id: number;
  title: string;
  content: string;
  explanation: string;
  tags: string;
  language: string;
  author: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  authorId?: number;
  forkedFrom?: {
    title: string;
  };
  forkedFromId?: number;
}
