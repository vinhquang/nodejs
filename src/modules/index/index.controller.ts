import {Request, Response, RequestHandler} from 'express';

const {apiGet} = require('../../utils/http.request');
import * as Utils from '../../utils/utils';

// GET '/'
const index: RequestHandler = async (req: Request, res: Response) => {
  const results = await apiGet(req, '/user/dashboard');

  res.render('./pages/index', {
    title: 'Dashboard',
    layout: './layouts/main',
    utils: Utils,
    user: res.locals.userSave,
    items: results.users,
    dashboard: (results.dashboard) ? results.dashboard : null,
    previousSession:
      (res.locals.userSessionPreviousSave) ?
        res.locals.userSessionPreviousSave :
        null,
  });
};

// export controller functions
module.exports = {
  index,
};
