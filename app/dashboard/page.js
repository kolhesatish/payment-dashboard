"use client";

import { useState, useEffect, useRef } from "react";
import { DonutChart, TrendsChart } from "./Charts";

// ── Data ────────────────────────────────────────────────────────────────────
const activityItems = [
    { merchant: "Whole Foods", amount: 87.32, category: "Groceries", time: "2 hours ago", color: "#7A8B6F" },
    { merchant: "Shell Gas", amount: 52.10, category: "Transportation", time: "Yesterday", color: "#C4A04B" },
    { merchant: "Netflix", amount: 17.99, category: "Subscriptions", time: "2 days ago", color: "#E8A988" },
    { merchant: "Transfer to Savings", amount: 500.00, category: "Savings", time: "3 days ago", color: "#A3B398" },
    { merchant: "Chipotle", amount: 14.25, category: "Dining", time: "3 days ago", color: "#C4704B" },
    { merchant: "Amazon", amount: 43.99, category: "Shopping", time: "4 days ago", color: "#8B6F5C" },
    { merchant: "Starbucks", amount: 6.75, category: "Coffee", time: "5 days ago", color: "#C4704B" },
    { merchant: "Trader Joe's", amount: 62.40, category: "Groceries", time: "5 days ago", color: "#7A8B6F" },
    { merchant: "Uber", amount: 18.50, category: "Transportation", time: "6 days ago", color: "#C4A04B" },
    { merchant: "Target", amount: 34.20, category: "Shopping", time: "6 days ago", color: "#8B6F5C" },
];

const upcomingBills = [
    { name: "Rent", amount: 2100, date: "Feb 27" },
    { name: "Car Insurance", amount: 145, date: "Feb 28" },
    { name: "Spotify", amount: 10.99, date: "Mar 1" },
    { name: "Gym", amount: 49.99, date: "Mar 1" },
];

const commandAnswers = {
    dining: 'You spent <strong>$780</strong> on Food & Dining this month across 24 transactions. That\'s up 4% from last month ($750).',
    savings: 'Your savings rate is <strong>28%</strong> this month — you\'re saving $1,820 of your $6,500 income. You\'re on a 12-week streak!',
    subscription: 'Your active subscriptions total <strong>$78.97/month</strong>: Netflix ($17.99), Spotify ($10.99), Gym ($49.99).',
    project: 'Based on your 6-month average, next month\'s projected spending is <strong>$5,340</strong>.',
    default: 'I found information about your finances. Try asking about dining, savings rate, subscriptions, or spending projections.',
};

