import { WebDriver } from 'selenium-webdriver'
import { DriverBasedScraper } from './DriverBasedScraper'
import { ElementScraper } from './ElementScraper'

export type Collection<T, K> = {
  [key in keyof K]?: T
}

export type ElementScraperCollection<T> = {
  [key in keyof T]?: ElementScraper
}

export type DriverBasedScraperCollection<T> = {
  [key in keyof T]?: DriverBasedScraper
}

export class PageScraper<T = { [key: string]: unknown }> {
  private url?: string

  private customGetter?: (driver: WebDriver) => Promise<void>

  private elementScrapers: ElementScraperCollection<T> = {}

  private driverBasedScrapers: DriverBasedScraperCollection<T> = {}

  constructor(
    url: string,
    elementScrapers?: ElementScraperCollection<T>,
    driverBasedScrapers?: DriverBasedScraperCollection<T>
  )

  constructor(
    customGetter: (driver: WebDriver) => Promise<void>,
    elementScrapers?: ElementScraperCollection<T>,
    driverBasedScrapers?: DriverBasedScraperCollection<T>
  )

  constructor(
    urlOrCustomGetter: string | ((driver: WebDriver) => Promise<void>),
    elementScrapers?: ElementScraperCollection<T>,
    driverBasedScrapers?: DriverBasedScraperCollection<T>
  ) {
    if (typeof urlOrCustomGetter === 'string') {
      this.url = urlOrCustomGetter
    } else if (typeof urlOrCustomGetter === 'function') {
      this.customGetter = urlOrCustomGetter
    }

    if (elementScrapers) {
      for (const key of Object.keys(elementScrapers)) {
        const elementScraper = elementScrapers[key as keyof T]

        this.addElementScraper(key as keyof T, elementScraper as any)
      }
    }

    if (driverBasedScrapers) {
      for (const key of Object.keys(driverBasedScrapers)) {
        const driverBasedScraper = driverBasedScrapers[key as keyof T]

        this.addDriverBasedScraper(key as keyof T, driverBasedScraper as any)
      }
    }
  }

  private checkField(fieldName: keyof T): boolean {
    return (this.elementScrapers[fieldName] ||
      this.driverBasedScrapers[fieldName]) as unknown as boolean
  }

  private async getPage(driver: WebDriver) {
    if (this.url) {
      await driver.get(this.url)
    } else if (this.customGetter) {
      await this.customGetter(driver)
    } else {
      throw new Error('Page getter is not provided')
    }
  }

  async addElementScraper(fieldName: keyof T, scraper: ElementScraper) {
    if (this.checkField(fieldName)) {
      throw new Error(
        `Page already have ElementScraper of "${fieldName.toString()}"`
      )
    }

    this.elementScrapers[fieldName] = scraper
  }

  async addDriverBasedScraper(fieldName: keyof T, scraper: DriverBasedScraper) {
    if (this.checkField(fieldName)) {
      throw new Error(
        `Page already have DriverBasedScraper of "${fieldName.toString()}"`
      )
    }

    this.driverBasedScrapers[fieldName] = scraper
  }

  async scrape(driver: WebDriver): Promise<T> {
    await this.getPage(driver)

    const result = new Map()

    for await (const key of Object.keys(this.elementScrapers)) {
      const elementScraper = this.elementScrapers[key]

      result.set(key, await elementScraper.scrape(driver))
    }

    for await (const key of Object.keys(this.driverBasedScrapers)) {
      const driverBaseScraper = this.driverBasedScrapers[key]

      result.set(key, await driverBaseScraper.scrape(driver))
    }

    return Object.fromEntries(result)
  }
}
