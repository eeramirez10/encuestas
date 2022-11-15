const Usuario = require('../models/usuario');


const options = {
    page:1,
    limit: 10,
}


const getAllUsuarios = async (req, res) => {

    try {
        const usuario = await Usuario.paginate({}, options)

        console.log(usuario)

        res.json({
            ok: true,
            usuarios: usuario
        })

    } catch (error) {
        console.log(error)

        res.status(500).json({
            ok: false,
            msg: 'Revisar logs'
        })

    }


}

const createUsuario = async (req, res) => {

    const { nombre, email, area, sucursal } = req.body;

    try {
        const usuario = new Usuario({ nombre, email, area, sucursal })

        const uausarioDB = await usuario.save()

        res.json({
            ok: true,
            usuario: uausarioDB
        })

    } catch (error) {
        console.log(error)

        res.status(500).json({
            ok: false,
            msg: 'Revisar logs'
        })

    }


}

module.exports = {
    getAllUsuarios,
    createUsuario
}