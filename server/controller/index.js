const CreateCardUser = require('../Model/create_carduser');
// const CreateScreenCardUser = require('../Model/create_screencard');
const LogloginUser = require('../Model/log_login');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
// const puppeteer = require('puppeteer');

// authen User =====================================
// module.exports.login = async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     // ตรวจสอบว่าได้ส่ง email และ password มาหรือไม่
//     if (!email || !password) {
//       return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
//     }

//     // ลบช่องว่างด้านหน้าและด้านหลังของ email
//     email = email.trim();

//     // ค้นหาผู้ใช้จากฐานข้อมูลแบบ case-insensitive
//     const user = await CreateCardUser.findOne({
//       email: { $regex: new RegExp(`^${email}$`, 'i') },
//     });

//     if (!user) {
//       return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
//     }

//     // ตรวจสอบรหัสผ่านแบบ Plain Text
//     if (password !== user.password) {
//       return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
//     }

//     // สร้าง payload สำหรับ JWT
//     const payload = {
//       user: {
//         _id: user._id,
//         fname: user.fname,
//         tname: user.tname,
//         position: user.position,
//         phone: user.phone,
//         phone_off: user.phone_off,
//         email: user.email,
//         role: user.role,
//         password: user.password,
//         status_Pass: user.status_Pass,
//       },
//     };

//     // สร้าง JWT Token
//     jwt.sign(
//       payload,
//       process.env.SecretKey,
//       { expiresIn: '1d' },
//       (err, token) => {
//         if (err) throw err;

//         // ✅ ใช้ CryptoJS เข้ารหัส token
//         const encryptedToken = CryptoJS.AES.encrypt(
//           token,
//           process.env.SecretKey
//         ).toString();

//         return res
//           .status(200)
//           .json({ status: true, user: payload.user, token: encryptedToken });
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// };
module.exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // ตรวจสอบ input
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: 'กรุณากรอกอีเมลและรหัสผ่าน',
      });
    }

    email = String(email).trim();
    password = String(password);

    // Escape email ก่อนเอาไปใช้กับ RegExp ป้องกัน regex injection
    const escapeRegex = (value) => {
      return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // ค้นหาผู้ใช้แบบ case-insensitive
    const user = await CreateCardUser.findOne({
      email: {
        $regex: new RegExp(`^${escapeRegex(email)}$`, 'i'),
      },
    });

    // ไม่บอกว่า email ผิดหรือ password ผิด
    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      });
    }

    // ตรวจสอบรหัสผ่าน
    // หมายเหตุ: ตอนนี้ยังเป็น plain text ตามระบบเดิม
    if (password !== user.password) {
      return res.status(401).json({
        status: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      });
    }

    // payload สำหรับ JWT
    // ห้ามใส่ password ลง token
    const payload = {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    };

    // user object ที่ปลอดภัยสำหรับส่งกลับ frontend
    // ห้ามมี password
    const safeUser = {
      _id: user._id,
      fname: user.fname,
      tname: user.tname,
      position: user.position,
      phone: user.phone,
      phone_off: user.phone_off,
      email: user.email,
      role: user.role,
      status_Pass: user.status_Pass,
    };

    // สร้าง JWT Token
    const token = jwt.sign(payload, process.env.SecretKey, {
      expiresIn: '1d',
    });

    // เข้ารหัส token ตาม logic เดิมของระบบ
    const encryptedToken = CryptoJS.AES.encrypt(
      token,
      process.env.SecretKey,
    ).toString();

    return res.status(200).json({
      status: true,
      user: safeUser,
      token: encryptedToken,
    });
  } catch (error) {
    // log ฝั่ง server ได้ แต่ห้ามส่ง error detail กลับ frontend
    console.error('Login error:', error);

    return res.status(500).json({
      status: false,
      message: 'เกิดข้อผิดพลาดในระบบ',
    });
  }
};

