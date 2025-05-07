export interface RequestMethod {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
  contentType: string;
}

export interface ResponseData {
  status: number;
  headers: Record<string, string>;
  body: any;
  time: number;
}

export interface ErrorData {
  message: string;
  details?: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  request: RequestMethod;
  createdAt: Date;
  documentation?: Documentation;
}

export interface Documentation {
  title: string;
  description: string;
  notes: string;
  tags: string[];
  lastUpdated: Date;
}

export interface ComparisonResult {
  id: string;
  requests: {
    request: RequestMethod;
    response: ResponseData | null;
    error: ErrorData | null;
  }[];
  createdAt: Date;
  name: string;
}