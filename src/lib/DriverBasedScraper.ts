import { WebDriver } from 'selenium-webdriver'

export class DriverBasedScraper<T = unknown> {
  constructor(private scraper: (driver: WebDriver) => Promise<T>) {}

  async scrape(driver: WebDriver): Promise<T> {
    return this.scraper(driver)
  }
}
