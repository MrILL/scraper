import { WebDriver } from 'selenium-webdriver'

export interface BaseScraper {
  scrape: (driver: WebDriver) => Promise<unknown>
}
