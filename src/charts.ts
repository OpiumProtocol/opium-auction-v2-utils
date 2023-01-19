import { ethers, BigNumber } from "ethers";

import { getLinearAuctionTakerAmount, getExponentialAuctionTakerAmount } from "./pricing";
import Errors from "./errors";
import {
  AuctionPricingFunction, AuctionPricingDirection,
  BuildOrderParams, BuildAuctionParams
} from "./types";

export function getChartData(
  order: BuildOrderParams,
  auction: BuildAuctionParams,
  makerAmountDecimals: number,
  numberOfPoints: number
) {  
  const points: Array<{ x: number; y: BigNumber }> = []

  const numberOfSeconds = auction.endedAt - auction.startedAt
  const timeInterval = ~~(numberOfSeconds / numberOfPoints)

  for (let x = auction.startedAt; x <= auction.endedAt; x += timeInterval) {
    points.push({
      x,
      y: getPriceAt(order, auction, makerAmountDecimals, x),
    })
  }

  return points
}

function getPriceAt(
  order: BuildOrderParams,
  auction: BuildAuctionParams,
  makerAmountDecimals: number,
  now: number
): BigNumber {
  const ONE = ethers.utils.parseUnits("1", makerAmountDecimals)

  if (auction.pricingFunction === AuctionPricingFunction.LINEAR) {
    return getLinearAuctionTakerAmount(
      BigNumber.from(order.makerAmount),
      BigNumber.from(auction.maxTakerAmount),
      BigNumber.from(auction.minTakerAmount),
      auction.startedAt,
      auction.endedAt,
      auction.pricingDirection === AuctionPricingDirection.INCREASING,
      ONE,
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
      ONE,
      now
    )
  } else {
    throw Errors.UnsupportedPricingFunction
  }
}

export function getCurrentPrice(
  order: BuildOrderParams,
  auction: BuildAuctionParams,
  makerAmountDecimals: number,
): BigNumber {
  const now = ~~(Date.now() / 1000)
  return getPriceAt(order, auction, makerAmountDecimals, now)
}
