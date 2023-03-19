import {Router as expressRouter} from 'express';

const router = expressRouter();

const {isAuthorized, authorize} = require('../../middlewares/authorize');

const UserController = require('./user.controller');

router.get('/login', [isAuthorized()], UserController.login);
router.post('/login', UserController.login);
router.get('/sign-up', [isAuthorized()], UserController.signUp);
router.post('/sign-up', UserController.signUp);
router.get('/reset-password', [isAuthorized()], UserController.resetPassword);
router.post('/reset-password', UserController.resetPassword);
router.get('/new-password/:key', [isAuthorized()], UserController.newPassword);
router.post('/new-password/:key', UserController.newPassword);
router.get(
    '/register-verification/:key',
    [isAuthorized()],
    UserController.registerVerification,
);
router.post(
    '/register-verification/:key',
    UserController.registerVerification,
);
router.get(
    '/register-verification-resend',
    [isAuthorized()],
    UserController.registerVerificationResend,
);
router.post(
    '/register-verification-resend',
    UserController.registerVerificationResend,
);
router.get('/profile', [authorize()], UserController.profile);
router.post('/profile', [authorize()], UserController.profile);
router.get(
    '/display-name/reset',
    [authorize()],
    UserController.displayNameReset,
);
router.get('/logout', UserController.logout);

module.exports = router;
