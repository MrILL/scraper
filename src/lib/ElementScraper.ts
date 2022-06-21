import { WebDriver, Locator, WebElement } from 'selenium-webdriver'
import { BaseScraper } from './BaseScraper'
import { WaitOptions } from './WaitOptions'

export type ElementScraperOptionsT = {
  wait?: WaitOptions | (() => Promise<unknown>)
}

export class ElementScraper<T = unknown> implements BaseScraper {
  /**
   * Use methods of By from "selenium-webdriver"
   * @example
   * By.xpath('div')
   */
  private locator: Locator

  private scraper: (element: WebElement) => Promise<T>

  private options?: ElementScraperOptionsT

  constructor(
    locator: Locator,
    scraper: (element: WebElement) => Promise<T>,
    options?: ElementScraperOptionsT
  ) {
    this.locator = locator
    this.scraper = scraper
    this.options = options
  }

  async scrape(driver: WebDriver): Promise<T> {
    const waitOptions = this.options?.wait
    if (waitOptions !== null && typeof waitOptions === 'object') {
      await driver.wait(
        waitOptions.condition(this.locator),
        waitOptions.timeout,
        waitOptions.message,
        waitOptions.pollTimeOut
      )
    }
    if (typeof waitOptions === 'function') {
      await waitOptions()
    }

    const element: WebElement = await driver.findElement(this.locator)

    return this.scraper(element)
  }
}
