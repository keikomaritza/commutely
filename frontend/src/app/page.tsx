"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchSpatialLayer,
} from "../lib/spatial-layers-api";

import { EmergencyContact } from "../components/emergency/emergency-contact";
import { DigitalClock } from "../components/ui/digital-clock";
import { InteractiveMap } from "../components/map/interactive-map";
import { RoutePlanner } from "../components/routing/route-planner";
import { StationInfo } from "../components/station/station-info";
import { StationSchedule } from "../components/station/station-schedule";
import { MapNavigation } from "../components/ui/navigation";
import { Text } from "../components/ui/typography";
import type { BaseRoute } from "../components/routing/types";
import { AssistantChat } from "../components/assistant/assistant-chat";
import type { SpatialProperties } from "../lib/spatial-layers-api";
import type { WalkingArea } from "../lib/isochrone-api";
import { WalkingControls } from "../components/isochrone/walking-controls";

import {
  fetchStations,
  fetchStationScore,
  type ApiStation,
} from "../lib/station-info-api";


/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    id: "stations",
    label: "Stasiun",

    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-4.5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 4h10a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />

        <path
          d="M8 8h8m-8 4h8M8 21l2-3m6 3-2-3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },

  {
    id: "routing",
    label: "Rute",

    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-4.5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 18c3-7 5-10 9-10h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <path
          d="m16 5 3 3-3 3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx="5"
          cy="18"
          r="2"
          fill="currentColor"
        />
      </svg>
    ),
  },
];


/* =========================================================
   HERO STATION TYPE
========================================================= */

type HeroStation = ApiStation & {
  safetyScore: number | null;
};


/* =========================================================
   NORMALIZE STATION NAME
========================================================= */

function normalizeStationName(
  value: string | null | undefined,
) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, " ") ?? ""
  );
}


/* =========================================================
   EXCLUDE KARET
========================================================= */

function isExcludedStation(
  station: ApiStation,
) {
  const name =
    normalizeStationName(
      station.name,
    );

  const id =
    normalizeStationName(
      station.id,
    );

  return (
    name === "karet" ||
    id === "karet"
  );
}


/* =========================================================
   HOME PAGE
========================================================= */

