const app = require('express').Router();

const { validaCampos } = require('../middlewares/valida-campos');
const Encuesta = require('../models/encuesta');
const Usuario = require('../models/usuario');
const Pregunta = require('../models/preguntas')
const Opcion = require('../models/opcion');
const { transporter } = require('../config/nodemailer');
const { UserRefreshClient } = require('google-auth-library');


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


    const comentarios = preguntas.filter( pregunta => pregunta.type === "comentario");

    let multiOpciones = preguntas.filter( pregunta => pregunta.type === "multiOpcion");

    // console.log({multiOpciones})

    // return res.json({
    //     ok: true,
    //     msg: 'usuario'
    // })

    if( comentarios.length > 0){

        for ( let pregunta of comentarios){

            let op = new Opcion({ descripcion: pregunta.opcion.descripcion, type: pregunta.opcion.type })
    
            let opcionDB = await op.save()
        
        
            await Pregunta.updateOne({ _id: pregunta._id, type: pregunta.type }, { $push: { opciones: opcionDB.id } }, { new: true})
    
           multiOpciones = [...multiOpciones,{
                _id:pregunta._id,
                opcion:{ 
                   _id: opcionDB.id
                }
            }]
    
        }
    

    }




    const preguntasM = multiOpciones.map(pregunta => ({
        pregunta: pregunta._id,
        respuesta: pregunta.opcion._id
    }));

    console.log(preguntasM)

    



    let usuario = await Usuario.updateOne({ _id: idUsuario, "encuestas.encuesta": idEncuesta },
        {
            $set: {
                encuestas: {
                    encuesta: idEncuesta,
                    contestada: true,
                    preguntas: preguntasM
                },
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

        if(pregunta.type === "comentario") continue;

        await Opcion.findByIdAndUpdate(pregunta.opcion._id, { $inc: { valor: parseInt(pregunta.opcion.valor) } })

    }

    console.log(usuario)

    await transporter.sendMail({
        from: "eeramirez@tuvansa.com.mx",
        to: `eeramirez@tuvansa.com.mx, gbarranco@tuvansa.com.mx`,
        subject: `Encuesta contestada`,
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

    const { encuesta, usuario,  } = req.body;

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