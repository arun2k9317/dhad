# DHAD — product & UX design notes

## Discovery radius

### Purpose

Let people control **how far** content is considered “nearby.” Posts and meetups are filtered to items whose coordinates fall within a **circle** around the user’s discovery center: **radius R km** (configurable).

### Naming

Use **“Discovery radius”** in UI, accessibility labels, and settings. The feed header uses a **radar** icon as the affordance without a playful alternate name.

### Behavior

- **Center**: Uses **device GPS** when foreground location permission is granted; otherwise a **demo anchor** (Kochi, Kerala) so the offline demo still works.
- **Radius**: Persisted locally (1–500 km, default **220 km** so the Kochi demo anchor still shows seed content across Kerala). Changing the slider updates the map ring and **immediately** refilters the feed and meetups list.
- **Map UI**: Full **map + circle overlay** on **iOS and Android**. On **web**, a lightweight radar placeholder is shown with the same slider (native maps are not required for the demo).

### Data model (demo)

- Each **post** and **meetup** includes `latitude` and `longitude` (WGS84).
- New content created in the app gets coordinates from **keyword rules** on the location string (`lib/demo-location-resolve.ts`) until a real geocoder exists.

### Future (production)

- Server-side geospatial queries and user-synced preferences.
- Optional “city” mode when GPS is off instead of a single fixed anchor.
