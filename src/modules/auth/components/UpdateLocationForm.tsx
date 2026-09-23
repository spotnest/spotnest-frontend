"use client";

import { useState, type FormEvent } from "react";
import axios from "axios";
import { updateLocation } from "../services/authServices";

interface UpdateLocationFormProps {
  currentLocationName?: string;
  onSaved: (locationName: string, resolvedTo: string) => void;
  compact?: boolean;
}

// Single source of truth for the "set your search area" flow. Used from the
// tenant dashboard; wording matches the backend error messages so the same
// underlying failure reads the same way everywhere.
export default function UpdateLocationForm({
  currentLocationName,
  onSaved,
  compact = false,
}: UpdateLocationFormProps) {
  const [value, setValue] = useState(currentLocationName ?? "");
  const [saving, setSaving] = useState(false);
  const [resolvedTo, setResolvedTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = value.trim();
    if (name.length < 2) {
      setError("Enter a place name.");
      return;
    }
    setSaving(true);
    setError(null);
    setResolvedTo(null);
    try {
      const result = await updateLocation(name);
      setResolvedTo(result.resolvedTo);
      onSaved(name, result.resolvedTo);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? "Unable to update your location. Please try again."
          : "Unable to update your location. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      <div>
        <label htmlFor="search-location" className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#75777e]">
          Search area
        </label>
        <input
          id="search-location"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a place name, e.g. Mankavu, Calicut"
          disabled={saving}
          className="mt-2 h-11 w-full rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3] disabled:opacity-60"
        />
        <p className="mt-1.5 text-xs leading-5 text-[#75777e]">
          “Nearby” searches listings within 10 km of this place.
        </p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center rounded-xl bg-[#00696b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save location"}
      </button>

      {resolvedTo && (
        <p className="rounded-lg bg-[#d9f4f3] px-4 py-2.5 text-sm text-[#00696b]">
          Location updated — matched to <span className="font-semibold">{resolvedTo}</span>
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-[#fff0dc] px-4 py-2.5 text-sm font-medium text-[#95611d]">{error}</p>
      )}
    </form>
  );
}