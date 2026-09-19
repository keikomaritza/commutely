"use client";

import { useEffect } from "react";

import {
  type GeoJSONSource,
  type Map as MapLibreMap,
} from "maplibre-gl";

import type { WalkingArea } from "../../lib/isochrone-api";


const WALKING_SOURCE_ID = "walking-area";
const WALKING_FILL_ID = "walking-area";
const WALKING_OUTLINE_ID = "walking-area-outline";

const EMPTY_AREA: WalkingArea = {
  type: "FeatureCollection",
  features: [],
};


/* =========================================================
   WALKING OVERLAY
========================================================= */

export function WalkingOverlay({
  map,
  area,
}: {
  map: MapLibreMap | null;
  area: WalkingArea | null;
}) {

  useEffect(() => {

    if (!map) {
      return;
    }

    /*
     * Setelah pengecekan di atas,
     * gunakan mapInstance supaya TypeScript tahu
     * bahwa nilainya tidak mungkin null.
     */
    const mapInstance = map;


    /*
     * =====================================================
     * UPDATE WALKING LAYER
     * =====================================================
     */

    const updateWalkingLayer = () => {

      /*
       * Pastikan style MapLibre sudah siap.
       */
      if (!mapInstance.isStyleLoaded()) {
        return;
      }


      /*
       * ===================================================
       * SOURCE
       * ===================================================
       */

      if (!mapInstance.getSource(WALKING_SOURCE_ID)) {

        mapInstance.addSource(
          WALKING_SOURCE_ID,
          {
            type: "geojson",
            data: area ?? EMPTY_AREA,
          },
        );
      }


      /*
       * ===================================================
       * FILL LAYER
       * ===================================================
       */

      if (!mapInstance.getLayer(WALKING_FILL_ID)) {

        mapInstance.addLayer({
          id: WALKING_FILL_ID,

          type: "fill",

          source: WALKING_SOURCE_ID,

          paint: {
            "fill-color": "#ee5b9b",
            "fill-opacity": 0.16,
            "fill-antialias": true,
          },
        });
      }


      /*
       * ===================================================
       * OUTLINE LAYER
       * ===================================================
       */

      if (!mapInstance.getLayer(WALKING_OUTLINE_ID)) {

        mapInstance.addLayer({
          id: WALKING_OUTLINE_ID,

          type: "line",

          source: WALKING_SOURCE_ID,

          layout: {
            "line-cap": "round",
            "line-join": "round",
          },

          paint: {
            "line-color": "#d63d80",
            "line-width": 2,
            "line-opacity": 0.82,
            "line-blur": 0.1,
          },
        });
      }


      /*
       * ===================================================
       * UPDATE GEOJSON DATA
       * ===================================================
       */

      const source =
        mapInstance.getSource(
          WALKING_SOURCE_ID,
        ) as GeoJSONSource | undefined;


      if (!source) {
        return;
      }


      source.setData(
        area ?? EMPTY_AREA,
      );


      /*
       * ===================================================
       * VISIBILITY
       * ===================================================
       */

      const visibility =
        area && area.features.length > 0
          ? "visible"
          : "none";


      if (mapInstance.getLayer(WALKING_FILL_ID)) {

        mapInstance.setLayoutProperty(
          WALKING_FILL_ID,
          "visibility",
          visibility,
        );
      }


      if (mapInstance.getLayer(WALKING_OUTLINE_ID)) {

        mapInstance.setLayoutProperty(
          WALKING_OUTLINE_ID,
          "visibility",
          visibility,
        );
      }


      /*
       * ===================================================
       * MOVE WALKING AREA TO TOP
       * ===================================================
       */

      try {

        const styleLayers =
          mapInstance.getStyle().layers ?? [];

        const lastLayer =
          styleLayers[
            styleLayers.length - 1
          ];


        if (
          lastLayer &&
          lastLayer.id !== WALKING_FILL_ID &&
          lastLayer.id !== WALKING_OUTLINE_ID
        ) {

          mapInstance.moveLayer(
            WALKING_FILL_ID,
          );

          mapInstance.moveLayer(
            WALKING_OUTLINE_ID,
          );
        }

      } catch {
        /*
         * Tidak perlu menggagalkan overlay
         * hanya karena urutan layer.
         */
      }
    };


    /*
     * =====================================================
     * STYLE READY
     * =====================================================
     */

    if (mapInstance.isStyleLoaded()) {

      updateWalkingLayer();

    } else {

      mapInstance.once(
        "load",
        updateWalkingLayer,
      );

      return () => {

        mapInstance.off(
          "load",
          updateWalkingLayer,
        );
      };
    }

  }, [
    map,
    area,
  ]);


  /*
   * =======================================================
   * LEGEND
   * =======================================================
   */

  if (!area?.features.length) {
    return null;
  }


  const first =
    area.features[0];


  const duration =
    first.properties &&
    typeof first.properties.duration_s === "number"
      ? Math.round(
          first.properties.duration_s / 60,
        )
      : null;


  return (
    <div className="walking-legend ui-pop-in">

      <span
        className="walking-legend-swatch"
        aria-hidden="true"
      />

      <span>
        Area berjalan kaki
        {duration !== null
          ? ` · ${duration} menit`
          : ""}
      </span>

    </div>
  );
}