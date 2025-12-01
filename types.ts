export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string for user uploads
  timestamp: number;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export enum AppState {
  WELCOME = 'WELCOME',
  CHATTING = 'CHATTING',
}