const asyncHandler = require("express-async-handler");

const getEmi = asyncHandler(async (req, res) => {
    console.log(`The Request Body is`, req.body);
    const { loanAmount, roi, months, inflationRate = 0 } = req.body;

    // Input validation
    const principal = parseFloat(loanAmount);
    const interestRate = parseFloat(roi);
    const tenure = parseInt(months, 10);
    const inflation = parseFloat(inflationRate);

    if (isNaN(principal) || principal <= 0) {
        res.status(400);
        throw new Error("Invalid loan amount. Please provide a valid number.");
    }
    if (isNaN(interestRate) || interestRate <= 0) {
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
    const monthlyRate = interestRate / (12 * 100);

    // Calculate EMI
    const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1);

    let remainingPrincipal = principal;
    let totalInterestPaid = 0;
    const monthDetails = [];
    let yearIndex = 0;
    let deflatedEmi = emi; // Initially set to the original EMI for the first year

    for (let i = 1; i <= tenure; i++) {
        // At the beginning of each year, recalculate deflated EMI
        if ((i - 1) % 12 === 0) {
            yearIndex++;
            deflatedEmi =
                inflationRate > 0 && yearIndex > 1
                    ? emi / Math.pow(1 + inflationRate / 100, yearIndex - 1)
                    : emi;
        }

        const interestPaid = remainingPrincipal * monthlyRate;
        const principalPaid = emi - interestPaid;
        remainingPrincipal -= principalPaid;
        totalInterestPaid += interestPaid;

        // Store month-by-month details
        const monthDetail = {
            month: i,
            emi: emi.toFixed(2),
            interestPaid: interestPaid.toFixed(2),
            principalPaid: principalPaid.toFixed(2),
            remainingPrincipal: remainingPrincipal >= 0 ? remainingPrincipal.toFixed(2) : "0.00",
            inflationAdjustedEmi: deflatedEmi.toFixed(2), // Same deflated EMI for all months in the year
            year: yearIndex,
        };

        monthDetails.push(monthDetail);
    }

    // Total payment
    const totalPayment = emi * tenure;

    console.log("Sending success response");
    res.status(200).json({
        message: "EMI Calculation Successful",
        error: false,
        emi: emi.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        totalInterestPaid: totalInterestPaid.toFixed(2),
        roundOffAdjustment: Math.abs(totalPayment.toFixed(2) - (emi * months)).toFixed(4),
        monthDetails, // Month-by-month details including deflated EMI
    });
});


module.exports = { getEmi };