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

    let { idEncuesta, idUsuario, preguntas } = req.body;

    // console.log({ idEncuesta, idUsuario, preguntas })

    console.log(preguntas)


    const comentarios = preguntas.filter(pregunta => pregunta.type === "comentario");

    let multiOpciones = preguntas.filter(pregunta => pregunta.type === "multiOpcion");



    // console.log({multiOpciones})

    // return res.json({
    //     ok: true,
    //     msg: 'usuario'
    // })



    if (comentarios.length > 0) {

        for (let pregunta of comentarios) {

            let op = new Opcion({
                descripcion: pregunta.opcion.descripcion,
                type: pregunta.opcion.type,
                pregunta: pregunta._id,
                encuesta: idEncuesta
            })

            let opcionDB = await op.save()


            await Pregunta.updateOne(
                {
                    _id: pregunta._id,
                    type: pregunta.type
                },
                {
                    $push: { opciones: opcionDB.id }
                },
                {
                    new: true
                }
            )

            multiOpciones = [...multiOpciones, {
                _id: pregunta._id,
                opcion: {
                    _id: opcionDB.id
                }
            }]

        }


    }




    const preguntasM = multiOpciones.map(pregunta => ({
        pregunta: pregunta._id,
        respuesta: pregunta.opcion._id
    }));







    let usuario = await Usuario.updateOne({ _id: idUsuario, "encuestas.encuesta": idEncuesta },
        {
            $set: {
                // "encuestas.$": {
                //     encuesta: idEncuesta,
                //     contestada: true,
                //     preguntas: preguntasM
                // },

                "encuestas.$.contestada": true,
                "encuestas.$.preguntas": preguntasM,
                "encuestas.$.encuesta": idEncuesta,
                "encuestas.$.dateContestada": new Date(),

            }

        },
        {
            upsert: true
        }
    )

    usuario = await Usuario.findById(idUsuario)


    // const usuario = await Usuario.findByIdAndUpdate(idUsuario, {
    //     $push: {
    //         encuestas: {
    //             encuesta: idEncuesta,
    //             contestada: true,
    //             preguntas: preguntasM
    //         },
    //     }
    // }, { new: true });



    const encuesta = await Encuesta.findById(idEncuesta);

    for (let pregunta of preguntas) {

        if (pregunta.type === "comentario") continue;

        await Opcion.findByIdAndUpdate(pregunta.opcion._id, { $inc: { valor: parseInt(pregunta.opcion.valor) } })

    }



    // await transporter.sendMail({
    //     from: "eeramirez@tuvansa.com.mx",
    //     to: `eeramirez@tuvansa.com.mx, gbarranco@tuvansa.com.mx`,
    //     subject: `Encuesta contestada`,
    //     html: `
    //         <div>

    //             El usuario ${usuario.nombre} ha contestado la encuesta  ${encuesta.nombre} 


    //         </div>

    //     `
    // })





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

app.post('/reset/:idEncuesta', async (req, res) => {

    const { idEncuesta } = req.params;

    try {

        const encuestaDB = await Encuesta.findById(idEncuesta);

        for (let pregunta of encuestaDB.preguntas) {

            const preguntasDB = await Pregunta.findById(pregunta);

            for (let opciones of preguntasDB.opciones) {
                const opcionesDB = await Opcion.findByIdAndUpdate(opciones, { valor: 0 });


            }
        }


        return res.json({
            ok: true,
            msg: "Encuesta reset correctamente"
        })

    } catch (error) {

        console.log(error);

        res.json({
            ok: false,
            msg: "Hubo un error"
        })

    }




});


app.get('/ajustar/:idEncuesta', async (req, res) => {

    const { idEncuesta } = req.params;

    const encuestaDB = await Encuesta.findById(idEncuesta);

    for (let pregunta of encuestaDB.preguntas) {
        const preguntasDB = await Pregunta.findById(pregunta._id);

        for (let opcion of preguntasDB.opciones) {

            const opcionDB = await Opcion.findById(opcion._id);



            if (!opcionDB) {

                console.log(opcion)
                console.log(opcion.length)


            }

            // console.log(opcionDB)

            const users = await Usuario.find(
                {
                    encuestas: {
                        $elemMatch: {
                            // encuesta:"6346de8a6442ea3dcdc92532", 
                            preguntas: {
                                $elemMatch: {
                                    // pregunta:"6346e1b86442ea3dcdc92617", 
                                    respuesta: opcionDB
                                }
                            }
                        }
                    }
                }
            )

            await Opcion.findByIdAndUpdate(opcionDB, { valor: users.length })
        }
    }





    res.json({
        ok: true,
        encuestaDB
    })




})


app.delete('/:idEncuesta', async (req, res) => {

    const { idEncuesta } = req.params;

    await Encuesta.findByIdAndRemove(idEncuesta);

    const preguntasDB = await Pregunta.find({ encuesta: idEncuesta });

    if (preguntasDB) {

        for (let pregunta of preguntasDB) {

            await Pregunta.findByIdAndDelete(pregunta._id)
        }

    }

    const opcionesDB = await Opcion.find({ encuesta: idEncuesta });

    if (opcionesDB) {

        for (let opcion of opcionesDB) {
            await Opcion.findByIdAndDelete(opcion._id)
        }
    }


    res.json({
        ok: true,
        msg: 'eliminado'
    })
})


app.get('/user/answer/:idOpcion', async (req, res) => {

    const { idEncuesta, idPregunta, idOpcion } = req.params;


    try {

        const users = await Usuario.find(
            {
                encuestas: {
                    $elemMatch: {
                        // encuesta:"6346de8a6442ea3dcdc92532", 
                        preguntas: {
                            $elemMatch: {
                                // pregunta:"6346e1b86442ea3dcdc92617", 
                                respuesta: idOpcion
                            }
                        }
                    }
                }
            }
        )



        const usuarios = users.map(user => ({ nombre: user.nombre, email: user.email, _id: user._id }));







        return res.json({
            ok: true,
            usuarios: usuarios
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

    const { encuesta, usuario, } = req.body;

    // const usuariosDB = await Usuario.find({
    //     encuestas:{
    //         $elemMatch:{  encuesta: encuesta._id  }
    //     }
    // })

    // const linksUsuarios = usuariosDB.map( usuario => (
    //     {
    //         nombre:usuario.nombre,
    //         email:usuario.email,
    //         link:`https://encuestas-app-6ec15.web.app/encuesta/start/${encuesta._id}/${usuario._id} `
    //     }
    // ))

    // console.log(linksUsuarios)

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
                    <p> El Objetivo de esta encuesta es encontrar areas de mejora en el funcionamiento de Tuvansa y en la satisfaccion de los profesionales que la componen. </p>
                    <p>Sus respuestas son absolutamente confidenciales y serán enviadas directamente a la Dirección General de TUVANSA. </p>
                    <p>Agradecemos su participación para esta evaluación.</p>
                   
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

