'use client'
import { useState } from "react";

// ─── constants ───────────────────────────────────────────────────────────────
const SBA_RATE = 0.105;
const SBA_TERM_MONTHS = 120;
const DOWN_PCT = 0.10;

function monthlyPayment(principal, annualRate, months) {
  const r = annualRate / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function fmt(n, decimals = 0) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(decimals === 0 ? 1 : decimals) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + Math.round(n).toLocaleString();
}

function fmtM(n) {
  return "$" + (n / 1_000_000).toFixed(1) + "M";
}

// ─── deal card ───────────────────────────────────────────────────────────────
function DealCard({ deal, highlight }) {
  const loan = deal.price * (1 - DOWN_PCT);
  const down = deal.price * DOWN_PCT;
  const ebitda = deal.revenue * deal.ebitdaPct;
  const moPmt = monthlyPayment(loan, SBA_RATE, SBA_TERM_MONTHS);
  const annualDS = moPmt * 12;
  const netAnnual = ebitda - annualDS;
  const netMonthly = netAnnual / 12;
  const dscr = ebitda / annualDS;
  const dscrColor = dscr >= 1.5 ? "#27500A" : dscr >= 1.25 ? "#854F0B" : "#791F1F";
  const dscrBg = dscr >= 1.5 ? "#EAF3DE" : dscr >= 1.25 ? "#FAEEDA" : "#FCEBEB";

  return (
    <div style={{
      background: "#fff",
      border: highlight ? "2px solid #1D9E75" : "1px solid #e2e2de",
      borderRadius: 12,
      padding: "1.25rem",
      flex: "1 1 260px",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#2C2C2A" }}>{deal.label}</div>
          <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{deal.desc}</div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
          background: highlight ? "#EAF3DE" : "#E6F1FB",
          color: highlight ? "#27500A" : "#0C447C"
        }}>
          {Math.round(deal.ebitdaPct * 100)}% EBITDA
        </span>
      </div>

      {[
        ["Revenue", fmt(deal.revenue), "#2C2C2A"],
        ["EBITDA (annual)", fmt(ebitda), "#185FA5"],
        ["EBITDA (monthly)", fmt(ebitda / 12), "#185FA5"],
        ["Purchase price", fmt(deal.price), "#2C2C2A"],
        ["Down payment (10%)", fmt(down), "#2C2C2A"],
        ["SBA loan amount", fmt(loan), "#2C2C2A"],
        ["Rate", "~10.5% (prime +2.75%)", "#2C2C2A"],
        ["Monthly debt service", "(" + fmt(moPmt) + ")", "#A32D2D"],
        ["Annual debt service", "(" + fmt(annualDS) + ")", "#A32D2D"],
        ["Net cash / year", fmt(netAnnual), netAnnual > 0 ? "#3B6D11" : "#A32D2D"],
        ["Net cash / month", fmt(netMonthly), netMonthly > 0 ? "#3B6D11" : "#A32D2D"],
      ].map(([label, val, color]) => (
        <div key={label} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "7px 0", borderBottom: "0.5px solid #e8e8e4", fontSize: 13
        }}>
          <span style={{ color: "#888780" }}>{label}</span>
          <span style={{ fontWeight: 600, color }}>{val}</span>
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
          <span style={{ color: "#888780" }}>DSCR</span>
          <span style={{ fontWeight: 600, color: dscrColor,  background: dscrBg, padding: "2px 8px", borderRadius: 10 }}>
            {dscr.toFixed(2)}x {dscr >= 1.5 ? "— strong" : dscr >= 1.25 ? "— clears min" : "— tight"}
          </span>
        </div>
        <div style={{ height: 6, background: "#f0efeb", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: Math.min(100, (dscr / 2.5) * 100) + "%", background: dscrColor, borderRadius: 3 }} />
        </div>
        <div style={{ fontSize: 11, color: "#888780", marginTop: 4 }}>SBA minimum: 1.25x</div>
      </div>
    </div>
  );
}

// ─── roll-up phase card ───────────────────────────────────────────────────────
function PhaseCard({ phase, isLast }) {
  const ebitdaNeeded50 = phase.portfolioRevenue * 0.20;
  const ebitdaNeeded50at30 = phase.portfolioRevenue * 0.30;

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
      <div style={{
        background: "#fff",
        border: phase.highlight ? "2px solid #185FA5" : "1px solid #e2e2de",
        borderRadius: 12,
        padding: "1rem 1.25rem",
        flex: 1,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", color: "#888780",
          textTransform: "uppercase", marginBottom: 4
        }}>
          {phase.label}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#2C2C2A", marginBottom: 10 }}>{phase.title}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[
            ["Portfolio revenue", fmtM(phase.portfolioRevenue)],
            ["# companies", phase.companies + " cos"],
            ["EBITDA @ 20%", fmtM(ebitdaNeeded50)],
            ["EBITDA @ 30%", fmtM(ebitdaNeeded50at30)],
            ["Valuation @ 4x", fmtM(ebitdaNeeded50 * 4)],
            ["Valuation @ 6x", fmtM(ebitdaNeeded50at30 * 6)],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ background: "#f7f7f5", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "#888780" }}>{lbl}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{
          fontSize: 12, color: "#5F5E5A", lineHeight: 1.6,
          borderTop: "0.5px solid #e8e8e4", paddingTop: 8
        }}>
          {phase.note}
        </div>
      </div>
      {!isLast && (
        <div style={{ display: "flex", alignItems: "center", color: "#B4B2A9", fontSize: 20, flexShrink: 0 }}>→</div>
      )}
    </div>
  );
}

