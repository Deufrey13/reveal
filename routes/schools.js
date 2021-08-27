const express = require("express");
const router = express.Router();
const SchoolModel = require("../models/schools");
const UserModel = require("../models/users");


router.get("/all", async (req, res) => {
  const schools = await SchoolModel.find()
  res.json({result: true, schools })
})


// Retourne une School peuplée par ses collaboratuers
router.get("/:school_name/users", async (req, res) => {
  const school = await SchoolModel.findOne({name: req.params.school_name})
  .populate("user_id")
  res.json({result: true, users: school.user_id })
})



router.post("/create", async (req, res) => {
  const newSchool = new SchoolModel ({
		name: req.body.schoolName,
    user_id: [],
    templates: []
	});
	const schoolSaved = await newSchool.save();
  if(schoolSaved){
    const schools = await SchoolModel.find()
    res.json({result: true, schools, message: `${schoolSaved.name} a bien été enregistrée` })
  }
})



router.post("/edit/:school_id", async (req, res) => {
  const updatedSchool = await SchoolModel.updateOne(
    { _id: req.params.school_id },
    { name: req.body.schoolName }
  );
  if(updatedSchool.n === 0) return res.json({result: false, error: "Un problème est survenu" })
  
  const schools = await SchoolModel.find()
  res.json({result: true, schools, message: `${req.body.schoolName} a bien été mise à jour` })
})



router.delete("/delete/:school_id", async (req, res) => {
  await UserModel.deleteMany({ school_id: req.params.school_id})
  const deletedSchool = await SchoolModel.deleteOne({ _id: req.params.school_id });
  if(deletedSchool.n === 0) return res.json({result: false, error: "Un problème est survenu" })
  
  const schools = await SchoolModel.find()
  res.json({result: true, schools, message: `L'école a bien été supprimée` })
})


module.exports = router;