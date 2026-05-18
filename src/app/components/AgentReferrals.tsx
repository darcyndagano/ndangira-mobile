import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, User as UserIcon, Loader2 } from "lucide-react";
import { apiClient } from "../api/client";

export function AgentReferrals() {
  const navigate = useNavigate();

  // Fetch users created by this agent (the backend get_queryset filters this for agents)
  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["agentReferrals"],
    queryFn: async () => {
      const res = await apiClient.get("/api/users/");
      return res.data;
    },
  });

  const referrals = responseData?.data?.results || responseData?.data || [];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#2C1810]/10 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-2 cursor-pointer">
            <ChevronLeft className="w-6 h-6 text-[#2C1810]" />
          </button>
          <h1 className="text-[#2C1810] font-bold text-lg">Mes Filleuls</h1>
        </div>
        <p className="text-[#2C1810]/60 text-sm pl-12">
          {referrals.length} utilisateurs parrainés
        </p>
      </div>

      {/* Main Referral List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#C9973A] animate-spin mb-2" />
            <p className="text-[#2C1810]/60 text-sm">Chargement de vos filleuls...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500 font-medium">
            Une erreur est survenue lors de la récupération.
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl p-6 border border-[#2C1810]/5 shadow-sm">
            <p className="text-[#2C1810]/60 text-sm">Vous n'avez pas encore de filleuls parrainés.</p>
          </div>
        ) : (
          referrals.map((refUser: any) => (
            <div
              key={refUser.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#2C1810]/5 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-[#F0EDE8] rounded-full flex items-center justify-center text-[#C9973A] flex-shrink-0">
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="text-[#2C1810] font-bold text-sm truncate">
                  {refUser.username}
                </h3>
                <p className="text-[#2C1810]/60 text-xs mt-0.5 truncate">
                  {refUser.telephone}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#2C1810]/80 rounded border border-[#2C1810]/10 text-[9px] font-semibold uppercase">
                    {refUser.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                    refUser.is_verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {refUser.is_verified ? "Actif" : "En attente"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
