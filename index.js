const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
require('dotenv').config();

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(
    session({
        secret : 'yoyohoneysingh',
        cookie : {
            maxAge : 60000 * 60 * 24
        },
        saveUninitialized : true,
        resave : false
    })
)

//db connection
mongoose.connect(process.env.DB_URI,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err))

//Routes
app.use('/auth', authRoute);
app.use('/posts', postRoute);

app.get('/', (req, res)=>{
    res.render('index');
})

app.get('/about', (req,res)=>{
    res.render('about');
})

const PORT = process.env.PORT || 3000; // || = OR, && = AND

app.listen(PORT, ()=>{
    console.log(`Server is running on the port ${PORT}`);
})