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

export default function Dashboard({
  theme, month, goPrev, goNext, canPrev, canNext, monthTotal, recurringTotal,
  delta, byCategory, series, monthExpenses, catMap, onAddClick, onEdit,
}) {
  const up = delta != null && delta > 0;
  const label = monthLabel(month);

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
            <span className="muted">{label}</span>
          </div>
          {monthExpenses.length > 0 ? (
            <ul className="tx-list">
              {monthExpenses.map((e) => {
                const c = catMap[e.categoryId ?? "uncat"] || catMap.uncat;
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
                      <div className="tx-meta">{c.name} · {fmtDate(e.date)}</div>
                    </div>
                    <span className="tx-amt">{money(e.amount)}</span>
                    <span className="tx-edit"><Pencil size={14} /></span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty-state">
              No expenses recorded for {label}.
            </div>
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
