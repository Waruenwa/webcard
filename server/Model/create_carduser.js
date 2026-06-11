const mongoose = require('mongoose');
const CreateCardUserSchema = mongoose.Schema(
  {
    fname: String,
    tname: String,
    position: String,
    phone: String,
    phone_off: String,
    email: String,
    password: String,
    role: String,
    image_mem: String,
    status: String,
    theme_card: String,
    images: String,
    name_person: String,
    name_com: String,
    support: String,
    status_Pass: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_carduser', CreateCardUserSchema);
