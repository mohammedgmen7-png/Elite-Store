const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware للتحقق من التوكن
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

// تسجيل مستخدم جديد
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password || !phone) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'المستخدم موجود بالفعل' });
    }

    const user = new User({ username, email, password, phone });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'تم التسجيل بنجاح',
      token,
      user: { id: user._id, username, email }
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في التسجيل: ' + error.message });
  }
});

// تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبة' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'بيانات دخول غير صحيحة' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'بيانات دخول غير صحيحة' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'تم الدخول بنجاح',
      token,
      user: { id: user._id, username: user.username, email }
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في الدخول: ' + error.message });
  }
});

// الحصول على بيانات المستخدم
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;