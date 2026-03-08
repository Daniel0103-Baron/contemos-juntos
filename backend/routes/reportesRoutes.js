const express = require('express');
const router = express.Router();
const { descargarComprobante, getReporteAuditoria } = require('../controllers/reportesController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

// Solo Operador(2), Admin(1), Auditor(4)
router.get('/comprobantes/:id/pdf', verificarRol([1, 2, 4]), descargarComprobante);

// Solo Admin(1) y Auditor(4)
router.get('/auditoria', verificarRol([1, 4]), getReporteAuditoria);

module.exports = router;
