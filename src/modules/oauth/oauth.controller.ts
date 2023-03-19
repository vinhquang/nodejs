import {Request, Response, RequestHandler} from 'express';

const {apiPost} = require('../../utils/http.request');
// import * as Utils from '../../utils/utils';

import * as UserServices
  from '../user/user.services';

interface PassportUser {
  id: string
  displayName: string
  emails: any
}

// GET '/'
const google: RequestHandler = async (req: Request, res: Response) => {
  const newUser = req.user as PassportUser;

  if (newUser) {
    const data = {
      google_id: newUser.id,
      full_name: newUser.displayName,
      email: newUser.emails[0].value,
    };

    const user = await apiPost(req, '/user/sign-up/google', data);

    if (user) {
      if (user.token) {
        if (user.session_id) {
          req.sessionID = user.session_id;
        }

        const cookieOptions = UserServices.getCookieOptions();
        res.cookie('userSave', user.token, cookieOptions);
      }
    }
  }

  res.status(200).redirect('/');
};

// GET '/'
const facebook: RequestHandler = async (req: Request, res: Response) => {
  const newUser = req.user as PassportUser;

  if (newUser) {
    const data = {
      facebook_id: newUser.id,
      full_name: newUser.displayName,
    };

    const user = await apiPost(req, '/user/sign-up/facebook', data);

    if (user) {
      if (user.token) {
        if (user.session_id) {
          req.sessionID = user.session_id;
        }

        const cookieOptions = UserServices.getCookieOptions();
        res.cookie('userSave', user.token, cookieOptions);
      }
    }
  }

  res.status(200).redirect('/');
};

// export controller functions
module.exports = {
  google,
  facebook,
};
