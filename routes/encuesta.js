const app = require('express').Router();

const { validaCampos } = require('../middlewares/valida-campos');
const Encuesta = require('../models/encuesta');
const Usuario = require('../models/usuario');
const Pregunta = require('../models/preguntas')
const Opcion = require('../models/opcion');
const { transporter } = require('../config/nodemailer');


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

    const preguntasM = preguntas.map(pregunta => ({
        pregunta: pregunta._id,
        respuesta: pregunta.opcion._id
    }))

    console.log(preguntasM)
    console.log(preguntas)

    const usuario = await Usuario.findByIdAndUpdate(idUsuario, {
        $push: {
            encuestas: {
                encuesta: idEncuesta,
                contestada: true,
                preguntas: preguntasM
            },
        }
    }, { new: true })

    const encuesta = await Encuesta.findById(idEncuesta);

    for (let pregunta of preguntas) {

        if (pregunta.opcion.type === "textarea") {
            await Opcion.findByIdAndUpdate(pregunta.opcion._id, { descripcion: pregunta.opcion.descripcion },)
            continue;
        }

        await Opcion.findByIdAndUpdate(pregunta.opcion._id, { $inc: { valor: parseInt(pregunta.opcion.valor) } },)


    }

    await transporter.sendMail({
        from: "eeramirez@tuvansa.com.mx",
        to: `eeramirez@tuvansa.com.mx, gbarranco@tuvansa.com.mx`,
        subject: `${encuesta.descripcion}`,
        html: `
            <div>

                El usuario ${usuario.nombre} ha contestado la encuesta  ${encuesta.nombre} 
        

            </div>
            
        `
    })





    try {


        return res.json({
            ok: true,
            msg: 'usuario'
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }


})


app.post('/asignar', async (req, res) => {

    const { idEncuesta, idUsuario } = req.body;



    const usuario = await Usuario.findByIdAndUpdate(idUsuario, {
        $push: {
            encuestas: {
                encuesta: idEncuesta,
                contestada: false,
                preguntas: [],
                dateContestada: ''
            },
        }
    }, { new: true })


    try {


        return res.json({
            ok: true,
            usuario
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }


})

app.post('/enviar', async (req, res) => {

    const { encuesta, usuario } = req.body;

    

    try {

        await transporter.sendMail({
            from: "eeramirez@tuvansa.com.mx",
            to: `${usuario.email}, eeramirez@tuvansa.com.mx`,
            subject: `${encuesta.descripcion}`,
            html: `
                <div>
    
                    Buen dia ${usuario.nombre}
                    <br>
                    <p> Favor de contestar la encuesta dando click al al enlace de abajo</p>
                    <br>
                    https://encuestas-app-6ec15.web.app/encuesta/start/${encuesta._id}/${usuario._id}
    
                </div>
                
            `
        })



        return res.json({
            ok: true,
            msg: "correo enviado"
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