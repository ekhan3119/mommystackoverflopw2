const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema

const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    handle: {
        type: String,
        required: true,
        max: 40
    },
    social: {
        youtube: {
            type: String
        },
        facebook: {
            type: String
        }
    }

});

module.exports = Profile = mongoose.model('profile', ProfileSchema);