const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer');
const fs = require("fs");
const ejs = require("ejs");
const studentModel = require('../models/students');
const smartContractGenerator = require('../helpers/smartContractGenerator');
const BatchModel = require("../models/batches");


let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})


const sendMail = (templatePath, matchings, options, errors) => {
  ejs.renderFile(templatePath, matchings, function (err, data) {
    if (err) {
      console.log('ERR: ', err);
    } else {
      var mainOptions = {
          from: 'Reveal Diplomes <reveal.diploma@gmail.com>',
          to: options.to,
          subject: options.subject,
          html: data
      };
      //console.log("html data ======================>", mainOptions.html);
      transporter.sendMail(mainOptions, function (err, info) {
          if (err) {
            console.log('ERROR: ', err);
            return err;
          } else {
            console.log('Message sent: ' + info.response);
            return false
          }
      });
    }
  });
}


router.post("/confirmation", async (req, res) => {
  const diplomasData = req.body;     // un tableau de dilpomasData
  
  let errors = []

  for (const diplomaData of diplomasData) {
    //console.log('STudent: ', diplomaData)

    const options = {
      to: diplomaData.email,
      subject: 'Informations importantes pour votre DIPLOME',
    }

    const matchings = {
      curriculum: diplomaData.curriculum,
      promo: diplomaData.promo,
      firstname: diplomaData.firstname,
      lastname: diplomaData.lastname,
      birth_date: diplomaData.birth_date,
      validLink:`${process.env.DOMAIN_NAME}/diploma-validated/${diplomaData.studentId}/${diplomaData.diplomaId}`,
      errorLink: `${process.env.DOMAIN_NAME}/diploma-error/${diplomaData.studentId}/${diplomaData.diplomaId}`
    }

    const err = sendMail('emails/firstEmail.ejs', matchings, options);
    if (err) {
      errors.push(err);
      continue;
    }

    const student = await studentModel.findById(diplomaData.studentId);
    const diplomas = student.diplomas.map(diploma => {
      if (diploma._id == diplomaData.diplomaId){
        //console.log('in the IF of /confirmed');
        diploma.status = 'non confirm??';      // nb: non confirm?? = mail envoy??, pas encore de confirmation
      }
      return diploma;
    })
    student.diplomas = diplomas;
    const studentSaved = await student.save();
    //console.log('apres envoi mail: ', studentSaved);
    if (!studentSaved._id){
      console.log(`Error while updating the status of student with id: ${diplomaData.studentId}`);
      errors.push({message: `Error while updating the status of student with id: ${diplomaData.studentId}`});
    }
  };

  if (errors.length !== 0){
    return res.json({success: false, message: 'one or more errors occured: ', errors})
  }
  res.json({success: true});
});



router.get("/validate-diploma", async (req, res) => {
  const searchStudent = await studentModel.findById(req.query.id_student);
  if (!searchStudent) {
    return res.json({ result: false, msg: "L'??tudiant n'existe pas" });
  }
  const searchDiplomaIndex = searchStudent.diplomas.findIndex(
    (diploma) => diploma.id === req.query.id_diploma
  );
  if (searchDiplomaIndex === -1) {
    return res.json({ result: false, msg: "Le dipl??me n'existe pas" });
  }
  if (searchStudent.diplomas[searchDiplomaIndex].status === "confirm??"){
    return res.json({ result: false, msg: "Vous avez d??j?? valid?? vos informations. Si vous n'avez pas re??u votre dipl??me, v??rifiez dans votre dossier spam." });
  }

  searchStudent.diplomas[searchDiplomaIndex].status = "confirm??";
  const smartContractUrl = await smartContractGenerator(searchStudent.diplomas[searchDiplomaIndex]._id.toString());
  searchStudent.diplomas[searchDiplomaIndex].url_SmartContract = smartContractUrl;
  await studentModel.findByIdAndUpdate(req.query.id_student, {diplomas: [...searchStudent.diplomas]});

  // envoi email avec les liens vers le diplome pdf et le smartContract

  const batchId = searchStudent.diplomas[searchDiplomaIndex].id_batch;

  const options = {
    to: searchStudent.email,
    subject: 'Votre dipl??me certifi?? est disponible!',
  }

  //console.log(`batchId`, batchId)
  const batch = await BatchModel.findById(batchId)
  console.log(`batch type: `, typeof batch.curriculum)
  const part1 = batch.curriculum.replace('/', '%2F').replace('/', '%2F').replace('/', '%2F').replace(' ', '%20').replace(' ', '%20').replace(' ', '%20').replace(' ', '%20');
  const part2 = searchStudent.firstname.replace(' ', '%20').replace(' ', '%20').replace(' ', '%20').replace(' ', '%20').replace(' ', '%20');
  const part3 = searchStudent.lastname.replace(' ', '%20').replace(' ', '%20').replace(' ', '%20').replace(' ', '%20').replace(' ', '%20');
  const matchings = {
    firstname: searchStudent.firstname,
    lastname: searchStudent.lastname,
    pdfLink: `${process.env.DOMAIN_NAME}/diplome/${part1}-${batch.year}/${part2}-${part3}`,
    smartContractUrl: smartContractUrl
  }

  const err = sendMail('emails/finalEmail.ejs', matchings, options);

  if (err){
    console.log('Error: ', err);
  }

  res.json({ result: true, msg: "Votre dipl??me a ??t?? valid??" });
  
});


router.get("/error-diploma", async (req, res) => {
  const searchStudent = await studentModel.findById(req.query.id_student);
  if (!searchStudent) {
    return res.json({ result: false, msg: "L'??tudiant n'existe pas" });
  }
  const searchDiplomaIndex = searchStudent.diplomas.findIndex(
    (diploma) => diploma.id === req.query.id_diploma
  );
  if (searchDiplomaIndex === -1) {
    return res.json({ result: false, msg: "Le dipl??me n'existe pas" });
  }
  if (searchStudent.diplomas[searchDiplomaIndex].status === "confirm??") {
    return res.json({ result: false, msg: "Vous avez d??j?? valid?? vos informations. Contactez votre secr??tariat" })
  }

  searchStudent.diplomas[searchDiplomaIndex].status = "?? corriger";
  await studentModel.findByIdAndUpdate(req.query.id_student, {diplomas: [...searchStudent.diplomas]});
  res.json({ result: true, msg: "Veuillez contacter votre secr??tariat" });
});

router.post("/demande-inscription", function (req, res) {
  const newUser = req.body.values;

  const mailGerant = "frederic.garnier@mycommunicationtoolbox.com"
  
  const options = {
    to: mailGerant,
    subject: 'Bonjour Fred, vous avez une nouvelle demande sur Reveal.com',
  }

  const err = sendMail('emails/inscriptionEmail.ejs', newUser, options);

  if (err) res.json({result: false, error: `Votre demande n'a pas pu ??tre envoy??, vous pouvez nous contacter ?? cette adresse: ${mailGerant}`})
  res.json({result: true, message: "Votre demande a bien ??t?? envoy??e, nous revenons vers vous au plus vite !"});

});



module.exports = router;


// RESTER A CREER LA ROUTE ET LE MAIL POUR L ENVOI DU DIPLOME + URL SMARTCONTRACT