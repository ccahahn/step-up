"use client";

import { useEffect } from "react";

/** Registers the worker that lets Android install this as an app. */
export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .catch((e) => console.error("[step-up] service worker failed:", e));
  }, []);
  return null;
}
