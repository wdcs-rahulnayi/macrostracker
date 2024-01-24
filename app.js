require('dotenv').config();
const express = require('express');
require('express-async-errors');
const connectDb = require('./db/connect');
const app = express();

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'));
app.use(fileUpload());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));

const authRouter = require('./routes/authRoutes');
const macrosRouter = require('./routes/macrosRoutes');
const { authenticateUser } = require('./middleware/authentication');

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/macros',authenticateUser,macrosRouter);

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async()=>{
    try{
        await connectDb(process.env.MONGO_URI);
        app.listen(port, ()=>{
            console.log('Listening on 5000');
        });
    }
    catch(error){
        console.log(error);
    }
}

start();