"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { LayoutGrid, Plus, Tags, Wallet, X } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import Dashboard from "@/components/Dashboard";
import ExpenseForm from "@/components/ExpenseForm";
import Categories from "@/components/Categories";
import { createClient } from "@/lib/supabase/client";
import {
  THEMES, THEME_LIST, DEFAULT_THEME, cssVars, catColor, catSoft, UNCAT_COLOR, UNCAT_SOFT,
} from "@/lib/theme";
import { addMonth, monthsEndingAt, monthShort, monthLabel, money0 } from "@/lib/format";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "add", label: "Add expense", icon: Plus },
  { id: "categories", label: "Categories", icon: Tags },
];

const RECEIPTS_BUCKET = "receipts";

const monthsOf = (expenses) =>
  [...new Set(expenses.map((e) => e.date.slice(0, 7)))].sort();

const normalizeExpense = (row) => ({
  id: row.id,
  categoryId: row.category_id,
  amount: Number(row.amount),
  description: row.description,
  date: row.expense_date,
  recurring: row.is_recurring,
  receiptPath: row.receipt_path,
});

const EXPENSE_COLS =
  "id, category_id, amount, description, expense_date, is_recurring, receipt_path";

const safeName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

/* Theme persisted in localStorage, read via useSyncExternalStore so that the
   server/initial-hydration render uses the default and the stored choice is
   applied without a hydration mismatch. */
const THEME_STORAGE_KEY = "tally-theme";
let themeListeners = [];
const themeStore = {
  subscribe(cb) {
    themeListeners.push(cb);
    window.addEventListener("storage", cb);
    return () => {
      themeListeners = themeListeners.filter((l) => l !== cb);
      window.removeEventListener("storage", cb);
    };
  },
  getSnapshot() {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    return v && THEMES[v] ? v : DEFAULT_THEME;
  },
  getServerSnapshot() {
    return DEFAULT_THEME;
  },
  set(key) {
    window.localStorage.setItem(THEME_STORAGE_KEY, key);
    themeListeners.forEach((l) => l());
  },
};

