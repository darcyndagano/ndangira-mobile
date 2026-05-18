import { useState } from "react";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";

export function Search() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4">
      <div className="mb-6">
        <h1 className="text-[#2C1810] mb-4">Recherche avancée</h1>

        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C1810]/40" />
          <input
            type="text"
            placeholder="Quartier, prix, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl text-[#2C1810] w-full">
          <SlidersHorizontal className="w-5 h-5 text-[#C9973A]" />
          <span>Filtres avancés</span>
        </button>
      </div>

      <div className="text-center py-12">
        <p className="text-[#2C1810]/60">
          Utilisez la recherche pour trouver votre bien idéal
        </p>
      </div>
    </div>
  );
}
