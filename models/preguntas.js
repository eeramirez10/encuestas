const mongoose = require('mongoose');

const PreguntasSchema = mongoose.Schema({
    descripcion:{
        type:String,
        required:true
    },
    // encuesta:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref:'Encuesta',
    //     required:true
    // }

},{ collection:'preguntas' });

module.exports = mongoose.model('Preguntas', PreguntasSchema);