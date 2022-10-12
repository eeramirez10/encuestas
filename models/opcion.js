const mongoose = require('mongoose');

const OpcionSchema = mongoose.Schema({
    descripcion:{
        type:String,
        
    },
    valor:{
        type:Number,
        default:0
    },
    type:{
        type: String,

    }
},{ collection:'opciones'});

module.exports = mongoose.model('Opcion',OpcionSchema )

