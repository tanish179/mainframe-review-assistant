import React, { useEffect, useState } from "react";
import {
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Star,
  Phone,
  Copy,
  Check,
  Sparkles,
  LogOut,
  RefreshCw,
  MessageCircle,
  QrCode,
  Printer,
  HelpCircle,
  LayoutDashboard,
  Inbox,
  FileText,
  Sliders,
  Calendar,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function Dashboard() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [authed, setAuthed] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDesk, setSelectedDesk] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const sendOtp = async () => {
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const d = await r.json();
      if (r.ok) setSent(true);
      else setErr(d.error || "Failed to send OTP");
    } catch {
      setErr("Network error");
    }
    setLoading(false);
  };

  const verify = async () => {
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const d = await r.json();
      if (r.ok) {
        localStorage.setItem("mf_token", d.token);
        setAuthed(true);
      } else {
        setErr(d.error || "Invalid OTP code");
      }
    } catch {
      setErr("Verification error");
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("mf_token");
    setAuthed(false);
    setSent(false);
    setOtp("");
    setPhone("");
  };

  const fetchData = () => {
    const token = localStorage.getItem("mf_token");
    if (!token) return;
    const headers = { Authorization: "Bearer " + token };
    fetch("/api/dashboard", { headers })
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews || []);
        setFeedback(d.feedback || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const t = localStorage.getItem("mf_token");
    if (t) setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) {
      fetchData();
    }
  }, [authed]);

  const suggestReply = async (i, text) => {
    setReplyLoading(i);
    try {
      const r = await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("mf_token"),
        },
        body: JSON.stringify({ review: text }),
      });
      const d = await r.json();
      setReviews((prev) =>
        prev.map((x, j) => (j === i ? { ...x, reply: d.reply } : x))
      );
      showToast("AI response drafted");
    } catch {
      showToast("Unable to generate reply");
    }
    setReplyLoading(null);
  };

  const copyReplyText = async (idx, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      showToast("Copied reply text");
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch {
      // safe fallback
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  // Auth gate
  if (!authed) {
    return (
      <div className="auth-viewport">
        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <div className="brand-icon">
              <Cpu size={20} strokeWidth={2.4} />
            </div>
            <div>
              <span className="auth-brand-title">MAINFRAME COMPUTERS</span>
              <span className="auth-brand-sub">Operations & Intelligence Portal</span>
            </div>
          </div>

          <div className="auth-body">
            <h1 className="auth-title">Sign in to console</h1>
            <p className="auth-desc">
              Track customer sentiment, resolve private feedback, and manage Google reputation in real time.
            </p>

            <div className="input-group">
              <label className="input-label">Authorized Phone Number</label>
              <input
                className="text-input"
                type="tel"
                placeholder="e.g. 9823064710"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={sent}
              />
            </div>

            {sent && (
              <div className="input-group animate-fade-in">
                <label className="input-label">Security OTP Code (Test default: 123456)</label>
                <input
                  className="text-input text-mono"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}

            {err && (
              <div className="recovery-banner">
                <p>{err}</p>
              </div>
            )}

            {!sent ? (
              <button
                type="button"
                className="btn-primary"
                disabled={!phone || loading}
                onClick={sendOtp}
              >
                <span>{loading ? "Sending OTP…" : "Send Verification Code"}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                disabled={!otp || loading}
                onClick={verify}
              >
                <span>{loading ? "Verifying…" : "Verify & Enter Console"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const positiveRate =
    reviews.length + feedback.length === 0
      ? 100
      : Math.round((reviews.length / (reviews.length + feedback.length)) * 100);

  return (
    <div className="dash-shell">
      {/* Precision Fixed Sidebar */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Cpu size={16} strokeWidth={2.4} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">MAINFRAME</span>
            <span className="sidebar-brand-badge">OPS · v2.0</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "feedback" ? "active" : ""}`}
            onClick={() => setActiveTab("feedback")}
          >
            <Inbox size={16} />
            <span>Customer Feedback</span>
            {feedback.length > 0 && (
              <span className="nav-badge alert-badge">{feedback.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            <FileText size={16} />
            <span>Review Drafts</span>
            <span className="nav-badge">{reviews.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "qr" ? "active" : ""}`}
            onClick={() => setActiveTab("qr")}
          >
            <QrCode size={16} />
            <span>Standee Generator</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Sliders size={16} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="store-meta-block">
            <span className="store-meta-label">STORE LOCATION</span>
            <span className="store-meta-val">Rajarampuri · Desk Hub</span>
          </div>

          <button
            type="button"
            className="dash-action danger-action"
            onClick={logout}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dash-body-wrap">
        {/* Top Header Bar */}
        <header className="dash-topbar">
          <div className="topbar-left">
            <div className="live-status-pill">
              <span className="pulse-dot"></span>
              <span>Console Online</span>
            </div>
            <span className="topbar-divider">/</span>
            <span className="topbar-route-title">
              {activeTab === "overview" && "Business overview"}
              {activeTab === "feedback" && "Customer feedback & recovery"}
              {activeTab === "reviews" && "Generated Google review drafts"}
              {activeTab === "qr" && "In-store QR standee generator"}
              {activeTab === "settings" && "Store configurations"}
            </span>
          </div>

          <div className="topbar-right">
            <div className="date-indicator">
              <Calendar size={13} />
              <span>Today · 2026</span>
            </div>
            <button
              type="button"
              className="dash-action"
              onClick={fetchData}
              title="Refresh records"
            >
              <RefreshCw size={13} />
              <span>Refresh Data</span>
            </button>
          </div>
        </header>

        {/* Tab 1: Business Overview */}
        {activeTab === "overview" && (
          <main className="dash-main animate-fade-in">
            <div className="dash-hero-title">
              <h1>Business overview</h1>
              <p>Key customer experience and retention indicators for Mainframe Computers.</p>
            </div>

            {/* Metrics Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">POSITIVE EXPERIENCE RATE</span>
                  <div className="stat-icon-wrap success">
                    <ShieldCheck size={16} />
                  </div>
                </div>
                <div className="stat-value">{positiveRate}%</div>
                <div className="stat-footnote">
                  <span>Protected Google rating floor</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">PRIVATE RECOVERY REQUESTS</span>
                  <div className="stat-icon-wrap warning">
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div className="stat-value">{feedback.length}</div>
                <div className="stat-footnote">
                  <span>Direct founder follow-ups needed</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">GOOGLE REVIEWS DRAFTED</span>
                  <div className="stat-icon-wrap accent">
                    <Star size={16} />
                  </div>
                </div>
                <div className="stat-value">{reviews.length}</div>
                <div className="stat-footnote">
                  <span>Generated customer review drafts</span>
                </div>
              </div>
            </div>

            {/* Activity Ratio Bar */}
            <div className="activity-panel">
              <div className="activity-panel-header">
                <div className="activity-heading">
                  <h3>Customer sentiment distribution</h3>
                  <p>Ratio of positive Google-routed visitors vs. direct private interventions.</p>
                </div>
                <div className="activity-legend">
                  <div className="legend-item">
                    <span className="legend-pip positive"></span>
                    <span>Satisfied ({reviews.length})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-pip recovery"></span>
                    <span>Intervention ({feedback.length})</span>
                  </div>
                </div>
              </div>

              <div className="distribution-bar">
                <div
                  className="distribution-seg seg-positive"
                  style={{ width: `${positiveRate}%` }}
                />
                <div
                  className="distribution-seg seg-recovery"
                  style={{ width: `${100 - positiveRate}%` }}
                />
              </div>
            </div>

            {/* Two-Column Overview Split */}
            <div className="overview-split-grid">
              {/* Recent Recovery Requests */}
              <div className="dash-pane">
                <div className="pane-header">
                  <div>
                    <h3>Recent recovery requests</h3>
                    <p>Customers requiring direct management outreach.</p>
                  </div>
                  <button
                    type="button"
                    className="pane-link"
                    onClick={() => setActiveTab("feedback")}
                  >
                    <span>View all</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>

                <div className="pane-content">
                  {feedback.length === 0 ? (
                    <div className="empty-state-box">
                      <Check size={20} className="empty-icon" />
                      <span className="empty-title">All customers satisfied</span>
                      <span className="empty-desc">No outstanding recovery interventions pending.</span>
                    </div>
                  ) : (
                    feedback.slice(0, 3).map((f, i) => (
                      <div key={i} className="record-item">
                        <div className="record-meta">
                          <span className="record-name">{f.name || "Customer"}</span>
                          <span className="record-contact">{f.phone || "No phone"}</span>
                        </div>
                        <p className="record-desc">“{f.message}”</p>
                        <div className="record-foot">
                          <span className="record-time">{formatDate(f.at)}</span>
                          {f.phone && (
                            <a
                              href={`https://wa.me/91${f.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                `Hi ${f.name || "there"}, this is the store manager at Mainframe Computers. Regarding your feedback: "${f.message}". We sincerely apologize and would like to resolve this for you.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="dash-action"
                            >
                              <MessageCircle size={13} />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Latest Review Drafts */}
              <div className="dash-pane">
                <div className="pane-header">
                  <div>
                    <h3>Latest review drafts</h3>
                    <p>Verified drafts generated at checkout desks.</p>
                  </div>
                  <button
                    type="button"
                    className="pane-link"
                    onClick={() => setActiveTab("reviews")}
                  >
                    <span>View all</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>

                <div className="pane-content">
                  {reviews.length === 0 ? (
                    <div className="empty-state-box">
                      <Star size={20} className="empty-icon" />
                      <span className="empty-title">No reviews drafted yet</span>
                      <span className="empty-desc">When customers scan the QR standee, drafts will show here.</span>
                    </div>
                  ) : (
                    reviews.slice(0, 3).map((v, i) => (
                      <div key={i} className="record-item">
                        <div className="record-meta">
                          <div className="stars-row">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <Star key={st} size={13} fill="currentColor" strokeWidth={0} />
                            ))}
                            <span className="stars-score">{v.rating || "5.0"}</span>
                          </div>
                          <span className="record-time">{formatDate(v.at)}</span>
                        </div>
                        <p className="record-desc">“{v.text}”</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Tab 2: Customer Feedback & Recovery */}
        {activeTab === "feedback" && (
          <main className="dash-main animate-fade-in">
            <div className="dash-hero-title">
              <h1>Customer feedback & recovery</h1>
              <p>Direct escalations from visitors who experienced issues. Prioritize and resolve to preserve reputation.</p>
            </div>

            {feedback.length === 0 ? (
              <div className="dash-pane" style={{ textAlign: "center", padding: "var(--space-3xl) var(--space-lg)" }}>
                <div className="empty-state-box">
                  <Check size={28} className="empty-icon" />
                  <span className="empty-title">Zero unsatisfied customers</span>
                  <span className="empty-desc">Every customer who rated today had an excellent experience.</span>
                </div>
              </div>
            ) : (
              <div className="dash-list-view">
                {feedback.map((f, i) => (
                  <div key={i} className="dash-card animate-fade-in">
                    <div className="dash-card-header">
                      <div className="dash-customer-meta">
                        <div className="customer-avatar">
                          {(f.name || "C")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="customer-name">{f.name || "Anonymous Customer"}</div>
                          <div className="customer-phone">{f.phone || "No phone provided"}</div>
                        </div>
                      </div>

                      <div className="dash-card-tags">
                        <span className="status-badge priority">Priority Attention</span>
                        {f.counter && (
                          <span className="counter-badge">Desk #{f.counter}</span>
                        )}
                        <span className="time-stamp">{formatDate(f.at)}</span>
                      </div>
                    </div>

                    <div className="customer-message-box">
                      “{f.message}”
                    </div>

                    {f.services && f.services.length > 0 && (
                      <div className="tags-row">
                        {f.services.map((s, idx) => (
                          <span key={idx} className="tab-count">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="card-actions">
                      {f.phone && (
                        <a
                          href={`https://wa.me/91${f.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hi ${f.name || "there"}, this is the store manager at Mainframe Computers. We saw your feedback regarding your recent visit: "${f.message}". We sincerely apologize and would like to invite you back for a complimentary re-check and resolve this for you.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="dash-action"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp Customer</span>
                        </a>
                      )}

                      {f.phone && (
                        <a
                          href={`tel:${f.phone}`}
                          className="dash-action"
                        >
                          <Phone size={14} />
                          <span>Call Directly</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* Tab 3: Generated Review Drafts */}
        {activeTab === "reviews" && (
          <main className="dash-main animate-fade-in">
            <div className="dash-hero-title">
              <h1>Review drafts</h1>
              <p>Authentic reviews drafted by customers and prepared for Google Maps submission.</p>
            </div>

            {reviews.length === 0 ? (
              <div className="dash-pane" style={{ textAlign: "center", padding: "var(--space-3xl) var(--space-lg)" }}>
                <div className="empty-state-box">
                  <Star size={28} className="empty-icon" />
                  <span className="empty-title">No reviews drafted yet</span>
                  <span className="empty-desc">Reviews generated at checkout will appear here in chronological order.</span>
                </div>
              </div>
            ) : (
              <div className="dash-list-view">
                {reviews.map((v, i) => (
                  <div key={i} className="dash-card animate-fade-in">
                    <div className="dash-card-header">
                      <div className="stars-row">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star key={st} size={15} fill="currentColor" strokeWidth={0} />
                        ))}
                        <span className="stars-score">{v.rating || "5.0 Rating"}</span>
                      </div>

                      <span className="time-stamp">{formatDate(v.at)}</span>
                    </div>

                    <p className="review-draft-text">
                      “{v.text}”
                    </p>

                    {v.services && v.services.length > 0 && (
                      <div className="tags-row">
                        {v.services.map((s, idx) => (
                          <span key={idx} className="tab-count">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {v.reply ? (
                      <div className="reply-preview-box">
                        <div className="reply-preview-top">
                          <span className="reply-badge-label">AI Business Reply Draft</span>
                          <button
                            type="button"
                            className="dash-action"
                            style={{ padding: "var(--space-3xs) var(--space-xs)" }}
                            onClick={() => copyReplyText(i, v.reply)}
                          >
                            {copiedIndex === i ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedIndex === i ? "Copied" : "Copy Reply"}</span>
                          </button>
                        </div>
                        <p>{v.reply}</p>
                      </div>
                    ) : (
                      <div style={{ marginTop: "var(--space-sm)" }}>
                        <button
                          type="button"
                          className="dash-action primary-action"
                          onClick={() => suggestReply(i, v.text)}
                          disabled={replyLoading === i}
                        >
                          <Sparkles size={14} />
                          <span>{replyLoading === i ? "Drafting with AI…" : "Draft Owner Reply"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* Tab 4: QR Standee Generator */}
        {activeTab === "qr" && (
          <main className="dash-main animate-fade-in">
            <div className="dash-hero-title">
              <h1>In-store QR standee generator</h1>
              <p>Printable physical counter signage engineered for rapid phone camera recognition on shop Wi-Fi.</p>
            </div>

            <div className="standee-workbench">
              {/* Controls */}
              <div className="standee-controls-pane">
                <h3 className="standee-controls-title">Select Counter Desk</h3>
                <p className="standee-controls-desc">
                  Select which desk or department this QR signage will sit on. Routing attaches the desk ID automatically.
                </p>

                <div className="desk-button-grid">
                  {[
                    { id: "", label: "General Service Desk" },
                    { id: "1", label: "Desk #1 · Laptop Repairs" },
                    { id: "2", label: "Desk #2 · Upgrades & SSD" },
                    { id: "3", label: "Desk #3 · CCTV & IT Solutions" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      className={`desk-picker-option ${selectedDesk === d.id ? "selected" : ""}`}
                      onClick={() => setSelectedDesk(d.id)}
                    >
                      <span className="desk-btn-name">{d.label}</span>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                </div>

                <div className="standee-url-card">
                  <span className="url-card-label">WI-FI LOCAL ENDPOINT</span>
                  <div className="qr-url-row">
                    <span className="url-text">
                      {`http://192.168.1.7:5173/${selectedDesk}`}
                    </span>
                    <button
                      type="button"
                      className="dash-action"
                      style={{ padding: "var(--space-3xs) var(--space-xs)", flexShrink: 0 }}
                      onClick={() => {
                        navigator.clipboard.writeText(`http://192.168.1.7:5173/${selectedDesk}`);
                        showToast("Copied Wi-Fi URL");
                      }}
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => window.print()}
                >
                  <Printer size={16} />
                  <span>Print In-Store Standee</span>
                </button>
              </div>

              {/* Physical Standee Layout Preview */}
              <div className="standee-preview-container">
                <div className="physical-standee-card">
                  <div className="standee-top-rule">
                    <span className="standee-brand-lead">MAINFRAME COMPUTERS</span>
                    <span className="standee-brand-code">EST. KOLHAPUR</span>
                  </div>

                  <h2 className="standee-main-head">Quick Service Review</h2>
                  <p className="standee-sub-head">
                    Scan with your phone camera to share your experience in under 20 seconds.
                  </p>

                  <div className="standee-qr-frame">
                    <QRCodeSVG
                      value={`http://192.168.1.7:5173/${selectedDesk}`}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div className="standee-footer-info">
                    <span className="standee-desk-name">
                      {selectedDesk ? `COUNTER DESK #${selectedDesk}` : "GENERAL REPAIR COUNTER"}
                    </span>
                    <span className="standee-tech-line">
                      Direct AI review drafting · 2nd Ln, Rajarampuri
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Tab 5: Settings */}
        {activeTab === "settings" && (
          <main className="dash-main animate-fade-in">
            <div className="dash-hero-title">
              <h1>Store configurations</h1>
              <p>Management parameters, Google Business Place ID, and local connectivity settings.</p>
            </div>

            <div className="settings-grid">
              <div className="settings-pane">
                <h3 className="settings-pane-title">Business identity</h3>
                <div className="settings-field">
                  <span className="field-label">Official Store Name</span>
                  <span className="field-val">MainFrame Computers</span>
                </div>
                <div className="settings-field">
                  <span className="field-label">Google Maps Place ID</span>
                  <span className="field-val text-mono">ChIJ7bbz-CwBwTsReJz4vKgjBtY</span>
                </div>
                <div className="settings-field">
                  <span className="field-label">Address</span>
                  <span className="field-val">2nd Ln, opp. Mahendra Jeweller, Rajarampuri, Kolhapur</span>
                </div>
                <div className="settings-field">
                  <span className="field-label">Founder Phone / WhatsApp</span>
                  <span className="field-val text-mono">+91 98230 64710</span>
                </div>
              </div>

              <div className="settings-pane">
                <h3 className="settings-pane-title">AI generation engine</h3>
                <div className="settings-field">
                  <span className="field-label">Active Engine</span>
                  <span className="field-val">Gemini 1.5 Flash / OpenRouter High-Speed</span>
                </div>
                <div className="settings-field">
                  <span className="field-label">Drafting Style</span>
                  <span className="field-val">Natural Customer Voice (Concise, authentic)</span>
                </div>
                <div className="settings-field">
                  <span className="field-label">Daily Rating Cooldown</span>
                  <span className="field-val">24 Hours (localStorage tokenized)</span>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Floating Notification */}
      {toast && (
        <div className="toast-msg">
          <Check size={15} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
