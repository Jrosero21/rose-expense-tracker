"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  Plus, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Repeat,
  Receipt, Calendar, Pencil,
} from "lucide-react";
import Icon from "@/components/Icon";
import { money, money0, fmtDate, monthLabel } from "@/lib/format";

const TX_RANGES = [
  ["month", "Month"],
  ["3m", "3M"],
  ["6m", "6M"],
  ["12m", "12M"],
];

export default function Dashboard({
  theme, month, goPrev, goNext, canPrev, canNext, monthTotal, recurringTotal,
  delta, byCategory, byPaymentMethod, series, monthExpenses, catMap, pmMap,
  txGroups, txTotal, txCount, txRange, txRangeLabel, onTxRange,
  onAddClick, onEdit,
}) {
  const up = delta != null && delta > 0;
  const label = monthLabel(month);
  const pmMax = byPaymentMethod[0]?.value || 1;
  const showTxHeads = txGroups.length > 1;

  const renderTx = (e) => {
    const c = catMap[e.categoryId ?? "uncat"] || catMap.uncat;
    const pm = e.paymentMethodId ? pmMap[e.paymentMethodId] || null : null;
    return (
      <li key={e.id} className="tx" onClick={() => onEdit(e)}>
        <span className="tx-ic" style={{ background: c.soft, color: c.color }}>
          <Icon name={c.icon} size={17} />
        </span>
        <div className="tx-mid">
          <div className="tx-desc">
            {e.description}
            {e.recurring && (
              <span className="tag tag-rec"><Repeat size={11} /> Recurring</span>
            )}
            {e.receiptPath && (
              <span className="tag tag-rcpt"><Receipt size={11} /> Receipt</span>
            )}
          </div>
          <div className="tx-meta">
            {c.name} · {fmtDate(e.date)}
            {pm ? ` · ${pm.name}` : ""}
          </div>
        </div>
        <span className="tx-amt">{money(e.amount)}</span>
        <span className="tx-edit"><Pencil size={14} /></span>
      </li>
    );
  };

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Overview</div>
          <h1 className="title">Dashboard</h1>
        </div>
        <div className="month-nav">
          <button className="icon-btn" onClick={goPrev} disabled={!canPrev}>
            <ChevronLeft size={18} />
          </button>
          <span className="month-label">
            <Calendar size={14} /> {label}
          </span>
          <button className="icon-btn" onClick={goNext} disabled={!canNext}>
            <ChevronRight size={18} />
          </button>
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
            <div>
              <span className="hs-num">{money0(recurringTotal)}</span>
              <span className="hs-lab">Recurring</span>
            </div>
            <div>
              <span className="hs-num">{money0(monthTotal - recurringTotal)}</span>
              <span className="hs-lab">One-time</span>
            </div>
            <div>
              <span className="hs-num">{monthExpenses.length}</span>
              <span className="hs-lab">Transactions</span>
            </div>
          </div>
          <button className="btn hero-add" onClick={onAddClick}>
            <Plus size={17} /> Add expense
          </button>
        </section>

        <section className="card reveal" style={{ animationDelay: "70ms" }}>
          <div className="card-head">
            <h2 className="card-title">By category</h2>
          </div>
          {byCategory.length > 0 ? (
            <div className="donut-wrap">
              <div className="donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} paddingAngle={2} stroke="none">
                      {byCategory.map((c) => (
                        <Cell key={c.id} fill={c.color} />
                      ))}
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
                    <span className="lg-pct">
                      {Math.round((c.value / monthTotal) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="empty-state">No spending recorded this month.</div>
          )}
        </section>

        <section className="card span-2 reveal" style={{ animationDelay: "140ms" }}>
          <div className="card-head">
            <h2 className="card-title">By payment method</h2>
            <span className="muted">{label}</span>
          </div>
          {byPaymentMethod.length > 0 ? (
            <ul className="pm-bars">
              {byPaymentMethod.map((p) => (
                <li key={p.id} className="pm-bar">
                  <span className="pm-name">
                    <span className="dot" style={{ background: p.color }} />
                    {p.name}
                  </span>
                  <span className="pm-track">
                    <span
                      className="pm-fill"
                      style={{
                        width: (p.value / pmMax) * 100 + "%",
                        background: p.color,
                      }}
                    />
                  </span>
                  <span className="pm-amt">{money0(p.value)}</span>
                  <span className="pm-pct">
                    {Math.round((p.value / monthTotal) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              No payment methods recorded this month.
            </div>
          )}
        </section>

        <section className="card span-2 reveal" style={{ animationDelay: "210ms" }}>
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

        <section className="card span-2 reveal" style={{ animationDelay: "280ms" }}>
          <div className="card-head">
            <h2 className="card-title">Transactions</h2>
            <div className="seg">
              {TX_RANGES.map(([val, lbl]) => (
                <button
                  key={val}
                  className={"seg-btn" + (txRange === val ? " sel" : "")}
                  onClick={() => onTxRange(val)}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div className="tx-range-row muted">
            {txRangeLabel} · {txCount}{" "}
            {txCount === 1 ? "transaction" : "transactions"} · {money0(txTotal)}
          </div>
          {txGroups.length > 0 ? (
            txGroups.map((g) => (
              <div key={g.month} className="tx-group">
                {showTxHeads && (
                  <div className="tx-group-head">
                    <span>{g.label}</span>
                    <span>{money0(g.total)}</span>
                  </div>
                )}
                <ul className="tx-list">{g.items.map(renderTx)}</ul>
              </div>
            ))
          ) : (
            <div className="empty-state">No expenses in {txRangeLabel}.</div>
          )}
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
    <div className="tip">
      <div className="tip-lab">
        <span className="dot" style={{ background: payload[0].payload.color }} />{" "}
        {payload[0].name}
      </div>
      <div className="tip-num">{money(payload[0].value)}</div>
    </div>
  ) : null;
