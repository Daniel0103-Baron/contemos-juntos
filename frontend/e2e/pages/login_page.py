from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec

from .base_page import BasePage


class LoginPage(BasePage):
    USER_INPUT = "input[name='usuario']"
    PASSWORD_INPUT = "input[name='password']"
    SUBMIT_BUTTON = "button[type='submit']"

    def open_login(self):
        self.open("/login")
        self.wait.until(ec.visibility_of_element_located((By.CSS_SELECTOR, self.USER_INPUT)))

    def login(self, username, password):
        self.type_css(self.USER_INPUT, username)
        self.type_css(self.PASSWORD_INPUT, password)
        self.click_css(self.SUBMIT_BUTTON)

    def login_error_visible(self):
        return self.is_visible_xpath("//div[contains(@class, 'alert-error')]")
