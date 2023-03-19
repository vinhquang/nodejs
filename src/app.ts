import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import expressLayouts from 'express-ejs-layouts';

const session = require('express-session');
// const session = require('cookie-session');
const passport = require('passport');

import * as dbMysql from './utils/db.mysql';
import swaggerDocs from './utils/swagger';

const {authorizeApi} = require('./middlewares/authorize');
const logger = require('./middlewares/logger');

dotenv.config({path: `.env.${process.env.NODE_ENV}`});

const SERVER_PORT = Number(process.env.SERVER_PORT || '3000');
const SERVER_HOST = process.env.SERVER_HOST || '0.0.0.0';
const app: Express = express();

app.use(express.json());

// Setup security middlewares
app.use(helmet());

// Setup Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Enable all CORS request
app.use(cors());

// Compresses all the responses
app.use(compression());

// Setup Cookie Parser
app.use(cookieParser());

// Setup layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
// Setup root path for views directory
app.set('views', path.join(__dirname, 'views'));
// Setup view engine
app.set('view engine', 'ejs');

// Setup for the root path for public directory
app.use(express.static(path.join(__dirname, 'public')));

// Setup middleware
app.use([logger]);

// Create mysql database pool
dbMysql.init();


app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
}));

app.use(passport.initialize());
require('./utils/passport');


const index = require('./modules/index/index.routes');
const user = require('./modules/user/user.routes');
const api = require('./modules/api/api.routes');
const oauth = require('./modules/oauth/oauth.routes');

app.use('/', index);
app.use('/api', [authorizeApi(['getUsers'])], api);
app.use('/user', user);
app.use('/oauth', oauth);

swaggerDocs(app, SERVER_PORT);

app.all('*', (req: Request, res: Response) => {
  res.status(404).json({error: 'Resource not found!'});
});

app.listen(SERVER_PORT, SERVER_HOST, function() {
  console.log('Listening at http://'+SERVER_HOST+':' + SERVER_PORT + ' ⚡\n');
});
