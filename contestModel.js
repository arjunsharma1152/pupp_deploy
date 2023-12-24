const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
    platform: {
        type: String,
        trim: true,
    },
    contests: [],
});

const Contest = mongoose.model('Contest', ContestSchema);

module.exports =  Contest;
