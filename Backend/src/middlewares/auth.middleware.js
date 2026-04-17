// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({
//       message: 'Unauthorized: No token provided'
//     });
//   }
  
//   const token = authHeader.split(' ')[1];
  
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
//      console.log('🔍 Decoded token:', decoded);
//     // req.user = decoded; // Lưu thông tin user từ token
//      req.user = {
//       id: decoded.sub,  // 👈 Map sub thành id
//       username: decoded.username,
//       role: decoded.role,
//       ...decoded
//     };
    
//     next();
//   } catch (err) {
//     return res.status(401).json({
//       message: 'Unauthorized: Invalid token'
//     });
//   }
// };

// middlewares/auth.middleware.js
const verifyToken = (req, res, next) => {
  console.log('📌 Headers:', req.headers); // Debug headers
  
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