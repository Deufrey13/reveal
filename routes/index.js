var express = require("express");
var router = express.Router();
const BatchModel = require("../models/batches");
const schoolModel = require("../models/schools");
const studentModel = require("../models/students");
const PDFDocument = require("pdfkit");
const fs = require("fs");
var cloudinary = require("cloudinary").v2;
const fetch = require("node-fetch");

const pdfWidth = 841.89;
const pdfHeight = 595.28;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/create-batch", async (req, res) => {
  const searchBatch = await BatchModel.findOne({
    year: req.body.year,
    curriculum: req.body.curriculum,
    promo: req.body.promo,
    school_id: req.body.school_id,
  });
  if (searchBatch) {
    res.json({ result: false, msg: "Batch deja existant" });
  } else {
    const newBatch = new BatchModel({
      year: req.body.year,
      curriculum: req.body.curriculum,
      promo: req.body.promo,
      school_id: req.body.school_id,
      studentsId: [],
      templateName: req.body.templateName,
    });
    const savedBatch = await newBatch.save();
    if (savedBatch) res.json({ result: true, msg: "Batch cree" });
  }
});

const template = {
  firstNameField: {
    positionX: 300,
    positionY: 300,
  },
  lastNameField: {
    positionX: 450,
    positionY: 300,
  },
  cursusField: {
    positionX: 425,
    positionY: 400,
  },
  promoField: {
    positionX: 415,
    positionY: 200,
  },
  yearField: {
    positionX: 500,
    positionY: 200,
  },
  logoField: {
    url: "client/public/reveal.png",
    positionX: 100,
    positionY: 50,
    scale: 0.1,
  },
  signatureField: {
    url: "client/public/signature.png",
    positionX: 700,
    positionY: 550,
    scale: 0.1,
  },
  mentionField: {
    positionX: 410,
    positionY: 450,
  },
};

const student = {
  firstName: "Minh Chau",
  lastName: "Hoang",
};

const batch = {
  cursus: "Web Dev Fullstack JS",
  promo: 34,
  year: 2021,
  mention: "Tres bien",
};

