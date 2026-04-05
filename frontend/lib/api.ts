const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AnalysisResult {
  projectName: string;
  projectType: string;
  summary: string;
  hld: {
    overview: string;
    actors: string[];
    components: Array<{ name: string; description: string; type: string }>;
    dataFlow: string[];
    keyDecisions: string[];
  };
  techStack: {
    frontend: Array<{ name: string; reason: string; category: string }>;
    backend: Array<{ name: string; reason: string; category: string }>;
    database: Array<{ name: string; reason: string; category: string }>;
    infrastructure: Array<{ name: string; reason: string; category: string }>;
    devops: Array<{ name: string; reason: string; category: string }>;
  };
  databaseSchema: {
    applicable: boolean;
    tables: Array<{
      name: string;
      description: string;
      fields: Array<{ name: string; type: string; constraints: string }>;
    }>;
    relationships: string[];
  };
  apiStructure: {
    baseUrl: string;
    endpoints: Array<{
      method: string;
      path: string;
      description: string;
      requestBody: string | null;
      responseBody: string;
    }>;
  };
  scalingStrategy: {
    horizontal: string[];
    vertical: string[];
    caching: string[];
    optimization: string[];
  };
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  projectName: string;
  projectType: string;
  description: string;
  result: AnalysisResult;
  type: string;
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function analyzeProject(description: string, file?: File): Promise<{ id: string; data: AnalysisResult }> {
  const formData = new FormData();
  formData.append('description', description);
  if (file) formData.append('file', file);

  const res = await fetch(`${API_URL}/api/analyze-project`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(res);
}

export async function generateDiagram(analysisData: AnalysisResult): Promise<{ diagram: string }> {
  const res = await fetch(`${API_URL}/api/generate-diagram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysisData }),
  });
  return handleResponse(res);
}

export async function generatePlan(analysisData: AnalysisResult): Promise<{ data: any }> {
  const res = await fetch(`${API_URL}/api/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysisData }),
  });
  return handleResponse(res);
}

export async function getHistory(): Promise<{ data: HistoryEntry[] }> {
  const res = await fetch(`${API_URL}/api/history`);
  return handleResponse(res);
}

export async function deleteHistory(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/history/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}
