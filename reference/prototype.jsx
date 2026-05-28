import React, { useState, useMemo, useRef } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  LayoutGrid, Plus, Tags, Wallet, ChevronLeft, ChevronRight, ArrowUpRight,
  ArrowDownRight, Camera, Repeat, Receipt, Check, Calendar, X, Car, Zap,
  Sparkles, Wrench, Package, Sofa, Wifi, Sprout, Landmark, ShieldCheck,
  FileText, Building2, Percent, AppWindow, Megaphone, Briefcase, Stamp,
  CreditCard, Printer, UtensilsCrossed, Tag, Trash2, Pencil,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Themes — cohesive, system-generated palettes                      */
/* ------------------------------------------------------------------ */
const THEMES = {
  seaside: {
    name: "Seaside",
    bg: "#F4ECDD", surface: "#FFFCF6", ink: "#3B322A", soft: "#8A7E6E", faint: "#B3A899", line: "#E9DDCA",
    primary: "#1F6E66", primaryText: "#F4ECDD", accent: "#C96B52", accentSoft: "#F6DFD3", accentText: "#B0573E", onAccent: "#FFFFFF",
    heroFrom: "#1F6E66", heroTo: "#175650", heroText: "#EAF0EC", heroGlow: "rgba(201,107,82,.28)", heroBtnBg: "#C96B52", heroBtnText: "#FFFFFF",
    barMuted: "#E2D6C0", dot: "rgba(59,50,42,.05)", tipBg: "#3B322A", tipText: "#F4ECDD",
    catS: 40, catL: 55, catBaseH: 25,
  },
  graphite: {
    name: "Graphite",
    bg: "#EDEEF0", surface: "#FFFFFF", ink: "#1A1C20", soft: "#666A72", faint: "#9A9EA6", line: "#E1E3E7",
    primary: "#1A1C20", primaryText: "#F2F3F5", accent: "#C7892B", accentSoft: "#F3E7CC", accentText: "#8F6312", onAccent: "#20242A",
    heroFrom: "#1A1C20", heroTo: "#262A31", heroText: "#EEF0F2", heroGlow: "rgba(199,137,43,.18)", heroBtnBg: "#C7892B", heroBtnText: "#20242A",
    barMuted: "#D7DADE", dot: "rgba(26,28,32,.05)", tipBg: "#1A1C20", tipText: "#F2F3F5",
    catS: 42, catL: 48, catBaseH: 205,
  },
  midnight: {
    name: "Midnight",
    bg: "#15171D", surface: "#1C1F27", ink: "#E8E9EC", soft: "#9A9DA6", faint: "#6C707A", line: "#2A2E38",
    primary: "#34C2A6", primaryText: "#0E1A17", accent: "#34C2A6", accentSoft: "rgba(52,194,166,.16)", accentText: "#5FD8C0", onAccent: "#0E1A17",
    heroFrom: "#23262F", heroTo: "#181B22", heroText: "#E8E9EC", heroGlow: "rgba(52,194,166,.18)", heroBtnBg: "#34C2A6", heroBtnText: "#0E1A17",
    barMuted: "#2E323D", dot: "rgba(255,255,255,.04)", tipBg: "#2A2E38", tipText: "#E8E9EC",
    catS: 46, catL: 60, catBaseH: 160,
  },
};
const THEME_LIST = Object.entries(THEMES).map(([key, t]) => ({ key, name: t.name, bg: t.bg, accent: t.accent }));

