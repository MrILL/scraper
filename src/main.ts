import {
  Builder,
  By,
  Capabilities,
  WebDriver,
  WebElement,
} from 'selenium-webdriver'
import { Options } from 'selenium-webdriver/chrome'
import { MangaLibScraper } from './manga-lib'
import { WebElementUtils } from './utils'
import { exit } from 'process'

/// Recursive by all elements
/// Write into json parsed html
// fs.writeFileSync(
//   'text.json',
//   JSON.stringify(await getObjRecurcively(driver, webElement)),
//   'utf8'
// )
const getObjRecurcively = async (driver: WebDriver, webElement: WebElement) => {
  const obj = {} as any

  obj.tag = await webElement.getTagName()
  obj.atr = await driver.executeScript(
    `var items = {};
      Array.prototype.forEach.call(arguments[0].attributes, ({name, value}) => {
        items[name] = value;
      });

      return items;`,
    webElement
  )

  obj.text = await WebElementUtils.getOwnText(webElement)

  const childElements = await WebElementUtils.getChildren(webElement)
  obj.child = await Promise.all(
    childElements.map(async (child) => getObjRecurcively(driver, child))
  )

  return obj
}

async function example() {
  console.log(process.env.CHROME_DRIVER)

  const driver = await new Builder()
    .disableEnvironmentOverrides()
    .forBrowser('chrome')
    // .withCapabilities(Capabilities.chrome())
    // .setChromeOptions(
    //   new Options()
    //     .headless()
    //     .addArguments('start-maximized')
    //     .addArguments('disable-infobars')
    //     .addArguments('--no-sandbox')
    //     .addArguments('disable-dev-shm-usage')
    // )
    .build()

  // await driver.manage().window().minimize()

  try {
    const mangalib = new MangaLibScraper()
    await mangalib.scrapSomething(driver)

    /// Get child elements of webElement
    // const elements = await webElement.findElements(By.xpath('./*'))
    // const elementsHtml = await elements.map(async (el) => {
    //   return await el.getAttribute('outerHTML')
    // })

    /// Change background of element
    // await driver.executeScript(
    //   "arguments[0].style.background = 'lightblue'",
    //   webElement
    // )
  } finally {
    await driver.quit()
  }
  exit(0)
}

example()
