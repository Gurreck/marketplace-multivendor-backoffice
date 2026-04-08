const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  const formatted = new Intl.NumberFormat("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return `\u20A1${formatted}`;
};

const formatDate = (date = new Date()) => {
  return new Date(date).toLocaleDateString("es-CR");
};

const safeText = (value, fallback = "") => {
  return value !== undefined && value !== null && value !== ""
    ? String(value)
    : fallback;
};

const drawBox = (doc, x, y, w, h, fillColor = null) => {
  if (fillColor) {
    doc.save().rect(x, y, w, h).fill(fillColor).restore();
  }
  doc.rect(x, y, w, h).stroke();
};

const generateInvoicePdf = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const invoicesDir = path.join(__dirname, "..", "invoices");

      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `factura-${order.invoiceNumber}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      const doc = new PDFDocument({
        size: "A4",
        margin: 28,
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const left = 28;
      const right = pageWidth - 28;
      const contentWidth = right - left;

      const primary = "#111111";
      const gray = "#666666";
      const headerGray = "#D1D5DB";
      const darkGray = "#4B5563";

      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const month = now.toLocaleString("es-CR", { month: "long" });
      const year = now.getFullYear();

      const customerName = safeText(user?.nombre, "Cliente");
      const customerCedula = safeText(user?.cedula, "");
      const customerEmail = safeText(user?.email, "No disponible");
      const customerPhone = safeText(user?.telefono, "");

      const addressLine1 = safeText(order.shippingAddress?.direccion);
      const addressLine2 = `${safeText(order.shippingAddress?.ciudad)}${
        order.shippingAddress?.ciudad ? ", " : ""
      }${safeText(order.shippingAddress?.provincia)}${
        order.shippingAddress?.provincia ? ", " : ""
      }${safeText(order.shippingAddress?.pais)}`;

      const paymentBrand = safeText(order.paymentMethod?.brand, "Tarjeta");
      const paymentLast4 = safeText(order.paymentMethod?.last4, "****");
      const paymentRef = safeText(order.paymentMethod?.reference, "");

      const subtotal = Number(order.subtotal || 0);
      const shipping = Number(order.shipping || 0);
      const discount = Number(order.discountAmount || 0);
      const total = Number(order.total || 0);

      const taxableBase = Math.max(subtotal - discount, 0);
      const IVA_RATE = 0.13;
      const taxAmount = Math.round(taxableBase * IVA_RATE * 100) / 100;
      const subtotalExento = shipping;

      // ===== ENCABEZADO EMPRESA =====
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(primary)
        .text("Marketplace Nexora", left, 30);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(primary)
        .text("Nexora Commerce S.A.", left, 47);

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(primary)
        .text("Avenida Central, San José, Costa Rica", left, 60)
        .text("Tel: +506 4350-2222", left, 72)
        .text("www.nexora.com", left, 84)
        .text("Email: soporte@nexora.com", left, 96)
        .text("Cédula Jurídica: 3-102-888999", left, 108);

      // Logo estilo texto (derecha)
      doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .fillColor("#222222")
        .text("nexora", right - 170, 38, { width: 170, align: "right" });

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#888888")
        .text("MARKETPLACE", right - 170, 64, { width: 170, align: "right" });

      // Línea decorativa bajo el logo
      doc
        .moveTo(right - 170, 75)
        .lineTo(right, 75)
        .lineWidth(0.5)
        .strokeColor("#CCCCCC")
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor("#AAAAAA")
        .text("Lo último en tecnología a tu alcance", right - 170, 79, {
          width: 170,
          align: "right",
        });

      // Línea separadora
      doc
        .moveTo(left, 125)
        .lineTo(right, 125)
        .lineWidth(0.8)
        .strokeColor("#CCCCCC")
        .stroke();

      // ===== TÍTULO FACTURA =====
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(primary)
        .text(
          `Factura Electrónica No. ${safeText(order.invoiceNumber, "N/A")}`,
          left,
          133
        );

      // Clave numérica (como en la imagen)
      const claveFactura = safeText(
        order.claveFactura,
        `506040426003101${safeText(order._id).slice(-20).padStart(20, "0")}1`
      );
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(gray)
        .text(`Clave: ${claveFactura}`, left, 150);

      // ===== FECHA EN CUADRO =====
      const dateBoxX = right - 200;
      const dateBoxY = 130;
      const cellH = 19;
      const cellW1 = 40;
      const cellW2 = 95;
      const cellW3 = 55;

      drawBox(doc, dateBoxX, dateBoxY, cellW1 + cellW2 + cellW3, cellH * 2);
      drawBox(doc, dateBoxX, dateBoxY, cellW1, cellH, headerGray);
      drawBox(doc, dateBoxX + cellW1, dateBoxY, cellW2, cellH, headerGray);
      drawBox(
        doc,
        dateBoxX + cellW1 + cellW2,
        dateBoxY,
        cellW3,
        cellH,
        headerGray
      );
      drawBox(doc, dateBoxX, dateBoxY + cellH, cellW1, cellH);
      drawBox(doc, dateBoxX + cellW1, dateBoxY + cellH, cellW2, cellH);
      drawBox(
        doc,
        dateBoxX + cellW1 + cellW2,
        dateBoxY + cellH,
        cellW3,
        cellH
      );

      doc.font("Helvetica-Bold").fontSize(8).fillColor(primary);
      doc.text("Día", dateBoxX, dateBoxY + 6, {
        width: cellW1,
        align: "center",
      });
      doc.text("Mes", dateBoxX + cellW1, dateBoxY + 6, {
        width: cellW2,
        align: "center",
      });
      doc.text("Año", dateBoxX + cellW1 + cellW2, dateBoxY + 6, {
        width: cellW3,
        align: "center",
      });

      doc.font("Helvetica").fontSize(9);
      doc.text(day, dateBoxX, dateBoxY + cellH + 4, {
        width: cellW1,
        align: "center",
      });
      doc.text(
        month.charAt(0).toUpperCase() + month.slice(1),
        dateBoxX + cellW1,
        dateBoxY + cellH + 4,
        { width: cellW2, align: "center" }
      );
      doc.text(String(year), dateBoxX + cellW1 + cellW2, dateBoxY + cellH + 4, {
        width: cellW3,
        align: "center",
      });

      // ===== BLOQUE CLIENTE / DETALLES =====
      const infoY = 168;
      const col1W = 310;
      const col2W = contentWidth - col1W;
      const infoH = 118;

      drawBox(doc, left, infoY, col1W, infoH);
      drawBox(doc, left + col1W, infoY, col2W, infoH);
      drawBox(doc, left, infoY, col1W, 16, headerGray);
      drawBox(doc, left + col1W, infoY, col2W, 16, headerGray);

      doc.font("Helvetica-Bold").fontSize(8).fillColor(primary);
      doc.text("Información del Cliente:", left + 6, infoY + 4);
      doc.text("Detalles:", left + col1W + 6, infoY + 4);

      // Cliente
      doc.font("Helvetica").fontSize(9).fillColor(primary);
      doc.text(customerName, left + 6, infoY + 22, { width: col1W - 12 });
      if (customerCedula) {
        doc.text(`Cédula Física: ${customerCedula}`, left + 6, infoY + 36, {
          width: col1W - 12,
        });
      }
      doc.text(addressLine1 || addressLine2, left + 6, infoY + 50, {
        width: col1W - 12,
      });
      doc.text("Costa Rica", left + 6, infoY + 64, { width: col1W - 12 });
      if (customerPhone) {
        doc.text(`Tel: ${customerPhone}`, left + 6, infoY + 78, {
          width: col1W - 12,
        });
      }
      if (customerEmail) {
        doc.text(customerEmail, left + 6, infoY + 92, { width: col1W - 12 });
      }

      // Detalles (lado derecho) - estilo más parecido a la imagen de referencia
      const detailX = left + col1W + 6;
      const detailLabelW = 110;
      const detailValueX = detailX + detailLabelW;
      const detailValueW = col2W - detailLabelW - 10;

      const detailRows = [
        [
          "Referencia Interna No.:",
          safeText(order._id).slice(-8).toUpperCase(),
        ],
        ["Email:", customerEmail],
        ["Agente de Ventas:", safeText(order.agenteName, "Nexora Commerce")],
        ["Términos de Pago:", safeText(order.paymentTerms, "Pago de Contado")],
        [
          "Fecha de Vencimiento:",
          formatDate(
            order.dueDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          ),
        ],
      ];

      detailRows.forEach(([label, value], i) => {
        const rowY = infoY + 22 + i * 19;
        doc.font("Helvetica-Bold").fontSize(8).fillColor(primary);
        doc.text(label, detailX, rowY, { width: detailLabelW });
        doc.font("Helvetica").fontSize(8.5).fillColor(primary);
        doc.text(value, detailValueX, rowY, {
          width: detailValueW,
          lineBreak: false,
        });
      });

      // ===== TABLA DE PRODUCTOS =====
      const tableY = infoY + infoH + 10;
      const colProducto = 72;
      const colDescripcion = 221; // era 295, reducido ~74px (1/4 de 295)
      const colCantidad = 55;
      const colPrecio = 85;
      const colTotal = contentWidth - colProducto - colDescripcion - colCantidad - colPrecio;
      const rowH = 22;
      const moneyPad = 14; // padding derecho para montos, más holgado

      // Headers tabla
      let x = left;
      const headers = [
        { label: "Producto", w: colProducto, align: "left", pad: 4 },
        { label: "Descripción", w: colDescripcion, align: "left", pad: 4 },
        { label: "Cantidad", w: colCantidad, align: "center", pad: 4 },
        { label: "Precio Unitario", w: colPrecio, align: "right", pad: moneyPad },
        { label: "Total", w: colTotal, align: "right", pad: moneyPad },
      ];

      headers.forEach((h) => {
        drawBox(doc, x, tableY, h.w, rowH, headerGray);
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(primary);
        doc.text(h.label, x + 4, tableY + 7, {
          width: h.w - h.pad - 4,
          align: h.align,
        });
        x += h.w;
      });

      let currentY = tableY + rowH;
      const items = Array.isArray(order.items) ? order.items : [];

      items.forEach((item, index) => {
        const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
        const lineIVA = Math.round(lineTotal * IVA_RATE * 100) / 100;
        const code = safeText(
          item.product?._id || item.product || `ITEM-${index + 1}`
        )
          .slice(-6)
          .toUpperCase();

        x = left;
        const cols = [colProducto, colDescripcion, colCantidad, colPrecio, colTotal];
        cols.forEach((w) => {
          drawBox(doc, x, currentY, w, rowH);
          x += w;
        });

        // Texto de cada columna
        doc.font("Helvetica").fontSize(8.5).fillColor(primary);
        doc.text(code, left + 4, currentY + 7, { width: colProducto - 8 });

        // Descripción + IVA debajo
        const descX = left + colProducto + 4;
        const descW = colDescripcion - 8;
        doc.text(safeText(item.name, "Producto"), descX, currentY + 3, {
          width: descW,
          ellipsis: true,
        });
        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor(gray)
          .text(
            `IVA - Tarifa Plena 13% (13%): ${formatCurrency(lineIVA)}`,
            descX,
            currentY + 13,
            { width: descW }
          );

        doc.font("Helvetica").fontSize(8.5).fillColor(primary);
        doc.text(
          String(item.quantity || 0),
          left + colProducto + colDescripcion + 4,
          currentY + 7,
          { width: colCantidad - 8, align: "center" }
        );
        doc.text(
          formatCurrency(item.price || 0),
          left + colProducto + colDescripcion + colCantidad + 4,
          currentY + 7,
          { width: colPrecio - moneyPad - 4, align: "right" }
        );
        doc.text(
          formatCurrency(lineTotal),
          left + colProducto + colDescripcion + colCantidad + colPrecio + 4,
          currentY + 7,
          { width: colTotal - moneyPad - 4, align: "right" }
        );

        currentY += rowH;
      });

      if (items.length === 0) {
        const totalColW = colProducto + colDescripcion + colCantidad + colPrecio + colTotal;
        drawBox(doc, left, currentY, totalColW, rowH);
        doc
          .font("Helvetica")
          .fontSize(9)
          .text("Sin productos registrados", left, currentY + 7, {
            width: totalColW,
            align: "center",
          });
        currentY += rowH;
      }

      // ===== ÚLTIMA LÍNEA =====
      const totalColsW = colProducto + colDescripcion + colCantidad + colPrecio + colTotal;
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(gray)
        .text("**** ULTIMA LINEA ****", left, currentY + 5, {
          width: totalColsW,
          align: "center",
        });
      currentY += 18;

      // ===== SECCIÓN: IMPUESTOS + FORMA DE PAGO =====
      const taxSectionY = currentY + 4;
      const taxLabelW = 130;

      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(primary);
      doc.text("Impuestos:", left, taxSectionY);
      doc.font("Helvetica").fontSize(8.5);
      doc.text(
        `IVA - Tarifa Plena 13%:`,
        left + taxLabelW,
        taxSectionY
      );
      doc.font("Helvetica-Bold").fontSize(8.5);
      doc.text(
        formatCurrency(taxAmount),
        left + taxLabelW + 120,
        taxSectionY
      );

      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(primary);
      doc.text("Forma de Pago:", left, taxSectionY + 16);
      doc.font("Helvetica").fontSize(8.5);

      const paymentDescription = paymentRef
        ? `${paymentBrand} - ${paymentRef} (No. ${paymentLast4})\n${paymentBrand}`
        : `${paymentBrand} terminada en ${paymentLast4}`;
      doc.text(paymentDescription, left + taxLabelW, taxSectionY + 16, {
        width: 280,
      });

      currentY = taxSectionY + 44;

      // Línea separadora antes de sección inferior
      doc
        .moveTo(left, currentY)
        .lineTo(right, currentY)
        .lineWidth(0.5)
        .strokeColor("#CCCCCC")
        .stroke();
      currentY += 6;

      // ===== SECCIÓN INFERIOR =====
      const bottomY = currentY;
      const termsW = 350;
      const totalsW = contentWidth - termsW;
      const bottomH = 148;

      drawBox(doc, left, bottomY, termsW, bottomH);
      drawBox(doc, left + termsW, bottomY, totalsW, bottomH);

      drawBox(doc, left, bottomY, termsW, 16, headerGray);
      drawBox(doc, left + termsW, bottomY, totalsW, 16, headerGray);

      doc.font("Helvetica-Bold").fontSize(8).fillColor(primary);
      doc.text("Términos y Condiciones:", left + 6, bottomY + 4);
      doc.text("Resumen:", left + termsW + 6, bottomY + 4);

      doc.font("Helvetica").fontSize(8.5).fillColor(primary);
      doc.text(
        "Esta factura devenga intereses del 3% mensual después de su vencimiento.\n" +
          "Renuncio a mi domicilio y los trámites de juicio ejecutivo según el Artículo 460\n" +
          "del Código de Comercio.\n" +
          "** Un año de garantía, por defectos de fábrica. **",
        left + 8,
        bottomY + 24,
        { width: termsW - 16, align: "left" }
      );

      // ===== TOTALES DETALLADOS =====
      const sumX = left + termsW;
      const sumLabelW = totalsW - 100;
      const sumValueW = 100;
      let sumY = bottomY + 16;
      const sumRowH = 16;

      const totalRows = [
        { label: "SubTotal Gravado", value: formatCurrency(taxableBase), bold: false, fill: headerGray },
        { label: "Descuento Gravado", value: formatCurrency(discount), bold: false, fill: null },
        { label: "SubTotal Exento", value: formatCurrency(subtotalExento), bold: false, fill: headerGray },
        { label: "Descuento Exento", value: formatCurrency(0), bold: false, fill: null },
        { label: "Impuestos", value: formatCurrency(taxAmount), bold: false, fill: headerGray },
        { label: "Total", value: formatCurrency(subtotal + taxAmount), bold: false, fill: null },
        { label: "Otros", value: formatCurrency(shipping), bold: false, fill: headerGray },
        { label: "Total a Pagar", value: formatCurrency(total), bold: true, fill: darkGray },
      ];

      totalRows.forEach((row) => {
        const fill = row.label === "Total a Pagar" ? darkGray : row.fill;
        const textColor = row.label === "Total a Pagar" ? "#FFFFFF" : primary;

        if (fill) {
          doc.save().rect(sumX, sumY, sumLabelW + sumValueW, sumRowH).fill(fill).restore();
        }
        doc.rect(sumX, sumY, sumLabelW, sumRowH).stroke();
        doc.rect(sumX + sumLabelW, sumY, sumValueW, sumRowH).stroke();

        doc
          .font(row.bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(8)
          .fillColor(textColor);
        doc.text(row.label, sumX + 4, sumY + 5, {
          width: sumLabelW - 8,
          align: "right",
        });
        doc.text(row.value, sumX + sumLabelW + 4, sumY + 5, {
          width: sumValueW - moneyPad - 4,
          align: "right",
        });

        sumY += sumRowH;
      });

      // ===== PIE DE PÁGINA =====
      const footerY = pageHeight - 52;

      doc
        .moveTo(left, footerY - 4)
        .lineTo(right, footerY - 4)
        .lineWidth(0.5)
        .strokeColor("#CCCCCC")
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(gray)
        .text(
          "Emitida conforme lo establecido en la resolución de Facturación Electrónica No. DGT-RES-0027-2024 del 19-Nov-2024, de la D.G.T.D.",
          left,
          footerY,
          { width: contentWidth, align: "left" }
        );

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(gray)
        .text("Versión 4.4.", left, footerY + 10);

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(gray)
        .text(
          "Factura electrónica generada por Marketplace Nexora (www.nexora.com).",
          left,
          footerY + 20
        );

      doc
        .font("Helvetica-Oblique")
        .fontSize(7)
        .fillColor(gray)
        .text(
          `Factura emitida el ${formatDate(now)} ${now.toLocaleTimeString("es-CR", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          left,
          footerY + 20,
          { width: contentWidth, align: "right" }
        );

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoicePdf;