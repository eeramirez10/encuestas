const Usuario = require('../models/usuario');


const options = {
    page:1,
    limit: 50,
}


const getAllUsuarios = async (req, res) => {

    const { search, page } = req.query;


    const RegxSearch = new RegExp(search, "i")

    try {
        const usuario = await Usuario.paginate({ 
            $or:[
                {nombre:{  $regex: RegxSearch  }},
                {email:{  $regex: RegxSearch  }}
            ]

         }, {
            page,
            limit:10
         })

       

        res.json({
            ok: true,
            data: usuario
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