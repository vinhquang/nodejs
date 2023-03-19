import {Router as expressRouter} from 'express';

const router = expressRouter();

const {authorize} = require('../../middlewares/authorize');

const IndexController = require('./index.controller');

router.get('/', [authorize(['getUsers'])], IndexController.index);

module.exports = router;
