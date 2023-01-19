import { ethers } from 'ethers'
import { expect } from 'chai'

import {
  BuildOrderParams, BuildAuctionParams,
  AuctionPricingDirection, AuctionPricingFunction,
  getChartData
} from '../src'

describe('Charts', () => {
  it('should correctly calculate linear increasing chart', () => {
    const makerAmountDecimals = 18
    const takerAmountDecimals = 6

    const buildOrder: BuildOrderParams = {
      makerAssetAddress: ethers.constants.AddressZero,
      takerAssetAddress: ethers.constants.AddressZero,
      makerAddress: ethers.constants.AddressZero,
      makerAmount: ethers.utils.parseEther('1').toString(),
      nonce: 0
    }

    const buildAuction: BuildAuctionParams = {
      pricingFunction: AuctionPricingFunction.EXPONENTIAL,
      pricingDirection: AuctionPricingDirection.INCREASING,
      partialFill: true,
      minTakerAmount: ethers.utils.parseUnits('1500', takerAmountDecimals).toString(),
      maxTakerAmount: ethers.utils.parseUnits('3000', takerAmountDecimals).toString(),
      startedAt: 0,
      endedAt: 600,
      amplifier: 100
    }

    const chartData = getChartData(buildOrder, buildAuction, makerAmountDecimals, 20)
    console.log({ chartData: chartData.map(elem => ({...elem, y: elem.y.toString() })) })
  })
})
