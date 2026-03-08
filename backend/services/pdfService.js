const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateComprobantePDF = async (comprobante_id, entregaDatos, detalles, res) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });

            // Configurar headers para que el navegador lo muestre/descargue
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=comprobante_${entregaDatos.numero_comprobante}.pdf`);

            // Pipe output to the response stream
            doc.pipe(res);

            // Cabecera institucional
            doc.fontSize(20).font('Helvetica-Bold').text('Contemos Juntos', { align: 'center' });
            doc.fontSize(12).font('Helvetica').text('Sistema de Control y Trazabilidad de Ayudas Humanitarias', { align: 'center' });
            doc.moveDown(2);

            // Título
            doc.fontSize(16).font('Helvetica-Bold').text(`COMPROBANTE DE ENTREGA`, { align: 'center' });
            doc.fontSize(12).font('Helvetica').text(`N°: ${entregaDatos.numero_comprobante}`, { align: 'center' });
            doc.moveDown(2);

            // Información General
            doc.fontSize(11).font('Helvetica-Bold').text('Información Básica:');
            doc.font('Helvetica').text(`Fecha de Entrega: ${new Date(entregaDatos.fecha_entrega).toLocaleString()}`);
            doc.text(`Funcionario Responsable: ${entregaDatos.operador}`);
            doc.moveDown();

            // Información Familia
            doc.font('Helvetica-Bold').text('Datos del Beneficiario:');
            doc.font('Helvetica').text(`Código de Familia: ${entregaDatos.codigo_familia}`);
            doc.text(`Representante: ${(entregaDatos.nombre_representante || '').trim() || 'No registrado'}`);
            doc.moveDown(2);

            // Tabla de Detalles (Formato Simple)
            doc.font('Helvetica-Bold');
            doc.text('Detalle de Ayuda Entregada:', { underline: true });
            doc.moveDown(0.5);

            detalles.forEach((item, index) => {
                doc.font('Helvetica').text(`${index + 1}. ${item.nombre_tipo} - Cantidad: ${item.cantidad}`);
            });

            doc.moveDown(3);

            // Firmas
            doc.font('Helvetica-Bold');
            doc.text('_______________________', 50, doc.y, { align: 'center', continued: true });
            doc.text('_______________________', 300, doc.y, { align: 'center' });

            doc.font('Helvetica');
            doc.text('Firma Funcionario', 50, doc.y + 15, { align: 'center', width: 200 });
            doc.text('Firma Beneficiario', 350, doc.y, { align: 'center', width: 200 });

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
