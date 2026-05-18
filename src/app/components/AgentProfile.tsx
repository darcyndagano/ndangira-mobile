import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Wallet, TrendingUp, Users, Loader2 } from "lucide-react";
import { apiClient } from "../api/client";

export function AgentProfile() {
  const navigate = useNavigate();

  // Fetch Financial Summary
  const { data: summaryResponse, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["agentSummary"],
    queryFn: async () => {
      const res = await apiClient.get("/api/commissions/me/summary/");
      return res.data;
    },
  });

  // Fetch Commissions History
  const { data: commissionsResponse, isLoading: isHistoryLoading, isError } = useQuery({
    queryKey: ["agentCommissions"],
    queryFn: async () => {
      const res = await apiClient.get("/api/commissions/me/");
      return res.data;
    },
  });

  const summary = summaryResponse?.data || { total_cumule: 0, total_paye: 0, total_en_attente: 0 };
  const commissions = commissionsResponse?.data?.results || commissionsResponse?.data || [];

  const isLoading = isSummaryLoading || isHistoryLoading;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Portefeuille agent */}
      <div className="bg-[#2C1810] px-4 py-6 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 cursor-pointer">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">Profil Agent</h1>
        </div>

        <div className="bg-gradient-to-br from-[#C9973A] to-[#A67F2E] rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-white/80" />
            <p className="text-white/80 text-sm">Portefeuille accumulé (payé + en attente)</p>
          </div>
          <p className="text-white text-3xl font-extrabold mb-3">
            {Number(summary.total_cumule).toLocaleString()} BIF
          </p>

          <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-3 mt-1 text-xs">
            <div>
              <p className="text-white/70">Payé</p>
              <p className="font-semibold">{Number(summary.total_paye).toLocaleString()} BIF</p>
            </div>
            <div>
              <p className="text-white/70">En attente de paiement</p>
              <p className="font-semibold text-amber-200">{Number(summary.total_en_attente).toLocaleString()} BIF</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-12">
        {/* Referral button */}
        <button
          onClick={() => navigate("/home/profile")}
          className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow mb-6 flex items-center justify-between border border-[#2C1810]/5"
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#F0EDE8] p-3 rounded-xl">
              <Users className="w-6 h-6 text-[#C9973A]" />
            </div>
            <div className="text-left">
              <p className="text-[#2C1810] font-semibold text-sm">Filleuls & Parrainage</p>
              <p className="text-[#2C1810]/60 text-xs">Gérer mon réseau de parrainage</p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-[#2C1810]/40 rotate-180" />
        </button>

        {/* Commissions Header */}
        <div className="mb-4">
          <h2 className="text-[#2C1810] font-bold text-base">Historique des commissions</h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-[#C9973A] animate-spin mb-2" />
            <p className="text-xs text-[#2C1810]/60">Chargement de l'historique...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-6 text-red-500 text-sm">
            Une erreur est survenue lors de la récupération de vos commissions.
          </div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#2C1810]/60 bg-white rounded-2xl p-6">
            Aucune commission n'a encore été enregistrée pour votre compte.
          </div>
        ) : (
          <div className="space-y-3">
            {commissions.map((commission: any) => (
              <div
                key={commission.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#2C1810]/5 flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-[#2C1810] font-semibold text-sm">
                    {commission.type_commission === "VALIDATION_ANNONCE" ? "Validation d'annonce" : "Parrainage d'abonnement"}
                  </p>
                  <p className="text-[#2C1810]/60 text-xs mt-0.5">
                    {new Date(commission.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#C9973A] font-bold text-sm">
                    +{Number(commission.montant_bif).toLocaleString()} BIF
                  </p>
                  <p className={`text-[10px] font-semibold mt-0.5 uppercase ${
                    commission.statut === "PAYEE" ? "text-green-600" : "text-amber-500"
                  }`}>
                    {commission.statut === "PAYEE" ? "Payé" : "En attente"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
