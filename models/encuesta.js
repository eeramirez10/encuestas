const mongoose = require('mongoose');

const EncuestaSchema = mongoose.Schema({
    nombre:{
        unique:true,
        type:String,
        required:true
    },
    date:{
        type:Date,
        default: Date.now
    },
    descripcion:{
        type:'string',
        required:'true'
    },
    preguntas:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Preguntas',
    
    }],
    usuarios:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Usuario',
    }]

},{ collection:'encuestas', timestamps:true});

module.exports = mongoose.model('Encuesta', EncuestaSchema);
