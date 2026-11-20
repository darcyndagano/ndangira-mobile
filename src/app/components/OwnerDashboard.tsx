import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  ChevronLeft,
  Bed,
  Sofa,
  Loader2,
  ImagePlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { fetchAllPages } from "../api/pagination";

const STATUS_CONFIG = {
  ACTIVE: { label: "Disponible", color: "bg-green-500" },
  OCCUPEE: { label: "Occupée", color: "bg-red-500" },
  EN_ATTENTE: { label: "En attente", color: "bg-orange-500" },
  SUSPENDUE: { label: "Suspendue", color: "bg-gray-500" },
  ARCHIVEE: { label: "Archivée", color: "bg-black" },
};

export function OwnerDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch current owner's properties from real API (toutes les pages)
  const { data: listings = [], isLoading, isError } = useQuery({
    queryKey: ["ownerAnnonces"],
    queryFn: () => fetchAllPages<any>("/api/annonces/", { proprietaire: "me" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/annonces/${id}/`),
    onSuccess: () => {
      toast.success("Annonce supprimée.");
      queryClient.invalidateQueries({ queryKey: ["ownerAnnonces"] });
      queryClient.invalidateQueries({ queryKey: ["annonces"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Suppression impossible.");
    },
  });

  const handleDelete = (listing: any) => {
    if (!window.confirm(`Supprimer l'annonce « ${listing.titre} » ?`)) return;
    deleteMutation.mutate(listing.id);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#2C1810]/10 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-2 cursor-pointer">
            <ChevronLeft className="w-6 h-6 text-[#2C1810]" />
          </button>
          <h1 className="text-[#2C1810] font-bold text-lg">Mes annonces</h1>
        </div>
        <p className="text-[#2C1810]/60 text-sm pl-12">
          {listings.length} bien{listings.length > 1 ? "s" : ""} enregistré
          {listings.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Main Listing List */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#C9973A] animate-spin mb-2" />
            <p className="text-[#2C1810]/60 text-sm">
              Chargement de vos annonces...
            </p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-medium">
              Une erreur est survenue lors de la récupération.
            </p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#2C1810]/60 text-sm mb-4">
              Vous n'avez pas encore d'annonces enregistrées.
            </p>
            <button
              onClick={() => navigate("/home/dashboard/new")}
              className="bg-[#C9973A] text-white px-6 py-2 rounded-xl text-sm"
            >
              Créer ma première annonce
            </button>
          </div>
        ) : (
          listings.map((listing: any) => {
            const statusKey = listing.statut as keyof typeof STATUS_CONFIG;
            const status = STATUS_CONFIG[statusKey] || {
              label: listing.statut,
              color: "bg-gray-400",
            };
            const isDeleting =
              deleteMutation.isPending &&
              deleteMutation.variables === listing.id;

            return (
              <div
                key={listing.id}
                className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-[#2C1810]/5"
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
                    className="w-28 h-28 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[#C9973A] font-bold text-sm truncate">
                        {Number(listing.prix).toLocaleString()} BIF
                      </p>
                      <div
                        className={`px-2 py-0.5 rounded-lg text-[9px] text-white font-medium uppercase ${status.color}`}
                      >
                        {status.label}
                      </div>
                    </div>

                    <p className="text-[#2C1810] font-semibold text-xs truncate mb-1">
                      {listing.titre}
                    </p>

                    <p className="text-[#2C1810]/60 text-xs truncate mb-2">
                      {listing.quartier_detail
                        ? listing.quartier_detail.nom
                        : "Adresse masquée"}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[#2C1810]/60">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        <span>{listing.nb_chambres}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sofa className="w-3.5 h-3.5" />
                        <span>{listing.nb_salons}</span>
                      </div>
                    </div>
                  </div>
                </button>

                <div className="flex border-t border-[#2C1810]/5">
                  <button
                    onClick={() =>
                      navigate(`/home/dashboard/${listing.id}/edit`)
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-[#2C1810]/70 hover:bg-[#F0EDE8] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/home/dashboard/${listing.id}/photos`)
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-[#2C1810]/70 hover:bg-[#F0EDE8] transition-colors cursor-pointer border-l border-[#2C1810]/5"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    Photos
                  </button>
                  <button
                    onClick={() => handleDelete(listing)}
                    disabled={isDeleting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-l border-[#2C1810]/5 disabled:opacity-60"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Create Button */}
      <button
        onClick={() => navigate("/home/dashboard/new")}
        aria-label="Créer une annonce"
        className="fixed bottom-20 right-4 bg-[#C9973A] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
