const mongoose = require("mongoose");

// Template est un sous-document de School
const templateSchema = new mongoose.Schema({
  template_name: {type: String, unique: true, sparse: true, required: true},
  template_dimensions: {type: mongoose.Schema.Types.Mixed},
  qrcode_field: {type: mongoose.Schema.Types.Mixed, required: true},
  firstname_field: {type: mongoose.Schema.Types.Mixed, required: true},
  lastname_field: {type: mongoose.Schema.Types.Mixed, required: true},
  birth_date_field: {type: mongoose.Schema.Types.Mixed},
  curriculum_field: {type: mongoose.Schema.Types.Mixed},
  promo_field: {type: mongoose.Schema.Types.Mixed},
  year_field: {type: mongoose.Schema.Types.Mixed, required: true},
  mention_field: {type: mongoose.Schema.Types.Mixed},
  background_image_field: {type: mongoose.Schema.Types.Mixed, required: true},
  static_fields: [{type: mongoose.Schema.Types.Mixed}]
})

const schoolSchema = new mongoose.Schema({
  name: String,
  user_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  templates: [templateSchema]
});

module.exports = mongoose.model('schools', schoolSchema);

