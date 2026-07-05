import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ColumnDef {
  header: string;
  key: string;
  width?: number; // for Excel
}

/**
 * Generate standard Excel file
 */
export const exportToExcel = async (title: string, columns: ColumnDef[], data: any[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title, {
    views: [{ showGridLines: false }]
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

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.xlsx`);
};

/**
 * Generate standard Landscape PDF file
 */
export const exportToPDF = (title: string, columns: ColumnDef[], data: any[], filename: string) => {
  // 'l' = landscape
  const doc = new jsPDF('l', 'pt', 'a4');

  // Title
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(title, 40, 40);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 40, 60);

  // Map data to array of arrays based on columns
  const tableData = data.map(item => columns.map(col => item[col.key]));
  const tableHeaders = columns.map(col => col.header);

  autoTable(doc, {
    startY: 80,
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
      views: [{ showGridLines: false }]
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
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.xlsx`);
};
