export function calculateMonthlyPayment(
  principal,
  annualRate,
  termYears,
  isInterestOnly = false,
  interestOnlyPeriod = 0
) {
  if (isInterestOnly && interestOnlyPeriod > 0) {
    // For interest-only period, just return interest payment
    return (principal * annualRate) / 12;
  }
  
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) return principal / numPayments;
  
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

export function calculateLoanBalance(
  principal,
  annualRate,
  termYears,
  paymentsMade,
  isInterestOnly = false,
  interestOnlyPeriod = 0
) {
  const monthlyRate = annualRate / 12;
  const totalPayments = termYears * 12;
  
  if (paymentsMade >= totalPayments) return 0;
  
  if (isInterestOnly && paymentsMade <= interestOnlyPeriod * 12) {
    return principal; // No principal reduction during interest-only period
  }
  
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears, false);
  const remainingPayments = totalPayments - paymentsMade;
  
  if (monthlyRate === 0) {
    return Math.max(0, principal - (monthlyPayment * paymentsMade));
  }
  
  return monthlyPayment * (1 - Math.pow(1 + monthlyRate, -remainingPayments)) / monthlyRate;
}

export function generateSDEProjections(forecast, years = 10) {
  const projections = [];
  
  switch (forecast.type) {
    case 'single':
      for (let i = 0; i < years; i++) {
        projections.push(forecast.baseAmount || 0);
      }
      break;
      
    case 'growth':
      const baseAmount = forecast.baseAmount || 0;
      const growthRate = (forecast.growthRate || 0) / 100;
      for (let i = 0; i < years; i++) {
        projections.push(baseAmount * Math.pow(1 + growthRate, i));
      }
      break;
      
    case 'yearly':
      const yearlyAmounts = forecast.yearlyAmounts || [];
      for (let i = 0; i < years; i++) {
        projections.push(yearlyAmounts[i] || 0);
      }
      break;
  }
  
  return projections;
}

export function calculateEarnout(
  sde,
  year,
  earnout,
  totalEarnoutPaid = 0
) {
  if (!earnout) return 0;
  
  let earnoutAmount = 0;
  
  switch (earnout.type) {
    case 'fixed':
      earnoutAmount = earnout.amount || 0;
      break;
      
    case 'percentage':
      earnoutAmount = sde * ((earnout.percentage || 0) / 100);
      break;
      
    case 'conditional':
      if (sde > (earnout.threshold || 0)) {
        earnoutAmount = earnout.amount || 0;
      }
      break;
  }
  
  // Apply cap if specified
  if (earnout.cap && totalEarnoutPaid + earnoutAmount > earnout.cap) {
    earnoutAmount = Math.max(0, earnout.cap - totalEarnoutPaid);
  }
  
  return earnoutAmount;
}

export function calculateSellerEarnout(
  sde,
  year,
  source,
  totalEarnoutPaid = 0,
  availableCashFlow = 0
) {
  if (source.type !== 'seller_earnout' || !source.term || year > source.term) {
    return { payment: 0, balance: 0 };
  }

  let earnoutPayment = 0;
  const annualEarnout = source.amount / source.term;

  switch (source.earnoutType) {
    case 'fixed':
      earnoutPayment = annualEarnout;
      break;
      
    case 'percentage':
      earnoutPayment = sde * ((source.earnoutPercentage || 0) / 100);
      break;
      
    case 'conditional':
      if (sde > (source.earnoutThreshold || 0)) {
        earnoutPayment = annualEarnout;
      }
      break;
      
    default:
      earnoutPayment = annualEarnout;
  }

  // Apply cap if specified
  if (source.earnoutCap && totalEarnoutPaid + earnoutPayment > source.earnoutCap) {
    earnoutPayment = Math.max(0, source.earnoutCap - totalEarnoutPaid);
  }

  // Only pay if there's sufficient cash flow
  earnoutPayment = Math.min(earnoutPayment, Math.max(0, availableCashFlow));

  // Calculate remaining balance
  const totalPaid = totalEarnoutPaid + earnoutPayment;
  const balance = Math.max(0, source.amount - totalPaid);

  return { payment: earnoutPayment, balance };
}

