import { WebDriver } from 'selenium-webdriver'
import { BaseScraper } from './BaseScraper'
import { ElementScraper } from './ElementScraper'

export type ElementScraperCollection<T> = {
  [key in keyof T]?: ElementScraper
}

export type BaseScraperCollection<T> = {
  [key in keyof T]?: BaseScraper
}

export class PageScraper<T = { [key: string]: unknown }>
  implements BaseScraper
{
  private url?: string

  private customGetter?: (driver: WebDriver) => Promise<void>

  private elementScrapers: ElementScraperCollection<T> = {}

  private baseScrapers: BaseScraperCollection<T> = {}

  constructor(
    url: string,
    elementScrapers?: ElementScraperCollection<T>,
    baseScrapers?: BaseScraperCollection<T>
  )

  constructor(
    customGetter: (driver: WebDriver) => Promise<void>,
    elementScrapers?: ElementScraperCollection<T>,
    baseScrapers?: BaseScraperCollection<T>
  )

  constructor(
    urlOrCustomGetter: string | ((driver: WebDriver) => Promise<void>),
    elementScrapers?: ElementScraperCollection<T>,
    baseScrapers?: BaseScraperCollection<T>
  ) {
    if (typeof urlOrCustomGetter === 'string') {
      this.url = urlOrCustomGetter
    } else if (typeof urlOrCustomGetter === 'function') {
      this.customGetter = urlOrCustomGetter
    }

    if (elementScrapers) {
      for (const key of Object.keys(elementScrapers)) {
        const elementScraper = elementScrapers[key as keyof T]

        this.addElementScraper(
          key as keyof T,
          elementScraper as ElementScraper<T>
        )
      }
    }

    if (baseScrapers) {
      for (const key of Object.keys(baseScrapers)) {
        const driverBasedScraper = baseScrapers[key as keyof T]

        this.addBaseScraper(key as keyof T, driverBasedScraper as BaseScraper)
      }
    }
  }

  private checkField(fieldName: keyof T): boolean {
    return (this.elementScrapers[fieldName] ||
      this.baseScrapers[fieldName]) as unknown as boolean
  }

  async addElementScraper(fieldName: keyof T, scraper: ElementScraper) {
    if (this.checkField(fieldName)) {
      throw new Error(
        `Page already have ElementScraper of "${fieldName.toString()}"`
      )
    }

    this.elementScrapers[fieldName] = scraper
  }

  async addBaseScraper(fieldName: keyof T, scraper: BaseScraper) {
    if (this.checkField(fieldName)) {
      throw new Error(
        `Page already have DriverBasedScraper of "${fieldName.toString()}"`
      )
    }

    this.baseScrapers[fieldName] = scraper
  }

  private async goToPage(driver: WebDriver) {
    if (this.url) {
      await driver.get(this.url)
    } else if (this.customGetter) {
      await this.customGetter(driver)
    } else {
      throw new Error('Page getter is not provided')
    }
  }

  async scrape(driver: WebDriver): Promise<T> {
    await this.goToPage(driver)

    const result = new Map()

    for await (const key of Object.keys(this.elementScrapers)) {
      const elementScraper = this.elementScrapers[key]

      result.set(key, await elementScraper.scrape(driver))
    }

    for await (const key of Object.keys(this.baseScrapers)) {
      const driverBaseScraper = this.baseScrapers[key]

      result.set(key, await driverBaseScraper.scrape(driver))
    }

    return Object.fromEntries(result)
  }
}
