"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../ui/button";
import { LocationSearch, type LocationSelection } from "./location-search";
import { hasValidCoordinates, travelModes, type RouteLocation, type RoutingProfile } from "./types";
import { fetchStations } from "../../lib/station-info-api";

export function RouteSearchForm({ onSearch, loading = false }: { onSearch: (origin: RouteLocation, destination: RouteLocation, profile: RoutingProfile) => void; loading?: boolean }) {
  const [origin, setOrigin] = useState<LocationSelection>({ text: "", location: null });
  const [destination, setDestination] = useState<LocationSelection>({ text: "", location: null });
  const [profile, setProfile] = useState<RoutingProfile>("foot-walking");
  const [stationState, setStationState] = useState<{ status: "loading" | "ready" | "empty" | "error"; stations: RouteLocation[] }>({ status: "loading", stations: [] });

  useEffect(() => {
    const controller = new AbortController();
    fetchStations(controller.signal).then((stations) => {
      if (controller.signal.aborted) return;
      const locations = stations.filter((station) => station.coordinates).map((station) => ({ label: station.name ? `${station.name} (${station.id})` : station.id, coordinates: station.coordinates!, type: "station" as const }));
      setStationState({ status: locations.length ? "ready" : "empty", stations: locations });
    }, () => { if (!controller.signal.aborted) setStationState({ status: "error", stations: [] }); });
    return () => controller.abort();
  }, []);

  const canSearch = hasValidCoordinates(origin.location) && hasValidCoordinates(destination.location);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!loading && hasValidCoordinates(origin.location) && hasValidCoordinates(destination.location)) onSearch(origin.location, destination.location, profile); }

  return <form onSubmit={submit} className="grid gap-4" aria-label="Pencarian rute">
    <LocationSearch label="Dari" value={origin} onChange={setOrigin} disabled={loading} stations={stationState.stations} stationStatus={stationState.status} />
    <LocationSearch label="Ke" value={destination} onChange={setDestination} disabled={loading} stations={stationState.stations} stationStatus={stationState.status} />
    <Button variant="ghost" type="button" disabled={loading} onClick={() => { setOrigin(destination); setDestination(origin); }} className="w-fit text-[var(--color-muted)]"><span aria-hidden="true">↕</span> Tukar lokasi</Button>

    <fieldset disabled={loading} className="grid gap-2">
      <legend className="text-sm font-semibold">Moda perjalanan</legend>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(travelModes) as RoutingProfile[]).map((mode) => <label key={mode} className={`ui-interactive ui-soft-focus flex cursor-pointer items-center justify-center rounded-[15px] border px-2 py-3 text-center text-xs font-semibold transition ${profile === mode ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] shadow-[0_5px_16px_rgba(238,91,155,.08)]" : "border-[var(--color-line)] bg-white/70 text-[var(--color-muted)] hover:bg-white"}`}>
          <input className="sr-only" type="radio" name="routing-profile" value={mode} checked={profile === mode} onChange={() => setProfile(mode)} />
          {travelModes[mode]}
        </label>)}
      </div>
    </fieldset>

    <Button size="lg" type="submit" disabled={!canSearch || loading} className="w-full">{loading ? "Mencari rute…" : "Cari rute"}<span aria-hidden="true">→</span></Button>
  </form>;
}
