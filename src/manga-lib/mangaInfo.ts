import { By, until, WebDriver } from 'selenium-webdriver'
import { DriverBasedScraper, ElementScraper, PageScraper } from '../lib'
import { WebElementUtils } from '../utils'
import { defaultWaitOptions } from './utils'

export async function getMangaInfo(driver: WebDriver): Promise<unknown> {
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

export type Info = {
  name: string
  altName: string
  url: string
  additionalInfo: { [key: string]: string }
}

export const infoScraper: ElementScraper<Info['additionalInfo']> =
  new ElementScraper(
    By.className('media-info-list'),
    async (container) => {
      const infoElements = await WebElementUtils.getChildren(container)
      const info = await Promise.all(
        infoElements.map(async (el) => {
          const infoRow = await WebElementUtils.getChildren(el)

          return await Promise.all(infoRow.map(async (row) => row.getText()))
        })
      )
      const infoObj = Object.fromEntries(info)

      return infoObj
    },
    {
      wait: defaultWaitOptions,
    }
  )

export const nameScraper = new ElementScraper<Info['name']>(
  By.className('media-name__main'),
  async (element) => element.getText()
)

export const altNameScraper = new ElementScraper<Info['altName']>(
  By.className('media-name__alt'),
  async (element) => element.getText()
)

export const urlScraper = new DriverBasedScraper<Info['url']>(
  async (driver) => {
    return driver.getCurrentUrl()
  }
)

export function getMangaInfoScraper(url: string) {
  return new PageScraper<Info>(
    url,
    {
      name: nameScraper,
      altName: altNameScraper,
      additionalInfo: infoScraper,
    },
    {
      url: urlScraper,
    }
  )
}
