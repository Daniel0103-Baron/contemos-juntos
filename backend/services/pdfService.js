const PDFDocument = require('pdfkit');

const COLORS = {
    primary: '#0f766e',
    primarySoft: '#ccfbf1',
    border: '#cbd5e1',
    text: '#0f172a',
    muted: '#475569',
    tableHeader: '#e2e8f0'
};

const formatDateTime = (value) => {
    if (!value) return 'No registrada';
    return new Date(value).toLocaleString('es-CO');
};

const drawInfoCard = (doc, x, y, width, title, rows) => {
    const headerHeight = 24;
    const lineHeight = 18;
    const contentHeight = Math.max(rows.length * lineHeight + 16, 50);
    const cardHeight = headerHeight + contentHeight;

    doc.save();
    doc.roundedRect(x, y, width, cardHeight, 8).lineWidth(1).strokeColor(COLORS.border).stroke();

    doc.roundedRect(x, y, width, headerHeight, 8).fillAndStroke(COLORS.primarySoft, COLORS.border);
    doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(10).text(title, x + 12, y + 7);

    let textY = y + headerHeight + 10;
    rows.forEach((row) => {
        doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(10).text(`${row.label}:`, x + 12, textY, {
            continued: true
        });
        doc.fillColor(COLORS.text).font('Helvetica').text(` ${row.value ?? '-'}`);
        textY += lineHeight;
    });

    doc.restore();
    return y + cardHeight;
};

const generateComprobantePDF = async (comprobante_id, entregaDatos, detalles, res) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 48, size: 'A4' });

            // Configurar headers para que el navegador lo muestre/descargue
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=comprobante_${entregaDatos.numero_comprobante}.pdf`);

            // Pipe output to the response stream
            doc.pipe(res);

            const pageWidth = doc.page.width;
            const usableWidth = pageWidth - doc.page.margins.left - doc.page.margins.right;
            const left = doc.page.margins.left;

            // Header principal
            doc.roundedRect(left, 30, usableWidth, 84, 12).fill(COLORS.primary);

            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('Contemos Juntos', left, 52, {
                width: usableWidth,
                align: 'center'
            });
            doc.font('Helvetica').fontSize(11).text('Sistema de Control y Trazabilidad de Ayudas Humanitarias', {
                width: usableWidth,
                align: 'center'
            });

            doc.y = 132;

            doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(16).text('COMPROBANTE DE ENTREGA', {
                align: 'center'
            });
            doc.moveDown(0.2);
            doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(11).text(`No. ${entregaDatos.numero_comprobante}`, {
                align: 'center'
            });

            doc.moveDown(1.2);
            const cardY = doc.y;
            const gap = 14;
            const cardWidth = (usableWidth - gap) / 2;

            const basicInfoBottom = drawInfoCard(doc, left, cardY, cardWidth, 'INFORMACION DE ENTREGA', [
                { label: 'Fecha', value: formatDateTime(entregaDatos.fecha_entrega) },
                { label: 'Responsable', value: entregaDatos.operador || 'No registrado' },
                { label: 'Estado', value: entregaDatos.estado || 'SIN ESTADO' }
            ]);

            const beneficiaryBottom = drawInfoCard(doc, left + cardWidth + gap, cardY, cardWidth, 'DATOS DE LA FAMILIA', [
                { label: 'Codigo familia', value: entregaDatos.codigo_familia || 'N/A' },
                {
                    label: 'Representante',
                    value: (entregaDatos.nombre_representante || '').trim() || 'No registrado'
                },
                { label: 'Comprobante', value: entregaDatos.numero_comprobante || '-' }
            ]);

            doc.y = Math.max(basicInfoBottom, beneficiaryBottom) + 22;

            // Tabla de detalle
            doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(12).text('Detalle de ayudas entregadas');
            doc.moveDown(0.5);

            const tableX = left;
            const tableWidth = usableWidth;
            const colItem = 56;
            const colCantidad = 90;
            const colDescripcion = tableWidth - colItem - colCantidad;
            const headerY = doc.y;
            const rowHeight = 26;

            doc.rect(tableX, headerY, tableWidth, rowHeight).fill(COLORS.tableHeader);
            doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(10);
            doc.text('#', tableX + 10, headerY + 8, { width: colItem - 20, align: 'center' });
            doc.text('Ayuda', tableX + colItem + 10, headerY + 8, { width: colDescripcion - 20 });
            doc.text('Cantidad', tableX + colItem + colDescripcion + 10, headerY + 8, {
                width: colCantidad - 20,
                align: 'center'
            });

            let currentY = headerY + rowHeight;
            const safeDetalles = Array.isArray(detalles) ? detalles : [];

            safeDetalles.forEach((item, index) => {
                if (currentY + rowHeight > doc.page.height - 130) {
                    doc.addPage();
                    currentY = doc.page.margins.top;
                }

                doc.rect(tableX, currentY, tableWidth, rowHeight).lineWidth(1).strokeColor(COLORS.border).stroke();
                doc.fillColor(COLORS.text).font('Helvetica').fontSize(10);
                doc.text(String(index + 1), tableX + 10, currentY + 8, { width: colItem - 20, align: 'center' });
                doc.text(item.nombre_tipo || 'Ayuda', tableX + colItem + 10, currentY + 8, { width: colDescripcion - 20 });
                doc.text(String(item.cantidad || 0), tableX + colItem + colDescripcion + 10, currentY + 8, {
                    width: colCantidad - 20,
                    align: 'center'
                });

                currentY += rowHeight;
            });

            if (safeDetalles.length === 0) {
                doc.rect(tableX, currentY, tableWidth, rowHeight).lineWidth(1).strokeColor(COLORS.border).stroke();
                doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10).text('No hay detalles de ayuda registrados.', tableX + 12, currentY + 8);
                currentY += rowHeight;
            }

            doc.y = currentY + 20;
            doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9).text(`Emitido por Contemos Juntos el ${formatDateTime(new Date())}`, {
                align: 'left'
            });

            // Firmas
            const signaturesY = Math.max(doc.y + 24, doc.page.height - 120);
            const signatureWidth = 180;
            const rightX = pageWidth - doc.page.margins.right - signatureWidth;

            doc.moveTo(left + 20, signaturesY).lineTo(left + 20 + signatureWidth, signaturesY).strokeColor('#334155').stroke();
            doc.moveTo(rightX, signaturesY).lineTo(rightX + signatureWidth, signaturesY).strokeColor('#334155').stroke();

            doc.fillColor(COLORS.text).font('Helvetica').fontSize(10);
            doc.text('Firma Funcionario', left + 20, signaturesY + 8, { width: signatureWidth, align: 'center' });
            doc.text('Firma Beneficiario', rightX, signaturesY + 8, { width: signatureWidth, align: 'center' });

            doc.end();
            resolve();
        } catch (error) {
            console.error('Error generando PDF:', error);
            reject(error);
        }
    });
};

module.exports = {
    generateComprobantePDF
};
