import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Bed, Sofa, Bath, MapPin, MessageCircle, Loader2 } from "lucide-react";
import { apiClient } from "../api/client";

export function ListingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch listing detail from real API
  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["annonce", id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/annonces/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });

  const listing = responseData?.data;

  const handleWhatsAppContact = () => {
    if (!listing?.proprietaire_detail?.telephone) return;
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé par votre annonce "${listing.titre}" affichée à ${Number(listing.prix).toLocaleString()} BIF.`
    );
    const tel = listing.proprietaire_detail.telephone.replace(/\s/g, "");
    window.open(`https://wa.me/${tel}?text=${message}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9973A] animate-spin mb-2" />
        <p className="text-[#2C1810]/60 text-sm">Chargement des détails...</p>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 font-medium mb-2">Impossible de charger cette annonce.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#C9973A] text-white px-6 py-2 rounded-xl text-sm"
        >
          Retourner au flux
        </button>
      </div>
    );
  }

  // If the backend has hidden geographic/owner details due to lack of active subscription:
  const isGated = !listing.quartier_detail || !listing.proprietaire_detail;

  const images = listing.medias?.map((m: any) => m.image) || [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* Upper Navigation & Slider */}
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-[#2C1810]" />
        </button>

        <div className="relative">
          <img
            src={images[currentImageIndex]}
            alt={listing.titre}
            className={`w-full h-80 object-cover ${isGated ? "blur-md" : ""}`}
          />
          
          {isGated && (
            <div className="absolute inset-0 bg-[#2C1810]/50 flex items-center justify-center p-6">
              <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto text-center shadow-2xl">
                <h3 className="text-[#2C1810] font-semibold mb-3">
                  Abonnement requis pour contacter et localiser
                </h3>
                <p className="text-xs text-[#2C1810]/60 mb-4">
                  Souscrivez à un abonnement pour déverrouiller l'accès complet à tous les biens.
                </p>
                <button
                  onClick={() => navigate("/home/profile")}
                  className="w-full bg-[#C9973A] text-white py-3 rounded-xl text-sm font-medium shadow-md hover:bg-[#b0822e]"
                >
                  S'abonner maintenant
                </button>
              </div>
            </div>
          )}

          {!isGated && images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title & Stats */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[#2C1810] text-xl font-bold mb-1">{listing.titre}</h2>
            <p className="text-[#C9973A] text-2xl font-bold mb-2">
              {Number(listing.prix).toLocaleString()} BIF
            </p>
            <div className="flex items-center gap-2 text-[#2C1810]/60 text-sm">
              <MapPin className="w-5 h-5 text-[#C9973A]" />
              <span>
                {listing.quartier_detail 
                  ? `${listing.quartier_detail.nom}, ${listing.quartier_detail.commune_nom}` 
                  : "Adresse masquée (Abonnement requis)"}
              </span>
            </div>
          </div>
          <div className="px-3 py-1 bg-[#2C1810] text-white rounded-lg text-xs font-semibold uppercase">
            {listing.type_bien}
          </div>
        </div>

        {/* Room counts */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#2C1810]/5">
          <div className="flex justify-around">
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-[#C9973A]" />
              <div>
                <p className="text-[10px] text-[#2C1810]/60 font-medium">Chambres</p>
                <p className="text-[#2C1810] font-semibold text-sm">{listing.nb_chambres}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sofa className="w-5 h-5 text-[#C9973A]" />
              <div>
                <p className="text-[10px] text-[#2C1810]/60 font-medium">Salons</p>
                <p className="text-[#2C1810] font-semibold text-sm">{listing.nb_salons}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-[#C9973A]" />
              <div>
                <p className="text-[10px] text-[#2C1810]/60 font-medium">Toilettes</p>
                <p className="text-[#2C1810] font-semibold text-sm">{listing.nb_toilettes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#2C1810]/5">
          <h3 className="text-[#2C1810] font-semibold mb-2">Description</h3>
          <p className="text-[#2C1810]/70 text-sm leading-relaxed whitespace-pre-line">
            {listing.description}
          </p>
        </div>
      </div>

      {/* Floating Call to Action */}
      {!isGated && listing.proprietaire_detail && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-[#FAF8F5] border-t border-[#2C1810]/10 shadow-lg">
          <button
            onClick={handleWhatsAppContact}
            className="w-full bg-[#25D366] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow font-semibold text-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Contacter via WhatsApp ({listing.proprietaire_detail.telephone})
          </button>
        </div>
      )}
    </div>
  );
}
