import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, MapPin, Bed, Sofa, Loader2, Heart } from "lucide-react";
import { apiClient } from "../api/client";
import { useAuthStore } from "../../store/authStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import { toast } from "sonner";
import logo from "../../imports/logo.png";

export function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  
  // Favorites store
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleToggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    toggleFavorite(id);
    toast.success("Favoris mis à jour !");
  };

  // Active Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [typeBien, setTypeBien] = useState<string>("");
  const [prixMin, setPrixMin] = useState<string>("");
  const [prixMax, setPrixMax] = useState<string>("");
  const [chambres, setChambres] = useState<string>("");

  // Fetch properties from real API
  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["annonces", searchQuery, typeBien, prixMin, prixMax, chambres],
    queryFn: async () => {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (typeBien) params.type_bien = typeBien;
      if (prixMin) params.prix_min = prixMin;
      if (prixMax) params.prix_max = prixMax;
      if (chambres) params.nb_chambres = chambres;

      const res = await apiClient.get("/api/annonces/", { params });
      return res.data;
    },
  });

  const listings = responseData?.data?.results || responseData?.data || [];

  return (
    <div className="min-h-full bg-[#FAF8F5]">
      {/* Header & Quick Filter Panel */}
      <div className="bg-white border-b border-[#2C1810]/10 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt="Ndangira" className="w-10 h-10 object-contain" />
          <h1 className="text-[#2C1810] font-semibold text-xl">Ndangira</h1>
        </div>

        {/* Live Search */}
        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C1810]/40" />
          <input
            type="text"
            placeholder="Rechercher par titre ou description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-[#2C1810]"
          />
        </div>

        {/* Small Active Filters Dashboard */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <select
            value={typeBien}
            onChange={(e) => setTypeBien(e.target.value)}
            className="px-3 py-2 bg-[#F0EDE8] rounded-xl text-xs text-[#2C1810] outline-none"
          >
            <option value="">Type de bien</option>
            <option value="RESIDENTIEL">Résidentiel</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="PARCELLE">Parcelle</option>
          </select>

          <input
            type="number"
            placeholder="Prix max"
            value={prixMax}
            onChange={(e) => setPrixMax(e.target.value)}
            className="px-3 py-2 bg-[#F0EDE8] rounded-xl text-xs text-[#2C1810] outline-none"
          />

          <select
            value={chambres}
            onChange={(e) => setChambres(e.target.value)}
            className="px-3 py-2 bg-[#F0EDE8] rounded-xl text-xs text-[#2C1810] outline-none"
          >
            <option value="">Chambres</option>
            <option value="1">1 chambre</option>
            <option value="2">2 chambres</option>
            <option value="3">3 chambres</option>
            <option value="4">4+ chambres</option>
          </select>
        </div>
      </div>

      {/* Main Listing Grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#C9973A] animate-spin mb-2" />
            <p className="text-[#2C1810]/60 text-sm">Chargement des biens...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-medium">Une erreur est survenue lors de la récupération.</p>
            <p className="text-[#2C1810]/60 text-xs mt-1">Veuillez vérifier votre connexion.</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#2C1810]/60">Aucun bien ne correspond à vos critères.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {listings.map((listing: any) => {
              const isFav = favoriteIds.includes(listing.id);
              return (
                <button
                  key={listing.id}
                  onClick={() => navigate(`/home/listing/${listing.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left relative"
                >
                  {/* Heart button */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, listing.id)}
                    className="absolute top-2 left-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : "text-[#2C1810]/60"}`} />
                  </button>

                  <div className="relative">
                    <img
                      src={listing.medias?.[0]?.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}
                      alt={listing.titre}
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-[#2C1810] text-white rounded-lg text-[10px] uppercase font-semibold">
                      {listing.type_bien}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[#C9973A] font-semibold mb-1">
                      {Number(listing.prix).toLocaleString()} BIF
                    </p>
                    <p className="text-[#2C1810] text-sm font-medium truncate mb-2">
                      {listing.titre}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#2C1810]/60 mb-2">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        <span>{listing.nb_chambres}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sofa className="w-3.5 h-3.5" />
                        <span>{listing.nb_salons}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#2C1810]/60">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {listing.quartier_detail ? listing.quartier_detail.nom : "Adresse masquée"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Auth Gate Floating Button */}
      {!isAuthenticated && (
        <button
          onClick={() => navigate("/home/auth")}
          className="fixed bottom-20 right-4 bg-[#C9973A] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm font-medium z-10"
        >
          Se connecter pour voir plus
        </button>
      )}
    </div>
  );
}
