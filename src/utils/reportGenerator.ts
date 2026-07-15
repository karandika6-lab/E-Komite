import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from './logoBase64';

export interface ColumnDef {
  header: string;
  key: string;
  width?: number; // for Excel
}

const applyKopSuratExcel = (worksheet: ExcelJS.Worksheet, totalCols: number) => {
  // Push existing rows down by 6 rows
  worksheet.spliceRows(1, 0, [], [], [], [], [], []);
  
  // 1. ADD LOGO (Top Left)
  try {
    const logoId = worksheet.workbook.addImage({
      base64: logoBase64,
      extension: 'jpeg',
    });
    worksheet.addImage(logoId, {
      tl: { col: 0.5, row: 0.2 },
      ext: { width: 75, height: 75 }
    });
  } catch (err) {
    console.error('Failed to add logo to excel:', err);
  }

  // Define merge range based on columns
  const endCol = totalCols > 5 ? String.fromCharCode(64 + totalCols) : 'F';
  
  // 2. KOP SURAT (Header)
  worksheet.mergeCells(`B1:${endCol}1`);
  worksheet.getCell('B1').value = "YAYASAN PONPES DARUL MA'ARIF";
  worksheet.getCell('B1').font = { name: 'Times New Roman', size: 14, bold: true };
  worksheet.getCell('B1').alignment = { horizontal: 'center' };

  worksheet.mergeCells(`B2:${endCol}2`);
  worksheet.getCell('B2').value = 'KEMENKUMHAM AHU-0011948.AH.01.04 TAHUN 2015';
  worksheet.getCell('B2').font = { name: 'Times New Roman', size: 10 };
  worksheet.getCell('B2').alignment = { horizontal: 'center' };

  worksheet.mergeCells(`B3:${endCol}3`);
  worksheet.getCell('B3').value = 'MADRASAH ALIYAH (MA) AL-ASROR SEKAMPUNG';
  worksheet.getCell('B3').font = { name: 'Times New Roman', size: 14, bold: true };
  worksheet.getCell('B3').alignment = { horizontal: 'center' };

  worksheet.mergeCells(`B4:${endCol}4`);
  worksheet.getCell('B4').value = 'Alamat : Jl. Raya Sekampung Kec. Sekampung Kab. Lampung Timur 34182';
  worksheet.getCell('B4').font = { name: 'Times New Roman', size: 10, italic: true };
  worksheet.getCell('B4').alignment = { horizontal: 'center' };

  worksheet.mergeCells(`B5:${endCol}5`);
  worksheet.getCell('B5').value = 'Email : maal_asror@yahoo.co.id';
  worksheet.getCell('B5').font = { name: 'Times New Roman', size: 10, italic: true };
  worksheet.getCell('B5').alignment = { horizontal: 'center' };

  // 3. Garis Bawah Kop (Double border if possible, or thick)
  for (let i = 1; i <= Math.max(6, totalCols); i++) {
    const cell = worksheet.getCell(5, i);
    cell.border = { bottom: { style: 'double', color: { argb: 'FF000000' } } };
  }
};

const applyKopSuratPDF = (doc: jsPDF) => {
  // Add Logo
  doc.addImage(logoBase64, 'JPEG', 40, 30, 60, 60);

  // KOP SURAT
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("YAYASAN PONPES DARUL MA'ARIF", 120, 45);

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text('KEMENKUMHAM AHU-0011948.AH.01.04 TAHUN 2015', 120, 58);

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('MADRASAH ALIYAH (MA) AL-ASROR SEKAMPUNG', 120, 72);

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.text('Alamat : Jl. Raya Sekampung Kec. Sekampung Kab. Lampung Timur 34182', 120, 85);
  doc.text('Email : maal_asror@yahoo.co.id', 120, 97);

  // Line separator
  doc.setLineWidth(1.5);
  doc.line(40, 105, 550, 105);
  doc.setLineWidth(0.5);
  doc.line(40, 108, 550, 108);
};

