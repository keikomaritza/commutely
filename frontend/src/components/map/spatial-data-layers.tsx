"use client";

import { useEffect, useState } from "react";

import {
  Popup,
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
} from "maplibre-gl";

import {
  fetchSpatialLayer,
  type Retail24hProperties,
  type SpatialLayerId,
  type SpatialProperties,
} from "../../lib/spatial-layers-api";

import type { MapLayerControlState } from "./map-layer-control";


/* =========================================================
   LAYER DEFINITIONS
   ========================================================= */

const definitions = {
  stations: {
    label: "Stasiun",
    color: "#e83e8c",
  },

  pju: {
    label: "PJU",
    color: "#eab308",
  },

  health: {
    label: "Fasilitas kesehatan",
    color: "#14b8a6",
  },

  police: {
    label: "Kantor polisi",
    color: "#2563eb",
  },

  retail24h: {
    label: "Fasilitas 24 Jam",
    color: "#f97316",
  },
};


/* =========================================================
   GENERIC PROPERTY READER
   ========================================================= */

function textProperty(
  properties: Record<string, unknown>,
  key: string,
) {
  const value = properties[key];

  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}


/* =========================================================
   STATION MARKER
   Circle + station code = ONE IMAGE
   Jadi kode tidak akan terpisah dari lingkarannya.
   ========================================================= */

function createStationImage(
  code: string,
): ImageData {
  const size = 96;

  const canvas =
    document.createElement("canvas");

  canvas.width = size;
  canvas.height = size;

  const context =
    canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "Canvas context tidak tersedia.",
    );
  }

  context.clearRect(
    0,
    0,
    size,
    size,
  );

  const center = size / 2;
  const radius = 31;

  /* Pink circle */
  context.beginPath();

  context.arc(
    center,
    center,
    radius,
    0,
    Math.PI * 2,
  );

  context.fillStyle =
    definitions.stations.color;

  context.fill();


  /* White outline */
  context.lineWidth = 5;

  context.strokeStyle =
    "#ffffff";

  context.stroke();


  /* Station code */
  const safeCode =
    code
      .trim()
      .toUpperCase()
      .slice(0, 5);

  context.fillStyle =
    "#ffffff";

  context.font =
    "800 17px Inter, Arial, sans-serif";

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.fillText(
    safeCode,
    center,
    center + 1,
  );


  return context.getImageData(
    0,
    0,
    size,
    size,
  );
}


/* =========================================================
   PREPARE STATION IMAGES
   ========================================================= */

function prepareStationImages(
  map: MapLibreMap,
  data: GeoJSON.FeatureCollection,
) {
  data.features.forEach(
    (feature) => {
      const properties =
        (feature.properties ??
          {}) as Record<
          string,
          unknown
        >;

      const rawId =
        properties.id;

      if (
        typeof rawId !==
        "string"
      ) {
        return;
      }

      const code =
        rawId
          .trim()
          .toUpperCase();

      if (!code) {
        return;
      }

      const imageId =
        `commutely-station-${code}`;

      if (
        map.hasImage(imageId)
      ) {
        return;
      }

      const image =
        createStationImage(code);

      map.addImage(
        imageId,
        image,
        {
          pixelRatio: 2,
        },
      );
    },
  );
}


/* =========================================================
   RETAIL 24H POPUP
   ========================================================= */

