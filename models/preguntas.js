const mongoose = require('mongoose');

const PreguntasSchema = mongoose.Schema({
    descripcion:{
        type:String,
        required:true,
        unique:false
    },
    type:{
        type:String,
        default: "multiOpcion"
    },
    encuesta:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Encuesta',
        required:true
    },
    opciones:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Opcion',
        }
    ]

},{ collection:'preguntas', timestamps:true });

module.exports = mongoose.model('Preguntas', PreguntasSchema);