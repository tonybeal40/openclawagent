# React + TypeScript + Vite

## Command-first sidecar runner (local)

Run sidecar worker and persist JSONL events for the UI timeline loader:

```bash
npm run sidecar:stream -- --bundle runs/demo-bundle.json --out runs/latest-events.jsonl --dry-run --timeout-ms 5000
```

Then in the app, open **Build plan → Sidecar event timeline → Load .jsonl file** and select `runs/latest-events.jsonl`.

## Sidecar bridge API (local trigger)

Start bridge:

```bash
npm run sidecar:bridge
```

Trigger run (bundle path):

```bash
curl -X POST http://127.0.0.1:4310/run \
  -H "Content-Type: application/json" \
  -d "{\"bundle\":\"runs/demo-bundle.json\",\"out\":\"runs/latest-events.jsonl\",\"dryRun\":true,\"timeoutMs\":5000}"
```

Trigger run (inline bundle JSON):

```bash
curl -X POST http://127.0.0.1:4310/run \
  -H "Content-Type: application/json" \
  -d @runs/demo-inline-run.json
```

Stream events (SSE):

```bash
curl http://127.0.0.1:4310/events
```

Status/cancel:

```bash
curl http://127.0.0.1:4310/status
curl -X POST http://127.0.0.1:4310/cancel
```

`/status` now includes `commandRisk` (summary + per-command assessment) so runtime bridge telemetry matches UI/audit risk taxonomy.
Worker event envelopes also include risk context in command start/dry-run details (e.g. `risk=high:destructive delete command`).

Optional UI auto-discovery:

```bash
# .env.local
VITE_SIDECAR_BRIDGE_URL=http://127.0.0.1:4310
```

When set, the Build Plan panel auto-connects SSE and falls back to `/status` polling if SSE drops.

The panel now shows:
- configurable stale-event threshold warnings while a run is active,
- configurable reconnect policy controls (base delay, cap, max retries),
- a run-mode toggle (**Dry-run** vs **Apply**) before triggering bridge execution,
- a per-command risk review list with `HIGH`/`MEDIUM`/`LOW` badges and reasons before sidecar apply,
- shared sidecar risk taxonomy metadata (`commandRisk`) in execution-plan JSON for UI + audit/log consumers,
- a confirmation guardrail before non-dry apply runs (plus typed `APPLY` confirmation when high-risk commands are detected),
- and a hard-down banner when health checks/reconnect failures cross the configured threshold.

Bridge policy controls now live under a compact **advanced** section with:
- one-click presets (**Conservative / Balanced / Aggressive**) for quick recovery profile switching,
- persisted preset selection across reloads,
- and a one-click **Reset bridge policy defaults** action (returns to **Balanced**).

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
