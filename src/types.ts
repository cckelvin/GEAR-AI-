export type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  type?: 'text' | 'step' | 'file';
  status?: 'loading' | 'generating' | 'done';
  code?: string;
  fileName?: string;
  groundingSources?: { title: string, uri: string }[];
  isError?: boolean;
};

export type Space = {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  deploymentUrl?: string;
  vercelProjectName?: string;
  customDomain?: string;
  status?: 'draft' | 'deployed';
  isPrivate?: boolean;
};

export type FileData = {
  name: string;
  content: string;
};

export type AIModel = 'ionic' | 'iconic';

export interface AIModelConfig {
  id: AIModel;
  name: string;
  codename: string;
  badge: string;
  tagline: string;
  description: string;
  architecture: string;
  specialization: string;
  color: string;
  accentBg: string;
  accentBorder: string;
  strengths: string[];
  bestFor: string;
}

export interface GearExtension {
  id: string;
  name: string;
  identifier: string;
  version: string;
  category: 'runtime' | 'bundler' | 'language' | 'tool';
  enabled: boolean;
  description: string;
  iconName: string;
  author: string;
  fileExtensions: string[];
  features: string[];
  canExecute: boolean;
  executionEngine: string;
}

