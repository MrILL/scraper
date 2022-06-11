import { DriverBasedScraper, PageScraper } from '../lib'
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

export async function getChapters(
  driver: WebDriver
): Promise<Map<string, Chapter>> {
  await driver.findElement(By.xpath("//li[@data-key='chapters']")).click()

  const container = await driver.findElement(
    By.className('vue-recycle-scroller__item-wrapper')
  )
  await driver.wait(until.elementIsVisible(container))

  const documentHeight = await WebDriverUtils.getDocumentScrollHeight(driver)
  const clientHeight = await WebDriverUtils.getDocumentClientHeight(driver)
  let currentScroll = await WebDriverUtils.getDocumentScrollTop(driver)

  const chaptersCollection = new Map()

  do {
    const chaptersEl = await WebElementUtils.getChildren(container)
    await Promise.all(
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

        chaptersCollection.set(id, {
          isRed,
          name,
          url,
          translater,
          date,
        })
      })
    )

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