const grandTotal = 245000 + 170000 + 98200 + 46000 + 38500 + 22000 + 15200 + 280000 + 12000 + 3400;
function pct(val) { return ((val / grandTotal) * 100).toFixed(1); }
function fmt(val) { return val < 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`; }
function fmtBill(v) { return v % 1 !== 0 ? `$${v.toFixed(2)}` : `$${v.toLocaleString()}`; }

// ── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

function getDateString() {
    return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

// ── Calendar Icon ─────────────────────────────────────────────────────────────
const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

// ── Search Icon ─────────────────────────────────────────────────────────────
const SearchIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// ── Bell Icon ──────────────────────────────────────────────────────────────
const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

// ── Up Arrow Icon ─────────────────────────────────────────────────────────
const UpArrow = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
    </svg>
);

// ── Command Modal ─────────────────────────────────────────────────────────
function CommandModal({ open, onClose }) {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 100);
        else { setQuery(""); setAnswer(null); }
    }, [open]);

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onClose(); }
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    const processQuery = (q) => {
        const ql = q.toLowerCase();
        let ans = commandAnswers.default;
        if (ql.includes("dining") || ql.includes("food")) ans = commandAnswers.dining;
        else if (ql.includes("savings") || ql.includes("saving")) ans = commandAnswers.savings;
        else if (ql.includes("subscription") || ql.includes("netflix") || ql.includes("spotify")) ans = commandAnswers.subscription;
        else if (ql.includes("project") || ql.includes("next month") || ql.includes("forecast")) ans = commandAnswers.project;
        setAnswer(ans);
    };

    if (!open) return null;

    return (
        <div className={`command-modal-overlay open`} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="command-modal">
                <div className="command-input-row">
                    <SearchIcon size={20} />
                    <input
                        ref={inputRef}
                        className="command-input"
                        placeholder="Ask anything about your finances..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && query.trim() && processQuery(query.trim())}
                        autoComplete="off"
                    />
                    <span className="command-esc">ESC</span>
                </div>
                <div className="command-results">
                    {!answer ? (
                        <div className="command-suggestions">
                            <p className="suggestions-label">Suggestions</p>
                            {["How much did I spend on dining?", "What's my savings rate?", "Show me subscription costs", "Project next month's spending"].map((s) => (
                                <button key={s} className="suggestion-btn" onClick={() => { setQuery(s); processQuery(s); }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="command-answer">
                            <div className="answer-card" dangerouslySetInnerHTML={{ __html: answer }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [cmdOpen, setCmdOpen] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setCmdOpen((v) => !v);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    const streakFilled = 12;
    const streakTotal = 16;

    return (
        <>
            {/* TOP NAV */}
            <nav className="top-nav">
                <div className="nav-left">
                    <span className="wordmark">Meridian</span>
                </div>
                <div className="nav-center">
                    <button className="command-bar-trigger" onClick={() => setCmdOpen(true)}>
                        <SearchIcon />
                        <span className="command-placeholder">Ask anything...</span>
                        <span className="command-shortcut">⌘K</span>
                    </button>
                </div>
                <div className="nav-right">
                    <button className="nav-icon-btn" aria-label="Notifications">
                        <BellIcon />
                        <span className="notification-dot" />
                    </button>
                    <div className="user-avatar">SK</div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="main-content">

                {/* WELCOME */}
                <section className="welcome-section anim-fade-up">
                    <h1 className="welcome-heading">{getGreeting()}, Satish</h1>
                    <p className="welcome-subtitle">{getDateString()} · Here&apos;s your financial snapshot</p>
                </section>

                {/* KEY METRICS */}
                <section className="metrics-grid anim-fade-up anim-delay-1">
                    {/* Net Worth */}
                    <div className="metric-card">
                        <span className="metric-label">Net Worth</span>
                        <div className="metric-value-row">
                            <span className="metric-value">$623,847</span>
                        </div>
                        <div className="metric-change positive">
                            <UpArrow />
                            +$12,340 this month
                        </div>
                    </div>

                    {/* Monthly Budget */}
                    <div className="metric-card">
                        <span className="metric-label">Monthly Budget</span>
                        <div className="metric-value-row">
                            <span className="metric-value">$5,200</span>
                            <span className="metric-of">of $6,500</span>
                        </div>
                        <div className="budget-bar-container">
                            <div className="budget-bar" style={{ width: "80%" }} />
                        </div>
                        <span className="metric-note">80% spent · $1,300 remaining</span>
                    </div>

                    {/* Savings Rate */}
                    <div className="metric-card">
                        <span className="metric-label">Savings Rate</span>
                        <div className="metric-value-row">
                            <span className="metric-value">28%</span>
                        </div>
                        <div className="gauge-container">
                            <svg className="gauge-svg" viewBox="0 0 120 75">
                                <path className="gauge-bg" d="M15,65 A45,45 0 0,1 105,65" fill="none" strokeWidth="14" strokeLinecap="round" stroke="#F3F0EC" />
                                <path
                                    className="gauge-fill"
                                    d="M15,65 A45,45 0 0,1 105,65"
                                    fill="none"
                                    strokeWidth="14"
                                    strokeLinecap="round"
                                    stroke="#7A8B6F"
                                    strokeDasharray="141.4"
                                    strokeDashoffset={141.4 - 141.4 * 0.28}
                                />
                                <text x="60" y="60" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#9B9590" fontWeight="500">of 100%</text>
                            </svg>
                        </div>
                    </div>

                    {/* Investments */}
                    <div className="metric-card">
                        <span className="metric-label">Investments</span>
                        <div className="metric-value-row">
                            <span className="metric-value">$389,200</span>
                        </div>
                        <div className="metric-change positive">
                            <UpArrow />
                            +2.1% MTD
                        </div>
                    </div>
                </section>

                {/* MONEY MAP */}
                <section className="money-map-section anim-fade-up anim-delay-2">
                    <div className="section-header">
                        <h2 className="section-title">Money Map</h2>
                        <span className="section-subtitle">Where your money lives</span>
                    </div>
                    <div className="money-map">
                        <div className="map-row" style={{ height: 140 }}>
                            <div className="map-block" style={{ flex: 59, background: "#5E7352", color: "#fff" }}>
                                <span className="block-name">401k</span>
                                <span className="block-amount">{fmt(245000)}</span>
                                <span className="block-pct">{pct(245000)}%</span>
                            </div>
                            <div className="map-block" style={{ flex: 41, background: "#8B6F5C", color: "#fff" }}>
                                <span className="block-name">Home Equity</span>
                                <span className="block-amount">{fmt(170000)}</span>
                                <span className="block-pct">{pct(170000)}%</span>
                            </div>
                        </div>
                        <div className="map-row" style={{ height: 90 }}>
                            <div className="map-block" style={{ flex: 54, background: "#C4704B", color: "#fff" }}>
                                <span className="block-name">Brokerage</span>
                                <span className="block-amount">{fmt(98200)}</span>
                                <span className="block-pct">{pct(98200)}%</span>
                            </div>
                            <div className="map-block" style={{ flex: 25, background: "#C4A04B", color: "#fff" }}>
                                <span className="block-name">Roth IRA</span>
                                <span className="block-amount">{fmt(46000)}</span>
                                <span className="block-pct">{pct(46000)}%</span>
                            </div>
                            <div className="map-block" style={{ flex: 21, background: "#A3B398", color: "#2C2825" }}>
                                <span className="block-name">High-Yield Savings</span>
                                <span className="block-amount">{fmt(38500)}</span>
                                <span className="block-pct">{pct(38500)}%</span>
                            </div>
                        </div>
                        <div className="map-row" style={{ height: 82 }}>
                            <div className="map-block" style={{ flex: 59, background: "#7A8B6F", color: "#fff" }}>
                                <span className="block-name">Emergency Fund</span>
                                <span className="block-amount">{fmt(22000)}</span>
                                <span className="block-pct">{pct(22000)}%</span>
                            </div>
                            <div className="map-block" style={{ flex: 41, background: "#E8A988", color: "#2C2825" }}>
                                <span className="block-name">Checking</span>
                                <span className="block-amount">{fmt(15200)}</span>
                                <span className="block-pct">{pct(15200)}%</span>
                            </div>
                        </div>
                        <div className="debt-row-label">Debt</div>
                        <div className="map-row" style={{ height: 80 }}>
                            <div className="map-block debt-block" style={{ flex: 60, background: "#B85C5C", color: "#fff" }}>
                                <span className="block-name">Mortgage</span>
                                <span className="block-amount">{fmt(-280000)}</span>
                                <span className="block-pct">{pct(280000)}%</span>
                            </div>
                            <div className="map-block debt-block" style={{ flex: 22, background: "#D49090", color: "#fff" }}>
                                <span className="block-name">Student Loans</span>
                                <span className="block-amount">{fmt(-12000)}</span>
                                <span className="block-pct">{pct(12000)}%</span>
                            </div>
                            <div className="map-block debt-block" style={{ flex: 18, background: "#C98A8A", color: "#fff" }}>
                                <span className="block-name">Credit Cards</span>
                                <span className="block-amount">{fmt(-3400)}</span>
                                <span className="block-pct">{pct(3400)}%</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TWO COLUMN LAYOUT */}
                <section className="two-col-layout anim-fade-up anim-delay-3">

                    {/* LEFT COLUMN */}
                    <div className="left-col">
                        {/* Monthly Spending (Donut) */}
                        <div className="card">
                            <div className="section-header">
                                <h2 className="section-title">Monthly Spending</h2>
                                <span className="section-subtitle">February 2026</span>
                            </div>
                            <DonutChart />
                        </div>

                        {/* Spending Trends (Line) */}
                        <div className="card">
                            <div className="section-header">
                                <h2 className="section-title">Spending Trends</h2>
                                <span className="section-subtitle">Last 6 months</span>
                            </div>
                            <TrendsChart />
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="right-col">
                        {/* Recent Activity */}
                        <div className="card">
                            <div className="section-header">
                                <h2 className="section-title">Recent Activity</h2>
                            </div>
                            <div className="activity-feed">
                                {activityItems.map((item, i) => (
                                    <div className="activity-item" key={i}>
                                        <span className="activity-dot" style={{ background: item.color }} />
                                        <div className="activity-info">
                                            <div className="activity-merchant">{item.merchant}</div>
                                            <div className="activity-category">{item.category}</div>
                                        </div>
                                        <div className="activity-right">
                                            <div className="activity-amount">${item.amount.toFixed(2)}</div>
                                            <div className="activity-time">{item.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <a href="#" className="view-all-link" onClick={(e) => e.preventDefault()}>View all transactions →</a>
                        </div>

                        {/* Upcoming Bills */}
                        <div className="card">
                            <div className="section-header">
                                <h2 className="section-title">Upcoming Bills</h2>
                                <span className="section-subtitle">Next 7 days</span>
                            </div>
                            <div className="bills-list">
                                {upcomingBills.map((bill, i) => (
                                    <div className="bill-item" key={i}>
                                        <div className="bill-icon"><CalendarIcon /></div>
                                        <div className="bill-info">
                                            <div className="bill-name">{bill.name}</div>
                                            <div className="bill-date">{bill.date}</div>
                                        </div>
                                        <div className="bill-amount">{fmtBill(bill.amount)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Savings Streaks */}
                        <div className="card savings-streaks-card">
                            <div className="streak-header">
                                <span className="streak-fire">🔥</span>
                                <span className="streak-title">12-week savings streak</span>
                            </div>
                            <p className="streak-desc">You&apos;ve saved at least $500/week for 12 consecutive weeks</p>
                            <div className="streak-dots">
                                {Array.from({ length: streakTotal }, (_, i) => (
                                    <span key={i} className={`streak-dot${i < streakFilled ? " filled" : ""}`} />
                                ))}
                            </div>
                            <div className="streak-badges">
                                <span className="badge badge-gold">🏆 First $500k</span>
                                <span className="badge badge-sage">✅ Emergency Fund Complete</span>
                                <span className="badge badge-terracotta">🎯 Debt-free by 30</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* COMMAND MODAL */}
            <CommandModal open={cmdOpen} onClose={() => setCmdOpen(false)} />
        </>
    );
}
