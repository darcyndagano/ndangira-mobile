import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, User as UserIcon, Phone, MessageSquare, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { useAuthStore } from "../../store/authStore";

export function PersonalInfo() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const loginStore = useAuthStore((state) => state.login);
  const tokens = {
    access: useAuthStore((state) => state.access_token) || "",
    refresh: useAuthStore((state) => state.refresh_token) || "",
  };

  // Local Form States
  const [username, setUsername] = useState(user?.username || "");
  const [telephone, setTelephone] = useState(user?.telephone || "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || ""); // Use actual whatsapp from user if available
  const [email, setEmail] = useState(user?.email || "");

  // Mutation to update user info
  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch("/api/users/me/", {
        username,
        telephone,
        whatsapp,
        email,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Informations mises à jour avec succès !");
      
      // Update local Zustand store
      const updatedUser = {
        id: user?.id || 0,
        username: data.data.username,
        first_name: data.data.first_name,
        last_name: data.data.last_name,
        email: data.data.email,
        role: data.data.role,
        telephone: data.data.telephone,
        is_subscribed: user?.is_subscribed || false,
      };
      loginStore(tokens, updatedUser);

      // Invalidate current user queries
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      
      navigate(-1);
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Erreur lors de la mise à jour.";
      toast.error(errMsg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#2C1810]/10 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 cursor-pointer">
            <ChevronLeft className="w-6 h-6 text-[#2C1810]" />
          </button>
          <h1 className="text-[#2C1810] font-bold text-lg">Informations Personnelles</h1>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto bg-white rounded-2xl p-6 shadow-sm border border-[#2C1810]/5">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">Prénom</label>
              <input
                type="text"
                value={user?.first_name || ""}
                disabled
                className="w-full px-4 py-3 bg-[#F0EDE8]/50 rounded-xl outline-none text-sm text-[#2C1810]/50 cursor-not-allowed"
                placeholder="Non renseigné"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">Nom</label>
              <input
                type="text"
                value={user?.last_name || ""}
                disabled
                className="w-full px-4 py-3 bg-[#F0EDE8]/50 rounded-xl outline-none text-sm text-[#2C1810]/50 cursor-not-allowed"
                placeholder="Non renseigné"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">Nom d'utilisateur / Pseudo</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C1810]/40" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-sm text-[#2C1810]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C1810]/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-sm text-[#2C1810]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">Téléphone principal</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C1810]/40" />
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-sm text-[#2C1810]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#2C1810]/70 mb-1.5 text-xs font-semibold">Numéro WhatsApp</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C1810]/40" />
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-sm text-[#2C1810]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-[#C9973A] text-white py-4 rounded-xl shadow-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer mt-2 hover:bg-[#b0822e]"
          >
            {updateMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Sauvegarder les modifications
          </button>
        </form>
      </div>
    </div>
  );
}
