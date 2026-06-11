const mongoose = require('mongoose');
const CreateScreenCardUserSchema = mongoose.Schema(
  {
    screenshot: String,
    name_user: String,
    name_img_user: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'create_screencarduser',
  CreateScreenCardUserSchema
);
