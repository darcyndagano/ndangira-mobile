import { useNavigate } from "react-router";
import { ChevronLeft, LogOut, Info, Shield, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";

export function Settings() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    toast.success("Vous avez été déconnecté.");
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#2C1810]/10 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 cursor-pointer">
            <ChevronLeft className="w-6 h-6 text-[#2C1810]" />
          </button>
          <h1 className="text-[#2C1810] font-bold text-lg">Paramètres</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Support & Legal menu items (Placeholders) */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#2C1810]/5">
          <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#F0EDE8] transition-colors cursor-pointer border-b border-[#2C1810]/5">
            <Shield className="w-5 h-5 text-[#C9973A]" />
            <span className="flex-1 text-left text-xs font-semibold text-[#2C1810]">Confidentialité & Sécurité</span>
            <span className="text-[#2C1810]/40">›</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#F0EDE8] transition-colors cursor-pointer border-b border-[#2C1810]/5">
            <HelpCircle className="w-5 h-5 text-[#C9973A]" />
            <span className="flex-1 text-left text-xs font-semibold text-[#2C1810]">Centre d'aide & Contact</span>
            <span className="text-[#2C1810]/40">›</span>
          </button>

          <div className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#2C1810]/5">
            <Info className="w-5 h-5 text-[#C9973A]" />
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-[#2C1810]">Version de l'application</p>
              <p className="text-[10px] text-[#2C1810]/60 mt-0.5">Ndangira Mobile — v1.0.0 Stable (Vite/React)</p>
            </div>
          </div>
        </div>

        {/* Logout action */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white text-red-500 py-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer font-semibold text-xs border border-[#2C1810]/5"
        >
          <LogOut className="w-5 h-5" />
          <span>Se déconnecter de mon compte</span>
        </button>
      </div>
    </div>
  );
}
