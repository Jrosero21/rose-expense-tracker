/* ------------------------------------------------------------------ */
/*  Themes — cohesive, system-generated palettes                      */
/* ------------------------------------------------------------------ */
export const THEMES = {
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

export const THEME_LIST = Object.entries(THEMES).map(([key, t]) => ({
  key,
  name: t.name,
  bg: t.bg,
  accent: t.accent,
}));

export const DEFAULT_THEME = "seaside";

// Cohesive category colors are derived from the category's stored `position`
// (never stored as a color), so the palette stays consistent per theme.
export const catColor = (T, pos) =>
  `hsl(${(T.catBaseH + pos * 18) % 360} ${T.catS}% ${T.catL}%)`;
export const catSoft = (T, pos) =>
  `hsl(${(T.catBaseH + pos * 18) % 360} ${T.catS}% ${T.catL}% / 0.14)`;

// Payment-method colors share the theme's S/L but sit on the opposite side of
// the wheel (+180°) so they read as distinct from category colors.
export const pmColor = (T, pos) =>
  `hsl(${(T.catBaseH + 180 + pos * 32) % 360} ${T.catS}% ${T.catL}%)`;
export const pmSoft = (T, pos) =>
  `hsl(${(T.catBaseH + 180 + pos * 32) % 360} ${T.catS}% ${T.catL}% / 0.14)`;

// Uncategorized (null category_id) / unspecified payment renders grey.
export const UNCAT_COLOR = (T) => T.faint;
export const UNCAT_SOFT = "rgba(140,140,140,0.16)";

export const cssVars = (T) => ({
  "--bg": T.bg, "--surface": T.surface, "--ink": T.ink, "--soft": T.soft, "--faint": T.faint, "--line": T.line,
  "--primary": T.primary, "--primary-text": T.primaryText, "--accent": T.accent, "--accent-soft": T.accentSoft,
  "--accent-text": T.accentText, "--on-accent": T.onAccent, "--hero-from": T.heroFrom, "--hero-to": T.heroTo,
  "--hero-text": T.heroText, "--hero-glow": T.heroGlow, "--hero-btn-bg": T.heroBtnBg, "--hero-btn-text": T.heroBtnText,
  "--bar-muted": T.barMuted, "--dot": T.dot, "--tip-bg": T.tipBg, "--tip-text": T.tipText,
});
