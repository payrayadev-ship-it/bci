import { jsPDF } from "jspdf";

export interface B2BDocumentData {
  docType: 'po' | 'quotation' | 'invoice' | 'contract' | 'spk';
  docNumber: string;
  docDate: string;
  dueDate?: string;
  
  // Issuer (Pengirim / Perusahaan Pengguna)
  issuerName: string;
  issuerCompany: string;
  issuerAddress: string;
  issuerTaxId?: string; // NPWP / NIB
  issuerLogo?: string; // URL / Base64 Logo Perusahaan
  
  // Recipient (Tujuan)
  recipientName: string;
  recipientCompany: string;
  recipientAddress: string;
  
  // Items
  items: Array<{
    description: string;
    qty: number;
    unit: string;
    unitPrice: number;
  }>;
  
  // Tax
  includePPN: boolean;
  includePPh23: boolean;
  notes: string;
}

interface PDFMetadata {
  title: string;
  category?: string;
  sector?: string;
  targetCompany?: string;
  date?: string;
}

export function exportToPDF(content: string, meta: PDFMetadata) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const startY = 20;
  const contentWidth = pageWidth - (marginX * 2);

  let currentY = startY;

  const primaryColor = [255, 107, 0];
  const secondaryColor = [255, 193, 7];
  const darkSlate = [30, 41, 59];
  const textCharcoal = [51, 65, 85];
  const lightSlate = [100, 116, 139];
  const borderGray = [226, 232, 240];

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 15) {
      doc.addPage();
      currentY = startY;
      drawPageBackground();
      return true;
    }
    return false;
  };

  const drawPageBackground = () => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 2.5, "F");
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, "F");
  };

  drawPageBackground();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("BUSINESS CONNECT INDONESIA", pageWidth - marginX, currentY, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
  doc.text("Platform Kolaborasi B2B & Sinergi Nasional 2026", pageWidth - marginX, currentY + 3.5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text("DRAFT DOKUMEN AI-ASSISTED", marginX, currentY);

  currentY += 8;

  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 10;

  const categoryText = (meta.category || "Dokumen Bisnis").toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(categoryText, marginX, currentY);

  currentY += 6;

  const docTitle = meta.title || "Laporan Hasil Analisis Bisnis";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  
  const wrappedTitle = doc.splitTextToSize(docTitle, contentWidth);
  wrappedTitle.forEach((line: string) => {
    checkPageBreak(8);
    doc.text(line, marginX, currentY);
    currentY += 8;
  });

  currentY += 2;

  checkPageBreak(35);
  doc.setFillColor(250, 250, 250);
  doc.rect(marginX, currentY, contentWidth, 24, "F");
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(marginX, currentY, contentWidth, 24, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

  const dateValue = meta.date || new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  const sectorValue = meta.sector || "Semua Sektor / Umum";
  const partnerValue = meta.targetCompany || "Mitra BCI Terkait";

  doc.text("TANGGAL GENERASI:", marginX + 4, currentY + 6);
  doc.text("SEKTOR INDUSTRI:", marginX + 4, currentY + 12);
  doc.text("TARGET KOLABORASI:", marginX + 4, currentY + 18);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(textCharcoal[0], textCharcoal[1], textCharcoal[2]);
  doc.text(dateValue, marginX + 45, currentY + 6);
  doc.text(sectorValue, marginX + 45, currentY + 12);
  doc.text(partnerValue, marginX + 45, currentY + 18);

  currentY += 32;

  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (line === "") {
      checkPageBreak(5);
      currentY += 3.5;
      continue;
    }

    if (line.startsWith("# ")) {
      const headerText = line.substring(2).replace(/\*\*/g, "").trim();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      const wrappedH1 = doc.splitTextToSize(headerText, contentWidth);
      checkPageBreak(wrappedH1.length * 7 + 4);
      currentY += 4;
      wrappedH1.forEach((hLine: string) => {
        doc.text(hLine, marginX, currentY);
        currentY += 6;
      });
      currentY += 2;
    } 
    else if (line.startsWith("## ")) {
      const headerText = line.substring(3).replace(/\*\*/g, "").trim();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      
      const wrappedH2 = doc.splitTextToSize(headerText, contentWidth);
      checkPageBreak(wrappedH2.length * 6 + 3);
      currentY += 3;
      wrappedH2.forEach((hLine: string) => {
        doc.text(hLine, marginX, currentY);
        currentY += 5.5;
      });
      currentY += 1.5;
    } 
    else if (line.startsWith("### ")) {
      const headerText = line.substring(4).replace(/\*\*/g, "").trim();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      
      const wrappedH3 = doc.splitTextToSize(headerText, contentWidth);
      checkPageBreak(wrappedH3.length * 5 + 3);
      currentY += 2.5;
      wrappedH3.forEach((hLine: string) => {
        doc.text(hLine, marginX, currentY);
        currentY += 5;
      });
      currentY += 1;
    } 
    else if (line.startsWith("* ") || line.startsWith("- ") || line.startsWith("• ")) {
      const bulletText = line.substring(2).replace(/\*\*/g, "").trim();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(textCharcoal[0], textCharcoal[1], textCharcoal[2]);

      const bulletContentWidth = contentWidth - 6;
      const wrappedBullet = doc.splitTextToSize(bulletText, bulletContentWidth);
      
      checkPageBreak(wrappedBullet.length * 5 + 1);
      
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.circle(marginX + 2.5, currentY - 1.2, 0.8, "F");

      wrappedBullet.forEach((bLine: string) => {
        doc.text(bLine, marginX + 6, currentY);
        currentY += 4.8;
      });
    } 
    else {
      const cleanLine = line.replace(/\*\*/g, "").trim();
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(textCharcoal[0], textCharcoal[1], textCharcoal[2]);

      const wrappedText = doc.splitTextToSize(cleanLine, contentWidth);
      checkPageBreak(wrappedText.length * 5 + 1);
      
      wrappedText.forEach((pLine: string) => {
        doc.text(pLine, marginX, currentY);
        currentY += 4.8;
      });
    }
  }

  const totalPages = doc.internal.pages.length - 1;
  
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);

    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
    doc.text(
      "Dibuat via BCI AI Assistant. Dokumen ini sah dan mengikat berdasarkan persetujuan digital kedua pihak.",
      marginX,
      pageHeight - 8
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(`Halaman ${pageNum} dari ${totalPages}`, pageWidth - marginX, pageHeight - 8, { align: "right" });
  }

  const safeTitle = docTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`bci_${safeTitle}.pdf`);
}

