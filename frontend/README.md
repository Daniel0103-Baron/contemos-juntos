# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Selenium E2E (Python + Brave)

The project includes a complete Selenium suite in `e2e/` using `pytest`.

### One-time setup

Run from `frontend/`:

```bash
python -m venv e2e/.venv
e2e/.venv/Scripts/activate
pip install -r e2e/requirements.txt
copy e2e/.env.example e2e/.env
```

Edit `e2e/.env` and set:

- `E2E_USERNAME`
- `E2E_PASSWORD`
- `E2E_BASE_URL` (usually `http://localhost:5173`)
- `E2E_BRAVE_BINARY` (default path is already included)

### Run tests

With the virtual environment active:

```bash
npm run e2e:smoke
npm run e2e:smoke:full
npm run e2e:regression
npm run e2e:writes
npm run e2e:report
```

Notes:

- `e2e:writes` creates data and is disabled unless explicitly run.
- Ensure backend and frontend are running before executing tests.
- `e2e:smoke:full` starts backend/frontend automatically, waits for both URLs, runs smoke tests, then stops both processes.
