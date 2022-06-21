import { By, WebElement } from 'selenium-webdriver'

export class WebElementUtils {
  static async getChildren(webElement: WebElement): Promise<WebElement[]> {
    return webElement.findElements(By.xpath('./*'))
  }

  static async getHTML(webElement: WebElement, outer = true): Promise<string> {
    return webElement.getAttribute(outer ? 'outerHTML' : 'innerHTML')
  }
}
