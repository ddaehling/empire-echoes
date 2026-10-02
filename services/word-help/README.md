# Classroom word help: Cloudflare setup

The classroom website stays on GitHub Pages. This small Cloudflare Worker keeps the OpenAI API key private and explains words **in their sentence**, including useful chunks such as “gain power”. The student vocabulary list and PDF download do not need an API key; the site's built-in glossary also works before this service is connected.

## Put the API key here

This project is configured to use the **existing account-level `OPENAI_API_KEY` in Cloudflare Secrets Store**, through the Worker's `OPENAI_API_KEY` binding. No copy of the key is needed in the website or repository. Never put the key in GitHub, `wrangler.jsonc`, the website's JavaScript, or the endpoint setting.

To replace that key later, open **Cloudflare → Secrets Store → OPENAI_API_KEY → Edit** and enter the new value there. Keep its permission scope set to **Workers**. A change to an account-level secret also affects other services using that secret. The binding can be inspected under **Workers & Pages → empire-echoes-word-help → Settings → Bindings**. [Cloudflare Secrets Store integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)

With Node.js 24 installed, these commands install the tools and deploy this service from the project folder:

```sh
cd services/word-help
npm ci
npm run login
npm run deploy
```

`npm run login` opens Cloudflare's sign-in page. `npm run deploy` creates or updates the Worker and its SQLite Durable Object, binding the existing stored key without revealing it. The configured endpoint is:

`https://empire-echoes-word-help.ddaehling-classroom.workers.dev/explain`

If you prefer the terminal when rotating the key, run `npm run secret` in this folder and paste the replacement only into its private prompt. That command updates the existing account secret. Do not pass a key as a command-line argument.

For a separate Cloudflare account, create its own Secrets Store entry named `OPENAI_API_KEY` with Workers scope, then replace `account_id` and `store_id` in `wrangler.jsonc`. The `secret` script's store and secret IDs must also be updated before using it in another account.

Then connect the website, starting from the repository root:

```sh
node scripts/configure-word-help.mjs https://empire-echoes-word-help.ddaehling-classroom.workers.dev
git add app/journey/js/word-help-config.js
git commit -m "Connect classroom word help"
git push origin main
```

The setup script writes the public `/explain` endpoint into `app/journey/js/word-help-config.js`. This endpoint is safe to publish; the API key is not. Once the Pages deployment completes, check an unfamiliar word outside the built-in glossary to verify the AI connection.

## Model and running costs

