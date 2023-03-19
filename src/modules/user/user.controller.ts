import {Request, Response, RequestHandler} from 'express';
const Joi = require('joi');
const {joiPasswordExtendCore} = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

const {apiGet, apiPost, apiPatch} = require('../../utils/http.request');
import * as Utils from '../../utils/utils';

import * as UserServices
  from '../user/user.services';
import * as UserVerificationCodeServices
  from '../user-verification-code/user-verification-code.services';

// GET '/user/login'
const login: RequestHandler = async (req: Request, res: Response) => {
  let isValidLogin = false;

  let message = '';
  const data = {
    email: '',
  };

  if (req.method == 'POST') {
    const schema = Joi.object({
      email: Joi.string().required().email()
          .label('Email'),
      password: joiPassword
          .string()
          .min(8)
          .minOfSpecialCharacters(1)
          .minOfLowercase(1)
          .minOfUppercase(1)
          .minOfNumeric(1)
          .noWhiteSpaces()
          .required()
          .label('Password'),
    });
    const validation = schema.validate(req.body);
    if (req.body.email) {
      data.email = req.body.email;
    }

    if (!validation.error) {
      const user = await apiPost(req, '/user/login', req.body);

      if (user) {
        if (user.token) {
          if (user.session_id) {
            req.sessionID = user.session_id;
          }

          const cookieOptions = UserServices.getCookieOptions();
          res.cookie('userSave', user.token, cookieOptions);

          isValidLogin = true;
        } else {
          message = user['message'];
        }
      }
    } else {
      message = validation.error.message;
    }
  }

  if (isValidLogin) {
    res.status(200).redirect('/');
  } else {
    res.render('./pages/user/login', {
      title: 'Login',
      layout: './layouts/login',
      message: message,
      data: data,
    });
  }
};

// GET '/user/sign-up'
const signUp: RequestHandler = async (req: Request, res: Response) => {
  let isValidLogin = false;

  let message = '';
  const data = {
    full_name: '',
    email: '',
  };

  if (req.method == 'POST') {
    const schema = Joi.object({
      full_name: Joi.string().required()
          .label('Full name'),
      email: Joi.string().required().email()
          .label('Email'),
      password: joiPassword
          .string()
          .min(8)
          .minOfSpecialCharacters(1)
          .minOfLowercase(1)
          .minOfUppercase(1)
          .minOfNumeric(1)
          .noWhiteSpaces()
          .required()
          .label('Password'),
      confirm_password: Joi.any().equal(Joi.ref('password'))
          .required()
          .label('Confirm password')
          .messages({'any.only': '{{#label}} does not match'}),
    });
    const validation = schema.validate(req.body);
    if (req.body.full_name) {
      data.full_name = req.body.full_name;
    }
    if (req.body.email) {
      data.email = req.body.email;
    }

    if (!validation.error) {
      const user = await apiPost(req, '/user/sign-up/email', req.body);

      if (user) {
        if (user.token) {
          if (user.session_id) {
            req.sessionID = user.session_id;
          }

          const cookieOptions = UserServices.getCookieOptions();
          res.cookie('userSave', user.token, cookieOptions);

          isValidLogin = true;
        } else {
          message = user['message'];
        }
      }
    } else {
      message = validation.error.message;
    }
  }

  if (isValidLogin) {
    res.status(200).redirect('/');
  } else {
    res.render('./pages/user/sign-up', {
      title: 'Sign up',
      layout: './layouts/login',
      message: message,
      data: data,
    });
  }
};

// GET '/user/reset-password'
const resetPassword: RequestHandler = async (req: Request, res: Response) => {
  let message = '';
  let success = '';
  const data = {
    email: '',
  };

  if (req.method == 'POST') {
    const schema = Joi.object({
      email: Joi.string().required().email()
          .label('Email'),
    });
    const validation = schema.validate(req.body);
    if (req.body.email) {
      data.email = req.body.email;
    }

    if (!validation.error) {
      const result = await apiPost(req, '/user/reset-password', req.body);

      if (result) {
        if (result.success) {
          success = 'Please check your email for verification link';
        } else {
          message = result['message'];
        }
      }
    } else {
      message = validation.error.message;
    }
  }

  res.render('./pages/user/reset-password', {
    title: 'Reset password',
    layout: './layouts/login',
    message: message,
    success: success,
    data: data,
  });
};

// GET '/user/new-password'
const newPassword: RequestHandler = async (req: Request, res: Response) => {
  let isValidLogin = false;
  let isValidVerificationCode = false;

  let message = '';
  let success = '';
  let error = '';

  if (req.params.key) {
    const verificationCodeResults = await apiPost(
        req, '/user/verification/code', {
          action: UserVerificationCodeServices.ActionType.resetPassword,
          verification_code: req.params.key,
        },
    );

    if (verificationCodeResults) {
      if (verificationCodeResults.success) {
        isValidVerificationCode = true;
      }
    }
  }

  if (isValidVerificationCode) {
    if (req.method == 'POST') {
      const schema = Joi.object({
        old_password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .required()
            .label('Old password'),
        password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .required()
            .label('Password'),
        confirm_password: Joi.any().equal(Joi.ref('password'))
            .required()
            .label('Confirm password'),
      });
      const validation = schema.validate(req.body);

      if (!validation.error) {
        req.body['verification_code'] = req.params.key;
        const user = await apiPost(req, '/user/new-password', req.body);

        if (user) {
          if (user.token) {
            if (user.session_id) {
              req.sessionID = user.session_id;
            }

            const cookieOptions = UserServices.getCookieOptions();
            res.cookie('userSave', user.token, cookieOptions);

            isValidLogin = true;
          } else {
            message = user['message'];
          }
        }
      } else {
        message = validation.error.message;
      }
    }

    if (isValidLogin) {
      success = 'Your new password has been updated';
    }
  } else {
    error = 'Verification code is not valid';
  }

  res.render('./pages/user/new-password', {
    title: 'New password',
    layout: './layouts/login',
    error: error,
    success: success,
    message: message,
  });
};

