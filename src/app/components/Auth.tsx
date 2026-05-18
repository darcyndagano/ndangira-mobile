import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Phone, Lock, User as UserIcon, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { useAuthStore } from "../../store/authStore";
import logo from "../../imports/logo.png";

export function Auth() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  // Form Fields
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PROPRIETAIRE" | "CHERCHEUR">("CHERCHEUR");
  const [otpToken, setOtpToken] = useState("");

  // Helper: Load User Profile & Login in Zustand
  const handleAuthSuccess = async (tokens: { access: string; refresh: string }) => {
    try {
      // Injects access token temporarily to fetch user profile
      const userRes = await apiClient.get("/api/users/me/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      
      const userProfile = userRes.data?.data;
      
      // Determine if user has active subscription (you can mock this or query check)
      const user = {
        id: userProfile.id,
        username: userProfile.username,
        role: userProfile.role,
        telephone: userProfile.telephone,
        is_subscribed: userProfile.role === "SUPER_ADMIN" || userProfile.role === "AGENT" || false, // default or backend calculated
      };

      loginStore(tokens, user);
      toast.success("Authentification réussie !");
      navigate("/home");
    } catch (err: any) {
      toast.error("Impossible de récupérer les détails du profil.");
    }
  };

  // Mutation 1: Login
  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/api/auth/token/", {
        username: phone, // Simple JWT custom TelephoneOrUsername resolution
        password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      handleAuthSuccess(data);
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.detail || "Téléphone ou mot de passe incorrect.";
      toast.error(errMsg);
    },
  });

  // Mutation 2: Register
  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/api/auth/register/", {
        username,
        telephone: phone,
        whatsapp: whatsapp || phone, // fallback
        password,
        role,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Compte créé ! Veuillez entrer le code d'activation envoyé par SMS.");
      setShowOtpScreen(true);
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Erreur lors de l'inscription. Vérifiez vos données.";
      toast.error(errMsg);
    },
  });

  // Mutation 3: Activate Account via OTP
  const activateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/api/auth/activate/", {
        telephone: phone,
        token: otpToken,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success("Compte activé avec succès !");
      // After activation, automatically log in
      loginMutation.mutate();
    },
    onError: (err: any) => {
      toast.error("Code d'activation invalide ou expiré.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "login") {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    activateMutation.mutate();
  };

  if (showOtpScreen) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <img src={logo} alt="Ndangira" className="w-20 h-20 object-contain mb-6 animate-bounce" />
        <div className="w-full max-w-sm">
          <h2 className="text-[#2C1810] font-bold text-xl mb-2">Activation du compte</h2>
          <p className="text-xs text-[#2C1810]/60 mb-6">
            Entrez le code à 6 chiffres imprimé dans la console du serveur Django pour valider votre compte.
          </p>

          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C1810]/40" />
              <input
                type="text"
                placeholder="Code à 6 chiffres"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value)}
                maxLength={6}
                required
                className="w-full pl-11 pr-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-center tracking-widest font-extrabold text-[#2C1810]"
              />
            </div>

            <button
              type="submit"
              disabled={activateMutation.isPending || loginMutation.isPending}
              className="w-full bg-[#C9973A] text-white py-4 rounded-xl shadow-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {(activateMutation.isPending || loginMutation.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Valider et se connecter
            </button>

            <button
              type="button"
              onClick={() => setShowOtpScreen(false)}
              className="text-[#2C1810]/60 text-xs hover:underline mt-2"
            >
              Retourner à l'inscription
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6">
      <img src={logo} alt="Ndangira" className="w-20 h-20 object-contain mb-8 cursor-pointer" onClick={() => navigate("/home")} />

      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border border-[#2C1810]/5">
        {/* Auth tabs */}
        <div className="flex bg-[#F0EDE8] rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-white text-[#2C1810] shadow-sm"
                : "text-[#2C1810]/60"
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "signup"
                ? "bg-white text-[#2C1810] shadow-sm"
                : "text-[#2C1810]/60"
            }`}
          >
            S'inscrire
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "signup" && (
            <>
              <div>
                <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">Nom complet / Pseudo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C1810]/40" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-sm text-[#2C1810]"
                    placeholder="Ex: jean_ndayisenga"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">Votre Rôle</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-sm text-[#2C1810]"
                >
                  <option value="CHERCHEUR">Chercheur de biens</option>
                  <option value="PROPRIETAIRE">Propriétaire immobilier</option>
                </select>
              </div>

              <div>
                <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">WhatsApp (Optionnel)</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-sm text-[#2C1810]"
                  placeholder="Ex: +25779123456"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">Numéro de Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C1810]/40" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-sm text-[#2C1810]"
                placeholder="Ex: +25779123456"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C1810]/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-sm text-[#2C1810]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending || registerMutation.isPending}
            className="w-full bg-[#C9973A] text-white py-4 rounded-xl shadow-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer mt-2 hover:bg-[#b0822e]"
          >
            {(loginMutation.isPending || registerMutation.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {activeTab === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
