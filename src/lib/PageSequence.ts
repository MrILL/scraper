import { WebDriver } from 'selenium-webdriver'
import { PageScraper } from './PageScraper'

type PageScraperGetter =
  | ((currentResult: any) => PageScraper)
  | ((currentResult: any) => PageScraper[])

type BaseSequence =
  | { pageScraper: PageScraper }
  | { pageScraperGetter: PageScraperGetter }

type SequenceT = BaseSequence & {
  fieldName: string
  children?: SequenceT | SequenceT[]
}

type PageScraperChildren = {
  [key: string]: PageUnit
}

// type Sequence = {
//   functions: () =>
// }

export class PageUnit {
  private pageScraper?: PageScraper

  private getPageScraper?: PageScraperGetter

  private children: PageScraperChildren = {}

  constructor(pageScraper: PageScraper, children?: PageScraperChildren)
  constructor(getPageScraper: PageScraperGetter, children?: PageScraperChildren)
  constructor(
    pageScraperInstanceOrGetter: PageScraper | PageScraperGetter,
    children: PageScraperChildren
  ) {
    if (pageScraperInstanceOrGetter instanceof PageScraper) {
      this.pageScraper = pageScraperInstanceOrGetter
    } else if (typeof pageScraperInstanceOrGetter === 'function') {
      this.getPageScraper = pageScraperInstanceOrGetter
    } else {
      throw new Error('Invalid PageScraper instance or getter')
    }

    this.children = children
  }

  async resolve(driver: WebDriver) {
    //TODO calc value
    let ownValue

    if (this.pageScraper) {
      ownValue = await this.pageScraper.scrape(driver)
    } else if (this.getPageScraper) {
      console.warn('TODO PageUnit: getPageScraper resolve')
      // const scraper = this.getPageScraper()
    } else {
      throw new Error('Not found PageScraper instance or getter')
    }

    //TODO calc children one by one
    return ownValue
  }
}

export class PageSequence {
  private pageUnitTree: PageScraperChildren

  constructor(pageUnitTree: PageScraperChildren) {
    this.pageUnitTree = pageUnitTree
  }

  async resolve(driver: WebDriver) {
    console.log(this.pageUnitTree)
    const res = {}

    for await (const key of Object.keys(this.pageUnitTree)) {
      console.log(key)
      res[key] = await this.pageUnitTree[key].resolve(driver)
    }

    console.log(res)
    // console.log(Object.keys(this.pageUnitTree))
    // console.log(this.pageUnitTree)
    // return this.pageUnitTree.resolve(driver)
  }

  // static createIndependedConsiquentOrder(
  //   ...pages: PageScraper[]
  // ): PageSequence {
  //   return new PageSequence(pages)
  // }

  // async resolve(driver: WebDriver): Promise<{[key: string]: any}> {
  // async resolve(driver: WebDriver) {
  //   return Promise.all(this.pages.map(async (page) => page.scrape(driver)))
  // }
}

// const getMangaInfoScraper = (url) => {
//   return new PageScraper<Info>(
//     url,
//     {
//       name: nameScraper,
//       altName: altNameScraper,
//       additionalInfo: infoScraper,
//     },
//     {
//       url: urlScraper,
//     }
//   )
// }

// const unused: SequenceT = {} as any
// (unused)

//TODO copy all keys

// PageUnit result:
// const input = {
//   popularMangaUrls: {
//     scraper: 'Scraper => value',
//     children: { info: 'otherScraper' },
//   },
// }
// const res = {
//   popularMangaUrls: {
//     value: 'value',
//     info: 'otherScraper not yet done his job'
//   }
// }

//If scraper return [], it make next scructure:
// const input = {
//   popularMangaUrls: {
//     scraper: 'Scraper => value[]',
//     children: { info: 'otherScraper' },
//   },
// }
// const res = {
//   popularMangaUrls: [
//     {
//       value: 'value1',
//       info: 'otherScraper result',
//     },
//     {
//       value: 'value2',
//       info: 'otherScraper result',
//     },
//   ],
// }
