"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "../hooks/useDebounce";
import { IProduct } from "../interfaces/index";
import { Search } from "lucide-react";
import api from "@/lib/axiosInstance";
import { routes } from "@/app/routes";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<IProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearch = useDebounce(search, 200);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearch.trim().length < 2) return setResults([]);

      try {
        const { data } = await api.get(
          `/products/search?query=${debouncedSearch}`
        );
        setResults(data);
        setShowSuggestions(true);
      } catch (err) {
        if (err && typeof err === "object" && "response" in err) {
          console.error(
            "Error buscando productos",
            err.response &&
              typeof err.response === "object" &&
              "data" in err.response
              ? (err.response as { data?: any }).data
              : err instanceof Error
              ? err.message
              : String(err)
          );
        } else {
          console.error(
            "Error buscando productos",
            (err as Error).message || err
          );
        }
        setResults([]);
      }
    };

    fetchResults();
  }, [debouncedSearch]);

  const handleSelect = (id: string) => {
    router.push(`${routes.shop.products}/${id}`);
    setSearch("");
    setResults([]);
    setShowSuggestions(false);
  };

  const getHighlightedParts = (text: string, query: string) => {
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part) => ({
      text: part,
      match: part.toLowerCase() === query.toLowerCase(),
    }));
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none rounded-lg bg-white text-gray-900 placeholder-gray-500 text-sm transition duration-200"
        />
      </div>

      {showSuggestions && results.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-expanded={showSuggestions}
          className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-2 max-h-60 overflow-y-auto"
        >
          {results.slice(0, 10).map((product) => (
            <li
              key={product.id}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(product.id)}
              className="px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition text-sm"
            >
              {getHighlightedParts(product.name, search).map((part, idx) => (
                <span
                  key={idx}
                  className={part.match ? "text-indigo-600 font-semibold" : ""}
                >
                  {part.text}
                </span>
              ))}
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && search && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 text-gray-500 text-sm text-center p-2 rounded-md shadow-sm">
          No se encontraron resultados
        </div>
      )}
    </div>
  );
};

export default SearchBar;
