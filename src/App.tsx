// @ts-nocheck
import { useState } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import type { Profile } from "./types";

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
const tokens = {
  bg: "#0D0F14",
  surface: "#141720",
  surfaceUp: "#1C2030",
  border: "rgba(255,255,255,0.07)",
  borderMid: "rgba(255,255,255,0.12)",
  text: "#F0F2F8",
  muted: "#6B7280",
  accent: "#6C63FF",
  accentDim: "rgba(108,99,255,0.15)",
  accentBright: "#8B85FF",
  teal: "#14B8A6",
  tealDim: "rgba(20,184,166,0.15)",
  rose: "#F43F5E",
  roseDim: "rgba(244,63,94,0.12)",
  amber: "#F59E0B",
  amberDim: "rgba(245,158,11,0.12)",
  green: "#22C55E",
  greenDim: "rgba(34,197,94,0.12)",
  blue: "#3B82F6",
  blueDim: "rgba(59,130,246,0.12)",
};

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const mockTasks = [
  { id: 1, title: "Software Design Patterns Report", type: "assignment", priority: "high", status: "ongoing", due: "May 15", subject: "CSPC321", subjectColor: "#6C63FF" },
  { id: 2, title: "Midterm Exam Preparation", type: "quiz", priority: "high", status: "pending", due: "May 18", subject: "MATH201", subjectColor: "#14B8A6" },
  { id: 3, title: "Mobile App Prototype", type: "project", priority: "medium", status: "ongoing", due: "May 22", subject: "IT412", subjectColor: "#F43F5E" },
  { id: 4, title: "Database ER Diagram", type: "assignment", priority: "low", status: "done", due: "May 10", subject: "CSPC310", subjectColor: "#F59E0B" },
  { id: 5, title: "Network Security Essay", type: "assignment", priority: "medium", status: "pending", due: "May 20", subject: "NET301", subjectColor: "#22C55E" },
  { id: 6, title: "Algorithm Analysis Quiz", type: "quiz", priority: "high", status: "pending", due: "May 14", subject: "CSPC221", subjectColor: "#3B82F6" },
];

const mockSubjects = [
  { id: 1, name: "Software Engineering", code: "CSPC321", color: "#6C63FF", instructor: "Prof. Reyes", tasks: 5 },
  { id: 2, name: "Advanced Mathematics", code: "MATH201", color: "#14B8A6", instructor: "Prof. Santos", tasks: 3 },
  { id: 3, name: "Mobile Development", code: "IT412", color: "#F43F5E", instructor: "Prof. Cruz", tasks: 4 },
  { id: 4, name: "Database Systems", code: "CSPC310", color: "#F59E0B", instructor: "Prof. Lim", tasks: 6 },
];

const mockNotifications = [
  { id: 1, type: "reminder", title: "Algorithm Analysis Quiz due tomorrow", time: "1h ago", read: false },
  { id: 2, type: "status", title: "Prof. Reyes commented on your report", time: "3h ago", read: false },
  { id: 3, type: "system", title: "New subject added: Network Security", time: "Yesterday", read: true },
  { id: 4, type: "reminder", title: "Mobile App Prototype deadline in 3 days", time: "Yesterday", read: true },
];

const mockUsers = [
  { id: 1, name: "Maria Santos", role: "student", email: "maria@gmail.com", joined: "Jan 2024", tasks: 12, done: 9 },
  { id: 2, name: "Juan dela Cruz", role: "student", email: "juan@gmail.com", joined: "Jan 2024", tasks: 8, done: 5 },
  { id: 3, name: "Ana Reyes", role: "admin", email: "ana@gmail.com", joined: "Dec 2023", tasks: 0, done: 0 },
  { id: 4, name: "Carlo Bautista", role: "student", email: "carlo@gmail.com", joined: "Feb 2024", tasks: 15, done: 11 },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function StatusBadge({ status }) {
  const map = {
    pending: { bg: tokens.amberDim, color: tokens.amber, label: "Pending" },
    ongoing: { bg: tokens.accentDim, color: tokens.accentBright, label: "Ongoing" },
    done: { bg: tokens.greenDim, color: tokens.green, label: "Done" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>
      {s.label}
    </span>
  );
}

function PriorityDot({ priority }) {
  const colors = { high: tokens.rose, medium: tokens.amber, low: tokens.teal };
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: colors[priority] || tokens.muted, marginRight: 6 }} />;
}

