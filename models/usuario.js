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
    area:{
        type: String,
        required: true
    },
    sucursal:{
        type: String,
        required: true
    },
    encuestas: [
        {
            _id:false,
            encuesta: {
                unique: false,
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Encuesta',
                
                
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
                        default: null,
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

