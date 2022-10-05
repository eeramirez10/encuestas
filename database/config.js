const mongoose = require('mongoose');


const dbConnection = async () => {
    try {
        mongoose.connect( process.env.DB_CNN ,{
            useNewUrlParser: true,

        } )

        console.log('db online')
        
    } catch (error) {
        console.log(error)
        throw new Error('Error al iniciar la BD, revisar logs');
    }
}

module.exports = {
    dbConnection
}