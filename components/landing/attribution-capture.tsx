"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/analytics/attribution";

/** Guarda UTM / gclid / fbclid al aterrizar para enviarlos con el registro. */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
