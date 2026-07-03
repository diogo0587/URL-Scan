export interface Rule {
  id: string;
  name: string;
  active: boolean;
  regex: string;
  replacement: string;
  isDecode?: boolean;
}

export interface SavedLog {
  id: string;
  originalUrl: string;
  cleanedUrl: string;
  timestamp: number;
}

export interface ThreatConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface SecurityAlert {
  id: string;
  threatId: string;
  threatName: string;
  url: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  dismissed: boolean;
}

export type AIProvider = 'gemini' | 'openai' | 'openrouter' | 'custom';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  apiEndpoint: string;
  model: string;
  enabled: boolean;
}

