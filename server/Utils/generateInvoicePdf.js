const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  }).format(amount || 0);
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
      const lightGray = "#E5E7EB";
      const headerGray = "#D1D5DB";

      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const month = now.toLocaleString("es-CR", { month: "long" });
      const year = now.getFullYear();

      const customerName = safeText(user?.nombre, "Cliente");
      const customerEmail = safeText(user?.email, "No disponible");

      const addressLine1 = safeText(order.shippingAddress?.direccion);
      const addressLine2 = `${safeText(order.shippingAddress?.ciudad)}${
        order.shippingAddress?.ciudad ? ", " : ""
      }${safeText(order.shippingAddress?.provincia)}${
        order.shippingAddress?.provincia ? ", " : ""
      }${safeText(order.shippingAddress?.pais)}`;
      const postalCode = safeText(order.shippingAddress?.codigoPostal);

      const paymentBrand = safeText(order.paymentMethod?.brand, "Tarjeta");
      const paymentLast4 = safeText(order.paymentMethod?.last4, "****");

      const subtotal = Number(order.subtotal || 0);
      const shipping = Number(order.shipping || 0);
      const discount = Number(order.discountAmount || 0);
      const total = Number(order.total || 0);

      // impuesto calculado visualmente
      const taxableBase = Math.max(subtotal - discount, 0);
      const taxAmount = Math.max(total - taxableBase - shipping, 0);

      // ===== ENCABEZADO EMPRESA =====
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor(primary)
        .text("Marketplace Nexora", left, 35);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(primary)
        .text("Plataforma de comercio electrónico", left, 60)
        .text("Costa Rica", left, 74)
        .text("Tel: +506 0000-0000", left, 88)
        .text("Email: soporte@nexora.com", left, 102)
        .text("Web: www.nexora.com", left, 116);

      // logo textual simple lado derecho
      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor("#999999")
        .text("NEXORA", right - 160, 50, {
          width: 160,
          align: "right",
        });

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#999999")
        .text("MARKETPLACE", right - 160, 78, {
          width: 160,
          align: "right",
        });

      // ===== TÍTULO FACTURA =====
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(primary)
        .text(`Factura de Compra No. ${safeText(order.invoiceNumber, "N/A")}`, left, 145);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(gray)
        .text(`Orden: ${safeText(order._id)}`, left, 164);

      // fecha en cuadrito
      const dateBoxX = right - 210;
      const dateBoxY = 140;
      const cellH = 20;
      const cellW1 = 45;
      const cellW2 = 90;
      const cellW3 = 55;

      drawBox(doc, dateBoxX, dateBoxY, cellW1 + cellW2 + cellW3, cellH * 2);
      drawBox(doc, dateBoxX, dateBoxY, cellW1, cellH, headerGray);
      drawBox(doc, dateBoxX + cellW1, dateBoxY, cellW2, cellH, headerGray);
      drawBox(doc, dateBoxX + cellW1 + cellW2, dateBoxY, cellW3, cellH, headerGray);

      drawBox(doc, dateBoxX, dateBoxY + cellH, cellW1, cellH);
      drawBox(doc, dateBoxX + cellW1, dateBoxY + cellH, cellW2, cellH);
      drawBox(doc, dateBoxX + cellW1 + cellW2, dateBoxY + cellH, cellW3, cellH);

      doc.font("Helvetica-Bold").fontSize(8).fillColor(primary);
      doc.text("Día", dateBoxX, dateBoxY + 6, { width: cellW1, align: "center" });
      doc.text("Mes", dateBoxX + cellW1, dateBoxY + 6, { width: cellW2, align: "center" });
      doc.text("Año", dateBoxX + cellW1 + cellW2, dateBoxY + 6, { width: cellW3, align: "center" });

      doc.font("Helvetica").fontSize(9);
      doc.text(day, dateBoxX, dateBoxY + cellH + 5, { width: cellW1, align: "center" });
      doc.text(month.charAt(0).toUpperCase() + month.slice(1), dateBoxX + cellW1, dateBoxY + cellH + 5, {
        width: cellW2,
        align: "center",
      });
      doc.text(String(year), dateBoxX + cellW1 + cellW2, dateBoxY + cellH + 5, {
        width: cellW3,
        align: "center",
      });

      // ===== BLOQUE CLIENTE / DETALLES =====
      const infoY = 195;
      const infoH = 92;
      const col1W = 375;
      const col2W = contentWidth - col1W;

      drawBox(doc, left, infoY, col1W, infoH);
      drawBox(doc, left + col1W, infoY, col2W, infoH);
      drawBox(doc, left, infoY, col1W, 18, headerGray);
      drawBox(doc, left + col1W, infoY, col2W, 18, headerGray);

      doc.font("Helvetica-Bold").fontSize(8).fillColor(primary);
      doc.text("Información del Cliente:", left + 6, infoY + 5);
      doc.text("Detalles:", left + col1W + 6, infoY + 5);

      doc.font("Helvetica").fontSize(10).fillColor(primary);
      doc.text(customerName, left + 6, infoY + 25);
      doc.text(customerEmail, left + 6, infoY + 40);
      doc.text(addressLine1, left + 6, infoY + 55);
      doc.text(addressLine2, left + 6, infoY + 70);
      if (postalCode) {
        doc.text(`Código Postal: ${postalCode}`, left + 6, infoY + 85);
      }

      const detailX = left + col1W + 8;
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("Referencia Interna No.:", detailX, infoY + 25);
      doc.text("Forma de Pago:", detailX, infoY + 43);
      doc.text("Fecha de Emisión:", detailX, infoY + 61);
      doc.text("Estado:", detailX, infoY + 79);

      doc.font("Helvetica").fontSize(9);
      doc.text(safeText(order._id).slice(-8).toUpperCase(), detailX + 122, infoY + 25);
      doc.text(`${paymentBrand} terminada en ${paymentLast4}`, detailX + 122, infoY + 43);
      doc.text(formatDate(order.paidAt || now), detailX + 122, infoY + 61);
      doc.text(order.status === "paid" ? "Pagado" : safeText(order.status, "Pendiente"), detailX + 122, infoY + 79);

      // ===== TABLA DE PRODUCTOS =====
      const tableY = 305;
      const colProducto = 85;
      const colDescripcion = 255;
      const colCantidad = 60;
      const colPrecio = 95;
      const colTotal = 80;
      const rowH = 22;

      let x = left;

      drawBox(doc, x, tableY, colProducto, rowH, headerGray);
      drawBox(doc, x + colProducto, tableY, colDescripcion, rowH, headerGray);
      drawBox(doc, x + colProducto + colDescripcion, tableY, colCantidad, rowH, headerGray);
      drawBox(doc, x + colProducto + colDescripcion + colCantidad, tableY, colPrecio, rowH, headerGray);
      drawBox(doc, x + colProducto + colDescripcion + colCantidad + colPrecio, tableY, colTotal, rowH, headerGray);

      doc.font("Helvetica-Bold").fontSize(8);
      doc.text("Producto", x + 4, tableY + 7, { width: colProducto - 8 });
      doc.text("Descripción", x + colProducto + 4, tableY + 7, { width: colDescripcion - 8 });
      doc.text("Cantidad", x + colProducto + colDescripcion + 4, tableY + 7, {
        width: colCantidad - 8,
        align: "center",
      });
      doc.text("Precio Unitario", x + colProducto + colDescripcion + colCantidad + 4, tableY + 7, {
        width: colPrecio - 8,
        align: "right",
      });
      doc.text("Total", x + colProducto + colDescripcion + colCantidad + colPrecio + 4, tableY + 7, {
        width: colTotal - 8,
        align: "right",
      });

      let currentY = tableY + rowH;

      const items = Array.isArray(order.items) ? order.items : [];

      items.forEach((item, index) => {
        const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
        const code = safeText(item.product?._id || item.product || `ITEM-${index + 1}`)
          .slice(-8)
          .toUpperCase();

        drawBox(doc, x, currentY, colProducto, rowH);
        drawBox(doc, x + colProducto, currentY, colDescripcion, rowH);
        drawBox(doc, x + colProducto + colDescripcion, currentY, colCantidad, rowH);
        drawBox(doc, x + colProducto + colDescripcion + colCantidad, currentY, colPrecio, rowH);
        drawBox(doc, x + colProducto + colDescripcion + colCantidad + colPrecio, currentY, colTotal, rowH);

        doc.font("Helvetica").fontSize(8.5).fillColor(primary);
        doc.text(code, x + 4, currentY + 7, { width: colProducto - 8 });
        doc.text(safeText(item.name, "Producto"), x + colProducto + 4, currentY + 7, {
          width: colDescripcion - 8,
        });
        doc.text(String(item.quantity || 0), x + colProducto + colDescripcion + 4, currentY + 7, {
          width: colCantidad - 8,
          align: "center",
        });
        doc.text(formatCurrency(item.price || 0), x + colProducto + colDescripcion + colCantidad + 4, currentY + 7, {
          width: colPrecio - 8,
          align: "right",
        });
        doc.text(formatCurrency(lineTotal), x + colProducto + colDescripcion + colCantidad + colPrecio + 4, currentY + 7, {
          width: colTotal - 8,
          align: "right",
        });

        currentY += rowH;
      });

      // dejar una fila si no hay items
      if (items.length === 0) {
        drawBox(doc, x, currentY, colProducto + colDescripcion + colCantidad + colPrecio + colTotal, rowH);
        doc.font("Helvetica").fontSize(9).text("Sin productos registrados", x, currentY + 7, {
          width: colProducto + colDescripcion + colCantidad + colPrecio + colTotal,
          align: "center",
        });
        currentY += rowH;
      }

      // ===== SECCIÓN INFERIOR =====
      const bottomY = currentY + 18;
      const termsW = 380;
      const signW = 110;
      const totalsW = contentWidth - termsW - signW;

      drawBox(doc, left, bottomY, termsW, 150);
      drawBox(doc, left + termsW, bottomY, signW, 150);
      drawBox(doc, left + termsW + signW, bottomY, totalsW, 150);

      drawBox(doc, left, bottomY, termsW, 18, headerGray);
      drawBox(doc, left + termsW, bottomY, signW, 18, headerGray);
      drawBox(doc, left + termsW + signW, bottomY, totalsW, 18, headerGray);

      doc.font("Helvetica-Bold").fontSize(8);
      doc.text("Términos y Condiciones:", left + 6, bottomY + 5);
      doc.text("Recibido Por:", left + termsW + 6, bottomY + 5);
      doc.text("Resumen:", left + termsW + signW + 6, bottomY + 5);

      doc.font("Helvetica").fontSize(9);
      doc.text(
        "Esta factura corresponde a una compra realizada en Marketplace Nexora.\n" +
          "Los productos y montos reflejados han sido procesados según la información registrada en la orden.\n" +
          "Para soporte o consultas sobre esta compra, puede contactarnos por correo.\n" +
          "Gracias por confiar en Nexora.",
        left + 8,
        bottomY + 28,
        { width: termsW - 16, align: "left" }
      );

      doc.font("Helvetica").fontSize(8);
      doc.text("(Firma)", left + termsW + 25, bottomY + 132);

      // resumen de totales
      const sumX = left + termsW + signW;
      const labelW = totalsW - 90;
      const valueW = 90;
      let sumY = bottomY + 18;
      const sumRowH = 22;

      const totalRows = [
        ["Subtotal", formatCurrency(subtotal)],
        ["Descuento", formatCurrency(discount)],
        ["Envío", formatCurrency(shipping)],
        ["Impuestos", formatCurrency(taxAmount)],
        ["Total a Pagar", formatCurrency(total)],
      ];

      totalRows.forEach(([label, value], i) => {
        const fill = i === totalRows.length - 1 ? headerGray : null;
        drawBox(doc, sumX, sumY, labelW, sumRowH, fill);
        drawBox(doc, sumX + labelW, sumY, valueW, sumRowH, fill);

        doc.font(i === totalRows.length - 1 ? "Helvetica-Bold" : "Helvetica").fontSize(8.5);
        doc.text(label, sumX + 6, sumY + 7, {
          width: labelW - 12,
          align: "right",
        });
        doc.text(value, sumX + labelW + 4, sumY + 7, {
          width: valueW - 8,
          align: "right",
        });

        sumY += sumRowH;
      });

      // ===== PIE =====
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(gray)
        .text(
          "Documento generado automáticamente por Marketplace Nexora. Este archivo sirve como comprobante de compra.",
          left,
          pageHeight - 45,
          {
            width: contentWidth,
            align: "left",
          }
        );

      doc
        .font("Helvetica-Oblique")
        .fontSize(7.5)
        .fillColor(gray)
        .text(
          `Factura emitida el ${formatDate(now)} ${now.toLocaleTimeString("es-CR", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          left,
          pageHeight - 28,
          {
            width: contentWidth,
            align: "right",
          }
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