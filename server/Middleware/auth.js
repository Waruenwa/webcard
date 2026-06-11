const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

module.exports.auth = async (req, res, next) => {
  try {
    const token =
      req.headers['tokenmobile'] || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).send('No token');
    }

    try {
      // ✅ ใช้ CryptoJS ถอดรหัส token
      const bytes = CryptoJS.AES.decrypt(token, process.env.SecretKey);
      const originalToken = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalToken) {
        return res.status(401).send('Token decryption failed');
      }

      const decode = jwt.verify(originalToken, process.env.SecretKey);
      req.user = decode.user;
      next();
    } catch (decryptError) {
      return res.status(401).send('Invalid token');
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).send('Token expired'); // ถ้า token หมดอายุ
    }
    console.log(error);
    res.status(401).send('Token invalid or another error'); // กรณีอื่นๆ เช่น token ไม่ถูกต้อง
  }
};
