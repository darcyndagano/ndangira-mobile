import { useNavigate } from "react-router";
import { User as UserIcon, Home, TrendingUp, Settings, LogOut, Users } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

export function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    toast.success("Vous avez été déconnecté.");
    navigate("/home");
  };

  const menuItems = [
    { icon: UserIcon, label: "Informations personnelles", path: "/home/profile/info" },
    { icon: Home, label: "Mes annonces", path: "/home/dashboard", roles: ["SUPER_ADMIN", "MODERATEUR", "PROPRIETAIRE"] },
    { icon: TrendingUp, label: "Commissions (Agent)", path: "/home/agent", roles: ["SUPER_ADMIN", "AGENT"] },
    { icon: Users, label: "Mes filleuls (Agent)", path: "/home/agent/referrals", roles: ["SUPER_ADMIN", "AGENT"] },
    { icon: Settings, label: "Paramètres", path: "/home/settings" },
  ];

  // Filter menu items by user's role
  const visibleMenuItems = menuItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* User Header Profile */}
      <div className="bg-[#2C1810] px-4 py-8 pb-12">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-[#C9973A] rounded-full flex items-center justify-center mb-3">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-white mb-1 font-bold text-lg">
            {user ? user.username : "Utilisateur Anonyme"}
          </h2>
          <p className="text-white/60 text-xs font-semibold">
            {user ? `${user.telephone} • ${user.role}` : "Veuillez vous connecter pour voir vos infos."}
          </p>
        </div>
      </div>

      <div className="p-4 -mt-6">
        {user ? (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 border border-[#2C1810]/5">
            {visibleMenuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-[#F0EDE8] transition-colors cursor-pointer ${
                    index !== visibleMenuItems.length - 1 ? "border-b border-[#2C1810]/5" : ""
                  }`}
                >
                  <Icon className="w-5 h-5 text-[#C9973A]" />
                  <span className="flex-1 text-left text-xs font-semibold text-[#2C1810]">{item.label}</span>
                  <span className="text-[#2C1810]/40">›</span>
                </button>
              );
            })}
          </div>
        ) : (
          <button
            onClick={() => navigate("/home/auth")}
            className="w-full bg-[#C9973A] text-white py-4 rounded-2xl shadow-sm font-semibold text-sm mb-4 cursor-pointer text-center block"
          >
            Se connecter
          </button>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white text-red-500 py-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer font-semibold text-xs border border-[#2C1810]/5"
          >
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </button>
        )}
      </div>
    </div>
  );
}
