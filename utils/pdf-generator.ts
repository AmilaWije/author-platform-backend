import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export const generateAgreementPDF = (agreement: any) => {
  const fileName = `agreement_${agreement.id}.pdf`;
  const filePath = path.join(
    __dirname,
    '../../uploads/digital_agreements',
    fileName,
  );

  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  // Logo
  const logoPath = path.join(__dirname, '../../uploads/assets/logo.png');

  if (fs.existsSync(logoPath)) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Set transparency
    doc.opacity(0.1);

    // Add centered watermark
    doc.image(logoPath, pageWidth / 2 - 150, pageHeight / 2 - 150, {
      width: 300,
    });

    // Reset opacity back to normal
    doc.opacity(1);
  }

  //Title
  doc.font('Helvetica-Bold').text('BULLPEN', { align: 'center' });
  doc.moveDown();

  doc.font('Helvetica-Bold').text('Digital Agreement', { align: 'center' });
  doc.moveDown();

  //Reset to normal font
  doc.font('Helvetica');

  const startX = 50;
  const startY = doc.y;

  // // 📌 Parties
  // doc.font('Helvetica').fontSize(14).text('Parties', { align: 'center' });
  // doc.moveDown(4);

  const arrowPath = path.join(
    __dirname,
    '../../uploads/assets/relate arrow.png',
  );

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text(
      `Author: ${agreement.book.user.f_name} ${agreement.book.user.l_name}`,
      startX,
      startY,
      { continued: false },
    );

  // Arrow Image (center)
  if (fs.existsSync(arrowPath)) {
    doc.image(arrowPath, startX + 200, startY - 2, {
      width: 30,
    });
  }

  // Publisher Name (right side)
  doc
    .font('Helvetica-Bold')
    .text(`Publisher: ${agreement.publisher.username}`, startX + 250, startY);
  doc.moveDown();

  console.log('----------------PDF---------------');
  console.log(agreement);
  console.log('----------------END---------------');

  // 📌 Agreement Details
  doc.fontSize(12).text(`Title: ${agreement.agreement.title}`);
  doc.text(`Description: ${agreement.agreement.description}`);

  doc.moveDown();

  // 📚 Book Details (NEW 🔥)
  if (agreement.book) {
    doc.fontSize(14).text('Book Details:');
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Book Name: ${agreement.book.name}`);
    doc.text(`Description: ${agreement.book.description || 'N/A'}`);
    doc.text(`Summary: ${agreement.book.summary || 'N/A'}`);

    // 👤 Author info from Book
    if (agreement.book.user) {
      doc.text(
        `Author: ${agreement.book.user.f_name} ${agreement.book.user.l_name}`,
      );
    }

    doc.moveDown();
  }

  // 📌 Contract Data
  if (agreement.contractData) {
    doc.fontSize(14).text('Contract Details:');
    doc.moveDown(0.5);

    Object.entries(agreement.contractData).forEach(([key, value]) => {
      doc.fontSize(12).text(`${key}: ${value}`);
    });

    doc.moveDown();

    doc.font('Helvetica-Bold').text('Financial Terms');
    doc.font('Helvetica');

    doc.text(`Agreement Amount: $${agreement.amount}`);
    doc.text(`Valid Until: ${new Date(agreement.endDate).toDateString()}`);

    doc.moveDown();
  }

  // 📌 Status
  doc.text(`Status: ${agreement.status || 'PENDING'}`);

  doc.end();

  return filePath;
};
