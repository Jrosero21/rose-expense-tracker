"use client";

import { useState, useMemo } from "react";
import { Plus, Check, Trash2, CreditCard } from "lucide-react";
import { money0 } from "@/lib/format";

export default function PaymentMethods({
  paymentMethods, expenses, month, onAdd, onDelete,
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const o = {};
    expenses
      .filter((e) => e.date.startsWith(month))
      .forEach((e) => {
        const k = e.paymentMethodId ?? "unspecified";
        o[k] = o[k] || { total: 0, count: 0 };
        o[k].total += e.amount;
        o[k].count++;
      });
    return o;
  }, [expenses, month]);

  const allCounts = useMemo(() => {
    const o = {};
    expenses.forEach((e) => {
      const k = e.paymentMethodId ?? "unspecified";
      o[k] = (o[k] || 0) + 1;
    });
    return o;
  }, [expenses]);

  const save = async () => {
    if (!name.trim() || busy) return;
    setError("");
    setBusy(true);
    try {
      await onAdd(name.trim());
      setName("");
      setAdding(false);
    } catch (e) {
      setError(e?.message || "Could not add payment method.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async (id) => {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await onDelete(id);
      setConfirmId(null);
    } catch (e) {
      setError(e?.message || "Could not delete payment method.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Organize</div>
          <h1 className="title">Payment methods</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding((v) => !v)}>
          <Plus size={17} /> New method
        </button>
      </header>

      {adding && (
        <div className="card form reveal" style={{ marginBottom: 18 }}>
          <div className="field">
            <div className="field-label">Name</div>
            <input
              className="input"
              placeholder="e.g. Amex …1234 or Operating Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              autoFocus
            />
          </div>
          <div className="auto-note">
            <Check size={13} /> A matching color is assigned automatically to keep
            your palette cohesive.
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button
              className="btn btn-ghost"
              onClick={() => setAdding(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={save} disabled={busy || !name.trim()}>
              <Check size={17} /> {busy ? "Adding…" : "Add method"}
            </button>
          </div>
        </div>
      )}

      {paymentMethods.length === 0 && !adding ? (
        <div className="card reveal">
          <div className="empty-state">
            No payment methods yet. Add your cards and accounts to track which one
            paid for each expense.
          </div>
        </div>
      ) : (
        <div className="cat-grid">
          {paymentMethods.map((p, i) => {
            const s = stats[p.id] || { total: 0, count: 0 };
            const used = allCounts[p.id] || 0;
            if (confirmId === p.id) {
              return (
                <div key={p.id} className="card cat-card cat-confirm reveal">
                  <div className="cc-mid">
                    <div className="cc-title">Delete “{p.name}”?</div>
                    <div className="cc-sub">
                      {used > 0
                        ? `${used} transaction${used > 1 ? "s" : ""} will become Unspecified.`
                        : "This method has no transactions."}
                    </div>
                  </div>
                  <div className="cc-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setConfirmId(null)}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => confirmDelete(p.id)}
                      disabled={busy}
                    >
                      <Trash2 size={14} /> {busy ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={p.id}
                className="card cat-card reveal"
                style={{ animationDelay: i * 30 + "ms" }}
              >
                <span className="cat-ic" style={{ background: p.soft, color: p.color }}>
                  <CreditCard size={20} />
                </span>
                <div className="cat-mid">
                  <div className="cat-name">{p.name}</div>
                  <div className="cat-count">{s.count} this month</div>
                </div>
                <div className="cat-amt">{money0(s.total)}</div>
                <button
                  className="cat-del"
                  title="Delete payment method"
                  onClick={() => setConfirmId(p.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
