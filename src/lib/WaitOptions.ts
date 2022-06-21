import { Locator, until, WebElementCondition } from 'selenium-webdriver'

export type WaitOptionsT = {
  /**
   * Use functions from until from "selenium-webdriver"
   */
  readonly condition?: (locator: Locator) => WebElementCondition

  readonly timeout?: number

  readonly message?: string

  readonly pollTimeout?: number
}

/**
 * @example
 * const waitOptions = new WaitOptions()
 *   .setCondition(until.elementLocated)
 *   .setTimeout(1000)
 *   .setMessage('Too long')
 *   .setPollTimeOut(1000)
 *
 * @example
 * const waitOptions = new WaitOptions({
 *   condition: until.elementLocated,
 *   message: 'Too long',
 *   pollTimeout: 1000,
 * })
 */
export class WaitOptions implements WaitOptionsT {
  /**
   * Use functions from until from "selenium-webdriver"
   */
  condition: (locator: Locator) => WebElementCondition = until.elementLocated

  timeout?: number

  message?: string

  pollTimeOut?: number

  constructor(options?: WaitOptionsT) {
    Object.assign(this, options || {})
  }

  setOptions(options: WaitOptionsT): void {
    const { condition, ...restOptions } = options
    if (condition) {
      this.setCondition(condition)
    }

    Object.assign(this, restOptions)
  }

  setCondition(
    condition: (locator: Locator) => WebElementCondition
  ): WaitOptions {
    this.condition = condition

    return this
  }

  setTimeout(timeout: number): WaitOptions {
    this.timeout = timeout

    return this
  }

  setMessage(msg: string): WaitOptions {
    this.message = msg

    return this
  }

  setPollTimeOut(timeout: number): WaitOptions {
    this.pollTimeOut = timeout

    return this
  }
}
