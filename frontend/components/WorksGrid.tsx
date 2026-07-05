"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Work } from "@/lib/api";

export default function WorksGrid({
  works, categories, withFilter = false,
}: { works: Work[]; categories?: string[]; withFilter?: boolean }) {
  const [active, setActive] = useState("すべて");
  const [modal, setModal] = useState<Work | null>(null);

  const shown = active === "すべて" ? works : works.filter((w) => w.category === active);

  return (
    <>
      {withFilter && categories && (
        <div className="works-filter">
          {["すべて", ...categories].map((c) => (
            <button
              key={c}
              className={`filter-btn ${active === c ? "active" : ""}`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="works-grid">
        {shown.map((w) => (
          <div key={w.id} className="work-card" onClick={() => setModal(w)}>
            <div className="thumb"><img src={w.image} alt={w.title} loading="lazy" /></div>
            <div className="body">
              <span className="cat">{w.category}</span>
              <h3>{w.title}</h3>
              <p>{w.description.split("\n")[0]}</p>
            </div>
          </div>
        ))}
        {shown.length === 0 && (
          <p style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--text-light)" }}>
            このカテゴリの作品はまだありません。
          </p>
        )}
      </div>

      {/* .section .container(z-index:2)の重なりコンテキストに閉じ込められると
          ヘッダー(z-index:100)より下になるため、body 直下に描画する */}
      {modal && createPortal(
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <img src={modal.image} alt={modal.title} />
            <div className="modal-body">
              <span className="cat">{modal.category}</span>
              <h3>{modal.title}</h3>
              <p>{modal.description}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