function retailPopup(
  properties: Record<string, unknown>,
) {
  const content =
    document.createElement("div");

  content.className =
    "space-y-1 text-sm text-slate-700";

  const name =
    textProperty(
      properties,
      "name",
    ) ??
    "Retail 24 Jam";

  const title =
    document.createElement(
      "strong",
    );

  title.className =
    "block text-slate-900";

  title.textContent =
    name;

  content.append(title);


  const addField = (
    label: string,
    value: string | null,
  ) => {
    if (!value) return;

    const field =
      document.createElement(
        "div",
      );

    field.textContent =
      `${label}: ${value}`;

    content.append(field);
  };


  addField(
    "Kategori",
    textProperty(
      properties,
      "category",
    ),
  );


  addField(
    "Alamat",
    textProperty(
      properties,
      "address",
    ),
  );


  const rating =
    properties.rating;

  if (
    typeof rating ===
      "number" &&
    Number.isFinite(
      rating,
    )
  ) {
    addField(
      "Rating",
      String(rating),
    );
  }


  addField(
    "Telepon",
    textProperty(
      properties,
      "phone",
    ),
  );


  const website =
    textProperty(
      properties,
      "website",
    );

  if (website) {
    const field =
      document.createElement(
        "div",
      );

    const link =
      document.createElement(
        "a",
      );

    try {
      const url =
        new URL(website);

      if (
        url.protocol ===
          "http:" ||
        url.protocol ===
          "https:"
      ) {
        link.href =
          url.toString();

        link.target =
          "_blank";

        link.rel =
          "noreferrer";
      }
    } catch {
      /* Display URL as plain text */
    }

    link.className =
      "text-blue-600 underline";

    link.textContent =
      website;

    field.append(
      "Website: ",
      link,
    );

    content.append(field);
  }


  return content;
}


/* =========================================================
   SPATIAL LAYER
   ========================================================= */

