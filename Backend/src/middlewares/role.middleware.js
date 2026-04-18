// middlewares/role.middleware.js
const requireRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    console.log('🔍 Checking role - User role:', userRole);
    console.log('🔍 Required roles:', roles);
    
    if (!userRole) {
      return res.status(401).json({ 
        message: 'Unauthorized: No role found' 
      });
    }
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Forbidden: ${userRole} cannot access this resource`,
        requiredRoles: roles
      });
    }
    
    next();
  };
};

module.exports = { requireRole };