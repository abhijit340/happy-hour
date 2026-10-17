# Happy Hour Now

Which happy hours are on right now in Seattle's Capitol Hill, Belltown, Pike Place & waterfront and downtown, sorted by minutes left. Pick any day and time to plan ahead, filter by neighborhood, or show oysters only.

Live at: `https://<project>.pages.dev/` (Cloudflare Pages, site root = repo root).

A static page: plain HTML, CSS and JavaScript, no frameworks, CDN, web fonts or analytics. It installs to a phone's home screen and works offline. The only thing it saves is your neighborhood and oyster filter, in this browser.

## Data

- `data/*.json`: one list per area. Each venue has its happy-hour windows (days as `S M T W R F A` for Sun–Sat, or `daily`; 24-hour times), a short deal line, an oysters flag, its source URL, whether that source is the venue's own site (`official`) or a listing, and a confidence level.
- Venues marked `closed`, or with no known windows, are left off the page. Closed ones are named in the page's "Where these times come from" note.
- Last checked October 17, 2026: venue websites first, then recent listings (The Infatuation, HapHunt, OpenTable, the Pike Place Market guide), with closures checked on Google Maps.

## Changing things

- Edit the JSON, then run `node tools/build.js "<checked date>"`. It merges the lists into `index.html` from `tools/template.html`.
- `python tools/make_icons.py` redraws the icons.
- Bump `CACHE` in `sw.js` when the list of app files changes.
- Pushing to `main` redeploys the site.
