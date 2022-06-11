import { until } from 'selenium-webdriver'
import { WaitOptions } from '../lib/WaitOptions'

export const defaultWaitOptions = new WaitOptions({
  condition: until.elementLocated,
  timeout: 30000,
})
