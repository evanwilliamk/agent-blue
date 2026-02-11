// Core type definitions for the A11y Dashboard

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type WCAGVersion = '2.1' | '2.2';
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'wont-fix';
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface WCAGGuideline {
  id: string;
  number: string;
  title: string;
  level: WCAGLevel;
  version: WCAGVersion;
  description: string;
  howToMeet: string[];
  commonMistakes: string[];
  examples: {
    good: string[];
    bad: string[];
  };
  tags: string[];
  relatedGuidelines: string[];
}

export interface ContrastCheck {
  id: string;
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
  timestamp: Date;
  notes?: string;
}

export interface ComponentAnnotation {
  id: string;
  componentName: string;
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  keyboardNavigation?: string;
  focusManagement?: string;
  semanticHTML?: string;
  notes?: string;
  figmaLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface A11yIssue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  wcagGuidelines: string[]; // References to WCAGGuideline IDs
  component?: string;
  figmaLink?: string;
  screenshots?: string[];
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  issues: A11yIssue[];
  annotations: ComponentAnnotation[];
  contrastChecks: ContrastCheck[];
  createdAt: Date;
  updatedAt: Date;
}
