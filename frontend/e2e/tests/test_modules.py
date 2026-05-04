import time

import pytest
from selenium.webdriver.common.by import By

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


@pytest.mark.regression
def test_familias_modal_open(logged_in):
    logged_in.open_menu_item("Familias")
    logged_in.wait_url_contains("/dashboard/familias")

    logged_in.click_xpath("//button[contains(., 'Nueva Familia')]")
    assert logged_in.text_present("Nueva Familia")


@pytest.mark.regression
def test_inventario_modal_open(logged_in):
    logged_in.open_menu_item("Inventario")
    logged_in.wait_url_contains("/dashboard/inventario")

    logged_in.click_xpath("//button[contains(., 'Registrar Ingreso')]")
    assert logged_in.text_present("Registrar Ingreso de Lote")


@pytest.mark.regression
def test_entregas_modal_open(logged_in):
    logged_in.open_menu_item("Entregas")
    logged_in.wait_url_contains("/dashboard/entregas")

    logged_in.click_xpath("//button[contains(., 'Nueva Entrega')]")
    assert logged_in.text_present("Nueva Entrega")


@pytest.mark.regression
def test_reportes_buttons_visible(logged_in):
    logged_in.open_menu_item("Reportes")
    logged_in.wait_url_contains("/dashboard/reportes")

    assert logged_in.text_present("Exportar a Excel")
    assert logged_in.text_present("Exportar a PDF")


@pytest.mark.writes
@pytest.mark.regression
def test_familias_create_minimal(logged_in, allow_writes):
    if not allow_writes:
        pytest.skip("Writes are disabled. Use --allow-writes or E2E_ALLOW_WRITES=true to run.")

    logged_in.open_menu_item("Familias")
    logged_in.wait_url_contains("/dashboard/familias")
    logged_in.click_xpath("//button[contains(., 'Nueva Familia')]")

    # Unique codigo to avoid collisions in repeated runs.
    unique_code = f"E2E-{int(time.time())}"

    logged_in.type_css("input[name='codigo_familia']", unique_code)
    logged_in.type_css("input[name='direccion']", "Calle 123")
    logged_in.type_css("input[name='barrio']", "Centro")
    logged_in.type_css("input[name='municipio']", "Bogota")
    logged_in.type_css("input[name='departamento']", "Cundinamarca")
    logged_in.type_css("input[name='telefono_contacto']", "3000000000")

    nivel = logged_in.driver.find_element(By.CSS_SELECTOR, "select[name='nivel_vulnerabilidad']")
    nivel.click()
    nivel.find_element(By.CSS_SELECTOR, "option[value='ALTA']").click()

    logged_in.click_css(".modal-content button[type='submit']")
    assert logged_in.text_present("Familia registrada") or logged_in.text_present(unique_code)
