import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

const API_URL = "https://newdigital-wallet.onrender.com";

const CATEGORY_COLORS = {
  Food: "#2ECC71",
  Rent: "#1ABC9C",
  Travel: "#48CAE4",
  Utilities: "#0096C7",
  Entertainment: "#00B4D8",
  Healthcare: "#90E0EF",
  Salary: "#52B788",
  Other: "#74C69D",
};

/* ─── tiny helpers ─── */
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : 0);

/* ─── STYLES ─── */
const injectStyles = () => {
  if (document.getElementById("dw-styles")) return;
  const el = document.createElement("style");
  el.id = "dw-styles";
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --sea: #0077B6;
      --sea-light: #0096C7;
      --sea-glow: #00B4D8;
      --foam: #90E0EF;
      --sand: #F8F5EE;
      --sand-dark: #EDE8DC;
      --kelp: #2D6A4F;
      --kelp-mid: #40916C;
      --kelp-light: #52B788;
      --kelp-pale: #B7E4C7;
      --mint: #D8F3DC;
      --tide: #CAF0F8;
      --white: #FFFFFF;
      --ink: #0D2137;
      --ink-muted: #3D5A73;
      --danger: #E63946;
      --warn: #F4A261;
      --radius: 20px;
      --radius-sm: 12px;
      --shadow: 0 8px 32px rgba(0,119,182,0.12);
      --shadow-lg: 0 20px 60px rgba(0,119,182,0.18);
      --glow: 0 0 24px rgba(0,180,216,0.25);
    }

    body { background: var(--sand); font-family: 'DM Sans', sans-serif; color: var(--ink); }

    /* ── NAVBAR ── */
    .dw-nav {
      position: sticky; top: 0; z-index: 100;
      background: linear-gradient(135deg, var(--kelp) 0%, var(--sea) 100%);
      padding: 0 32px;
      display: flex; align-items: center; justify-content: space-between;
      height: 68px;
      box-shadow: 0 4px 24px rgba(0,119,182,0.3);
    }
    .dw-nav-brand {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem; font-weight: 700; color: var(--white);
      display: flex; align-items: center; gap: 10px;
      letter-spacing: -0.3px; text-decoration: none;
    }
    .dw-nav-wave {
      position: absolute; bottom: -18px; left: 0; right: 0;
      height: 20px; overflow: hidden; pointer-events: none;
    }
    .dw-nav-wave svg { width: 100%; height: 100%; }
    .dw-nav-actions { display: flex; gap: 12px; align-items: center; }
    .dw-badge-score {
      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
      border-radius: 999px; padding: 4px 14px;
      font-size: 0.8rem; font-weight: 600; color: var(--white);
      display: flex; align-items: center; gap: 6px;
    }
    .dw-btn-ghost {
      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
      color: var(--white); border-radius: 999px; padding: 6px 18px;
      font-size: 0.85rem; font-weight: 500; cursor: pointer;
      transition: all .2s; text-decoration: none;
    }
    .dw-btn-ghost:hover { background: rgba(255,255,255,0.28); color: var(--white); }

    /* ── LAYOUT ── */
    .dw-page { max-width: 1280px; margin: 0 auto; padding: 40px 24px 80px; }
    .dw-greeting { margin-bottom: 36px; }
    .dw-greeting h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2.2rem; font-weight: 700; color: var(--ink);
      line-height: 1.2;
    }
    .dw-greeting p { color: var(--ink-muted); font-size: 0.95rem; margin-top: 4px; }

    /* ── STAT CARDS ── */
    .dw-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 36px; }
    @media (max-width: 900px) { .dw-stats { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 520px) { .dw-stats { grid-template-columns: 1fr; } }

    .dw-stat {
      border-radius: var(--radius); padding: 28px 24px;
      position: relative; overflow: hidden;
      transition: transform .25s, box-shadow .25s;
    }
    .dw-stat:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    .dw-stat-ocean  { background: linear-gradient(135deg, var(--sea) 0%, var(--sea-glow) 100%); color: var(--white); }
    .dw-stat-kelp   { background: linear-gradient(135deg, var(--kelp) 0%, var(--kelp-light) 100%); color: var(--white); }
    .dw-stat-danger { background: linear-gradient(135deg, #C9455A 0%, var(--danger) 100%); color: var(--white); }
    .dw-stat-foam   { background: linear-gradient(135deg, #00838F 0%, #00BCD4 100%); color: var(--white); }
    .dw-stat-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; margin-bottom: 14px;
    }
    .dw-stat-label { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
    .dw-stat-value { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; margin: 4px 0 2px; }
    .dw-stat-sub { font-size: 0.78rem; opacity: 0.75; }
    .dw-stat-blob {
      position: absolute; right: -20px; bottom: -20px;
      width: 100px; height: 100px;
      background: rgba(255,255,255,0.1); border-radius: 50%;
    }

    /* ── QUICK ACTIONS ── */
    .dw-quick { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 36px; }
    .dw-quick-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 999px; border: none;
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; transition: all .2s;
    }
    .dw-quick-btn-primary { background: var(--kelp); color: var(--white); }
    .dw-quick-btn-primary:hover { background: var(--kelp-mid); transform: translateY(-1px); }
    .dw-quick-btn-sea { background: var(--sea); color: var(--white); }
    .dw-quick-btn-sea:hover { background: var(--sea-light); transform: translateY(-1px); }
    .dw-quick-btn-outline {
      background: var(--white); color: var(--kelp);
      border: 2px solid var(--kelp-pale);
    }
    .dw-quick-btn-outline:hover { background: var(--mint); }

    /* ── CARD ── */
    .dw-card {
      background: var(--white); border-radius: var(--radius);
      box-shadow: var(--shadow); overflow: hidden; margin-bottom: 28px;
    }
    .dw-card-header {
      padding: 20px 28px;
      border-bottom: 1px solid var(--sand-dark);
      display: flex; align-items: center; justify-content: space-between;
    }
    .dw-card-title {
      font-family: 'Playfair Display', serif; font-size: 1.15rem;
      font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 10px;
    }
    .dw-card-title span { font-size: 1.2rem; }
    .dw-card-body { padding: 24px 28px; }

    /* ── FORM ELEMENTS ── */
    .dw-label { font-size: 0.78rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.6px; color: var(--ink-muted); margin-bottom: 6px; display: block; }
    .dw-input {
      width: 100%; background: var(--sand); border: 1.5px solid var(--sand-dark);
      border-radius: var(--radius-sm); padding: 10px 14px;
      font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: var(--ink);
      transition: border-color .2s, box-shadow .2s;
      outline: none;
    }
    .dw-input:focus { border-color: var(--sea-light); box-shadow: 0 0 0 3px rgba(0,150,199,0.15); background: var(--white); }
    .dw-select { appearance: none; cursor: pointer; }
    .dw-row { display: grid; gap: 16px; }
    .dw-row-2 { grid-template-columns: 1fr 1fr; }
    .dw-row-3 { grid-template-columns: 1fr 1fr 1fr; }
    .dw-row-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
    .dw-row-auto { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    @media (max-width: 700px) { .dw-row-2,.dw-row-3,.dw-row-4,.dw-row-auto { grid-template-columns: 1fr; } }

    /* ── BUTTONS ── */
    .dw-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 22px; border: none; border-radius: var(--radius-sm);
      font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600;
      cursor: pointer; transition: all .2s; white-space: nowrap;
    }
    .dw-btn-sm { padding: 6px 14px; font-size: 0.8rem; }
    .dw-btn-primary { background: var(--kelp); color: var(--white); }
    .dw-btn-primary:hover { background: var(--kelp-mid); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(45,106,79,0.3); }
    .dw-btn-sea { background: var(--sea); color: var(--white); }
    .dw-btn-sea:hover { background: var(--sea-light); transform: translateY(-1px); }
    .dw-btn-warn { background: var(--warn); color: var(--white); }
    .dw-btn-warn:hover { background: #E08C4A; }
    .dw-btn-danger { background: var(--danger); color: var(--white); }
    .dw-btn-danger:hover { background: #C5313D; }
    .dw-btn-ghost2 { background: var(--sand); color: var(--ink-muted); }
    .dw-btn-ghost2:hover { background: var(--sand-dark); }
    .dw-btn-success { background: var(--kelp-light); color: var(--white); }
    .dw-btn-success:hover { background: var(--kelp-mid); }
    .dw-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }

    /* ── TOGGLE TYPE ── */
    .dw-type-toggle { display: flex; background: var(--sand); border-radius: var(--radius-sm); padding: 4px; gap: 4px; }
    .dw-type-opt {
      flex: 1; padding: 8px; border: none; border-radius: 8px;
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; transition: all .2s; color: var(--ink-muted); background: transparent;
    }
    .dw-type-opt.active-income { background: var(--kelp); color: var(--white); }
    .dw-type-opt.active-expense { background: var(--danger); color: var(--white); }

    /* ── SEARCH BAR ── */
    .dw-search-wrap { position: relative; margin-bottom: 20px; }
    .dw-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--ink-muted); font-size: 1rem; }
    .dw-search-input { width: 100%; padding: 12px 14px 12px 42px; }

    /* ── TABLE ── */
    .dw-table-wrap { overflow-x: auto; }
    .dw-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .dw-table thead tr { background: var(--sand); }
    .dw-table th { padding: 12px 16px; text-align: left; font-size: 0.72rem;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--ink-muted); }
    .dw-table td { padding: 13px 16px; border-bottom: 1px solid var(--sand-dark); vertical-align: middle; }
    .dw-table tbody tr:last-child td { border-bottom: none; }
    .dw-table tbody tr:hover { background: rgba(208, 240, 220, 0.25); }
    .dw-pill {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
    }
    .dw-pill-income { background: var(--mint); color: var(--kelp); }
    .dw-pill-expense { background: #FFE5E7; color: var(--danger); }
    .dw-pill-pending { background: #FFF3E0; color: #E65100; }
    .dw-pill-paid { background: var(--mint); color: var(--kelp); }

    /* ── CHALLENGE CARD ── */
    .dw-challenge {
      background: linear-gradient(135deg, var(--kelp) 0%, var(--sea) 100%);
      border-radius: var(--radius); padding: 28px;
      color: var(--white); position: relative; overflow: hidden;
    }
    .dw-challenge-pattern {
      position: absolute; top: -20px; right: -20px;
      width: 160px; height: 160px;
      background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
      border-radius: 50%;
    }
    .dw-challenge-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 1.2px;
      text-transform: uppercase; opacity: 0.7; margin-bottom: 8px; }
    .dw-challenge-title { font-family: 'Playfair Display', serif; font-size: 1.5rem;
      font-weight: 700; margin-bottom: 8px; line-height: 1.3; }
    .dw-challenge-sub { font-size: 0.85rem; opacity: 0.75; margin-bottom: 20px; }
    .dw-challenge-done {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.2); border-radius: 999px;
      padding: 6px 16px; font-size: 0.85rem; font-weight: 600;
    }
    .dw-btn-white {
      background: var(--white); color: var(--kelp);
      border: none; border-radius: 999px; padding: 10px 24px;
      font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 700;
      cursor: pointer; transition: all .2s;
    }
    .dw-btn-white:hover { background: var(--mint); transform: translateY(-1px); }
    .dw-btn-white:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ── SAVINGS GOAL ── */
    .dw-goal { background: var(--white); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); }
    .dw-goal-bar-track { background: var(--sand-dark); border-radius: 999px; height: 10px; overflow: hidden; margin: 10px 0 6px; }
    .dw-goal-bar-fill { height: 100%; border-radius: 999px;
      background: linear-gradient(90deg, var(--kelp-light), var(--sea-glow));
      transition: width 0.8s ease; }

    /* ── INSIGHTS GRID ── */
    .dw-insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 800px) { .dw-insights-grid { grid-template-columns: 1fr; } }

    /* ── CASHBACK ── */
    .dw-cashback-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(90deg, var(--kelp-pale), var(--tide));
      color: var(--kelp); border-radius: 999px;
      padding: 5px 14px; font-size: 0.8rem; font-weight: 700;
    }

    /* ── LEADERBOARD ── */
    .dw-lb-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--sand-dark); }
    .dw-lb-row:last-child { border-bottom: none; }
    .dw-lb-rank {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 800;
    }
    .dw-lb-r1 { background: linear-gradient(135deg, #FFD700, #FFA500); color: var(--white); }
    .dw-lb-r2 { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); color: var(--white); }
    .dw-lb-r3 { background: linear-gradient(135deg, #CD7F32, #A05A20); color: var(--white); }
    .dw-lb-rN { background: var(--sand-dark); color: var(--ink-muted); }
    .dw-lb-name { flex: 1; font-weight: 500; font-size: 0.9rem; }
    .dw-lb-pts { font-weight: 700; color: var(--kelp); font-size: 0.9rem; }

    /* ── TREND LINE ── */
    .dw-trend { background: var(--white); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); margin-bottom: 28px; }

    /* ── SECTION HEADER ── */
    .dw-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .dw-section-title { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700; color: var(--ink); }
    .dw-section-sub { font-size: 0.82rem; color: var(--ink-muted); }

    /* ── TOAST ── */
    .dw-toast-container { position: fixed; bottom: 30px; right: 30px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
    .dw-toast {
      background: var(--ink); color: var(--white); border-radius: 12px;
      padding: 14px 20px; font-size: 0.85rem; font-weight: 500;
      box-shadow: var(--shadow-lg); animation: toast-in 0.3s ease;
      max-width: 300px;
    }
    .dw-toast-success { background: var(--kelp); }
    .dw-toast-error { background: var(--danger); }
    @keyframes toast-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

    /* ── EMPTY STATE ── */
    .dw-empty { text-align: center; padding: 40px 20px; color: var(--ink-muted); }
    .dw-empty-icon { font-size: 2.5rem; margin-bottom: 10px; }
    .dw-empty p { font-size: 0.9rem; }

    /* ── NET WORTH METER ── */
    .dw-meter-ring {
      width: 140px; height: 140px; position: relative;
      margin: 0 auto 12px;
    }
    .dw-meter-svg { transform: rotate(-90deg); }
    .dw-meter-track { fill: none; stroke: var(--sand-dark); stroke-width: 10; }
    .dw-meter-fill { fill: none; stroke-width: 10; stroke-linecap: round;
      stroke: url(#meterGrad); transition: stroke-dashoffset 0.8s ease; }
    .dw-meter-label {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      text-align: center;
    }
    .dw-meter-pct { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: var(--kelp); }
    .dw-meter-sub { font-size: 0.68rem; color: var(--ink-muted); font-weight: 600; text-transform: uppercase; }

    .dw-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 800px) { .dw-split-grid { grid-template-columns: 1fr; } }

    .dw-field { margin-bottom: 0; }
    .dw-checkbox-row { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; font-size: 0.88rem; }
    .dw-checkbox-row input { accent-color: var(--kelp); width: 16px; height: 16px; cursor: pointer; }

    .dw-note-tag {
      display: inline-block; padding: 2px 8px;
      background: var(--tide); color: var(--sea); border-radius: 6px;
      font-size: 0.75rem; font-weight: 500;
    }

    .dw-load-more { display: block; width: 100%; padding: 12px; text-align: center;
      background: var(--sand); border: none; border-radius: var(--radius-sm);
      font-family: 'DM Sans', sans-serif; font-weight: 600; color: var(--ink-muted);
      cursor: pointer; transition: all .2s; margin-top: 8px; }
    .dw-load-more:hover { background: var(--sand-dark); }

    /* ── BUDGET TRACKER ── */
    .dw-budget-row { display: flex; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--sand-dark); }
    .dw-budget-row:last-child { border-bottom: none; }
    .dw-budget-cat { width: 90px; font-size: 0.82rem; font-weight: 600; color: var(--ink-muted); }
    .dw-budget-bar-track { flex: 1; background: var(--sand-dark); border-radius: 999px; height: 8px; overflow: hidden; }
    .dw-budget-bar-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
    .dw-budget-amt { font-size: 0.8rem; font-weight: 700; color: var(--ink); min-width: 60px; text-align: right; }

    .dw-tabs { display: flex; gap: 4px; background: var(--sand); border-radius: var(--radius-sm); padding: 4px; margin-bottom: 20px; }
    .dw-tab {
      flex: 1; padding: 8px; border: none; border-radius: 8px;
      font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; color: var(--ink-muted); background: transparent; transition: all .2s;
    }
    .dw-tab.active { background: var(--white); color: var(--kelp); box-shadow: var(--shadow); }

    .dw-shimmer {
      background: linear-gradient(90deg, var(--sand) 25%, var(--sand-dark) 50%, var(--sand) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 8px;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* ── TOP BILL ALERT ── */
    .dw-bill-alert {
      background: linear-gradient(90deg, #FFF3E0, #FFF8EC);
      border-left: 4px solid var(--warn);
      border-radius: var(--radius-sm); padding: 14px 18px;
      margin-bottom: 14px; display: flex; align-items: center; gap: 12px;
    }
    .dw-bill-alert-icon { font-size: 1.3rem; }
    .dw-bill-alert-text { flex: 1; }
    .dw-bill-alert-title { font-weight: 700; font-size: 0.88rem; color: #7C4300; }
    .dw-bill-alert-sub { font-size: 0.78rem; color: #A05A00; }
  `;
  document.head.appendChild(el);
};

/* ─── TOAST ─── */
let toastId = 0;
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "success") => {
    const id = ++toastId;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);
  return { toasts, show };
};

/* ─── SAVINGS GOAL (demo) ─── */
const GOAL = { label: "Emergency Fund", target: 50000, current: 22400 };

/* ─── BUDGET LIMITS (demo) ─── */
const BUDGETS = {
  Food: 8000, Rent: 20000, Travel: 5000, Utilities: 3000, Entertainment: 4000,
};

/* ── METER ── */
const SavingsMeter = ({ pctValue }) => {
  const r = 60, circ = 2 * Math.PI * r;
  const offset = circ - (pctValue / 100) * circ;
  return (
    <div className="dw-meter-ring">
      <svg className="dw-meter-svg" width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#52B788" />
            <stop offset="100%" stopColor="#00B4D8" />
          </linearGradient>
        </defs>
        <circle className="dw-meter-track" cx="70" cy="70" r={r} />
        <circle className="dw-meter-fill" cx="70" cy="70" r={r}
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="dw-meter-label">
        <div className="dw-meter-pct">{pctValue}%</div>
        <div className="dw-meter-sub">Savings</div>
      </div>
    </div>
  );
};

/* ─────────────────────────────── */
/*           DASHBOARD             */
/* ─────────────────────────────── */
const Dashboard = () => {
  useEffect(() => { injectStyles(); }, []);

  const { toasts, show: toast } = useToast();

  const [stats, setStats] = useState({ balance: 0, income: 0, expenses: 0, savings: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [newBill, setNewBill] = useState({ title: "", amount: "", dueDate: "", autoPay: false });
  const [challengeToday, setChallengeToday] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeCompleting, setChallengeCompleting] = useState(false);
  const [categoryStats, setCategoryStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [form, setForm] = useState({ type: "income", category: "", amount: "", date: "" });
  const [editId, setEditId] = useState(null);
  const [sendForm, setSendForm] = useState({ recipientEmail: "", amount: "", category: "", note: "" });
  const [sendLoading, setSendLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize] = useState(10);
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeSection, setActiveSection] = useState("overview");

  const token = localStorage.getItem("token");

  const fetchStats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/transactions/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats({ balance: data.balance||0, income: data.income||0, expenses: data.expenses||0, savings: data.savings||0 });
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTransactions(data);
    } catch (e) { console.error(e); }
  };

  const fetchUpcomingBills = async () => {
    if (!token) return;
    setBillsLoading(true);
    try {
      const res = await fetch(`${API_URL}/bills/upcoming?days=365`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUpcomingBills(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setBillsLoading(false); }
  };

  const addBill = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/bills`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body: JSON.stringify(newBill) });
      if (!res.ok) throw new Error("Failed to add bill");
      toast("Bill added successfully ✓");
      setNewBill({ title:"", amount:"", dueDate:"", autoPay:false });
      fetchUpcomingBills();
    } catch (e) { toast(e.message, "error"); }
  };

  const payBill = async (id) => {
    if (!token || !window.confirm("Pay this bill?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bills/${id}/pay`, { method:"PUT", headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to pay bill");
      toast("Bill paid successfully ✓");
      await Promise.all([fetchUpcomingBills(), fetchStats(), fetchTransactions(), fetchInsights()]);
    } catch (e) {
      toast(e.message?.toLowerCase().includes("insufficient") ? "⚠ Insufficient balance" : `Payment failed: ${e.message}`, "error");
    } finally { setLoading(false); }
  };

  const fetchTodayChallenge = async () => {
    if (!token) return;
    setChallengeLoading(true);
    try {
      const res = await fetch(`${API_URL}/challenges/today`, { headers:{ Authorization:`Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setChallengeToday(await res.json());
    } catch (e) { console.error(e); }
    finally { setChallengeLoading(false); }
  };

  const completeTodayChallenge = async () => {
    if (!token || !challengeToday) return;
    setChallengeCompleting(true);
    try {
      const res = await fetch(`${API_URL}/challenges/today/complete`, { method:"PUT", headers:{ Authorization:`Bearer ${token}` } });
      if (!res.ok) throw new Error();
      toast("Challenge completed! 🎉");
      await fetchTodayChallenge(); await fetchStats();
    } catch (e) { toast(e.message,"error"); }
    finally { setChallengeCompleting(false); }
  };

  const fetchInsights = async () => {
    if (!token) return;
    setInsightsLoading(true);
    try {
      const monthStr = new Date().toISOString().slice(0,7);
      const [catRes, lbRes] = await Promise.all([
        fetch(`${API_URL}/insights/category-stats?month=${monthStr}`, { headers:{ Authorization:`Bearer ${token}` } }),
        fetch(`${API_URL}/insights/leaderboard?months=6`, { headers:{ Authorization:`Bearer ${token}` } }),
      ]);
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.totals) {
          setCategoryStats(Object.entries(catData.totals).filter(([,v])=>v>0).map(([category,totalAmount])=>({
            category, totalAmount, color: CATEGORY_COLORS[category]||"#74C69D"
          })));
        }
      }
      if (lbRes.ok) { const lb = await lbRes.json(); setLeaderboard(lb.results||[]); }
    } catch (e) { console.error(e); }
    finally { setInsightsLoading(false); }
  };

  useEffect(() => {
    fetchStats(); fetchUpcomingBills(); fetchTodayChallenge(); fetchInsights(); fetchTransactions();
  // eslint-disable-next-line
  }, []);

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) { toast("Please provide category and amount.","error"); return; }
    const payload = { type:form.type, category:form.category, amount:Number(form.amount), date:form.date||new Date() };
    try {
      const url = editId ? `${API_URL}/transactions/${editId}` : `${API_URL}/transactions`;
      const res = await fetch(url, { method:editId?"PUT":"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed saving transaction");
      toast(editId ? "Transaction updated ✓" : "Transaction added ✓");
      setForm({ type:"income", category:"", amount:"", date:"" }); setEditId(null);
      await fetchStats();
    } catch (e) { toast(e.message,"error"); }
  };

  const startEdit = (t) => {
    setEditId(t._id);
    setForm({ type:t.type||"expense", category:t.category||"", amount:t.amount||"", date:t.date?t.date.slice(0,10):"" });
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const cancelEdit = () => { setEditId(null); setForm({ type:"income", category:"", amount:"", date:"" }); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      const res = await fetch(`${API_URL}/transactions/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
      if (!res.ok) throw new Error("Delete failed");
      toast("Transaction deleted");
      await fetchStats();
    } catch (e) { toast(e.message,"error"); }
  };

  const getEstimatedCashback = (amt) => { const a=Number(amt||0); if(a>=1000) return 150; if(a>=500) return 50; return 0; };

  const handleSend = async (e) => {
    e.preventDefault();
    const { recipientEmail, amount, category, note } = sendForm;
    if (!recipientEmail||!amount) { toast("Enter recipient email and amount.","error"); return; }
    setSendLoading(true);
    try {
      const res = await fetch(`${API_URL}/transactions/send`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify({ recipientEmail, amount:Number(amount), category, note }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message||"Send failed");
      toast(data.message || `Sent ₹${amount} to ${recipientEmail} ✓`);
      setSendForm({ recipientEmail:"", amount:"", category:"", note:"" });
      await fetchStats();
    } catch (e) { toast(e.message,"error"); }
    finally { setSendLoading(false); }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) => {
      const dateStr = new Date(t.date||t.createdAt||Date.now()).toLocaleString();
      return (t.category||"").toLowerCase().includes(q)||(t.type||"").toLowerCase().includes(q)||(t.amount||"").toString().includes(q)||dateStr.toLowerCase().includes(q);
    });
  }, [searchTerm, transactions]);

  const visible = filtered.slice(0, visibleCount);

  const pieData = useMemo(() => {
    if (!categoryStats||!Array.isArray(categoryStats)) return null;
    return {
      labels: categoryStats.map(c=>c.category),
      datasets:[{ label:"Amount", data:categoryStats.map(c=>c.totalAmount), backgroundColor:categoryStats.map(c=>c.color), borderWidth:2, borderColor:"#fff" }],
    };
  }, [categoryStats]);

  const savingsPct = stats.income > 0 ? Math.min(100, Math.round(pct(stats.savings, stats.income))) : 0;
  const goalPct = Math.min(100, Math.round((GOAL.current/GOAL.target)*100));

  // Budget usage from category stats
  const budgetUsage = useMemo(() => {
    if (!categoryStats) return [];
    return Object.entries(BUDGETS).map(([cat, limit]) => {
      const spent = (categoryStats.find(c=>c.category===cat)||{}).totalAmount||0;
      const p = Math.min(100, Math.round((spent/limit)*100));
      const color = p>85?"#E63946":p>60?"#F4A261":"#52B788";
      return { cat, spent, limit, p, color };
    });
  }, [categoryStats]);

  // Trend data (mock months, replace with API)
  const trendData = {
    labels: ["Dec","Jan","Feb","Mar","Apr","May"],
    datasets: [
      { label:"Income", data:[42000,38000,51000,47000,55000,stats.income||0], fill:true,
        backgroundColor:"rgba(82,183,136,0.1)", borderColor:"#52B788", tension:0.4, pointRadius:4, pointBackgroundColor:"#52B788" },
      { label:"Expenses", data:[28000,31000,29000,35000,38000,stats.expenses||0], fill:true,
        backgroundColor:"rgba(230,57,70,0.08)", borderColor:"#E63946", tension:0.4, pointRadius:4, pointBackgroundColor:"#E63946" },
    ],
  };
  const trendOptions = {
    responsive:true, plugins:{ legend:{ position:"bottom" }, tooltip:{ mode:"index", intersect:false } },
    scales:{ y:{ ticks:{ callback:(v)=>`₹${(v/1000).toFixed(0)}k` }, grid:{ color:"#EDE8DC" } }, x:{ grid:{ display:false } } },
  };

  const overdueBills = upcomingBills.filter(b=>b.status!=="paid"&&new Date(b.dueDate)<new Date());

  const navTabs = [
    { id:"overview", label:"Overview", icon:"🏠" },
    { id:"transactions", label:"Transactions", icon:"💳" },
    { id:"bills", label:"Bills", icon:"📋" },
    { id:"send", label:"Send Money", icon:"💸" },
    { id:"insights", label:"Insights", icon:"📊" },
  ];

  return (
    <>
      {/* Inject Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />

      {/* NAVBAR */}
      <nav className="dw-nav" style={{ position:"relative" }}>
        <Link to="/" className="dw-nav-brand">
          <span>💰</span> Digital Wallet Tracker
        </Link>
        <div className="dw-nav-actions">
          <div className="dw-badge-score">🏆 {leaderboard?.length ? leaderboard[0]?.points || 0 : 0} pts</div>
          <Link to="/" className="dw-btn-ghost">Logout</Link>
        </div>
        <div className="dw-nav-wave">
          <svg viewBox="0 0 1200 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,10 C200,20 400,0 600,10 C800,20 1000,0 1200,10 L1200,20 L0,20 Z" fill="#F8F5EE" />
          </svg>
        </div>
      </nav>

      <div className="dw-page">
        {/* Greeting */}
        <div className="dw-greeting">
          <h1>Good {new Date().getHours()<12?"Morning":new Date().getHours()<18?"Afternoon":"Evening"} 👋</h1>
          <p>Here's your financial snapshot for today — {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</p>
        </div>

        {/* STAT CARDS */}
        <div className="dw-stats">
          {[
            { cls:"dw-stat-ocean", icon:"💰", label:"Total Balance", value:fmt(stats.balance), sub:"Available funds" },
            { cls:"dw-stat-kelp",  icon:"📈", label:"Income",        value:fmt(stats.income),  sub:"This month" },
            { cls:"dw-stat-danger",icon:"📉", label:"Expenses",      value:fmt(stats.expenses),sub:`${pct(stats.expenses,stats.income)}% of income` },
            { cls:"dw-stat-foam",  icon:"🏦", label:"Savings",       value:fmt(stats.savings), sub:`${savingsPct}% savings rate` },
          ].map(({ cls, icon, label, value, sub }) => (
            <div key={label} className={`dw-stat ${cls}`}>
              <div className="dw-stat-icon">{icon}</div>
              <div className="dw-stat-label">{label}</div>
              <div className="dw-stat-value">{value}</div>
              <div className="dw-stat-sub">{sub}</div>
              <div className="dw-stat-blob" />
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="dw-quick">
          {navTabs.map(t=>(
            <button key={t.id} className={`dw-quick-btn ${activeSection===t.id?"dw-quick-btn-primary":"dw-quick-btn-outline"}`}
              onClick={()=>setActiveSection(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* OVERDUE BILL ALERT */}
        {overdueBills.length > 0 && (
          <div className="dw-bill-alert">
            <div className="dw-bill-alert-icon">⚠️</div>
            <div className="dw-bill-alert-text">
              <div className="dw-bill-alert-title">{overdueBills.length} overdue bill{overdueBills.length>1?"s":""}</div>
              <div className="dw-bill-alert-sub">{overdueBills.map(b=>b.title).join(", ")} — pay now to avoid penalties</div>
            </div>
            <button className="dw-btn dw-btn-warn dw-btn-sm" onClick={()=>setActiveSection("bills")}>View Bills</button>
          </div>
        )}

        {/* ══════════ OVERVIEW ══════════ */}
        {activeSection === "overview" && (
          <>
            {/* Trend Chart */}
            <div className="dw-trend">
              <div className="dw-section-header">
                <div>
                  <div className="dw-section-title">Income vs Expenses Trend</div>
                  <div className="dw-section-sub">Last 6 months</div>
                </div>
              </div>
              <Line data={trendData} options={trendOptions} />
            </div>

            <div className="dw-split-grid">
              {/* Savings Goal */}
              <div className="dw-goal">
                <div className="dw-section-header" style={{marginBottom:12}}>
                  <div className="dw-section-title" style={{fontSize:"1.05rem"}}>🎯 Savings Goal</div>
                  <span className="dw-cashback-pill">🌿 {goalPct}% done</span>
                </div>
                <SavingsMeter pctValue={goalPct} />
                <div style={{textAlign:"center",marginBottom:8}}>
                  <strong style={{fontFamily:"'Playfair Display',serif",fontSize:"1.1rem"}}>{fmt(GOAL.current)}</strong>
                  <span style={{color:"var(--ink-muted)",fontSize:"0.82rem"}}> / {fmt(GOAL.target)}</span>
                </div>
                <div className="dw-goal-bar-track"><div className="dw-goal-bar-fill" style={{width:`${goalPct}%`}} /></div>
                <div style={{fontSize:"0.78rem",color:"var(--ink-muted)",textAlign:"center"}}>{GOAL.label} · {fmt(GOAL.target-GOAL.current)} remaining</div>
              </div>

              {/* Today's Challenge */}
              <div>
                {challengeLoading ? (
                  <div className="dw-shimmer" style={{height:180}} />
                ) : challengeToday ? (
                  <div className="dw-challenge">
                    <div className="dw-challenge-pattern" />
                    <div className="dw-challenge-label">⚡ Daily Challenge</div>
                    <div className="dw-challenge-title">{challengeToday.challengeText}</div>
                    <div className="dw-challenge-sub">Complete it to earn bonus points!</div>
                    {challengeToday.completed
                      ? <div className="dw-challenge-done">✅ Completed today!</div>
                      : <button className="dw-btn-white" onClick={completeTodayChallenge} disabled={challengeCompleting}>
                          {challengeCompleting ? "Completing…" : "Mark Complete 🎯"}
                        </button>
                    }
                  </div>
                ) : (
                  <div className="dw-challenge"><div className="dw-challenge-title">No challenge today 🌊</div></div>
                )}
              </div>
            </div>

            {/* Budget Tracker */}
            {budgetUsage.length > 0 && (
              <div className="dw-card" style={{marginTop:24}}>
                <div className="dw-card-header">
                  <div className="dw-card-title"><span>💼</span> Monthly Budget Tracker</div>
                  <span style={{fontSize:"0.78rem",color:"var(--ink-muted)"}}>vs. spending limits</span>
                </div>
                <div className="dw-card-body">
                  {budgetUsage.map(({ cat, spent, limit, p, color }) => (
                    <div className="dw-budget-row" key={cat}>
                      <div className="dw-budget-cat">{cat}</div>
                      <div className="dw-budget-bar-track">
                        <div className="dw-budget-bar-fill" style={{width:`${p}%`, background:color}} />
                      </div>
                      <div className="dw-budget-amt" style={{color}}>{p}%</div>
                      <div style={{fontSize:"0.75rem",color:"var(--ink-muted)",minWidth:110,textAlign:"right"}}>
                        {fmt(spent)} / {fmt(limit)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════ TRANSACTIONS ══════════ */}
        {activeSection === "transactions" && (
          <>
            {/* Add / Edit */}
            <div className="dw-card">
              <div className="dw-card-header">
                <div className="dw-card-title"><span>{editId?"✏️":"➕"}</span> {editId?"Edit":"Add"} Transaction</div>
                {editId && <button className="dw-btn dw-btn-ghost2 dw-btn-sm" onClick={cancelEdit}>Cancel</button>}
              </div>
              <div className="dw-card-body">
                <form onSubmit={handleAddOrUpdate}>
                  <div style={{marginBottom:16}}>
                    <label className="dw-label">Transaction Type</label>
                    <div className="dw-type-toggle">
                      <button type="button" className={`dw-type-opt ${form.type==="income"?"active-income":""}`}
                        onClick={()=>setForm({...form,type:"income"})}>📈 Income</button>
                      <button type="button" className={`dw-type-opt ${form.type==="expense"?"active-expense":""}`}
                        onClick={()=>setForm({...form,type:"expense"})}>📉 Expense</button>
                    </div>
                  </div>
                  <div className="dw-row dw-row-3" style={{marginBottom:16}}>
                    <div className="dw-field">
                      <label className="dw-label">Category</label>
                      <input className="dw-input" value={form.category}
                        onChange={e=>setForm({...form,category:e.target.value})}
                        placeholder="e.g. Salary, Food, Rent" required />
                    </div>
                    <div className="dw-field">
                      <label className="dw-label">Amount (₹)</label>
                      <input type="number" className="dw-input" value={form.amount}
                        onChange={e=>setForm({...form,amount:e.target.value})} min="0" step="0.01" required />
                    </div>
                    <div className="dw-field">
                      <label className="dw-label">Date</label>
                      <input type="date" className="dw-input" value={form.date}
                        onChange={e=>setForm({...form,date:e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="dw-btn dw-btn-primary">{editId?"Update Transaction":"Add Transaction"}</button>
                </form>
              </div>
            </div>

            {/* Search + list */}
            <div className="dw-search-wrap">
              <span className="dw-search-icon">🔍</span>
              <input className="dw-input dw-search-input" placeholder="Search by category, type, amount or date…"
                value={searchTerm} onChange={e=>{ setSearchTerm(e.target.value); setVisibleCount(10); }} />
            </div>

            <div className="dw-card">
              <div className="dw-card-header">
                <div className="dw-card-title"><span>💳</span> Transactions <span style={{fontSize:"0.75rem",background:"var(--mint)",color:"var(--kelp)",borderRadius:"999px",padding:"2px 10px",fontFamily:"DM Sans",fontWeight:700}}>{filtered.length}</span></div>
              </div>
              <div className="dw-card-body" style={{padding:"0 0 8px"}}>
                <div className="dw-table-wrap">
                  <table className="dw-table">
                    <thead>
                      <tr>
                        <th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.length === 0 && (
                        <tr><td colSpan="5"><div className="dw-empty"><div className="dw-empty-icon">🌊</div><p>No transactions found.</p></div></td></tr>
                      )}
                      {visible.map(t=>(
                        <tr key={t._id}>
                          <td style={{color:"var(--ink-muted)",fontSize:"0.82rem"}}>
                            {new Date(t.date||t.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                          </td>
                          <td><span className={`dw-pill ${t.type==="income"?"dw-pill-income":"dw-pill-expense"}`}>
                            {t.type==="income"?"▲":"▼"} {t.type}
                          </span></td>
                          <td style={{fontWeight:500}}>{t.category}</td>
                          <td style={{fontWeight:700,color:t.type==="income"?"var(--kelp)":"var(--danger)"}}>{fmt(t.amount)}</td>
                          <td>
                            <button className="dw-btn dw-btn-warn dw-btn-sm" style={{marginRight:6}} onClick={()=>startEdit(t)}>Edit</button>
                            <button className="dw-btn dw-btn-danger dw-btn-sm" onClick={()=>handleDelete(t._id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {visibleCount < filtered.length && (
                  <button className="dw-load-more" onClick={()=>setVisibleCount(v=>v+pageSize)}>Load more ↓</button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ══════════ BILLS ══════════ */}
        {activeSection === "bills" && (
          <>
            <div className="dw-card">
              <div className="dw-card-header"><div className="dw-card-title"><span>📋</span> Add Bill</div></div>
              <div className="dw-card-body">
                <form onSubmit={addBill}>
                  <div className="dw-row dw-row-auto" style={{marginBottom:16}}>
                    <div className="dw-field">
                      <label className="dw-label">Bill Title</label>
                      <input className="dw-input" placeholder="Electricity, Netflix…" value={newBill.title}
                        onChange={e=>setNewBill({...newBill,title:e.target.value})} required />
                    </div>
                    <div className="dw-field">
                      <label className="dw-label">Amount (₹)</label>
                      <input type="number" className="dw-input" value={newBill.amount}
                        onChange={e=>setNewBill({...newBill,amount:e.target.value})} required />
                    </div>
                    <div className="dw-field">
                      <label className="dw-label">Due Date</label>
                      <input type="date" className="dw-input" value={newBill.dueDate}
                        onChange={e=>setNewBill({...newBill,dueDate:e.target.value})} required />
                    </div>
                    <div className="dw-field" style={{display:"flex",alignItems:"flex-end",paddingBottom:1}}>
                      <label className="dw-checkbox-row">
                        <input type="checkbox" checked={newBill.autoPay}
                          onChange={e=>setNewBill({...newBill,autoPay:e.target.checked})} />
                        Enable Auto Pay
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="dw-btn dw-btn-primary">Add Bill</button>
                </form>
              </div>
            </div>

            <div className="dw-card">
              <div className="dw-card-header">
                <div className="dw-card-title"><span>🗓️</span> All Bills</div>
                <span style={{fontSize:"0.78rem",color:"var(--ink-muted)"}}>{upcomingBills.length} bills</span>
              </div>
              <div className="dw-card-body" style={{padding:"0 0 8px"}}>
                {billsLoading ? <div className="dw-shimmer" style={{height:120,margin:"20px 28px"}} /> :
                  upcomingBills.length === 0 ? (
                    <div className="dw-empty"><div className="dw-empty-icon">✅</div><p>No upcoming bills.</p></div>
                  ) : (
                    <div className="dw-table-wrap">
                      <table className="dw-table">
                        <thead><tr><th>Title</th><th>Amount</th><th>Due Date</th><th>Auto Pay</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                          {upcomingBills.map(bill=>{
                            const isOverdue = bill.status!=="paid" && new Date(bill.dueDate)<new Date();
                            return (
                              <tr key={bill._id}>
                                <td style={{fontWeight:600}}>{bill.title}</td>
                                <td style={{fontWeight:700,color:"var(--sea)"}}>{fmt(bill.amount)}</td>
                                <td style={{color:isOverdue?"var(--danger)":"var(--ink-muted)",fontSize:"0.85rem"}}>
                                  {new Date(bill.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                                  {isOverdue && <span style={{marginLeft:6,fontSize:"0.7rem",background:"#FFE5E7",color:"var(--danger)",padding:"1px 6px",borderRadius:4}}>OVERDUE</span>}
                                </td>
                                <td>{bill.autoPay ? <span style={{color:"var(--kelp)",fontWeight:600,fontSize:"0.82rem"}}>✓ On</span> : <span style={{color:"var(--ink-muted)",fontSize:"0.82rem"}}>Off</span>}</td>
                                <td><span className={`dw-pill ${bill.status==="paid"?"dw-pill-paid":"dw-pill-pending"}`}>{bill.status}</span></td>
                                <td>
                                  {bill.status!=="paid"
                                    ? <button className="dw-btn dw-btn-success dw-btn-sm" onClick={()=>payBill(bill._id)}>Pay Now</button>
                                    : <span style={{color:"var(--kelp)",fontSize:"0.82rem",fontWeight:600}}>✅ Paid</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>
            </div>
          </>
        )}

        {/* ══════════ SEND MONEY ══════════ */}
        {activeSection === "send" && (
          <div className="dw-card">
            <div className="dw-card-header"><div className="dw-card-title"><span>💸</span> Send Money</div></div>
            <div className="dw-card-body">
              <form onSubmit={handleSend}>
                <div className="dw-row dw-row-2" style={{marginBottom:16}}>
                  <div className="dw-field">
                    <label className="dw-label">Recipient Email</label>
                    <input type="email" className="dw-input" value={sendForm.recipientEmail}
                      onChange={e=>setSendForm({...sendForm,recipientEmail:e.target.value})} required placeholder="friend@email.com" />
                  </div>
                  <div className="dw-field">
                    <label className="dw-label">Amount (₹)</label>
                    <input type="number" className="dw-input" value={sendForm.amount}
                      onChange={e=>setSendForm({...sendForm,amount:e.target.value})} min="0" step="0.01" required />
                  </div>
                  <div className="dw-field">
                    <label className="dw-label">Category (optional)</label>
                    <input className="dw-input" value={sendForm.category}
                      onChange={e=>setSendForm({...sendForm,category:e.target.value})} placeholder="Food, Rent…" />
                  </div>
                  <div className="dw-field">
                    <label className="dw-label">Note (optional)</label>
                    <input className="dw-input" value={sendForm.note}
                      onChange={e=>setSendForm({...sendForm,note:e.target.value})} placeholder="e.g. Dinner split" />
                  </div>
                </div>
                {sendForm.amount && (
                  <div style={{marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{color:"var(--ink-muted)",fontSize:"0.85rem"}}>Estimated cashback:</span>
                    <span className="dw-cashback-pill">🎁 ₹{getEstimatedCashback(sendForm.amount)}</span>
                    {Number(sendForm.amount)>=1000 && <span style={{fontSize:"0.78rem",color:"var(--kelp)",fontWeight:600}}>🔥 Premium rate!</span>}
                  </div>
                )}
                <button type="submit" className="dw-btn dw-btn-sea" disabled={sendLoading}>
                  {sendLoading ? "Sending…" : "💸 Send Money"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══════════ INSIGHTS ══════════ */}
        {activeSection === "insights" && (
          <>
            {insightsLoading ? (
              <div className="dw-shimmer" style={{height:300}} />
            ) : (
              <div className="dw-insights-grid">
                {/* Pie */}
                <div className="dw-card">
                  <div className="dw-card-header"><div className="dw-card-title"><span>🥧</span> Spending by Category</div></div>
                  <div className="dw-card-body">
                    {pieData ? (
                      <div style={{maxWidth:280,margin:"0 auto"}}>
                        <Pie data={pieData} options={{ plugins:{ legend:{ position:"bottom", labels:{ font:{ family:"DM Sans" } } } } }} />
                      </div>
                    ) : <div className="dw-empty"><div className="dw-empty-icon">📊</div><p>No data yet.</p></div>}
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="dw-card">
                  <div className="dw-card-header"><div className="dw-card-title"><span>🏆</span> Savings Leaderboard</div></div>
                  <div className="dw-card-body">
                    {leaderboard && leaderboard.length > 0 ? (
                      leaderboard.map((entry,i)=>(
                        <div className="dw-lb-row" key={i}>
                          <div className={`dw-lb-rank ${i===0?"dw-lb-r1":i===1?"dw-lb-r2":i===2?"dw-lb-r3":"dw-lb-rN"}`}>{i+1}</div>
                          <div className="dw-lb-name">{entry.userName||entry.email||"User"}</div>
                          <div className="dw-lb-pts">🌿 {entry.points} pts</div>
                        </div>
                      ))
                    ) : <div className="dw-empty"><div className="dw-empty-icon">🌊</div><p>No leaderboard data yet.</p></div>}
                  </div>
                </div>
              </div>
            )}

            {/* Category breakdown table */}
            {categoryStats && categoryStats.length > 0 && (
              <div className="dw-card" style={{marginTop:24}}>
                <div className="dw-card-header"><div className="dw-card-title"><span>📋</span> Category Breakdown</div></div>
                <div className="dw-card-body" style={{padding:"0 0 8px"}}>
                  <div className="dw-table-wrap">
                    <table className="dw-table">
                      <thead><tr><th>Category</th><th>Spent</th><th>Share</th></tr></thead>
                      <tbody>
                        {categoryStats.sort((a,b)=>b.totalAmount-a.totalAmount).map(c=>{
                          const total = categoryStats.reduce((s,x)=>s+x.totalAmount,0);
                          return (
                            <tr key={c.category}>
                              <td style={{display:"flex",alignItems:"center",gap:8}}>
                                <span style={{width:10,height:10,borderRadius:"50%",background:c.color,display:"inline-block"}} />
                                {c.category}
                              </td>
                              <td style={{fontWeight:700}}>{fmt(c.totalAmount)}</td>
                              <td>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <div style={{flex:1,height:6,background:"var(--sand-dark)",borderRadius:999,overflow:"hidden"}}>
                                    <div style={{width:`${pct(c.totalAmount,total)}%`,height:"100%",background:c.color,borderRadius:999}} />
                                  </div>
                                  <span style={{fontSize:"0.78rem",color:"var(--ink-muted)",minWidth:36}}>{pct(c.totalAmount,total)}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* TOAST */}
      <div className="dw-toast-container">
        {toasts.map(t=>(
          <div key={t.id} className={`dw-toast dw-toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
};

export default Dashboard;
