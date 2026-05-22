const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const Game = require('../models/Game');

// Middleware للتحقق من الأدمن
const verifyAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'لا يوجد توكن' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'غير مصرح' });
    }
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'توكن غير صالح' });
  }
};

// تسجيل دخول الأدمن
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    const admin = await Admin.findOne({ username: 'admin' });
    if (!admin) {
      return res.status(400).json({ error: 'الأدمن غير موجود' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign(
      { adminId: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'تم دخول الأدمن بنجاح',
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// الحصول على جميع الطلبات المعلقة
router.get('/orders/pending', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' })
      .populate('userId', 'username email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// الحصول على جميع الطلبات
router.get('/orders/all', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// موافقة على طلب
router.post('/orders/:orderId/approve', verifyAdmin, async (req, res) => {
  try {
    const { notes } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    order.status = 'completed';
    order.approvedAt = new Date();
    order.approvedBy = req.adminId;
    order.notes = notes || '';

    await order.save();

    res.json({
      success: true,
      message: 'تم موافقة الطلب بنجاح ✅',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// رفض طلب
router.post('/orders/:orderId/reject', verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    order.status = 'rejected';
    order.rejectionReason = reason || 'تم الرفض من قبل الأدمن';

    await order.save();

    res.json({
      success: true,
      message: 'تم رفض الطلب',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// إحصائيات
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const rejectedOrders = await Order.countDocuments({ status: 'rejected' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      rejectedOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;