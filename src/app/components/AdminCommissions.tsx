import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  ChevronLeft,
  Clock3,
  Loader2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { fetchAllPages } from "../api/pagination";
import { useAuthStore } from "../../store/authStore";

type Tab = "EN_ATTENTE" | "PAYEE";

const TYPE_LABELS: Record<string, string> = {
  VALIDATION_ANNONCE: "Validation d'annonce",
  ABONNEMENT_PROPRIETAIRE: "Abonnement propriétaire",
  ABONNEMENT_CHERCHEUR: "Abonnement chercheur",
};

const formatBIF = (value: number) =>
  `${Number(value).toLocaleString("fr-FR")} BIF`;

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export function AdminCommissions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "SUPER_ADMIN";
  const [tab, setTab] = useState<Tab>("EN_ATTENTE");

  const summaryQuery = useQuery({
    queryKey: ["commissions", "admin", "summary"],
    queryFn: async () => {
      const res = await apiClient.get("/api/commissions/summary/");
      return res.data?.data;
    },
    enabled: isAdmin,
  });

  const listQuery = useQuery({
    queryKey: ["commissions", "admin", tab],
    queryFn: () => fetchAllPages<any>("/api/commissions/", { statut: tab }),
    enabled: isAdmin,
  });

  const payMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient.patch(`/api/commissions/${id}/payer/`),
    onSuccess: () => {
      toast.success("Commission marquée comme payée.");
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Impossible de payer cette commission."
      );
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <Wallet className="w-12 h-12 text-[#C9973A] mb-4" />
        <h1 className="text-[#2C1810] font-bold text-lg mb-2">
          Réservé au super administrateur
        </h1>
        <p className="text-[#2C1810]/60 text-sm mb-6 max-w-xs">
          Seul un super administrateur peut consulter et payer les commissions.
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

  const summary = summaryQuery.data ?? {
    total_en_attente: 0,
    total_paye: 0,
    nombre_en_attente: 0,
    nombre_payees: 0,
  };
  const commissions = listQuery.data ?? [];

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
              Gestion des commissions
            </h1>
            <p className="text-[#2C1810]/60 text-xs">
              Suivi et paiement des agents
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 border border-[#2C1810]/5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock3 className="w-4 h-4 text-[#C9973A]" />
              <p className="text-[10px] uppercase font-semibold text-[#2C1810]/50">
                En attente
              </p>
            </div>
            <p className="text-[#2C1810] font-extrabold text-lg">
              {formatBIF(summary.total_en_attente)}
            </p>
            <p className="text-[#2C1810]/50 text-[10px] mt-1">
              {summary.nombre_en_attente} commission
              {summary.nombre_en_attente > 1 ? "s" : ""}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#2C1810]/5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="w-4 h-4 text-green-600" />
              <p className="text-[10px] uppercase font-semibold text-[#2C1810]/50">
                Payées
              </p>
            </div>
            <p className="text-[#2C1810] font-extrabold text-lg">
              {formatBIF(summary.total_paye)}
            </p>
            <p className="text-[#2C1810]/50 text-[10px] mt-1">
              {summary.nombre_payees} commission
              {summary.nombre_payees > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex bg-[#F0EDE8] rounded-xl p-1 mb-4">
          {(
            [
              ["EN_ATTENTE", "À payer"],
              ["PAYEE", "Payées"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === value
                  ? "bg-white text-[#2C1810] shadow-sm"
                  : "text-[#2C1810]/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {listQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#C9973A] animate-spin mb-2" />
            <p className="text-[#2C1810]/60 text-sm">
              Chargement des commissions...
            </p>
          </div>
        ) : listQuery.isError ? (
          <div className="text-center py-12 text-red-500 text-sm font-medium">
            Impossible de récupérer les commissions.
          </div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#2C1810]/5">
            <p className="text-[#2C1810]/60 text-sm">
              {tab === "EN_ATTENTE"
                ? "Aucune commission en attente."
                : "Aucune commission payée."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {commissions.map((commission: any) => {
              const isPaying =
                payMutation.isPending &&
                payMutation.variables === commission.id;

              return (
                <div
                  key={commission.id}
                  className="bg-white rounded-2xl p-4 border border-[#2C1810]/5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[#2C1810] font-semibold text-sm truncate">
                        {commission.agent_detail?.username ??
                          `Agent #${commission.agent}`}
                      </p>
                      <p className="text-[#2C1810]/50 text-[11px]">
                        {commission.agent_detail?.telephone ?? ""}
                      </p>
                    </div>
                    <p className="text-[#C9973A] font-bold text-sm whitespace-nowrap">
                      {formatBIF(commission.montant_bif)}
                    </p>
                  </div>

                  <p className="text-[#2C1810]/70 text-xs mt-2">
                    {TYPE_LABELS[commission.type_commission] ??
                      commission.type_commission}
                  </p>

                  {commission.annonce_titre && (
                    <p className="text-[#2C1810]/50 text-[11px] mt-1 truncate">
                      Annonce : {commission.annonce_titre}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[#2C1810]/40 text-[10px]">
                      {formatDate(commission.created_at)}
                    </p>

                    {tab === "EN_ATTENTE" ? (
                      <button
                        onClick={() => payMutation.mutate(commission.id)}
                        disabled={payMutation.isPending}
                        className="bg-[#2C1810] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 hover:bg-[#4a2c1e] disabled:opacity-60 cursor-pointer"
                      >
                        {isPaying ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <BadgeCheck className="w-3 h-3" />
                        )}
                        Marquer payé
                      </button>
                    ) : (
                      <p className="text-green-600 text-[10px] font-semibold">
                        Payée le {formatDate(commission.payee_at)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
