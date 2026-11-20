import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Loader2,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { fetchAllPages } from "../api/pagination";
import { useAuthStore } from "../../store/authStore";

export function PendingListings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAgent = user?.role === "AGENT";

  const { data: listings = [], isLoading, isError } = useQuery({
    queryKey: ["pendingAnnonces"],
    queryFn: () =>
      fetchAllPages<any>("/api/annonces/", { statut: "EN_ATTENTE" }),
    enabled: isAgent,
  });

  const validateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.patch(`/api/annonces/${id}/valider/`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Annonce validée et publiée.");
      queryClient.invalidateQueries({ queryKey: ["pendingAnnonces"] });
      queryClient.invalidateQueries({ queryKey: ["annonces"] });
      queryClient.invalidateQueries({ queryKey: ["agentCommissions"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Impossible de valider cette annonce."
      );
    },
  });

  if (!isAgent) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <ClipboardCheck className="w-12 h-12 text-[#C9973A] mb-4" />
        <h1 className="text-[#2C1810] font-bold text-lg mb-2">
          Réservé aux agents
        </h1>
        <p className="text-[#2C1810]/60 text-sm mb-6 max-w-xs">
          Seuls les agents peuvent valider les annonces en attente.
        </p>
        <button
          onClick={() => navigate("/home/profile")}
          className="bg-[#C9973A] text-white px-6 py-3 rounded-xl text-sm font-semibold"
        >
          Retour au profil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="bg-white border-b border-[#2C1810]/10 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 cursor-pointer"
            aria-label="Retour"
          >
            <ChevronLeft className="w-6 h-6 text-[#2C1810]" />
          </button>
          <div>
            <h1 className="text-[#2C1810] font-bold text-lg">
              Annonces à valider
            </h1>
            <p className="text-[#2C1810]/60 text-xs">
              {listings.length} annonce{listings.length > 1 ? "s" : ""} en
              attente
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#C9973A] animate-spin mb-2" />
            <p className="text-[#2C1810]/60 text-sm">
              Chargement des annonces...
            </p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500 text-sm font-medium">
            Impossible de récupérer les annonces en attente.
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#2C1810]/5 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-[#2C1810]/60 text-sm">
              Aucune annonce en attente de validation.
            </p>
          </div>
        ) : (
          listings.map((listing: any) => {
            const isValidating =
              validateMutation.isPending &&
              validateMutation.variables === listing.id;

            return (
              <div
                key={listing.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#2C1810]/5"
              >
                <button
                  onClick={() => navigate(`/home/listing/${listing.id}`)}
                  className="w-full flex text-left"
                >
                  <img
                    src={
                      listing.medias?.[0]?.fichier ||
                      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
                    }
                    alt={listing.titre}
                    className="w-24 h-24 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 p-3 min-w-0">
                    <p className="text-[#C9973A] font-bold text-sm mb-0.5">
                      {Number(listing.prix).toLocaleString()} BIF
                    </p>
                    <p className="text-[#2C1810] font-semibold text-xs truncate">
                      {listing.titre}
                    </p>
                    <p className="text-[#2C1810]/60 text-[11px] truncate mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {listing.quartier_detail
                        ? `${listing.quartier_detail.nom}, ${listing.quartier_detail.commune_nom}`
                        : "Adresse masquée"}
                    </p>
                    <p className="text-[#2C1810]/50 text-[10px] mt-1">
                      Propriétaire :{" "}
                      {listing.proprietaire_detail?.username || "—"}
                    </p>
                  </div>
                </button>

                <div className="px-3 pb-3">
                  <button
                    onClick={() => validateMutation.mutate(listing.id)}
                    disabled={validateMutation.isPending}
                    className="w-full bg-[#C9973A] text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#b0822e] disabled:opacity-60 cursor-pointer"
                  >
                    {isValidating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {isValidating ? "Validation..." : "Valider et publier"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
