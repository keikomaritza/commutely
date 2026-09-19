"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type FacilityCounts,
  fetchStationFacilities,
  fetchStationLocation,
  fetchStationScore,
  type StationLocation,
  type StationScore,
} from "../../lib/station-info-api";
import type { SpatialProperties } from "../../lib/spatial-layers-api";

type Resource<T> = {
  stationId: string;
  value?: T | null;
  error?: boolean;
};

function displayScore(score: number | string) {
  const value = Number(score);

  return Number.isFinite(value)
    ? value.toFixed(1)
    : "—";
}

function useStationResource<T>(
  stationId: string,
  load: (
    id: string,
    signal: AbortSignal,
  ) => Promise<T | null>,
) {
  const [resource, setResource] =
    useState<Resource<T> | null>(null);

  useEffect(() => {
    const controller =
      new AbortController();

    setResource(null);

    load(stationId, controller.signal).then(
      (value) => {
        if (!controller.signal.aborted) {
          setResource({
            stationId,
            value,
          });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setResource({
            stationId,
            error: true,
          });
        }
      },
    );

    return () => controller.abort();
  }, [stationId, load]);

  return resource?.stationId === stationId
    ? resource
    : null;
}

function getScoreTone(
  category?: string | null,
) {
  const value =
    category?.toLowerCase() ?? "";

  if (
    value.includes("aman") ||
    value.includes("safe")
  ) {
    return "safe";
  }

  if (
    value.includes("tinggi") ||
    value.includes("high")
  ) {
    return "high";
  }

  return "neutral";
}

export function StationInfo({
  station,
}: {
  station: SpatialProperties;
}) {
  const loadScore = useCallback(
    (id: string, signal: AbortSignal) =>
      fetchStationScore(id, signal),
    [],
  );

  const loadFacilities = useCallback(
    (id: string, signal: AbortSignal) =>
      fetchStationFacilities(id, signal),
    [],
  );

  const loadLocation = useCallback(
    (id: string, signal: AbortSignal) =>
      fetchStationLocation(id, signal),
    [],
  );

  const score =
    useStationResource<StationScore>(
      station.id,
      loadScore,
    );

  const facilities =
    useStationResource<FacilityCounts>(
      station.id,
      loadFacilities,
    );

  const location =
    useStationResource<StationLocation>(
      station.id,
      loadLocation,
    );

  const area =
    location?.value?.area ?? null;

  const category =
    score?.value?.category ??
    "Belum tersedia";

  const scoreTone =
    getScoreTone(category);

  return (
    <article className="station-info-card">
      <header className="station-detail-header">
        <div className="station-detail-heading">
          <p className="station-detail-label">
            STASIUN
          </p>

          <h2 className="station-info-name">
            {station.name ?? "Stasiun"}
          </h2>

          <p className="station-info-location">
            <span>
              {station.id.toUpperCase()}
            </span>

            {area && (
              <>
                <span
                  className="station-location-separator"
                  aria-hidden="true"
                >
                  ·
                </span>

                <span>{area}</span>
              </>
            )}
          </p>
        </div>
      </header>

      <section
        className="station-safety-card"
        aria-label="Safety Score"
      >
        <div className="station-card-topline">
          <div>
            <h3>Safety Score</h3>

            <p>
              Tingkat keamanan di sekitar stasiun.
            </p>
          </div>

          <span className="station-card-info">
            ?
          </span>
        </div>

        {!score ? (
          <p
            role="status"
            className="station-inline-status"
          >
            Memuat skor...
          </p>
        ) : score.error ? (
          <p
            role="alert"
            className="station-inline-status station-inline-error"
          >
            Safety Score tidak dapat dimuat.
          </p>
        ) : !score.value ? (
          <p className="station-inline-status">
            Data Safety Score belum tersedia.
          </p>
        ) : (
          <div className="station-score-content">
            <div className="station-score-number">
              {displayScore(
                score.value.safety_score,
              )}
            </div>

            <div className="station-score-copy">
              <span className="station-score-caption">
                Safety Score
              </span>

              <span
                className={`station-score-status station-score-status--${scoreTone}`}
              >
                <span
                  className="station-score-status-dot"
                  aria-hidden="true"
                />

                {category}
              </span>
            </div>
          </div>
        )}
      </section>

      <section
        className="station-facilities-section"
        aria-label="Fasilitas sekitar stasiun"
      >
        <div className="station-section-heading">
          <div>
            <h3>Fasilitas sekitar</h3>

            <p>
              Dalam radius 1 km dari stasiun
            </p>
          </div>
        </div>

        {!facilities ? (
          <p
            role="status"
            className="station-inline-status"
          >
            Memuat fasilitas...
          </p>
        ) : facilities.error ? (
          <p
            role="alert"
            className="station-inline-status station-inline-error"
          >
            Data fasilitas tidak dapat dimuat.
          </p>
        ) : !facilities.value ? (
          <p className="station-inline-status">
            Data fasilitas belum tersedia.
          </p>
        ) : (
          <div className="station-facility-grid">
            <div className="station-facility-item">
              <span className="station-facility-value">
                {facilities.value.lighting}
              </span>

              <span className="station-facility-label">
                Lampu jalan
              </span>
            </div>

            <div className="station-facility-item">
              <span className="station-facility-value">
                {facilities.value.police}
              </span>

              <span className="station-facility-label">
                Polisi
              </span>
            </div>

            <div className="station-facility-item">
              <span className="station-facility-value">
                {facilities.value.retail_24h}
              </span>

              <span className="station-facility-label">
                Toko 24 jam
              </span>
            </div>

            <div className="station-facility-item">
              <span className="station-facility-value">
                {facilities.value.health}
              </span>

              <span className="station-facility-label">
                Kesehatan
              </span>
            </div>
          </div>
        )}
      </section>
    </article>
  );
}
