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

    },
    encuesta:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Encuesta',
        required:true
    },
    pregunta:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Preguntas',
        required:true
    },
},{ collection:'opciones'});

module.exports = mongoose.model('Opcion',OpcionSchema )

