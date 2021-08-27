var express = require("express");
var router = express.Router();
const SchoolModel = require("../models/schools");
var mongoose = require("mongoose");
const UserModel = require("../models/users");
const bcrypt = require('bcrypt');


// Creation d'un nouveau collaborateur d'une School déjà existante
router.post("/sign-up", async (req, res) => {
  // 1 - Vérifications et création du User
  const user = { ...req.body };
  if (
    user.firstname === "" &&    // Les ET devraient être remplacé par de OU //
    user.email === "" &&
    user.password === "" &&
    user.role === "" &&
    user.school_name === ""
  ) {
    res.json({ result: false, error: "Il nous manque des infos" });
  }
  user.password = bcrypt.hashSync(user.password, 10);

  const school = await SchoolModel.findOne({ name: user.school_name });
  if (!school) {
    return res.json({ result: false, error: "Nous n'avons pas trouver votre école" });
  }

  const check = await UserModel.find({ email: user.email });
  if (check.length !== 0) {
    return res.json({ result: false, error: "Cet email est déjà pris !" });
  }

  const newUser = new UserModel({ ...user });
  newUser.school_id = school.id;
  const userSaved = await newUser.save();
  if (!userSaved) {
    return res.json({ result: false, error: "L'utilisateur n'a pas pus être créé" });
  }

  // 2 - Ajout de l'id du nouveau User dans la liste des users de sa School
  school.user_id.push(userSaved._id);
  const schoolSaved = await school.save();
  if(!schoolSaved) {
    return res.json({ result: false, error: "L'utilisateur n'a pas été enregistré dans l'école" });
  };

  // 3 - Réponse de succés de la route, qui renvoie tous les users de la School
  const users = await UserModel.find({school_id: schoolSaved._id});
  res.json({ result: true, users, message: `${userSaved.firstname} a bien été créé` });
});


router.post("/sign-in", async (req, res) => {
  var result = false;
  var user = null;
  var error = [];

  if (req.body.emailFromFront === "" && req.body.passwordFromFront === "") {
    error.push("les champs sont  vides");
  }

  if (error.length == 0) {
    user = await UserModel.findOne({ email: req.body.emailFromFront });
    if (!user || !bcrypt.compareSync(req.body.passwordFromFront, user.password)){
      error.push("email ou mot de passe incorrect ");
    } else {
      result = true;
    }
  }

  res.json({ result, user, error });
});


router.put("/edit-user/:userId", async (req, res) => {
  const searchUser = await UserModel.findById(req.params.userId);
  if (!searchUser) {
    return res.json({ result: false, msg: "User not found" });
  }
  /* if (typeof req.body.school_id === "String") {
    await UserModel.findByIdAndUpdate(req.params.userId, {
      school_id: mongoose.mongo.ObjectId(req.body.school_id),
    });
  } else { */
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    await UserModel.findByIdAndUpdate(req.params.userId, req.body);
  //}
  res.json({ result: true, msg: "User updated" });
});


// renvoie tous les colllaborateurs d'une School donnée
router.get("/get-collaborators", async (req, res) => {
  const searchCollaborators = await UserModel.find({
    school_id: req.query.school_id,
  });
  res.json({ result: true, collaborators: searchCollaborators });
});


router.get("/get-user", async (req, res) => {
  let searchUser;
  if (req.query.userId) {
    searchUser = await UserModel.findById(req.query.userId);
  } else {
    searchUser = await UserModel.findOne(req.query);
  }
  if (!searchUser) {
    res.json({ result: false, msg: "User non existant" });
  } else {
    res.json({ result: true, user: searchUser });
  }
});


router.post("/create-collaborator", async (req, res) => {
  const searchCollaborator = await UserModel.findOne(req.body);     // Il faudrait retirer le password non crypté pour que ça puisse matcher //
  if (searchCollaborator) {
    return res.json({ result: false, msg: "Vous avez déjà ce collaborateur" });
  }
  req.body.password = bcrypt.hashSync(req.body.password, 10);
  const newCollaborator = new UserModel({
    ...req.body,
    school_id: mongoose.mongo.ObjectId(req.body.school_id),
    role: "collaborateur",
  });
  const savedCollaborator = await newCollaborator.save();
  if(savedCollaborator._id){
    const school = await SchoolModel.findById(req.body.school_id)
    school.user_id.push(savedCollaborator._id)
    const schoolSaved = await school.save()
    if(schoolSaved) res.json({ result: true, msg: "User créé" });
  }                                                                 // il manque else {} //
});


router.delete("/delete-collaborator/:userId", async (req, res) => {
  // Il manque des sécurités pour contrôler qui veut supprimer 
  // Actuellement n'importe qui sur internet peut tenter de supprimer les users en essayant des Id au hasard
  const searchCollaborator = await UserModel.findById(req.params.userId);
  if (!searchCollaborator)
    return res.json({ result: false, msg: "Collaborator non existe" });
  await UserModel.findByIdAndDelete(req.params.userId);
  res.json({ result: true, msg: "Collaborateur supprimé" });
});


// Met à jour les infos d'un user existant
router.post('/edit/:user_id', async (req, res) => {
  const updatedUser = await UserModel.updateOne(
    { _id: req.params.user_id },
    { 
      firstname: req.body.firstname,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      role: req.body.role,
    }
  );
  if(updatedUser.n === 0) return res.json({result: false, error: "Un problème est survenu" })
  
  const user = await UserModel.findById(req.params.user_id);  // nécessaire car .updateOne() ne renvoie pas le user
  const users = await UserModel.find({ school_id: user.school_id })
  res.json({result: true, users, message: `${user.firstname} a bien été mis à jour`})
})


router.delete('/delete/:user_id', async (req, res) => {
  const userToDelete = await UserModel.findById(req.params.user_id)
  const school = await SchoolModel.findById(userToDelete.school_id)
  const idIndex = school.user_id.findIndex(e => e === userToDelete._id)

  const deletedUser = await UserModel.deleteOne({ _id: req.params.user_id })
  if(deletedUser.n !== 0){
    school.user_id.splice(idIndex, 1)
    const schoolSaved = await school.save()
    //console.log(`schoolSaved`, schoolSaved)
    const users = await UserModel.find({ school_id: schoolSaved._id })
    res.json({result: true, users, message: `${userToDelete.firstname} a été supprimé`})
  }else{
    res.json({result: false, error: "Un problème est survenu" })
  }
})


module.exports = router;