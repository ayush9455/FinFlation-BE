const asyncHandler = require("express-async-handler");

const getSip = asyncHandler(async (req, res) => {
    console.log(`The Request Body is`, req.body);
    const { sip, roi, months, inflationRate = 0 } = req.body;

    // Input validation
    const monthlyInvestment = parseFloat(sip);
    const annualRate = parseFloat(roi);
    const tenure = parseInt(months, 10);
    const inflation = parseFloat(inflationRate);

    if (isNaN(monthlyInvestment) || monthlyInvestment <= 0) {
        res.status(400);
        throw new Error("Invalid SIP amount. Please provide a valid number.");
    }
    if (isNaN(annualRate) || annualRate <= 0) {
        res.status(400);
        throw new Error("Invalid rate of interest. Please provide a valid number.");
    }
    if (isNaN(tenure) || tenure <= 0) {
        res.status(400);
        throw new Error("Invalid number of months. Please provide a valid number.");
    }
    if (isNaN(inflation) || inflation < 0) {
        res.status(400);
        throw new Error("Invalid inflation rate. Please provide a valid number.");
    }

    // Convert annual ROI to monthly rate (in decimal)
    const monthlyRate = annualRate / (12 * 100);
    const inflationRateMonthly = inflation / (12 * 100);

    let totalInvestment = 0;
    let totalReturns = 0;
    let totalAmount = 0;
    const yearDetails = [];
    let inflatedAdjustedTotalValue = 0;
    const fullYears = Math.floor(tenure / 12);
    const remainingMonths = tenure % 12;

    for (let i = 1; i <= fullYears; i++) {
        // Calculate SIP for the current year
        const compoundedAmount =
            monthlyInvestment * ((Math.pow(1 + monthlyRate, i * 12) - 1) / monthlyRate) * (1 + monthlyRate);

        // Total investment up to this year
        totalInvestment += monthlyInvestment * 12;

        // Returns generated till this year
        const returnAmount = compoundedAmount - totalInvestment;

        // Yearly inflated SIP for this year (monthly multiplied by 12, adjusted for inflation)
        const inflatedYearlySIP =
            i === 1
                ? monthlyInvestment * 12 // No inflation adjustment for the first year
                : (monthlyInvestment * 12) / Math.pow(1 + inflationRateMonthly, (i - 1) * 12);

        const inflatedMonthlySIP = inflatedYearlySIP / 12;

        // Adjusted compounded amount for inflation
        const inflatedTotalValue =
            i === 1
                ? compoundedAmount
                : compoundedAmount / Math.pow(1 + inflationRateMonthly, i * 12);

        inflatedAdjustedTotalValue = inflatedTotalValue;
        totalReturns = returnAmount;
        totalAmount = compoundedAmount;
        // Store year-by-year details
        yearDetails.push({
            year: i,
            investedAmount: totalInvestment.toFixed(2), // Total invested up to this year
            totalAmount: compoundedAmount.toFixed(2),  // Compounded amount till now
            returns: returnAmount.toFixed(2),          // Returns till this year
            monthlySIP: monthlyInvestment.toFixed(2),  // Monthly SIP amount
            inflatedAdjustedMonthlySIP: inflatedMonthlySIP.toFixed(2), // Inflated monthly SIP for this year
            inflatedAdjustedTotalValue: inflatedTotalValue.toFixed(2), // Adjusted for inflation
        });
    }

    // Handle remaining months as part of the next year
    if (remainingMonths > 0) {
        const lastYearIndex = fullYears + 1;

        // Calculate compound interest for the remaining months
        const compoundedAmount =
            monthlyInvestment * ((Math.pow(1 + monthlyRate, tenure) - 1) / monthlyRate) * (1 + monthlyRate);

        // Total investment including the remaining months
        totalInvestment += monthlyInvestment * remainingMonths;

        // Returns generated till the remaining months
        const returnAmount = compoundedAmount - totalInvestment;

        // Adjust for inflation (real value of compounded amount in today's terms)
        const inflatedTotalValue = compoundedAmount / Math.pow(1 + inflationRateMonthly, tenure);

        // Yearly inflated SIP for the remaining months
        const inflatedYearlySIP =
            (monthlyInvestment * remainingMonths) /
            Math.pow(1 + inflationRateMonthly, fullYears * 12);

        const inflatedMonthlySIP = inflatedYearlySIP / remainingMonths;
        inflatedAdjustedTotalValue = inflatedTotalValue;
        totalReturns = returnAmount;
        totalAmount = compoundedAmount;
        // Store details for the remaining months as part of the next year
        yearDetails.push({
            year: lastYearIndex,
            investedAmount: totalInvestment.toFixed(2), // Total invested including remaining months
            totalAmount: compoundedAmount.toFixed(2),  // Compounded amount including remaining months
            returns: returnAmount.toFixed(2),          // Returns till this point
            monthlySIP: monthlyInvestment.toFixed(2),  // Monthly SIP amount
            inflatedAdjustedMonthlySIP: inflatedMonthlySIP.toFixed(2), // Inflated monthly SIP for the remaining months
            inflatedAdjustedTotalValue: inflation > 0 ? inflatedTotalValue.toFixed(2) : null, // Adjusted for inflation
        });
    }

    console.log("Sending success response");
    res.status(200).json({
        message: "SIP Calculation Successful",
        error: false,
        totalInvestment: totalInvestment.toFixed(2),
        totalReturns: totalReturns.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        inflatedAdjustedTotalValue: inflatedAdjustedTotalValue.toFixed(2),
        yearDetails, // Send year-wise details, including remaining months
    });
});


module.exports = { getSip };