The service uses **GPT-6 Luna** with reasoning disabled. It supports Structured Outputs, which we validate again before displaying the explanation. As checked on 2 October 2026, standard short-context pricing is **$0.10 per million input tokens and $0.50 per million output tokens**. For example, 1,000 uncached explanations averaging 1,000 input tokens and 250 output tokens would cost about **$0.225 in OpenAI usage**. This is an estimate, not a billing ceiling. [OpenAI model](https://developers.openai.com/api/docs/models/gpt-6-luna), [pricing](https://developers.openai.com/api/docs/pricing)

The Worker allows at most 450 output tokens per attempt. It uses one durable, atomic allowance shared across every visitor and Cloudflare location: **1,000 AI attempts per UTC day** by default. Failed attempts count too. There are no automatic upstream retries. Repeated lookups share an in-flight request or use the saved explanation without another OpenAI charge. Cached answers still work after the daily AI allowance is reached.

Cloudflare supports SQLite Durable Objects on its Free plan, subject to its compute/storage limits. Its charges, any plan subscription, and OpenAI billing are separate. [Cloudflare Durable Object pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)

## Settings and operation

Non-secret settings are in `wrangler.jsonc`; run `npm run deploy` after changing them:

| Setting | Default | Purpose |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | GitHub Pages plus localhost port 8777 | Exact browser origins allowed to call the service; comma-separated, no paths or wildcards. |
| `DAILY_REQUEST_LIMIT` | `1000` | Global OpenAI attempts per UTC day; accepted range 1–10,000. |
| `MINUTE_REQUEST_LIMIT` | `300` | Global lookups per minute, including cached responses; enough for a shared classroom connection. |
| `CACHE_MAX_ENTRIES` | `2000` | Maximum stored explanations; accepted range 1–10,000. |
| `OPENAI_MODEL` | `gpt-6-luna` | Fixed supported model; another value fails closed until the server implementation is deliberately updated. |

The origin allowlist is a browser restriction, **not authentication**: non-browser clients can imitate an Origin header. The durable global daily cap bounds paid API attempts even in that situation, and the minute limit slows bursts. There are no per-IP limits to lock out a whole school sharing an internet connection. If abuse exhausts the allowance, legitimate uncached lookups also pause until midnight UTC. You can disable this Worker's AI service by removing its `OPENAI_API_KEY` binding and deploying the change; the local glossary and saved vocabulary remain usable. There is no need to delete a shared account secret.

Cache entries expire after seven days and are removed on the next lookup. The cache stores the validated explanation and a hash of the request, not its original full context, an IP address, or student identifiers. The application does not log request text, keys, or IP addresses. Its Worker observability is disabled in configuration. The selected word and up to 800 characters of surrounding reading text are sent to OpenAI only when AI help is requested. The OpenAI request sets `store: false`; this does not by itself override the provider's separate abuse-monitoring retention policies. [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data)

Use a dedicated OpenAI project/key for this classroom service so its usage is easy to review. If Cloudflare asks you to choose an account during deployment, select the account that should own the classroom service.

## Local development and checks

```sh
npm test
npm run check
cp .dev.vars.example .dev.vars
npm run dev
```

For local AI testing, edit the ignored `services/word-help/.dev.vars` file and replace the placeholder with your key. Do not commit this file. `npm run dev` explicitly selects the local environment, which uses that string secret instead of the production Secrets Store binding. The development API is `http://localhost:8787/explain`; the classroom page remains on port 8777. Run the tests and dry-run checks before changing the key or calling the provider. They use mocked OpenAI responses and do not spend API credits. The tests exercise actual SQLite queries through Node's SQLite implementation, including concurrent budget reservations, restart persistence, cache expiry, deduplication, chunk matching, malformed requests, and redaction.

## API contract

`POST /explain`, `Content-Type: application/json`, with an allowed `Origin`:

```json
{
  "word": "gain",
  "context": "How did the company gain power in India?",
  "start": 20,
  "end": 24
}
```

Offsets use JavaScript UTF-16 indexes. `context.slice(start, end)` must exactly equal `word`, with whole-word boundaries. Context is limited to 800 characters, the selected word/short phrase to 60 characters, and the whole JSON body to 6 KiB. No other fields, models, tools, or prompts are accepted.

```json
{
  "term": "gain power",
  "meaning": "To become able to control people or events.",
  "inContext": "Here, gain power means to become more able to make decisions and control what happens.",
  "examples": [
    "The new manager wants to gain power in the team.",
    "The club president wants to gain power."
  ],
  "source": "ai"
}
```

`term` must be an exact substring of the passage containing the selected occurrence, so another occurrence of the same word cannot be substituted. Both examples must contain that complete expression at word boundaries, ignoring capitalization only; inflections or substitute words are rejected. The server asks for the smallest useful collocation, phrasal verb, or idiom, a simple meaning, a language-only contextual explanation, and two short everyday examples. It does not provide tools or request assignment answers.

Failures return `{ "error": { "code": "…", "message": "…" } }`. Statuses include 400 for invalid selection, 403 for origin rejection, 413/415 for invalid body format, 429 for the minute/daily limit, 502 for an unusable provider result, 503 for missing configuration or temporary unavailability, and 504 for the 15-second timeout. The client should use its built-in glossary or offer a retry, never ask a student for an API key.

Implementation references: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Cloudflare SQLite transactions](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/#transactionsync), [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).
