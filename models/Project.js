const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    tool: {
        type: Array,
        required: true
    },
    start_date:{
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    devs: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Dev'
    }
})

module.exports = mongoose.model('Project', ProjectSchema)