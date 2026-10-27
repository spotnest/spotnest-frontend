"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import {
  suggestLocations,
  updateLocation,
} from "../services/authServices";
import type { LocationSuggestion } from "../services/authServices";
import { useDebounce } from "@/src/hooks/useDebounce";

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

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // The last text picked from the list — while the input still matches it
  // exactly there is nothing left to suggest.
  const [chosen, setChosen] = useState<string | null>(null);

  const trimmed = value.trim();
  const debounced = useDebounce(trimmed, 400);

  const canSuggest =
    open && !saving && debounced.length >= 2 && trimmed !== chosen;

  const {
    data,
    isFetching,
  } = useQuery({
    queryKey: ["location-suggest", debounced],
    queryFn: () => suggestLocations(debounced),
    enabled: canSuggest,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Derived rather than stored: a disabled query keeps its last `data`, so
  // gating here is what actually hides the list when it should be hidden.
  const suggestions: LocationSuggestion[] = canSuggest ? data ?? [] : [];
  const showList = canSuggest && (isFetching || suggestions.length > 0);

  const choose = (suggestion: LocationSuggestion) => {
    setValue(suggestion.displayName);
    setChosen(suggestion.displayName);
    setOpen(false);
    setActiveIndex(-1);
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showList || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (index) => (index <= 0 ? suggestions.length - 1 : index - 1)
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      const picked = suggestions[activeIndex];
      if (picked) {
        e.preventDefault();
        choose(picked);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleChange = (next: string) => {
    setValue(next);
    setChosen(null);
    setActiveIndex(-1);
    setOpen(true);
  };

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
    setOpen(false);
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

        <div className="relative mt-2">
          <input
            id="search-location"
            type="text"
            role="combobox"
            aria-expanded={showList}
            aria-controls="search-location-listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `search-location-option-${activeIndex}` : undefined
            }
            autoComplete="off"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={handleKeyDown}
            placeholder="Type a place name, e.g. Mankavu, Calicut"
            disabled={saving}
            className="h-11 w-full rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3] disabled:opacity-60"
          />

          {showList && (
            <div
              id="search-location-listbox"
              role="listbox"
              aria-label="Place suggestions"
              className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-60 overflow-auto rounded-xl border border-[#e3e4e8] bg-white py-1 shadow-[0_10px_30px_rgba(25,28,29,0.14)]"
            >
              {isFetching && suggestions.length === 0 && (
                <p className="px-3 py-2.5 text-sm text-[#75777e]">
                  Searching places…
                </p>
              )}

              {!isFetching && data && suggestions.length === 0 && (
                <p className="px-3 py-2.5 text-sm text-[#75777e]">
                  No matching places. Try adding the city, e.g. “Mankavu, Calicut”.
                </p>
              )}

              {suggestions.map((suggestion, index) => {
                const parts = suggestion.displayName
                  .split(",")
                  .map((part) => part.trim());
                const [primary, ...rest] = parts;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={`${suggestion.lat},${suggestion.lng}`}
                    id={`search-location-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    // Keep focus on the input so the list's onBlur doesn't
                    // fire before this click lands.
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(suggestion)}
                    className={`flex w-full items-start gap-2.5 px-3 py-2 text-left transition ${
                      isActive ? "bg-[#d9f4f3]" : "bg-white hover:bg-[#f4f6f6]"
                    }`}
                  >
                    <MapPin
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isActive ? "text-[#00696b]" : "text-[#9597a1]"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#191c1d]">
                        {primary}
                      </span>
                      {rest.length > 0 && (
                        <span className="block truncate text-xs text-[#75777e]">
                          {rest.join(", ")}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

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
