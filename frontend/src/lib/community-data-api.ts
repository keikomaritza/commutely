import type { Feature, FeatureCollection, Point } from "geojson";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
type SurveyProperties = Record<string, unknown>;
export type CommunityData = FeatureCollection<Point, SurveyProperties>;

function isPointFeature(value: unknown): value is Feature<Point, SurveyProperties> {
  if (!value || typeof value !== "object") return false;
  const feature = value as Record<string, unknown>;
  if (feature.type !== "Feature" || !feature.geometry || typeof feature.geometry !== "object") return false;
  const geometry = feature.geometry as Record<string, unknown>;
  const coordinates = geometry.coordinates;
  return geometry.type === "Point" && Array.isArray(coordinates) && coordinates.length >= 2
    && coordinates.every((coordinate) => typeof coordinate === "number" && Number.isFinite(coordinate))
    && Math.abs(coordinates[0]) <= 180 && Math.abs(coordinates[1]) <= 90
    && !!feature.properties && typeof feature.properties === "object" && !Array.isArray(feature.properties);
}

export async function fetchCommunityData(signal: AbortSignal): Promise<CommunityData> {
  const params = new URLSearchParams({ project_id: "6a9ed0e2753cb27abeaa6aeb", layer_id: "6aa5380a753cb27abe772c59" });
  const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/api/v1/mapid/layer?${params}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(35000)]),
  });
  if (!response.ok) throw new Error("Community Data belum dapat dimuat.");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("features" in payload)
    || !Array.isArray(payload.features) || !payload.features.every(isPointFeature)) {
    throw new Error("Format Community Data tidak valid.");
  }
  return { type: "FeatureCollection", features: payload.features };
}


function getText(properties: SurveyProperties, key: string, fallback: string) {
  const value = properties[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function communityPopup(properties: SurveyProperties): HTMLElement {
  const container = document.createElement("div");
  container.className = "commute-popup";

  const head = document.createElement("div");
  head.className = "commute-popup-head";
  const dot = document.createElement("span");
  dot.className = "commute-popup-dot";
  const eyebrow = document.createElement("span");
  eyebrow.className = "commute-popup-eyebrow";
  eyebrow.textContent = "COMMUNITY DATA";
  head.append(dot, eyebrow);

  const title = document.createElement("h3");
  title.className = "commute-popup-title";
  title.textContent = getText(properties, "data__activities__title", "Community Data");

  const description = document.createElement("p");
  description.className = "commute-popup-description";
  description.textContent = getText(properties, "data__activities__description", "Deskripsi tidak tersedia.");

  const date = document.createElement("div");
  date.className = "commute-popup-meta";
  date.textContent = getText(properties, "data__activities__created_at", "Tanggal tidak tersedia.");

  container.append(head, title, description, date);

  const mediaUrls: string[] = [];
  for (let index = 1; index <= 6; index++) {
    const value = properties[`data__activities__medias__${String(index).padStart(3, "0")}`];
    if (typeof value !== "string" || !value.trim()) continue;
    try {
      const url = new URL(value);
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) continue;
      mediaUrls.push(url.href);
    } catch {
      // Ignore invalid media URLs.
    }
  }

  if (!mediaUrls.length) return container;

  let currentIndex = 0;
  const preview = document.createElement("div");
  const link = document.createElement("a");
  link.className = "commute-popup-action";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Buka media →";

  const showMedia = () => {
    const url = mediaUrls[currentIndex];
    link.href = url;
    const image = document.createElement("img");
    image.className = "commute-popup-image";
    image.alt = `Media survei ${currentIndex + 1} dari ${mediaUrls.length}`;
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.src = url;
    preview.replaceChildren(image);
  };

  showMedia();
  container.append(preview, link);

  if (mediaUrls.length > 1) {
    const controls = document.createElement("div");
    controls.className = "commute-popup-media-controls";
    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "commute-popup-media-button";
    previous.textContent = "←";
    previous.setAttribute("aria-label", "Media sebelumnya");
    const count = document.createElement("span");
    count.className = "commute-popup-media-count";
    const next = document.createElement("button");
    next.type = "button";
    next.className = "commute-popup-media-button";
    next.textContent = "→";
    next.setAttribute("aria-label", "Media berikutnya");

    const refresh = () => { count.textContent = `${currentIndex + 1} / ${mediaUrls.length}`; showMedia(); };
    previous.onclick = () => { currentIndex = (currentIndex - 1 + mediaUrls.length) % mediaUrls.length; refresh(); };
    next.onclick = () => { currentIndex = (currentIndex + 1) % mediaUrls.length; refresh(); };
    refresh();
    controls.append(previous, count, next);
    container.append(controls);
  }

  return container;
}
