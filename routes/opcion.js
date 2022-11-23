const app = require('express').Router();

const { validaCampos } = require('../middlewares/valida-campos');
const Pregunta = require('../models/preguntas')
const Opcion = require('../models/opcion');
const Encuesta = require('../models/encuesta');


app.post('/', validaCampos, async (req, res) => {

    const { descripcion, idPregunta } = req.body;

    const existePregunta = await Pregunta.findById(idPregunta);

    if(!existePregunta){

        return res.status(400).json({
            ok:false,
            msg:"No existe una pregunta con ese id"
        })
    }

    let opcion = new Opcion({ descripcion });

    try {

        

        let opcionDB = await opcion.save();

        const respRespuesta = await Pregunta.updateOne({_id:idPregunta }, {$push:{opciones:opcionDB.id }})

        console.log(respRespuesta)


        return res.json({
            ok: true,
            opcionDB
        })

    } catch (error) {

        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }


})


app.put('/', async (req,res)  =>{

    const { idEncuesta, opciones} = req.body;

    console.log(opciones)

    for ( let opcion of opciones){

        const opcionDB = await Opcion.findByIdAndUpdate(opcion.opcion._id, { $inc: {valor: parseInt(opcion.opcion.valor)}})

        
    }

    


    res.json({
        ok:true,
        msg:req.body
    })

})


app.put('/addIdPreguntaEncuesta/:idEncuesta',async (req,res) =>{
    const {idEncuesta} = req.params;

    const encuestaDB = await Encuesta.findById(idEncuesta);

    for( let pregunta of encuestaDB.preguntas){

        let preguntaDB = await Pregunta.findById(pregunta);

        console.log(preguntaDB)

        for(let opcion of preguntaDB.opciones){

            await Opcion.findByIdAndUpdate(opcion,{ encuesta: idEncuesta, pregunta: preguntaDB._id} )
        }

    }

    res.json({
        ok:true,
        msg:"addIdPreguntaEncuesta"
    })

} )




module.exports = app;