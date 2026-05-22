const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// إعداد Multer لرفع الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/proofs';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'لا يوجد توكن' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'توكن غير صالح' });
  }
};

// إنشاء طلب شحن جديد
router.post('/create', verifyToken, upload.single('paymentProof'), async (req, res) => {
  try {
    const { gameId, gameName, playerID, amount, packageType } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'صورة الإشعار مطلوبة' });
    }

    if (!gameId || !gameName || !playerID || !amount || !packageType) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const order = new Order({
      userId: req.userId,
      gameId,
      gameName,
      playerID,
      amount,
      packageType,
      paymentProof: `/uploads/proofs/${req.file.filename}`,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح. انتظر موافقة الأدمن',
      order
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إنشاء الطلب: ' + error.message });
  }
});

// الحصول على طلبات المستخدم
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// الحصول على تفاصيل طلب معين
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order || order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'غير مصرح' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;