export default function HomePage() {

  /* =======================================================
     PANEL
  ======================================================= */

  const [
    activePanel,
    setActivePanel,
  ] = useState("stations");


  /* =======================================================
     SELECTED MAP STATION
  ======================================================= */

  const [
    mapStation,
    setMapStation,
  ] = useState<SpatialProperties | null>(
    null,
  );


  /* =======================================================
     ROUTE
  ======================================================= */

  const [
    route,
    setRoute,
  ] = useState<BaseRoute | null>(
    null,
  );


  /* =======================================================
     WALKING AREA
  ======================================================= */

  const [
    walkingArea,
    setWalkingArea,
  ] = useState<WalkingArea | null>(
    null,
  );

  const [
  stationSearch,
  setStationSearch,
] = useState("");

const [
  stationList,
  setStationList,
] = useState<
  SpatialProperties[]
>([]);

const [
  stationLoading,
  setStationLoading,
] = useState(false);

/* =========================================================
   LOAD STATIONS FOR SEARCH
========================================================= */

useEffect(() => {
  const controller =
    new AbortController();

  const loadStations =
    async () => {
      setStationLoading(true);

      try {
        const data =
          await fetchSpatialLayer(
            "stations",
            controller.signal,
          );

        const stations: SpatialProperties[] =
          data.features.flatMap((feature) => {
            const properties =
              (feature.properties ??
                {}) as Record<
                string,
                unknown
              >;

            const id =
              typeof properties.id ===
              "string"
                ? properties.id
                : null;

            const name =
              typeof properties.name ===
              "string"
                ? properties.name
                : null;

            const geometry =
              feature.geometry;

            if (
              !id ||
              geometry.type !== "Point" ||
              !Array.isArray(
                geometry.coordinates,
              ) ||
              geometry.coordinates.length !== 2
            ) {
              return [];
            }

            const longitude =
              geometry.coordinates[0];

            const latitude =
              geometry.coordinates[1];

            if (
              typeof longitude !==
                "number" ||
              typeof latitude !==
                "number" ||
              !Number.isFinite(
                longitude,
              ) ||
              !Number.isFinite(
                latitude,
              )
            ) {
              return [];
            }

            return [
              {
                id,
                name,
                coordinates: [
                  longitude,
                  latitude,
                ] as [
                  number,
                  number,
                ],
              },
            ];
          });

        setStationList(
          stations,
        );
      } catch {
        if (
          !controller.signal.aborted
        ) {
          setStationList([]);
        }
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setStationLoading(
            false,
          );
        }
      }
    };

  void loadStations();

  return () => {
    controller.abort();
  };
}, []);


  /* =======================================================
     FILTER STATIONS FOR SEARCH
  ======================================================= */

  const filteredStations =
    stationList
      .filter((station: SpatialProperties) => {
        const query =
          stationSearch
            .trim()
            .toLowerCase();

        if (!query) {
          return false;
        }

        const name =
          station.name?.toLowerCase() ?? "";

        const code =
          station.id.toLowerCase();

        return (
          name.includes(query) ||
          code.includes(query)
        );
      })
      .slice(0, 6);


  /* =======================================================
     HERO STATIONS
  ======================================================= */

  const [
    heroStations,
    setHeroStations,
  ] = useState<HeroStation[]>([]);

  const [
    heroLoading,
    setHeroLoading,
  ] = useState(true);

  const [
    heroError,
    setHeroError,
  ] = useState(false);


  /* =======================================================
     CAROUSEL
  ======================================================= */

  const [
    heroStationIndex,
    setHeroStationIndex,
  ] = useState(0);

  const [
    heroDirection,
    setHeroDirection,
  ] = useState<"next" | "prev">(
    "next",
  );

  const [
    heroAnimating,
    setHeroAnimating,
  ] = useState(false);


  const heroStation =
    heroStations[
      heroStationIndex
    ] ?? null;


  /* =======================================================
     LOAD ALL STATIONS
  ======================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    const loadStations =
      async () => {
        setHeroLoading(true);
        setHeroError(false);

        try {
          const stations =
            await fetchStations(
              controller.signal,
            );

          if (
            controller.signal.aborted
          ) {
            return;
          }


          /*
           * Semua stasiun tetap diambil
           * dari backend.
           *
           * Hanya Karet yang dikeluarkan.
           */

          const activeStations =
            stations.filter(
              (station) =>
                !isExcludedStation(
                  station,
                ),
            );


          /*
           * Ambil Safety Score
           * setiap stasiun.
           */

          const scoredStations =
            await Promise.all(
              activeStations.map(
                async (
                  station,
                ) => {

                  try {
                    const score =
                      await fetchStationScore(
                        station.id,
                        controller.signal,
                      );

                    if (
                      controller.signal
                        .aborted
                    ) {
                      return null;
                    }


                    const numericScore =
                      score
                        ? Number(
                            score.safety_score,
                          )
                        : null;


                    return {
                      ...station,

                      safetyScore:
                        numericScore !==
                          null &&
                        Number.isFinite(
                          numericScore,
                        )
                          ? numericScore
                          : null,
                    };

                  } catch {

                    /*
                     * Kalau Safety Score
                     * tidak tersedia,
                     * station tetap ditampilkan.
                     */

                    return {
                      ...station,
                      safetyScore: null,
                    };
                  }
                },
              ),
            );


          if (
            controller.signal.aborted
          ) {
            return;
          }


          const validStations =
            scoredStations.filter(
              (
                station,
              ): station is HeroStation =>
                station !== null,
            );


          setHeroStations(
            validStations,
          );

          setHeroStationIndex(0);

        } catch {

          if (
            !controller.signal.aborted
          ) {
            setHeroError(true);
            setHeroStations([]);
          }

        } finally {

          if (
            !controller.signal.aborted
          ) {
            setHeroLoading(false);
          }

        }
      };


    void loadStations();


    return () => {
      controller.abort();
    };

  }, []);


  /* =======================================================
     CHANGE STATION
  ======================================================= */

  const changeHeroStation =
    useCallback(
      (
        direction:
          | "next"
          | "prev",
      ) => {

        if (
          heroAnimating ||
          heroStations.length <= 1
        ) {
          return;
        }


        setHeroDirection(
          direction,
        );

        setHeroAnimating(true);


        window.setTimeout(() => {

          setHeroStationIndex(
            (current) => {

              if (
                direction ===
                "next"
              ) {

                return (
                  (current + 1) %
                  heroStations.length
                );

              }


              return (
                (
                  current -
                  1 +
                  heroStations.length
                ) %
                heroStations.length
              );
            },
          );


          setHeroAnimating(
            false,
          );

        }, 180);

      },
      [
        heroAnimating,
        heroStations.length,
      ],
    );


  /* =======================================================
     KEYBOARD NAVIGATION
  ======================================================= */

  useEffect(() => {

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {

      if (
        event.key ===
        "ArrowRight"
      ) {
        changeHeroStation(
          "next",
        );
      }


      if (
        event.key ===
        "ArrowLeft"
      ) {
        changeHeroStation(
          "prev",
        );
      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown,
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );

    };

  }, [
    changeHeroStation,
  ]);


  /* =======================================================
     SELECT STATION FROM MAP
  ======================================================= */

  const selectStation =
    useCallback(
      (
        code: string,
        point?: SpatialProperties,
      ) => {

        setWalkingArea(null);


        setMapStation(
          point
            ? {
                ...point,
                id: code,
              }
            : null,
        );


        setActivePanel(
          "stations",
        );

      },
      [],
    );


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-dvh overflow-x-hidden">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          px-3
          pt-3
          sm:px-5
          lg:px-7
        "
      >

        <div className="site-header">

          {/* BRAND */}

          <a
            href="#top"
            className="
              brand-group
              ui-interactive
              no-underline
            "
            aria-label="Commute.ly home"
          >

            <div className="brand-copy">

              <span className="brand-title">
                Commute
                <span className="brand-dot">
                  .
                </span>
                ly
              </span>


              <span className="brand-subtitle">
                Your safer way home
              </span>

            </div>

          </a>


          {/* HEADER ACTIONS */}

          <div className="header-actions">

            <DigitalClock />

            <EmergencyContact />

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        id="top"
        className="
          mx-auto
          max-w-[100rem]
          px-3
          pb-10
          pt-4
          sm:px-5
          lg:px-7
        "
      >

        {/* ===================================================
            HERO
        =================================================== */}

        <section
          className="
            bridge-shell
            ui-fade-in
          "
          aria-labelledby="bridge-title"
        >

          {/* =================================================
              HERO COPY
          ================================================= */}

          <div className="bridge-copy">

            <h1 id="bridge-title">
              Know your surroundings
              before you head home.
            </h1>


            <p className="bridge-description">
              Commute.ly membantu pengguna
              KRL memahami kondisi di sekitar
              stasiun—mulai dari Safety Score,
              fasilitas, rute, hingga konteks
              perjalanan malam hari.
            </p>


            <div className="bridge-actions">

              <a
                href="#explore"
                className="
                  primary-cta
                  ui-button
                "
              >

                Jelajahi peta

                <span aria-hidden="true">
                  →
                </span>

              </a>


              <a
                href="#how-it-works"
                className="
                  secondary-cta
                  ui-button
                "
              >
                Cara kerja
              </a>

            </div>

          </div>


          {/* =================================================
              KRL HERO VISUAL
          ================================================= */}

          <div
            className="relative flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.98),rgba(248,239,246,0.82)_45%,rgba(239,229,242,0.58)_100%)]"
            aria-label="Ilustrasi perjalanan KRL malam hari"
          >

            {/* Decorative orbit */}
            <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ed4f97]/20" />
            <div className="absolute left-1/2 top-1/2 h-[180px] w-[460px] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] rounded-full border border-black/[0.07]" />

            {/* Decorative dots */}
            <span className="absolute left-[17%] top-[17%] h-2 w-2 rounded-full bg-[#ed4f97] shadow-[0_0_0_7px_rgba(237,79,151,0.08)]" />
            <span className="absolute right-[16%] top-[28%] h-1.5 w-1.5 rounded-full bg-[#ed4f97]" />
            <span className="absolute bottom-[23%] left-[13%] h-1.5 w-1.5 rounded-full bg-[#ed4f97]" />

            {/* Floating labels */}
            <span className="absolute right-[19%] top-[15%] z-10 rounded-full bg-[#17151d] px-3 py-1.5 text-[9px] font-bold tracking-[0.04em] text-white shadow-[0_10px_24px_rgba(30,25,40,0.12)]">
              KRL
            </span>

            <span className="absolute bottom-[17%] left-[17%] z-10 rounded-full bg-[#ed4f97] px-3 py-1.5 text-[9px] font-bold tracking-[0.04em] text-white shadow-[0_10px_24px_rgba(30,25,40,0.12)]">
              NIGHT
            </span>

            <span className="absolute left-[27%] top-[25%] z-10 text-[17px] text-[#ed4f97]/75">
              ✦
            </span>

            <span className="absolute bottom-[28%] right-[26%] z-10 text-2xl text-[#ed4f97]/70">
              ·
            </span>

            {/* KRL illustration */}
            <div className="relative z-[5] w-[108%] max-w-[650px] rotate-[-2deg] drop-shadow-[0_25px_25px_rgba(25,20,35,0.16)] transition-transform duration-300 hover:-translate-y-1">

              <svg
                viewBox="0 0 760 360"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="KRL commuter train"
                className="block h-auto w-full"
              >

                <path d="M80 245 C180 210 240 205 320 215" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="4" strokeLinecap="round" />
                <path d="M120 275 C205 248 250 246 310 252" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" />

                <ellipse cx="390" cy="304" rx="285" ry="25" fill="rgba(20,20,30,0.18)" />

                <path d="M150 125 C150 96 172 76 203 76 H600 C641 76 668 101 681 135 L713 229 C720 250 704 270 681 270 H150 C128 270 111 252 115 229 Z" fill="#ffffff" />

                <path d="M150 125 C150 96 172 76 203 76 H600 C641 76 668 101 681 135 L687 154 H143 Z" fill="#ed4f97" />

                <path d="M555 104 H600 C625 104 643 119 651 141 L661 170 H553 Z" fill="#24242d" />

                <rect x="190" y="108" width="105" height="66" rx="8" fill="#252631" />
                <rect x="308" y="108" width="105" height="66" rx="8" fill="#252631" />
                <rect x="426" y="108" width="105" height="66" rx="8" fill="#252631" />

                <path d="M202 114 H226 L250 168 H225 Z" fill="rgba(255,255,255,0.18)" />
                <path d="M320 114 H344 L368 168 H343 Z" fill="rgba(255,255,255,0.18)" />
                <path d="M438 114 H462 L486 168 H461 Z" fill="rgba(255,255,255,0.18)" />

                <rect x="205" y="181" width="66" height="68" rx="5" fill="#f1f1f3" />
                <rect x="321" y="181" width="66" height="68" rx="5" fill="#f1f1f3" />
                <rect x="437" y="181" width="66" height="68" rx="5" fill="#f1f1f3" />

                <path d="M238 183 V247" stroke="#d6d6da" strokeWidth="2" />
                <path d="M354 183 V247" stroke="#d6d6da" strokeWidth="2" />
                <path d="M470 183 V247" stroke="#d6d6da" strokeWidth="2" />

                <path d="M120 249 H708 C701 263 693 270 678 270 H150 C135 270 125 262 120 249 Z" fill="#e9e9ed" />
                <rect x="132" y="238" width="558" height="8" rx="4" fill="#ed4f97" />

                <circle cx="676" cy="199" r="10" fill="#ffffff" />
                <circle cx="676" cy="199" r="5" fill="#ed4f97" />

                <circle cx="222" cy="275" r="20" fill="#292932" />
                <circle cx="222" cy="275" r="8" fill="#c9c9cf" />
                <circle cx="596" cy="275" r="20" fill="#292932" />
                <circle cx="596" cy="275" r="8" fill="#c9c9cf" />

                <path d="M95 300 H690" stroke="rgba(30,30,40,0.20)" strokeWidth="5" strokeLinecap="round" />
                <path d="M115 313 H675" stroke="rgba(30,30,40,0.12)" strokeWidth="3" strokeLinecap="round" />

              </svg>
            </div>

            {/* Caption */}
            <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-2 text-[9px] text-black/60 shadow-[0_8px_25px_rgba(30,25,40,0.08)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ed4f97]" />
              Safe journeys, even after dark
            </div>

          </div>

        </section>


        {/* ===================================================
            HOW IT WORKS
        =================================================== */}

        <section
          id="how-it-works"
          className="bridge-notes"
          aria-labelledby="how-it-works-title"
        >

          {/* =================================================
              TITLE — LEFT TOP
          ================================================= */}

          <div className="how-it-works-heading">

            <h2 id="how-it-works-title">
              Cara kerja
            </h2>

            <p>
              Tiga langkah sederhana untuk
              memahami kondisi perjalananmu.
            </p>

          </div>


          {/* =================================================
              THREE STEPS — HORIZONTAL
          ================================================= */}

          <div className="how-it-works-grid">

            {/* =================================================
                STEP 01
            ================================================= */}

            <article
              className="how-it-works-item"
            >

              <div className="how-it-works-number">
                01
              </div>


              <div className="how-it-works-content">

                <h3>
                  Choose a station
                </h3>


                <p>
                  Pilih stasiun di peta untuk
                  melihat Safety Score dan
                  kondisi di sekitarnya.
                </p>

              </div>

            </article>


            {/* =================================================
                STEP 02
            ================================================= */}

            <article
              className="how-it-works-item"
            >

              <div className="how-it-works-number">
                02
              </div>


              <div className="how-it-works-content">

                <h3>
                  Read the context
                </h3>


                <p>
                  Gunakan layer dan informasi
                  fasilitas untuk memahami
                  kondisi di sekitar stasiun.
                </p>

              </div>

            </article>


            {/* =================================================
                STEP 03
            ================================================= */}

            <article
              className="how-it-works-item"
            >

              <div className="how-it-works-number">
                03
              </div>


              <div className="how-it-works-content">

                <h3>
                  Plan the way home
                </h3>


                <p>
                  Gunakan rute dan area berjalan
                  untuk membantu merencanakan
                  perjalanan malam.
                </p>

              </div>

            </article>

          </div>

        </section>


        {/* ===================================================
            EXPLORE
        =================================================== */}

        <section
          id="explore"
          className="explore-section"
        >

          <div className="section-intro">

            <div>

              <p className="eyebrow">
                EXPLORE THE MAP
              </p>

              <h2>
                See what’s around
                your station.
              </h2>

            </div>


            <span>
              Jakarta · Night commute
            </span>

          </div>


          {/* =================================================
              MAP + SIDE PANEL
          ================================================= */}

          <div className="explore-layout">

            {/* MAP */}

            <section
              className="map-column"
              aria-label="Peta interaktif Commute.ly"
            >

              <div className="map-frame">

                <InteractiveMap
                  className="
                    h-full
                    min-h-0
                  "
                  onStationSelect={
                    selectStation
                  }
                  route={route}
                  walkingArea={
                    walkingArea
                  }
                />


                <AssistantChat
                  stationId={
                    mapStation?.id ??
                    null
                  }
                />

              </div>

            </section>


            {/* =================================================
                SIDE PANEL
            ================================================= */}

            <aside
              className="side-stage"
              aria-label="Informasi perjalanan"
            >

              <MapNavigation
                items={navigation}
                activeId={activePanel}
                onChange={
                  setActivePanel
                }
              />


              <div className="info-card">

                {/* =============================================
                    STATION
                ============================================= */}

                <div
                  hidden={
                    activePanel !==
                    "stations"
                  }
                  className="
                    panel-content
                    ui-fade-in
                  "
                >

                  {mapStation ? (

                    <>

                      <StationInfo
                        station={
                          mapStation
                        }
                      />


                      <StationSchedule
                        stationId={
                          mapStation.id
                        }
                      />


                      <WalkingControls
                        origin={{
                          id:
                            mapStation.id,

                          name:
                            mapStation.name ??
                            "stasiun terpilih",

                          coordinates:
                            mapStation.coordinates,
                        }}
                        onChange={
                          setWalkingArea
                        }
                      />

                    </>

                  ) : (

                    <div className="station-selector">
              <div className="station-selector-header">
                <div>
                  <p className="panel-kicker">
                    FIND YOUR STATION
                  </p>

                  <h3>
                    Choose a station
                  </h3>

                  <p className="station-selector-description">
                    Cari stasiun untuk melihat Safety Score,
                    fasilitas, jadwal, dan area berjalan kaki.
                  </p>
                </div>

                <div
                  className="station-selector-badge"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 4h10a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 8h8M8 12h8M8 21l2-4m6 4-2-4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="station-search">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="m16 16 4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  type="search"
                  value={stationSearch}
                  onChange={(event) =>
                    setStationSearch(event.target.value)
                  }
                  placeholder="Cari nama atau kode stasiun..."
                  aria-label="Cari stasiun"
                />

                {stationSearch && (
                  <button
                    type="button"
                    className="station-search-clear"
                    aria-label="Hapus pencarian"
                    onClick={() => setStationSearch("")}
                  >
                    ×
                  </button>
                )}
              </div>

              {stationSearch.trim() ? (
                <div className="station-search-results">
                  {stationLoading ? (
                    <div className="station-search-message">
                      Memuat daftar stasiun…
                    </div>
                  ) : filteredStations.length > 0 ? (
                    filteredStations.map((station: SpatialProperties) => (
                      <button
                        key={station.id}
                        type="button"
                        className="station-search-result"
                        onClick={() => {
                          selectStation(
                            station.id,
                            station,
                          );
                          setStationSearch("");
                        }}
                      >
                        <span className="station-search-icon">
                          {station.id
                            .slice(0, 4)
                            .toUpperCase()}
                        </span>

                        <span className="station-search-copy">
                          <strong>
                            {station.name ?? station.id}
                          </strong>

                          <small>
                            {station.id.toUpperCase()} · KRL Jakarta
                          </small>
                        </span>

                        <span
                          className="station-search-arrow"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="station-search-empty">
                      <div className="station-search-empty-icon">
                        ?
                      </div>

                      <strong>
                        Stasiun tidak ditemukan
                      </strong>

                      <span>
                        Coba cari menggunakan nama atau kode stasiun.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="station-empty">
                  <div
                    className="empty-shape"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 21s7-5.1 7-11A7 7 0 0 0 5 10c0 5.9 7 11 7 11Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </div>

                  <p className="station-empty-hint">
                    OR SELECT FROM MAP
                  </p>

                  <span>
                    Klik marker stasiun di peta untuk langsung
                    membuka informasinya.
                  </span>
                </div>
              )}
            </div>

                  )}

                </div>


                {/* =============================================
                    ROUTING
                ============================================= */}

                <div
                  hidden={
                    activePanel !==
                    "routing"
                  }
                  className="
                    panel-content
                    ui-fade-in
                  "
                >

                  <p className="panel-kicker">
                    JOURNEY PLANNER
                  </p>


                  <h3 className="panel-heading">
                    Plan your way home.
                  </h3>


                  <Text
                    size="sm"
                    tone="muted"
                    className="mt-2"
                  >
                    Temukan rute dari lokasi
                    kamu ke stasiun atau
                    perjalanan pulang dari
                    stasiun ke tujuan.
                  </Text>


                  <div className="section-divider" />


                  <RoutePlanner
                    onRouteChange={
                      setRoute
                    }
                  />

                </div>

              </div>


              {/* SIDE NOTE */}

              <div className="side-note">

                <span>
                  01
                </span>


                <div>

                  <strong>
                    For the night commuter.
                  </strong>


                  <small>
                    Safety context yang dibuat
                    khusus untuk perjalanan
                    setelah gelap.
                  </small>

                </div>

              </div>

            </aside>

          </div>

        </section>

      </main>

    </div>
  );
}