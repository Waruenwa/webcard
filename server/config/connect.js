const mongoose = require('mongoose');
// const DB_URI =
//   'mongodb://chase:Adm1nP%40ssw0rd23!@10.0.143.206:27017/MobileApp?authMechanism=DEFAULT&authSource=MobileApp';
const DB_URI = 'mongodb://127.0.0.1:27017/Namecard';
const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connect MongoDB Success');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB:', error);
  }
};

module.exports = {
  connectDB,
};
