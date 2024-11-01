const mongoose = require("../config/db")



const RewardSchema = new mongoose.Schema({
    message: String,
    linkreward: String,
    reward: String,
    code: String,
    ReceivedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    redeemedIPs: [String]
}, { timestamps: true });

const Reward = mongoose.model('Reward', RewardSchema);

module.exports = Reward;
