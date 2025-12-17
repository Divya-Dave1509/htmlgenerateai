const express = require('express');
const router = express.Router();
const convertController = require('../controllers/convertController');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/image', upload.single('image'), convertController.convertImage);
router.post('/figma', convertController.convertFigma);
router.post('/refine', convertController.refineCode);

module.exports = router;
