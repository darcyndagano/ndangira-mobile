import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";

interface Media {
  id: number;
  fichier: string;
  ordre: number;
}

interface AnnonceDetail {
  id: number;
  titre: string;
  statut: string;
  medias: Media[];
}

const MAX_PHOTOS = 10;

export function ListingPhotos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: annonce, isLoading, isError } = useQuery({
    queryKey: ["annonce", id, "edit"],
    queryFn: async () => {
      const res = await apiClient.get(`/api/annonces/${id}/`);
      return (res.data?.data ?? null) as AnnonceDetail | null;
    },
    enabled: !!id,
  });

  const medias = annonce?.medias ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["annonce", id] });
    queryClient.invalidateQueries({ queryKey: ["ownerAnnonces"] });
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    const slots = MAX_PHOTOS - medias.length;
    if (slots <= 0) {
      toast.error("Le maximum de 10 photos est atteint.");
      return;
    }

    const selected = Array.from(files).slice(0, slots);
    if (selected.length < files.length) {
      toast.info(`Seules ${slots} photo(s) ont été ajoutées (maximum 10).`);
    }

    setUploading(true);
    try {
      for (const file of selected) {
        const formData = new FormData();
        formData.append("fichier", file);
        // Pas de Content-Type manuel : le navigateur ajoute le boundary.
        await apiClient.post(`/api/annonces/${id}/medias/`, formData);
      }
      toast.success(
        `${selected.length} photo${selected.length > 1 ? "s" : ""} ajoutée${
          selected.length > 1 ? "s" : ""
        }.`
      );
      await invalidate();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Échec de l'envoi d'une photo."
      );
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (mediaId: number) => {
    if (!window.confirm("Supprimer cette photo ?")) return;

    setDeletingId(mediaId);
    try {
      await apiClient.delete(`/api/annonces/${id}/medias/${mediaId}/`);
      toast.success("Photo supprimée.");
      await invalidate();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Impossible de supprimer la photo."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9973A] animate-spin mb-2" />
        <p className="text-[#2C1810]/60 text-sm">Chargement de l'annonce...</p>
      </div>
    );
  }

  if (isError || !annonce) {
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-32">
      <div className="bg-white border-b border-[#2C1810]/10 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home/dashboard")}
            className="p-2 cursor-pointer"
            aria-label="Retour"
          >
            <ChevronLeft className="w-6 h-6 text-[#2C1810]" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[#2C1810] font-bold text-lg truncate">
              Photos de l'annonce
            </h1>
            <p className="text-[#2C1810]/60 text-xs truncate">
              {annonce.titre}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[#2C1810]/70 text-sm">
            {medias.length} / {MAX_PHOTOS} photo{medias.length > 1 ? "s" : ""}
          </p>
          <span className="px-2 py-1 bg-[#F0EDE8] text-[#2C1810]/70 rounded-lg text-[10px] font-semibold uppercase">
            {annonce.statut === "EN_ATTENTE" ? "En attente" : annonce.statut}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {medias.map((media) => (
            <div
              key={media.id}
              className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-[#2C1810]/5"
            >
              <img
                src={media.fichier}
                alt="Photo de l'annonce"
                className="w-full h-36 object-cover"
              />
              <button
                onClick={() => deleteMedia(media.id)}
                disabled={deletingId === media.id}
                aria-label="Supprimer la photo"
                className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors cursor-pointer disabled:opacity-60"
              >
                {deletingId === media.id ? (
                  <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-500" />
                )}
              </button>
            </div>
          ))}

          {medias.length < MAX_PHOTOS && (
            <label
              className={`flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-[#2C1810]/15 bg-white text-[#2C1810]/50 ${
                uploading
                  ? "opacity-60 cursor-wait"
                  : "cursor-pointer hover:border-[#C9973A] hover:text-[#C9973A]"
              } transition-colors`}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  uploadFiles(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
              ) : (
                <ImagePlus className="w-6 h-6 mb-2" />
              )}
              <span className="text-xs font-semibold">
                {uploading ? "Envoi en cours..." : "Ajouter des photos"}
              </span>
            </label>
          )}
        </div>

        <p className="text-[#2C1810]/50 text-[11px] mt-4 leading-relaxed">
          Formats acceptés : JPG, PNG, WEBP, GIF. La première photo sert de
          couverture dans le flux de recherche.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FAF8F5] border-t border-[#2C1810]/10">
        <button
          onClick={() => navigate("/home/dashboard")}
          className="w-full bg-[#C9973A] text-white py-4 rounded-xl font-semibold text-sm shadow-lg hover:bg-[#b0822e]"
        >
          Terminer
        </button>
      </div>
    </div>
  );
}
