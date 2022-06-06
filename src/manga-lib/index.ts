import path = require('path')
import fs = require('fs')
import { By, until, WebDriver } from 'selenium-webdriver'
import {
  urlRemoveReserverdChars,
  WebDriverUtils,
  WebElementUtils,
} from '../utils'

async function getLastPopularManga(driver: WebDriver): Promise<string[]> {
  await driver.get('https://mangalib.me')

  await driver.wait(until.elementLocated(By.className('hot-media-wrap')), 30000)
  const webElements = await driver
    .findElement(By.className('hot-media-wrap'))
    .findElements(By.xpath('./*'))
  const urls = await Promise.all(
    webElements.map(async (el) => {
      const [lastChapterUrlEl, mangaUrlEl] = await el.findElements(
        By.xpath('./a')
      )

      return mangaUrlEl.getAttribute('href')
    })
  )

  return urls
}

async function getMangaInfo(driver: WebDriver): Promise<any> {
  await driver.wait(
    until.elementLocated(By.className('media-info-list')),
    30000
  )

  const infoElementContainer = await driver.findElement(
    By.className('media-info-list')
  )
  const infoElements = await WebElementUtils.getChildren(infoElementContainer)
  const info = await Promise.all(
    infoElements.map(async (el) => {
      const infoRow = await WebElementUtils.getChildren(el)

      return await Promise.all(infoRow.map(async (row) => row.getText()))
    })
  )
  const infoObj = Object.fromEntries(info)

  const name = await driver
    .findElement(By.className('media-name__main'))
    .getText()
  const altName = await driver
    .findElement(By.className('media-name__alt'))
    .getText()

  return {
    name,
    altName,
    ...infoObj,
    url: await driver.getCurrentUrl(),
  }
}

async function getChapters(driver: WebDriver): Promise<Map<string, any>> {
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
    //TODO move out to utils
    driver.executeScript(
      'window.scrollBy(0, document.documentElement.clientHeight)'
    )

    currentScroll = (await driver.executeScript(
      'return document.documentElement.scrollTop'
    )) as number
  } while (currentScroll < documentHeight - clientHeight)

  return chaptersCollection
}

export class MangaLibScraper {
  // Scrap last popular manga
  async scrapSomething(driver: WebDriver) {
    const workingDir = path.join(process.cwd(), './result/manga-lib')
    if (!fs.existsSync(workingDir)) {
      fs.mkdirSync(workingDir)
    }

    const urls = await getLastPopularManga(driver)
    for await (const url of urls) {
      await driver.get(url)

      const mangaInfo = await getMangaInfo(driver)

      const mangaDir = path.join(
        workingDir,
        urlRemoveReserverdChars(mangaInfo.altName)
      )
      if (!fs.existsSync(mangaDir)) {
        fs.mkdirSync(mangaDir)
      }

      fs.writeFileSync(
        path.join(mangaDir, 'index.json'),
        JSON.stringify(mangaInfo, null, 2)
      )

      const chaptersCollection = await getChapters(driver)
      Array.from(chaptersCollection.values()).forEach((chapterInfo) => {
        const chapterDir = path.join(
          mangaDir,
          urlRemoveReserverdChars(chapterInfo.name)
        )
        if (!fs.existsSync(chapterDir)) {
          fs.mkdirSync(chapterDir)
        }

        fs.writeFileSync(
          path.join(chapterDir, 'index.json'),
          JSON.stringify(chapterInfo, null, 2)
        )
      })
    }
  }
}
