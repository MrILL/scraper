import { By, WebElement } from 'selenium-webdriver'
import cheerio = require('cheerio')

export class WebElementUtils {
  static async getChildren(webElement: WebElement): Promise<WebElement[]> {
    return webElement.findElements(By.xpath('./*'))
  }

  static async getOwnText(webElement: WebElement): Promise<string> {
    const $ = cheerio.load(
      await webElement.getAttribute('outerHTML'),
      null,
      false
    )

    return $('*').children().remove().end().text()
  }

  static async getHTML(webElement: WebElement, outer = true): Promise<string> {
    return webElement.getAttribute(outer ? 'outerHTML' : 'innerHTML')
  }
}
