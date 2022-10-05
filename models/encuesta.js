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
    preguntas:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Preguntas',
    
    }]

},{ collection:'encuestas'});

module.exports = mongoose.model('Encuesta', EncuestaSchema);
