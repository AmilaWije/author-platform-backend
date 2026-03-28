import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export const generateAgreementPDF = (agreement: any) => {
  const fileName = `agreement_${agreement.id}.pdf`;
  const filePath = path.join(__dirname, '../../uploads/digital_agreements', fileName);

  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  // 📄 Title
  doc.fontSize(18).text('Digital Agreement', { align: 'center' });

  doc.moveDown();

  // 📌 Agreement Details
  doc.fontSize(12).text(`Title: ${agreement.title}`);
  doc.text(`Description: ${agreement.description}`);
  doc.text(`Author ID: ${agreement.authorId}`);
  doc.text(`Publisher ID: ${agreement.publisherId}`);
  doc.text(`Book ID: ${agreement.bookId}`);

  doc.moveDown();

  // 📌 Contract Data
  if (agreement.contractData) {
    doc.text('Contract Details:');
    Object.entries(agreement.contractData).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`);
    });
  }

  doc.moveDown();

  doc.text('Status: PENDING');

  doc.end();

  return filePath;
};