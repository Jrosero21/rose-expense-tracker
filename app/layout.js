import "./globals.css";

export const metadata = {
  title: "Tally — Expense Tracker",
  description: "Track property expenses with monthly insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
