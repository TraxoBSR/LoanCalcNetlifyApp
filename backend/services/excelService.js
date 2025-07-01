import ExcelJS from 'exceljs';

export async function generateExcelReport(userData, inputs, results) {
  const workbook = new ExcelJS.Workbook();
  
  // Set workbook properties
  workbook.creator = 'Business Loan Calculator';
  workbook.lastModifiedBy = 'Business Loan Calculator';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Add title
  summarySheet.mergeCells('A1:F1');
  summarySheet.getCell('A1').value = 'Business Loan Analysis Report';
  summarySheet.getCell('A1').font = { size: 18, bold: true };
  summarySheet.getCell('A1').alignment = { horizontal: 'center' };

  // Add user info
  summarySheet.getCell('A3').value = 'Prepared for:';
  summarySheet.getCell('B3').value = userData.name;
  summarySheet.getCell('A4').value = 'Email:';
  summarySheet.getCell('B4').value = userData.email;
  summarySheet.getCell('A5').value = 'Date:';
  summarySheet.getCell('B5').value = new Date().toLocaleDateString();

  // Add business details
  summarySheet.getCell('A7').value = 'Business Purchase Price:';
  summarySheet.getCell('B7').value = inputs.businessPrice;
  summarySheet.getCell('B7').numFmt = '$#,##0';

  // Add funding sources
  let row = 9;
  summarySheet.getCell(`A${row}`).value = 'Funding Sources:';
  summarySheet.getCell(`A${row}`).font = { bold: true };
  row++;

  inputs.fundingSources.forEach(source => {
    if (source.amount > 0) {
      summarySheet.getCell(`A${row}`).value = source.name;
      summarySheet.getCell(`B${row}`).value = source.amount;
      summarySheet.getCell(`B${row}`).numFmt = '$#,##0';
      summarySheet.getCell(`C${row}`).value = source.percentage / 100;
      summarySheet.getCell(`C${row}`).numFmt = '0.0%';
      row++;
    }
  });

  // Add key metrics
  row += 2;
  summarySheet.getCell(`A${row}`).value = 'Key Metrics:';
  summarySheet.getCell(`A${row}`).font = { bold: true };
  row++;

  summarySheet.getCell(`A${row}`).value = 'Total SDE (10 years):';
  summarySheet.getCell(`B${row}`).value = results.summary.totalSDE;
  summarySheet.getCell(`B${row}`).numFmt = '$#,##0';
  row++;

  summarySheet.getCell(`A${row}`).value = 'Total Debt Service:';
  summarySheet.getCell(`B${row}`).value = results.summary.totalDebtService;
  summarySheet.getCell(`B${row}`).numFmt = '$#,##0';
  row++;

  summarySheet.getCell(`A${row}`).value = 'Total Net Cash Flow:';
  summarySheet.getCell(`B${row}`).value = results.summary.totalNetCashFlow;
  summarySheet.getCell(`B${row}`).numFmt = '$#,##0';
  row++;

  summarySheet.getCell(`A${row}`).value = 'Average DSCR:';
  summarySheet.getCell(`B${row}`).value = results.summary.averageDSCR;
  summarySheet.getCell(`B${row}`).numFmt = '0.00';

  // Projections Sheet
  const projectionsSheet = workbook.addWorksheet('10-Year Projections');
  
  // Headers
  const headers = [
    'Year',
    'SDE',
    'SBA Payment',
    'Seller Note Payment',
    'Other Loan Payment',
    'Total Debt Service',
    'Seller Earnout',
    'Net Cash Flow',
    'DSCR'
  ];

  headers.forEach((header, index) => {
    const cell = projectionsSheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };
  });

  // Data rows
  results.projections.forEach((projection, index) => {
    const row = index + 2;
    projectionsSheet.getCell(row, 1).value = projection.year;
    projectionsSheet.getCell(row, 2).value = projection.sde;
    projectionsSheet.getCell(row, 3).value = projection.sbaPayment;
    projectionsSheet.getCell(row, 4).value = projection.sellerNotePayment;
    projectionsSheet.getCell(row, 5).value = projection.otherLoanPayment;
    projectionsSheet.getCell(row, 6).value = projection.totalDebtService;
    projectionsSheet.getCell(row, 7).value = projection.sellerEarnoutPayment;
    projectionsSheet.getCell(row, 8).value = projection.netCashFlow;
    projectionsSheet.getCell(row, 9).value = projection.dscr;

    // Format currency columns
    [2, 3, 4, 5, 6, 7, 8].forEach(col => {
      projectionsSheet.getCell(row, col).numFmt = '$#,##0';
    });
    
    // Format DSCR column
    projectionsSheet.getCell(row, 9).numFmt = '0.00';
  });

  // Auto-fit columns
  projectionsSheet.columns.forEach(column => {
    column.width = 15;
  });

  summarySheet.columns.forEach(column => {
    column.width = 20;
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}