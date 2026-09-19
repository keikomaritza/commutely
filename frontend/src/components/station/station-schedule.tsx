"use client";

import { useEffect, useState } from "react";

import {
  fetchStationSchedule,
  type ScheduleEntry,
} from "../../lib/schedule-api";


type ScheduleState =
  | {
      stationId: string;
      status: "ready";
      entries: ScheduleEntry[];
    }
  | {
      stationId: string;
      status: "error";
    };


export function StationSchedule({
  stationId,
}: {
  stationId: string;
}) {

  const [
    state,
    setState,
  ] = useState<ScheduleState | null>(
    null,
  );


  const [
    open,
    setOpen,
  ] = useState(false);


  useEffect(() => {

    const controller =
      new AbortController();


    setState(null);

    setOpen(false);


    fetchStationSchedule(
      stationId,
      controller.signal,
    ).then(

      (entries) => {

        if (
          !controller.signal.aborted
        ) {

          setState({
            stationId,
            status: "ready",
            entries,
          });

        }

      },

      () => {

        if (
          !controller.signal.aborted
        ) {

          setState({
            stationId,
            status: "error",
          });

        }

      },
    );


    return () =>
      controller.abort();

  }, [
    stationId,
  ]);


  const current =
    state?.stationId === stationId
      ? state
      : null;


  const visibleEntries =
    current?.status === "ready"
      ? current.entries
      : [];


  return (
    <section
      aria-label="Jadwal KRL"
      className="station-panel-card station-schedule-card"
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="station-panel-heading schedule-card-heading">

        <div>

          <p className="station-panel-eyebrow">
            NEXT DEPARTURES
          </p>

          <h3>
            Jadwal KRL
          </h3>

          <p>
            Jadwal keberangkatan dari stasiun ini.
          </p>

        </div>


        {current?.status === "ready" &&
          current.entries.length > 3 && (

            <button
              type="button"
              className="schedule-view-all"
              aria-expanded={open}
              onClick={() =>
                setOpen(
                  (value) => !value,
                )
              }
            >

              {open
                ? "Tutup"
                : `Lihat semua (${current.entries.length})`}

              <span
                className={
                  open
                    ? "schedule-chevron is-open"
                    : "schedule-chevron"
                }
                aria-hidden="true"
              >
                ↓
              </span>

            </button>

          )}

      </div>


      {/* =================================================
          STATUS
      ================================================= */}

      {!current && (

        <p
          role="status"
          className="station-panel-status"
        >
          Memuat jadwal...
        </p>

      )}


      {current?.status === "error" && (

        <p
          role="alert"
          className="station-panel-status is-error"
        >
          Jadwal gagal dimuat.
        </p>

      )}


      {current?.status === "ready" &&
        current.entries.length === 0 && (

          <p className="station-panel-status">
            Jadwal belum tersedia.
          </p>

        )}


      {/* =================================================
          SCHEDULE LIST
      ================================================= */}

      {current?.status === "ready" &&
        visibleEntries.length > 0 && (

          <div
            className={
              open
                ? "schedule-list-container is-open"
                : "schedule-list-container"
            }
          >

            <div className="schedule-list">

              {visibleEntries.map(
                (
                  entry,
                  index,
                ) => (

                  <div
                    key={`${entry.departure_time}-${entry.destination}-${index}`}
                    className="schedule-item"
                  >

                    <time className="schedule-item-time">
                      {entry.departure_time}
                    </time>


                    <span
                      className="schedule-item-arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>


                    <span className="schedule-item-destination">
                      {entry.destination}
                    </span>

                  </div>

                ),
              )}

            </div>

          </div>

        )}

    </section>
  );
}