export default function AppShell({ categories: initialCategories, expenses: initialExpenses, userId, serverMonth, today }) {
  const supabase = useMemo(() => createClient(), []);
  const themeKey = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  );
  const [view, setView] = useState("dashboard");
  const [categories, setCategories] = useState(initialCategories);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [editing, setEditing] = useState(null);
  const [month, setMonth] = useState(() => {
    const ms = monthsOf(initialExpenses);
    return ms.length ? ms[ms.length - 1] : serverMonth;
  });

  const T = THEMES[themeKey];

  const cats = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        color: catColor(T, c.position),
        soft: catSoft(T, c.position),
      })),
    [categories, T]
  );

  const catMap = useMemo(() => {
    const map = Object.fromEntries(cats.map((c) => [c.id, c]));
    map.uncat = {
      id: "uncat",
      name: "Uncategorized",
      icon: "tag",
      color: UNCAT_COLOR(T),
      soft: UNCAT_SOFT,
    };
    return map;
  }, [cats, T]);

  const { minMonth, maxMonth } = useMemo(() => {
    const ms = monthsOf(expenses);
    const min = ms.length ? ms[0] : serverMonth;
    let max = ms.length ? ms[ms.length - 1] : serverMonth;
    if (serverMonth > max) max = serverMonth;
    return { minMonth: min, maxMonth: max };
  }, [expenses, serverMonth]);

  const monthExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.date.startsWith(month))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, month]
  );
  const monthTotal = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses]
  );
  const recurringTotal = useMemo(
    () =>
      monthExpenses.filter((e) => e.recurring).reduce((s, e) => s + e.amount, 0),
    [monthExpenses]
  );

  const delta = useMemo(() => {
    const pm = addMonth(month, -1);
    const prevTotal = expenses
      .filter((e) => e.date.startsWith(pm))
      .reduce((s, e) => s + e.amount, 0);
    return prevTotal ? (monthTotal - prevTotal) / prevTotal : null;
  }, [expenses, month, monthTotal]);

  const byCategory = useMemo(() => {
    const sums = {};
    monthExpenses.forEach((e) => {
      const key = e.categoryId ?? "uncat";
      sums[key] = (sums[key] || 0) + e.amount;
    });
    return Object.entries(sums)
      .map(([id, value]) => {
        const c = catMap[id] || catMap.uncat;
        return { id: c.id, name: c.name, icon: c.icon, color: c.color, soft: c.soft, value };
      })
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses, catMap]);

  // The month-over-month window always ends at the current month (or later,
  // if future-dated expenses exist) — independent of the selected month — so
  // the current month is always visible on the chart.
  const series = useMemo(
    () =>
      monthsEndingAt(maxMonth, 6).map((m) => {
        const ms = expenses.filter((e) => e.date.startsWith(m));
        const recurring = ms
          .filter((e) => e.recurring)
          .reduce((s, e) => s + e.amount, 0);
        const total = ms.reduce((s, e) => s + e.amount, 0);
        return { key: m, label: monthShort(m), recurring, oneTime: total - recurring, total };
      }),
    [expenses, maxMonth]
  );

  const goPrev = () => {
    if (month > minMonth) setMonth(addMonth(month, -1));
  };
  const goNext = () => {
    if (month < maxMonth) setMonth(addMonth(month, 1));
  };

  const getSignedUrl = async (path) => {
    const { data } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  };

  // Resolve the receipt_path to persist: upload a new file, clear an old one,
  // or keep the existing path. Returns the path (or null).
  const resolveReceiptPath = async (receipt, oldPath) => {
    if (receipt?.kind === "new") {
      const isImage = receipt.file.type.startsWith("image/");
      let fileToUpload = receipt.file;
      if (isImage) {
        // Loaded in the browser only — it relies on Canvas/Worker APIs.
        const { default: imageCompression } = await import(
          "browser-image-compression"
        );
        fileToUpload = await imageCompression(receipt.file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
      }
      const path = `${userId}/${crypto.randomUUID()}-${safeName(receipt.file.name)}`;
      const { error } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .upload(path, fileToUpload, {
          contentType: fileToUpload.type || receipt.file.type,
        });
      if (error) throw error;
      if (oldPath) {
        await supabase.storage.from(RECEIPTS_BUCKET).remove([oldPath]);
      }
      return path;
    }
    if (!receipt) {
      if (oldPath) {
        await supabase.storage.from(RECEIPTS_BUCKET).remove([oldPath]);
      }
      return null;
    }
    return receipt.path; // unchanged existing receipt
  };

  const addExpense = async (vals) => {
    const receipt_path = await resolveReceiptPath(vals.receipt, null);
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: userId,
        category_id: vals.categoryId,
        amount: vals.amount,
        description: vals.description,
        expense_date: vals.date,
        is_recurring: vals.recurring,
        receipt_path,
      })
      .select(EXPENSE_COLS)
      .single();
    if (error) throw error;
    setExpenses((prev) => [normalizeExpense(data), ...prev]);
    setMonth(vals.date.slice(0, 7));
    setView("dashboard");
  };

  const saveEdit = async (vals) => {
    const receipt_path = await resolveReceiptPath(
      vals.receipt,
      editing.receiptPath ?? null
    );
    const { data, error } = await supabase
      .from("expenses")
      .update({
        category_id: vals.categoryId,
        amount: vals.amount,
        description: vals.description,
        expense_date: vals.date,
        is_recurring: vals.recurring,
        receipt_path,
      })
      .eq("id", editing.id)
      .select(EXPENSE_COLS)
      .single();
    if (error) throw error;
    setExpenses((prev) =>
      prev.map((e) => (e.id === editing.id ? normalizeExpense(data) : e))
    );
    setMonth(vals.date.slice(0, 7));
    setEditing(null);
  };

  const deleteExpense = async () => {
    if (editing.receiptPath) {
      await supabase.storage.from(RECEIPTS_BUCKET).remove([editing.receiptPath]);
    }
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", editing.id);
    if (error) throw error;
    setExpenses((prev) => prev.filter((e) => e.id !== editing.id));
    setEditing(null);
  };

  const addCategory = async (name) => {
    const position = categories.length
      ? Math.max(...categories.map((c) => c.position)) + 1
      : 0;
    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: userId, name, icon: "tag", position })
      .select("id, name, icon, position")
      .single();
    if (error) throw error;
    setCategories((prev) => [...prev, data]);
  };

  const deleteCategory = async (id) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    // DB sets category_id to null on affected expenses (on delete set null);
    // mirror that locally so they render as Uncategorized without a refetch.
    setExpenses((prev) =>
      prev.map((e) => (e.categoryId === id ? { ...e, categoryId: null } : e))
    );
  };

  return (
    <div className="et-app" style={cssVars(T)}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Wallet size={18} strokeWidth={2.4} />
          </div>
          <div className="brand-name">Tally</div>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={"nav-item" + (view === n.id ? " active" : "")}
              onClick={() => setView(n.id)}
            >
              <n.icon size={18} /> <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="theme-row">
          <div className="theme-label">Theme</div>
          <div className="theme-opts">
            {THEME_LIST.map((t) => (
              <button
                key={t.key}
                className={"theme-dot" + (themeKey === t.key ? " sel" : "")}
                title={t.name}
                style={{
                  background: `linear-gradient(135deg, ${t.bg} 0 50%, ${t.accent} 50% 100%)`,
                }}
                onClick={() => themeStore.set(t.key)}
              />
            ))}
          </div>
        </div>
        <div className="side-bottom">
          <div className="side-foot">
            <div className="side-foot-label">This month</div>
            <div className="side-foot-amt">{money0(monthTotal)}</div>
            <div className="side-foot-sub">{monthLabel(month)}</div>
          </div>
          <SignOutButton className="nav-item side-signout" />
        </div>
      </aside>

      <main className="main">
        {view === "dashboard" && (
          <Dashboard
            theme={T}
            month={month}
            goPrev={goPrev}
            goNext={goNext}
            canPrev={month > minMonth}
            canNext={month < maxMonth}
            monthTotal={monthTotal}
            recurringTotal={recurringTotal}
            delta={delta}
            byCategory={byCategory}
            series={series}
            monthExpenses={monthExpenses}
            catMap={catMap}
            onAddClick={() => setView("add")}
            onEdit={setEditing}
          />
        )}
        {view === "add" && (
          <div className="page page-narrow">
            <header className="topbar">
              <div>
                <div className="eyebrow">New entry</div>
                <h1 className="title">Add expense</h1>
              </div>
              <button className="icon-btn" onClick={() => setView("dashboard")}>
                <X size={18} />
              </button>
            </header>
            <div className="card reveal">
              <ExpenseForm
                categories={cats}
                today={today}
                getSignedUrl={getSignedUrl}
                onSave={addExpense}
                onCancel={() => setView("dashboard")}
              />
            </div>
          </div>
        )}
        {view === "categories" && (
          <Categories
            categories={cats}
            expenses={expenses}
            month={month}
            onAdd={addCategory}
            onDelete={deleteCategory}
          />
        )}
      </main>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal reveal-pop" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <div>
                <div className="eyebrow">Edit</div>
                <h2 className="modal-title">Edit expense</h2>
              </div>
              <button className="icon-btn" onClick={() => setEditing(null)}>
                <X size={18} />
              </button>
            </header>
            <ExpenseForm
              key={editing.id}
              categories={cats}
              initial={editing}
              today={today}
              getSignedUrl={getSignedUrl}
              onSave={saveEdit}
              onCancel={() => setEditing(null)}
              onDelete={deleteExpense}
            />
          </div>
        </div>
      )}

      <nav className="tabbar">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={"tab" + (view === n.id ? " active" : "")}
            onClick={() => setView(n.id)}
          >
            <n.icon size={20} /> <span>{n.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
