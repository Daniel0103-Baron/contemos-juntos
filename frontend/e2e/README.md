# Selenium E2E (Python) for Contemos Juntos

This folder contains a reusable Selenium + pytest suite prepared to run with Brave.

## 1) Install dependencies

From frontend/e2e:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 2) Configure credentials

Copy .env.example to .env and set valid credentials:

```bash
copy .env.example .env
```

Required values:
- E2E_BASE_URL (default: http://localhost:5173)
- E2E_USERNAME
- E2E_PASSWORD
- E2E_BRAVE_BINARY (default points to Brave on Windows)

## 3) Start app services

- Backend running (usually on port 5000)
- Frontend running (usually on port 5173)

## 4) Run test suites

From frontend/e2e with virtual env active:

```bash
pytest -m smoke
pytest -m regression
pytest -m "regression and not writes"
pytest -m writes --allow-writes
```

Single command from `frontend/` (auto start backend + frontend + smoke):

```bash
npm run e2e:smoke:full
```

Generate HTML report:

```bash
pytest -m smoke --html=reports/smoke.html --self-contained-html
```

Run headless:

```bash
pytest -m smoke --headless
```

## Notes

- Non-destructive tests run by default.
- Data-creating tests are marked with writes and require explicit enablement.
- If Brave path is custom, pass --brave-binary "C:/path/to/brave.exe".
