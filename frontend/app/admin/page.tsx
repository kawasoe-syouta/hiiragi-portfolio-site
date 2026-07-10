"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, type Work } from "@/lib/api";

const EMPTY = { title: "", category: "", description: "" };

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [works, setWorks] = useState<Work[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragover, setDragover] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => setToken(localStorage.getItem("admin_token")), []);

  const loadWorks = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/works`, { cache: "no-store" });
    const data = await res.json();
    setWorks(data.works);
  }, []);

  useEffect(() => { if (token) loadWorks(); }, [token, loadWorks]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) { setLoginError("パスワードが違います"); return; }
    const { token: t } = await res.json();
    localStorage.setItem("admin_token", t);
    setToken(t);
  }

  function logout() {
    localStorage.removeItem("admin_token");
    setToken(null);
  }

  function pickFile(f: File) {
    if (!f.type.startsWith("image/")) { alert("画像ファイルを選んでください"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function startEdit(w: Work) {
    setEditingId(w.id);
    setForm({ title: w.title, category: w.category, description: w.description });
    setFile(null);
    setPreview(w.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
    setFile(null);
    setPreview(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId && !file) { alert("画像をドラッグ&ドロップしてください"); return; }
    setBusy(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("category", form.category);
    fd.append("description", form.description);
    if (file) fd.append("image", file);
    const url = editingId ? `${API_URL}/api/admin/works/${editingId}` : `${API_URL}/api/admin/works`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: fd,
    });
    setBusy(false);
    if (res.status === 401) { logout(); return; }
    if (!res.ok) { alert("保存に失敗しました"); return; }
    resetForm();
    loadWorks();
  }

  async function remove(id: number) {
    if (!confirm("この作品を削除しますか?")) return;
    await fetch(`${API_URL}/api/admin/works/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    loadWorks();
  }

  async function toggleFeatured(id: number) {
    const current = works.filter((w) => w.is_featured).map((w) => w.id);
    const isOn = current.includes(id);
    if (!isOn && current.length >= 3) {
      alert("トップページに表示できる作品は3件までです。ほかの作品を外してから指定してください。");
      return;
    }
    const next = isOn ? current.filter((x) => x !== id) : [...current, id];
    // 表示中は即座に反映(楽観的更新)
    setWorks(works.map((w) => ({ ...w, is_featured: next.includes(w.id) })));
    const res = await fetch(`${API_URL}/api/admin/works-featured`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ids: next }),
    });
    if (res.status === 401) { logout(); return; }
    loadWorks();
  }

  async function move(id: number, dir: number) {
    const i = works.findIndex((w) => w.id === id);
    const j = i + dir;
    if (j < 0 || j >= works.length) return;
    const next = [...works];
    [next[i], next[j]] = [next[j], next[i]];
    setWorks(next);
    await fetch(`${API_URL}/api/admin/works-reorder`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ids: next.map((w) => w.id) }),
    });
  }

  if (!token) {
    return (
      <section className="section">
        <div className="container">
          <div className="contact-card" style={{ maxWidth: 420 }}>
            <div className="section-title" style={{ marginBottom: 26 }}>
              <span className="en">Admin Login</span>
              <span className="ja">作品管理ページ</span>
            </div>
            <form onSubmit={login}>
              <div className="form-group">
                <label>パスワード</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {loginError && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginBottom: 12 }}>{loginError}</p>}
              <p style={{ textAlign: "center" }}>
                <button type="submit" className="btn btn-primary">ログイン</button>
              </p>
            </form>
          </div>
        </div>
      </section>
    );
  }

  const categories = [...new Set(works.map((w) => w.category))];

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 880 }}>
        <div className="page-head" style={{ borderRadius: "var(--radius)", marginBottom: 30 }}>
          <div className="en">Admin</div>
          <div className="ja">作品の追加・編集(保存するとすぐサイトに反映されます)</div>
        </div>
        <p style={{ textAlign: "right", marginBottom: 20 }}>
          <button className="mini-btn" onClick={logout}>ログアウト</button>
        </p>

        <form className="admin-form" onSubmit={save}>
          <div
            className={`dropzone ${dragover ? "dragover" : ""}`}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
            onDragLeave={() => setDragover(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragover(false);
              if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
            }}
          >
            {preview ? (
              <p><img className="preview" src={preview} alt="" /><br />
                <small>別の画像にする場合は、もう一度ドラッグまたはクリック</small></p>
            ) : (
              <p>📷 ここに画像をドラッグ&ドロップ<br />
                <small>クリックしてファイルを選ぶこともできます(JPG / PNG / GIF / WebP、4MBまで)</small></p>
            )}
            <input ref={fileInput} type="file" accept="image/*" hidden
              onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])} />
          </div>
          <div className="form-group">
            <label>作品タイトル<span className="req">必須</span></label>
            <input type="text" required placeholder="例)カフェ〇〇様 Webサイト"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>カテゴリ<span className="req">必須</span></label>
            <input type="text" required list="catList" placeholder="例)Webデザイン"
              value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <datalist id="catList">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="form-group">
            <label>説明文(改行OK)</label>
            <textarea placeholder="担当範囲・制作期間・工夫した点など"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <p style={{ textAlign: "center" }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "保存中…" : editingId ? "✿ この内容で更新" : "✿ 作品を追加"}
            </button>{" "}
            {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>キャンセル</button>}
          </p>
        </form>

        <div className="section-title" style={{ margin: "40px 0 20px" }}>
          <span className="en">Works List</span>
          <span className="ja">登録済みの作品(全 {works.length} 件・上から順に表示)</span>
        </div>
        <p style={{ textAlign: "center", color: "var(--text-light)", fontSize: "0.85rem", marginBottom: 20 }}>
          ★ = トップページに表示する作品(最大3件・現在 {works.filter((w) => w.is_featured).length} / 3 件)
        </p>
        {works.map((w) => (
          <div key={w.id} className="admin-list-item">
            <img src={w.image} alt="" />
            <div className="info">
              <b>{w.title}{w.is_featured && <span style={{ color: "#c98a1a", marginLeft: 6 }}>★トップ表示中</span>}</b>
              <span>{w.category}</span>
            </div>
            <button className={`mini-btn ${w.is_featured ? "edit" : ""}`} onClick={() => toggleFeatured(w.id)}>
              {w.is_featured ? "★トップ表示中" : "☆トップに表示"}
            </button>
            <button className="mini-btn" onClick={() => move(w.id, -1)}>↑</button>
            <button className="mini-btn" onClick={() => move(w.id, 1)}>↓</button>
            <button className="mini-btn edit" onClick={() => startEdit(w)}>編集</button>
            <button className="mini-btn" onClick={() => remove(w.id)}>削除</button>
          </div>
        ))}
      </div>
    </section>
  );
}
