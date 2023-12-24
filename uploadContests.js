const Contest = require('./contestModel');

const uploadContests = async (res) => {
    try {

        const contests = await Contest.find();

        res.status(200).json({
            status: 'success',
            results: contests.length,
            data: { contests }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

module.exports = { uploadContests };