const catColor = (T, i) => `hsl(${(T.catBaseH + i * 18) % 360} ${T.catS}% ${T.catL}%)`;
const catSoft = (T, i) => `hsl(${(T.catBaseH + i * 18) % 360} ${T.catS}% ${T.catL}% / 0.14)`;
const cssVars = (T) => ({
  "--bg": T.bg, "--surface": T.surface, "--ink": T.ink, "--soft": T.soft, "--faint": T.faint, "--line": T.line,
  "--primary": T.primary, "--primary-text": T.primaryText, "--accent": T.accent, "--accent-soft": T.accentSoft,
  "--accent-text": T.accentText, "--on-accent": T.onAccent, "--hero-from": T.heroFrom, "--hero-to": T.heroTo,
  "--hero-text": T.heroText, "--hero-glow": T.heroGlow, "--hero-btn-bg": T.heroBtnBg, "--hero-btn-text": T.heroBtnText,
  "--bar-muted": T.barMuted, "--dot": T.dot, "--tip-bg": T.tipBg, "--tip-text": T.tipText,
});

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MONTHS = ["2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];
const MONTH_LABEL = {
  "2025-12": "December 2025", "2026-01": "January 2026", "2026-02": "February 2026",
  "2026-03": "March 2026", "2026-04": "April 2026", "2026-05": "May 2026",
};
const SHORT = { "2025-12": "Dec", "2026-01": "Jan", "2026-02": "Feb", "2026-03": "Mar", "2026-04": "Apr", "2026-05": "May" };

const INITIAL_CATEGORIES = [
  { id: "cleaning", name: "Cleaning & Turnover", icon: "sparkles" },
  { id: "repairs", name: "Repairs & Maintenance", icon: "wrench" },
  { id: "supplies", name: "Supplies & Consumables", icon: "package" },
  { id: "furnishings", name: "Furnishings & Décor", icon: "sofa" },
  { id: "utilities", name: "Utilities", icon: "zap" },
  { id: "internet", name: "Internet & Streaming", icon: "wifi" },
  { id: "grounds", name: "Grounds & Pest", icon: "sprout" },
  { id: "mortgage", name: "Mortgage & Interest", icon: "landmark" },
  { id: "insurance", name: "Insurance", icon: "shield" },
  { id: "proptax", name: "Property Taxes", icon: "file" },
  { id: "hoa", name: "HOA Fees", icon: "building" },
  { id: "platform", name: "Platform & Booking Fees", icon: "percent" },
  { id: "software", name: "Software & Subscriptions", icon: "app" },
  { id: "marketing", name: "Marketing", icon: "megaphone" },
  { id: "professional", name: "Professional Services", icon: "briefcase" },
  { id: "licenses", name: "Licenses & Permits", icon: "stamp" },
  { id: "bankfees", name: "Bank & Merchant Fees", icon: "card" },
  { id: "travel", name: "Travel & Mileage", icon: "car" },
  { id: "meals", name: "Meals", icon: "meals" },
  { id: "office", name: "Office & Admin", icon: "printer" },
];

let _id = 1;
const row = (date, categoryId, description, amount, recurring = false, receipt = false) =>
  ({ id: _id++, date, categoryId, description, amount, recurring, receipt });

function buildExpenses() {
  const out = [];
  const utils = { "2025-12": 248, "2026-01": 271, "2026-02": 252, "2026-03": 214, "2026-04": 198, "2026-05": 176 };
  MONTHS.forEach((m) => {
    out.push(row(`${m}-01`, "mortgage", "Mortgage payment", 2640, true));
    out.push(row(`${m}-01`, "hoa", "HOA dues", 225, true));
    out.push(row(`${m}-05`, "insurance", "Property & liability insurance", 186, true));
    out.push(row(`${m}-03`, "software", "PMS + dynamic pricing + smart locks", 137, true));
    out.push(row(`${m}-08`, "internet", "Guest wifi + streaming", 94.99, true));
    out.push(row(`${m}-12`, "grounds", "Landscaping service", 145, true));
    out.push(row(`${m}-18`, "utilities", "Electric, water & gas", utils[m], true));
  });
  const variable = {
    "2025-12": [["cleaning", "Turnover cleans (4)", 520], ["platform", "Airbnb host fees", 312], ["supplies", "Toiletries & paper goods", 128], ["repairs", "Furnace tune-up", 185], ["bankfees", "Stripe processing fees", 46], ["proptax", "Property tax (semi-annual)", 1980]],
    "2026-01": [["cleaning", "Turnover cleans (5)", 650], ["platform", "Booking fees", 288], ["supplies", "Coffee & consumables", 96], ["furnishings", "Replacement linens", 142], ["bankfees", "Stripe processing fees", 51], ["licenses", "STR permit renewal", 250]],
    "2026-02": [["cleaning", "Turnover cleans (4)", 520], ["platform", "Booking fees", 264], ["supplies", "Restock essentials", 88], ["repairs", "Plumbing repair", 240], ["bankfees", "Stripe processing fees", 43], ["marketing", "New listing photos", 180]],
    "2026-03": [["cleaning", "Turnover cleans (6)", 780], ["platform", "Booking fees", 356], ["supplies", "Consumables", 112], ["travel", "Mileage – property visits", 68], ["bankfees", "Stripe processing fees", 58], ["office", "Postage & office supplies", 38]],
    "2026-04": [["cleaning", "Turnover cleans (5)", 650], ["platform", "Booking fees", 322], ["supplies", "Welcome baskets", 134], ["furnishings", "Patio furniture", 420], ["bankfees", "Stripe processing fees", 54], ["professional", "Bookkeeping (quarterly)", 275]],
    "2026-05": [
      ["cleaning", "Turnover clean – Unit A", 130, false, true],
      ["cleaning", "Turnover clean – Unit A", 130, false, true],
      ["platform", "Airbnb host service fees", 298, false, false],
      ["supplies", "Costco – paper & toiletries", 118.47, false, true],
      ["repairs", "Handyman – door lock fix", 95, false, true],
      ["furnishings", "New coffee maker", 84.99, false, false],
      ["marketing", "Boosted listing", 60, false, false],
      ["travel", "Mileage – check-in visit", 42.5, false, false],
      ["meals", "Coffee w/ cleaner", 11.25, false, true],
      ["bankfees", "Stripe processing fees", 52.3, false, false],
    ],
  };
  Object.entries(variable).forEach(([m, items]) => {
    items.forEach(([cat, desc, amt, rec = false, rcpt = false], i) => {
      const day = m === "2026-05" ? [27, 21, 26, 24, 23, 19, 16, 25, 28, 27][i] : 6 + i * 3;
      out.push(row(`${m}-${String(day).padStart(2, "0")}`, cat, desc, amt, rec, rcpt));
    });
  });
  return out;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const money = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = (n) => "$" + Math.round(Number(n)).toLocaleString("en-US");
const ICONS = {
  sparkles: Sparkles, wrench: Wrench, package: Package, sofa: Sofa, zap: Zap, wifi: Wifi,
  sprout: Sprout, landmark: Landmark, shield: ShieldCheck, file: FileText, building: Building2,
  percent: Percent, app: AppWindow, megaphone: Megaphone, briefcase: Briefcase, stamp: Stamp,
  card: CreditCard, car: Car, meals: UtensilsCrossed, printer: Printer, tag: Tag,
};
const Icon = ({ name, size = 16, ...p }) => { const C = ICONS[name] || Tag; return <C size={size} {...p} />; };
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [view, setView] = useState("dashboard");
  const [themeKey, setThemeKey] = useState("seaside");
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [expenses, setExpenses] = useState(buildExpenses);
  const [month, setMonth] = useState("2026-05");
  const [editing, setEditing] = useState(null);

  const T = THEMES[themeKey];
  const cats = useMemo(
    () => categories.map((c, i) =>
      c.id === "uncat"
        ? { ...c, color: T.faint, soft: "rgba(140,140,140,0.16)" }
        : { ...c, color: catColor(T, i), soft: catSoft(T, i) }
    ),
    [categories, T]
  );
  const catMap = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c])), [cats]);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, month]
  );
  const monthTotal = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses]);
  const recurringTotal = useMemo(() => monthExpenses.filter((e) => e.recurring).reduce((s, e) => s + e.amount, 0), [monthExpenses]);

  const idx = MONTHS.indexOf(month);
  const prevTotal = useMemo(() => {
    const pm = MONTHS[idx - 1];
    if (!pm) return null;
    return expenses.filter((e) => e.date.startsWith(pm)).reduce((s, e) => s + e.amount, 0);
  }, [expenses, idx]);
  const delta = prevTotal ? (monthTotal - prevTotal) / prevTotal : null;

  const byCategory = useMemo(() => {
    const sums = {};
    monthExpenses.forEach((e) => { sums[e.categoryId] = (sums[e.categoryId] || 0) + e.amount; });
    return cats.map((c) => ({ ...c, value: sums[c.id] || 0 })).filter((c) => c.value > 0).sort((a, b) => b.value - a.value);
  }, [monthExpenses, cats]);

  const series = useMemo(
    () => MONTHS.map((m) => {
      const ms = expenses.filter((e) => e.date.startsWith(m));
      const recurring = ms.filter((e) => e.recurring).reduce((s, e) => s + e.amount, 0);
      const total = ms.reduce((s, e) => s + e.amount, 0);
      return { key: m, label: SHORT[m], recurring, oneTime: total - recurring, total };
    }),
    [expenses]
  );

  const goMonth = (dir) => { const n = idx + dir; if (n >= 0 && n < MONTHS.length) setMonth(MONTHS[n]); };
  const addExpense = (exp) => { setExpenses((p) => [...p, { ...exp, id: _id++ }]); setMonth(exp.date.slice(0, 7)); setView("dashboard"); };
  const saveEdit = (vals) => { setExpenses((p) => p.map((e) => (e.id === editing.id ? { ...e, ...vals } : e))); setMonth(vals.date.slice(0, 7)); setEditing(null); };
  const deleteExpense = () => { setExpenses((p) => p.filter((e) => e.id !== editing.id)); setEditing(null); };
  const addCategory = (c) => setCategories((p) => [...p, c]);
  const deleteCategory = (id) => {
    const hadExpenses = expenses.some((e) => e.categoryId === id);
    if (hadExpenses) setExpenses((p) => p.map((e) => (e.categoryId === id ? { ...e, categoryId: "uncat" } : e)));
    setCategories((p) => {
      let next = p.filter((c) => c.id !== id);
      if (hadExpenses && !next.some((c) => c.id === "uncat")) next = [...next, { id: "uncat", name: "Uncategorized", icon: "tag" }];
      return next;
    });
  };

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "add", label: "Add expense", icon: Plus },
    { id: "categories", label: "Categories", icon: Tags },
  ];

  return (
    <div className="et-app" style={cssVars(T)}>
      <style>{CSS}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Wallet size={18} strokeWidth={2.4} /></div>
          <div className="brand-name">Tally</div>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.id} className={"nav-item" + (view === n.id ? " active" : "")} onClick={() => setView(n.id)}>
              <n.icon size={18} /> <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="theme-row">
          <div className="theme-label">Theme</div>
          <div className="theme-opts">
            {THEME_LIST.map((t) => (
              <button key={t.key} className={"theme-dot" + (themeKey === t.key ? " sel" : "")} title={t.name}
                style={{ background: `linear-gradient(135deg, ${t.bg} 0 50%, ${t.accent} 50% 100%)` }}
                onClick={() => setThemeKey(t.key)} />
            ))}
          </div>
        </div>
        <div className="side-foot">
          <div className="side-foot-label">This month</div>
          <div className="side-foot-amt">{money0(monthTotal)}</div>
          <div className="side-foot-sub">{MONTH_LABEL[month]}</div>
        </div>
      </aside>

      <main className="main">
        {view === "dashboard" && (
          <Dashboard {...{ theme: T, month, goMonth, idx, monthTotal, recurringTotal, delta, byCategory, series, monthExpenses, catMap, setView, onEdit: setEditing }} />
        )}
        {view === "add" && (
          <div className="page page-narrow">
            <header className="topbar">
              <div><div className="eyebrow">New entry</div><h1 className="title">Add expense</h1></div>
              <button className="icon-btn" onClick={() => setView("dashboard")}><X size={18} /></button>
            </header>
            <div className="card reveal"><ExpenseForm categories={cats} onSave={addExpense} onCancel={() => setView("dashboard")} /></div>
          </div>
        )}
        {view === "categories" && <Categories {...{ categories: cats, expenses, month, onAdd: addCategory, onDelete: deleteCategory }} />}
      </main>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal reveal-pop" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <div><div className="eyebrow">Edit</div><h2 className="modal-title">Edit expense</h2></div>
              <button className="icon-btn" onClick={() => setEditing(null)}><X size={18} /></button>
            </header>
            <ExpenseForm key={editing.id} categories={cats} initial={editing} onSave={saveEdit} onCancel={() => setEditing(null)} onDelete={deleteExpense} />
          </div>
        </div>
      )}

      <nav className="tabbar">
        {NAV.map((n) => (
          <button key={n.id} className={"tab" + (view === n.id ? " active" : "")} onClick={() => setView(n.id)}>
            <n.icon size={20} /> <span>{n.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */
function Dashboard({ theme, month, goMonth, idx, monthTotal, recurringTotal, delta, byCategory, series, monthExpenses, catMap, setView, onEdit }) {
  const up = delta != null && delta > 0;
  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Overview</div>
          <h1 className="title">Dashboard</h1>
        </div>
        <div className="month-nav">
          <button className="icon-btn" onClick={() => goMonth(-1)} disabled={idx === 0}><ChevronLeft size={18} /></button>
          <span className="month-label"><Calendar size={14} /> {MONTH_LABEL[month]}</span>
          <button className="icon-btn" onClick={() => goMonth(1)} disabled={idx === MONTHS.length - 1}><ChevronRight size={18} /></button>
        </div>
      </header>

      <div className="grid">
        <section className="card hero reveal" style={{ animationDelay: "0ms" }}>
          <div className="hero-label">Total spent</div>
          <div className="hero-amount">{money(monthTotal)}</div>
          {delta != null && (
            <div className={"delta " + (up ? "delta-up" : "delta-down")}>
              {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
              {Math.abs(delta * 100).toFixed(1)}% vs last month
            </div>
          )}
          <div className="hero-stats">
            <div><span className="hs-num">{money0(recurringTotal)}</span><span className="hs-lab">Recurring</span></div>
            <div><span className="hs-num">{money0(monthTotal - recurringTotal)}</span><span className="hs-lab">One-time</span></div>
            <div><span className="hs-num">{monthExpenses.length}</span><span className="hs-lab">Transactions</span></div>
          </div>
          <button className="btn hero-add" onClick={() => setView("add")}><Plus size={17} /> Add expense</button>
        </section>

        <section className="card reveal" style={{ animationDelay: "70ms" }}>
          <div className="card-head"><h2 className="card-title">By category</h2></div>
          <div className="donut-wrap">
            <div className="donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} paddingAngle={2} stroke="none">
                    {byCategory.map((c) => <Cell key={c.id} fill={c.color} />)}
                  </Pie>
                  <Tooltip content={<PieTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span className="dc-lab">Total</span>
                <span className="dc-num">{money0(monthTotal)}</span>
              </div>
            </div>
            <ul className="legend">
              {byCategory.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <span className="dot" style={{ background: c.color }} />
                  <span className="lg-name">{c.name}</span>
                  <span className="lg-amt">{money0(c.value)}</span>
                  <span className="lg-pct">{Math.round((c.value / monthTotal) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card span-2 reveal" style={{ animationDelay: "140ms" }}>
          <div className="card-head">
            <h2 className="card-title">Month over month</h2>
            <div className="chart-legend">
              <span><i className="cl-dot cl-rec" /> Recurring</span>
              <span><i className="cl-dot cl-one" /> One-time</span>
            </div>
          </div>
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="32%">
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: theme.faint, fontSize: 12, fontFamily: "'Hanken Grotesk', sans-serif" }} />
                <Tooltip cursor={{ fill: "rgba(128,128,128,0.07)" }} content={<BarTip />} />
                <Bar dataKey="recurring" stackId="a" fill={theme.accent} />
                <Bar dataKey="oneTime" stackId="a" fill={theme.barMuted} radius={[7, 7, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card span-2 reveal" style={{ animationDelay: "210ms" }}>
          <div className="card-head">
            <h2 className="card-title">Transactions</h2>
            <span className="muted">{MONTH_LABEL[month]}</span>
          </div>
          <ul className="tx-list">
            {monthExpenses.map((e) => {
              const c = catMap[e.categoryId] || {};
              return (
                <li key={e.id} className="tx" onClick={() => onEdit(e)}>
                  <span className="tx-ic" style={{ background: c.soft, color: c.color }}><Icon name={c.icon} size={17} /></span>
                  <div className="tx-mid">
                    <div className="tx-desc">
                      {e.description}
                      {e.recurring && <span className="tag tag-rec"><Repeat size={11} /> Recurring</span>}
                      {e.receipt && <span className="tag tag-rcpt"><Receipt size={11} /> Receipt</span>}
                    </div>
                    <div className="tx-meta">{c.name} · {fmtDate(e.date)}</div>
                  </div>
                  <span className="tx-amt">{money(e.amount)}</span>
                  <span className="tx-edit"><Pencil size={14} /></span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

const BarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const rec = payload.find((p) => p.dataKey === "recurring")?.value || 0;
  const one = payload.find((p) => p.dataKey === "oneTime")?.value || 0;
  return (
    <div className="tip">
      <div className="tip-lab">{label}</div>
      <div className="tip-num">{money(rec + one)}</div>
      <div className="tip-split">
        <span><i className="ts-dot ts-rec" /> Recurring {money(rec)}</span>
        <span><i className="ts-dot ts-one" /> One-time {money(one)}</span>
      </div>
    </div>
  );
};

const PieTip = ({ active, payload }) =>
  active && payload?.length ? (
    <div className="tip"><div className="tip-lab"><span className="dot" style={{ background: payload[0].payload.color }} /> {payload[0].name}</div><div className="tip-num">{money(payload[0].value)}</div></div>
  ) : null;

/* ------------------------------------------------------------------ */
/*  Expense Form (add + edit)                                          */
/* ------------------------------------------------------------------ */
function ExpenseForm({ categories, initial, onSave, onCancel, onDelete }) {
  const editMode = !!onDelete;
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [date, setDate] = useState(initial?.date || "2026-05-28");
  const [recurring, setRecurring] = useState(initial?.recurring || false);
  const [receipt, setReceipt] = useState(initial?.receipt ? { name: "Receipt attached", url: null } : null);
  const fileRef = useRef(null);

  const valid = Number(amount) > 0 && categoryId && description.trim();
  const submit = () => { if (valid) onSave({ amount: Number(amount), categoryId, description: description.trim(), date, recurring, receipt: !!receipt }); };
  const onFile = (e) => { const f = e.target.files?.[0]; if (f) setReceipt({ name: f.name, url: URL.createObjectURL(f) }); };

  return (
    <div className="form">
      <label className="amount-field">
        <span className="amount-cur">$</span>
        <input className="amount-input" type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </label>

      <div className="field">
        <div className="field-label">Category</div>
        <div className="chip-grid">
          {categories.map((c) => (
            <button key={c.id} className={"chip" + (categoryId === c.id ? " sel" : "")} style={categoryId === c.id ? { borderColor: c.color, background: c.soft } : {}} onClick={() => setCategoryId(c.id)}>
              <span className="chip-dot" style={{ background: c.color }}><Icon name={c.icon} size={13} color="#fff" /></span>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <div className="field-label">Description</div>
        <input className="input" placeholder="e.g. Turnover clean for Unit A" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="field-row">
        <div className="field">
          <div className="field-label">Date</div>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <div className="field-label">Recurring</div>
          <button className={"toggle" + (recurring ? " on" : "")} onClick={() => setRecurring((v) => !v)}>
            <span className="toggle-knob" /><span className="toggle-txt">{recurring ? "Repeats monthly" : "One-time"}</span>
          </button>
        </div>
      </div>

      <div className="field">
        <div className="field-label">Receipt</div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onFile} />
        {!receipt ? (
          <button className="receipt-drop" onClick={() => fileRef.current?.click()}>
            <Camera size={20} /><div><div className="rd-title">Take photo or upload</div><div className="rd-sub">Opens your camera on mobile</div></div>
          </button>
        ) : (
          <div className="receipt-have">
            {receipt.url ? <img src={receipt.url} alt="receipt" className="receipt-thumb" /> : <span className="receipt-thumb receipt-thumb-ph"><Receipt size={20} /></span>}
            <div className="rh-mid"><div className="rh-name">{receipt.name}</div><div className="rh-ok"><Check size={13} /> Attached</div></div>
            <button className="icon-btn sm" onClick={() => setReceipt(null)}><X size={15} /></button>
          </div>
        )}
      </div>

      <div className="form-actions">
        <div className="fa-left">
          {editMode && <button className="btn btn-danger-ghost" onClick={onDelete}><Trash2 size={15} /> Delete</button>}
        </div>
        <div className="fa-right">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}><Check size={17} /> {editMode ? "Save changes" : "Save expense"}</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */
function Categories({ categories, expenses, month, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const stats = useMemo(() => {
    const m = expenses.filter((e) => e.date.startsWith(month));
    const o = {};
    m.forEach((e) => { o[e.categoryId] = o[e.categoryId] || { total: 0, count: 0 }; o[e.categoryId].total += e.amount; o[e.categoryId].count++; });
    return o;
  }, [expenses, month]);

  const allCounts = useMemo(() => {
    const o = {};
    expenses.forEach((e) => { o[e.categoryId] = (o[e.categoryId] || 0) + 1; });
    return o;
  }, [expenses]);

  const save = () => { if (!name.trim()) return; onAdd({ id: "c" + Date.now(), name: name.trim(), icon: "tag" }); setName(""); setAdding(false); };
  const confirmDelete = (id) => { onDelete(id); setConfirmId(null); };

  return (
    <div className="page">
      <header className="topbar">
        <div><div className="eyebrow">Organize</div><h1 className="title">Categories</h1></div>
        <button className="btn btn-primary" onClick={() => setAdding((v) => !v)}><Plus size={17} /> New category</button>
      </header>

      {adding && (
        <div className="card form reveal" style={{ marginBottom: 18 }}>
          <div className="field"><div className="field-label">Name</div><input className="input" placeholder="e.g. Co-host Payouts" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
          <div className="auto-note"><Check size={13} /> A matching color is assigned automatically to keep your palette cohesive.</div>
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button><button className="btn btn-primary" onClick={save}><Check size={17} /> Add category</button></div>
        </div>
      )}

      <div className="cat-grid">
        {categories.map((c, i) => {
          const s = stats[c.id] || { total: 0, count: 0 };
          const used = allCounts[c.id] || 0;
          if (confirmId === c.id) {
            return (
              <div key={c.id} className="card cat-card cat-confirm reveal">
                <div className="cc-mid">
                  <div className="cc-title">Delete “{c.name}”?</div>
                  <div className="cc-sub">{used > 0 ? `${used} transaction${used > 1 ? "s" : ""} will move to Uncategorized.` : "This category has no transactions."}</div>
                </div>
                <div className="cc-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Cancel</button>
                  <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(c.id)}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            );
          }
          return (
            <div key={c.id} className="card cat-card reveal" style={{ animationDelay: i * 30 + "ms" }}>
              <span className="cat-ic" style={{ background: c.soft, color: c.color }}><Icon name={c.icon} size={20} /></span>
              <div className="cat-mid"><div className="cat-name">{c.name}</div><div className="cat-count">{s.count} this month</div></div>
              <div className="cat-amt">{money0(s.total)}</div>
              <button className="cat-del" title="Delete category" onClick={() => setConfirmId(c.id)}><Trash2 size={16} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

.et-app *{box-sizing:border-box;}
.et-app{
  font-family:'Hanken Grotesk',-apple-system,sans-serif;
  color:var(--ink); background:var(--bg);
  background-image:radial-gradient(circle at 1px 1px, var(--dot) 1px, transparent 0);
  background-size:26px 26px;
  display:grid; grid-template-columns:236px 1fr; min-height:100vh; width:100%;
  -webkit-font-smoothing:antialiased; transition:background-color .3s ease, color .3s ease;
}
.et-app input{font-family:inherit;}

.sidebar{border-right:1px solid var(--line); padding:26px 18px; display:flex; flex-direction:column; gap:26px; background:transparent;}
.brand{display:flex; align-items:center; gap:11px;}
.brand-mark{width:36px; height:36px; border-radius:11px; background:var(--accent); color:var(--on-accent); display:grid; place-items:center; box-shadow:0 4px 14px var(--hero-glow);}
.brand-name{font-family:'Fraunces',serif; font-weight:600; font-size:23px; letter-spacing:-.02em; color:var(--ink);}
.nav{display:flex; flex-direction:column; gap:3px;}
.nav-item{display:flex; align-items:center; gap:12px; padding:11px 13px; border-radius:11px; border:none; background:none; color:var(--soft); font-size:14.5px; font-weight:500; cursor:pointer; transition:.16s; text-align:left;}
.nav-item:hover{background:rgba(128,128,128,.12); color:var(--ink);}
.nav-item.active{background:var(--primary); color:var(--primary-text);}
.theme-row{padding:0 4px;}
.theme-label{font-size:11px; text-transform:uppercase; letter-spacing:.09em; color:var(--faint); font-weight:600; margin-bottom:10px;}
.theme-opts{display:flex; gap:9px;}
.theme-dot{width:30px; height:30px; border-radius:9px; border:2px solid var(--line); cursor:pointer; padding:0; transition:.14s;}
.theme-dot:hover{transform:translateY(-1px);}
.theme-dot.sel{border-color:var(--ink); transform:scale(1.06);}
.side-foot{margin-top:auto; padding:16px; border-radius:14px; background:var(--surface); border:1px solid var(--line);}
.side-foot-label{font-size:11px; text-transform:uppercase; letter-spacing:.09em; color:var(--faint); font-weight:600;}
.side-foot-amt{font-family:'JetBrains Mono',monospace; font-size:24px; font-weight:700; margin-top:6px; letter-spacing:-.02em;}
.side-foot-sub{font-size:12.5px; color:var(--soft); margin-top:2px;}

.main{overflow:auto;}
.page{padding:34px 40px 60px; max-width:1080px;}
.page-narrow{max-width:620px;}
.topbar{display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:26px; gap:16px;}
.eyebrow{font-size:11.5px; text-transform:uppercase; letter-spacing:.12em; color:var(--accent-text); font-weight:700;}
.title{font-family:'Fraunces',serif; font-size:34px; font-weight:600; letter-spacing:-.025em; margin:3px 0 0;}
.month-nav{display:flex; align-items:center; gap:6px;}
.month-label{display:inline-flex; align-items:center; gap:7px; font-size:13.5px; font-weight:600; padding:0 6px; color:var(--ink); min-width:140px; justify-content:center;}
.icon-btn{width:36px; height:36px; border-radius:10px; border:1px solid var(--line); background:var(--surface); display:grid; place-items:center; cursor:pointer; color:var(--soft); transition:.15s;}
.icon-btn:hover:not(:disabled){border-color:var(--ink); color:var(--ink);}
.icon-btn:disabled{opacity:.35; cursor:default;}
.icon-btn.sm{width:30px; height:30px;}

.grid{display:grid; grid-template-columns:1fr 1fr; gap:18px;}
.span-2{grid-column:1 / -1;}
.card{background:var(--surface); border:1px solid var(--line); border-radius:18px; padding:22px; transition:background-color .3s ease, border-color .3s ease;}
.card-head{display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;}
.card-title{font-family:'Fraunces',serif; font-size:18px; font-weight:600; margin:0; letter-spacing:-.01em;}
.muted{font-size:12.5px; color:var(--faint);}

.hero{display:flex; flex-direction:column; background:linear-gradient(155deg,var(--hero-from) 0%,var(--hero-to) 100%); color:var(--hero-text); border:none; position:relative; overflow:hidden;}
.hero::after{content:""; position:absolute; right:-50px; top:-50px; width:190px; height:190px; border-radius:50%; background:radial-gradient(circle,var(--hero-glow),transparent 70%);}
.hero-label{font-size:12px; text-transform:uppercase; letter-spacing:.1em; color:var(--hero-text); opacity:.6; font-weight:600;}
.hero-amount{font-family:'JetBrains Mono',monospace; font-size:46px; font-weight:700; letter-spacing:-.03em; margin:8px 0 0; line-height:1;}
.delta{display:inline-flex; align-items:center; gap:4px; font-size:12.5px; font-weight:600; margin-top:12px; padding:4px 9px; border-radius:20px; align-self:flex-start;}
.delta-up{background:rgba(220,110,80,.22); color:#F2A98E;}
.delta-down{background:rgba(120,200,150,.18); color:#A9DDB9;}
.hero-stats{display:flex; gap:24px; margin-top:22px; padding-top:18px; border-top:1px solid rgba(255,255,255,.12);}
.hero-stats div{display:flex; flex-direction:column; gap:3px;}
.hs-num{font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:600;}
.hs-lab{font-size:11.5px; color:var(--hero-text); opacity:.55;}
.hero-add{margin-top:22px; align-self:flex-start; background:var(--hero-btn-bg); color:var(--hero-btn-text);}
.hero-add:hover{filter:brightness(1.08);}

.btn{display:inline-flex; align-items:center; gap:7px; border:none; border-radius:11px; padding:11px 17px; font-size:14px; font-weight:600; font-family:inherit; cursor:pointer; transition:.16s;}
.btn-primary{background:var(--primary); color:var(--primary-text);}
.btn-primary:hover:not(:disabled){filter:brightness(1.12);}
.btn-primary:disabled{opacity:.4; cursor:default;}
.btn-ghost{background:transparent; color:var(--soft); border:1px solid var(--line);}
.btn-ghost:hover{border-color:var(--ink); color:var(--ink);}

.donut-wrap{display:flex; align-items:center; gap:14px;}
.donut{position:relative; width:180px; height:180px; flex-shrink:0;}
.donut-center{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none;}
.dc-lab{font-size:10.5px; text-transform:uppercase; letter-spacing:.08em; color:var(--faint); font-weight:600;}
.dc-num{font-family:'JetBrains Mono',monospace; font-size:21px; font-weight:700; letter-spacing:-.02em;}
.legend{list-style:none; margin:0; padding:0; flex:1; display:flex; flex-direction:column; gap:9px;}
.legend li{display:flex; align-items:center; gap:9px; font-size:13px;}
.dot{width:9px; height:9px; border-radius:50%; flex-shrink:0; display:inline-block;}
.lg-name{flex:1; color:var(--ink); font-weight:500;}
.lg-amt{font-family:'JetBrains Mono',monospace; font-weight:600; font-size:12.5px;}
.lg-pct{font-size:11.5px; color:var(--faint); width:34px; text-align:right;}

.tx-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column;}
.tx{display:flex; align-items:center; gap:13px; padding:11px 8px; border-bottom:1px solid var(--line); border-radius:10px; cursor:pointer; transition:background-color .12s;}
.tx:hover{background:rgba(128,128,128,.06);}
.tx-edit{display:flex; color:var(--faint); opacity:0; transition:opacity .12s; margin-left:-2px;}
.tx:hover .tx-edit{opacity:1;}
.tx:last-child{border-bottom:none;}
.tx-ic{width:38px; height:38px; border-radius:11px; display:grid; place-items:center; flex-shrink:0;}
.tx-mid{flex:1; min-width:0;}
.tx-desc{font-weight:600; font-size:14px; display:flex; align-items:center; gap:7px; flex-wrap:wrap;}
.tx-meta{font-size:12.5px; color:var(--soft); margin-top:2px;}
.tx-amt{font-family:'JetBrains Mono',monospace; font-weight:600; font-size:14.5px; letter-spacing:-.02em;}
.tag{display:inline-flex; align-items:center; gap:3px; font-size:10.5px; font-weight:600; padding:2px 7px; border-radius:20px;}
.tag-rec{background:rgba(128,128,128,.16); color:var(--soft);}
.tag-rcpt{background:var(--accent-soft); color:var(--accent-text);}

.tip{background:var(--tip-bg); color:var(--tip-text); padding:8px 11px; border-radius:9px; box-shadow:0 6px 18px rgba(0,0,0,.22);}
.tip-lab{font-size:11.5px; opacity:.7; display:flex; align-items:center; gap:6px;}
.tip-num{font-family:'JetBrains Mono',monospace; font-weight:600; font-size:14px; margin-top:2px;}
.tip-split{display:flex; flex-direction:column; gap:3px; margin-top:7px; padding-top:7px; border-top:1px solid rgba(255,255,255,.14); font-size:11px; opacity:.9;}
.tip-split span{display:flex; align-items:center; gap:6px;}
.ts-dot{width:8px; height:8px; border-radius:2px; display:inline-block;}
.ts-rec{background:var(--accent);}
.ts-one{background:var(--bar-muted);}
.chart-legend{display:flex; gap:14px; font-size:12px; color:var(--soft);}
.chart-legend span{display:flex; align-items:center; gap:6px;}
.cl-dot{width:9px; height:9px; border-radius:3px; display:inline-block;}
.cl-rec{background:var(--accent);}
.cl-one{background:var(--bar-muted);}

.form{display:flex; flex-direction:column; gap:20px;}
.amount-field{display:flex; align-items:center; gap:6px; padding:14px 18px; border:1px solid var(--line); border-radius:14px; background:var(--bg);}
.amount-field:focus-within{border-color:var(--accent);}
.amount-cur{font-family:'JetBrains Mono',monospace; font-size:30px; font-weight:700; color:var(--faint);}
.amount-input{font-family:'JetBrains Mono',monospace; font-size:34px; font-weight:700; border:none; background:none; outline:none; width:100%; color:var(--ink); letter-spacing:-.02em;}
.field-label{font-size:12.5px; font-weight:600; color:var(--soft); margin-bottom:9px;}
.field-row{display:flex; gap:16px;}
.field-row .field{flex:1;}
.input{width:100%; padding:12px 14px; border:1px solid var(--line); border-radius:11px; font-size:14.5px; background:var(--bg); outline:none; color:var(--ink); transition:.15s;}
.input:focus{border-color:var(--accent);}
.chip-grid{display:flex; flex-wrap:wrap; gap:8px; max-height:196px; overflow-y:auto; padding:2px;}
.chip{display:inline-flex; align-items:center; gap:8px; padding:8px 13px 8px 9px; border:1px solid var(--line); border-radius:30px; background:var(--surface); font-size:13.5px; font-weight:500; cursor:pointer; transition:.15s; color:var(--ink);}
.chip:hover{border-color:var(--soft);}
.chip-dot{width:22px; height:22px; border-radius:50%; display:grid; place-items:center;}
.toggle{display:flex; align-items:center; gap:10px; padding:9px 13px; border:1px solid var(--line); border-radius:11px; background:var(--bg); cursor:pointer; width:100%; transition:.15s;}
.toggle-knob{width:38px; height:22px; border-radius:20px; background:rgba(140,140,140,.45); position:relative; transition:.18s; flex-shrink:0;}
.toggle-knob::after{content:""; position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; background:#fff; transition:.18s; box-shadow:0 1px 3px rgba(0,0,0,.2);}
.toggle.on .toggle-knob{background:var(--accent);}
.toggle.on .toggle-knob::after{transform:translateX(16px);}
.toggle-txt{font-size:13.5px; font-weight:500; color:var(--ink);}
.receipt-drop{display:flex; align-items:center; gap:13px; width:100%; padding:16px; border:1.5px dashed var(--line); border-radius:13px; background:var(--bg); cursor:pointer; color:var(--soft); transition:.15s;}
.receipt-drop:hover{border-color:var(--accent); color:var(--accent);}
.rd-title{font-size:14px; font-weight:600; color:var(--ink); text-align:left;}
.rd-sub{font-size:12px; color:var(--soft); text-align:left;}
.receipt-have{display:flex; align-items:center; gap:13px; padding:12px; border:1px solid var(--line); border-radius:13px; background:var(--bg);}
.receipt-thumb{width:46px; height:46px; border-radius:9px; object-fit:cover; flex-shrink:0;}
.rh-mid{flex:1; min-width:0;}
.rh-name{font-size:13.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
.rh-ok{display:inline-flex; align-items:center; gap:4px; font-size:12px; color:var(--accent-text); font-weight:600; margin-top:2px;}
.form-actions{display:flex; justify-content:space-between; align-items:center; gap:10px; padding-top:4px;}
.fa-left{display:flex;}
.fa-right{display:flex; gap:10px;}
.btn-danger-ghost{background:transparent; color:#D2503F; border:1px solid transparent;}
.btn-danger-ghost:hover{background:rgba(210,80,63,.12);}
.receipt-thumb-ph{display:grid; place-items:center; background:var(--accent-soft); color:var(--accent-text);}
.modal-overlay{position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(2px); display:grid; place-items:center; z-index:50; padding:20px;}
.modal{background:var(--surface); border:1px solid var(--line); border-radius:20px; padding:24px; width:min(560px,94vw); max-height:88vh; overflow:auto; box-shadow:0 24px 60px rgba(0,0,0,.32);}
.modal-head{display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;}
.modal-title{font-family:'Fraunces',serif; font-size:24px; font-weight:600; margin:3px 0 0; letter-spacing:-.02em;}
@keyframes pop{from{opacity:0; transform:translateY(10px) scale(.985);}to{opacity:1; transform:none;}}
.reveal-pop{animation:pop .22s cubic-bezier(.2,.7,.3,1) both;}
.auto-note{display:flex; align-items:center; gap:7px; font-size:12.5px; color:var(--soft); background:var(--accent-soft); padding:9px 12px; border-radius:10px;}
.auto-note svg{color:var(--accent-text);}

.cat-grid{display:grid; grid-template-columns:1fr 1fr; gap:14px;}
.cat-card{display:flex; align-items:center; gap:14px; padding:18px;}
.cat-ic{width:46px; height:46px; border-radius:13px; display:grid; place-items:center; flex-shrink:0;}
.cat-mid{flex:1;}
.cat-name{font-weight:600; font-size:15px;}
.cat-count{font-size:12.5px; color:var(--soft); margin-top:1px;}
.cat-amt{font-family:'JetBrains Mono',monospace; font-weight:700; font-size:17px; letter-spacing:-.02em;}
.cat-card{position:relative;}
.cat-del{position:absolute; top:10px; right:10px; width:28px; height:28px; border-radius:8px; border:none; background:transparent; color:var(--faint); display:grid; place-items:center; cursor:pointer; opacity:.5; transition:.15s;}
.cat-card:hover .cat-del, .cat-del:hover{opacity:1;}
.cat-del:hover{background:rgba(210,80,63,.14); color:#D2503F;}
.cat-confirm{flex-direction:column; align-items:stretch; gap:14px; border-color:var(--accent);}
.cc-title{font-weight:600; font-size:14.5px;}
.cc-sub{font-size:12.5px; color:var(--soft); margin-top:3px;}
.cc-actions{display:flex; justify-content:flex-end; gap:8px;}
.btn-sm{padding:8px 13px; font-size:13px; border-radius:9px;}
.btn-danger{background:#D2503F; color:#fff;}
.btn-danger:hover{filter:brightness(1.07);}

.tabbar{display:none;}

@keyframes rise{from{opacity:0; transform:translateY(12px);}to{opacity:1; transform:none;}}
.reveal{animation:rise .5s cubic-bezier(.2,.7,.3,1) both;}

@media(max-width:760px){
  .et-app{grid-template-columns:1fr;}
  .sidebar{display:none;}
  .page{padding:22px 18px 90px;}
  .grid,.cat-grid{grid-template-columns:1fr;}
  .title{font-size:27px;}
  .hero-amount{font-size:38px;}
  .donut-wrap{flex-direction:column;}
  .tabbar{display:flex; position:fixed; bottom:0; left:0; right:0; background:var(--surface); border-top:1px solid var(--line); padding:8px 8px calc(8px + env(safe-area-inset-bottom)); justify-content:space-around; z-index:20;}
  .tab{display:flex; flex-direction:column; align-items:center; gap:3px; border:none; background:none; color:var(--soft); font-size:11px; font-weight:600; padding:6px 14px; border-radius:10px; cursor:pointer;}
  .tab.active{color:var(--accent);}
}
`;
