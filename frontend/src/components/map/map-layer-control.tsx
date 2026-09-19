import { cn } from "../ui/cn";

import {
  DATA_LAYER_IDS,
  dataLayerDefinitions,
  type DataLayerId,
} from "./map-layer-data";

export type MapLayerControlState =
  Record<DataLayerId | "stations", boolean>;


/* =========================================================
   LEGEND MARKER
   Dibuat sama dengan marker di basemap
   ========================================================= */

function LegendMarker({
  id,
}: {
  id: DataLayerId | "stations";
}) {

  /* -------------------------------------------------------
     STASIUN
     ------------------------------------------------------- */

  if (id === "stations") {
    return (
      <span
        className="
          flex
          size-9
          shrink-0

          items-center
          justify-center

          rounded-full

          border-[2.5px]
          border-white

          bg-[#ee5b9b]

          text-[8px]
          font-bold

          tracking-[-0.02em]

          text-white

          shadow-[0_2px_7px_rgba(238,91,155,0.22)]
        "
      >
        SUD
      </span>
    );
  }


  /* -------------------------------------------------------
     PJU
     ------------------------------------------------------- */

  if (id === "pju") {
    return (
      <span
        className="
          flex
          size-6
          shrink-0

          rounded-full

          border-2
          border-white

          bg-[#e5a72f]

          shadow-[0_2px_6px_rgba(229,167,47,0.2)]
        "
      />
    );
  }


  /* -------------------------------------------------------
     POLICE
     ------------------------------------------------------- */

  if (id === "police") {
    return (
      <span
        className="
          flex
          size-7
          shrink-0

          rounded-full

          border-2
          border-white

          bg-[#5874c9]

          shadow-[0_2px_6px_rgba(88,116,201,0.2)]
        "
      />
    );
  }


  /* -------------------------------------------------------
     HEALTH
     ------------------------------------------------------- */

  if (id === "health") {
    return (
      <span
        className="
          flex
          size-7
          shrink-0

          rounded-full

          border-2
          border-white

          bg-[#36a89a]

          shadow-[0_2px_6px_rgba(54,168,154,0.2)]
        "
      />
    );
  }


  /* -------------------------------------------------------
     RETAIL 24H
     ------------------------------------------------------- */

  if (id === "retail24h") {
    return (
      <span
        className="
          flex
          size-7
          shrink-0

          rounded-full

          border-2
          border-white

          bg-[#df7b38]

          shadow-[0_2px_6px_rgba(223,123,56,0.2)]
        "
      />
    );
  }


  /* -------------------------------------------------------
     COMMUNITY DATA
     ------------------------------------------------------- */

  return (
    <span
      className="
        flex
        size-7
        shrink-0

        rounded-full

        border-2
        border-white

        bg-[#8757a8]

        shadow-[0_2px_6px_rgba(135,87,168,0.2)]
      "
    />
  );
}


/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export function MapLayerControl({
  visibility,
  onToggle,
  className,
}: {
  visibility:
    MapLayerControlState;

  onToggle: (
    layerId:
      | DataLayerId
      | "stations",
  ) => void;

  className?: string;
}) {

  const layers = [
    {
      id:
        "stations" as const,

      label:
        "Stasiun",

      description:
        "Stasiun KRL",
    },

    ...DATA_LAYER_IDS.map(
      (id) => ({
        id,

        ...dataLayerDefinitions[id],
      }),
    ),
  ];


  const activeCount =
    layers.filter(
      (layer) =>
        visibility[layer.id],
    ).length;


  return (
    <details
      className={cn(
        "absolute left-3 top-3 z-10",
        className,
      )}
    >

      {/* ===================================================
          BUTTON
          =================================================== */}

      <summary
        className="
          ui-interactive
          ui-soft-focus

          flex
          size-12

          cursor-pointer
          list-none

          items-center
          justify-center

          rounded-[17px]

          border
          border-white/90

          bg-white/90

          text-[var(--color-ink)]

          shadow-[var(--shadow-float)]

          backdrop-blur-xl

          transition-all
          duration-200

          hover:bg-white
          hover:-translate-y-0.5

          active:scale-95

          [&::-webkit-details-marker]:hidden
        "

        aria-label="Buka layer peta"

        title="Layers"
      >

        <span
          className="
            relative

            flex
            size-7

            items-center
            justify-center
          "
        >

          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-6"
          >

            <path
              d="M16 5 27 11.5 16 18 5 11.5 16 5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            <path
              d="M5 16.5 16 23l11-6.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M5 21 16 27l11-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

          </svg>


          {activeCount > 0 && (
            <span
              className="
                absolute
                -right-2
                -top-1

                flex
                size-4

                items-center
                justify-center

                rounded-full

                bg-[var(--color-primary)]

                text-[9px]
                font-bold
                text-white
              "
            >
              {activeCount}
            </span>
          )}

        </span>

      </summary>


      {/* ===================================================
          PANEL
          =================================================== */}

      <div
        className="
          map-layer-control-panel

          ui-pop-in

          mt-2

          w-[min(19rem,calc(100vw-1.5rem))]

          overflow-hidden

          rounded-[22px]

          border
          border-white/90

          bg-white/94

          text-[var(--color-ink)]

          shadow-[0_24px_60px_rgba(35,25,45,0.12)]

          backdrop-blur-xl
        "
      >

        {/* =================================================
            HEADER
            ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between

            border-b
            border-[var(--color-line)]

            px-4
            py-3.5
          "
        >

          <div>

            <p
              className="
                text-sm
                font-bold

                text-[var(--color-ink)]
              "
            >
              Map layers
            </p>


            <p
              className="
                mt-0.5

                text-[10px]

                text-[var(--color-muted)]
              "
            >
              Pilih informasi yang ingin ditampilkan
            </p>

          </div>


          <span
            className="
              rounded-full

              bg-[var(--color-primary-soft)]

              px-2.5
              py-1

              text-[10px]
              font-bold

              text-[var(--color-primary-strong)]
            "
          >
            {activeCount} aktif
          </span>

        </div>


        {/* =================================================
            LAYER LIST
            ================================================= */}

        <div
          className="
            max-h-[min(52dvh,24rem)]

            overflow-y-auto

            p-2
          "
        >

          {layers.map(
            (layer) => (

              <button
                key={
                  layer.id
                }

                type="button"

                role="switch"

                aria-checked={
                  visibility[
                    layer.id
                  ]
                }

                onClick={() =>
                  onToggle(
                    layer.id,
                  )
                }

                className="
                  ui-interactive
                  ui-soft-focus

                  flex
                  w-full

                  items-center

                  gap-3

                  rounded-[15px]

                  px-3
                  py-3

                  text-left

                  transition-all
                  duration-150

                  hover:bg-[#fcf7fa]

                  active:scale-[0.99]
                "
              >

                {/* =========================================
                    TOGGLE
                    ========================================= */}

                <span
                  className={cn(
                    `
                      relative

                      h-5
                      w-9

                      shrink-0

                      rounded-full

                      transition-colors
                      duration-200
                    `,

                    visibility[
                      layer.id
                    ]

                      ? "bg-[var(--color-primary)]"

                      : "bg-[#e7e3ea]",
                  )}
                >

                  <span
                    className={cn(
                      `
                        absolute
                        top-0.5

                        size-4

                        rounded-full

                        bg-white

                        shadow-sm

                        transition-[left]
                        duration-200
                      `,

                      visibility[
                        layer.id
                      ]

                        ? "left-4"

                        : "left-0.5",
                    )}
                  />

                </span>


                {/* =========================================
                    SAME MARKER AS BASEMAP
                    ========================================= */}

                <LegendMarker
                  id={
                    layer.id
                  }
                />


                {/* =========================================
                    LABEL
                    ========================================= */}

                <span
                  className="
                    min-w-0
                  "
                >

                  <span
                    className="
                      block

                      text-sm
                      font-semibold

                      leading-5

                      text-[var(--color-ink)]
                    "
                  >
                    {
                      layer.label
                    }
                  </span>


                  <span
                    className="
                      block

                      text-xs

                      leading-4

                      text-[var(--color-muted)]
                    "
                  >
                    {
                      layer.description
                    }
                  </span>

                </span>

              </button>
            ),
          )}

        </div>

      </div>

    </details>
  );
}