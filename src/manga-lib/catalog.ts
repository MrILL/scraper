import { By } from 'selenium-webdriver'
import { ElementScraper, PageScraper } from '../lib'
import { defaultWaitOptions } from './utils'

export type Catalog = {
  urls: string[]
}

const lastPopularMangaScraper = new ElementScraper(
  By.className('hot-media-wrap'),
  async (element) => {
    const webElements = await element.findElements(By.xpath('.//div/a[2]'))

    return Promise.all(
      webElements.map(async (urlEl) => urlEl.getAttribute('href'))
    )
  },
  {
    wait: defaultWaitOptions,
  }
)

export const MangaCatalogScraper = new PageScraper<Catalog>(
  'https://mangalib.me',
  {
    urls: lastPopularMangaScraper,
  }
)
