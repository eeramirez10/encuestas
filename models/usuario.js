const mongoose = require('mongoose');

const UsuarioSchema = mongoose.Schema({
    nombre: {
        unique: true,
        type: String,
        required: true
    },
    email: {
        unique: true,
        type: String,
        required: true
    },
    encuestas: [
        {
            _id:false,
            encuesta: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Encuesta',
                unique:true,
            },
            contestada: {
                type: Boolean,
                default: false
            },
            dateContestada:{
                type:Date,
                default: Date.now
            },
            preguntas: [
                {
                    _id: false,
                    pregunta: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Preguntas',
                    },
                    
                    respuesta: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Opcion'
                    }
                }
            ]
        }
    ]

}, { collection: 'usuarios' });

module.exports = mongoose.model('Usuario', UsuarioSchema);

