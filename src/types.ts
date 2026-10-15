export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  stageCue?: string;
  paragraphs: string[];
  keyQuote?: string;
  ambientSound: 'flute' | 'wind' | 'river' | 'tanpura' | 'war' | 'elegy';
  emotionalTone: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  label: string;
  gender: 'male' | 'female';
  tone: string;
  description: string;
}

export type ThemeMode = 'nocturne' | 'parchment' | 'oled' | 'dawn';

export interface TTSState {
  isLoading: boolean;
  isPlaying: boolean;
  activeChapterId: string | null;
  error: string | null;
  progress: number;
  duration: number;
}
