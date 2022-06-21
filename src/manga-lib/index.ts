import path = require('path')
import fs = require('fs')
import { WebDriver } from 'selenium-webdriver'
import { MangaCatalogScraper } from './catalog'
import { getMangaInfoScraper } from './mangaInfo'
import { MangaChapterListScraper } from './mangaChapterList'
import { urlRemoveReserverdChars } from '../utils'

export class MangaLibScraper {
  async scrap(driver: WebDriver) {
    const workingDir = path.join(process.cwd(), './result/manga-lib')
    if (!fs.existsSync(workingDir)) {
      fs.mkdirSync(workingDir)
    }

    const { urls } = await MangaCatalogScraper.scrape(driver)
    // console.log(urls)

    for await (const url of urls) {
      // console.log(url)

      const mangaInfo = await getMangaInfoScraper(url).scrape(driver)
      // console.log(mangaInfo)
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

      const { chapters } = await MangaChapterListScraper.scrape(driver)
      // console.log(chapters)
      chapters.forEach((chapterInfo) => {
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
