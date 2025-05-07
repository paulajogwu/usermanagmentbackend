
const express = require('express')
const app = express();
const bodyParser =  require('body-parser');
const cors = require('cors');


const db = require('./database')

const PORT =  8070 || process.env.PORT ;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static(__dirname + '/public'));
app.use(cors({
    origin:'https://usermanagementfrontend-2z5n.vercel.app',
    credentials:true,            
    optionSuccessStatus:200,
    
}))
const authRouter = require('./views/auth');
const userRouter = require('./views/user');


app.use('/api/v1/digital', userRouter);
app.use('/api/v1/digital', authRouter);



app.use(function (req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});
// custom 500 page 
app.use(function (req, res, next) {
    // console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

app.listen(PORT)