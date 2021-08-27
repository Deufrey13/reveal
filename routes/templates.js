const express = require("express");
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const SchoolModel = require("../models/schools");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


// Cette fonction enregistre la background image et les éventuelles images des static fields dans cloudinary
// Elle retourne un object template avec, entre autres, les urls des images enregistrées
const createTemplate = async (body, school) => {
  const template = {...body.template}
  const saveImgInCloudinary = async (path, name) => {
    if(path.includes("cloudinary")) return path
    const resultCloudinary = await cloudinary.uploader.upload(
      path,
      { public_id: `${school.name}/templates/${template.template_name}/${name}` }
    );
    return resultCloudinary.secure_url
  }

  template.background_image_field.imagePreview = await saveImgInCloudinary(template.background_image_field.imagePreview, "background")
  for (let i = 0; i < template.static_fields.length; i++) {
    const field = template.static_fields[i];
    if(field.imagePreview) field.imagePreview = await saveImgInCloudinary(field.imagePreview, `image${i}`)
  }
  return template
}


const getSchool = async (res, school_id, callback) => {
  let school
  try {
    school = await SchoolModel.findById(school_id)
    callback(school)
  } catch (error) {
    res.json({result: false, error: "Nous ne retrouvons pas votre école 😭 , essayez de vous reconnecter"})
  }
}


////// Routes

// Renvoie tous les templates d'une School donnée
router.get("/get-templates/:school_id", async (req, res) => {
  getSchool(res, req.params.school_id, school => {
    res.json({result:true, templateList: school.templates})
  })
})


// Renvoie le template matchant avec les noms de School et de template donnés
router.get("/get/:school_id/:template_name", async (req, res) => {
  getSchool(res, req.params.school_id, school => {
    const template = school.templates.find(e=> e.template_name === req.params.template_name)
    if (!template) return res.json({
      result: false,
      error: "Nous n'avons pas trouvé le template lié à ce batch 😭"
    })
    res.json({result:true, template: template})
  })
})


// Créer ou met a jour un template existant
router.post("/create/:school_id", async function (req, res) {
  getSchool(res, req.params.school_id, async school => {
    const checkName = school.templates.findIndex(e=> e.template_name === req.body.template_name) >= 0
    if(checkName && !req.body.update) {
      res.json({result: false, error: "Vous avez déjà un template avec ce nom 😕"})
    }else{
      const template = await createTemplate(req.body, school)
      let message = ""
      if(!req.body.update){
        // c'est un nouveau template
        school.templates.push(template)
        message = "Votre template est bien enregistré, vous allez être redirigé vers le dashboard"
      }else{
        // c'est un update de template
        const templateIndex = school.templates.findIndex(e=> e.template_name === template.template_name)
        school.templates.splice(templateIndex, 1, template)
        message = "Votre template a été mis à jour"
      }
      school.save()
      res.json({
        result: true, 
        update: req.body.update,
        message
      })
    }
  })
});


router.delete("/delete/:school_id/:template_name", async (req, res) => {
  getSchool(res, req.params.school_id, school => {
    const templateIndex = school.templates.findIndex(e=> e.template_name === req.params.template_name)
    if(templateIndex < 0) res.json({ result: false, error: `Nous n'avons pas trouvé le template "${req.params.template_name}"` })
    school.templates.splice(templateIndex, 1)
    school.save()
    res.json({
      result: true, 
      message: "Votre template a bien été supprimé",
      templateList: school.templates
    })
  })
})


module.exports = router;