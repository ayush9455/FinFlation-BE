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
    const monthDetails = [];

    for (let i = 1; i <= tenure; i++) {
        // Calculate compound interest for SIP for the current month
        const compoundedAmount =
            monthlyInvestment * ((Math.pow(1 + monthlyRate, i) - 1) / monthlyRate) * (1 + monthlyRate);

        // Total investment up to this month
        totalInvestment += monthlyInvestment;

        // Returns generated till this month
        const returnAmount = compoundedAmount - totalInvestment;

        // Adjust for inflation (real value of compounded amount in today's terms)
        const inflatedTotalValue = compoundedAmount / Math.pow(1 + inflationRateMonthly, i);

        // Track total compounded returns
        totalReturns = returnAmount;
        totalAmount = compoundedAmount;

        // Store month-by-month details
        monthDetails.push({
            month: i,
            investedAmount: totalInvestment.toFixed(2), // Total invested up to this point
            totalAmount: compoundedAmount.toFixed(2),  // Compounded amount till now
            returns: returnAmount.toFixed(2),          // Returns till this month
            inflatedTotalValue: inflation > 0 ? inflatedTotalValue.toFixed(2) : null, // Adjusted for inflation
        });
    }


    console.log("Sending success response");
    res.status(200).json({
        message: "SIP Calculation Successful",
        error: false,
        totalInvestment: totalInvestment.toFixed(2),
        totalReturns: totalReturns.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        monthDetails,
    });
});

module.exports = { getSip };