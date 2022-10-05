const { validationResult } = require('express-validator');
let { response } = require('express');


let validaCampos = (req, res = response, next) => {

    const errores = validationResult(req);

    if( !errores.isEmpty()){

        return res.status(400).json({
            ok:false,
            errors: errores.mapped()
        })
    }

    next();

}


module.exports = {
    validaCampos
}