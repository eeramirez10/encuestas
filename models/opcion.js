const mongoose = require('mongoose');

const OpcionSchema = mongoose.Schema({
    descripcion:{
        type:String,
        required:true
    },
    valor:{
        type:Number,
        default:0
    }
},{ collection:'opciones'});

module.exports = mongoose.model('Opcion',OpcionSchema )

