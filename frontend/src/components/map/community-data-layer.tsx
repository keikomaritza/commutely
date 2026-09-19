"use client";

import { useEffect, useState } from "react";
import {
  Popup,
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
} from "maplibre-gl";

import {
  communityPopup,
  fetchCommunityData,
  type CommunityData,
} from "../../lib/community-data-api";

import { dataLayerDefinitions } from "./map-layer-data";

type LoadState =
  | {
      status: "loading";
    }
  | {
      status: "error";
    }
  | {
      status: "ready";
      data: CommunityData;
    };

export function CommunityDataLayer({
  map,
  visible,
}: {
  map: MapLibreMap | null;
  visible: boolean;
}) {
  const [state, setState] = useState<LoadState>({
    status: "loading",
  });

  const [attempt, setAttempt] = useState(0);

  /*
   * Load Community Data
   */
  useEffect(() => {
    const controller = new AbortController();

    fetchCommunityData(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;

        setState({
          status: "ready",
          data,
        });
      },
      () => {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
        });
      },
    );

    return () => {
      controller.abort();
    };
  }, [attempt]);

  /*
   * Render Community Data on map
   */
  useEffect(() => {
    if (!map) return;

    const emptyData = {
      type: "FeatureCollection" as const,
      features: [],
    };

    /*
     * Create source + layer only once
     */
    if (!map.getSource("survey")) {
      map.addSource("survey", {
        type: "geojson",
        data: emptyData,
      });

      map.addLayer({
        id: "survey",
        type: "circle",
        source: "survey",

        paint: {
          /*
           * Community Data
           * UNGU — bukan pink
           */
          "circle-radius": 7,
          "circle-color": "#8757A8",

          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",

          "circle-opacity": 0.95,
        },
      });
    } else {
      /*
       * Pastikan kalau layer sudah pernah dibuat
       * warnanya tetap ungu.
       */
      map.setPaintProperty(
        "survey",
        "circle-color",
        "#8757A8",
      );

      map.setPaintProperty(
        "survey",
        "circle-radius",
        7,
      );

      map.setPaintProperty(
        "survey",
        "circle-stroke-color",
        "#FFFFFF",
      );
    }

    /*
     * Update data
     */
    const source = map.getSource(
      "survey",
    ) as GeoJSONSource;

    source.setData(
      state.status === "ready"
        ? state.data
        : emptyData,
    );

    /*
     * Visibility
     */
    map.setLayoutProperty(
      "survey",
      "visibility",
      visible ? "visible" : "none",
    );

    let popup: Popup | undefined;

    /*
     * Click Community Data
     */
    const click = (
      event: MapLayerMouseEvent,
    ) => {
      /*
       * Kalau titik stasiun juga berada di lokasi
       * yang sama, prioritaskan popup stasiun.
       */
      if (map.getLayer("db-stations")) {
        const stationFeatures =
          map.queryRenderedFeatures(
            event.point,
            {
              layers: ["db-stations"],
            },
          );

        if (stationFeatures.length > 0) {
          return;
        }
      }

      const properties =
        event.features?.[0]?.properties;

      if (!properties) return;

      popup?.remove();

      popup = new Popup({
        offset: 12,
        anchor: "bottom",
      })
        .setLngLat(event.lngLat)
        .setDOMContent(
          communityPopup(properties),
        )
        .addTo(map);
    };

    /*
     * Cursor
     */
    const enter = () => {
      map.getCanvas().style.cursor =
        "pointer";
    };

    const leave = () => {
      map.getCanvas().style.cursor =
        "";
    };

    map.on(
      "click",
      "survey",
      click,
    );

    map.on(
      "mouseenter",
      "survey",
      enter,
    );

    map.on(
      "mouseleave",
      "survey",
      leave,
    );

    /*
     * Cleanup
     */
    return () => {
      popup?.remove();

      map.off(
        "click",
        "survey",
        click,
      );

      map.off(
        "mouseenter",
        "survey",
        enter,
      );

      map.off(
        "mouseleave",
        "survey",
        leave,
      );

      map.getCanvas().style.cursor =
        "";
    };
  }, [
    map,
    state,
    visible,
  ]);

  /*
   * Community Data status
   *
   * Status UI intentionally tidak ditampilkan
   * di atas map supaya tampilan tetap clean.
   */
  if (!visible) {
    return null;
  }

  /*
   * Keep retry state available without
   * adding another floating UI element.
   */
  if (
    state.status === "error" &&
    attempt < 0
  ) {
    setAttempt(0);
  }

  return null;
}