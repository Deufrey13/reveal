var express = require("express");
var router = express.Router();
const BatchModel = require("../models/batches");
const schoolModel = require("../models/schools");
const studentModel = require("../models/students");
const fs = require("fs");


router.post("/create-batch", async (req, res) => {
  const searchBatch = await BatchModel.findOne({
    year: req.body.year,
    curriculum: req.body.curriculum,
    promo: req.body.promo,
    schoolId: req.body.school_id,
  });
  if (searchBatch) {
    return res.json({ result: false, msg: "Batch deja existant" });
  }
  const newBatch = new BatchModel({
    year: req.body.year,
    curriculum: req.body.curriculum,
    promo: req.body.promo,
    schoolId: req.body.school_id,
    studentsId: [],
    templateName: req.body.templateName,
  });
  const savedBatch = await newBatch.save();
  if (savedBatch) res.json({ result: true, msg: "Batch cree" });
});


router.get("/delete-pdf", async (req, res) => {
  const path = `./client/public/diploma_student${req.query.studentId}_batch${req.query.batchId}.pdf`;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
    return res.json({ result: true, msg: "File supprime" });
  }
  res.json({ result: false, msg: "File non existant" });
});


// Retourne TOUS les batches d'une School
router.get("/batch", async (req, res) => {
  const school_batches = await BatchModel.find({
    schoolId: req.query.school_id,
  });
  console.log('ID : ', req.query.school_id);
  if (school_batches.length === 0 || !school_batches) {
    return res.json({
      success: false,
      message: "no template or no school for this school id",
    });
  }
  return res.json({ success: true, batches: school_batches });
});


router.post("/post-csv-import", async (req, res) => {
  ///// 1 - save diploma in the student document
  const dataStudent = req.body;
  //console.log('DATA: ', dataStudent);
  const batchId = dataStudent.diplomas[0].id_batch;
  let student = await studentModel.findOne({
    email: dataStudent.email,
  });
  // Check if diploma is already registered in the student data.
  if (student) {
    const diplomaIsAlreadyRegistered =
      student.diplomas.filter((diploma) => diploma.id_batch == batchId).length >
      0;
    if (diplomaIsAlreadyRegistered) {
      return res.json({
        success: true,
        message: `this diploma was already registered to the student ${student.lastname}`,
      });
    }
    student.diplomas.push(dataStudent.diplomas[0]);
  }
  //console.log('STUDENT 1: ', student);
  if (!student) {
    student = new studentModel({ ...dataStudent });
  }
  //console.log('STUDENT 2: ', student);
  const studentSaved = await student.save();

  if (!studentSaved._id) {
    return res.json({
      success: false,
      message: `data of student with email ${dataStudent.email} are not saved.`,
    });
  }

  ///// 2 - add student._id in the batch document
  let batch = await BatchModel.findOne({
    _id: dataStudent.diplomas[0].id_batch,
  });
  if (!batch) {
    return res.json({
      success: false,
      message: `Impossible to find the batch with id: ${dataStudent.diplom_student[0].id_batch}.`,
    });
  }
  //console.log('BATCH: ', batch);
  if (!batch.studentsId.includes(studentSaved._id)) {
    batch.studentsId.push(studentSaved._id);
  }
  const batchSaved = await batch.save();

  if (!batchSaved._id) {
    return res.json({
      success: false,
      message: `Enabled to save student id (${studentSaved._id}) in the document of batch with id: ${dataStudent.diplom_student[0].id_batch}.`,
    });
  }
  //console.log(`student ${studentSaved.lastname} saved in Batch`)
  res.json({ success: true });
});


// Retourne tous les batches d'une School pour une année donnée, les batches sont peuplés par les Students
router.get("/batches-populated", async (req, res) => {
  const batchesOfYearWithStudents = await BatchModel.find({
    schoolId: req.query.schoolId,
    year: req.query.year,
  }).populate("studentsId");

  if (!batchesOfYearWithStudents) {
    return res.json({
      success: false,
      message: "no batches match the given schoolId and year",
    });
  }
  return res.json({ success: true, batchesOfYearWithStudents });
});


router.get("/get-school", async (req, res) => {
  const searchSchool = await schoolModel.findById(req.query.school_id);
  if (!searchSchool) {
    res.json({ result: false, msg: "Ecole non existante" });
  } else {
    res.json({ result: true, school: searchSchool });
  }
});


router.post("/update-student", async (req, res) => {
  const {
    studentId,
    firstname,
    lastname,
    birth_date,
    email,
    diplomaId,
    status,
    mention
  } = req.body;

  const student = await studentModel.findById(studentId);

  student.firstname = firstname;
  student.lastname = lastname;
  student.email = email;
  student.birth_date = birth_date;
  const diplomaIndex = student.diplomas.findIndex(
    (diploma) => diploma._id == diplomaId
  );
  student.diplomas[diplomaIndex].status = status;
  student.diplomas[diplomaIndex].mention = mention;
  const updated = await student.save();

  if (!updated._id) {
    return res.json({
      result: false,
      message: "student informations not updated.",
    });
  }
  res.json({ result: true });
});


router.get("/get-student", async (req, res) => {
  // Sépare les nom et prénom fournis car ils sont dans une même string
  const name = req.query.student_name.split('-');

  const searchStudent = await studentModel.findOne({firstname: name[0], lastname: name[1]});

  if (!searchStudent) return res.json({ result: false, msg: "Etudiant non existant" });
  res.json({ result: true, student: searchStudent });
})


router.get("/get-batch", async (req, res) => {
  // Sépare les curriculum et l'année fournis car ils sont dans une même string
  const batch = req.query.batch_curriculum_year.split('-')

  const searchBatch = await BatchModel.findOne({curriculum: batch[0], year: batch[1]});

  if (!searchBatch) return res.json({ result: false, msg: "Batch non existant" });
  res.json({ result: true, batch: searchBatch });
})


module.exports = router;