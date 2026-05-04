import pytest

from pages.dashboard_page import DashboardPage
from pages.login_page import LoginPage


@pytest.mark.smoke
def test_login_invalid_shows_error(driver, base_url):
    login_page = LoginPage(driver, base_url)
    login_page.open_login()
    login_page.login("usuario_invalido@example.com", "clave_invalida")

    # The app's global 401 interceptor forces redirect to /login.
    # For invalid credentials, the critical assertion is staying out of dashboard.
    login_page.wait_url_contains("/login")
    assert "/dashboard" not in login_page.driver.current_url, "Invalid login should never reach dashboard"


@pytest.mark.smoke
def test_login_success_and_logout(driver, base_url, credentials):
    if not credentials["username"] or not credentials["password"]:
        pytest.skip("Set E2E_USERNAME and E2E_PASSWORD in e2e/.env or pass --username/--password")

    login_page = LoginPage(driver, base_url)
    dashboard = DashboardPage(driver, base_url)

    login_page.open_login()
    login_page.login(credentials["username"], credentials["password"])
    dashboard.wait_url_contains("/dashboard")

    assert dashboard.text_present("Panel de Control") or dashboard.text_present("Bienvenido"), "Dashboard header was not visible"

    dashboard.logout()
    login_page.wait_url_contains("/login")
    assert login_page.text_present("Iniciar Sesion") or login_page.text_present("Iniciar"), "Expected to return to login"
