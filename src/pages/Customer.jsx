import React, { useState } from "react";
import { useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Laptop,
  Monitor,
  Cpu,
  ArrowUpCircle,
  HardDrive,
  Disc,
  Printer,
  Video,
  ShieldCheck,
  Network,
  Sparkles,
  Smile,
  Meh,
  Clock,
  Tag,
  HeartHandshake,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Star,
  Check,
  AlertCircle,
  RefreshCw,
  MapPin,
  MessageSquare,
  Phone,
  MessageCircle,
  Award,
  ThumbsUp,
  SlidersHorizontal,
  Lock
} from "lucide-react";

const SERVICES = [
  { label: "Laptop Repair", icon: Laptop },
  { label: "SSD Upgrade", icon: ArrowUpCircle },
  { label: "RAM Upgrade", icon: HardDrive },
  { label: "Software Installation", icon: Disc },
  { label: "Printer Repair", icon: Printer },
  { label: "CCTV Installation", icon: Video },
  { label: "Custom PC", icon: Monitor },
  { label: "Networking & Recovery", icon: Network },
];

const LIKED = [
  { label: "Fast service", icon: Clock },
  { label: "Honest advice", icon: HeartHandshake },
  { label: "Fair pricing", icon: Tag },
  { label: "Genuine parts", icon: CheckCircle2 },
  { label: "Professional support", icon: ThumbsUp },
  { label: "Warranty", icon: Award },
];

const RATINGS = [
  {
    key: "excellent",
    icon: Sparkles,
    title: "Excellent",
    subtitle: "Fast, smooth and highly satisfied",
    badge: "5.0 Rating",
    isPositive: true,
  },
  {
    key: "good",
    icon: Smile,
    title: "Good",
    subtitle: "Job completed well, helpful team",
    badge: "4.0 Rating",
    isPositive: true,
  },
  {
    key: "okay",
    icon: Meh,
    title: "Okay",
    subtitle: "Met basic needs, room to improve",
    badge: "Direct Attention",
    isPositive: false,
  },
  {
    key: "unsatisfied",
    icon: AlertCircle,
    title: "Unsatisfied",
    subtitle: "Encountered device or staff issues",
    badge: "Owner Priority",
    isPositive: false,
  },
];

const SHOP_PHONE = "+919823064710";
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJ7bbz-CwBwTsReJz4vKgjBtY";

