"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import SnsIcons from "@/components/SnsIcons";
import { API_URL } from "@/lib/api";

const KINDS = [
  "Webサイト制作のご依頼",
  "LP制作のご依頼",
  "バナー制作のご依頼",
  "コーディング代行のご依頼",
  "お問い合わせ・その他",
];

function ContactForm() {
  const params = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    kind: params.get("kind") === "request" ? KINDS[0] : "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="contact-card" style={{ textAlign: "center" }}>
        <p style={{ fontSize: "1.05rem", color: "var(--green-dark)", marginBottom: 10 }}>
          ✿ 送信しました
        </p>
        <p>お問い合わせありがとうございます。<br />2営業日以内にお返事いたします。</p>
      </div>
    );
  }

  return (
    <div className="contact-card">
      <div className="section-title" style={{ marginBottom: 30 }}>
        <span className="en">Contact Form</span>
        <span className="ja">お問い合わせ・ご依頼フォーム</span>
      </div>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>お名前<span className="req">必須</span></label>
          <input type="text" required placeholder="山田 花子"
            value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="form-group">
          <label>メールアドレス<span className="req">必須</span></label>
          <input type="email" required placeholder="hanako@example.com"
            value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="form-group">
          <label>ご相談内容<span className="req">必須</span></label>
          <select required value={form.kind} onChange={(e) => set("kind", e.target.value)}>
            <option value="">選択してください</option>
            {KINDS.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>メッセージ<span className="req">必須</span></label>
          <textarea required placeholder="ご依頼内容・ご希望の納期・ご予算・参考サイトなどをご記入ください"
            value={form.message} onChange={(e) => set("message", e.target.value)} />
        </div>
        {status === "error" && (
          <p style={{ color: "#c0392b", fontSize: "0.85rem", marginBottom: 14 }}>
            送信に失敗しました。時間をおいて再度お試しいただくか、SNSのDMからご連絡ください。
          </p>
        )}
        <p style={{ textAlign: "center" }}>
          <button type="submit" className="btn btn-primary" style={{ minWidth: 220 }} disabled={status === "sending"}>
            {status === "sending" ? "送信中…" : "送信する"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default function Contact() {
  return (
    <>
      <div className="page-head page-head-photo" style={{ backgroundImage: "url(/images/hero/hero-1.jpg)" }}>
        <div className="en">Contact</div>
        <div className="ja">お問い合わせ・ご依頼</div>
      </div>

      <section className="section">
        <div className="container">
          <p style={{ textAlign: "center", marginBottom: 40 }}>
            お仕事のご依頼・ご相談はこちらから。<br />
            <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>(2営業日以内にお返事いたします)</span>
          </p>

          <Suspense>
            <ContactForm />
          </Suspense>

          <div style={{ textAlign: "center", marginTop: 56 }}>
            <div className="section-title" style={{ marginBottom: 26 }}>
              <span className="en">SNS</span>
              <span className="ja">InstagramやXのDMからもお気軽にどうぞ</span>
            </div>
            <SnsIcons />
          </div>
        </div>
      </section>
    </>
  );
}
