import { AuctionFunction } from "./types";

export function getChartData(
    minimumPrice: number,
    maximumPrice: number,
    startsAt: number,
    endsAt: number,
    func: AuctionFunction,
    pointsNumber: number = 1000) {
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
        case AuctionFunction.linear:
            const { p, q } = getLinearFunctionParams(minimumPrice, maximumPrice, startSeconds, endSeconds);
            for (let x = startSeconds; x <= endSeconds; x += timeInterval) {
                const y = calculateLinearFunctionAtPoint(p, q, x);
                points.push({
                    x: startDate + x * 1000,
                    y,
                });
            }

            break;

        case AuctionFunction.exponential:
            const { a, b } = getExponentialFunctionParams(minimumPrice, maximumPrice, startSeconds, endSeconds);
            for (let x = startSeconds; x <= endSeconds; x += timeInterval) {
                const y = calculateExponentialFunctionAtPoint(a, b, x);
                points.push({
                    x: startDate + x * 1000,
                    y,
                });
            }

            break;
    }

    return points;
}

function getExponentialFunctionParams(
    minimumPrice: number,
    maximumPrice: number,
    startSeconds: number,
    endSeconds: number) {
    // minimum price cannot be 0
    minimumPrice = minimumPrice || 0.0000001;

    const b = Math.pow(
        maximumPrice / minimumPrice,
        1 / (endSeconds - startSeconds),
    );
    const a = minimumPrice / Math.pow(b, startSeconds);

    return { a, b };
}

function calculateExponentialFunctionAtPoint(a: number, b: number, x: number) {
    const y = a * Math.pow(b, x);
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