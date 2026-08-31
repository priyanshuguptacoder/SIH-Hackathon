const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const authMiddleware = require('../middleware/auth');
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
  triggerExtraction,
} = require('../controllers/documentsController');

// Ensure uploads dir exists at startup
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `doc-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, JPG, and PNG files are allowed'));
  },
});

router.post('/upload',          authMiddleware, upload.single('file'), uploadDocument);
router.get('/',                 authMiddleware, getDocuments);
router.delete('/:id',           authMiddleware, deleteDocument);
router.post('/:id/extract',     authMiddleware, triggerExtraction);

module.exports = router;