function SpatialLayer({
  map,
  layer,
  visible,
  onStationSelect,
}: {
  map: MapLibreMap;

  layer: SpatialLayerId;

  visible: boolean;

  onStationSelect?: (
    code: string,
    station?: SpatialProperties,
  ) => void;
}) {
  const [status, setStatus] =
    useState("");

  const [attempt, setAttempt] =
    useState(0);


  useEffect(() => {
    /*
      IMPORTANT:
      Source ID tetap db-${layer}.
      Untuk station, render layer ID dibuat
      berbeda supaya kita bisa menggunakan
      symbol marker + kode.
    */

    const sourceId =
      `db-${layer}`;

    const renderLayerId =
      layer === "stations"
        ? "db-stations-marker"
        : sourceId;


    const empty = {
      type:
        "FeatureCollection" as const,

      features: [],
    };


    /* =====================================================
       CREATE SOURCE
       ===================================================== */

    if (
      !map.getSource(
        sourceId,
      )
    ) {
      map.addSource(
        sourceId,
        {
          type: "geojson",
          data: empty,
        },
      );
    }


    /* =====================================================
       CREATE RENDER LAYER
       ===================================================== */

    if (
      !map.getLayer(
        renderLayerId,
      )
    ) {

      if (
        layer ===
        "stations"
      ) {

        /*
          STATION:
          Satu symbol = satu group
          circle + code.
        */

        map.addLayer({
          id:
            renderLayerId,

          type:
            "symbol",

          source:
            sourceId,

          layout: {
            "icon-image": [
              "concat",
              "commutely-station-",
              [
                "to-string",
                [
                  "get",
                  "id",
                ],
              ],
            ],

            "icon-size":
              0.90,

            "icon-anchor":
              "center",

            "symbol-placement":
              "point",

            /*
              Marker boleh overlap.
              Yang overlap adalah
              SATU GROUP marker.
            */

            "icon-allow-overlap":
              true,

            "icon-ignore-placement":
              true,
          },
        });

      } else {

        map.addLayer({
          id:
            renderLayerId,

          type:
            "circle",

          source:
            sourceId,

          paint: {
            "circle-radius":
              layer ===
              "pju"
                ? 3
                : 7,

            "circle-color":
              definitions[
                layer
              ].color,

            "circle-stroke-width":
              1,

            "circle-stroke-color":
              "#ffffff",
          },
        });
      }
    }


    /* =====================================================
       VISIBILITY
       ===================================================== */

    if (
      map.getLayer(
        renderLayerId,
      )
    ) {
      map.setLayoutProperty(
        renderLayerId,
        "visibility",
        visible
          ? "visible"
          : "none",
      );
    }


    if (!visible) {
      return;
    }


    let active = true;

    let controller:
      | AbortController
      | undefined;

    let timer:
      | ReturnType<
          typeof setTimeout
        >;

    let popup:
      | Popup
      | undefined;


    const source =
      map.getSource(
        sourceId,
      ) as GeoJSONSource;


    /* =====================================================
       LOAD DATA
       ===================================================== */

    const load = async () => {
      controller?.abort();

      const request =
        new AbortController();

      controller =
        request;

      setStatus(
        "Memuat…",
      );

      source.setData(
        empty,
      );


      try {
        const bounds =
          map.getBounds();


        const bbox =
          layer === "pju"
            ? [
                Math.max(
                  -180,
                  bounds.getWest(),
                ),

                Math.max(
                  -90,
                  bounds.getSouth(),
                ),

                Math.min(
                  180,
                  bounds.getEast(),
                ),

                Math.min(
                  90,
                  bounds.getNorth(),
                ),
              ]
            : undefined;


        const data =
          await fetchSpatialLayer(
            layer,
            request.signal,
            bbox,
          );


        if (
          !active ||
          request.signal
            .aborted
        ) {
          return;
        }


        /* ================================================
           STATION IMAGE PREPARATION
           ================================================ */

        if (
          layer ===
          "stations"
        ) {
          prepareStationImages(
            map,
            data,
          );
        }


        /* ================================================
           PUT DATA ON MAP
           ================================================ */

        source.setData(
          data,
        );


        setStatus(
          data.zoom_in_required
            ? "Perbesar peta untuk melihat PJU (maks. 2.000 titik)."
            : data.features.length
              ? ""
              : "Tidak ada data di area ini.",
        );

      } catch {
        if (
          active &&
          !request.signal
            .aborted
        ) {
          setStatus(
            "Gagal memuat.",
          );
        }
      }
    };


    /* =====================================================
       RESCHEDULE PJU
       ===================================================== */

    const schedule = () => {
      controller?.abort();

      source.setData(
        empty,
      );

      setStatus(
        "Memuat…",
      );

      clearTimeout(
        timer,
      );

      timer =
        setTimeout(
          () => void load(),
          350,
        );
    };


    /* =====================================================
       MAP MOVING
       ===================================================== */

    const moving = () => {
      controller?.abort();

      clearTimeout(
        timer,
      );

      source.setData(
        empty,
      );

      popup?.remove();
    };


    /* =====================================================
       CLICK
       ===================================================== */

    const click = (
      event: MapLayerMouseEvent,
    ) => {
      const properties =
        event.features?.[0]
          ?.properties;


      if (!properties) {
        return;
      }


      /* ================================================
         RETAIL 24 JAM
         ================================================ */

      if (
        layer ===
        "retail24h"
      ) {
        popup?.remove();

        popup =
          new Popup({
            offset: 12,
          })
            .setLngLat(
              event.lngLat,
            )
            .setDOMContent(
              retailPopup(
                properties,
              ),
            )
            .addTo(map);

        return;
      }


      /* ================================================
         ID
         ================================================ */

      if (
        typeof properties.id !==
        "string"
      ) {
        return;
      }


      const name =
        typeof properties.name ===
        "string"
          ? properties.name
          : null;


      /* ================================================
         GEOMETRY
         ================================================ */

      const geometry =
        event.features?.[0]
          ?.geometry;


      const coordinates =
        geometry?.type ===
          "Point" &&
        Array.isArray(
          geometry.coordinates,
        ) &&
        geometry.coordinates.length ===
          2 &&
        geometry.coordinates.every(
          (value) =>
            typeof value ===
              "number" &&
            Number.isFinite(
              value,
            ),
        )
          ? ([
              geometry
                .coordinates[0],
              geometry
                .coordinates[1],
            ] as [
              number,
              number,
            ])
          : undefined;


      /* ================================================
         BASIC POPUP
         ================================================ */

      const content =
        document.createElement(
          "div",
        );

      content.textContent =
        name ??
        definitions[layer]
          .label;


      popup?.remove();


      popup =
        new Popup({
          offset: 12,
        })
          .setLngLat(
            event.lngLat,
          )
          .setDOMContent(
            content,
          )
          .addTo(map);


      /* ================================================
         STATION SELECT
         ================================================ */

      if (
        layer ===
        "stations"
      ) {
        onStationSelect?.(
          properties.id,
          {
            id:
              properties.id,

            name,

            coordinates,
          },
        );
      }
    };


    /* =====================================================
       CURSOR
       ===================================================== */

    const enter = () => {
      map.getCanvas().style.cursor =
        "pointer";
    };


    const leave = () => {
      map.getCanvas().style.cursor =
        "";
    };


    /* =====================================================
       EVENT LISTENERS
       ===================================================== */

    map.on(
      "click",
      renderLayerId,
      click,
    );


    map.on(
      "mouseenter",
      renderLayerId,
      enter,
    );


    map.on(
      "mouseleave",
      renderLayerId,
      leave,
    );


    /* =====================================================
       PJU ONLY:
       reload according to viewport
       ===================================================== */

    if (
      layer === "pju"
    ) {
      map.on(
        "movestart",
        moving,
      );

      map.on(
        "moveend",
        schedule,
      );
    }


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    void load();


    /* =====================================================
       CLEANUP
       ===================================================== */

    return () => {
      active = false;

      controller?.abort();

      clearTimeout(
        timer,
      );

      popup?.remove();


      if (
        layer === "pju"
      ) {
        map.off(
          "movestart",
          moving,
        );

        map.off(
          "moveend",
          schedule,
        );
      }


      map.off(
        "click",
        renderLayerId,
        click,
      );


      map.off(
        "mouseenter",
        renderLayerId,
        enter,
      );


      map.off(
        "mouseleave",
        renderLayerId,
        leave,
      );


      map.getCanvas().style.cursor =
        "";
    };

  }, [
    map,
    layer,
    visible,
    onStationSelect,
    attempt,
  ]);


  /* =======================================================
     STATUS UI
     ======================================================= */

  if (
    !visible ||
    !status
  ) {
    return null;
  }


  return (
    <div
      role="status"
      className="
        ui-slide-up

        flex
        items-center
        gap-2

        rounded-[var(--radius-md)]

        border
        border-white/80

        bg-white/95

        px-3
        py-2

        text-xs

        text-[var(--color-ink)]

        shadow-[var(--shadow-float)]

        backdrop-blur
      "
    >
      <span
        aria-hidden="true"
        className="
          size-2

          shrink-0

          rounded-full

          bg-[var(--color-primary)]
        "
      />

      <span>
        {
          definitions[
            layer
          ].label
        }
        :{" "}
        {status}
      </span>


      {status ===
        "Gagal memuat." && (
        <button
          type="button"
          className="
            ui-interactive
            ui-soft-focus

            rounded-[var(--radius-pill)]

            px-2
            py-1

            font-semibold

            text-[var(--color-primary-strong)]

            hover:bg-[var(--color-primary-soft)]

            active:scale-95
          "
          onClick={() =>
            setAttempt(
              (value) =>
                value + 1,
            )
          }
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}


/* =========================================================
   SPATIAL DATA LAYERS
   ========================================================= */

export function SpatialDataLayers({
  map,
  visibility,
  onStationSelect,
}: {
  map: MapLibreMap | null;

  visibility:
    MapLayerControlState;

  onStationSelect?: (
    code: string,
    station?: SpatialProperties,
  ) => void;
}) {
  if (!map) {
    return null;
  }


  return (
    <div
      className="
        absolute
        right-3
        top-3
        z-10

        max-w-[65%]

        space-y-1

        text-slate-700
      "
    >
      {(
        Object.keys(
          definitions,
        ) as SpatialLayerId[]
      ).map(
        (layer) => (
          <SpatialLayer
            key={layer}
            map={map}
            layer={layer}
            visible={
              visibility[layer]
            }
            onStationSelect={
              onStationSelect
            }
          />
        ),
      )}
    </div>
  );
}