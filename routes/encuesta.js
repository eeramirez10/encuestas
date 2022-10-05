const app = require('express').Router();

const { validaCampos } = require('../middlewares/valida-campos');
const Encuesta = require('../models/encuesta');


app.post('/', validaCampos, async (req, res) => {

    const { nombre } = req.body;

    const existeEncuesta = await Encuesta.findOne({nombre});

    if(existeEncuesta){

        return res.status(400).json({
            ok:false,
            msg:"ya existe una encuesta con ese nombre"
        })
    }

    let encuesta = new Encuesta({ nombre });

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




module.exports = app;