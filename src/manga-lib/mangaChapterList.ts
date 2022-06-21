import {
  DriverBasedScraper,
  ElementScraper,
  PageScraper,
  WaitOptions,
} from '../lib'
import { By, until, WebDriver } from 'selenium-webdriver'
import { WebDriverUtils, WebElementUtils } from '../utils'

type Chapter = {
  isRed: boolean
  name: string
  url: string
  translater: string
  date: string
}

type ChapterList = {
  chapters: Map<string, Chapter>
}

const ResyclerSnapshotScraper = new ElementScraper<[string, Chapter][]>(
  By.className('vue-recycle-scroller__item-wrapper'),
  async (container) => {
    const chaptersEl = await WebElementUtils.getChildren(container)

    return await Promise.all(
      chaptersEl.map(async (el) => {
        const metadataContainer = await el.findElement(
          By.className('media-chapter')
        )
        const id = await metadataContainer.getAttribute('data-id')
        const isRed = await metadataContainer.getAttribute('data-is-read')
        const url = await metadataContainer
          .findElement(By.xpath('.//a'))
          .getAttribute('href')

        const chapterDataElements = await WebElementUtils.getChildren(
          await el.findElement(By.className('media-chapter__body'))
        )
        const [name, translater, date] = await Promise.all(
          await chapterDataElements.map(async (el) => await el.getText())
        )

        return [
          id,
          {
            isRed: !!isRed,
            name,
            url,
            translater,
            date,
          } as Chapter,
        ]
      })
    )
  },
  {
    wait: new WaitOptions({
      condition: until.elementLocated,
    }),
  }
)

export async function getChapters(
  driver: WebDriver
): Promise<Map<string, Chapter>> {
  const documentHeight = await WebDriverUtils.getDocumentScrollHeight(driver)
  const clientHeight = await WebDriverUtils.getDocumentClientHeight(driver)
  let currentScroll = await WebDriverUtils.getDocumentScrollTop(driver)

  const chaptersCollection = new Map()

  do {
    const scraperRes = await ResyclerSnapshotScraper.scrape(driver)
    scraperRes.forEach((pair: [string, Chapter]) => {
      chaptersCollection.set(pair[0], pair[1])
    })

    await WebDriverUtils.documentScrollBy(driver, 0, clientHeight)
    currentScroll = await WebDriverUtils.getDocumentScrollTop(driver)
  } while (currentScroll < documentHeight - clientHeight)

  return chaptersCollection
}

export const MangaChapterListScraper = new PageScraper<ChapterList>(
  async (driver: WebDriver) => {
    await driver.findElement(By.xpath("//li[@data-key='chapters']")).click()
  },
  {},
  {
    chapters: new DriverBasedScraper(getChapters),
  }
)
