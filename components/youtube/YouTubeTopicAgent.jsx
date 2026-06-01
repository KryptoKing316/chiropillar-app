import { useState, useRef } from "react";

const CHANNEL_PRESETS = {
  "Kingdom Broker": {
    niche: "AI + Business Brokerage / M&A",
    lane: "AI + Business and/or Marketing",
    avoid: "Motivational content, general life advice, generic business tips",
    audience: "Small business owners ($1M–$20M revenue), CPAs, attorneys, financial advisors considering exits or acquisitions",
  },
};

const PLACEHOLDER_COMPETITORS = `Creator: @aniksingal
Videos (Title | Views):
How I Made $10M with AI Automation | 312,000
ChatGPT for Business Owners | 89,000
My Morning Routine | 22,000
Top 5 Marketing Funnels 2024 | 18,500
AI Tools That Replace Employees | 248,000
How to Grow Email List Fast | 31,000
The Business Model I Wish I Started | 44,000

---
Creator: @garyvee
Videos (Title | Views):
AI Will Kill Most Businesses | 198,000
Stop Making Excuses | 55,000
How to Build a Personal Brand in 2024 | 77,000
AI Social Media Strategy for Small Business | 167,000
The Truth About Entrepreneurship | 48,000`;

export default function YouTubeTopicAgent() {
  const [step, setStep] = useState("input"); // input | analyzing | results
  const [competitorData, setCompetitorData] = useState("");
  const [channelLane, setChannelLane] = useState(CHANNEL_PRESETS["Kingdom Broker"].lane);
  const [channelAvoid, setChannelAvoid] = useState(CHANNEL_PRESETS["Kingdom Broker"].avoid);
  const [channelAudience, setChannelAudience] = useState(CHANNEL_PRESETS["Kingdom Broker"].audience);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [streamText, setStreamText] = useState("");
  const [activeTab, setActiveTab] = useState("topics");
  const abortRef = useRef(null);

  const analyze = async () => {
    if (!competitorData.trim()) {
      setError("Paste your competitor video data first.");
      return;
    }
    setError("");
    setStep("analyzing");
    setStreamText("");

    const systemPrompt = `You are an elite YouTube content strategist who applies a rigorous 3-criteria viral topic selection framework. 

You analyze competitor channel data to find outlier videos, validate cross-creator success, and filter for channel-specific fit.

Always respond ONLY with a valid JSON object — no preamble, no markdown fences, just the raw JSON.`;

    const userPrompt = `Apply the 3-criteria YouTube viral topic selection framework to this data.

## MY CHANNEL PROFILE
- Content Lane (what works): ${channelLane}
- What to AVOID: ${channelAvoid}
- Target Audience: ${channelAudience}

## COMPETITOR DATA
${competitorData}

## YOUR TASK

**Criteria 1 — Ideation (Outliers):**
For each creator, calculate their channel average views. Flag any video at 3x+ that average as an OUTLIER. List the outlier videos.

**Criteria 2 — Validation (Cross-Creator):**
Group outlier topics by theme. If the same topic/angle appeared as an outlier on 2+ channels, it's VALIDATED. Mark it as validated.

**Criteria 3 — Channel Fit:**
Filter validated (and strong single-outlier) topics through my channel lane. Keep only topics that genuinely fit "${channelLane}" for "${channelAudience}". Discard anything matching "${channelAvoid}".

## RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "outliers": [
    {
      "creator": "string",
      "title": "string", 
      "views": number,
      "channelAvg": number,
      "multiplier": number,
      "theme": "string"
    }
  ],
  "validatedTopics": [
    {
      "theme": "string",
      "supportingVideos": ["title1 (creator, Xk views)", "title2 (creator, Xk views)"],
      "creatorCount": number,
      "channelFit": true|false,
      "fitReason": "string"
    }
  ],
  "recommendedTitles": [
    {
      "title": "string",
      "hook": "string (the emotional/curiosity hook this hits)",
      "priority": "HIGH"|"MEDIUM",
      "basedOn": "string (which outlier(s) inspired this)",
      "whyItFits": "string"
    }
  ],
  "skippedTopics": [
    {
      "theme": "string",
      "reason": "string"
    }
  ],
  "strategistNote": "string (2-3 sentence summary of the biggest opportunity you see)"
}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.map(b => b.text || "").join("") || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      
      try {
        const parsed = JSON.parse(clean);
        setResults(parsed);
        setStep("results");
      } catch {
        setError("Parse error. Raw response: " + raw.slice(0, 200));
        setStep("input");
      }
    } catch (e) {
      setError("API error: " + e.message);
      setStep("input");
    }
  };

  const reset = () => {
    setStep("input");
    setResults(null);
    setStreamText("");
    setError("");
  };

  const priorityColor = (p) => p === "HIGH" ? "#f5a623" : "#7ecfb3";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e4d9",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e1e2e",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "#0d0d14",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "linear-gradient(135deg, #f5a623, #e8473f)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>▶</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.04em", color: "#f0ead8" }}>
            YOUTUBE TOPIC AGENT
          </div>
          <div style={{ fontSize: 11, color: "#666", letterSpacing: "0.08em", fontFamily: "monospace" }}>
            ANIK SINGAL'S 3-CRITERIA FRAMEWORK · POWERED BY CLAUDE
          </div>
        </div>
        {step === "results" && (
          <button onClick={reset} style={{
            marginLeft: "auto", background: "transparent",
            border: "1px solid #2a2a3e", color: "#888",
            padding: "6px 14px", borderRadius: 6, cursor: "pointer",
            fontSize: 12, fontFamily: "monospace", letterSpacing: "0.05em",
          }}>← NEW ANALYSIS</button>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* INPUT STEP */}
        {step === "input" && (
          <div>
            {/* Framework Explainer */}
            <div style={{
              background: "#0f0f1a",
              border: "1px solid #1e1e2e",
              borderRadius: 12, padding: "20px 24px", marginBottom: 28,
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16,
            }}>
              {[
                { n: "01", label: "IDEATION", desc: "Find 3x+ outliers across 15–20 competitor channels" },
                { n: "02", label: "VALIDATION", desc: "Confirm the topic worked for multiple creators" },
                { n: "03", label: "CHANNEL FIT", desc: "Filter for YOUR audience & content lane" },
              ].map(c => (
                <div key={c.n} style={{ borderLeft: "2px solid #f5a623", paddingLeft: 14 }}>
                  <div style={{ fontSize: 10, color: "#f5a623", fontFamily: "monospace", marginBottom: 4 }}>CRITERIA {c.n}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: "#f0ead8" }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>{c.desc}</div>
                </div>
              ))}
            </div>

            {/* Channel Profile */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#f5a623", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 12 }}>
                YOUR CHANNEL PROFILE
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4, fontFamily: "monospace" }}>CONTENT LANE (what works for you)</label>
                  <input value={channelLane} onChange={e => setChannelLane(e.target.value)} style={{
                    width: "100%", background: "#0f0f1a", border: "1px solid #2a2a3e",
                    color: "#e8e4d9", padding: "10px 14px", borderRadius: 8, fontSize: 13,
                    fontFamily: "inherit", boxSizing: "border-box",
                  }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4, fontFamily: "monospace" }}>TARGET AUDIENCE</label>
                  <input value={channelAudience} onChange={e => setChannelAudience(e.target.value)} style={{
                    width: "100%", background: "#0f0f1a", border: "1px solid #2a2a3e",
                    color: "#e8e4d9", padding: "10px 14px", borderRadius: 8, fontSize: 13,
                    fontFamily: "inherit", boxSizing: "border-box",
                  }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4, fontFamily: "monospace" }}>WHAT TO AVOID</label>
                  <input value={channelAvoid} onChange={e => setChannelAvoid(e.target.value)} style={{
                    width: "100%", background: "#0f0f1a", border: "1px solid #2a2a3e",
                    color: "#e8e4d9", padding: "10px 14px", borderRadius: 8, fontSize: 13,
                    fontFamily: "inherit", boxSizing: "border-box",
                  }} />
                </div>
              </div>
            </div>

            {/* Competitor Data Input */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: "#f5a623", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                  COMPETITOR CHANNEL DATA
                </label>
                <button onClick={() => setCompetitorData(PLACEHOLDER_COMPETITORS)} style={{
                  background: "transparent", border: "1px solid #2a2a3e", color: "#666",
                  padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 10,
                  fontFamily: "monospace",
                }}>LOAD EXAMPLE</button>
              </div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 8, lineHeight: 1.6 }}>
                Paste data from VidIQ or 1of10. Format: Creator name + video titles with view counts. 
                Separate creators with "---". Include 8–20 videos per creator.
              </div>
              <textarea
                value={competitorData}
                onChange={e => setCompetitorData(e.target.value)}
                placeholder={PLACEHOLDER_COMPETITORS}
                rows={12}
                style={{
                  width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3e",
                  color: "#c8c4b9", padding: "14px 16px", borderRadius: 10, fontSize: 12,
                  fontFamily: "monospace", lineHeight: 1.7, resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <div style={{ background: "#1a0a0a", border: "1px solid #4a1a1a", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#e87070" }}>
                {error}
              </div>
            )}

            <button onClick={analyze} style={{
              width: "100%", background: "linear-gradient(135deg, #f5a623, #e8473f)",
              border: "none", color: "#fff", padding: "16px", borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em",
              fontFamily: "'Georgia', serif",
            }}>
              RUN 3-CRITERIA ANALYSIS →
            </button>
          </div>
        )}

        {/* ANALYZING STEP */}
        {step === "analyzing" && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              border: "3px solid #1e1e2e", borderTopColor: "#f5a623",
              margin: "0 auto 24px",
              animation: "spin 1s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f0ead8", marginBottom: 8 }}>Analyzing Topics...</div>
            <div style={{ fontSize: 13, color: "#666" }}>Running all 3 criteria · Finding outliers · Checking channel fit</div>
          </div>
        )}

        {/* RESULTS STEP */}
        {step === "results" && results && (
          <div>
            {/* Strategist Note */}
            {results.strategistNote && (
              <div style={{
                background: "linear-gradient(135deg, #1a1408, #1a0e08)",
                border: "1px solid #3a2a10", borderRadius: 12,
                padding: "18px 22px", marginBottom: 24,
              }}>
                <div style={{ fontSize: 10, color: "#f5a623", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 8 }}>
                  STRATEGIST TAKE
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: "#d4c9a8" }}>{results.strategistNote}</div>
              </div>
            )}

            {/* Stats Bar */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24,
            }}>
              {[
                { label: "OUTLIERS FOUND", value: results.outliers?.length || 0 },
                { label: "VALIDATED TOPICS", value: results.validatedTopics?.filter(t => t.channelFit).length || 0 },
                { label: "RECOMMENDED TITLES", value: results.recommendedTitles?.length || 0 },
                { label: "TOPICS SKIPPED", value: results.skippedTopics?.length || 0 },
              ].map(s => (
                <div key={s.label} style={{
                  background: "#0f0f1a", border: "1px solid #1e1e2e",
                  borderRadius: 10, padding: "16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#f5a623", marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", letterSpacing: "0.08em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #1e1e2e", paddingBottom: 0 }}>
              {[
                { id: "topics", label: "🎯 RECOMMENDED TITLES" },
                { id: "outliers", label: "📈 OUTLIERS" },
                { id: "validated", label: "✅ VALIDATED" },
                { id: "skipped", label: "🚫 SKIPPED" },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  background: activeTab === t.id ? "#f5a623" : "transparent",
                  border: "none", color: activeTab === t.id ? "#0a0a0f" : "#666",
                  padding: "8px 14px", cursor: "pointer", fontSize: 11,
                  fontFamily: "monospace", letterSpacing: "0.06em", fontWeight: 700,
                  borderRadius: "6px 6px 0 0",
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Recommended Titles */}
            {activeTab === "topics" && (
              <div style={{ display: "grid", gap: 12 }}>
                {(results.recommendedTitles || []).map((t, i) => (
                  <div key={i} style={{
                    background: "#0f0f1a", border: "1px solid #2a2a3e",
                    borderRadius: 12, padding: "18px 20px",
                    borderLeft: `3px solid ${priorityColor(t.priority)}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f0ead8", lineHeight: 1.4, flex: 1, paddingRight: 12 }}>
                        {t.title}
                      </div>
                      <span style={{
                        background: t.priority === "HIGH" ? "#2a1800" : "#0a1a14",
                        color: priorityColor(t.priority), fontSize: 10,
                        padding: "3px 8px", borderRadius: 4, fontFamily: "monospace",
                        letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0,
                      }}>{t.priority}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", marginBottom: 3 }}>HOOK / ANGLE</div>
                        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>{t.hook}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", marginBottom: 3 }}>WHY IT FITS YOUR CHANNEL</div>
                        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>{t.whyItFits}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: "#555", fontFamily: "monospace" }}>
                      BASED ON → {t.basedOn}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Outliers */}
            {activeTab === "outliers" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2a3e" }}>
                      {["CREATOR", "VIDEO TITLE", "VIEWS", "CHANNEL AVG", "MULTIPLIER", "THEME"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#555", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.08em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(results.outliers || []).map((o, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1a1a2a" }}>
                        <td style={{ padding: "10px 12px", color: "#888", fontFamily: "monospace" }}>{o.creator}</td>
                        <td style={{ padding: "10px 12px", color: "#e8e4d9" }}>{o.title}</td>
                        <td style={{ padding: "10px 12px", color: "#7ecfb3", fontFamily: "monospace" }}>{(o.views / 1000).toFixed(0)}K</td>
                        <td style={{ padding: "10px 12px", color: "#666", fontFamily: "monospace" }}>{(o.channelAvg / 1000).toFixed(0)}K</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            color: o.multiplier >= 5 ? "#f5a623" : "#7ecfb3",
                            fontFamily: "monospace", fontWeight: 700,
                          }}>{o.multiplier?.toFixed(1)}x</span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#888", fontSize: 11 }}>{o.theme}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Validated Topics */}
            {activeTab === "validated" && (
              <div style={{ display: "grid", gap: 10 }}>
                {(results.validatedTopics || []).map((v, i) => (
                  <div key={i} style={{
                    background: "#0f0f1a", border: `1px solid ${v.channelFit ? "#1a3a1a" : "#2a2a3e"}`,
                    borderRadius: 10, padding: "16px 18px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#f0ead8" }}>{v.theme}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: "#888" }}>{v.creatorCount} CREATORS</span>
                        <span style={{
                          fontSize: 10, fontFamily: "monospace", padding: "2px 8px", borderRadius: 4,
                          background: v.channelFit ? "#0a2a0a" : "#2a0a0a",
                          color: v.channelFit ? "#7ecfb3" : "#e87070",
                        }}>{v.channelFit ? "✓ FITS YOUR LANE" : "✗ OFF-LANE"}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#777", marginBottom: 8 }}>{v.fitReason}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(v.supportingVideos || []).map((sv, j) => (
                        <span key={j} style={{
                          fontSize: 11, background: "#151520", border: "1px solid #252535",
                          borderRadius: 5, padding: "3px 8px", color: "#888",
                        }}>{sv}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skipped */}
            {activeTab === "skipped" && (
              <div style={{ display: "grid", gap: 8 }}>
                {(results.skippedTopics || []).map((s, i) => (
                  <div key={i} style={{
                    background: "#0f0f1a", border: "1px solid #2a2020",
                    borderRadius: 8, padding: "12px 16px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div style={{ fontSize: 13, color: "#888" }}>{s.theme}</div>
                    <div style={{ fontSize: 12, color: "#5a4040", maxWidth: "60%", textAlign: "right" }}>{s.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
