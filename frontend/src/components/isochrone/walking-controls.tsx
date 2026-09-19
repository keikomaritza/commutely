"use client";

import { useEffect, useRef, useState } from "react";

import {
  fetchWalkingArea,
  type WalkingArea,
  type WalkingDuration,
  type WalkingOrigin,
} from "../../lib/isochrone-api";


type WalkingControlsProps = {
  origin: WalkingOrigin;
  onChange: (area: WalkingArea | null) => void;
};


const DURATIONS: WalkingDuration[] = [
  300,
  600,
  900,
];


export function WalkingControls({
  origin,
  onChange,
}: WalkingControlsProps) {

  const [duration, setDuration] =
    useState<WalkingDuration>(300);

  const [status, setStatus] =
    useState("");

  const [pending, setPending] =
    useState(false);

  const request =
    useRef<AbortController | null>(null);


  /*
   * Cancel request ketika component
   * di-unmount.
   */
  useEffect(() => {

    return () => {
      request.current?.abort();
    };

  }, []);


  /*
   * =====================================================
   * CLEAR AREA
   * =====================================================
   */

  const clear = () => {

    request.current?.abort();

    request.current = null;

    setPending(false);

    setStatus("");

    onChange(null);
  };


  /*
   * =====================================================
   * LOAD ISOCHRONE
   * =====================================================
   */

  const loadArea = async (
    selectedDuration: WalkingDuration,
  ) => {

    /*
     * Batalkan request sebelumnya
     */
    request.current?.abort();


    const controller =
      new AbortController();


    request.current =
      controller;


    setDuration(
      selectedDuration,
    );

    setPending(true);

    setStatus(
      `Memuat area ${selectedDuration / 60} menit...`,
    );

    /*
     * Hilangkan area lama
     * selama request baru berjalan.
     */
    onChange(null);


    try {

      const result =
        await fetchWalkingArea(
          origin,
          selectedDuration,
          controller.signal,
        );


      /*
       * Jangan update state kalau
       * request sudah dibatalkan.
       */
      if (
        controller.signal.aborted ||
        request.current !== controller
      ) {
        return;
      }


      if (
        result.features.length > 0
      ) {

        onChange(result);

        setStatus("");

      } else {

        onChange(null);

        setStatus(
          "Area berjalan kaki tidak tersedia.",
        );
      }

    } catch (error) {

      if (
        controller.signal.aborted ||
        request.current !== controller
      ) {
        return;
      }


      setStatus(
        error instanceof Error
          ? error.message
          : "Area berjalan kaki gagal dimuat.",
      );

    } finally {

      if (
        request.current === controller
      ) {

        setPending(false);

        request.current = null;
      }
    }
  };


  return (
    <section
      aria-label="Area berjalan kaki"
      className="walking-analysis-card"
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="walking-analysis-header">

        <div>

          <p className="walking-analysis-eyebrow">
            WALKING RANGE
          </p>

          <h3 className="walking-analysis-title">
            Area berjalan kaki
          </h3>

          <p className="walking-analysis-origin">
            Dari {origin.name}
          </p>

        </div>

      </div>


      {/* =================================================
          DURATION
      ================================================= */}

      <div className="walking-duration-group">

        <p className="walking-duration-label">
          Waktu tempuh
        </p>


        <div
          className="walking-duration-options"
          aria-label="Durasi berjalan kaki"
        >

          {DURATIONS.map(
            (seconds) => {

              const selected =
                duration === seconds;


              return (
                <button
                  key={seconds}
                  type="button"
                  className={
                    selected
                      ? "walking-duration-option is-selected"
                      : "walking-duration-option"
                  }
                  aria-pressed={
                    selected
                  }
                  disabled={pending}
                  onClick={() =>
                    void loadArea(
                      seconds,
                    )
                  }
                >

                  {seconds / 60} menit

                </button>
              );

            },
          )}

        </div>

      </div>


      {/* =================================================
          ACTION / STATUS
      ================================================= */}

      <div className="walking-analysis-footer">

        {pending ? (

          <span
            className="walking-analysis-status"
            role="status"
          >
            Memuat area...
          </span>

        ) : status ? (

          <span
            className="walking-analysis-status"
            role="status"
          >
            {status}
          </span>

        ) : (

          <span className="walking-analysis-hint">
            Pilih waktu untuk melihat jangkauan berjalan.
          </span>

        )}


        <button
          type="button"
          className="walking-clear-button"
          onClick={clear}
          disabled={pending}
        >
          Hapus area
        </button>

      </div>

    </section>
  );
}