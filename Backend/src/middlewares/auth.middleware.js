// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  console.log('📌 Headers:', req.headers);
  
  const authHeader = req.headers.authorization;
  console.log('📌 Auth Header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No token provided');
    return res.status(401).json({
      message: 'Unauthorized: No token provided'
    });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('📌 Token:', token);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    console.log('✅ Decoded token:', decoded);
    
    req.user = decoded;
    console.log('✅ req.user set:', req.user);
    
    next();
  } catch (err) {
    console.log('❌ Invalid token:', err.message);
    return res.status(401).json({
      message: 'Unauthorized: Invalid token'
    });
  }
};

module.exports = { verifyToken };