export function calculateProjections(
  businessPrice,
  fundingSources,
  sdeForecast,
  earnoutOption,
  years = 10
) {
  const sdeProjections = generateSDEProjections(sdeForecast, years);
  const projections = [];
  
  let totalEarnoutPaid = 0;
  let totalSellerEarnoutPaid = 0;

  for (let year = 1; year <= years; year++) {
    const yearIndex = year - 1;
    const sde = sdeProjections[yearIndex];
    
    // Calculate loan payments and balances (excluding seller earnout)
    let sbaPayment = 0, sellerNotePayment = 0, otherLoanPayment = 0;
    let sbaBalance = 0, sellerNoteBalance = 0, otherLoanBalance = 0;
    
    fundingSources.forEach(source => {
      if (source.amount <= 0 || !source.term || source.type === 'seller_earnout' || source.type === 'down_payment') return;
      
      // Check if loan term has ended
      if (year > source.term) {
        // Loan is paid off, no more payments or balance
        return;
      }
      
      const monthlyPayment = calculateMonthlyPayment(
        source.amount,
        (source.interestRate || 0) / 100,
        source.term,
        source.isInterestOnly,
        source.interestOnlyPeriod
      );
      
      const annualPayment = monthlyPayment * 12;
      const balance = calculateLoanBalance(
        source.amount,
        (source.interestRate || 0) / 100,
        source.term,
        (year - 1) * 12,
        source.isInterestOnly,
        source.interestOnlyPeriod
      );
      
      switch (source.type) {
        case 'sba':
          sbaPayment = annualPayment;
          sbaBalance = balance;
          break;
        case 'seller_note':
          sellerNotePayment = annualPayment;
          sellerNoteBalance = balance;
          break;
        case 'other_loan':
          otherLoanPayment = annualPayment;
          otherLoanBalance = balance;
          break;
      }
    });
    
    const totalDebtService = sbaPayment + sellerNotePayment + otherLoanPayment;
    
    // Calculate earnout from original earnout option
    const earnout = calculateEarnout(sde, year, earnoutOption, totalEarnoutPaid);
    totalEarnoutPaid += earnout;
    
    // Calculate available cash flow after debt service and earnout
    const availableCashFlow = sde - totalDebtService - earnout;
    
    // Calculate seller earnout payment (only if cash flow is available)
    let sellerEarnoutPayment = 0;
    let sellerEarnoutBalance = 0;
    
    const sellerEarnoutSource = fundingSources.find(s => s.type === 'seller_earnout');
    if (sellerEarnoutSource) {
      const earnoutResult = calculateSellerEarnout(
        sde, 
        year, 
        sellerEarnoutSource, 
        totalSellerEarnoutPaid, 
        availableCashFlow
      );
      sellerEarnoutPayment = earnoutResult.payment;
      sellerEarnoutBalance = earnoutResult.balance;
      totalSellerEarnoutPaid += sellerEarnoutPayment;
    }
    
    const netCashFlow = availableCashFlow - sellerEarnoutPayment;
    const dscr = totalDebtService > 0 ? sde / totalDebtService : 0;
    
    projections.push({
      year,
      sde,
      sbaPayment,
      sellerNotePayment,
      otherLoanPayment,
      sellerEarnoutPayment,
      totalDebtService,
      netCashFlow,
      dscr,
      sbaBalance,
      sellerNoteBalance,
      otherLoanBalance,
      sellerEarnoutBalance
    });
  }
  
  // Calculate summary
  const totalSDE = projections.reduce((sum, p) => sum + p.sde, 0);
  const totalDebtService = projections.reduce((sum, p) => sum + p.totalDebtService, 0);
  const totalEarnout = projections.reduce((sum, p) => sum + p.sellerEarnoutPayment, 0) + totalEarnoutPaid;
  const totalNetCashFlow = projections.reduce((sum, p) => sum + p.netCashFlow, 0);
  const validDSCRs = projections.filter(p => p.dscr > 0).map(p => p.dscr);
  const averageDSCR = validDSCRs.length > 0 ? validDSCRs.reduce((sum, dscr) => sum + dscr, 0) / validDSCRs.length : 0;
  
  return {
    projections,
    summary: {
      totalSDE,
      totalDebtService,
      totalEarnout,
      totalNetCashFlow,
      averageDSCR
    }
  };
}

export function validateFundingSources(sources, businessPrice) {
  const totalPercentage = sources.reduce((sum, source) => sum + source.percentage, 0);
  return Math.abs(totalPercentage - 100) < 0.01; // Allow for small rounding errors
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}