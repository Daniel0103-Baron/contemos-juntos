from .base_page import BasePage


class DashboardPage(BasePage):
    def open_dashboard(self):
        self.open("/dashboard")
        self.wait_url_contains("/dashboard")

    def open_menu_item(self, label_text):
        self.click_xpath(f"//nav//a[.//span[contains(normalize-space(.), '{label_text}')]]")

    def logout(self):
        self.click_xpath("//button[contains(@class, 'btn-logout')]")

    def ensure_sidebar_ready(self):
        self.is_visible_xpath("//aside[contains(@class, 'sidebar')]")
