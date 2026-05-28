export const money = (n) =>
  "$" +
  Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const money0 = (n) =>
  "$" + Math.round(Number(n)).toLocaleString("en-US");

// expense_date arrives as "YYYY-MM-DD"
export const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

// month keys are "YYYY-MM"
export const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export const monthShort = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
};

export const addMonth = (key, delta) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// The `count` months ending at (and including) `key`.
export const monthsEndingAt = (key, count) =>
  Array.from({ length: count }, (_, i) => addMonth(key, -(count - 1 - i)));

export const monthKeyOf = (date) => date.slice(0, 7);
