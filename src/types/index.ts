export type ToolCategory =
  | 'pdf-documents'
  | 'image-studio'
  | 'audio-video'
  | 'qr-code'
  | 'calculators'
  | 'text-writing'
  | 'privacy-security';

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
}

export interface ToolMetadata {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  isBuiltIn: boolean;
  isPopular: boolean;
  route: string;
  shortInstructions: string;
  privacyLabel: string;
  badge?: 'new' | 'popular' | string;
  accentColor?: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'emerald';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}
