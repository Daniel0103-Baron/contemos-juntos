from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait


class BasePage:
    def __init__(self, driver, base_url, timeout=15):
        self.driver = driver
        self.base_url = base_url.rstrip("/")
        self.wait = WebDriverWait(driver, timeout)

    def open(self, path):
        self.driver.get(f"{self.base_url}{path}")

    def wait_url_contains(self, text):
        self.wait.until(ec.url_contains(text))

    def click_css(self, selector):
        self.wait.until(ec.element_to_be_clickable((By.CSS_SELECTOR, selector))).click()

    def click_xpath(self, xpath):
        self.wait.until(ec.element_to_be_clickable((By.XPATH, xpath))).click()

    def type_css(self, selector, value):
        el = self.wait.until(ec.visibility_of_element_located((By.CSS_SELECTOR, selector)))
        el.clear()
        el.send_keys(value)

    def is_visible_xpath(self, xpath):
        try:
            self.wait.until(ec.visibility_of_element_located((By.XPATH, xpath)))
            return True
        except Exception:
            return False

    def text_present(self, text):
        xpath = f"//*[contains(normalize-space(.), \"{text}\")]"
        return self.is_visible_xpath(xpath)
