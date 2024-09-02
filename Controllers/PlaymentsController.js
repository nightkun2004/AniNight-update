const User = require("../models/UserModel")
const Payment = require("../models/PaymentModel")
const { v4: uuidv4 } = require("uuid")

// ============================================== Route Get Withdraw ==============================================
// ================================================================================================================
const getWithdraw = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        res.render('./th/pages/playments/Withdraw/listsWithdraw', {
            userID,
            translations: req.translations,
            lang
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/playments/Withdraw/listsWithdraw', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}




// ============================================== Route Get Withdraw Require TrueMoney Wallet ==============================================
// ================================================================================================================
const getWithdrawTrueMoneyWallet = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        res.render('./th/pages/playments/Withdraw/requires/trueMoneyWallet', {
            userID,
            translations: req.translations,
            lang
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/playments/Withdraw/requires/trueMoneyWallet', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}




// ============================================== Route Get Create Withdraw Require TrueMoney Wallet ==============================================
// ================================================================================================================
const getWithdrawTrueMoneyWalletCreate = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        res.render('./th/pages/admin/add/truemoney/createReward', {
            userID,
            translations: req.translations,
            lang
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/add/truemoney/createReward', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}




// ============================================== Route Get Create Withdraw Require TrueMoney Wallet ==============================================
// ================================================================================================================
const postWithdrawTrueMoneyWalletCreate = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const { type, points, wallet } = req.body;

        const newReward = {
            type: 'truemoneywallet',
            points: points,
            wallet: wallet,
            published: true // ตั้งค่าของรางวัลให้สามารถใช้ได้ทันที
        };

        const payment = new Payment({
            playmentrequire: [newReward],
            amount: wallet,
            paymentMethod: 'trueMoney',
            transactionId: uuidv4(), // สามารถสร้าง transactionId โดยใช้ UUID หรือ method อื่น ๆ
            userid: req.user.id, // หากมีการใช้ระบบ auth, ใช้ user ID จาก session
        });

        await payment.save();
        console.log("payment",payment)
        console.log("newReward",newReward)
        res.render('./th/pages/admin/add/truemoney/createReward', {
            userID,
            message: "เพิ่มสำเร็จ",
            translations: req.translations, lang
        })

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/add/truemoney/createReward', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

module.exports = {
    getWithdraw,
    getWithdrawTrueMoneyWallet,
    getWithdrawTrueMoneyWalletCreate,
    postWithdrawTrueMoneyWalletCreate
}