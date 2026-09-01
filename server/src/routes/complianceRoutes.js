const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const authMiddleware = require('../middleware/auth');
const { getComplianceItems, getComplianceItem, updateComplianceItem } = require('../controllers/complianceController');
const ComplianceItem = require('../models/ComplianceItem');
const Industry       = require('../models/Industry');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `proof-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, JPG, and PNG files are allowed'));
  },
});

// @route  POST /compliance/:id/proof
// @desc   Upload proof of compliance for an item
// @access Protected
router.post('/:id/proof', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' } });
    }

    const item = await ComplianceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Compliance item not found' } });
    }

    const industry = await Industry.findById(item.industryId);
    if (!industry || (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin')) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    item.proofUrl = `/uploads/${req.file.filename}`;
    await item.save();

    return res.json({ success: true, data: item });
  } catch (error) {
    console.error('Upload Proof Error:', error.message);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error uploading proof' } });
  }
});

router.get('/',    authMiddleware, getComplianceItems);
router.get('/:id', authMiddleware, getComplianceItem);
router.put('/:id', authMiddleware, updateComplianceItem);

module.exports = router;
