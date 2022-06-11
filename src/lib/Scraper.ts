import { WebDriver, WebElementCondition } from 'selenium-webdriver'
import { PageScraper } from './PageScraper'

//TODO add builder & chromeOptions
//TODO if driver is present, no need for builder and chrome options
//TODO if builder is present, no need for chromeOptions
//TODO if none of this is provided, make default settings
export type ScraperOptions = {
  driver: WebDriver
  // builder?: Builder
  // chromeOptions?: Options

  waitFor?: WebElementCondition
}

export class Scraper {
  // private pageScrapers: PageScraper[] = []
  private pageScrapers: Map<string, PageScraper> = new Map()

  setPageScraper(id: string, pageScraper: PageScraper): Scraper {
    this.pageScrapers.set(id, pageScraper)

    return this
  }

  async scrape(): Promise<unknown> {
    const pageScrapers = Array.from(this.pageScrapers.values())

    const result = new Map()

    // for await (const pageScraper of pageScrapers) {
    // }

    for (const scraper of pageScrapers) {
      scraper.scrape
    }

    return
  }
}

// ;(async () => {
//   // const pageScrapers = [new PageScraper(), new PageScraper()]

//   const mangaCatalogScraper = new PageScraper()
//   const mangaCatalogPage = await mangaCatalogScraper.scrape({} as WebDriver)

//   const urls = mangaCatalogPage.urls
// })()
