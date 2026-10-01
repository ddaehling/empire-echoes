# Publishing Empire / Echoes

This is a static website: browser ES modules load the bundled map data, fonts,
photographs and libraries. It needs HTTPS hosting with ordinary static files;
it does not need server functions, API keys, a database or a runtime Node server.

## Current publication

Live classroom: https://ddaehling.github.io/empire-echoes/

Repository: https://github.com/ddaehling/empire-echoes

Preserved version: https://ddaehling.github.io/empire-echoes/snapshots/2026-10-01-before-simplification/app/journey/

Runtime commit `98f23055a2725b57f0ff438da536660f779cbb28` deployed successfully through [Actions run 36915356157](https://github.com/ddaehling/empire-echoes/actions/runs/36915356157). Live browser checks and every hosted file hash passed; see `docs/learning-revision/LIVE_VERIFICATION.json`. The Pages workflow runs for changes to public inputs/build configuration, or by manual dispatch; documentation-only changes do not redeploy the same website.

## Public build

Run with Node.js 22 or newer:

```sh
npm run build
npm run test:deployment
```

The dependency-free build copies an explicit set of public inputs to `dist/`.
It preserves the current `app/`, including `/app/` and `/app/next/`, and the
frozen app under `snapshots/2026-10-01-before-simplification/app/`.
All copied app files retain their source bytes; there is no bundling or URL
rewriting. A generated `build-manifest.json` records their hashes and sizes.

Only runtime file types inside the two app trees, their library licence texts,
four named provenance README files, the generated teacher handout, the root
entry page and the public licence pages are included. The whole repository is
never used as the publish directory. Source PDFs from Downloads, research and
review documents, progress reports, screenshots, tool caches, node_modules,
environment files and the raw image-download metadata are excluded. Only the
generated `journey/assets/teacher-handout.pdf` is included from each app tree;
adding another PDF requires explicitly changing the allowlist.

The verifier checks every published byte against its input, checks referenced
local HTML/CSS/module dependencies, rejects root-relative asset URLs, and checks
the complete frozen source snapshot against its original SHA-256 manifest.
Run build and verification together after source changes have stopped. A
concurrent edit is intentionally reported as “Source changed since build”.

## Entry points

| Relative to the hosting base URL                          | Content                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------- |
| `./`                                                      | Redirect to the current classroom app, preserving the URL hash |
| `app/journey/`                                            | Current atlas, enquiry and teacher guide                       |
| `snapshots/2026-10-01-before-simplification/app/journey/` | Exact pre-simplification runtime                               |
| `app/next/`                                               | Earlier globe and assessment version                           |
| `app/`                                                    | Original atlas                                                 |
| `licenses/`                                               | Public library, font and image notices                         |

On a GitHub project site, the base is `https://OWNER.github.io/REPOSITORY/`.
On Vercel, it is the deployment origin. Preserve directory trailing slashes:
relative `css/` and `js/` links depend on the document directory. All in-app
routes use URL fragments, so no SPA rewrite or custom 404 fallback is needed.

## GitHub Pages

The repository includes `.github/workflows/pages.yml`. It runs on pushes to
`main` and manual workflow dispatches, builds and verifies `dist/`, uploads only
that directory, then deploys it to the `github-pages` environment. The build
job has read access to repository contents and Pages settings; the deploy job has `pages: write`
and `id-token: write`. These are the permissions and artifact handoff described
in [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

For a new repository, set **Settings → Pages → Build and deployment → Source**
to **GitHub Actions**, then push the prepared workflow. The deployment job
reports the final URL. Publishing is complete only when that job succeeds and
the live current and snapshot URLs have been checked. The build emits an empty
`.nojekyll`; the Actions deployment serves the existing static files.

For the `ddaehling/empire-echoes` project, the expected entry URL is
`https://ddaehling.github.io/empire-echoes/`. This is an expected URL, not proof
that a deployment has succeeded.

## Optional Vercel deployment

Import this repository with the project root set to the repository root.
The checked-in `vercel.json` selects the **Other** framework, uses the same
build and verification scripts, publishes `dist/`, and preserves directory
trailing slashes. No dependency installation is needed for the static build.
The project does not define functions, rewrites or environment variables.
The configuration follows [Vercel's static configuration reference](https://vercel.com/docs/project-configuration/vercel-json).

Review the generated preview and its public access settings before sharing
the deployment URL with a class. A GitHub Pages deployment does not require
Vercel, and a Vercel configuration file is not evidence of a Vercel deployment.

## Verification and classroom storage

Serve the production directory rather than the repository when testing a
release, on an unused port (never stop the classroom server on port 8777):

```sh
python3 -m http.server 8788 --bind 127.0.0.1 --directory dist
```

Check the root redirect, enquiry, teacher PDF, territory photograph and map,
then the frozen snapshot and both earlier apps. Check for missing local files
and browser errors. For GitHub Pages, also check a deployment mounted beneath
a project subpath, not only at `/`.

The browser smoke check automates those paths for both `/` and a simulated
`/empire-echoes/` prefix. It needs the project's Playwright development
dependency and its Chromium installation, creates a private ephemeral server
and browser, and closes both when finished:

```sh
node scripts/smoke-static.mjs
```

Responses are saved in the current browser's local storage. Hosting does not
upload them to a server or share them with a teacher. Local development,
GitHub Pages and Vercel are different origins: saved work does not transfer
automatically between them. Keep downloaded work when moving to a new origin.
Multiple projects hosted on the same `OWNER.github.io` hostname share that
origin's storage; avoid another app using the same storage keys.

Fonts, maps and image display use local files. External source-reading links
require internet access and are subject to the publisher's availability.
The teacher guide is publicly reachable; this site is not an authenticated
assessment system. Image credits and their recorded public-domain claims are
preserved in the published manifests, and the bundled font licences are linked
from `licenses/`. The full original documentation remains in the repository and
frozen source snapshot, rather than being added to the classroom website.