router.get("/create-pdf", async (req, res) => {
  console.log("ok");
  const searchStudent = await studentModel.findById(req.query.studentId);
  const searchBatch = await BatchModel.findById(req.query.batchId);
  if (!searchStudent || !searchBatch) {
    res.json({ result: false, msg: "Student or batch not found" });
  } else if (
    fs.existsSync(
      `./client/public/diploma_student${req.query.studentId}_batch${req.query.batchId}.pdf`
    )
  ) {
    res.json({ result: false, msg: "File existe" });
  } else {
    console.log("ok2");
    const searchSchool = await schoolModel.findById(searchBatch.schoolId);
    const searchTemplate = searchSchool.templates.find(
      (template) => template.template_name === searchBatch.templateName
    );
    const doc = new PDFDocument({ size: "A4", layout: "landscape" });
    doc.pipe(
      fs.createWriteStream(
        `./client/public/diploma_student${req.query.studentId}_batch${req.query.batchId}.pdf`
      )
    );

    fetch(searchTemplate.background_image_field.imagePreview).then((res) => {
      const dest = fs.createWriteStream("./client/public/backgroundImage.jpg");
      res.body.pipe(dest);
      doc.image(
        "./client/public/backgroundImage.jpg",
        searchTemplate.background_image_field.position.x,
        searchTemplate.background_image_field.position.y,
        { width: 100, height: 100 }
      );
    });

    // const response = await fetch(searchTemplate.background_image_field.imagePreview);
    // const dest = fs.createWriteStream(
    //   "./client/public/backgroundImage.jpeg"
    // );
    // await response.body.pipe(dest);
    // doc.image(
    //   "./client/public/backgroundImage.jpeg",
    //   searchTemplate.background_image_field.position.x,
    //   searchTemplate.background_image_field.position.y,
    //   {
    //     width: 100,
    //       // (Number(
    //       //   searchTemplate.background_image_field.size.width.slice(
    //       //     0,
    //       //     searchTemplate.background_image_field.size.width.length - 1
    //       //   )
    //       // ) *
    //       //   pdfWidth) /
    //       // 100,
    //     height: 100
    //       // (Number(
    //       //   searchTemplate.background_image_field.size.height.slice(
    //       //     0,
    //       //     searchTemplate.background_image_field.size.height.length - 1
    //       //   )
    //       // ) *
    //       //   pdfHeight) /
    //       // 100,
    //   }
    // );

    doc.fontSize(searchTemplate.firstname_field.style.fontSize);
    doc
      .fillColor(searchTemplate.firstname_field.style.color)
      .text(
        searchStudent.firstname,
        searchTemplate.firstname_field.position.x,
        searchTemplate.firstname_field.position.y
      );
    doc.fontSize(searchTemplate.lastname_field.style.fontSize);
    doc
      .fillColor(searchTemplate.lastname_field.style.color)
      .text(
        searchStudent.lastname,
        searchTemplate.lastname_field.position.x,
        searchTemplate.lastname_field.position.y
      );
    doc
      .fillColor(searchTemplate.birth_date_field.style.color)
      .text(
        searchStudent.birth_date,
        searchTemplate.birth_date_field.position.x,
        searchTemplate.birth_date_field.position.y
      );
    doc
      .fillColor(searchTemplate.curriculum_field.style.color)
      .text(
        searchBatch.curriculum,
        searchTemplate.curriculum_field.position.x,
        searchTemplate.curriculum_field.position.y
      );
    doc
      .fillColor(searchTemplate.promo_field.style.color)
      .text(
        searchBatch.promo,
        searchTemplate.promo_field.position.x,
        searchTemplate.promo_field.position.y
      );
    doc
      .fillColor(searchTemplate.year_field.style.color)
      .text(
        searchBatch.year,
        searchTemplate.year_field.position.x,
        searchTemplate.year_field.position.y
      );
    doc
      .fillColor(searchTemplate.mention_field.style.color)
      .text(
        searchBatch.mention,
        searchTemplate.mention_field.position.x,
        searchTemplate.mention_field.position.y
      );

    // searchTemplate.static_fields.forEach((field, i) => {
    //   if (field.type === "text") {
    //     doc
    //       .fillColor(field.style.color)
    //       .text(field.value, field.position.x, field.position.y);
    //   } else {
    //     fetch(field.imagePreview).then((response) => {
    //       const dest = fs.createWriteStream(`./client/public/image${i}.png`);
    //       response.body.pipe(dest);
    //       doc.image(
    //         `./client/public/image${i}.png`,
    //         field.position.x,
    //         field.position.y,
    //         {
    //           width:
    //             Number(field.size.width.slice(0, field.size.width.length - 2)) *
    //             0.75,
    //           height:
    //             Number(
    //               field.size.height.slice(0, field.size.width.length - 2)
    //             ) * 0.75,
    //         }
    //       );
    //       fs.unlinkSync(`./client/public/image${i}.png`);
    //     });
    //   }
    // });

    doc.end();

    fs.unlinkSync("./client/public/backgroundImage.jpg");

    res.json({ result: true });
  }
});

router.get("/delete-pdf", async (req, res) => {
  if (
    fs.existsSync(
      `./client/public/diploma_student${req.query.studentId}_batch${req.query.batchId}.pdf`
    )
  ) {
    fs.unlinkSync(
      `./client/public/diploma_student${req.query.studentId}_batch${req.query.batchId}.pdf`
    );
    res.json({ result: true, msg: "File supprime" });
  } else {
    res.json({ result: false, msg: "File non existant" });
  }
});

router.post("/create-diploma", async (req, res) => {
  const searchStudent = await studentModel.findById(req.body.studentId);
  if (!searchStudent) {
    res.json({ result: false, msg: "Student non existant" });
  } else {
    const searchDiploma = searchStudent.diplomas.find(
      (diploma) => diploma.id_batch === req.body.id_batch
    );
    if (searchDiploma) {
      res.json({ result: false, msg: "Diplome deja existant" });
    } else {
      searchStudent.diplomas.push({
        id_batch: req.body.id_batch,
        mention: req.body.mention,
        status: req.body.status,
        url_SmartContract: "abc",
      });
      res.json({ result: true, msg: "Diplome cree" });
    }
  }
});

