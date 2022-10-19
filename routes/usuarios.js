const app = require('express').Router();
const Usuario = require('../models/usuario');


app.post('/', async (req,res) => {

    const { nombre, email, area, sucursal } = req.body;

    try {
        const usuario = new Usuario({ nombre, email, area, sucursal})

        const uausarioDB = await usuario.save()

        res.json({
            ok:true,
            usuario: uausarioDB
        })
        
    } catch (error) {
        console.log(error)

        res.status(500).json({
            ok:false,
            msg:'Revisar logs'
        })
        
    }


})

app.get('/:idUsuario', async (req,res)=>{

    const { idUsuario } = req.params;

    try {
        const usuario = await Usuario.findById(idUsuario);

        

        res.json({
            ok:true,
            usuario: usuario
        })
        
    } catch (error) {
        console.log(error)

        res.status(500).json({
            ok:false,
            msg:'Revisar logs'
        })
        
    }


})

app.get('/', async (req,res)=>{

    

    try {
        const usuario = await Usuario.find({})

        

        res.json({
            ok:true,
            usuarios: usuario
        })
        
    } catch (error) {
        console.log(error)

        res.status(500).json({
            ok:false,
            msg:'Revisar logs'
        })
        
    }


})




module.exports = app;