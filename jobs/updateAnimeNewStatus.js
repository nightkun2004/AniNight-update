const Anime = require('../models/AnimeModel');

const updateAnimeNewStatus = async () => {
    try {
        const now = new Date();
        const result = await Anime.updateMany(
            { expiresAt: { $lte: now }, animenew: true },
            { $set: { animenew: false } }
        );
        console.log(`[${new Date().toISOString()}] Updated ${result.modifiedCount} anime(s) to set animenew to false.`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error updating animenew status:`, error);
    }
};

module.exports = updateAnimeNewStatus;