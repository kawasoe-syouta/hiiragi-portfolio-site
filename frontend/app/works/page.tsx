import type { Metadata } from "next";
import CtaBand from "@/components/CtaBand";
import WorksGrid from "@/components/WorksGrid";
import { fetchWorks, type WorksResponse } from "@/lib/api";

export const metadata: Metadata = { title: "制作実績" };

export default async function Works() {
  let data: WorksResponse = { works: [], categories: [] };
  let error = false;
  try {
    data = await fetchWorks();
  } catch {
    error = true;
  }

  return (
    <>
      <div className="page-head page-head-photo" style={{ backgroundImage: "url(/images/hero/hero-2.jpg)" }}>
        <div className="en">Works</div>
        <div className="ja">制作実績</div>
      </div>

      <section className="section">
        <div className="container">
          <p style={{ textAlign: "center", marginBottom: 36 }}>
            これまでの制作実績の一部をご紹介します。<br />
            カテゴリボタンで表示を切り替えられます。カードをクリックすると詳細をご覧いただけます。
          </p>
          {error ? (
            <p style={{ textAlign: "center", color: "var(--text-light)" }}>
              作品を読み込めませんでした。バックエンド(Laravel)が起動しているかご確認ください。
            </p>
          ) : (
            <WorksGrid works={data.works} categories={data.categories} withFilter />
          )}
        </div>
      </section>

      <CtaBand
        title="「こんなデザインをお願いしたい」がありましたら"
        text="掲載していない実績もございます。お気軽にお問い合わせください。"
      />
    </>
  );
}
