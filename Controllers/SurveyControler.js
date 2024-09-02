const User = require("../models/UserModel")
const Survey = require("../models/SurveyModel")
const SurveyAdmin = require("../models/SurveyAddModel")
const axios = require("axios")
const crypto = require('crypto');
require("dotenv").config()

function verifyHash(query, secretKey) {
    const { hash, ...params } = query;
    const queryString = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&');

    const computedHash = crypto
        .createHmac('sha1', secretKey)
        .update(queryString)
        .digest('hex');

    return computedHash === hash;
}

function isDemoMode(url) {
    return url.includes('DEMO MODE');
}

// =============================================== Route GET Survey ===========================================
// ============================================================================================================
const getSurvey = async (req, res) => {
    const userID = req.session.userlogin;
    console.log(userID.user._id)
    const lang = res.locals.lang;
    try {
        const options = {
            method: 'GET',
            url: `https://api.bitlabs.ai/v2/client/surveys?token=${process.env.BITLABS_APP_TOKEN}&uid=${userID.user._id}`,
            headers: { accept: 'application/json' }
        };

        const response = await axios.request(options);

        const surveyNpat = await SurveyAdmin.find().lean();
        // console.log(response.data.data.surveys)

        const surveys = response.data.data.surveys || [];
        console.log('Surveys:', response.data.data.surveys);

        // ตรวจสอบว่าตัวแปร surveys ถูกส่งไปยัง EJS
        res.render('./th/pages/Survey/index', {
            surveys,
            surveyNpat,
            translations: req.translations,
            lang: lang,
            userID
        });
    } catch (error) {
        const errorMessage = error.message || 'Error fetching surveys';
        res.status(500).render('./th/pages/Survey/index', {
            surveys: [],
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}


// =============================================== Route POST Offer Reward Callback ===========================================
// ============================================================================================================
const OfferRewardCallback = async (req, res) => {
    const userID = req.session.userlogin;

    const lang = res.locals.lang;
    try {
        console.log('Offer Reward Callback:', req.body);
        res.status(200).send('Offer Reward Callback received successfully');
    } catch (error) {
        const errorMessage = error.message || 'Error fetching surveys';
        res.status(500).render('./th/pages/Survey/index', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}


// =============================================== Route POST Reward Callback ===========================================
// ============================================================================================================
const RewardCallback = async (req, res) => {
    const userID = req.session.userlogin;

    const lang = req.params.lang || 'th';
    try {
        console.log('Reward Callback:', req.body);
        res.status(200).send('Reward Callback received successfully');
    } catch (error) {
        const errorMessage = error.message || 'Error fetching surveys';
        res.status(500).render('./pages/Survey/index', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}


// =============================================== Route POST Offer Reconciliation   Callback ===========================================
// ============================================================================================================
const OfferReconciliationCallback = async (req, res) => {
    const userID = req.session.userlogin;

    const lang = res.locals.lang;
    try {
        const secretKey = process.env.BITLABS_SECRET_KEY;

        if (isDemoMode(req.url)) {
            console.log('DEMO MODE: cannot convert url to request:', req.url);
            return res.status(400).send('DEMO MODE: Invalid request');
        }

        if (!verifyHash(req.query, secretKey)) {
            return res.status(401).send('Unauthorized: Invalid hash');
        }

        // Handle offer reconciliation callback
        console.log('Offer Reconciliation Callback:', req.body);

        res.status(200).send('Offer Reconciliation Callback received successfully');
    } catch (error) {
        res.status(500).send('Error processing offer reconciliation callback');
    }
}


// =============================================== Route POST First Qualification  Callback ===========================================
// ============================================================================================================
const FirstQualificationCallback = async (req, res) => {
    const userID = req.session.userlogin;

    const lang = req.params.lang || 'th';
    try {
        console.log('First Qualification Callback:', req.body);
        res.status(200).send('First Qualification Callback received successfully');
    } catch (error) {
        const errorMessage = error.message || 'Error fetching surveys';
        res.status(500).render('./th/pages/Survey/index', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}


// =============================================== Route POST Magic Receipts  Callback ===========================================
// ============================================================================================================
const MagicReceiptsCallback = async (req, res) => {
    const userID = req.session.userlogin;

    const lang = req.params.lang || 'th';
    try {
        console.log('Magic Receipts Callback:', req.body);
        res.status(200).send('Magic Receipts Callback received successfully');
    } catch (error) {
        const errorMessage = error.message || 'Error fetching surveys';
        res.status(500).render('./th/pages/Survey/index', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}


// =============================================== Route POST Reconciliation  Callback ===========================================
// ============================================================================================================
const ReconciliationCallback = async (req, res) => {
    const userID = req.session.userlogin;

    const lang = req.params.lang || 'th';
    try {
        console.log('Reconciliation Callback:', req.body);
        res.status(200).send('Reconciliation Callback received successfully');
    } catch (error) {
        const errorMessage = error.message || 'Error fetching surveys';
        res.status(500).render('./th/pages/Survey/index', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

module.exports = {
    getSurvey,
    RewardCallback,
    OfferRewardCallback,
    ReconciliationCallback,
    OfferReconciliationCallback,
    FirstQualificationCallback,
    MagicReceiptsCallback
}