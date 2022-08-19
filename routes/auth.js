const router = require('express').Router();
const axios = require('axios');
const urlParse = require('url-parse');
const qs = require('query-string');
const Users = require('../models/Users');
require('dotenv').config()

const redirectUri = process.env.REDIRECT_URI

function getGoogleAuthURL(){
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    const options = {
        redirect_uri : redirectUri,
        client_id : process.env.GOOGLE_CLIENT_ID,
        access_type : 'offline',
        response_type : 'code',
        scope : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        prompt : 'consent'
    }

     return `${rootUrl}?${qs.stringify(options)}`
}

function getTokens({code, clientId, clientSecret, redirectUri}){
    const url = 'https://oauth2.googleapis.com/token'
    const options = {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
    }

    return axios.post(url, qs.stringify(options), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((res) => res.data)
    .catch(err => console.log(err))
}



router.get('/login', (req,res)=>{
    // creating consent screen url
    res.redirect(getGoogleAuthURL())
})

router.get('/callback', async (req, res)=>{
    const queryUrl = new urlParse(req.url)
    const code = qs.parse(queryUrl.query).code

    // getting access tokens
    const {id_token, access_token} = await getTokens({
        code,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: redirectUri
    })

    // getting user data
    const googleUser = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${access_token}`,{
        headers : {
            Authorization: `Bearer ${id_token}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))
    
    // CRUD CREATE READ UPDATE DELETE
    Users.findOne({email: googleUser.email})
    .then((doc)=>{
        if(doc){
            //login
            console.log('this is login block')
            req.session.user = doc
            res.redirect('/posts')
        }else{
            //register

            const newUser = new Users({
                name: googleUser.name,
                email: googleUser.email,
                pfp: googleUser.picture,
            })

            newUser.save()
            .then((resp)=>{
                console.log('this is register block')
                req.session.user = resp
                res.redirect('/posts')
            })
            .catch(err => console.log(err))
        }
    })
    .catch(err => console.log(err))

})

router.get('/logout', (req,res)=>{
    req.session.destroy()
    res.redirect('/')
})

module.exports = router;