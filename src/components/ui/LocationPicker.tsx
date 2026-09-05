"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Loader2, Check, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export interface LocationData {
  address: string;
  latitude: number | null;
  longitude: number | null;
  city?: string;
  state?: string;
}

interface LocationPickerProps {
  label?: string;
  placeholder?: string;
  value?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  onChange: (location: LocationData) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  helperText?: string;
}

interface PlaceSuggestion {
  displayName: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

// Regional fallback dataset of major North Indian Mandis & Agricultural Towns for zero-delay offline suggestion
const REGIONAL_AGRI_HUBS: PlaceSuggestion[] = [
  { displayName: "Sohana, Sector 78, SAS Nagar (Mohali), Punjab", lat: 30.6782, lng: 76.7214, city: "Mohali", state: "Punjab" },
  { displayName: "Mohali Grain Market, Phase 11, SAS Nagar, Punjab", lat: 30.6738, lng: 76.7456, city: "Mohali", state: "Punjab" },
  { displayName: "Khanna Grain Mandi (Asia's Largest), Khanna, Punjab", lat: 30.7071, lng: 76.2167, city: "Khanna", state: "Punjab" },
  { displayName: "Kharar Vegetable & Grain Mandi, Kharar, Punjab", lat: 30.7441, lng: 76.6465, city: "Kharar", state: "Punjab" },
  { displayName: "Ludhiana New Grain Market, Gill Road, Ludhiana, Punjab", lat: 30.9010, lng: 75.8573, city: "Ludhiana", state: "Punjab" },
  { displayName: "Abohar Cotton & Grain Mandi, Fazilka, Punjab", lat: 30.1453, lng: 74.1994, city: "Abohar", state: "Punjab" },
  { displayName: "Bathinda Main Mandi, Mansa Road, Bathinda, Punjab", lat: 30.2110, lng: 74.9455, city: "Bathinda", state: "Punjab" },
  { displayName: "Patiala Grain Market, Sirhind Road, Patiala, Punjab", lat: 30.3398, lng: 76.3869, city: "Patiala", state: "Punjab" },
  { displayName: "Ambala City Grain Market, Ambala, Haryana", lat: 30.3782, lng: 76.7767, city: "Ambala", state: "Haryana" },
  { displayName: "Karnal Anaj Mandi, GT Road, Karnal, Haryana", lat: 29.6857, lng: 76.9905, city: "Karnal", state: "Haryana" },
  { displayName: "Kurukshetra Grain Market, Thanesar, Haryana", lat: 29.9695, lng: 76.8783, city: "Kurukshetra", state: "Haryana" },
  { displayName: "Sirsa Anaj Mandi, Sirsa, Haryana", lat: 29.5349, lng: 75.0298, city: "Sirsa", state: "Haryana" },
  { displayName: "Azadpur Mandi, New Delhi, Delhi", lat: 28.7118, lng: 77.1784, city: "Delhi", state: "Delhi" },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  label,
  placeholder = "Search village, city, or mandi...",
  value = "",
  latitude,
  longitude,
  onChange,
  required = false,
  disabled = false,
  error,
  className = "",
  helperText,
}) => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch location suggestions using OpenStreetMap Nominatim with Google Places fallback
  const fetchPlaces = async (text: string) => {
    if (!text.trim() || text.length < 3) {
      // Filter regional hubs if short query - instant local response
      const filtered = REGIONAL_AGRI_HUBS.filter((h) =>
        h.displayName.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // 1. Regional Instant Match
      const localMatches = REGIONAL_AGRI_HUBS.filter((h) =>
        h.displayName.toLowerCase().includes(text.toLowerCase())
      );

      // 2. OpenStreetMap / Geo Nominatim Query (Restricted to India)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        text + ", India"
      )}&limit=5&addressdetails=1`;

      const res = await fetch(url, {
        headers: {
          "Accept-Language": "en,hi",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const onlineSuggestions: PlaceSuggestion[] = data.map((item: any) => ({
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          city: item.address?.city || item.address?.town || item.address?.village || item.address?.county,
          state: item.address?.state,
        }));

        // Merge without duplicates
        const combined = [...localMatches];
        onlineSuggestions.forEach((online) => {
          if (!combined.some((c) => Math.abs(c.lat - online.lat) < 0.001 && Math.abs(c.lng - online.lng) < 0.001)) {
            combined.push(online);
          }
        });

        setSuggestions(combined);
      } else {
        setSuggestions(localMatches);
      }
    } catch {
      // Offline fallback to regional dataset
      const filtered = REGIONAL_AGRI_HUBS.filter((h) =>
        h.displayName.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      fetchPlaces(val);
    }, 350);

    // If user changes text manually, update address with null coords until selected or confirmed
    onChange({
      address: val,
      latitude: null,
      longitude: null,
    });
  };

  const handleSelectSuggestion = (item: PlaceSuggestion) => {
    setQuery(item.displayName);
    setIsOpen(false);
    onChange({
      address: item.displayName,
      latitude: item.lat,
      longitude: item.lng,
      city: item.city,
      state: item.state,
    });
  };

  // 1-Click GPS Location Detector
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(isHi ? "आपके ब्राउज़र में GPS उपलब्ध नहीं है" : "GPS Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // Reverse geocode coordinates to human-readable address
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en,hi" } }
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            setQuery(addr);
            onChange({
              address: addr,
              latitude: lat,
              longitude: lng,
              city: data.address?.city || data.address?.town || data.address?.village,
              state: data.address?.state,
            });
            toast.success(isHi ? "📍 वर्तमान स्थान और GPS कोऑर्डिनेट्स प्राप्त कर लिए गए!" : "📍 Current GPS location detected successfully!");
          } else {
            const fallbackAddr = `GPS Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            setQuery(fallbackAddr);
            onChange({ address: fallbackAddr, latitude: lat, longitude: lng });
          }
        } catch {
          const fallbackAddr = `GPS Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setQuery(fallbackAddr);
          onChange({ address: fallbackAddr, latitude: lat, longitude: lng });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error(
          isHi
            ? "कृपया अपने ब्राउज़र में लोकेशन/GPS परमिशन दें"
            : `Could not retrieve GPS location: ${err.message}`
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const parsedLat = typeof latitude === "number" ? latitude : latitude ? parseFloat(latitude) : null;
  const parsedLng = typeof longitude === "number" ? longitude : longitude ? parseFloat(longitude) : null;
  const hasCoordinates = parsedLat !== null && parsedLng !== null && !isNaN(parsedLat) && !isNaN(parsedLng);

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-emerald-300">
            {label} {required && <span className="text-rose-400">*</span>}
          </label>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={disabled || isLocating}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Navigation className="w-3 h-3 text-amber-400" />
            )}
            <span>{isHi ? "वर्तमान GPS स्थान लें" : "Use Current GPS"}</span>
          </button>
        </div>
      )}

      <div className="relative">
        <div className="relative flex items-center">
          <MapPin className="absolute left-3.5 w-4 h-4 text-emerald-400 pointer-events-none z-10" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length === 0) fetchPlaces(query);
              setIsOpen(true);
            }}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`w-full bg-slate-950 border-2 rounded-xl pl-10 pr-10 py-3 text-white text-sm sm:text-base font-medium focus:outline-none transition-all ${
              error
                ? "border-rose-500 focus:border-rose-400"
                : "border-emerald-500/30 focus:border-emerald-400"
            } disabled:opacity-50`}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {isSearching && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
            {query && !disabled && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onChange({ address: "", latitude: null, longitude: null });
                }}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Suggestions Dropdown */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900/98 backdrop-blur-md border-2 border-emerald-500/40 rounded-2xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-800">
            {suggestions.length > 0 ? (
              suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left p-3 hover:bg-emerald-950/60 transition-colors flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-200 hover:text-white group"
                >
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.displayName}</p>
                    <p className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
                      📍 Lat: {item.lat.toFixed(4)}, Lng: {item.lng.toFixed(4)}
                    </p>
                  </div>
                </button>
              ))
            ) : !isSearching ? (
              <div className="p-3.5 text-center text-xs text-slate-400">
                <Search className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                {isHi ? "कोई स्थान नहीं मिला। कृपया नाम ठीक से टाइप करें।" : "No location found. Type to search places."}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Coordinate status badge */}
      {hasCoordinates && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>
            {isHi ? "GPS कोऑर्डिनेट्स लॉक:" : "GPS Coordinates Set:"} {parsedLat?.toFixed(4)}, {parsedLng?.toFixed(4)}
          </span>
        </div>
      )}

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
};
