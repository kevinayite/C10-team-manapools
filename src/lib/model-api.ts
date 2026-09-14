export type ModelClassification = {
  issue: string;
  issue_label: string;
  issue_confidence: number;
  sentiment: "Negative" | "Neutral" | "Positive";
  sentiment_confidence: number;
  priority: "High" | "Medium" | "Low";
};

export type StoredComplaint = ModelClassification & {
  id: string;
  customer: string;
  title: string;
  body: string;
  created_at: string;
};

const modelApiUrl = import.meta.env.VITE_MODEL_API_URL ?? "http://localhost:8000";

export async function classifyComplaint(text: string, customer = "New customer"): Promise<ModelClassification> {
  const response = await fetch(`${modelApiUrl}/api/v1/classify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, customer }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Model API returned ${response.status}`);
  }

  return (await response.json()) as ModelClassification;
}

export async function getStoredComplaints(): Promise<StoredComplaint[]> {
  const response = await fetch(`${modelApiUrl}/api/v1/complaints`);
  if (!response.ok) throw new Error(`Complaint API returned ${response.status}`);
  const payload = (await response.json()) as { complaints: StoredComplaint[] };
  return payload.complaints;
}