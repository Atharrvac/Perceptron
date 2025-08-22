
export interface EducationEntry {
  id: string; // For React keys and simple management
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string; // Can be 'Present'
}

export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  skills: string[];
  avatarUrl: string; // URL to an image, placeholder for ReadyPlayerMe integration
  location: [number, number]; // [latitude, longitude]
  education?: EducationEntry[];
}

export interface Task { // Primarily for Map Page tasks
  id: string;
  title: string;
  description: string;
  location: [number, number]; // [latitude, longitude]
  status: 'open' | 'in-progress' | 'completed';
  type: 'gig' | 'help-request' | 'medical-camp';
  postedBy: string; // User ID or organization name
  xpPoints?: number;
}

// For Marketplace
export type OpportunityType =
  | 'all' // For filter
  | 'job'
  | 'gig'
  | 'volunteer'
  | 'freelance'
  | 'mentorship'
  | 'learning'
  | 'support'
  | 'barter'
  | 'collaboration';

export interface OpportunityItem {
  id: string;
  title: string;
  type: OpportunityType;
  categoryLabel: string;
  description: string;
  tags: string[];
  offeredBy: string; // Display name of the offerer
  offeredById: string; // ID of the UserProfile who offered this
  icon?: string;
}


export interface ChatMessage {
  id: string;
  conversationId: string; // Groups messages between two entities (e.g., user1-user2, user1-ai)
  senderId: string; // ID of the UserProfile sending, or 'ai'
  recipientId: string; // ID of the UserProfile receiving, or 'ai' (if AI is sending to a user)
  originalText: string;
  translatedText?: string;
  timestamp: Date;
  targetLanguage?: Language; // Language the recipient might want to see it in
  sources?: GroundingChunk[]; // For AI messages with search results
}

export enum Language {
  ENGLISH = 'English',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  CHINESE_SIMPLIFIED = 'Chinese (Simplified)',
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}
