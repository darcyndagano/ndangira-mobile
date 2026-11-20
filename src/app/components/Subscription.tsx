import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { fetchAllPages } from "../api/pagination";
import { useAuthStore } from "../../store/authStore";

interface Tarif {
  id: number;
  type_utilisateur: "PROPRIETAIRE" | "CHERCHEUR";
  duree_mois: number;
  prix_bif: number;
  est_actif: boolean;
}

interface Abonnement {
  id: number;
  statut: string;
  date_debut: string;
  date_fin: string;
  montant_paye: number;
  est_actif: boolean;
  tarif_detail?: Tarif;
}

const formatPrice = (value: number) =>
  `${Number(value).toLocaleString("fr-FR")} BIF`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function Subscription() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canSubscribe =
    user?.role === "PROPRIETAIRE" || user?.role === "CHERCHEUR";

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const tarifsQuery = useQuery({
    queryKey: ["subscription", "tarifs"],
    queryFn: () => fetchAllPages<Tarif>("/api/subscriptions/tarifs/"),
    enabled: !!user,
  });

  const activeQuery = useQuery({
    queryKey: ["subscription", "me"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/subscriptions/me/");
        return (res.data?.data ?? null) as Abonnement | null;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!user,
    retry: false,
  });

  const eligibleTarifs = (tarifsQuery.data ?? []).filter(
    (tarif) => tarif.est_actif && tarif.type_utilisateur === user?.role
  );
  const selectedTarif =
    eligibleTarifs.find((tarif) => tarif.id === selectedId) ??
    eligibleTarifs[0] ??
    null;

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTarif) {
        throw new Error("Aucune formule sélectionnée.");
      }
      const res = await apiClient.post("/api/subscriptions/", {
        tarif: selectedTarif.id,
        reference_paiement: `MOMO-${Date.now().toString().slice(-8)}`,
      });
      return res.data?.data;
    },
    onSuccess: () => {
      toast.success("Abonnement activé !");
      useAuthStore.getState().setSubscribed(true);
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["annonces"] });
      queryClient.invalidateQueries({ queryKey: ["annonce"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Impossible d'activer l'abonnement."
      );
    },
  });

  const active = activeQuery.data;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <CreditCard className="w-12 h-12 text-[#C9973A] mb-4" />
        <h1 className="text-[#2C1810] font-bold text-lg mb-2">
          Connectez-vous
        </h1>
        <p className="text-[#2C1810]/60 text-sm mb-6">
          Un compte est nécessaire pour gérer un abonnement.
        </p>
        <button
          onClick={() => navigate("/home/auth")}
          className="bg-[#C9973A] text-white px-6 py-3 rounded-xl text-sm font-semibold"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
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
            <h1 className="text-[#2C1810] font-bold text-lg">Mon abonnement</h1>
            <p className="text-[#2C1810]/60 text-xs">
              Accédez aux contacts et aux adresses complètes
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {activeQuery.isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-[#C9973A] animate-spin" />
          </div>
        ) : active?.est_actif ? (
          <div className="bg-gradient-to-br from-[#2C1810] to-[#4a2c1e] rounded-2xl p-5 text-white mb-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#C9973A]" />
              <p className="text-sm font-semibold">Abonnement actif</p>
            </div>
            <p className="text-3xl font-extrabold mb-1">
              {active.tarif_detail?.duree_mois ?? "—"} mois
            </p>
            <p className="text-white/70 text-xs mb-3">
              Valable jusqu'au {formatDate(active.date_fin)}
            </p>
            <p className="text-[#C9973A] font-semibold text-sm">
              {formatPrice(active.montant_paye)} payés
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-[#2C1810]/5 shadow-sm mb-6 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#C9973A] shrink-0 mt-0.5" />
            <div>
              <p className="text-[#2C1810] font-semibold text-sm">
                Aucun abonnement actif
              </p>
              <p className="text-[#2C1810]/60 text-xs mt-1">
                Les adresses et contacts des annonces restent masqués tant que
                vous n'avez pas d'abonnement.
              </p>
            </div>
          </div>
        )}

        {!canSubscribe ? (
          <div className="bg-white rounded-2xl p-4 border border-[#2C1810]/5 text-center">
            <p className="text-[#2C1810]/60 text-sm">
              La souscription en ligne est réservée aux propriétaires et aux
              chercheurs.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-[#2C1810] font-bold text-sm mb-3">
              {active?.est_actif ? "Renouveler" : "Choisir une formule"}
            </h2>

            {tarifsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#C9973A] animate-spin" />
              </div>
            ) : tarifsQuery.isError ? (
              <p className="text-red-500 text-sm text-center py-6">
                Impossible de charger les tarifs.
              </p>
            ) : eligibleTarifs.length === 0 ? (
              <p className="text-[#2C1810]/60 text-sm text-center py-6">
                Aucune formule disponible pour votre profil.
              </p>
            ) : (
              <div className="space-y-3">
                {eligibleTarifs.map((tarif) => {
                  const isSelected = selectedTarif?.id === tarif.id;
                  return (
                    <button
                      key={tarif.id}
                      onClick={() => setSelectedId(tarif.id)}
                      className={`w-full text-left bg-white rounded-2xl p-4 border shadow-sm transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#C9973A] ring-2 ring-[#C9973A]/30"
                          : "border-[#2C1810]/5 hover:border-[#C9973A]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#2C1810] font-bold text-sm">
                            {tarif.duree_mois} mois
                          </p>
                          <p className="text-[#2C1810]/50 text-[11px] mt-0.5">
                            {formatPrice(
                              Math.round(tarif.prix_bif / tarif.duree_mois)
                            )}{" "}
                            / mois
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[#C9973A] font-bold text-sm">
                            {formatPrice(tarif.prix_bif)}
                          </p>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#C9973A] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedTarif && (
              <button
                onClick={() => subscribeMutation.mutate()}
                disabled={subscribeMutation.isPending}
                className="w-full mt-5 bg-[#C9973A] text-white py-4 rounded-xl font-semibold text-sm shadow-lg hover:bg-[#b0822e] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                {subscribeMutation.isPending
                  ? "Activation..."
                  : `Payer ${formatPrice(selectedTarif.prix_bif)}`}
              </button>
            )}

            <p className="text-[#2C1810]/50 text-[11px] text-center mt-3 leading-relaxed">
              Paiement simulé pour la démonstration : aucune transaction réelle
              n'est effectuée.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
