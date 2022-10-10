const app = require('express').Router();


const Encuesta = require('../models/encuesta');
const Preguntas = require('../models/preguntas');
const Usuario = require('../models/usuario');


app.get('/coleccion/:tabla/:busqueda', async (req, res) => {

    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;

    const regex = new RegExp(busqueda, 'i');

    let data;

    try {

        switch(tabla){
            case 'encuestas':
                data = await Encuesta.find()
                    .populate({
                        path:'preguntas',
                        populate:{ path:'opciones'}
                    })
                   
                    
            break;
            case 'preguntas':
                data = await Preguntas.find()
                        .populate('opciones')

            case 'usuarios':

                data= await Usuario.find()
                    .populate({
                        path:'encuestas.encuesta',
                        select:'nombre'
                    })
                    .populate({
                        path:'encuestas.preguntas.pregunta',
                        select:'descripcion'
                    })
                    .populate({
                        path:'encuestas.preguntas',
                        populate:{ path:'respuesta', select:'descripcion'}
                    })
                      
                    
                    
                    
                    
            break;

            default:
                return res.status(404).json({
                    ok: false,
                    msg: 'La tabla tiene que ser usuarios/medicos/hospitales'
                })
                          
        }


        res.json({
            ok:true,
            tabla,
            data
    
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