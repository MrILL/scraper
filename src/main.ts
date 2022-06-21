import { Builder } from 'selenium-webdriver'
import { MangaLibScraper } from './manga-lib'
import { exit } from 'process'

async function example() {
  const driver = await new Builder()
    .disableEnvironmentOverrides()
    .forBrowser('chrome')
    // .setChromeOptions(
    //   new Options()
    //     .headless()
    // )
    .build()

  try {
    const mangalib = new MangaLibScraper()
    await mangalib.scrap(driver)
  } finally {
    await driver.quit()
  }
  exit(0)
}

example()
