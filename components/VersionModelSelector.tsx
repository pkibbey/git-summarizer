"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Keep these simple and aligned with the user's request:
// models: gemma-3 | gemma-3n | ministral
// versions: v1 | v2 | v3
const MODELS = [
  { id: "gemma-3", label: "gemma-3" },
  { id: "gemma-3n", label: "gemma-3n" },
  { id: "ministral", label: "ministral" },
];

const VERSIONS = [
  { id: "v2", label: "v2" },
];

const STORAGE_KEY_VERSION = "peakblooms.selectedVersion";
const STORAGE_KEY_MODEL = "peakblooms.selectedModel";

export default function VersionModelSelector() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [version, setVersion] = useState<string>(VERSIONS[0].id);
  const [model, setModel] = useState<string>(MODELS[0].id);

  // Initialize: query params take precedence, then localStorage
  useEffect(() => {
    try {
      const spV = searchParams?.get("version");
      const spM = searchParams?.get("model");
      if (spV && VERSIONS.some((v) => v.id === spV)) setVersion(spV);
      else {
        const storedV = localStorage.getItem(STORAGE_KEY_VERSION);
        if (storedV && VERSIONS.some((v) => v.id === storedV)) setVersion(storedV);
      }

      if (spM && MODELS.some((m) => m.id === spM)) setModel(spM);
      else {
        const storedM = localStorage.getItem(STORAGE_KEY_MODEL);
        if (storedM && MODELS.some((m) => m.id === storedM)) setModel(storedM);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VERSION, version);
      localStorage.setItem(STORAGE_KEY_MODEL, model);
    } catch {
      // ignore
    }

    // update the search params in the URL (replace so we don't spam history)
    try {
      const newParams = new URLSearchParams(Array.from(searchParams ?? []));
      newParams.set("version", version);
      newParams.set("model", model);

      // keep pathname stable, replace search
      router.replace(`${pathname}?${newParams.toString()}`);
    } catch {
      // ignore routing errors in some environments
    }

    // broadcast a small DOM event so other client components can react
    if (typeof window !== "undefined") {
      const ev = new CustomEvent("peakblooms:versionModelChange", {
        detail: { version, model },
      });
      window.dispatchEvent(ev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, model]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="sr-only" htmlFor="version-select">
        Select dataset version
      </label>
      <select
        id="version-select"
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        className="rounded-md border px-2 py-1 bg-white/80 text-xs"
        aria-label="Select version"
        title="Select dataset version"
      >
        {VERSIONS.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="model-select">
        Select model
      </label>
      <select
        id="model-select"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="rounded-md border px-2 py-1 bg-white/80 text-xs"
        aria-label="Select model"
        title="Select model"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
