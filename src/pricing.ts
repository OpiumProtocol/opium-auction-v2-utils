import { ethers, BigNumber } from 'ethers'

import { AuctionPricingDirection, AuctionPricingFunction, BuildAuctionParams, BuildOrderParams } from './types'

import Errors from './errors'

const BASE = ethers.utils.parseEther('1')

/** Rewritten Solidity auction codebase to TS */

// Linear
const linearPriceDecreasing = (
  orderMakerAmount: BigNumber,
  orderTakerAmount: BigNumber,
  thresholdOrderTakerAmount: BigNumber,
  startedAt: number,
  endedAt: number,
  now: number
): BigNumber => {
  const maxPricePadded = orderTakerAmount.mul(BASE).div(orderMakerAmount);
  const minPricePadded = thresholdOrderTakerAmount.mul(BASE).div(orderMakerAmount);

  // If not started yet
  if (startedAt > now) {
    return maxPricePadded;
  }

  // If already finished
  if (endedAt < now) {
    return minPricePadded;
  }

  const timeElapsed = now - startedAt;
  const timeMax = endedAt - startedAt;

  return maxPricePadded.sub(
    minPricePadded.mul(timeElapsed).div(timeMax)
  );
}

const linearPriceIncreasing = (
  orderMakerAmount: BigNumber,
  orderTakerAmount: BigNumber,
  thresholdOrderTakerAmount: BigNumber,
  startedAt: number,
  endedAt: number,
  now: number
): BigNumber => {
  const maxPricePadded = orderTakerAmount.mul(BASE).div(orderMakerAmount);
  const minPricePadded = thresholdOrderTakerAmount.mul(BASE).div(orderMakerAmount);

  // If not started yet
  if (startedAt > now) {
    return minPricePadded;
  }

  // If already finished
  if (endedAt < now) {
    return maxPricePadded;
  }

  const timeElapsed = now - startedAt;
  const timeMax = endedAt - startedAt;

  return maxPricePadded
    .sub(minPricePadded)
    .mul(timeElapsed)
    .div(timeMax)
    .add(minPricePadded);
}

const getLinearAuctionMakerAmount = (
  orderMakerAmount: BigNumber,
  orderTakerAmount: BigNumber,
  thresholdOrderTakerAmount: BigNumber,
  startedAt: number,
  endedAt: number,
  increasing: boolean,
  swapTakerAmount: BigNumber,
  now: number
): BigNumber => {
  return swapTakerAmount
    .mul(BASE)
    .div(
      increasing
        ? linearPriceIncreasing(
          orderMakerAmount,
          orderTakerAmount,
          thresholdOrderTakerAmount,
          startedAt,
          endedAt,
          now
        )
        : linearPriceDecreasing(
          orderMakerAmount,
          orderTakerAmount,
          thresholdOrderTakerAmount,
          startedAt,
          endedAt,
          now
        )
    );
}

export const getLinearAuctionTakerAmount = (
  orderMakerAmount: BigNumber,
  orderTakerAmount: BigNumber,
  thresholdOrderTakerAmount: BigNumber,
  startedAt: number,
  endedAt: number,
  increasing: boolean,
  swapMakerAmount: BigNumber,
  now: number
): BigNumber => {
  return swapMakerAmount 
    .mul(
      increasing
        ? linearPriceIncreasing(
          orderMakerAmount,
          orderTakerAmount,
          thresholdOrderTakerAmount,
          startedAt,
          endedAt,
          now
        )
        : linearPriceDecreasing(
          orderMakerAmount,
          orderTakerAmount,
          thresholdOrderTakerAmount,
          startedAt,
          endedAt,
          now
        )
    )
    .div(BASE);
}

// Exponential
const expBySeconds = (secs: number): BigNumber => {
  let result = BASE;
  const secsBN = BigNumber.from(secs)

    if (secsBN.and('0x00000F').toNumber()) {
      if (secsBN.and('0x000001').toNumber()) {
        result = result.mul('999900000000000000000000000000000000').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x000002').toNumber()) {
        result = result.mul('999800010000000000000000000000000000').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x000004').toNumber()) {
        result = result.mul('999600059996000100000000000000000000').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x000008').toNumber()) {
        result = result.mul('999200279944006999440027999200010000').div('1000000000000000000000000000000000000')
      }
    }

    if (secsBN.and('0x0000F0').toNumber()) {
      if (secsBN.and('0x000010').toNumber()) {
        result = result.mul('998401199440181956328006856128688560').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x000020').toNumber()) {
        result = result.mul('996804955043593987145855519554957648').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x000040').toNumber()) {
        result = result.mul('993620118399461429792290614928235372').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x000080').toNumber()) {
        result = result.mul('987280939688159750172898466482272707').div('1000000000000000000000000000000000000')
      }
    }

    if (secsBN.and('0x000F00').toNumber()) {
      if (secsBN.and('0x000100').toNumber()) {
        result = result.mul('974723653871535730138973062438582481').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x000200').toNumber()) {
        result = result.mul('950086201416677390961738571086337286').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x000400').toNumber()) {
        result = result.mul('902663790122371280016479918855854806').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x000800').toNumber()) {
        result = result.mul('814801917998084346828628782199508463').div('1000000000000000000000000000000000000')
      }
    }

    if (secsBN.and('0x00F000').toNumber()) {
      if (secsBN.and('0x001000').toNumber()) {
        result = result.mul('663902165573356968243491567819400493').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x002000').toNumber()) {
        result = result.mul('440766085452993090398118811102456830').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x004000').toNumber()) {
        result = result.mul('194274742085555207178862579417407102').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x008000').toNumber()) {
        result = result.mul('37742675412408995610179844414960649').div('1000000000000000000000000000000000000')
      }
    }

    if (secsBN.and('0x0F0000').toNumber()) {
      if (secsBN.and('0x010000').toNumber()) {
        result = result.mul('1424509547286462546864068778806188').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x020000').toNumber()) {
        result = result.mul('2029227450310282474813662564103').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x040000').toNumber()) {
        result = result.mul('4117764045092769930387910').div('1000000000000000000000000000000000000')
      }
      if (secsBN.and('0x080000').toNumber()) {
        result = result.mul('16955980731058').div('1000000000000000000000000000000000000')
      }
    }

  return result;
}

