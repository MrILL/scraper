import { WebDriver } from 'selenium-webdriver'

export class WebDriverUtils {
  static async getDocumentScrollHeight(driver: WebDriver): Promise<number> {
    return driver.executeScript('return document.documentElement.scrollHeight')
  }

  static async getDocumentClientHeight(driver: WebDriver): Promise<number> {
    return driver.executeScript('return document.documentElement.clientHeight')
  }

  static async getDocumentScrollTop(driver: WebDriver): Promise<number> {
    return driver.executeScript('return document.documentElement.scrollTop')
  }
}
