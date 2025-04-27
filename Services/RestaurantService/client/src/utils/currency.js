export const convertToLKR = (amount) => {
    // Now we're working directly with LKR amounts, no conversion needed
    return `Rs. ${Math.round(amount).toLocaleString('en-LK')}`;
};