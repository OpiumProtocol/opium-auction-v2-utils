export enum AuctionPricingFunction {
  LINEAR,
  EXPONENTIAL
}

export enum AuctionPricingDirection {
  INCREASING,
  DECREASING
}

export type BuildOrderParams = {
  makerAssetAddress: string
  takerAssetAddress: string
  makerAddress: string
  makerAmount: string
  nonce: number
  permit?: string
}

export type BuildAuctionParams = {
  pricingFunction: AuctionPricingFunction
  pricingDirection: AuctionPricingDirection
  partialFill: boolean
  minTakerAmount: string
  maxTakerAmount: string
  startedAt: number
  endedAt: number
  amplifier?: number
}