/**
 * Generate standard Excel file
 */
export const exportToExcel = async (title: string, columns: ColumnDef[], data: any[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title, {
    views: [{ showGridLines: false }],
    pageSetup: { paperSize: 9, orientation: 'portrait' } // paperSize 9 = A4
  });

  // Setup columns
  worksheet.columns = columns.map(c => ({
    header: c.header,
    key: c.key,
    width: c.width || 20
  }));

  // Style Title Header (optional, we'll just style the column headers)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Slate 800
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' },
      bold: true,
      size: 12,
      name: 'Arial'
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // Add Data
  data.forEach((rowObj, index) => {
    const row = worksheet.addRow(rowObj);
    row.height = 25;
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      if ((index + 1) % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });
  });

  // Apply Kop Surat
  applyKopSuratExcel(worksheet, columns.length);

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.xlsx`);
};

/**
 * Generate standard Portrait PDF file
 */
export const exportToPDF = (title: string, columns: ColumnDef[], data: any[], filename: string) => {
  // 'p' = portrait
  const doc = new jsPDF('p', 'pt', 'a4');

  // Apply Kop Surat
  applyKopSuratPDF(doc);

  // Title Document below Kop Surat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text(title, 40, 130);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 40, 145);

  // Map data to array of arrays based on columns
  const tableData = data.map(item => columns.map(col => item[col.key]));
  const tableHeaders = columns.map(col => col.header);

  autoTable(doc, {
    startY: 160,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate 50
    },
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Generate standard Excel file with Multiple Sheets
 */
export const exportMultipleSheetsToExcel = async (
  sheets: { title: string; columns: ColumnDef[]; data: any[] }[],
  filename: string
) => {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach((sheetData) => {
    const worksheet = workbook.addWorksheet(sheetData.title, {
      views: [{ showGridLines: false }],
      pageSetup: { paperSize: 9, orientation: 'portrait' } // paperSize 9 = A4
    });

    // Setup columns
    worksheet.columns = sheetData.columns.map(c => ({
      header: c.header,
      key: c.key,
      width: c.width || 20
    }));

    // Style Title Header
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' } // Slate 800
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 12,
        name: 'Arial'
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF334155' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        bottom: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } }
      };
    });

    // Add Data
    sheetData.data.forEach((rowObj, index) => {
      const row = worksheet.addRow(rowObj);
      row.height = 25;
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        if ((index + 1) % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      });
    });
    
    // Apply Kop Surat
    applyKopSuratExcel(worksheet, sheetData.columns.length);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.xlsx`);
};

export interface SummaryData {
  pemasukan: { nama: string; total: number }[];
  pengeluaran: { nama: string; total: number }[];
  totalPemasukan: number;
  totalPengeluaran: number;
  sisaKas: number;
}

/**
 * Generate Laporan Lengkap dengan Custom Rekapitulasi Sheet
 */
