const express = require('express');
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





//server
app.listen(process.env.PORT, ()=> console.log('server on port 3000'))
