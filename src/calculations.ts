import { LimitOrder, LimitOrderBuilder, LimitOrderProtocolFacade } from "@1inch/limit-order-protocol";

export async function getRemainingAmount(options: {
    limitOrderProtocolFacade: LimitOrderProtocolFacade,
    limitOrderBuilder: LimitOrderBuilder,
    limitOrder: LimitOrder,
}) {
    const { limitOrderProtocolFacade, limitOrderBuilder, limitOrder } = options;

    const limitOrderTypedData = limitOrderBuilder.buildLimitOrderTypedData(limitOrder)
    const orderHash = limitOrderBuilder.buildLimitOrderHash(limitOrderTypedData)

    try {
        const remaining = await limitOrderProtocolFacade.remaining(
            orderHash
        );

        return remaining.toString();
    } catch (error: any) {
        const errorMessage = typeof error === 'string' ? error : error.message;

        if (errorMessage.includes('LOP: Unknown order')) {
            return limitOrder.makingAmount;
        }

        throw error;
    }
}