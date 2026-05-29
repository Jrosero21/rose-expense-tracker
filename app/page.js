import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: categories }, { data: paymentMethods }, { data: rawExpenses }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name, icon, position")
        .order("position", { ascending: true }),
      supabase
        .from("payment_methods")
        .select("id, name, position")
        .order("position", { ascending: true }),
      supabase
        .from("expenses")
        .select(
          "id, category_id, payment_method_id, amount, description, expense_date, is_recurring, receipt_path"
        )
        .order("expense_date", { ascending: false }),
    ]);

  const expenses = (rawExpenses ?? []).map((e) => ({
    id: e.id,
    categoryId: e.category_id,
    paymentMethodId: e.payment_method_id,
    amount: Number(e.amount),
    description: e.description,
    date: e.expense_date,
    recurring: e.is_recurring,
    receiptPath: e.receipt_path,
  }));

  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const serverMonth = `${now.getFullYear()}-${mm}`;
  const today = `${now.getFullYear()}-${mm}-${dd}`;

  return (
    <AppShell
      categories={categories ?? []}
      paymentMethods={paymentMethods ?? []}
      expenses={expenses}
      userId={user.id}
      serverMonth={serverMonth}
      today={today}
    />
  );
}