function TypeBadge({ type }) {
  const map = {
    assignment: { bg: "rgba(108,99,255,0.12)", color: "#8B85FF" },
    quiz: { bg: "rgba(244,63,94,0.12)", color: "#F87171" },
    project: { bg: "rgba(20,184,166,0.12)", color: "#2DD4BF" },
  };
  const t = map[type] || map.assignment;
  return (
    <span style={{ background: t.bg, color: t.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>
      {type}
    </span>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, isAdmin }) {
  const navItems = [
    { id: "dashboard", icon: "⬡", label: isAdmin ? "Overview" : "Dashboard" },
    { id: "tasks", icon: "✦", label: isAdmin ? "All Tasks" : "My Tasks" },
    ...(!isAdmin ? [{ id: "subjects", icon: "◈", label: "Subjects" }] : []),
    { id: "calendar", icon: "◷", label: "Calendar" },
    { id: "notifications", icon: "◎", label: "Notifications", badge: 2 },
    ...(isAdmin ? [
      { id: "analytics", icon: "◉", label: "Analytics" },
      { id: "users", icon: "◍", label: "Users" },
    ] : []),
  ];

  return (
    <div style={{
      width: 220, flexShrink: 0, background: tokens.surface, borderRight: `1px solid ${tokens.border}`,
      display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: "28px 24px 20px", borderBottom: `1px solid ${tokens.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: tokens.accent,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0
          }}>T</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, letterSpacing: "-0.02em" }}>TaskMate</div>
            <div style={{ fontSize: 10, color: tokens.muted, marginTop: 1 }}>{isAdmin ? "Admin Panel" : "Student Portal"}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {navItems.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px",
              borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, textAlign: "left",
              background: active ? tokens.accentDim : "transparent",
              color: active ? tokens.accentBright : tokens.muted,
              fontSize: 13, fontWeight: active ? 600 : 400, transition: "all 0.15s",
              borderLeft: active ? `2px solid ${tokens.accent}` : "2px solid transparent",
              position: "relative",
            }}>
              <span style={{ fontSize: 15, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  marginLeft: "auto", background: tokens.rose, color: "#fff",
                  borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700
                }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${tokens.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${tokens.accent}, ${tokens.teal})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff",
          }}>
            {isAdmin ? "AN" : "JS"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {isAdmin ? "Ana Reyes" : "Josh Briones"}
            </div>
            <div style={{ fontSize: 11, color: tokens.muted }}>{isAdmin ? "Administrator" : "Student"}</div>
          </div>
        </div>
        <button
          onClick={() => setPage("login")}
          style={{
            marginTop: 10, width: "100%", padding: "7px 0", borderRadius: 6, border: `1px solid ${tokens.border}`,
            background: "transparent", color: tokens.muted, fontSize: 12, cursor: "pointer", transition: "all 0.15s",
          }}
        >Sign out</button>
      </div>
    </div>
  );
}

// ── TOPBAR ────────────────────────────────────────────────────────────────────
function Topbar({ title, onNew, newLabel = "+ New" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 28px", borderBottom: `1px solid ${tokens.border}`,
      background: tokens.bg, position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(8px)",
    }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: tokens.text, margin: 0, letterSpacing: "-0.02em" }}>{title}</h1>
      {onNew && (
        <button onClick={onNew} style={{
          background: tokens.accent, color: "#fff", border: "none", borderRadius: 8,
          padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          boxShadow: `0 0 16px rgba(108,99,255,0.35)`, transition: "all 0.15s",
        }}>{newLabel}</button>
      )}
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 12, padding: "20px 22px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", right: 16, top: 16, width: 38, height: 38, borderRadius: 10,
        background: color ? `${color}18` : tokens.surfaceUp, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, color: color || tokens.muted,
      }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: color || tokens.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: tokens.muted, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

// ── CARD WRAPPER ──────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 12,
      padding: "20px 22px", ...style,
    }}>{children}</div>
  );
}

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onRegister, error, loading }) {
  const [tab, setTab] = useState("student");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <div style={{
      minHeight: "100vh", background: tokens.bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: tokens.accent, margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff",
            boxShadow: `0 0 30px rgba(108,99,255,0.4)`,
          }}>T</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: tokens.text, letterSpacing: "-0.03em" }}>TaskMate</div>
          <div style={{ fontSize: 13, color: tokens.muted, marginTop: 4 }}>Divine Word College of Bangued</div>
        </div>

        <div style={{
          background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 16, padding: "28px 28px",
        }}>
          <div style={{ display: "flex", gap: 4, background: tokens.surfaceUp, borderRadius: 8, padding: 4, marginBottom: 24 }}>
            {["student", "admin"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: tab === t ? tokens.accent : "transparent",
                color: tab === t ? "#fff" : tokens.muted, transition: "all 0.2s",
              }}>{t === "student" ? "Student" : "Admin"}</button>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Email address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={tab === "student" ? "you@gmail.com" : "admin@gmail.com"}
              style={{
                width: "100%", height: 40, borderRadius: 8, border: `1px solid ${tokens.border}`,
                background: tokens.surfaceUp, color: tokens.text, padding: "0 12px", fontSize: 14,
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Password</label>
            <input
              type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%", height: 40, borderRadius: 8, border: `1px solid ${tokens.border}`,
                background: tokens.surfaceUp, color: tokens.text, padding: "0 12px", fontSize: 14,
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && <div style={{ color: tokens.rose, marginBottom: 14, fontSize: 13 }}>{error}</div>}

          <button
            onClick={() => onLogin(tab, email, pw)}
            disabled={loading}
            style={{
              width: "100%", height: 42, borderRadius: 8, background: tokens.accent, color: "#fff", border: "none",
              fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 0 20px rgba(108,99,255,0.4)`, transition: "all 0.15s",
              opacity: loading ? 0.6 : 1,
            }}
          >{loading ? "Signing in…" : `Sign in as ${tab === "student" ? "Student" : "Administrator"}`}</button>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: tokens.muted }}>
            No account?{" "}
            <button onClick={onRegister} style={{ background: "none", border: "none", color: tokens.accentBright, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REGISTER PAGE ─────────────────────────────────────────────────────────────
function RegisterPage({ onBack }) {
  return (
    <div style={{
      minHeight: "100vh", background: tokens.bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: tokens.accent, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff", boxShadow: `0 0 30px rgba(108,99,255,0.4)` }}>T</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: tokens.text, letterSpacing: "-0.03em" }}>Create Account</div>
          <div style={{ fontSize: 13, color: tokens.muted, marginTop: 4 }}>Join TaskMate — Student Portal</div>
        </div>
        <div style={{ background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 16, padding: "28px 28px" }}>
          {["Full name", "Email address", "Password", "Confirm password"].map((label, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</label>
              <input
                type={label.toLowerCase().includes("password") ? "password" : label === "Email address" ? "email" : "text"}
                placeholder={label === "Full name" ? "Juan dela Cruz" : label === "Email address" ? "you@gmail.com" : "••••••••"}
                style={{ width: "100%", height: 40, borderRadius: 8, border: `1px solid ${tokens.border}`, background: tokens.surfaceUp, color: tokens.text, padding: "0 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}
          <button onClick={() => onBack("student")} style={{ width: "100%", height: 42, borderRadius: 8, background: tokens.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 0 20px rgba(108,99,255,0.4)`, marginTop: 4 }}>
            Create Account
          </button>
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: tokens.muted }}>
            Already have one?{" "}
            <button onClick={() => onBack(null)} style={{ background: "none", border: "none", color: tokens.accentBright, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
function DashboardPage({ isAdmin }) {
  const stats = { total: 6, pending: 3, ongoing: 2, done: 1, overdue: 1 };
  const recent = mockTasks.slice(0, 5);

  return (
    <div style={{ padding: "24px 28px", flex: 1, overflowY: "auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: tokens.text, margin: 0, letterSpacing: "-0.03em" }}>
          Good day, {isAdmin ? "Ana" : "Josh"} 👋
        </h2>
        <p style={{ fontSize: 14, color: tokens.muted, marginTop: 6 }}>
          {isAdmin ? "Here's an overview of all student tasks." : "Here's your academic task overview."}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Tasks" value={stats.total} sub="all tasks" icon="📋" />
        <StatCard label="Pending" value={stats.pending} sub="not started" icon="⏳" color={tokens.amber} />
        <StatCard label="Ongoing" value={stats.ongoing} sub="in progress" icon="🔄" color={tokens.accent} />
        <StatCard label="Done" value={stats.done} sub="completed" icon="✅" color={tokens.green} />
      </div>

      {/* Overdue alert */}
      {stats.overdue > 0 && (
        <div style={{
          background: tokens.roseDim, border: `1px solid rgba(244,63,94,0.25)`, borderRadius: 10,
          padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span style={{ fontSize: 13, color: "#F87171" }}>
            You have <strong style={{ color: tokens.rose }}>{stats.overdue}</strong> overdue task — take action soon.
          </span>
        </div>
      )}

      {/* Recent tasks */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>Recent Tasks</div>
          <span style={{ fontSize: 12, color: tokens.accentBright, cursor: "pointer" }}>View all →</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Task", "Type", "Priority", "Status", "Due"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${tokens.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < recent.length - 1 ? `1px solid ${tokens.border}` : "none" }}>
                <td style={{ padding: "12px 10px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{t.title}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: `${t.subjectColor}18`, color: t.subjectColor, marginTop: 4, display: "inline-block" }}>{t.subject}</span>
                </td>
                <td style={{ padding: "12px 10px" }}><TypeBadge type={t.type} /></td>
                <td style={{ padding: "12px 10px" }}>
                  <span style={{ display: "flex", alignItems: "center", fontSize: 12, color: tokens.muted }}>
                    <PriorityDot priority={t.priority} />{t.priority}
                  </span>
                </td>
                <td style={{ padding: "12px 10px" }}><StatusBadge status={t.status} /></td>
                <td style={{ padding: "12px 10px", fontSize: 12, color: t.status !== "done" && t.due === "May 14" ? tokens.rose : tokens.muted }}>
                  {t.due}{t.status !== "done" && t.due === "May 14" ? " · overdue" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── TASKS PAGE ────────────────────────────────────────────────────────────────
function TasksPage({ isAdmin }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState(mockTasks);

  const filtered = tasks.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function cycleStatus(task) {
    const cycle = { pending: "ongoing", ongoing: "done", done: "pending" };
    setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status: cycle[t.status] } : t));
  }

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Topbar title={isAdmin ? "All Tasks" : "My Tasks"} onNew={() => {}} />
      <div style={{ padding: "24px 28px" }}>
        {/* Filters */}
        <Card style={{ marginBottom: 20, padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {["all", "pending", "ongoing", "done"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: "5px 12px", borderRadius: 20, border: `1px solid ${statusFilter === s ? tokens.accent : tokens.border}`,
                background: statusFilter === s ? tokens.accentDim : "transparent",
                color: statusFilter === s ? tokens.accentBright : tokens.muted,
                fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</button>
            ))}
            <div style={{ width: 1, height: 20, background: tokens.border, margin: "0 4px" }} />
            {["all", "assignment", "quiz", "project"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: "5px 12px", borderRadius: 20, border: `1px solid ${typeFilter === t ? tokens.teal : tokens.border}`,
                background: typeFilter === t ? tokens.tealDim : "transparent",
                color: typeFilter === t ? tokens.teal : tokens.muted,
                fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}>{t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks…"
              style={{
                marginLeft: "auto", height: 32, borderRadius: 8, border: `1px solid ${tokens.border}`,
                background: tokens.surfaceUp, color: tokens.text, padding: "0 12px", fontSize: 13, outline: "none", width: 180,
              }}
            />
          </div>
        </Card>

        {/* Task table */}
        <Card style={{ padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${tokens.border}` }}>
                {["Task", "Type", "Priority", "Status", "Due", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${tokens.border}` : "none", transition: "background 0.1s" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{t.title}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: `${t.subjectColor}18`, color: t.subjectColor, marginTop: 4, display: "inline-block" }}>{t.subject}</span>
                    {isAdmin && <div style={{ fontSize: 11, color: tokens.muted, marginTop: 2 }}>👤 Student Name</div>}
                  </td>
                  <td style={{ padding: "14px 16px" }}><TypeBadge type={t.type} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ display: "flex", alignItems: "center", fontSize: 12, color: tokens.muted }}>
                      <PriorityDot priority={t.priority} />{t.priority}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button onClick={() => cycleStatus(t)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} title="Click to cycle status">
                      <StatusBadge status={t.status} />
                    </button>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: tokens.muted }}>{t.due}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${tokens.border}`, background: "transparent", color: tokens.muted, fontSize: 12, cursor: "pointer" }}>Edit</button>
                      <button style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid rgba(244,63,94,0.3)`, background: "transparent", color: tokens.rose, fontSize: 12, cursor: "pointer" }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "48px 16px", textAlign: "center", color: tokens.muted, fontSize: 14 }}>
                    No tasks match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ── SUBJECTS PAGE ─────────────────────────────────────────────────────────────
function SubjectsPage() {
  const COLORS = ["#6C63FF", "#14B8A6", "#F43F5E", "#F59E0B", "#22C55E", "#3B82F6", "#EC4899", "#8B5CF6"];
  const [subjects, setSubjects] = useState(mockSubjects);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", color: "#6C63FF", instructor: "" });

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Topbar title="Subjects" onNew={() => setShowModal(true)} newLabel="+ Add Subject" />
      <div style={{ padding: "24px 28px" }}>
        <p style={{ fontSize: 14, color: tokens.muted, marginBottom: 24 }}>Organize your tasks by subject or course.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {subjects.map(s => (
            <div key={s.id} style={{
              background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 12,
              borderTop: `3px solid ${s.color}`, padding: "20px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "0 0 0 80px", background: `${s.color}08` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>{s.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 3 }}>{s.code}</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ padding: "5px 8px", borderRadius: 6, border: `1px solid ${tokens.border}`, background: "transparent", color: tokens.muted, fontSize: 12, cursor: "pointer" }}>✎</button>
                  <button style={{ padding: "5px 8px", borderRadius: 6, border: `1px solid rgba(244,63,94,0.3)`, background: "transparent", color: tokens.rose, fontSize: 12, cursor: "pointer" }}>✕</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: tokens.muted, marginBottom: 12 }}>👤 {s.instructor}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: tokens.surfaceUp, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.round((s.tasks / 8) * 100)}%`, background: s.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 11, color: tokens.muted, flexShrink: 0 }}>{s.tasks} tasks</span>
              </div>
            </div>
          ))}

          {/* Add new card */}
          <button onClick={() => setShowModal(true)} style={{
            background: "transparent", border: `1px dashed ${tokens.border}`, borderRadius: 12, padding: "20px",
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 140,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `1px dashed ${tokens.muted}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: tokens.muted }}>+</div>
            <span style={{ fontSize: 13, color: tokens.muted }}>Add subject</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
          <div style={{ background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 14, padding: "28px", width: "100%", maxWidth: 400 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 20 }}>New Subject</div>
            {[["Subject name", "name", "text", "e.g. Software Engineering"], ["Subject code", "code", "text", "e.g. CSPC321"], ["Instructor", "instructor", "text", "Prof. Santos"]].map(([label, key, type, ph]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</label>
                <input
                  type={type} placeholder={ph} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", height: 38, borderRadius: 8, border: `1px solid ${tokens.border}`, background: tokens.surfaceUp, color: tokens.text, padding: "0 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                    width: 28, height: 28, borderRadius: "50%", background: c, border: `3px solid ${form.color === c ? "#fff" : "transparent"}`, cursor: "pointer",
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${tokens.border}`, background: "transparent", color: tokens.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => {
                if (form.name.trim()) {
                  setSubjects(ss => [...ss, { id: Date.now(), name: form.name, code: form.code, color: form.color, instructor: form.instructor, tasks: 0 }]);
                  setShowModal(false);
                  setForm({ name: "", code: "", color: "#6C63FF", instructor: "" });
                }
              }} style={{ padding: "8px 18px", borderRadius: 8, background: tokens.accent, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save Subject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CALENDAR PAGE ─────────────────────────────────────────────────────────────
function CalendarPage() {
  const today = new Date(2026, 4, 13);
  const year = today.getFullYear(), month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const taskDays = new Set([15, 18, 20, 22, 14]);
  const overdueDays = new Set([14]);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const upcomingTasks = mockTasks.filter(t => t.status !== "done").slice(0, 4);

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Topbar title="Calendar" />
      <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* Calendar grid */}
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 20 }}>{monthName}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 8 }}>
            {days.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: tokens.muted, padding: "4px 0", letterSpacing: "0.06em" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((day, i) => {
              const isToday = day === 13;
              const hasTask = day && taskDays.has(day);
              const isOverdue = day && overdueDays.has(day);
              return (
                <div key={i} style={{
                  aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderRadius: 8, cursor: day ? "pointer" : "default",
                  background: isToday ? tokens.accent : isOverdue ? tokens.roseDim : "transparent",
                  border: isToday ? "none" : hasTask ? `1px solid ${tokens.border}` : "none",
                  position: "relative",
                }}>
                  {day && (
                    <>
                      <span style={{
                        fontSize: 13, fontWeight: isToday ? 800 : 400,
                        color: isToday ? "#fff" : day < 13 ? tokens.muted : tokens.text,
                      }}>{day}</span>
                      {hasTask && !isToday && (
                        <div style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: isOverdue ? tokens.rose : tokens.accent,
                          marginTop: 2,
                        }} />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${tokens.border}` }}>
            {[
              { color: tokens.accent, label: "Today" },
              { color: tokens.accent, dot: true, label: "Has tasks" },
              { color: tokens.rose, label: "Overdue" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: tokens.muted }}>
                <div style={{ width: l.dot ? 6 : 10, height: l.dot ? 6 : 10, borderRadius: "50%", background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming */}
        <div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 14 }}>Upcoming Deadlines</div>
            {upcomingTasks.map((t, i) => (
              <div key={t.id} style={{
                padding: "10px 0", borderBottom: i < upcomingTasks.length - 1 ? `1px solid ${tokens.border}` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, marginRight: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: tokens.text, lineHeight: 1.4 }}>{t.title}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: `${t.subjectColor}18`, color: t.subjectColor, marginTop: 3, display: "inline-block" }}>{t.subject}</span>
                  </div>
                  <div style={{ fontSize: 11, color: t.due === "May 14" ? tokens.rose : tokens.muted, flexShrink: 0, fontWeight: 600 }}>{t.due}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 12 }}>Quick Stats</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Tasks this month", value: 6, color: tokens.accent },
                { label: "Completed", value: 1, color: tokens.green },
                { label: "Overdue", value: 1, color: tokens.rose },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: tokens.muted }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── NOTIFICATIONS PAGE ────────────────────────────────────────────────────────
function NotificationsPage() {
  const [notifs, setNotifs] = useState(mockNotifications);
  const unread = notifs.filter(n => !n.read).length;

  const typeMap = {
    reminder: { icon: "⏰", color: tokens.amber, bg: tokens.amberDim },
    status: { icon: "🔄", color: tokens.teal, bg: tokens.tealDim },
    system: { icon: "🔔", color: tokens.accent, bg: tokens.accentDim },
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Topbar title="Notifications" />
      <div style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: tokens.text, margin: 0 }}>
              Notifications
              {unread > 0 && <span style={{ marginLeft: 10, background: tokens.rose, color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{unread}</span>}
            </h2>
            <p style={{ fontSize: 13, color: tokens.muted, marginTop: 4 }}>{unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "You're all caught up!"}</p>
          </div>
          {unread > 0 && (
            <button
              onClick={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))}
              style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${tokens.border}`, background: "transparent", color: tokens.muted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >✓✓ Mark all read</button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifs.map(n => {
            const t = typeMap[n.type] || typeMap.system;
            return (
              <div key={n.id} onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))} style={{
                background: n.read ? tokens.surface : `${tokens.accentDim}`,
                border: `1px solid ${n.read ? tokens.border : "rgba(108,99,255,0.2)"}`,
                borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14,
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: n.read ? tokens.muted : tokens.text }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: tokens.muted, marginTop: 4 }}>{n.time}</div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: tokens.accent, flexShrink: 0, marginTop: 4 }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── ANALYTICS PAGE ────────────────────────────────────────────────────────────
function AnalyticsPage() {
  const data = {
    totalTasks: 47, completedTasks: 31, totalStudents: 4, overdueTasks: 3,
    completionRate: 66,
    byStatus: { pending: 10, ongoing: 6, done: 31 },
    byPriority: { high: 15, medium: 20, low: 12 },
    byType: { assignment: 22, quiz: 14, project: 11 },
  };

  function Bar({ label, value, total, color, bgColor }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
          <span style={{ color: tokens.muted }}>{label}</span>
          <span style={{ fontWeight: 700, color }}>{value} <span style={{ color: tokens.muted, fontWeight: 400 }}>({pct}%)</span></span>
        </div>
        <div style={{ height: 8, background: tokens.surfaceUp, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Topbar title="Analytics" />
      <div style={{ padding: "24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          <StatCard label="Total Tasks" value={data.totalTasks} sub="across all students" icon="📋" />
          <StatCard label="Completion Rate" value={`${data.completionRate}%`} sub={`${data.completedTasks} completed`} icon="✅" color={tokens.green} />
          <StatCard label="Total Students" value={data.totalStudents} sub="active users" icon="👥" color={tokens.teal} />
          <StatCard label="Overdue Tasks" value={data.overdueTasks} sub="need attention" icon="⚠️" color={tokens.rose} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 16 }}>Status Distribution</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Bar label="Pending" value={data.byStatus.pending} total={data.totalTasks} color={tokens.amber} />
              <Bar label="Ongoing" value={data.byStatus.ongoing} total={data.totalTasks} color={tokens.accent} />
              <Bar label="Done" value={data.byStatus.done} total={data.totalTasks} color={tokens.green} />
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 16 }}>Priority Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Bar label="High" value={data.byPriority.high} total={data.totalTasks} color={tokens.rose} />
              <Bar label="Medium" value={data.byPriority.medium} total={data.totalTasks} color={tokens.amber} />
              <Bar label="Low" value={data.byPriority.low} total={data.totalTasks} color={tokens.teal} />
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 16 }}>Task Types</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Bar label="Assignment" value={data.byType.assignment} total={data.totalTasks} color="#8B85FF" />
              <Bar label="Quiz" value={data.byType.quiz} total={data.totalTasks} color="#F87171" />
              <Bar label="Project" value={data.byType.project} total={data.totalTasks} color="#2DD4BF" />
            </div>
          </Card>
        </div>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 16 }}>Student Performance</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${tokens.border}` }}>
                {["Student", "Total Tasks", "Completed", "Rate", "Progress"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockUsers.filter(u => u.role === "student").map((u, i) => {
                const rate = u.totalTasks > 0 ? Math.round((u.done / u.tasks) * 100) : 0;
                return (
                  <tr key={u.id} style={{ borderBottom: i < 2 ? `1px solid ${tokens.border}` : "none" }}>
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${tokens.accent}, ${tokens.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {initials(u.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: tokens.muted }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 12px", fontSize: 13, color: tokens.text }}>{u.tasks}</td>
                    <td style={{ padding: "12px 12px", fontSize: 13, color: tokens.green, fontWeight: 600 }}>{u.done}</td>
                    <td style={{ padding: "12px 12px" }}>
                      <span style={{ background: tokens.greenDim, color: tokens.green, borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 700 }}>
                        {Math.round((u.done / u.tasks) * 100)}%
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px", minWidth: 120 }}>
                      <div style={{ height: 6, background: tokens.surfaceUp, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.round((u.done / u.tasks) * 100)}%`, background: tokens.green, borderRadius: 3 }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ── USERS PAGE ────────────────────────────────────────────────────────────────
function UsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [showModal, setShowModal] = useState(false);
  const stats = { total: users.length, students: users.filter(u => u.role === "student").length, admins: users.filter(u => u.role === "admin").length };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Topbar title="User Management" onNew={() => setShowModal(true)} newLabel="+ Add User" />
      <div style={{ padding: "24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          <StatCard label="Total Users" value={stats.total} sub="registered" icon="👥" />
          <StatCard label="Students" value={stats.students} sub="active students" icon="🎓" color={tokens.teal} />
          <StatCard label="Admins" value={stats.admins} sub="administrators" icon="🛡️" color={tokens.accent} />
        </div>

        <Card style={{ padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${tokens.border}` }}>
                {["User", "Role", "Joined", "Tasks", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? `1px solid ${tokens.border}` : "none" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: u.role === "admin" ? `linear-gradient(135deg, ${tokens.accent}, ${tokens.rose})` : `linear-gradient(135deg, ${tokens.teal}, ${tokens.blue})`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                      }}>{initials(u.name)}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: tokens.muted }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                      background: u.role === "admin" ? tokens.accentDim : tokens.tealDim,
                      color: u.role === "admin" ? tokens.accentBright : tokens.teal,
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: tokens.muted }}>{u.joined}</td>
                  <td style={{ padding: "14px 16px" }}>
                    {u.tasks > 0 ? (
                      <div>
                        <div style={{ fontSize: 12, color: tokens.text, fontWeight: 600 }}>{u.done}/{u.tasks}</div>
                        <div style={{ height: 4, background: tokens.surfaceUp, borderRadius: 2, marginTop: 4, width: 80, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.round((u.done / u.tasks) * 100)}%`, background: tokens.green, borderRadius: 2 }} />
                        </div>
                      </div>
                    ) : <span style={{ fontSize: 12, color: tokens.muted }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${tokens.border}`, background: "transparent", color: tokens.muted, fontSize: 12, cursor: "pointer" }}>Edit</button>
                      {u.role !== "admin" && (
                        <button onClick={() => setUsers(us => us.filter(x => x.id !== u.id))} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid rgba(244,63,94,0.3)`, background: "transparent", color: tokens.rose, fontSize: 12, cursor: "pointer" }}>Remove</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(null); // null = logged out, "student" | "admin" | "register"
  const [page, setPage] = useState("dashboard");

  function handleLogin(role) {
    if (role === "register") { setAuth("register"); return; }
    setAuth(role);
    setPage(role === "admin" ? "users" : "dashboard");
  }

  if (!auth || auth === "register") {
    if (auth === "register") return <RegisterPage onBack={handleLogin} />;
    return <LoginPage onLogin={handleLogin} />;
  }

  const isAdmin = auth === "admin";

  const pageMap = {
    dashboard: <DashboardPage isAdmin={isAdmin} />,
    tasks: <TasksPage isAdmin={isAdmin} />,
    subjects: <SubjectsPage />,
    calendar: <CalendarPage />,
    notifications: <NotificationsPage />,
    analytics: <AnalyticsPage />,
    users: <UsersPage />,
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh", background: tokens.bg,
      fontFamily: "'DM Sans', -apple-system, sans-serif", color: tokens.text,
    }}>
      <Sidebar page={page} setPage={p => { if (p === "login") { setAuth(null); } else setPage(p); }} isAdmin={isAdmin} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {pageMap[page] || pageMap.dashboard}
      </main>
    </div>
  );
}
