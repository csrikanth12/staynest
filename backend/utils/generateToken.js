const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'stayguard_jwt_super_secret_key_2025_secure', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
