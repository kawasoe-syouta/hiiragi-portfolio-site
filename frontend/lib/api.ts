export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Work = {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  is_featured: boolean;
};

export type WorksResponse = { works: Work[]; categories: string[] };

export async function fetchWorks(): Promise<WorksResponse> {
  const res = await fetch(`${API_URL}/api/works`, { cache: "no-store" });
  if (!res.ok) throw new Error("作品の取得に失敗しました");
  return res.json();
}