export const exportLaporanLengkapToExcel = async (
  summaryData: SummaryData,
  detailSheets: { title: string; columns: ColumnDef[]; data: any[] }[],
  filename: string
) => {
  const workbook = new ExcelJS.Workbook();
  
  // ============================================
  // SHEET 1: REKAPITULASI (Format Kustom)
  // ============================================
  const rekapSheet = workbook.addWorksheet('Rekapitulasi', {
    views: [{ showGridLines: false }],
    pageSetup: { paperSize: 9, orientation: 'portrait' } // A4 Portrait
  });

  // Set column widths (6 Columns for better layouting)
  rekapSheet.getColumn(1).width = 4;  // A: Margin kiri
  rekapSheet.getColumn(2).width = 15; // B: Signature Kiri
  rekapSheet.getColumn(3).width = 30; // C: Sisa Uraian (B+C = 45)
  rekapSheet.getColumn(4).width = 5;  // D: Spasi Rp
  rekapSheet.getColumn(5).width = 25; // E: Nominal / Signature Kanan
  rekapSheet.getColumn(6).width = 4;  // F: Margin kanan

  // 1. ADD LOGO (Top Left)
  try {
    const logoId = workbook.addImage({
      base64: logoBase64,
      extension: 'jpeg',
    });
    rekapSheet.addImage(logoId, {
      tl: { col: 0.5, row: 0.2 },
      ext: { width: 75, height: 75 }
    });
  } catch (err) {
    console.error('Failed to add logo to excel:', err);
  }

  // 2. KOP SURAT (Header)
  rekapSheet.mergeCells('B1:F1');
  rekapSheet.getCell('B1').value = "YAYASAN PONPES DARUL MA'ARIF";
  rekapSheet.getCell('B1').font = { name: 'Times New Roman', size: 14, bold: true };
  rekapSheet.getCell('B1').alignment = { horizontal: 'center' };

  rekapSheet.mergeCells('B2:F2');
  rekapSheet.getCell('B2').value = 'KEMENKUMHAM AHU-0011948.AH.01.04 TAHUN 2015';
  rekapSheet.getCell('B2').font = { name: 'Times New Roman', size: 10 };
  rekapSheet.getCell('B2').alignment = { horizontal: 'center' };

  rekapSheet.mergeCells('B3:F3');
  rekapSheet.getCell('B3').value = 'MADRASAH ALIYAH (MA) AL-ASROR SEKAMPUNG';
  rekapSheet.getCell('B3').font = { name: 'Times New Roman', size: 14, bold: true };
  rekapSheet.getCell('B3').alignment = { horizontal: 'center' };

  rekapSheet.mergeCells('B4:F4');
  rekapSheet.getCell('B4').value = 'Desa Sumbersari Kecamatan Sekampung Kabupaten Lampung Timur';
  rekapSheet.getCell('B4').font = { name: 'Times New Roman', size: 11 };
  rekapSheet.getCell('B4').alignment = { horizontal: 'center' };

  rekapSheet.mergeCells('B5:F5');
  rekapSheet.getCell('B5').value = 'Sekretariat: Jln. Lapangan Merdeka Desa Sumbersari Kec. Sekampung Kab. Lampung Timur Kode Pos 34182';
  rekapSheet.getCell('B5').font = { name: 'Times New Roman', size: 9, italic: true };
  rekapSheet.getCell('B5').alignment = { horizontal: 'center' };

  // Garis bawah tebal (Kop)
  rekapSheet.mergeCells('A6:F6');
  rekapSheet.getCell('A6').border = { bottom: { style: 'thick' } };
  
  // 3. JUDUL LAPORAN
  rekapSheet.mergeCells('A8:F8');
  rekapSheet.getCell('A8').value = 'REKAPITULASI KOMITE MADRASAH';
  rekapSheet.getCell('A8').font = { name: 'Arial', size: 12, bold: true };
  rekapSheet.getCell('A8').alignment = { horizontal: 'center' };
  
  rekapSheet.mergeCells('A9:F9');
  rekapSheet.getCell('A9').value = 'MADRASAH ALIYAH AL-ASROR';
  rekapSheet.getCell('A9').font = { name: 'Arial', size: 12, bold: true };
  rekapSheet.getCell('A9').alignment = { horizontal: 'center' };
  
  rekapSheet.mergeCells('A10:F10');
  rekapSheet.getCell('A10').value = 'T.A ' + new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);
  rekapSheet.getCell('A10').font = { name: 'Arial', size: 11, bold: true };
  rekapSheet.getCell('A10').alignment = { horizontal: 'center' };

  const setBorder = (cell: any) => {
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  };

  const setCurrencyStyle = (cell: any) => {
    cell.numFmt = '#,##0';
    cell.alignment = { horizontal: 'right' };
  };

  // Helper untuk merge dan set border pada Uraian
  const createDataRow = (row: number, kategori: string, nominal: number | string, isHeader = false) => {
    rekapSheet.mergeCells(`B${row}:C${row}`);
    rekapSheet.getCell(`B${row}`).value = kategori;
    if (isHeader) rekapSheet.getCell(`B${row}`).font = { bold: true };
    
    rekapSheet.getCell(`D${row}`).value = nominal === '' ? '' : 'Rp';
    if (isHeader) rekapSheet.getCell(`D${row}`).font = { bold: true };
    
    rekapSheet.getCell(`E${row}`).value = nominal;
    if (isHeader) rekapSheet.getCell(`E${row}`).font = { bold: true };
    if (nominal !== '') setCurrencyStyle(rekapSheet.getCell(`E${row}`));

    setBorder(rekapSheet.getCell(`B${row}`));
    setBorder(rekapSheet.getCell(`C${row}`)); // Need to border the merged part too
    setBorder(rekapSheet.getCell(`D${row}`));
    setBorder(rekapSheet.getCell(`E${row}`));
  };

  let currentRow = 13;

  // ==================== DANA MASUK ====================
  rekapSheet.getCell(`A${currentRow}`).value = 'A';
  rekapSheet.getCell(`A${currentRow}`).font = { bold: true };
  rekapSheet.mergeCells(`B${currentRow}:C${currentRow}`);
  rekapSheet.getCell(`B${currentRow}`).value = 'DANA MASUK';
  rekapSheet.getCell(`B${currentRow}`).font = { bold: true };
  currentRow++;

  createDataRow(currentRow, 'Saldo Awal', 0);
  currentRow++;

  summaryData.pemasukan.forEach(item => {
    createDataRow(currentRow, item.nama, item.total);
    currentRow++;
  });

  createDataRow(currentRow, 'JUMLAH', summaryData.totalPemasukan, true);
  currentRow += 2;

  // ==================== PENGELUARAN ====================
  rekapSheet.getCell(`A${currentRow}`).value = 'B';
  rekapSheet.getCell(`A${currentRow}`).font = { bold: true };
  rekapSheet.mergeCells(`B${currentRow}:C${currentRow}`);
  rekapSheet.getCell(`B${currentRow}`).value = 'PENGELUARAN';
  rekapSheet.getCell(`B${currentRow}`).font = { bold: true };
  currentRow++;

  summaryData.pengeluaran.forEach(item => {
    createDataRow(currentRow, item.nama, item.total);
    currentRow++;
  });

  createDataRow(currentRow, 'JUMLAH', summaryData.totalPengeluaran, true);
  currentRow += 2;

  // ==================== SISA KAS ====================
  rekapSheet.mergeCells(`B${currentRow}:C${currentRow}`);
  rekapSheet.getCell(`B${currentRow}`).value = 'SISA KAS Sementara';
  rekapSheet.getCell(`B${currentRow}`).font = { italic: true };
  rekapSheet.getCell(`D${currentRow}`).value = 'Rp';
  rekapSheet.getCell(`E${currentRow}`).value = summaryData.sisaKas;
  setBorder(rekapSheet.getCell(`B${currentRow}`));
  setBorder(rekapSheet.getCell(`C${currentRow}`));
  setBorder(rekapSheet.getCell(`D${currentRow}`));
  setBorder(rekapSheet.getCell(`E${currentRow}`));
  setCurrencyStyle(rekapSheet.getCell(`E${currentRow}`));
  currentRow++;

  rekapSheet.mergeCells(`B${currentRow}:C${currentRow}`);
  rekapSheet.getCell(`B${currentRow}`).value = 'Piutang Komite';
  rekapSheet.getCell(`B${currentRow}`).font = { italic: true };
  rekapSheet.getCell(`D${currentRow}`).value = '';
  rekapSheet.getCell(`E${currentRow}`).value = '';
  setBorder(rekapSheet.getCell(`B${currentRow}`));
  setBorder(rekapSheet.getCell(`C${currentRow}`));
  setBorder(rekapSheet.getCell(`D${currentRow}`));
  setBorder(rekapSheet.getCell(`E${currentRow}`));
  currentRow++;

  rekapSheet.mergeCells(`B${currentRow}:C${currentRow}`);
  rekapSheet.getCell(`B${currentRow}`).value = 'Sisa Kas';
  rekapSheet.getCell(`D${currentRow}`).value = 'Rp';
  rekapSheet.getCell(`E${currentRow}`).value = summaryData.sisaKas;
  setBorder(rekapSheet.getCell(`B${currentRow}`));
  setBorder(rekapSheet.getCell(`C${currentRow}`));
  setBorder(rekapSheet.getCell(`D${currentRow}`));
  setBorder(rekapSheet.getCell(`E${currentRow}`));
  setCurrencyStyle(rekapSheet.getCell(`E${currentRow}`));
  
  currentRow += 3;

  // ==================== TANDA TANGAN ====================
  // Tempat dan Tanggal (Kanan)
  rekapSheet.getCell(`E${currentRow}`).value = `Sekampung, ${new Date().toLocaleDateString('id-ID')}`;
  rekapSheet.getCell(`E${currentRow}`).alignment = { horizontal: 'center' };
  currentRow++;
  
  // Jabatan (Kiri - Kanan)
  rekapSheet.getCell(`B${currentRow}`).value = 'Kepala Madrasah';
  rekapSheet.getCell(`B${currentRow}`).alignment = { horizontal: 'center' };
  
  rekapSheet.getCell(`E${currentRow}`).value = 'Bendahara Komite';
  rekapSheet.getCell(`E${currentRow}`).alignment = { horizontal: 'center' };
  
  currentRow += 4; // Spasi untuk ttd
  
  // Nama Terang (Kiri - Kanan)
  rekapSheet.getCell(`B${currentRow}`).value = 'HERNAWAN, M.Pd';
  rekapSheet.getCell(`B${currentRow}`).font = { bold: true };
  rekapSheet.getCell(`B${currentRow}`).alignment = { horizontal: 'center' };
  
  rekapSheet.getCell(`E${currentRow}`).value = 'ARMIDI, S.Pd.I';
  rekapSheet.getCell(`E${currentRow}`).font = { bold: true };
  rekapSheet.getCell(`E${currentRow}`).alignment = { horizontal: 'center' };
  
  currentRow += 2;
  
  // Mengetahui Yayasan (Tengah)
  rekapSheet.mergeCells(`B${currentRow}:E${currentRow}`);
  rekapSheet.getCell(`B${currentRow}`).value = 'Mengetahui,\nKetua Yayasan YPPDM';
  rekapSheet.getCell(`B${currentRow}`).alignment = { horizontal: 'center', wrapText: true };
  
  currentRow += 4; // Spasi ttd
  
  rekapSheet.mergeCells(`B${currentRow}:E${currentRow}`);
  rekapSheet.getCell(`B${currentRow}`).value = 'RIDWAN, S.H.I';
  rekapSheet.getCell(`B${currentRow}`).font = { bold: true };
  rekapSheet.getCell(`B${currentRow}`).alignment = { horizontal: 'center' };

  // ============================================
  // SHEET LAINNYA: DETAILS
  // ============================================
  detailSheets.forEach((sheetData) => {
    const worksheet = workbook.addWorksheet(sheetData.title, {
      views: [{ showGridLines: false }],
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    // Setup columns
    worksheet.columns = sheetData.columns.map(c => ({
      header: c.header,
      key: c.key,
      width: c.width || 20
    }));

    // Style Title Header
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 12,
        name: 'Arial'
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF334155' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        bottom: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } }
      };
    });

    // Add Data
    sheetData.data.forEach((rowObj, index) => {
      const row = worksheet.addRow(rowObj);
      row.height = 25;
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        if ((index + 1) % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      });
    });

    // Apply Kop Surat
    applyKopSuratExcel(worksheet, sheetData.columns.length);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.xlsx`);
};

