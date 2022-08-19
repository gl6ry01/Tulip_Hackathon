const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
    },
    email : {
        type: String,
        required: true,
    },
    pfp: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    posts: {
        type: Array,
    },
    notifs: {
        type: Array,
    },
    likedPosts: {
        type: Array,
    },
    date: {
        type: String,
        default: new Date,
    },
})

const Users = mongoose.model('Users', userSchema);

module.exports = Users;