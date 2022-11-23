const app = require('express').Router();

const { validaCampos } = require('../middlewares/valida-campos');
const Preguntas = require('../models/preguntas');
const Encuesta = require('../models/encuesta');
const Opcion = require('../models/opcion');



app.post('/', validaCampos, async (req, res) => {

    const { pregunta, idEncuesta, opciones } = req.body;

    const existeEncuesta = await Encuesta.findById(idEncuesta);

    if (!existeEncuesta) {

        return res.status(400).json({
            ok: false,
            msg: "No existe una encuesta con ese id"
        })
    }

       let preguntaDB = new Preguntas({
        descripcion: pregunta.descripcion,
        type: pregunta.type,
        encuesta: idEncuesta
    })


    try {

        preguntaDB = await preguntaDB.save();

        await Encuesta.findByIdAndUpdate(idEncuesta, { $push: { preguntas: preguntaDB._id } })


        for (let opcion of opciones) {

            if (opcion.type === "textarea") continue;


            let op = new Opcion({
                descripcion: opcion.descripcion,
                type: opcion.type,
                encuesta: idEncuesta,
                pregunta: preguntaDB._id
            });

            let opcionDB = await op.save();


            await Preguntas.findByIdAndUpdate(preguntaDB._id, { $push: { opciones: opcionDB.id } })

        }








        return res.json({
            ok: true,
            data: preguntaDB
        })

    } catch (error) {

        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }


})

app.put('/', async (req, res) => {

    const { opciones, ...pregunta } = req.body;

    try {

        const estaPregunta = await Preguntas.findByIdAndUpdate(pregunta._id, pregunta);

        for (let opcion of opciones) {
            let estaOpcion = await Opcion.findByIdAndUpdate(opcion._id, { descripcion: opcion.descripcion });


        }


        return res.json({
            ok: true,
            msg: "actualizado correctamente"

        })


    } catch (error) {

        console.log(error);
        return res.json({
            ok: false,
            msg: "Hubo un errror"
        })

    }






})

app.put('/addIdEncuesta/:idEncuesta', async (req, res) => {
    const { idEncuesta } = req.params;

    const resp = await Preguntas.updateMany({}, { encuesta: idEncuesta });

    console.log(resp)


    res.json({
        ok: true,
        msg: "addIdEncueasta"
    })

})




module.exports = app;