import {Request, Response, RequestHandler} from 'express';
import bcrypt from 'bcryptjs';
const Joi = require('joi');
const {joiPasswordExtendCore} = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

import {generateToken} from '../../utils/jwt';
import {generateRandomString} from '../../utils/utils';

import * as ApiServices from './api.services';
import * as UserServices from '../user/user.services';
import * as UserSessionServices
  from '../user-session/user-session.services';
import * as UserVerificationCodeServices
  from '../user-verification-code/user-verification-code.services';
import {IUser} from '../user/user.model';
import {IUserVerificationCode}
  from '../user-verification-code/user-verification-code.model';

// GET '/'
const index = (req: Request, res: Response) => {
  res.json({success: true});
};

// POST '/user/login'
const login: RequestHandler = async (req: Request, res: Response) => {
  try {
    const messages:string[] = [];
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

    if (!validation.error) {
      const {email, password} = req.body;

      // Auto login
      const results = await UserServices.getUserByEmail(email);
      const users = Object.values(JSON.parse(JSON.stringify(results)));

      if (users.length == 0) {
        messages.push('Email or Password is incorrect');
      } else {
        const user = users[0] as IUser;
        if (!await bcrypt.compare(password, user.password)) {
          messages.push('Email or Password is incorrect');
        } else {
          const payload = {
            access_types: [],
            full_name: user.full_name,
            display_name: user.display_name,
            email: user.email,
            user_id: user.id,
            date_verified: user.date_verified,
          };

          const token = generateToken(payload);

          await ApiServices.afterLogin(user.id as number, token, req.sessionID);

          res.status(200).json({
            payload: payload,
            token: token,
            session_id: req.sessionID,
          });
        }
      }
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// POST '/user/sign-up/email'
const signUpEmail: RequestHandler = async (req: Request, res: Response) => {
  try {
    const messages:string[] = [];

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

    if (!validation.error) {
      const {email} = req.body;
      req.body['password'] = await bcrypt.hash(req.body['password'], 8);

      // Get existed identity
      const hasIdentityResults = await UserServices.getUserByEmail(email);
      const hasIdentities =
          Object.values(JSON.parse(JSON.stringify(hasIdentityResults)));

      if (hasIdentities.length > 0) {
        messages.push('Your email address has already been registered.');
      } else {
        const results = await UserServices.addUserEmail(req.body);

        if (!results) {
          messages.push('There was an error occur');
        } else {
          // Auto login
          const newUserResults = await UserServices.getUserByEmail(email);
          const newUsers =
              Object.values(JSON.parse(JSON.stringify(newUserResults)));

          const user = newUsers[0] as IUser;
          const payload = {
            access_types: [],
            full_name: user.full_name,
            display_name: user.display_name,
            email: user.email,
            user_id: user.id,
            date_verified: user.date_verified,
          };

          const token = generateToken(payload);

          await ApiServices.afterLogin(user.id as number, token, req.sessionID);

          res.status(200).json({
            payload: payload,
            token: token,
            session_id: req.sessionID,
          });
        }
      }
    } else {
      messages.push(validation.error.message);
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// POST '/user/sign-up/google'
const signUpGoogle: RequestHandler = async (req: Request, res: Response) => {
  try {
    const messages:string[] = [];

    const schema = Joi.object({
      full_name: Joi.string().required()
          .label('Full name'),
      email: Joi.string().required().email()
          .label('Email'),
      google_id: Joi.string().required()
          .label('Identity'),
    });
    const validation = schema.validate(req.body);

    if (!validation.error) {
      const {email} = req.body;
      req.body['password'] = await bcrypt.hash(generateRandomString(16), 8);

      // Get existed identity
      const hasIdentityResults = await UserServices.getUserByEmail(email);
      const hasIdentities =
          Object.values(JSON.parse(JSON.stringify(hasIdentityResults)));

      if (hasIdentities.length == 0) {
        const results = await UserServices.addUserGoogle(req.body);

        if (!results) {
          messages.push('There was an error occur');
        }
      }

      // Auto login
      if (messages.length == 0) {
        let newUser: IUser;

        if (hasIdentities.length > 0) {
          newUser = hasIdentities[0] as IUser;
          if (!newUser.google_id) {
            await UserServices.updateGoogleIdByUserId(
                newUser.id,
                req.body['google_id'],
            );
          }
        } else {
          const newUserResults = await UserServices.getUserByEmail(email);
          const newUsers =
              Object.values(JSON.parse(JSON.stringify(newUserResults)));

          newUser = newUsers[0] as IUser;
        }

        const payload = {
          access_types: [],
          full_name: newUser.full_name,
          display_name: newUser.display_name,
          email: newUser.email,
          user_id: newUser.id,
          date_verified: newUser.date_verified,
        };

        const token = generateToken(payload);

        await ApiServices.afterLogin(
            newUser.id as number,
            token,
            req.sessionID,
        );

        res.status(200).json({
          payload: payload,
          token: token,
          session_id: req.sessionID,
        });
      }
    } else {
      messages.push(validation.error.message);
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// POST '/user/sign-up/facebook'
const signUpFacebook: RequestHandler = async (req: Request, res: Response) => {
  try {
    const messages:string[] = [];

    const schema = Joi.object({
      full_name: Joi.string().required()
          .label('Full name'),
      facebook_id: Joi.string().required()
          .label('Identity'),
    });
    const validation = schema.validate(req.body);

    if (!validation.error) {
      const facebookId = req.body['facebook_id'];
      req.body['password'] = await bcrypt.hash(generateRandomString(16), 8);

      // Get existed identity
      const hasIdentityResults =
          await UserServices.getUserByIdentity(facebookId);
      const hasIdentities =
          Object.values(JSON.parse(JSON.stringify(hasIdentityResults)));

      if (hasIdentities.length == 0) {
        const results = await UserServices.addUserFacebook(req.body);

        if (!results) {
          messages.push('There was an error occur');
        }
      }

      // Auto login
      if (messages.length == 0) {
        let newUser: IUser;

        if (hasIdentities.length > 0) {
          newUser = hasIdentities[0] as IUser;
          if (!newUser.facebook_id) {
            await UserServices.updateFacebookIdByUserId(
                newUser.id,
                req.body['facebook_id'],
            );
          }
        } else {
          const newUserResults =
              await UserServices.getUserByIdentity(facebookId);
          const newUsers =
              Object.values(JSON.parse(JSON.stringify(newUserResults)));

          newUser = newUsers[0] as IUser;
        }

        const payload = {
          access_types: [],
          full_name: newUser.full_name,
          display_name: newUser.display_name,
          email: newUser.email,
          user_id: newUser.id,
          date_verified: newUser.date_verified,
        };

        const token = generateToken(payload);

        await ApiServices.afterLogin(
            newUser.id as number,
            token,
            req.sessionID,
        );

        res.status(200).json({
          payload: payload,
          token: token,
          session_id: req.sessionID,
        });
      }
    } else {
      messages.push(validation.error.message);
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// POST '/user/reset-password'
const resetPassword: RequestHandler = async (req: Request, res: Response) => {
  try {
    const messages:string[] = [];

    const schema = Joi.object({
      email: Joi.string().required().email()
          .label('Email'),
    });
    const validation = schema.validate(req.body);

    if (!validation.error) {
      const {email} = req.body;

      const results = await UserServices.getUserByEmail(email);
      const users = Object.values(JSON.parse(JSON.stringify(results)));

      if (users.length == 0) {
        messages.push('This email address is not registered with us.');
      } else {
        const user = users[0] as IUser;

        // Get previous request is valid
        const hasRequestResults = await UserVerificationCodeServices
            .getUserVerificationCodeValidByAction(
                UserVerificationCodeServices.ActionType.resetPassword,
                user.email,
            );
        const hasRequests =
            Object.values(JSON.parse(JSON.stringify(hasRequestResults)));

        let result: boolean;
        if (hasRequests.length > 0) {
          const hasRequest = hasRequests[0] as IUserVerificationCode;
          result = await UserVerificationCodeServices
              .updateUserVerificationCodeResendCount(hasRequest);
        } else {
          result = await UserVerificationCodeServices
              .addUserVerificationCode(
                  UserVerificationCodeServices.ActionType.resetPassword,
                  user.email,
                  user.id as number,
              );
        }

        if (result) {
          res.status(200).json({success: true});
        } else {
          res.status(200).json({
            message: 'There was an error occur',
          });
        }
      }
    } else {
      messages.push(validation.error.message);
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// POST '/user/new-password'
const newPassword: RequestHandler = async (req: Request, res: Response) => {
  try {
    const messages:string[] = [];

    const schema = Joi.object({
      verification_code: Joi.string().min(6).required()
          .label('Verification code'),
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
          .label('Confirm password')
          .messages({'any.only': '{{#label}} does not match'}),
    });
    const validation = schema.validate(req.body);

    if (!validation.error) {
      const oldPassword = req.body['old_password'];
      const password = await bcrypt.hash(req.body['password'], 8);
      const verificationCode = req.body['verification_code'];
      const action = UserVerificationCodeServices.ActionType.resetPassword;

      const hasVerificationCodeResults = await UserVerificationCodeServices
          .getUserVerificationCodeValidByCode(action, verificationCode);
      const hasVerificationCodes =
            Object.values(JSON.parse(JSON.stringify(
                hasVerificationCodeResults,
            )));

      if (hasVerificationCodes.length > 0) {
        const hasVerificationCode =
            hasVerificationCodes[0] as IUserVerificationCode;

        const oldResults = await UserServices
            .getUserById(hasVerificationCode.user_id);
        const oldUsers = Object.values(JSON.parse(JSON.stringify(oldResults)));
        const oldUser = oldUsers[0] as IUser;

        if (await bcrypt.compare(oldPassword, oldUser.password)) {
          UserVerificationCodeServices
              .updateUserVerificationCodeVerified(hasVerificationCode.id);

          UserServices.updatePasswordByUserId(
              hasVerificationCode.user_id,
              password,
          );

          // Auto login
          const results = await UserServices
              .getUserById(hasVerificationCode.user_id);
          const users = Object.values(JSON.parse(JSON.stringify(results)));

          if (users.length > 0) {
            const user = users[0] as IUser;
            const payload = {
              access_types: [],
              full_name: user.full_name,
              display_name: user.display_name,
              email: user.email,
              user_id: user.id,
              date_verified: user.date_verified,
            };

            const token = generateToken(payload);

            await ApiServices.afterLogin(
                user.id as number,
                token,
                req.sessionID,
            );

            res.status(200).json({
              payload: payload,
              token: token,
              session_id: req.sessionID,
            });
          }
        } else {
          res.status(200).json({
            message: 'Old password is not valid',
          });
        }
      } else {
        res.status(200).json({
          message: 'Verification code is not valid',
        });
      }
    } else {
      messages.push(validation.error.message);
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// POST '/user/register-verification'
const registerVerification: RequestHandler = async (
    req: Request,
    res: Response,
) => {
  try {
    const messages:string[] = [];

    const schema = Joi.object({
      verification_code: Joi.string().min(6).required()
          .label('Verification code'),
    });
    const validation = schema.validate(req.body);

    if (!validation.error) {
      const verificationCode = req.body['verification_code'];
      const action =
        UserVerificationCodeServices.ActionType.registerVerification;

      const hasVerificationCodeResults = await UserVerificationCodeServices
          .getUserVerificationCodeValidByCode(action, verificationCode);
      const hasVerificationCodes =
            Object.values(JSON.parse(JSON.stringify(
                hasVerificationCodeResults,
            )));

      if (hasVerificationCodes.length > 0) {
        const hasVerificationCode =
            hasVerificationCodes[0] as IUserVerificationCode;
        await UserVerificationCodeServices
            .updateUserVerificationCodeVerified(hasVerificationCode.id);

        await UserServices.updateVerifiedByUserId(
            hasVerificationCode.user_id,
        );

        // Auto login
        const results = await UserServices
            .getUserById(hasVerificationCode.user_id);
        const users = Object.values(JSON.parse(JSON.stringify(results)));

        if (users.length > 0) {
          const user = users[0] as IUser;
          const payload = {
            access_types: [],
            full_name: user.full_name,
            display_name: user.display_name,
            email: user.email,
            user_id: user.id,
            date_verified: user.date_verified,
          };

          const token = generateToken(payload);

          res.status(200).json({
            payload: payload,
            token: token,
            session_id: req.sessionID,
          });
        }
      } else {
        res.status(200).json({
          message: 'Verification code is not valid',
        });
      }
    } else {
      messages.push(validation.error.message);
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// POST '/user/register-verification-resend'
const registerVerificationResend: RequestHandler = async (
    req: Request,
    res: Response,
) => {
  try {
    const messages:string[] = [];

    const schema = Joi.object({
      email: Joi.string().required().email()
          .label('Email'),
    });
    const validation = schema.validate(req.body);

    if (!validation.error) {
      const {email} = req.body;
      const action =
        UserVerificationCodeServices.ActionType.registerVerification;

      const results = await UserServices.getUserByEmail(email);
      const users = Object.values(JSON.parse(JSON.stringify(results)));

      if (users.length == 0) {
        messages.push('This email address is not registered with us.');
      } else {
        const user = users[0] as IUser;

        // Get previous request is valid
        const hasRequestResults = await UserVerificationCodeServices
            .getUserVerificationCodeValidByAction(
                action,
                user.email,
            );
        const hasRequests =
            Object.values(JSON.parse(JSON.stringify(hasRequestResults)));

        let result: boolean;
        if (hasRequests.length > 0) {
          const hasRequest = hasRequests[0] as IUserVerificationCode;
          result = await UserVerificationCodeServices
              .updateUserVerificationCodeResendCount(hasRequest);
        } else {
          result = await UserVerificationCodeServices
              .addUserVerificationCode(
                  action,
                  user.email,
                  user.id as number,
              );
        }

        if (result) {
          res.status(200).json({success: true});
        } else {
          res.status(200).json({
            message: 'There was an error occur',
          });
        }
      }
    } else {
      messages.push(validation.error.message);
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// POST '/user/verification/code'
const hasUserVerificationCode: RequestHandler = async (
    req: Request,
    res: Response,
) => {
  try {
    const messages:string[] = [];

    const schema = Joi.object({
      action: Joi.string().required()
          .label('Action'),
      verification_code: Joi.string().min(6).required()
          .label('Verification code'),
    });
    const validation = schema.validate(req.body);

    if (!validation.error) {
      const action = req.body['action'];
      const verificationCode = req.body['verification_code'];

      const hasVerificationCodeResults = await UserVerificationCodeServices
          .getUserVerificationCodeValidByCode(action, verificationCode);
      const hasVerificationCodes =
            Object.values(JSON.parse(JSON.stringify(
                hasVerificationCodeResults,
            )));

      if (hasVerificationCodes.length > 0) {
        res.status(200).json({success: true});
      } else {
        res.status(200).json({
          message: 'Verification code is not valid',
        });
      }
    } else {
      messages.push(validation.error.message);
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// POST '/user/session'
const getUserSession: RequestHandler = async (req: Request, res: Response) => {
  try {
    const messages:string[] = [];
    const sessionId = req.body['session_id'];

    if (!sessionId) {
      messages.push('There was an error occur');
    }

    if (messages.length == 0) {
      const userId = res.locals.userSave.user_id;

      let results = await UserSessionServices.getUserSession(
          userId,
          sessionId,
      );
      let sessions = Object.values(JSON.parse(JSON.stringify(results)));

      // Create session if not exist
      if (sessions.length == 0) {
        UserSessionServices.addUserSession(
            userId,
            null,
            sessionId,
        );
        results = await UserSessionServices.getUserSession(
            userId,
            sessionId,
        );
        sessions = Object.values(JSON.parse(JSON.stringify(results)));
      }

      if (sessions.length > 0) {
        UserSessionServices.updateUserSessionDateUpdated(
            userId,
            sessionId,
        );

        // Get previous session
        const previousResults =
          await UserSessionServices.getUserSessionPrevious(
              userId,
          );
        const previous =
          Object.values(JSON.parse(JSON.stringify(previousResults)));

        const payload = {
          access_types: [],
          full_name: res.locals.userSave.full_name,
          display_name: res.locals.userSave.display_name,
          email: res.locals.userSave.email,
          user_id: res.locals.userSave.user_id,
          date_verified: res.locals.userSave.date_verified,
        };

        const refreshToken = generateToken(payload);

        if (previous.length > 0) {
          res.status(200).json({
            refresh_token: refreshToken,
            current: sessions[0],
            previous: previous[0],
          });
        } else {
          res.status(200).json({
            refresh_token: refreshToken,
            current: sessions[0],
          });
        }
      } else {
        messages.push('There was an error occur');
      }
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// PATCH '/user/display-name'
const updateUserDisplayName: RequestHandler = async (
    req: Request,
    res: Response,
) => {
  try {
    const messages:string[] = [];

    const schema = Joi.object({
      display_name: Joi.string().required()
          .label('Full name'),
    });
    const validation = schema.validate(req.body);

    if (!validation.error) {
      const displayName = req.body['display_name'];

      UserServices.updateDisplayNameByUserId(
          res.locals.userSave.user_id,
          displayName,
      );

      // Update new payload
      res.locals.userSave.display_name = displayName;
      delete res.locals.userSave.iat;
      delete res.locals.userSave.exp;

      const token = generateToken(res.locals.userSave);

      res.status(200).json({
        payload: res.locals.userSave,
        token: token,
        session_id: req.sessionID,
      });
    } else {
      messages.push(validation.error.message);
    }

    if (messages.length > 0) {
      res.status(200).json({message: messages[0]});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// PATCH '/user/display-name/reset'
const updateUserDisplayNameReset: RequestHandler = async (
    req: Request,
    res: Response,
) => {
  try {
    if (res.locals.userSave) {
      if (res.locals.userSave.full_name != res.locals.userSave.display_name) {
        if (res.locals.userSave.user_id) {
          UserServices.updateDisplayNameByUserId(
              res.locals.userSave.user_id,
              res.locals.userSave.full_name,
          );

          // Update new payload
          res.locals.userSave.display_name =
              res.locals.userSave.full_name;
          delete res.locals.userSave.iat;
          delete res.locals.userSave.exp;

          const token = generateToken(res.locals.userSave);

          res.status(200).json({
            payload: res.locals.userSave,
            token: token,
            session_id: req.sessionID,
          });
        } else {
          res.status(200).json({
            message: 'There was an error occur',
          });
        }
      } else {
        res.status(200).json({
          message: 'Nothing change',
        });
      }
    } else {
      res.status(200).json({
        message: 'There was an error occur',
      });
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// GET '/user/dashboard'
const getUserDashboard: RequestHandler = async (
    req: Request,
    res: Response,
) => {
  try {
    const users = await UserServices.getUsers();
    const results = await UserServices.getDashboardUsers();
    const dashboardResults = Object.values(JSON.parse(JSON.stringify(results)));

    if (dashboardResults.length > 0) {
      const dashboard = dashboardResults[0];
      res.status(200).json({users, dashboard});
    } else {
      res.status(200).json({users});
    }
  } catch (error) {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// POST '/user/logout'
const logout: RequestHandler = async (req: Request, res: Response) => {
  if (res.locals.userSave) {
    if (res.locals.userSave.user_id) {
      UserServices.deleteUserAccessToken(res.locals.userSave.user_id);
      res.status(200).json({success: true});
    } else {
      res.status(200).json({
        message: 'There was an error occur',
      });
    }
  } else {
    res.status(200).json({
      message: 'There was an error occur',
    });
  }
};

// export controller functions
module.exports = {
  index,
  login,
  signUpEmail,
  signUpGoogle,
  signUpFacebook,
  logout,
  resetPassword,
  newPassword,
  registerVerification,
  registerVerificationResend,
  getUserDashboard,
  getUserSession,
  hasUserVerificationCode,
  updateUserDisplayName,
  updateUserDisplayNameReset,
};
