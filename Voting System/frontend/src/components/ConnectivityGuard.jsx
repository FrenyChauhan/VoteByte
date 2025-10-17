import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client.js";
import { toast } from "@/components/ui/sonner";

// Detects broken auth refresh loops ("Failed to fetch") and resets local session only
// to recover the app without hitting the backend.
export default function ConnectivityGuard() {
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkAndRepair = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        // If Supabase surfaces an error, handle known network failure gracefully
        if (error && typeof error.message === "string" && error.message.includes("Failed to fetch")) {
          await supabase.auth.signOut({ scope: "local" }); // local-only, no network call
          toast("Connection issue detected", {
            description: "We reset your session. Please sign in again.",
          });
        }
      } catch (err) {
        const msg = (err && (err.message || String(err))) || "";
        if (String(msg).includes("Failed to fetch")) {
          try {
            await supabase.auth.signOut({ scope: "local" });
          } catch (_) {}
          toast("Connection issue detected", {
            description: "We reset your session. Please sign in again.",
          });
        }
      }
    };

    // Run soon after mount; Supabase may attempt a refresh automatically
    // so a short delay lets it start, then we repair if it failed.
    const t = setTimeout(checkAndRepair, 150);
    return () => clearTimeout(t);
  }, []);

  return null;
}