const exponentialPriceDecreasing = (
  orderMakerAmount: BigNumber,
  orderTakerAmount: BigNumber,
  thresholdOrderTakerAmount: BigNumber,
  startedAt: number,
  endedAt: number,
  amplifier: number,
  now: number
): BigNumber => {
  const maxPricePadded = orderTakerAmount.mul(BASE).div(orderMakerAmount);
  const minPricePadded = thresholdOrderTakerAmount.mul(BASE).div(orderMakerAmount);

  // If not started yet
  if (startedAt > now) {
    return maxPricePadded;
  }

  // If already finished
  if (endedAt < now) {
    return minPricePadded;
  }

  const timeElapsed = now - startedAt;
  const pricePadded = maxPricePadded
    .mul(expBySeconds(timeElapsed * amplifier))
    .div(BASE);

  return pricePadded.gt(minPricePadded) ? pricePadded : minPricePadded;
}

const exponentialPriceIncreasing = (
  orderMakerAmount: BigNumber,
  orderTakerAmount: BigNumber,
  thresholdOrderTakerAmount: BigNumber,
  startedAt: number,
  endedAt: number,
  amplifier: number,
  now: number
): BigNumber => {
  const maxPricePadded = orderTakerAmount.mul(BASE).div(orderMakerAmount);
  const minPricePadded = thresholdOrderTakerAmount.mul(BASE).div(orderMakerAmount);

  // If not started yet
  if (startedAt > now) {
    return minPricePadded;
  }

  // If already finished
  if (endedAt < now) {
    return maxPricePadded;
  }

  const timeElapsed = now - startedAt;
  const pricePadded = maxPricePadded
    .mul(
      BASE.sub(expBySeconds(timeElapsed * amplifier))
    )
    .div(BASE);

  return pricePadded.gt(minPricePadded) ? pricePadded : minPricePadded;
}

const getExponentialAuctionMakerAmount = (
  orderMakerAmount: BigNumber,
  orderTakerAmount: BigNumber,
  thresholdOrderTakerAmount: BigNumber,
  startedAt: number,
  endedAt: number,
  increasing: boolean,
  amplifier: number,
  swapTakerAmount: BigNumber,
  now: number
): BigNumber => {
  return swapTakerAmount
    .mul(BASE)
    .div(
      increasing
        ? exponentialPriceIncreasing(
          orderMakerAmount,
          orderTakerAmount,
          thresholdOrderTakerAmount,
          startedAt,
          endedAt,
          amplifier,
          now
        )
        : exponentialPriceDecreasing(
          orderMakerAmount,
          orderTakerAmount,
          thresholdOrderTakerAmount,
          startedAt,
          endedAt,
          amplifier,
          now
        )
    );
}

export const getExponentialAuctionTakerAmount = (
  orderMakerAmount: BigNumber,
  orderTakerAmount: BigNumber,
  thresholdOrderTakerAmount: BigNumber,
  startedAt: number,
  endedAt: number,
  increasing: boolean,
  amplifier: number,
  swapMakerAmount: BigNumber,
  now: number
): BigNumber => {
  return swapMakerAmount 
    .mul(
      increasing
        ? exponentialPriceIncreasing(
          orderMakerAmount,
          orderTakerAmount,
          thresholdOrderTakerAmount,
          startedAt,
          endedAt,
          amplifier,
          now
        )
        : exponentialPriceDecreasing(
          orderMakerAmount,
          orderTakerAmount,
          thresholdOrderTakerAmount,
          startedAt,
          endedAt,
          amplifier,
          now
        )
    )
    .div(BASE);
}

// Helpers
export const getRequiredTakerAmount = (
  order: BuildOrderParams,
  auction: BuildAuctionParams,
  requiredMakerAmount: BigNumber,
  now: number
): BigNumber => {
  if (auction.pricingFunction === AuctionPricingFunction.LINEAR) {
    return getLinearAuctionTakerAmount(
      BigNumber.from(order.makerAmount),
      BigNumber.from(auction.maxTakerAmount),
      BigNumber.from(auction.minTakerAmount),
      auction.startedAt,
      auction.endedAt,
      auction.pricingDirection === AuctionPricingDirection.INCREASING,
      requiredMakerAmount,
      now
    )
  } else if (auction.pricingFunction === AuctionPricingFunction.EXPONENTIAL) {
    return getExponentialAuctionTakerAmount(
      BigNumber.from(order.makerAmount),
      BigNumber.from(auction.maxTakerAmount),
      BigNumber.from(auction.minTakerAmount),
      auction.startedAt,
      auction.endedAt,
      auction.pricingDirection === AuctionPricingDirection.INCREASING,
      auction.amplifier ?? 1,
      requiredMakerAmount,
      now
    )
  } else {
    throw Errors.UnsupportedPricingFunction
  }
}
