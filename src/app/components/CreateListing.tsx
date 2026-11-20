import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Home, Info, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { fetchAllPages } from "../api/pagination";
import { useAuthStore } from "../../store/authStore";

interface Option {
  id: number;
  nom: string;
}

const inputClass =
  "w-full px-4 py-3 bg-[#F0EDE8] rounded-xl outline-none focus:ring-2 focus:ring-[#C9973A] transition-all text-sm text-[#2C1810]";
const labelClass = "block text-[#2C1810]/70 mb-1.5 text-xs font-semibold";

const TYPE_BIEN_OPTIONS = [
  { value: "RESIDENTIEL", label: "Résidentiel" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "PARCELLE", label: "Parcelle" },
];

export function CreateListing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isOwner =
    !!user && ["PROPRIETAIRE", "SUPER_ADMIN"].includes(user.role);
  const { id } = useParams();
  const isEdit = !!id;

  const [provinceId, setProvinceId] = useState("");
  const [communeId, setCommuneId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [quartierId, setQuartierId] = useState("");

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [typeBien, setTypeBien] = useState("RESIDENTIEL");
  const [prix, setPrix] = useState("");

  const [nbChambres, setNbChambres] = useState("0");
  const [nbSalons, setNbSalons] = useState("0");
  const [nbToilettes, setNbToilettes] = useState("0");
  const [seuleParcelle, setSeuleParcelle] = useState(true);
  const [nbMaisons, setNbMaisons] = useState("1");

  const editQuery = useQuery({
    queryKey: ["annonce", id, "edit"],
    queryFn: async () => {
      const res = await apiClient.get(`/api/annonces/${id}/`);
      return res.data?.data ?? null;
    },
    enabled: isEdit && isOwner,
  });

  const provincesQuery = useQuery({
    queryKey: ["geo", "provinces"],
    queryFn: () => fetchAllPages<Option>("/api/provinces/"),
    enabled: isOwner,
  });
  const communesQuery = useQuery({
    queryKey: ["geo", "communes", provinceId],
    queryFn: () =>
      fetchAllPages<Option>("/api/communes/", { province: provinceId }),
    enabled: isOwner && !!provinceId,
  });
  const zonesQuery = useQuery({
    queryKey: ["geo", "zones", communeId],
    queryFn: () => fetchAllPages<Option>("/api/zones/", { commune: communeId }),
    enabled: isOwner && !!communeId,
  });
  const quartiersQuery = useQuery({
    queryKey: ["geo", "quartiers", zoneId],
    queryFn: () => fetchAllPages<Option>("/api/quartiers/", { zone: zoneId }),
    enabled: isOwner && !!zoneId,
  });

  const provinces = provincesQuery.data ?? [];
  const communes = communesQuery.data ?? [];
  const zones = zonesQuery.data ?? [];
  const quartiers = quartiersQuery.data ?? [];

  // Pré-remplit le formulaire une seule fois quand on édite une annonce.
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isEdit) {
      hydratedFor.current = null;
      return;
    }

    const existing = editQuery.data;
    if (!existing || hydratedFor.current === id) return;

    const quartier = existing.quartier_detail;
    setProvinceId(quartier?.province ? String(quartier.province) : "");
    setCommuneId(quartier?.commune ? String(quartier.commune) : "");
    setZoneId(quartier?.zone ? String(quartier.zone) : "");
    setQuartierId(quartier?.id ? String(quartier.id) : "");
    setTitre(existing.titre ?? "");
    setDescription(existing.description ?? "");
    setTypeBien(existing.type_bien ?? "RESIDENTIEL");
    setPrix(existing.prix != null ? String(existing.prix) : "");
    setNbChambres(String(existing.nb_chambres ?? 0));
    setNbSalons(String(existing.nb_salons ?? 0));
    setNbToilettes(String(existing.nb_toilettes ?? 0));
    setSeuleParcelle(!!existing.seule_parcelle);
    setNbMaisons(String(existing.nb_maisons_parcelle ?? 1));

    hydratedFor.current = id ?? null;
  }, [isEdit, id, editQuery.data]);

  // Repart d'un formulaire vierge si on repasse en mode création sur le même
  // composant (navigation interne).
  useEffect(() => {
    if (isEdit) return;
    hydratedFor.current = null;
    setProvinceId("");
    setCommuneId("");
    setZoneId("");
    setQuartierId("");
    setTitre("");
    setDescription("");
    setTypeBien("RESIDENTIEL");
    setPrix("");
    setNbChambres("0");
    setNbSalons("0");
    setNbToilettes("0");
    setSeuleParcelle(true);
    setNbMaisons("1");
  }, [isEdit]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        quartier: Number(quartierId),
        titre: titre.trim(),
        description: description.trim(),
        type_bien: typeBien,
        prix: Number(prix),
        nb_chambres: Number(nbChambres || 0),
        nb_salons: Number(nbSalons || 0),
        nb_toilettes: Number(nbToilettes || 0),
        seule_parcelle: seuleParcelle,
        nb_maisons_parcelle: seuleParcelle ? 1 : Number(nbMaisons || 1),
      };

      if (isEdit) {
        const res = await apiClient.patch(`/api/annonces/${id}/`, payload);
        return res.data?.data;
      }

      const res = await apiClient.post("/api/annonces/", payload);
      return res.data?.data;
    },
    onSuccess: (annonce: any) => {
      queryClient.invalidateQueries({ queryKey: ["ownerAnnonces"] });
      queryClient.invalidateQueries({ queryKey: ["annonces"] });

      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["annonce", id] });
        toast.success("Annonce mise à jour.");
        navigate("/home/dashboard");
        return;
      }

      if (!annonce?.id) {
        toast.error("Réponse inattendue du serveur.");
        return;
      }
      toast.success("Annonce créée ! Ajoutez maintenant vos photos.");
      navigate(`/home/dashboard/${annonce.id}/photos`);
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          (isEdit
            ? "Impossible de modifier l'annonce."
            : "Impossible de créer l'annonce.")
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quartierId) {
      toast.error("Sélectionnez un quartier.");
      return;
    }
    if (!titre.trim() || !prix) {
      toast.error("Renseignez le titre et le prix.");
      return;
    }
    saveMutation.mutate();
  };

  if (isEdit && editQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9973A] animate-spin mb-2" />
        <p className="text-[#2C1810]/60 text-sm">
          Chargement de l'annonce...
        </p>
      </div>
    );
  }

  if (isEdit && (editQuery.isError || !editQuery.data)) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 font-medium mb-4">
          Impossible de charger cette annonce.
        </p>
        <button
          onClick={() => navigate("/home/dashboard")}
          className="bg-[#C9973A] text-white px-6 py-2 rounded-xl text-sm"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 bg-[#F0EDE8] rounded-full flex items-center justify-center mb-4">
          <Home className="w-7 h-7 text-[#C9973A]" />
        </div>
        <h1 className="text-[#2C1810] font-bold text-lg mb-2">
          Réservé aux propriétaires
        </h1>
        <p className="text-[#2C1810]/60 text-sm mb-6 max-w-xs">
          Connectez-vous avec un compte propriétaire pour publier une annonce.
        </p>
        <button
          onClick={() => navigate(user ? "/home/dashboard" : "/home/auth")}
          className="bg-[#C9973A] text-white px-6 py-3 rounded-xl text-sm font-semibold"
        >
          {user ? "Retour au tableau de bord" : "Se connecter"}
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
            <h1 className="text-[#2C1810] font-bold text-lg">
              {isEdit ? "Modifier l'annonce" : "Nouvelle annonce"}
            </h1>
            <p className="text-[#2C1810]/60 text-xs">
              {isEdit
                ? `Annonce #${id}`
                : "En attente de validation par un agent"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#2C1810]/5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#C9973A]" />
            <h2 className="text-[#2C1810] font-semibold text-sm">
              Localisation
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Province</label>
              <select
                value={provinceId}
                onChange={(e) => {
                  setProvinceId(e.target.value);
                  setCommuneId("");
                  setZoneId("");
                  setQuartierId("");
                }}
                className={inputClass}
                required
              >
                <option value="">Choisir une province</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Commune</label>
              <select
                value={communeId}
                onChange={(e) => {
                  setCommuneId(e.target.value);
                  setZoneId("");
                  setQuartierId("");
                }}
                className={inputClass}
                disabled={!provinceId}
                required
              >
                <option value="">
                  {provinceId ? "Choisir une commune" : "Choisissez d'abord une province"}
                </option>
                {communes.map((commune) => (
                  <option key={commune.id} value={commune.id}>
                    {commune.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Zone</label>
              <select
                value={zoneId}
                onChange={(e) => {
                  setZoneId(e.target.value);
                  setQuartierId("");
                }}
                className={inputClass}
                disabled={!communeId}
                required
              >
                <option value="">
                  {communeId ? "Choisir une zone" : "Choisissez d'abord une commune"}
                </option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Quartier</label>
              <select
                value={quartierId}
                onChange={(e) => setQuartierId(e.target.value)}
                className={inputClass}
                disabled={!zoneId}
                required
              >
                <option value="">
                  {zoneId ? "Choisir un quartier" : "Choisissez d'abord une zone"}
                </option>
                {quartiers.map((quartier) => (
                  <option key={quartier.id} value={quartier.id}>
                    {quartier.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#2C1810]/5 space-y-3">
          <h2 className="text-[#2C1810] font-semibold text-sm">Le bien</h2>

          <div>
            <label className={labelClass}>Titre de l'annonce</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex : Villa 3 chambres à Kiriri"
              className={inputClass}
              maxLength={200}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Type de bien</label>
            <select
              value={typeBien}
              onChange={(e) => setTypeBien(e.target.value)}
              className={inputClass}
            >
              {TYPE_BIEN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Loyer mensuel (BIF)</label>
            <input
              type="number"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="Ex : 350000"
              className={inputClass}
              min={0}
              step={1000}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le bien, l'environnement, les commodités..."
              className={`${inputClass} min-h-24 resize-y`}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#2C1810]/5 space-y-3">
          <h2 className="text-[#2C1810] font-semibold text-sm">
            Caractéristiques
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Chambres</label>
              <input
                type="number"
                value={nbChambres}
                onChange={(e) => setNbChambres(e.target.value)}
                className={inputClass}
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>Salons</label>
              <input
                type="number"
                value={nbSalons}
                onChange={(e) => setNbSalons(e.target.value)}
                className={inputClass}
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>Toilettes</label>
              <input
                type="number"
                value={nbToilettes}
                onChange={(e) => setNbToilettes(e.target.value)}
                className={inputClass}
                min={0}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-[#2C1810]">
            <input
              type="checkbox"
              checked={seuleParcelle}
              onChange={(e) => setSeuleParcelle(e.target.checked)}
              className="w-4 h-4 accent-[#C9973A]"
            />
            Maison seule dans la parcelle
          </label>

          {!seuleParcelle && (
            <div>
              <label className={labelClass}>
                Nombre de maisons dans la parcelle
              </label>
              <input
                type="number"
                value={nbMaisons}
                onChange={(e) => setNbMaisons(e.target.value)}
                className={inputClass}
                min={1}
              />
            </div>
          )}
        </section>

        <div className="flex items-start gap-2 text-[11px] text-[#2C1810]/60 bg-[#F0EDE8]/60 rounded-xl p-3">
          <Info className="w-4 h-4 text-[#C9973A] shrink-0 mt-0.5" />
          <p>
            {isEdit
              ? "Vos modifications sont appliquées immédiatement. Gérez les photos depuis le tableau de bord."
              : "Votre annonce sera d'abord visible par un agent pour validation. Vous pourrez ajouter jusqu'à 10 photos à l'étape suivante."}
          </p>
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="w-full bg-[#C9973A] text-white py-4 rounded-xl shadow-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-[#b0822e] disabled:opacity-60"
        >
          {saveMutation.isPending && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {isEdit ? "Enregistrer les modifications" : "Publier l'annonce"}
        </button>
      </form>
    </div>
  );
}
