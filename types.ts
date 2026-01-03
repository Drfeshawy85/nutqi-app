
export type SoundPosition = 'initial' | 'medial' | 'final';

export interface TargetWord {
  id: string;
  word: string;
  position: SoundPosition;
  imageUrl: string;
  phoneme: string;
}

export interface SoundData {
  phoneme: string;
  name: string;
  words: TargetWord[];
}

export interface DiagnosisResult {
  wordId: string;
  word: string;
  phoneme: string;
  position: SoundPosition;
  isCorrect: boolean;
  transcribed: string;
  errorType: 'substitution' | 'omission' | 'none';
  substitutionDetails?: string;
  omissionDetails?: string;
  comment?: string;
  pointsEarned: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

export interface StudentSession {
  name: string;
  code: string;
  results: DiagnosisResult[];
  totalPoints: number;
}