module.exports.getprofile = async (req, res) => {
  try {
    // ดึง ID ของ user ที่ล็อกอินอยู่จาก middleware auth
    const email = req.user.email;

    // ค้นหาข้อมูล user จากฐานข้อมูล
    const user = await CreateCardUser.findOne({ email: email }).select(
      '-password',
    );

    if (!user) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }

    // return res.status(200).json({ user });
    return res.status(200).json({ status: true, data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const userIdFromToken = req.user._id;
    const userIdFromParams = req.params._id;

    if (userIdFromToken !== userIdFromParams) {
      return res.status(403).json({
        status: false,
        message: 'Unauthorized: ไม่สามารถอัปเดตบัญชีของคนอื่นได้',
      });
    }

    // ✅ ตรวจสอบว่า body มีแค่ password เท่านั้น
    if (!req.body.password) {
      return res.status(400).json({
        status: false,
        message: 'กรุณาระบุ password ที่ต้องการอัปเดต',
      });
    }

    const allowedFields = ['password', 'status_Pass'];
    console.log('Body received:', req.body);
    const bodyKeys = Object.keys(req.body);

    if (bodyKeys.some((key) => !allowedFields.includes(key))) {
      return res.status(400).json({
        status: false,
        message: 'สามารถอัปเดตได้เฉพาะ password เท่านั้น',
      });
    }

    // Mark the first-login password reset as completed on the server.
    const updated = await CreateCardUser.findOneAndUpdate(
      { _id: userIdFromParams },
      {
        password: req.body.password,
        status_Pass: 'Y',
      },
      { new: true },
    )
      .select('-password')
      .exec();

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      });
    }

    return res.json({
      status: true,
      message: 'Password updated successfully',
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

module.exports.createUserAdmin = async (req, res) => {
  try {
    // code
    console.log(req.body);
    const dataUser = await CreateCardUser(req.body).save();
    return res.json({ status: true, data: dataUser });
  } catch (err) {
    // error
    console.log(err);
    res.status(500).send('Server Error');
  }
};

module.exports.getdataUserAdmin = async (req, res) => {
  try {
    // code
    const dataget = await CreateCardUser.find({})
      .sort({ createdAt: -1 })
      .exec();
    // console.log(dataget,'oo')
    return res.json({ status: true, data: dataget });
  } catch (err) {
    // error
    console.log(err);
    res.status(500).send('Server Error');
  }
};
// authen User =====================================

// Bookcard ทั้งหมด
// module.exports.CreateScreenCardUser = async (req, res) => {
//   try {
//     const { name_img_user, namefile, name_user } = req.body;
//     if (!namefile) return res.status(400).json({ message: 'Missing URL' });

//     // Start puppeteer and capture screenshot
//     const browser = await puppeteer.launch({
//       headless: 'new',
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     });
//     const page = await browser.newPage();
//     await page.goto(namefile, { waitUntil: 'networkidle2' });

//     const element = await page.$('#capture');
//     if (!element) {
//       await browser.close();
//       return res
//         .status(400)
//         .json({ status: 'error', message: 'Element not found' });
//     }

//     const screenshot = await element.screenshot({ encoding: 'base64' });
//     await browser.close();

//     const newData = { screenshot, name_user, name_img_user };
//     // const datacard = await CreateScreenCardUser.create(newData);

//     return res.json({ status: true, data: newData });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Error' });
//   }
// };

// module.exports.GetScreenCardUser = async (req, res) => {
//   try {
//     const dataUserReq = await CreateScreenCardUser.find({})
//       .sort({ createdAt: -1 })
//       .exec();
//     return res.json({ status: true, data: dataUserReq });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('Server Error');
//   }
// };
// Bookcard ทั้งหมด

module.exports.LogloginUser = async (req, res) => {
  try {
    // code
    console.log(req.body);
    const logdata = await LogloginUser(req.body).save();
    return res.json({ status: true, data: logdata });
  } catch (err) {
    // error
    console.log(err);
    res.status(500).send('Server Error');
  }
};

module.exports.GetTokenQRCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const token = jwt.sign({ userId: userId }, process.env.CARD_JWT_KEY, {
      expiresIn: '1d',
    });
    return res.json({ status: true, data: token });
  } catch (err) {
    // error
    console.log(err);
    res.status(500).send('Server Error');
  }
};

module.exports.GetProfileCard = async (req, res) => {
  try {
    // ดึง ID ของ user ที่ล็อกอินอยู่จาก middleware auth
    const token = req.query.token ?? '';
    if (!token || token === '' || token === null) {
      return res.status(401).send('Token decryption failed');
    }

    const decode = jwt.verify(token, process.env.CARD_JWT_KEY);
    if (!decode) {
      return res.status(401).send('Token decryption failed');
    }

    const user = await CreateCardUser.findById(decode.userId).select(
      '-password',
    ); // ไม่ส่ง password กลับไป
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }

    // return res.status(200).json({ user });
    return res.status(200).json({ status: true, data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
