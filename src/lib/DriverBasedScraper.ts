import { WebDriver } from 'selenium-webdriver'
import { BaseScraper } from './BaseScraper'

export class DriverBasedScraper<T = unknown> implements BaseScraper {
  constructor(private scraper: (driver: WebDriver) => Promise<T>) {}

  async scrape(driver: WebDriver): Promise<T> {
    return this.scraper(driver)
  }
}
