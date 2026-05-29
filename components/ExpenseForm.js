"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Receipt, FileText, Check, X, Trash2 } from "lucide-react";

const isPdfPath = (p) => /\.pdf$/i.test(p);
import Icon from "@/components/Icon";

export default function ExpenseForm({
  categories, paymentMethods = [], initial, onSave, onCancel, onDelete, today, getSignedUrl,
}) {
  const editMode = !!onDelete;
  const [amount, setAmount] = useState(
    initial?.amount != null ? String(initial.amount) : ""
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [paymentMethodId, setPaymentMethodId] = useState(
    initial?.paymentMethodId || ""
  );
  const [description, setDescription] = useState(initial?.description || "");
  const [date, setDate] = useState(initial?.date || today);
  const [recurring, setRecurring] = useState(initial?.recurring || false);
  const [receipt, setReceipt] = useState(
    initial?.receiptPath
      ? {
          kind: "existing",
          path: initial.receiptPath,
          url: null,
          isImage: !isPdfPath(initial.receiptPath),
        }
      : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  // Resolve a signed URL for an already-uploaded receipt so it previews.
  useEffect(() => {
    if (!initial?.receiptPath || !getSignedUrl) return;
    let active = true;
    getSignedUrl(initial.receiptPath).then((url) => {
      if (active && url) {
        setReceipt((r) =>
          r && r.kind === "existing" ? { ...r, url } : r
        );
      }
    });
    return () => {
      active = false;
    };
  }, [initial, getSignedUrl]);

  const valid = Number(amount) > 0 && categoryId && description.trim();

  const submit = async () => {
    if (!valid || saving) return;
    setError("");
    setSaving(true);
    try {
      await onSave({
        amount: Number(amount),
        categoryId,
        paymentMethodId,
        description: description.trim(),
        date,
        recurring,
        receipt,
      });
    } catch (e) {
      setError(e?.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const remove = async () => {
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      await onDelete();
    } catch (e) {
      setError(e?.message || "Could not delete. Please try again.");
      setSaving(false);
    }
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f)
      setReceipt({
        kind: "new",
        file: f,
        url: URL.createObjectURL(f),
        isImage: f.type.startsWith("image/"),
      });
  };

  const receiptName =
    receipt?.kind === "new" ? receipt.file.name : "Receipt attached";

  return (
    <div className="form">
      <label className="amount-field">
        <span className="amount-cur">$</span>
        <input
          className="amount-input"
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
      </label>

      <div className="field">
        <div className="field-label">Category</div>
        <div className="chip-grid">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={"chip" + (categoryId === c.id ? " sel" : "")}
              style={
                categoryId === c.id
                  ? { borderColor: c.color, background: c.soft }
                  : {}
              }
              onClick={() => setCategoryId(c.id)}
            >
              <span className="chip-dot" style={{ background: c.color }}>
                <Icon name={c.icon} size={13} color="#fff" />
              </span>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <div className="field-label">Paid with</div>
        {paymentMethods.length > 0 ? (
          <div className="select-wrap">
            <select
              className="input select-input"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
            >
              <option value="">— None —</option>
              {paymentMethods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="field-hint">
            Add accounts in the Payment methods tab to track them here.
          </div>
        )}
      </div>

      <div className="field">
        <div className="field-label">Description</div>
        <input
          className="input"
          placeholder="e.g. Turnover clean for Unit A"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <div className="field-label">Date</div>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <div className="field-label">Recurring</div>
          <button
            type="button"
            className={"toggle" + (recurring ? " on" : "")}
            onClick={() => setRecurring((v) => !v)}
          >
            <span className="toggle-knob" />
            <span className="toggle-txt">
              {recurring ? "Repeats monthly" : "One-time"}
            </span>
          </button>
        </div>
      </div>

      <div className="field">
        <div className="field-label">Receipt</div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={onFile}
        />
        {!receipt ? (
          <button
            type="button"
            className="receipt-drop"
            onClick={() => fileRef.current?.click()}
          >
            <Camera size={20} />
            <div>
              <div className="rd-title">Take photo or upload</div>
              <div className="rd-sub">Photo or PDF — camera on mobile</div>
            </div>
          </button>
        ) : (
          <div className="receipt-have">
            {receipt.isImage && receipt.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- small thumbnail from a rotating signed/object URL; next/image adds no value here
              <img src={receipt.url} alt="receipt" className="receipt-thumb" />
            ) : (
              <span className="receipt-thumb receipt-thumb-ph">
                {receipt.isImage ? <Receipt size={20} /> : <FileText size={20} />}
              </span>
            )}
            <div className="rh-mid">
              <div className="rh-name">{receiptName}</div>
              {receipt.url && !receipt.isImage ? (
                <a
                  className="rh-ok rh-link"
                  href={receipt.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Check size={13} /> View PDF
                </a>
              ) : (
                <div className="rh-ok">
                  <Check size={13} /> Attached
                </div>
              )}
            </div>
            <button
              type="button"
              className="icon-btn sm"
              onClick={() => setReceipt(null)}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <div className="fa-left">
          {editMode && (
            <button
              type="button"
              className="btn btn-danger-ghost"
              onClick={remove}
              disabled={saving}
            >
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>
        <div className="fa-right">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!valid || saving}
            onClick={submit}
          >
            <Check size={17} />{" "}
            {saving
              ? "Saving…"
              : editMode
                ? "Save changes"
                : "Save expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
