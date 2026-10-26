# Personal API

Backend for the personal page on the GitHub Pages site. It runs on your own
server, separate from the static site.

```
sources ──(sync, every few hours)──► data/personal.db ──► API ──► personal page
```

- **sync** (`app/sync.py`) pulls each source, keeps a copy of the raw payload
  under `data/raw/`, and writes normalized rows to SQLite. It's the only part
  that talks to outside services. A source that fails keeps its existing rows,
  and an unchanged payload is not re-parsed.
- **api** (`app/api.py`) is read-only: `GET /reviews`, `GET /meta`, `GET /health`.
  It opens the database read-only and never calls an outside service.

## Sources

| Source | How it updates | Notes |
| --- | --- | --- |
| StoryGraph | Drop your export at `data/imports/storygraph.csv` | StoryGraph → Manage Account → Export StoryGraph Library. Includes ratings and reviews. Full snapshot: re-export to pick up changes and deletions. |
| Letterboxd | Automatic, from your public RSS feed | Set `LETTERBOXD_USERNAME`. The feed only has recent entries, so older ones are kept rather than replaced. |
| Manual | Edit `data/imports/manual.json` | For anything without a feed (e.g. games). See the format below. |

`manual.json` is a list of entries:

```json
[
  {
    "id": "hades",
    "type": "game",
    "title": "Hades",
    "creator": "Supergiant Games",
    "year": 2020,
    "rating": 5,
    "review": "Plain text. Blank lines separate paragraphs.",
    "date": "2024-06-01",
    "cover_url": "https://...",
    "url": "https://..."
  }
]
```

`type` is `book`, `movie` or `game`; `id` and `title` are required, the rest optional.

To add a source, subclass `Source` in `app/sources/` (`fetch_raw` + `parse`)
and register it in `app/sources/__init__.py`.

## Running it

On the server:

```sh
cp .env.example .env           # set LETTERBOXD_USERNAME etc.
mkdir -p data/imports && sudo chown -R 10001 data
docker compose up -d --build
docker compose run --rm sync python -m app.sync          # one pass right now
docker compose run --rm sync python -m app.sync --force  # re-parse after a parser fix
curl localhost:8001/meta
```

Then put it behind HTTPS on a subdomain. `deploy/nginx.conf` is a starting
point (TLS, per-IP rate limit, timeouts, GET only). GitHub Pages is served
over HTTPS, so the browser will refuse to call a plain `http://` API.

Finally, build the site with the API's URL and deploy as usual:

```sh
echo "REACT_APP_API_URL=https://api.example.com" > .env.production.local   # in the repo root
npm run deploy
```

### Guardrails

- API container: read-only filesystem, database mounted read-only, non-root,
  no capabilities, 256 MB / half a CPU, bound to `127.0.0.1` so only the proxy
  reaches it.
- Queries are bounded: `limit` ≤ 50, `offset` ≤ 10,000, `type` must be a known
  value, all SQL parameterized. No docs/OpenAPI endpoints.
- Responses carry `Cache-Control: public, max-age=300`, so a CDN such as
  Cloudflare (free plan) can serve most traffic. If you add Cloudflare, restore
  real client IPs in nginx (see the comment at the bottom of `nginx.conf`) or
  the rate limit will treat all visitors as one.
- CORS only allows `ALLOWED_ORIGINS`. That stops other sites' JavaScript, not
  scripts; the rate limit is what handles those.

## Local development

```sh
python -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/pytest
DATA_DIR=./data .venv/bin/python -m app.sync
DATA_DIR=./data ALLOWED_ORIGINS=http://localhost:3000 .venv/bin/uvicorn app.api:app --port 8000
# in the repo root:
REACT_APP_API_URL=http://localhost:8000 npm start
```