// ─── targets table ────────────────────────────────────────────────────────────
function TargetsTable() {
  const rows = [
    { rev: 5,  cos: 1,  e20: 1.0,  e30: 1.5,  v4: 4.0,  v6: 9.0  },
    { rev: 10, cos: 2,  e20: 2.0,  e30: 3.0,  v4: 8.0,  v6: 18.0 },
    { rev: 20, cos: 4,  e20: 4.0,  e30: 6.0,  v4: 16.0, v6: 36.0 },
    { rev: 30, cos: 5,  e20: 6.0,  e30: 9.0,  v4: 24.0, v6: 54.0 },
    { rev: 40, cos: 7,  e20: 8.0,  e30: 12.0, v4: 32.0, v6: 72.0 },
    { rev: 50, cos: 8,  e20: 10.0, e30: 15.0, v4: 40.0, v6: 90.0 },
  ];

  const thStyle = {
    textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 700,
    color: "#fff", background: "#185FA5", whiteSpace: "nowrap"
  };
  const tdStyle = (highlight) => ({
    padding: "9px 12px", fontSize: 13, borderBottom: "0.5px solid #e8e8e4",
    color: highlight ? "#3B6D11" : "#2C2C2A", fontWeight: highlight ? 700 : 400,
    background: highlight ? "#f0f8ec" : "transparent"
  });

  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e2e2de", marginBottom: "1.5rem" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            {["Portfolio revenue", "# companies", "EBITDA @ 20%", "EBITDA @ 30%", "Value @ 4x (20%)", "Value @ 6x (30%)"].map((h, i) => (
              <th key={i} style={{ ...thStyle, borderRight: i < 5 ? "0.5px solid #378ADD" : "none" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const is50 = r.rev === 50;
            return (
              <tr key={i} style={{ background: is50 ? "#f0f8ec" : i % 2 === 0 ? "#fff" : "#fafaf8" }}>
                <td style={tdStyle(is50)}>${r.rev}M</td>
                <td style={tdStyle(false)}>{r.cos}</td>
                <td style={tdStyle(false)}>${r.e20}M</td>
                <td style={tdStyle(false)}>${r.e30}M</td>
                <td style={{ ...tdStyle(false), color: "#185FA5", fontWeight: 600 }}>${r.v4}M</td>
                <td style={{ ...tdStyle(is50), color: is50 ? "#27500A" : "#3B6D11", fontWeight: 700 }}>${r.v6}M</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── bar chart (pure CSS) ─────────────────────────────────────────────────────
function BarChart() {
  const years = [
    { label: "Yr 1", rev: 5,  e20: 1.0, e30: 1.5, ds: 0.73 },
    { label: "Yr 2", rev: 10, e20: 2.0, e30: 3.0, ds: 1.20 },
    { label: "Yr 3", rev: 20, e20: 4.0, e30: 6.0, ds: 2.10 },
    { label: "Yr 4", rev: 35, e20: 7.0, e30: 10.5, ds: 3.20 },
    { label: "Yr 5", rev: 50, e20: 10.0, e30: 15.0, ds: 4.50 },
  ];
  const max = 16;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: "#5F5E5A" }}>
        {[["#378ADD", "EBITDA @ 20%"], ["#1D9E75", "EBITDA @ 30%"], ["#E24B4A", "Debt service"]].map(([color, label]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
            {label}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 220 }}>
        {years.map((y) => (
          <div key={y.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 3, width: "100%" }}>
              {[
                [y.e20, "#378ADD"],
                [y.e30, "#1D9E75"],
                [y.ds,  "#E24B4A"],
              ].map(([val, color], i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                  <div style={{ fontSize: 10, color: "#5F5E5A", marginBottom: 2 }}>${val}M</div>
                  <div style={{
                    width: "100%", background: color, borderRadius: "3px 3px 0 0",
                    height: (val / max * 180) + "px"
                  }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#888780", marginTop: 4 }}>{y.label}</div>
            <div style={{ fontSize: 10, color: "#B4B2A9" }}>${y.rev}M rev</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function KingdomBrokerRollup() {
  const [ebitdaFilter, setEbitdaFilter] = useState("both");

  const deals = [
    {
      label: "$5M revenue · TX cash cow",
      desc: "HVAC, waste, manufacturing, essential services",
      revenue: 5_000_000,
      price: 5_000_000,
      ebitdaPct: 0.20,
    },
    {
      label: "$5M revenue · premium operator",
      desc: "Recurring contracts, lower labor dependency",
      revenue: 5_000_000,
      price: 5_000_000,
      ebitdaPct: 0.30,
    },
  ];

  const phases = [
    {
      label: "Phase 1 · Year 1",
      title: "Anchor acquisition",
      portfolioRevenue: 5_000_000,
      companies: 1,
      note: "Buy the TX cash cow via SBA 7(a). $500K down. Use Kingdom Broker off-market pipeline to source below 4x EBITDA. Day 1 cash flow funds operations.",
      highlight: false,
    },
    {
      label: "Phase 2 · Year 1–2",
      title: "First bolt-on",
      portfolioRevenue: 10_000_000,
      companies: 2,
      note: "Add a complementary vertical or competitor. Use anchor cash flow as equity contribution. EBITDA stacks. Buyer perceives a platform, not a single business.",
      highlight: false,
    },
    {
      label: "Phase 3 · Year 2–3",
      title: "Platform formation",
      portfolioRevenue: 20_000_000,
      companies: 4,
      note: "2–3 more bolt-ons. Centralize back-office. Shared ops, branding, and management layer. Multiple begins expanding from 4x toward 5–6x.",
      highlight: false,
    },
    {
      label: "Phase 4 · Year 3–4",
      title: "Scale to $35M",
      portfolioRevenue: 35_000_000,
      companies: 5,
      note: "Platform reaches PE-attractive size. Documented processes, diversified revenue, management team in place. Institutional buyers enter the conversation.",
      highlight: false,
    },
    {
      label: "Phase 5 · Year 4–5",
      title: "$50M portfolio exit",
      portfolioRevenue: 50_000_000,
      companies: 8,
      note: "At $50M revenue and 20–30% EBITDA, platform valuation ranges $40M–$90M at 4–6x. PE or strategic buyer. $500K in → potential $20M–$40M+ out.",
      highlight: true,
    },
  ];

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem", color: "#2C2C2A" }}>

      {/* header */}
      <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e2de" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#185FA5", margin: 0 }}>Kingdom Broker</h1>
            <p style={{ fontSize: 14, color: "#888780", margin: "4px 0 0", fontStyle: "italic" }}>
              Acquisition & Roll-Up Model · Bedford, Texas
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: "0.5px" }}>Target</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#3B6D11" }}>$50M portfolio</div>
          </div>
        </div>
      </div>

      {/* section 1 — deal analysis */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: "#888780", textTransform: "uppercase", marginBottom: "1rem" }}>
        SBA 7(a) deal analysis — $5M acquisition · $500K down · 10-year term
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "2rem" }}>
        {deals
          .filter(d => ebitdaFilter === "both" || (ebitdaFilter === "20" ? d.ebitdaPct === 0.20 : d.ebitdaPct === 0.30))
          .map((d, i) => (
            <DealCard key={i} deal={d} highlight={d.ebitdaPct === 0.30} />
          ))}
      </div>

      {/* key insight box */}
      <div style={{
        background: "#E6F1FB", border: "0.5px solid #B5D4F4", borderRadius: 10,
        padding: "1rem 1.25rem", marginBottom: "2rem", fontSize: 13, color: "#0C447C", lineHeight: 1.7
      }}>
        <strong>The 30% EBITDA deal is the one to hunt.</strong> At $64K/month net after debt service, the business funds its own bolt-on within 12–18 months — no outside capital needed. The 20% deal still clears underwriting at 1.37x DSCR but leaves less margin for error. Always verify EBITDA post-normalization; strip out owner add-backs before committing.
      </div>

      <div style={{ borderTop: "1px solid #e2e2de", margin: "2rem 0" }} />

      {/* section 2 — roll-up phases */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: "#888780", textTransform: "uppercase", marginBottom: "1rem" }}>
        Roll-up roadmap — anchor to $50M portfolio
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "2rem" }}>
        {phases.map((p, i) => (
          <PhaseCard key={i} phase={p} isLast={i === phases.length - 1} />
        ))}
      </div>

      <div style={{ borderTop: "1px solid #e2e2de", margin: "2rem 0" }} />

      {/* section 3 — targets table */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: "#888780", textTransform: "uppercase", marginBottom: "0.75rem" }}>
        What you need to hit $50M — EBITDA & valuation targets by revenue milestone
      </div>
      <p style={{ fontSize: 13, color: "#5F5E5A", marginBottom: "1rem", lineHeight: 1.6 }}>
        To reach a $50M portfolio valuation you need $50M in revenue at 20% EBITDA ($10M) sold at 4x — or $33M revenue at 30% EBITDA ($10M) sold at 5x. The green row is the minimum viable target.
      </p>
      <TargetsTable />

      {/* section 4 — bar chart */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: "#888780", textTransform: "uppercase", marginBottom: "1rem" }}>
        Cash flow build by year — EBITDA vs debt service as portfolio scales
      </div>
      <BarChart />

      {/* section 5 — multiple arbitrage */}
      <div style={{ borderTop: "1px solid #e2e2de", margin: "2rem 0" }} />
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: "#888780", textTransform: "uppercase", marginBottom: "1rem" }}>
        The multiple arbitrage thesis
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
        {[
          { label: "Entry multiple (off-market)", val: "3–4x", desc: "Single business, unsophisticated seller, sourced direct", color: "#E6F1FB", text: "#0C447C" },
          { label: "Exit multiple (platform)", val: "5–7x", desc: "Documented ops, diversified revenue, PE-ready", color: "#EAF3DE", text: "#27500A" },
          { label: "Multiple expansion", val: "+2–3x", desc: "Same cash flows. Different buyer psychology.", color: "#FAEEDA", text: "#633806" },
          { label: "$500K in → exit", val: "$20–40M+", desc: "At $50M portfolio, 20% EBITDA, 5x multiple", color: "#E1F5EE", text: "#085041" },
        ].map((c) => (
          <div key={c.label} style={{ background: c.color, borderRadius: 10, padding: "1rem" }}>
            <div style={{ fontSize: 11, color: c.text, opacity: 0.7, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>{c.val}</div>
            <div style={{ fontSize: 12, color: c.text, opacity: 0.8, lineHeight: 1.5 }}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* footer */}
      <div style={{ borderTop: "1px solid #e2e2de", paddingTop: "1rem", marginTop: "1rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#888780" }}>Kingdom Broker · Bedford, Texas · KingdomBroker.com</span>
        <span style={{ fontSize: 12, color: "#888780", fontStyle: "italic" }}>"Legacy first. Deal second." — Proverbs 13:22</span>
      </div>

    </div>
  );
}
