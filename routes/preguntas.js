const app = require('express').Router();

const { validaCampos } = require('../middlewares/valida-campos');
const Preguntas = require('../models/preguntas');
const Encuesta = require('../models/encuesta');





app.post('/', validaCampos, async (req, res) => {

    const { descripcion, idEncuesta } = req.body;

    const existeEncuesta = await Encuesta.findById(idEncuesta);

    if(!existeEncuesta){

        return res.status(400).json({
            ok:false,
            msg:"No existe una encuesta con ese id"
        })
    }

    let preguntas= new Preguntas({ descripcion, encuesta:idEncuesta })

    
    try {

        

        let preguntasDB = await preguntas.save();

        let encuesta = await Encuesta.updateOne({_id:idEncuesta},{$push:{preguntas:preguntasDB._id}})

        console.log(encuesta)

       

       

        


        return res.json({
            ok: true,
            preguntasDB
        })

    } catch (error) {

        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }


})




module.exports = app;