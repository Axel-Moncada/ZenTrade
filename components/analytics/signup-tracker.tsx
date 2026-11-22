"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

/**
 * El callback de auth agrega `?signup=email|google` solo la primera vez que un usuario
 * nuevo completa el registro. Aquí se envía `sign_up` a GA4 y se limpia la URL.
 */
export default function SignupTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const method = url.searchParams.get("signup");
    if (method !== "email" && method !== "google") return;
    track("sign_up", { method });
    url.searchParams.delete("signup");
    window.history.replaceState({}, "", url.toString());
  }, []);
  return null;
}
