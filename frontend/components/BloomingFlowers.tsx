"use client";

/* 背景の開花アニメーション。花が画面に入ったタイミングで花びらが1枚ずつ開く。
   花の位置・サイズ・タイミングは下の FLOWERS 配列で調整できます */

import { useEffect, useRef } from "react";

type Variant = "pink" | "blush" | "green";

type FlowerSpec = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;      // 花の直径(px)
  delay: number;     // 咲き始めるまでの秒数
  opacity: number;   // 咲き終わったときの濃さ
  variant: Variant;
  hideSm?: boolean;  // スマホでは非表示にする
};

const FLOWERS: FlowerSpec[] = [
  /* 最初の画面(vh = 画面の高さ基準。スクロールするとページと一緒に流れていく) */
  { top: "13vh", left: "3.5%", size: 92, delay: 0.2, opacity: 0.55, variant: "pink" },
  { top: "36vh", left: "7%", size: 44, delay: 1.3, opacity: 0.45, variant: "blush" },
  { top: "62vh", left: "3%", size: 64, delay: 0.8, opacity: 0.5, variant: "green", hideSm: true },
  { top: "10vh", right: "6%", size: 54, delay: 0.9, opacity: 0.5, variant: "blush" },
  { top: "40vh", right: "3%", size: 84, delay: 0.45, opacity: 0.55, variant: "pink" },
  { top: "70vh", right: "8.5%", size: 46, delay: 1.6, opacity: 0.5, variant: "green", hideSm: true },
  /* スクロールした先の花。delay は「画面に入ってから」咲き始めるまでの秒数 */
  { top: "110vh", right: "4%", size: 70, delay: 0.2, opacity: 0.5, variant: "blush" },
  { top: "135vh", left: "5%", size: 48, delay: 0.5, opacity: 0.45, variant: "pink", hideSm: true },
  { top: "175vh", left: "3%", size: 80, delay: 0.2, opacity: 0.55, variant: "pink" },
  { top: "200vh", right: "7%", size: 44, delay: 0.6, opacity: 0.45, variant: "green", hideSm: true },
  { top: "245vh", right: "3.5%", size: 64, delay: 0.3, opacity: 0.5, variant: "blush" },
  { top: "270vh", left: "8%", size: 40, delay: 0.6, opacity: 0.45, variant: "green", hideSm: true },
  { top: "315vh", left: "4%", size: 72, delay: 0.2, opacity: 0.5, variant: "blush" },
  { top: "340vh", right: "5%", size: 50, delay: 0.5, opacity: 0.45, variant: "pink", hideSm: true },
  { top: "385vh", right: "6%", size: 56, delay: 0.3, opacity: 0.45, variant: "green" },
  { top: "420vh", left: "5%", size: 46, delay: 0.6, opacity: 0.45, variant: "blush", hideSm: true },
  /* ページ最下部(フッター付近) */
  { bottom: "8vh", left: "9%", size: 38, delay: 0.5, opacity: 0.45, variant: "pink", hideSm: true },
  { bottom: "5vh", right: "4%", size: 60, delay: 0.2, opacity: 0.5, variant: "blush" },
];

const PALETTES: Record<Variant, { petal: string; petalAlt: string; core: string; dot: string }> = {
  pink:  { petal: "#d9a5b3", petalAlt: "#e4bcc7", core: "#ffffff", dot: "#7c9a72" },
  blush: { petal: "#e9c6d0", petalAlt: "#f2d9e0", core: "#ffffff", dot: "#a3bd97" },
  green: { petal: "#b7cdae", petalAlt: "#cdddc6", core: "#ffffff", dot: "#d9a5b3" },
};

// 中心(50,50)から上向きに伸びる花びら。rotate で5枚に増やす
const PETAL_PATH = "M50 50 C40 40 37 19 50 9 C63 19 60 40 50 50 Z";
const PETAL_ANGLES = [0, 72, 144, 216, 288];

function FlowerSvg({ variant }: { variant: Variant }) {
  const c = PALETTES[variant];
  return (
    <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
      {/* 葉(がく): 花びらより先にひらく */}
      {[150, 210].map((angle, i) => (
        <path
          key={`leaf-${angle}`}
          className="petal"
          style={{ "--r": `${angle}deg`, "--i": i } as React.CSSProperties}
          d={PETAL_PATH}
          fill="#9db894"
          opacity={0.7}
        />
      ))}
      {/* 花びら: 1枚ずつ順番にひらく */}
      {PETAL_ANGLES.map((angle, i) => (
        <path
          key={`petal-${angle}`}
          className="petal"
          style={{ "--r": `${angle}deg`, "--i": i + 1 } as React.CSSProperties}
          d={PETAL_PATH}
          fill={i % 2 === 0 ? c.petal : c.petalAlt}
        />
      ))}
      {/* 花芯: 最後にふくらむ */}
      <g className="core">
        <circle cx="50" cy="50" r="9" fill={c.core} />
        <circle cx="50" cy="50" r="4" fill={c.dot} />
      </g>
    </svg>
  );
}

export default function BloomingFlowers() {
  const layerRef = useRef<HTMLDivElement>(null);

  /* 花が画面に3割ほど入ったら in-view を付けて開花スタート(一度咲いたらそのまま) */
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.3 }
    );
    layer.querySelectorAll(".bloom-flower").forEach((f) => observer.observe(f));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bloom-layer" aria-hidden="true" ref={layerRef}>
      {FLOWERS.map((f, i) => (
        <div
          key={i}
          className={`bloom-flower${f.hideSm ? " hide-sm" : ""}`}
          style={
            {
              top: f.top,
              bottom: f.bottom,
              left: f.left,
              right: f.right,
              "--size": `${f.size}px`,
              "--fd": `${f.delay}s`,
              "--op": f.opacity,
            } as React.CSSProperties
          }
        >
          <FlowerSvg variant={f.variant} />
        </div>
      ))}
    </div>
  );
}
