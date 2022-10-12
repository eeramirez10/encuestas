const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const { dbConnection } = require('./database/config');



//middlewares
app.use( cors() );
app.use( express.json())
app.use( express.urlencoded({ extended: false }))

//DB connection
dbConnection()


//Routes
app.use('/api/encuesta', require('./routes/encuesta'))
app.use('/api/preguntas', require('./routes/preguntas'))
app.use('/api/busqueda', require('./routes/busqueda'))
app.use('/api/opcion', require('./routes/opcion'))
app.use('/api/usuarios', require('./routes/usuarios'))




//server
app.listen(process.env.PORT, ()=> console.log(`server on port ${process.env.PORT}`))
