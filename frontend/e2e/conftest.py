import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


DEFAULT_BRAVE_PATH = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"


def _str_to_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def pytest_addoption(parser):
    parser.addoption("--base-url", action="store", default=None, help="Frontend URL")
    parser.addoption("--username", action="store", default=None, help="Login username/email")
    parser.addoption("--password", action="store", default=None, help="Login password")
    parser.addoption("--brave-binary", action="store", default=None, help="Brave executable path")
    parser.addoption("--headless", action="store_true", default=False, help="Run browser headless")
    parser.addoption("--allow-writes", action="store_true", default=False, help="Allow tests that submit data")


@pytest.fixture(scope="session", autouse=True)
def load_env_file():
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)


@pytest.fixture(scope="session")
def base_url(pytestconfig):
    cli = pytestconfig.getoption("base_url")
    if cli:
        return cli
    return os.getenv("E2E_BASE_URL", "http://localhost:5173")


@pytest.fixture(scope="session")
def credentials(pytestconfig):
    username = pytestconfig.getoption("username") or os.getenv("E2E_USERNAME", "")
    password = pytestconfig.getoption("password") or os.getenv("E2E_PASSWORD", "")
    return {"username": username, "password": password}


@pytest.fixture(scope="session")
def allow_writes(pytestconfig):
    return pytestconfig.getoption("allow_writes") or _str_to_bool(os.getenv("E2E_ALLOW_WRITES"), False)


@pytest.fixture(scope="session")
def browser_options(pytestconfig):
    options = webdriver.ChromeOptions()

    brave_binary = pytestconfig.getoption("brave_binary") or os.getenv("E2E_BRAVE_BINARY", DEFAULT_BRAVE_PATH)
    if brave_binary and Path(brave_binary).exists():
        options.binary_location = brave_binary

    env_headless = _str_to_bool(os.getenv("E2E_HEADLESS"), False)
    cli_headless = pytestconfig.getoption("headless")
    if cli_headless or env_headless:
        options.add_argument("--headless=new")

    options.add_argument("--window-size=1440,1080")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    return options


@pytest.fixture()
def driver(browser_options):
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=browser_options)
    driver.implicitly_wait(1)
    yield driver
    driver.quit()
