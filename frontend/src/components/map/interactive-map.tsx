"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, useState } from "react";

import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
} from "maplibre-gl";

import { cn } from "../ui/cn";

import type { BaseRoute } from "../routing/types";

import { type DataLayerId } from "./map-layer-data";

import {
  MapLayerControl,
  type MapLayerControlState,
} from "./map-layer-control";

import { CommunityDataLayer } from "./community-data-layer";

import { SpatialDataLayers } from "./spatial-data-layers";

import type { SpatialProperties } from "../../lib/spatial-layers-api";

import type { WalkingArea } from "../../lib/isochrone-api";

import { WalkingOverlay } from "../isochrone/walking-overlay";


const DEFAULT_CENTER: [
  number,
  number,
] = [
  106.8272,
  -6.2045,
];


const ROUTE_SOURCE_ID =
  "ors-route";

const ROUTE_LAYER_ID =
  "ors-route-line";


type LayerKey =
  | DataLayerId
  | "stations";


type LayerVisibility =
  Record<
    LayerKey,
    boolean
  >;


const initialVisibility:
  LayerVisibility = {
  stations: true,

  pju: false,

  police: false,

  health: false,

  survey: true,

  retail24h: true,

};


/* =========================================================
   HIDE BASEMAP STATION LABELS

   Kita menggunakan marker stasiun milik Commute.ly sendiri.
   Jadi label stasiun dari basemap disembunyikan agar tidak
   bertumpuk dengan marker kita.
========================================================= */

function hideBasemapStationLabels(
  map: MapLibreMap,
) {
  const layers =
    map.getStyle().layers ?? [];

  layers.forEach(
    (layer) => {
      const layerId =
        layer.id.toLowerCase();

      const sourceLayer =
        "source-layer" in layer &&
        typeof layer[
          "source-layer"
        ] === "string"
          ? layer[
              "source-layer"
            ].toLowerCase()
          : "";

      if (
        layer.type !==
        "symbol"
      ) {
        return;
      }

      const hasText =
        layer.layout?.[
          "text-field"
        ] !== undefined;

      if (!hasText) {
        return;
      }

      const looksLikeStation =
        layerId.includes(
          "station",
        ) ||
        layerId.includes(
          "stasiun",
        ) ||
        layerId.includes(
          "krl",
        ) ||
        sourceLayer.includes(
          "station",
        ) ||
        sourceLayer.includes(
          "stasiun",
        ) ||
        sourceLayer.includes(
          "krl",
        );

      if (
        looksLikeStation
      ) {
        try {
          map.setLayoutProperty(
            layer.id,
            "visibility",
            "none",
          );
        } catch {
          /* Ignore layers that cannot be modified. */
        }
      }
    },
  );
}


export type InteractiveMapProps = {
  mapStyleUrl?: string;

  className?: string;

  onStationSelect?: (
    stationCode: string,
    station?: SpatialProperties,
  ) => void;

  route?: BaseRoute | null;

  walkingArea?: WalkingArea | null;
};


