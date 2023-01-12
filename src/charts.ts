import { AuctionPricingFunction } from "./build";

export function getChartData(
    minimumPrice: number,
    maximumPrice: number,
    startsAt: number,
    endsAt: number,
    func: AuctionPricingFunction,
    pointsNumber: number = 1000,
    amplifier: number = 1) {
    if (pointsNumber <= 0) {
        throw new Error('Points number cannot be 0 or negative value')
    }
    
    const points: Array<{ x: number; y: number }> = [];

    const startDate = new Date(startsAt).getTime();
    const endDate = new Date(endsAt).getTime();

    const startSeconds = 0;
    const endSeconds = endDate - startDate;
    const timeInterval = Math.floor((endSeconds - startSeconds) / pointsNumber);

    switch (func) {
        case AuctionPricingFunction.LINEAR:
            const { p, q } = getLinearFunctionParams(minimumPrice, maximumPrice, startSeconds, endSeconds);
            for (let x = startSeconds; x <= endSeconds; x += timeInterval) {
                const y = calculateLinearFunctionAtPoint(p, q, x);
                points.push({
                    x: startDate + x * pointsNumber,
                    y,
                });
            }

            break;

        case AuctionPricingFunction.EXPONENTIAL:
            const { a, b } = getExponentialFunctionParams(minimumPrice, maximumPrice, startSeconds, endSeconds);
            for (let x = startSeconds; x <= endSeconds; x += timeInterval) {
                const y = calculateExponentialFunctionAtPoint(a, b, x, amplifier);
                points.push({
                    x: startDate + x * pointsNumber,
                    y,
                });
            }

            break;
    }

    return points;
}

export function getCurrentPrice(
    minimumPrice: number,
    maximumPrice: number,
    startsAt: number,
    endsAt: number,
    func: AuctionPricingFunction,
    currentTime: number,
    amplifier: number = 1) {
    const startDate = new Date(startsAt).getTime();
    const endDate = new Date(endsAt).getTime();

    const startSeconds = 0;
    const endSeconds = endDate - startDate;
    const currentSecond = new Date(currentTime).getTime() - startDate;

    switch (func) {
        case AuctionPricingFunction.LINEAR:
            const { p, q } = getLinearFunctionParams(minimumPrice, maximumPrice, startSeconds, endSeconds);
            return calculateLinearFunctionAtPoint(p, q, currentSecond);

        case AuctionPricingFunction.EXPONENTIAL:
            const { a, b } = getExponentialFunctionParams(minimumPrice, maximumPrice, startSeconds, endSeconds);
            return calculateExponentialFunctionAtPoint(a, b, currentSecond, amplifier);
    }
}

function getExponentialFunctionParams(
    minimumPrice: number,
    maximumPrice: number,
    startSeconds: number,
    endSeconds: number) {
    if (minimumPrice === 0 || minimumPrice == null) {
        return { a: 0, b: 0 };
    }

    const b = Math.pow(
        maximumPrice / minimumPrice,
        1 / (endSeconds - startSeconds),
    );
    const a = minimumPrice / Math.pow(b, startSeconds);

    return { a, b };
}

function calculateExponentialFunctionAtPoint(a: number, b: number, x: number, amplifier: number) {
    const y = a * Math.pow(b, x * amplifier);
    return y;
}

function getLinearFunctionParams(
    minimumPrice: number,
    maximumPrice: number,
    startSeconds: number,
    endSeconds: number) {
    const p = (maximumPrice - minimumPrice) / (endSeconds - startSeconds);
    const q = minimumPrice - p * startSeconds;

    return { p, q };
}

function calculateLinearFunctionAtPoint(p: number, q: number, x: number) {
    const y = p * x + q;
    return y;
}