const mongoose = require('mongoose');
const LogloginUserSchema = mongoose.Schema(
  {
    fname: String,
    email: String,
    password: String,
    role: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_loglogin', LogloginUserSchema);
