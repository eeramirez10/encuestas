const app = require('express').Router();

const { validaCampos } = require('../middlewares/valida-campos');
const Preguntas = require('../models/preguntas');
const Encuesta = require('../models/encuesta');
const Opcion = require('../models/opcion');






app.post('/', validaCampos, async (req, res) => {

    const { descripcion, idEncuesta, opciones } = req.body;

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

        await Encuesta.updateOne({_id:idEncuesta},{$push:{preguntas:preguntasDB._id}})


        for (let opcion of opciones){

            let op = new Opcion({ descripcion:opcion.descripcion })

            let opcionDB = await op.save()


            await Preguntas.updateOne({_id:preguntasDB._id }, {$push:{opciones:opcionDB.id }})


        }

       

       

        


        return res.json({
            ok: true,
            data: preguntasDB
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