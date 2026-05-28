"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({ className = "btn btn-ghost" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button className={className} onClick={signOut} disabled={loading}>
      <LogOut size={16} /> {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
