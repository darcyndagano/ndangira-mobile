import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, MapPin, Bed, Sofa, Loader2 } from "lucide-react";
import { apiClient } from "../api/client";
import { useFavoritesStore } from "../../store/favoritesStore";
import { toast } from "sonner";

export function Favorites() {
  const navigate = useNavigate();
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // Fetch all properties to filter favorites
  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["annonces"],
    queryFn: async () => {
      const res = await apiClient.get("/api/annonces/");
      return res.data;
    },
  });

  const listings = responseData?.data?.results || responseData?.data || [];
  const favoriteListings = listings.filter((listing: any) => favoriteIds.includes(listing.id));

  const handleToggle = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    toggleFavorite(id);
    toast.success("Favoris mis à jour !");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 pb-20">
      <h1 className="text-[#2C1810] font-bold text-xl mb-6">Mes favoris</h1>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#C9973A] animate-spin mb-2" />
          <p className="text-[#2C1810]/60 text-xs">Chargement de vos favoris...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-red-500 font-medium text-sm">
          Erreur lors du chargement des biens favoris.
        </div>
      ) : favoriteListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-[#F0EDE8] p-6 rounded-full mb-4">
            <Heart className="w-12 h-12 text-[#2C1810]/40" />
          </div>
          <p className="text-[#2C1810]/60 text-center font-semibold text-sm">
            Vous n'avez pas encore de favoris
          </p>
          <p className="text-[#2C1810]/40 text-xs text-center mt-1 max-w-[240px]">
            Appuyez sur le cœur sur les fiches de biens pour sauvegarder vos favoris.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {favoriteListings.map((listing: any) => (
            <button
              key={listing.id}
              onClick={() => navigate(`/home/listing/${listing.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left relative"
            >
              {/* Heart button */}
              <button
                onClick={(e) => handleToggle(e, listing.id)}
                className="absolute top-2 left-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
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
          ))}
        </div>
      )}
    </div>
  );
}
