const express = require('express');
const router = express.Router();
const Card_controller = require('../controller/index');
const { auth } = require('../Middleware/auth');
// authen User =====================================
router.post('/login', Card_controller.login);
router.get('/getprofile', auth, Card_controller.getprofile);
router.put('/updateprofile/:_id', auth, Card_controller.updateProfile);
router.post('/createUser_admin', Card_controller.createUserAdmin);
router.get('/getUser_admin', Card_controller.getdataUserAdmin);
// authen User =====================================
// router.post('/create_card', Card_controller.CreateScreenCardUser);
// router.get('/getcard', Card_controller.GetScreenCardUser);
router.post('/log_login', Card_controller.LogloginUser);
router.get('/genTokenQrCode', auth, Card_controller.GetTokenQRCode);
router.get('/getProfileCard', Card_controller.GetProfileCard);

module.exports = router;
