import { useState, useEffect, useRef } from "react";
import { MapPin, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CityResult {
  label: string;
  lat: number;
  lon: number;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (city: { label: string; lat: number; lon: number } | null) => void;
}

const CityAutocomplete = ({ value, onChange }: CityAutocompleteProps) => {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<CityResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    if (query.length < 3 || query === value) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("geo-cities", {
          body: { q: query, limit: 8 },
        });
        if (!error && Array.isArray(data)) {
          setResults(data);
          setOpen(true);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (city: CityResult) => {
    setQuery(city.label);
    setOpen(false);
    setResults([]);
    onChange(city);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    onChange(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Digite sua cidade..."
          className="w-full bg-transparent border-b border-border py-3 pl-6 pr-8 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((city, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(city)}
              className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors truncate"
            >
              {city.label}
            </button>
          ))}
        </div>
      )}

      {loading && open && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-card border border-border rounded-lg p-3 text-center">
          <span className="text-muted-foreground text-xs">Buscando...</span>
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
