const mongoose = require("mongoose");

// Diploma est un sous-document de student.
const diplomSchema = new mongoose.Schema({
  url_SmartContract: String,
  mention: String,
  status: String,
  id_batch: { type: mongoose.Schema.Types.ObjectId, ref: "batches" },
})

const studentSchema = new mongoose.Schema({
  email: {type: String, unique: true},
  firstname: {type: String},
  lastname: {type: String},
  birth_date: {type: String},
  diplomas: [diplomSchema]
});

module.exports = mongoose.model('students', studentSchema);