// GET '/user/register-verification'
const registerVerification: RequestHandler = async (
    req: Request,
    res: Response,
) => {
  let isValidLogin = false;
  let isValidVerificationCode = false;

  let message = '';
  let success = '';
  let error = '';

  if (req.params.key) {
    const verificationCodeResults = await apiPost(
        req, '/user/verification/code', {
          action: UserVerificationCodeServices.ActionType.registerVerification,
          verification_code: req.params.key,
        },
    );

    if (verificationCodeResults) {
      if (verificationCodeResults.success) {
        isValidVerificationCode = true;
      }
    }
  }

  if (isValidVerificationCode) {
    req.body['verification_code'] = req.params.key;
    const user = await apiPost(req, '/user/register-verification', req.body);

    if (user) {
      if (user.token) {
        const cookieOptions = UserServices.getCookieOptions();
        res.cookie('userSave', user.token, cookieOptions);

        isValidLogin = true;
      } else {
        message = user['message'];
      }
    }

    if (isValidLogin) {
      success = 'Your account has been activated';
    }
  } else {
    error = 'Verification code is not valid';
  }

  res.render('./pages/user/sign-up-verification', {
    title: 'Account verification',
    layout: './layouts/login',
    error: error,
    success: success,
    message: message,
  });
};

// GET '/user/register-verification-resend'
const registerVerificationResend: RequestHandler = async (
    req: Request,
    res: Response,
) => {
  let message = '';
  let success = '';
  const data = {
    email: res.locals.userSave.email,
  };

  if (req.method == 'POST') {
    const schema = Joi.object({
      email: Joi.string().required().email()
          .label('Email'),
    });
    const validation = schema.validate(req.body);
    if (req.body.email) {
      data.email = req.body.email;
    }

    if (!validation.error) {
      const result =
          await apiPost(req, '/user/register-verification-resend', req.body);

      if (result) {
        if (result.success) {
          success = 'Please check your email for verification link';
        } else {
          message = result['message'];
        }
      }
    } else {
      message = validation.error.message;
    }
  }

  res.render('./pages/user/sign-up-verification-resend', {
    title: 'Account verification',
    layout: './layouts/login',
    success: success,
    message: message,
    data: data,
  });
};

// GET '/user/profile'
const profile: RequestHandler = async (
    req: Request,
    res: Response,
) => {
  let message = '';
  let success = '';
  const data = {
    display_name: '',
  };

  if (req.method == 'POST') {
    const schema = Joi.object({
      display_name: Joi.string().required()
          .label('Display name'),
    });
    const validation = schema.validate(req.body);
    if (req.body.display_name) {
      data.display_name = req.body.display_name;
    }

    if (!validation.error) {
      const user = await apiPatch(req, '/user/display-name', req.body);

      if (user) {
        if (user.token) {
          const cookieOptions = UserServices.getCookieOptions();
          res.cookie('userSave', user.token, cookieOptions);

          res.locals.userSave = user.payload;
          success = 'Your profile has been updated';
        } else {
          message = user['message'];
        }
      }
    } else {
      message = validation.error.message;
    }
  }

  res.render('./pages/user/profile', {
    title: 'Profile',
    layout: './layouts/main',
    utils: Utils,
    success: success,
    message: message,
    data: data,
    user: res.locals.userSave,
    previousSession:
      (res.locals.userSessionPreviousSave) ?
        res.locals.userSessionPreviousSave :
        null,
  });
};

// PATCH '/user/display-name/reset'
const displayNameReset: RequestHandler = async (
    req: Request,
    res: Response,
) => {
  const user = await apiPatch(req, '/user/display-name/reset', {});

  if (user) {
    if (user.token) {
      const cookieOptions = UserServices.getCookieOptions();
      res.cookie('userSave', user.token, cookieOptions);
    }
  }

  res.status(200).redirect('/user/profile');
};

// GET '/user/logout'
const logout: RequestHandler = async (req: Request, res: Response) => {
  apiGet(req, '/user/logout');

  res.cookie('userSave', 'logout', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });

  req.session.destroy(function(err) {
    res.clearCookie('userSave');

    res.status(200).redirect('/user/login');
  });
};

// export controller functions
module.exports = {
  login,
  signUp,
  resetPassword,
  newPassword,
  registerVerification,
  registerVerificationResend,
  profile,
  displayNameReset,
  logout,
};