router.get("/batch", async (req, res) => {
  const school_batches = await BatchModel.find({
    schoolId: req.query.school_id,
  });
  /* const school_batches = [
    {year: 2020, curriculum: 'Bac Technologique', _id:'61015592b527c72f100f7481', id_School:'6101c0b6208679b2ab7f0884', template_name: 'Bac tec'},
    {year: 2021, curriculum: 'BTS mécanique', _id:'6101c206564b97b34f9e16ea', id_School:'6101c0b6208679b2ab7f0884', template_name: 'BTS méca'},
    {year: 2021, curriculum: 'BEP comptabilité', _id:'61015592b527c72f100f7483', id_School:'6101c0b6208679b2ab7f0884', template_name: 'BEP compta'}
  ] */
  if (school_batches.length === 0) {
    return res.json({
      success: false,
      message: "no template or no school for this school id",
    });
  }
  return res.json({ success: true, batches: school_batches });
});

router.get("/template", async (req, res) => {
  const school = await schoolModel.findOne({_id: req.query.school_id});
  
  /* const school = {
    _id: "6101084673a5f1dcafefa064c",
    client_id: ["60ffda648dac09e6d540eb27"],
    id_students: [],
    templates: [
      {
        _id: "010001",
        template_name: "Bac tec",
        firstname_field: {
          name: "prénom",
          position_x: 10,
          autresChamps: "PAS UTILE POUR LE MOMENT",
        },
        lastname_field: {
          name: "nom",
          position_x: 40,
          autresChamps: "PAS UTILE POUR LE MOMENT",
        },
        birth_date_field: {
          name: "date de naissance",
          position_x: 160,
          autresChamps: "PAS UTILE POUR LE MOMENT",
        },
        mention_field: {
          name: "mention",
          position_x: 280,
          autresChamps: "PAS UTILE POUR LE MOMENT",
        },
        autresChamps: "PAS UTILE POUR LE MOMENT",
      },
      {
        _id: "010002",
        template_name: "BTS méca",
        firstname_field: {
          name: "prénom",
          position_x: 10,
          autresChamps: "PAS UTILE POUR LE MOMENT",
        },
        lastname_field: {
          name: "nom",
          position_x: 40,
          autresChamps: "PAS UTILE POUR LE MOMENT",
        },
        birth_date_field: {
          name: "date de naissance",
          position_x: 160,
          autresChamps: "PAS UTILE POUR LE MOMENT",
        },
        mention_field: {
          name: "mention",
          position_x: 280,
          autresChamps: "PAS UTILE POUR LE MOMENT",
        },
        autresChamps: "PAS UTILE POUR LE MOMENT",
      },
      {
        _id: "010003",
        template_name: "BEP compta",
        firstname_field: {
          name: "prénom",
          position_x: 10,
          autresChamps: "PAS UTILE POUR LE MOMENT",
        },
        lastname_field: {
          name: "nom",
          position_x: 40,
          autresChamps: "PAS UTILE POUR LE MOMENT",
        },
        autresChamps: "PAS UTILE POUR LE MOMENT",
      },
    ],
  }; */

  const template = school.templates.filter(
    (item) => item.template_name === req.query.template_name
  );
    
  if (template.length === 0) {
    return res.json({
      success: false,
      message: "no template or no school found",
    });
  }
  //console.log('template: ', template[0]);
  return res.json({ success: true, template: template[0] });
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
  if (student){
    const diplomaIsAlreadyRegistered = student.diplomas.filter(diploma => diploma.id_batch == batchId).length > 0;
    if (diplomaIsAlreadyRegistered){
      return res.json({success: true, message: `this diploma was already registered to the student ${student.lastname}`});
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
  let batch = await BatchModel.findOne({_id: dataStudent.diplomas[0].id_batch});
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
  res.json({success: true});

  // AJOUTER AUSSI LE STUDENT ID DANS LA TABLE DE SA SCHOOL ????
});

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

module.exports = router;
