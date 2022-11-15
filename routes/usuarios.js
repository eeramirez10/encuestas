const app = require('express').Router();
const { getAllUsuarios, createUsuario } = require('../controllers/usuariosController');


app.route('/')
    .get(getAllUsuarios)
    .post(createUsuario)


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




module.exports = app;