export function InteractiveMap({
  mapStyleUrl =
    process.env
      .NEXT_PUBLIC_MAPID_STYLE_URL,

  className,

  onStationSelect,

  route,

  walkingArea = null,
}: InteractiveMapProps) {

  const mapNode =
    useRef<HTMLDivElement>(
      null,
    );


  const mapRef =
    useRef<MapLibreMap | null>(
      null,
    );


  const [
    mapReady,
    setMapReady,
  ] = useState(false);


  const [
    visibility,
    setVisibility,
  ] =
    useState<LayerVisibility>(
      initialVisibility,
    );


  /* =========================================================
     INITIALIZE MAP
  ========================================================= */

  useEffect(() => {

    if (
      !mapNode.current ||
      !mapStyleUrl ||
      mapRef.current
    ) {
      return;
    }


    const map =
      new maplibregl.Map({
        container:
          mapNode.current,

        style:
          mapStyleUrl,

        center:
          DEFAULT_CENTER,

        zoom:
          12.8,

        attributionControl: {},

        cooperativeGestures:
          true,
      });


    mapRef.current =
      map;


    /* =====================================================
       NAVIGATION
    ===================================================== */

    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch:
          true,
      }),
      "bottom-right",
    );


    /* =====================================================
       MAP LOAD
    ===================================================== */

    map.on(
      "load",
      () => {

        /* -----------------------------------------------
           Remove station labels from MAPID basemap
        ------------------------------------------------ */

        hideBasemapStationLabels(
          map,
        );


        /* -----------------------------------------------
           Route source
        ------------------------------------------------ */

        map.addSource(
          ROUTE_SOURCE_ID,
          {
            type:
              "geojson",

            data: {
              type:
                "FeatureCollection",

              features: [],
            },
          },
        );


        /* -----------------------------------------------
           Route line
        ------------------------------------------------ */

        map.addLayer({
          id:
            ROUTE_LAYER_ID,

          type:
            "line",

          source:
            ROUTE_SOURCE_ID,

          layout: {
            "line-cap":
              "round",

            "line-join":
              "round",
          },

          paint: {
            "line-color":
              "#ed5b9a",

            "line-width":
              5,

            "line-opacity":
              0.92,

            "line-blur":
              0.15,
          },
        });


        setMapReady(
          true,
        );
      },
    );


    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {

      map.remove();

      mapRef.current =
        null;

      setMapReady(
        false,
      );
    };

  }, [
    mapStyleUrl,
  ]);


  /* =========================================================
     ROUTE UPDATE
  ========================================================= */

  useEffect(() => {

    const map =
      mapRef.current;


    if (
      !map ||
      !mapReady
    ) {
      return;
    }


    const source =
      map.getSource(
        ROUTE_SOURCE_ID,
      ) as
        | GeoJSONSource
        | undefined;


    source?.setData(
      route?.geometry ?? {
        type:
          "FeatureCollection",

        features: [],
      },
    );


    if (!route) {
      return;
    }


    const bounds =
      new maplibregl.LngLatBounds();


    route.geometry.features.forEach(
      (
        feature,
      ) => {

        feature.geometry.coordinates.forEach(
          (
            coordinate,
          ) => {

            bounds.extend([
              coordinate[0],
              coordinate[1],
            ]);
          },
        );
      },
    );


    if (
      !bounds.isEmpty()
    ) {

      map.fitBounds(
        bounds,
        {
          padding: 70,

          maxZoom: 15,

          duration: 850,

          essential: true,
        },
      );
    }

  }, [
    mapReady,
    route,
  ]);


  /* =========================================================
     TOGGLE LAYER
  ========================================================= */

  const toggleLayer =
    (
      layer:
        | DataLayerId
        | "stations",
    ) => {

      setVisibility(
        (
          current,
        ) => ({
          ...current,

          [layer]:
            !current[layer],
        }),
      );
    };


  /* =========================================================
     NO MAP STYLE
  ========================================================= */

  if (
    !mapStyleUrl?.trim()
  ) {

    return (
      <section
        aria-label="Peta interaktif Commute.ly"

        className={cn(
          "grid min-h-80 place-items-center",
          "rounded-[var(--radius-xl)]",
          "border border-[var(--color-line)]",
          "bg-white",
          "p-6",
          "text-center",

          className,
        )}
      >

        <div
          className="
            min-w-0
            max-w-sm
          "
        >

          <h2
            className="
              mb-2
              text-lg
              font-semibold
            "
          >
            Peta belum tersedia
          </h2>


          <p
            className="
              text-sm
              leading-6
              text-[var(--color-muted)]
            "
          >
            Tambahkan URL style MAPID Maps
            ke{" "}

            <code
              className="
                break-all
              "
            >
              NEXT_PUBLIC_MAPID_STYLE_URL
            </code>

            {" "}
            agar peta dapat dimuat.
          </p>

        </div>

      </section>
    );
  }


  /* =========================================================
     MAP
  ========================================================= */

  return (
    <section
      aria-label="Peta interaktif Commute.ly"

      className={cn(
        "relative isolate h-full min-h-80 w-full",
        "overflow-hidden",
        "rounded-[var(--radius-xl)]",
        "border border-white/90",
        "bg-[#ebe7ee]",
        "shadow-[var(--shadow-float)]",

        className,
      )}
    >

      <div
        ref={mapNode}

        className="
          absolute
          inset-0
          h-full
          w-full
        "
      />


      <MapLayerControl
        visibility={
          visibility as MapLayerControlState
        }

        onToggle={
          toggleLayer
        }
      />


      <WalkingOverlay
        map={
          mapReady
            ? mapRef.current
            : null
        }

        area={
          walkingArea
        }
      />


      <CommunityDataLayer
        map={
          mapReady
            ? mapRef.current
            : null
        }

        visible={
          visibility.survey
        }
      />


      <SpatialDataLayers
        map={
          mapReady
            ? mapRef.current
            : null
        }

        visibility={
          visibility
        }

        onStationSelect={
          onStationSelect
        }
      />

    </section>
  );
}