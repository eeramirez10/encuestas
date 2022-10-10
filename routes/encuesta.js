const app = require('express').Router();

const { validaCampos } = require('../middlewares/valida-campos');
const Encuesta = require('../models/encuesta');
const Usuario = require('../models/usuario');
const Pregunta = require('../models/preguntas')
const Opcion = require('../models/opcion');


app.post('/', validaCampos, async (req, res) => {

    const { nombre, descripcion } = req.body;

    const existeEncuesta = await Encuesta.findOne({ nombre });

    if (existeEncuesta) {

        return res.status(400).json({
            ok: false,
            msg: "ya esxite una encuesta con ese nombre"
        })
    }

    let encuesta = new Encuesta({ nombre, descripcion });

    try {



        let encuestaDB = await encuesta.save();




        return res.json({
            ok: true,
            encuesta: encuestaDB
        })

    } catch (error) {

        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }


})

app.get('/:idEncuesta', async (req, res) => {

    const { idEncuesta } = req.params;

    try {

        let encuesta = await Encuesta.findById(idEncuesta)


        if (!encuesta) {
            return res.status(400).json({
                ok: false,
                msg: "No exite esa ecuesta "
            })
        }

        await encuesta.populate({
            path: 'preguntas',
            populate: { path: 'opciones' }
        })

        return res.json({
            ok: true,
            data: encuesta
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

})

app.post('/submit', async (req, res) => {

    const { idEncuesta, idUsuario, preguntas } = req.body;

    const preguntasM = preguntas.map( pregunta =>({
        pregunta: pregunta._id,
        respuesta: pregunta.opcion._id
    }))

    const usuario = await Usuario.findByIdAndUpdate(idUsuario, {
        $push: {
            encuestas: {
                encuesta: idEncuesta,
                contestada: true,
                preguntas: preguntasM
            },
        }
    }, { new:true})

    for ( let opcion of preguntas){

        await Opcion.findByIdAndUpdate(opcion.opcion._id, { $inc: {valor: parseInt(opcion.opcion.valor)}}, )

        
    }

    try {


        return res.json({
            ok: true,
            msg: usuario
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