import { apiClient } from "./client";

/**
 * Récupère toutes les pages d'un endpoint DRF paginé et retourne la liste
 * complète des résultats. L'API enveloppe ses réponses dans
 * { success, data, message } ; on déballe donc systématiquement `data`.
 */
export async function fetchAllPages<T = any>(
  url: string,
  params: Record<string, unknown> = {},
  pageSize = 100
): Promise<T[]> {
  const items: T[] = [];
  let next: string | null = url;
  let pageCount = 0;

  while (next) {
    const response =
      next === url
        ? await apiClient.get(next, { params: { ...params, page_size: pageSize } })
        : await apiClient.get(next);

    const payload = response.data?.data ?? response.data ?? {};

    // Endpoint non paginé : la réponse est directement une liste.
    if (Array.isArray(payload)) {
      items.push(...payload);
      break;
    }

    items.push(...(payload.results ?? []));
    next = payload.next ?? null;

    pageCount += 1;
    if (pageCount > 500) {
      throw new Error("Pagination interrompue : trop de pages.");
    }
  }

  return items;
}
