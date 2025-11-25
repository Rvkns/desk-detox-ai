export enum Category {
  ACTION = 'ACTION',
  ARCHIVE = 'ARCHIVE',
  TRASH = 'TRASH'
}

export enum Visibility {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface DetoxItem {
  id: number;
  type: string;
  sender: string;
  extract_date: string;
  deadline: string;
  amount: string | null;
  urgency_score: number;
  category: Category;
  action_suggested: string;
  visibility: Visibility;
  isPaid?: boolean; // Nuova proprietà per tracciare lo stato
}

export interface DetoxResponse {
  summary: string;
  items: DetoxItem[];
}

export type ProcessingStatus = 'idle' | 'analyzing' | 'complete' | 'error';