/**
 * Highly customized B2B Document Exporter (PO, Surat Penawaran, Invoice, SPK, MOU)
 * Supports downloading file locally OR returning Data URL for chat attachment sharing!
 */
export function generateB2BDocumentPDF(
  data: B2BDocumentData,
  mode: 'download' | 'dataurl' = 'download'
): string | undefined {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 18;
  const contentWidth = pageWidth - (marginX * 2);
  let currentY = 16;

  // Colors
  const redPrimary = [238, 28, 37];   // #EE1C25
  const orangeAccent = [255, 107, 0]; // #FF6B00
  const darkNavy = [15, 23, 42];      // #0F172A
  const textDark = [30, 41, 59];      // #1E293B
  const textMuted = [100, 116, 139];   // #64748B
  const borderLight = [226, 232, 240];// #E2E8F0
  const bgSoft = [248, 250, 252];     // #F8FAFC

  // Title dictionary
  const titleMap: Record<string, { title: string; tag: string }> = {
    po: { title: "PURCHASE ORDER (PO)", tag: "PESANAN PEMBELIAN RESMI B2B" },
    quotation: { title: "SURAT PENAWARAN HARGA", tag: "OFFICIAL B2B QUOTATION" },
    invoice: { title: "INVOICE & TAGIHAN B2B", tag: "FAKTUR PEMBAYARAN RESMI" },
    contract: { title: "PERJANJIAN KERJASAMA (MOU)", tag: "KONTRAK KEMITRAAN BISNIS" },
    spk: { title: "SURAT PERINTAH KERJA (SPK)", tag: "WORK ORDER DOCUMENT" }
  };

  const docInfo = titleMap[data.docType] || { title: "DOKUMEN RESMI B2B", tag: "BUSINESS CONNECT INDONESIA" };

  // 1. TOP HEADER BRAND BAR
  doc.setFillColor(redPrimary[0], redPrimary[1], redPrimary[2]);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Logo & Company Header
  let logoDrawn = false;
  if (data.issuerLogo) {
    try {
      doc.addImage(data.issuerLogo, 'JPEG', marginX, currentY, 12, 12);
      logoDrawn = true;
    } catch (e) {
      try {
        doc.addImage(data.issuerLogo, 'PNG', marginX, currentY, 12, 12);
        logoDrawn = true;
      } catch (err) {
        logoDrawn = false;
      }
    }
  }

  if (!logoDrawn) {
    // Fallback BCI / Company Badge Icon
    doc.setFillColor(redPrimary[0], redPrimary[1], redPrimary[2]);
    doc.roundedRect(marginX, currentY, 11, 11, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(data.issuerCompany ? data.issuerCompany.charAt(0).toUpperCase() : "B", marginX + 3.5, currentY + 7.8);
  }

  // Issuer / User Company Name & BCI Subhead
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text((data.issuerCompany || "PERUSAHAAN PENGGUNA").toUpperCase(), marginX + 15, currentY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  const shortAddr = (data.issuerAddress || "Jakarta, Indonesia").split("\n")[0];
  doc.text(shortAddr, marginX + 15, currentY + 8.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(orangeAccent[0], orangeAccent[1], orangeAccent[2]);
  doc.text("BCI PORTAL INDONESIA • OFFICIAL B2B NETWORK 2026", marginX + 15, currentY + 11.5);

  // Document Title on Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(redPrimary[0], redPrimary[1], redPrimary[2]);
  doc.text(docInfo.title, pageWidth - marginX, currentY + 5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(docInfo.tag, pageWidth - marginX, currentY + 9.5, { align: "right" });

  currentY += 16;

  // Header Divider
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 6;

  // 2. METADATA & PARTIES SECTION (2 Columns)
  const colWidth = (contentWidth - 6) / 2;

  // Issuer Box
  doc.setFillColor(bgSoft[0], bgSoft[1], bgSoft[2]);
  doc.rect(marginX, currentY, colWidth, 38, "F");
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.rect(marginX, currentY, colWidth, 38, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(orangeAccent[0], orangeAccent[1], orangeAccent[2]);
  doc.text("DARI (PIHAK PENERBIT / DOKUMEN):", marginX + 4, currentY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(data.issuerCompany || "PT Business Partner", marginX + 4, currentY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`UP / Perwakilan: ${data.issuerName || 'Manajemen'}`, marginX + 4, currentY + 18);

  const wrappedIssuerAddr = doc.splitTextToSize(data.issuerAddress || "Jakarta, Indonesia", colWidth - 8);
  wrappedIssuerAddr.forEach((line: string, idx: number) => {
    if (idx < 2) doc.text(line, marginX + 4, currentY + 23 + (idx * 4));
  });

  if (data.issuerTaxId) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`NIB/NPWP: ${data.issuerTaxId}`, marginX + 4, currentY + 34);
  }

  // Right Box: Recipient (Tujuan) & Doc Details
  const rightX = marginX + colWidth + 6;

  doc.setFillColor(bgSoft[0], bgSoft[1], bgSoft[2]);
  doc.rect(rightX, currentY, colWidth, 38, "F");
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.rect(rightX, currentY, colWidth, 38, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(redPrimary[0], redPrimary[1], redPrimary[2]);
  doc.text("KEPADA YTH. (PIHAK TUJUAN):", rightX + 4, currentY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(data.recipientCompany || "PT Client Target", rightX + 4, currentY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`UP: ${data.recipientName || 'Bagian Pengadaan / Finance'}`, rightX + 4, currentY + 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`No. Dokumen: ${data.docNumber}`, rightX + 4, currentY + 25);
  doc.text(`Tanggal : ${data.docDate}`, rightX + 4, currentY + 30);
  if (data.dueDate) {
    doc.text(`Jatuh Tempo : ${data.dueDate}`, rightX + 4, currentY + 35);
  }

  currentY += 44;

  // 3. ITEMS TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("RINCIAN BARANG, JASA & SPESIFIKASI KONTRAK", marginX, currentY);

  currentY += 4;

  const col1W = 12;
  const col2W = 82;
  const col3W = 22;
  const col4W = 30;
  const col5W = 28;

  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(marginX, currentY, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  let cX = marginX;
  doc.text("NO", cX + 3, currentY + 5.5);
  cX += col1W;
  doc.text("DESKRIPSI BARANG / LAYANAN", cX + 3, currentY + 5.5);
  cX += col2W;
  doc.text("QTY / SATUAN", cX + 2, currentY + 5.5);
  cX += col3W;
  doc.text("HARGA (RP)", cX + col4W - 3, currentY + 5.5, { align: "right" });
  cX += col4W;
  doc.text("TOTAL (RP)", cX + col5W - 3, currentY + 5.5, { align: "right" });

  currentY += 8;

  let subtotal = 0;

  data.items.forEach((item, index) => {
    const itemTotal = item.qty * item.unitPrice;
    subtotal += itemTotal;

    if (index % 2 === 0) {
      doc.setFillColor(252, 252, 253);
      doc.rect(marginX, currentY, contentWidth, 8, "F");
    }

    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.line(marginX, currentY + 8, marginX + contentWidth, currentY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    let rowX = marginX;
    doc.text(String(index + 1), rowX + 4, currentY + 5.5);
    rowX += col1W;

    const shortDesc = doc.splitTextToSize(item.description, col2W - 4)[0] || item.description;
    doc.text(shortDesc, rowX + 3, currentY + 5.5);
    rowX += col2W;

    doc.text(`${item.qty} ${item.unit}`, rowX + 2, currentY + 5.5);
    rowX += col3W;

    doc.text(item.unitPrice.toLocaleString("id-ID"), rowX + col4W - 3, currentY + 5.5, { align: "right" });
    rowX += col4W;

    doc.setFont("helvetica", "bold");
    doc.text(itemTotal.toLocaleString("id-ID"), rowX + col5W - 3, currentY + 5.5, { align: "right" });

    currentY += 8;
  });

  // 4. TAX & TOTAL CALCULATIONS SUMMARY BOX
  currentY += 4;

  const ppnVal = data.includePPN ? subtotal * 0.11 : 0;
  const pphVal = data.includePPh23 ? subtotal * 0.02 : 0;
  const totalBuyer = subtotal + ppnVal;
  const netSeller = subtotal - pphVal;

  const summaryLeftW = 100;
  doc.setFillColor(bgSoft[0], bgSoft[1], bgSoft[2]);
  doc.rect(marginX, currentY, summaryLeftW, 36, "F");
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.rect(marginX, currentY, summaryLeftW, 36, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("CATATAN & SYARAT KETENTUAN TRANSAKSI:", marginX + 4, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  const wrappedNotes = doc.splitTextToSize(data.notes || "1. Pembayaran transfer ke Rekening Resmi BCI Escrow / PT Penerbit.\n2. Harga sudah termasuk PPN 11% & PPh 23 jika dicentang.\n3. Barang yang dikirim telah lolos inspeksi QC TKDN.", summaryLeftW - 8);
  wrappedNotes.forEach((nLine: string, idx: number) => {
    if (idx < 5) doc.text(nLine, marginX + 4, currentY + 11 + (idx * 4));
  });

  const summaryRightX = marginX + summaryLeftW + 4;
  const summaryRightW = contentWidth - summaryLeftW - 4;

  doc.setFillColor(255, 255, 255);
  doc.rect(summaryRightX, currentY, summaryRightW, 36, "F");
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.rect(summaryRightX, currentY, summaryRightW, 36, "S");

  let sumY = currentY + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("Subtotal (DPP):", summaryRightX + 4, sumY);
  doc.setFont("helvetica", "bold");
  doc.text(`Rp${subtotal.toLocaleString("id-ID")}`, summaryRightX + summaryRightW - 4, sumY, { align: "right" });

  sumY += 5;
  if (data.includePPN) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 128, 96);
    doc.text("+ PPN 11% (PKP):", summaryRightX + 4, sumY);
    doc.setFont("helvetica", "bold");
    doc.text(`Rp${ppnVal.toLocaleString("id-ID")}`, summaryRightX + summaryRightW - 4, sumY, { align: "right" });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("PPN 11%:", summaryRightX + 4, sumY);
    doc.text("Non-PKP (Rp0)", summaryRightX + summaryRightW - 4, sumY, { align: "right" });
  }

  sumY += 5;
  if (data.includePPh23) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 80, 0);
    doc.text("- Potongan PPh 23 (2%):", summaryRightX + 4, sumY);
    doc.setFont("helvetica", "bold");
    doc.text(`-Rp${pphVal.toLocaleString("id-ID")}`, summaryRightX + summaryRightW - 4, sumY, { align: "right" });
  }

  sumY += 6;
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.line(summaryRightX + 4, sumY - 2, summaryRightX + summaryRightW - 4, sumY - 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(redPrimary[0], redPrimary[1], redPrimary[2]);
  doc.text("TOTAL TAGIHAN:", summaryRightX + 4, sumY + 2);
  doc.text(`Rp${totalBuyer.toLocaleString("id-ID")}`, summaryRightX + summaryRightW - 4, sumY + 2, { align: "right" });

  sumY += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(orangeAccent[0], orangeAccent[1], orangeAccent[2]);
  doc.text("Kas Net Penjual:", summaryRightX + 4, sumY + 2);
  doc.text(`Rp${netSeller.toLocaleString("id-ID")}`, summaryRightX + summaryRightW - 4, sumY + 2, { align: "right" });

  currentY += 42;

  // 5. SIGNATURES & VERIFICATION SEAL
  const sigBoxW = (contentWidth - 10) / 2;

  // Left Signature
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("PIHAK PENERBIT / PENJUAL", marginX + (sigBoxW / 2), currentY, { align: "center" });
  
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("(Tanda Tangan & Cap Digital)", marginX + (sigBoxW / 2), currentY + 4, { align: "center" });

  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setFillColor(252, 252, 253);
  doc.roundedRect(marginX + (sigBoxW / 2) - 20, currentY + 7, 40, 16, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(orangeAccent[0], orangeAccent[1], orangeAccent[2]);
  doc.text("[ VERIFIED SIGNATURE ]", marginX + (sigBoxW / 2), currentY + 14, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(data.issuerCompany || 'PT Penerbit', marginX + (sigBoxW / 2), currentY + 18, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(data.issuerName || "Manajemen B2B", marginX + (sigBoxW / 2), currentY + 28, { align: "center" });

  // Right Signature
  const rightSigX = marginX + sigBoxW + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("PIHAK PEMBELI / MITRA", rightSigX + (sigBoxW / 2), currentY, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("(Konfirmasi & Persetujuan)", rightSigX + (sigBoxW / 2), currentY + 4, { align: "center" });

  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setFillColor(252, 252, 253);
  doc.roundedRect(rightSigX + (sigBoxW / 2) - 20, currentY + 7, 40, 16, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(redPrimary[0], redPrimary[1], redPrimary[2]);
  doc.text("[ DIGITAL APPROVAL ]", rightSigX + (sigBoxW / 2), currentY + 14, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(data.recipientCompany || 'PT Mitra Target', rightSigX + (sigBoxW / 2), currentY + 18, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(data.recipientName || "Penanggung Jawab", rightSigX + (sigBoxW / 2), currentY + 28, { align: "center" });

  // FOOTER
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.3);
  doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    "Dokumen ini diterbitkan secara elektronik melalui BCI Portal Indonesia 2026 dan memiliki kekuatan hukum yang sah.",
    marginX,
    pageHeight - 7
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("BCI VERIFIED B2B DOC", pageWidth - marginX, pageHeight - 7, { align: "right" });

  const safeFileName = `${data.docType}_${data.docNumber.replace(/[\/\\#]/g, '_')}.pdf`;

  if (mode === 'dataurl') {
    return doc.output('datauristring');
  } else {
    doc.save(safeFileName);
    return safeFileName;
  }
}
