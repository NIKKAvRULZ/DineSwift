// Current exchange rate (1 USD = 315 LKR as of 2024)
const USD_TO_LKR_RATE = 315;

export const convertToLKR = (usdAmount) => {
    const lkrAmount = usdAmount * USD_TO_LKR_RATE;
    return `Rs. ${lkrAmount.toLocaleString('en-LK')}`;
};