export default function Customer() {
  const { counter } = useParams();
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState(null);
  const [services, setServices] = useState([]);
  const [liked, setLiked] = useState([]);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [fb, setFb] = useState({ name: "", phone: "", message: "" });
  const [fbSent, setFbSent] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const toggle = (arr, setArr, v) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const blocked = () => {
    const t = localStorage.getItem("mf_review_at");
    return t && Date.now() - Number(t) < 86400000;
  };

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.65 }
      });
    } catch {
      // safe fallback
    }
  };

  const genReview = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, services, liked, counter }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to generate review");
      setReview(d.review);
      localStorage.setItem("mf_review_at", String(Date.now()));
      setStep(4);
      fireConfetti();
    } catch (err) {
      setError(err.message || "Failed to generate");
    }
    setLoading(false);
  };

  const sendFeedback = async () => {
    if (!fb.message.trim()) return;
    setLoading(true);
    setError("");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fb, services, liked, counter, rating }),
      });
      setFbSent(true);
      showToast("Callback request received. Owner alerted.");
    } catch {
      setError("Unable to submit directly. Please call the shop.");
    }
    setLoading(false);
  };

  const copyAndOpen = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(review);
      } else {
        const el = document.createElement("textarea");
        el.value = review;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      showToast("Copied review. Opening Google…");
      fireConfetti();
    } catch {
      showToast("Opening Google Reviews…");
    }

    setTimeout(() => {
      window.location.href = GOOGLE_REVIEW_URL;
    }, 450);
  };

  // Progress ratio 0.0 to 1.0
  const getProgressRatio = () => {
    switch (step) {
      case 0: return 0.05;
      case 1: return 0.25;
      case 2: return 0.50;
      case 3: return 0.75;
      case 4: return 1.00;
      case 10: return 0.90;
      default: return 1.00;
    }
  };

  const handleRatingSelect = (item) => {
    setRating(item.title);
    if (!item.isPositive) {
      setStep(10);
    } else {
      setStep(2);
    }
  };

  const goBack = () => {
    if (step === 1) setStep(0);
    else if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 10) setStep(1);
    else if (step === 4) setStep(3);
  };

  return (
    <div className="app-container">
      {/* Structural Top Header */}
      <header className="top-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <Cpu size={18} strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <span className="brand-label">MAINFRAME COMPUTERS</span>
            <span className="brand-subline">Rajarampuri · Kolhapur</span>
          </div>
        </div>

        <div className="counter-badge">
          <span className="counter-dot"></span>
          <span>{counter ? `Desk #${counter}` : "Service Hub"}</span>
        </div>
      </header>

      {/* Progress Line */}
      {step > 0 && step < 7 && (
        <div className="progress-container">
          <div className="progress-fill" style={{ "--progress-ratio": getProgressRatio() }} />
        </div>
      )}

      {/* Step Navigation Bar */}
      {step > 0 && step < 7 && (
        <div className="step-nav-bar">
          <button type="button" className="back-action-link" onClick={goBack}>
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <span className="step-indicator-text">
            {step === 1 && "Step 1 of 3 · Satisfaction"}
            {step === 2 && "Step 2 of 3 · Service"}
            {step === 3 && "Step 3 of 3 · Highlights"}
            {step === 4 && "Final · Review Ready"}
            {step === 10 && "Private Resolution"}
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="content-area">
        {/* Screen 1: Welcome */}
        {step === 0 && (
          <div className="welcome-hero animate-fade-in">
            <h1 className="welcome-title">How was your experience?</h1>
            <p className="welcome-desc">
              Your feedback helps us serve you better. In under 20 seconds, share your visit and draft an authentic review.
            </p>

            <div className="trust-strip">
              <div className="trust-item">
                <Clock size={15} />
                <span>Under 20 seconds</span>
              </div>
              <div className="trust-item">
                <Lock size={15} />
                <span>Secure feedback</span>
              </div>
              <div className="trust-item">
                <ShieldCheck size={15} />
                <span>Real customer support</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep(blocked() ? 7 : 1)}
            >
              <span>Share your experience</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Screen 2: Satisfaction */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="section-head">
              <h2 className="page-title">How was your service?</h2>
              <p className="page-subtitle">Select the rating that best reflects your visit today.</p>
            </div>

            <div className="ratings-grid">
              {RATINGS.map((r) => {
                const RatingIcon = r.icon;
                const isSelected = rating === r.title;
                return (
                  <button
                    key={r.key}
                    type="button"
                    className={`rating-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleRatingSelect(r)}
                  >
                    <div className="rating-icon-box">
                      <RatingIcon size={20} strokeWidth={2.2} />
                    </div>
                    <div className="rating-info">
                      <div className="rating-title">{r.title}</div>
                      <div className="rating-desc">{r.subtitle}</div>
                    </div>
                    <span className="rating-badge">
                      {r.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Screen 3: Service Selection */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="section-head">
              <h2 className="page-title">What did we service?</h2>
              <p className="page-subtitle">Select all areas our technical team assisted you with.</p>
            </div>

            <div className="chips-grid">
              {SERVICES.map((s) => {
                const IconComponent = s.icon;
                const isSelected = services.includes(s.label);
                return (
                  <button
                    key={s.label}
                    type="button"
                    className={`service-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => toggle(services, setServices, s.label)}
                  >
                    <div className="service-chip-icon">
                      <IconComponent size={16} strokeWidth={2} />
                    </div>
                    <span className="service-chip-label">{s.label}</span>
                    <div className="service-chip-check">
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="btn-primary"
              disabled={!services.length}
              onClick={() => setStep(3)}
            >
              <span>Continue ({services.length} selected)</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Screen 4: Experience Highlights */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="section-head">
              <h2 className="page-title">What stood out most?</h2>
              <p className="page-subtitle">Choose the highlights that made your visit worthwhile.</p>
            </div>

            <div className="chips-grid">
              {LIKED.map((s) => {
                const IconComponent = s.icon;
                const isSelected = liked.includes(s.label);
                return (
                  <button
                    key={s.label}
                    type="button"
                    className={`service-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => toggle(liked, setLiked, s.label)}
                  >
                    <div className="service-chip-icon">
                      <IconComponent size={16} strokeWidth={2} />
                    </div>
                    <span className="service-chip-label">{s.label}</span>
                    <div className="service-chip-check">
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="recovery-banner">
                <AlertCircle size={16} className="recovery-banner-icon" />
                <div className="recovery-banner-text">
                  <p>{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <button
                type="button"
                className="btn-primary"
                disabled
              >
                <RefreshCw size={18} className="spinner" />
                <span>Drafting…</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                disabled={!liked.length}
                onClick={genReview}
              >
                <Sparkles size={18} />
                <span>Generate Review</span>
              </button>
            )}
          </div>
        )}

        {/* Screen 5: Review Preview */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div className="section-head">
              <h2 className="page-title">Review preview</h2>
              <p className="page-subtitle">You can edit any sentence before posting to Google.</p>
            </div>

            <div className="review-preview-card">
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((st) => (
                  <Star key={st} size={16} fill="currentColor" strokeWidth={0} />
                ))}
                <span className="stars-score">5.0 Star Rating</span>
              </div>

              <textarea
                className="review-textarea"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review here…"
              />

              <div className="edit-hint">
                <span>Tap text to edit</span>
                <span>{review.length} characters</span>
              </div>
            </div>

            <div className="posting-info-box">
              <MapPin size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div className="posting-info-content">
                <span className="posting-info-title">MainFrame Computers</span>
                2nd Ln, opp. Mahendra Jeweller, Rajarampuri, Kolhapur
              </div>
            </div>

            <div className="instruction-steps">
              <div className="instruction-step">
                <span className="instruction-step-num">1</span>
                <span>Tap below to copy your drafted review.</span>
              </div>
              <div className="instruction-step">
                <span className="instruction-step-num">2</span>
                <span>Paste on Google Maps and confirm.</span>
              </div>
            </div>

            {copied ? (
              <button
                type="button"
                className="btn-primary"
                disabled
                style={{ marginBottom: "var(--space-sm)" }}
              >
                <Check size={18} strokeWidth={2.5} />
                <span>Copied! Opening…</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={copyAndOpen}
                style={{ marginBottom: "var(--space-sm)" }}
              >
                <Copy size={18} />
                <span>Copy & Open Google</span>
                <ExternalLink size={16} />
              </button>
            )}

            <a
              href={GOOGLE_REVIEW_URL}
              className="manual-review-link"
            >
              Direct Link: Open Google Review dialog
            </a>

            <button
              type="button"
              className="btn-secondary"
              onClick={genReview}
              disabled={loading}
            >
              <RefreshCw size={15} />
              <span>{loading ? "Writing new version…" : "Regenerate variation"}</span>
            </button>
          </div>
        )}

        {/* Screen 6: Private Customer Support */}
        {step === 10 && !fbSent && (
          <div className="animate-fade-in">
            <div className="section-head">
              <h2 className="page-title">Let’s make things right.</h2>
              <p className="page-subtitle">We hold our craftsmanship to a high standard. Tell us what went wrong so the founder can assist you directly.</p>
            </div>

            <div className="input-group">
              <label className="input-label">Your Name</label>
              <input
                className="text-input"
                placeholder="e.g. Rahul Sharma"
                value={fb.name}
                onChange={(e) => setFb({ ...fb, name: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number (for direct callback)</label>
              <input
                className="text-input"
                type="tel"
                placeholder="e.g. 9876543210"
                value={fb.phone}
                onChange={(e) => setFb({ ...fb, phone: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Issue description</label>
              <textarea
                className="text-input text-area"
                placeholder="Please describe what happened with your device or visit…"
                value={fb.message}
                onChange={(e) => setFb({ ...fb, message: e.target.value })}
              />
            </div>

            {error && (
              <div className="recovery-banner">
                <AlertCircle size={16} className="recovery-banner-icon" />
                <div className="recovery-banner-text">
                  <p>{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <button
                type="button"
                className="btn-primary"
                disabled
              >
                <RefreshCw size={18} className="spinner" />
                <span>Submitting…</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                disabled={!fb.message.trim()}
                onClick={sendFeedback}
              >
                <MessageSquare size={18} />
                <span>Request a callback</span>
              </button>
            )}

            <div className="quick-contact-row">
              <a
                href={`https://wa.me/919823064710?text=${encodeURIComponent("Hi MainFrame Computers, I visited your shop in Rajarampuri, Kolhapur and need assistance regarding my service.")}`}
                target="_blank"
                rel="noreferrer"
                className="quick-contact-link whatsapp"
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </a>
              <a
                href={`tel:${SHOP_PHONE}`}
                className="quick-contact-link call"
              >
                <Phone size={15} />
                <span>Direct Call</span>
              </a>
            </div>
          </div>
        )}

        {/* Step 10: Feedback Sent confirmation */}
        {step === 10 && fbSent && (
          <div className="success-card animate-fade-in">
            <div className="success-badge-icon">
              <CheckCircle2 size={36} strokeWidth={2} />
            </div>
            <h2 className="page-title">Request received</h2>
            <p className="page-subtitle">
              Thank you for telling us directly. The store owner has been notified and will reach out shortly to resolve this.
            </p>

            <div className="instruction-steps">
              <div className="instruction-step">
                <CheckCircle2 size={16} />
                <span>Complimentary re-inspection guaranteed on all recent work.</span>
              </div>
              <div className="instruction-step">
                <CheckCircle2 size={16} />
                <span>Direct accountability from the founder.</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setStep(0); setFbSent(false); setFb({ name: "", phone: "", message: "" }); }}
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Step 7: Already Shared Today */}
        {step === 7 && (
          <div className="success-card animate-fade-in">
            <div className="success-badge-icon">
              <CheckCircle2 size={36} strokeWidth={2} />
            </div>
            <h2 className="page-title">Thank you again</h2>
            <p className="page-subtitle">
              You’ve already submitted an experience log today. We appreciate your continued support for Mainframe Computers.
            </p>

            <div className="instruction-steps">
              <div className="instruction-step">
                <ShieldCheck size={16} />
                <span>All hardware upgrades and repairs include service warranty.</span>
              </div>
            </div>

            <button type="button" className="btn-secondary" onClick={() => setStep(0)}>
              Back to Home
            </button>
          </div>
        )}
      </main>

      {/* Floating Status Toast */}
      {toast && (
        <div className="toast-msg">
          <Check size={15} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
