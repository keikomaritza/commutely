# Commute.ly Clean UI v2

This build keeps the existing backend/database architecture and replaces the frontend presentation with a cleaner editorial/glass UI.

## What changed
- Landing/bridging section before the map.
- Manrope typography instead of Poppins/Plus Jakarta Sans.
- Real WIB digital clock.
- Search bar + current-location button on the map.
- Layer menu + legend in a contained glass panel.
- Pink/charcoal point styling with short icons.
- Consistent glass popups for stations, facilities, and Community Data.
- Community Data popup no longer opens on top of a clicked station.
- KRL schedule collapses/expands instead of showing a long list.
- Pink walking-area visualization.
- Button press/entrance animations.

## Run
Keep your existing `frontend/.env.local` and `backend/.env` values.

Backend:
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Frontend:
```powershell
cd frontend
npm run dev
```

Open `http://localhost:3000`.
