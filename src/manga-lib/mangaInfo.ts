import { By } from 'selenium-webdriver'
import { DriverBasedScraper, ElementScraper, PageScraper } from '../lib'
import { defaultWaitOptions } from './utils'

export type Info = {
  name: string
  altName: string
  url: string
  additionalInfo: { [key: string]: string }
}

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

export const additionalInfoScraper: ElementScraper<Info['additionalInfo']> =
  new ElementScraper(
    By.className('media-info-list'),
    async (container) => {
      const infoElements = await container.findElements(By.xpath('./*'))
      const info = await Promise.all(
        infoElements.map(async (el) => {
          const infoRow = await el.findElements(By.xpath('./*'))

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

export function getMangaInfoScraper(url: string) {
  return new PageScraper<Info>(
    url,
    {
      name: nameScraper,
      altName: altNameScraper,
      additionalInfo: additionalInfoScraper,
    },
    {
      url: urlScraper,
    }
  )
}
