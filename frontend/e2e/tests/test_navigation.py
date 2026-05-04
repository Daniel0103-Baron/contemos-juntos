import pytest

from pages.dashboard_page import DashboardPage
from pages.login_page import LoginPage


@pytest.fixture
def logged_in(driver, base_url, credentials):
    if not credentials["username"] or not credentials["password"]:
        pytest.skip("Set E2E_USERNAME and E2E_PASSWORD in e2e/.env or pass --username/--password")

    login_page = LoginPage(driver, base_url)
    login_page.open_login()
    login_page.login(credentials["username"], credentials["password"])

    dashboard = DashboardPage(driver, base_url)
    dashboard.wait_url_contains("/dashboard")
    return dashboard


@pytest.mark.smoke
def test_dashboard_home_loads(logged_in):
    assert logged_in.text_present("Bienvenido") or logged_in.text_present("Panel de Control")


@pytest.mark.regression
def test_sidebar_routes_for_admin_menu(logged_in):
    menu_targets = [
        ("Familias", "/dashboard/familias"),
        ("Inventario", "/dashboard/inventario"),
        ("Entregas", "/dashboard/entregas"),
        ("Reportes", "/dashboard/reportes"),
    ]

    for label, expected_path in menu_targets:
        logged_in.open_menu_item(label)
        logged_in.wait_url_contains(expected_path)
        assert expected_path in logged_in.driver.current_url, f"Expected URL to contain {expected_path}"
