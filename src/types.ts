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
