import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Search, Heart, User } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/home", icon: Home, label: "Accueil" },
    { path: "/home/search", icon: Search, label: "Recherche" },
    { path: "/home/favorites", icon: Heart, label: "Favoris" },
    { path: "/home/profile", icon: User, label: "Profil" },
  ];

  // Only show the bottom navigation bar on the 4 main tab pages
  const mainTabs = ["/home", "/home/search", "/home/favorites", "/home/profile"];
  const showNavBar = mainTabs.includes(location.pathname);

  return (
    <div className="h-screen flex flex-col bg-[#FAF8F5]">
      <main className={`flex-1 overflow-y-auto ${showNavBar ? "pb-16" : ""}`}>
        <Outlet />
      </main>

      {showNavBar && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#2C1810]/10 px-4 py-2 shadow-lg z-20">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1 py-2 px-4 transition-colors cursor-pointer"
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? "text-[#C9973A]" : "text-[#2C1810]/60"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      isActive ? "text-[#C9973A]" : "text-[#2C1810]/60"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
