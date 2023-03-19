import {Request, Response, NextFunction} from 'express';
import {TokenPayload, validateToken} from './../utils/jwt';

const {apiPost} = require('./../utils/http.request');
const {getCookieOptions} = require('./../modules/user/user.services');

const bypassUrl = (url: string): boolean => {
  const urls:string[] = [
    '/api/user/login',
    '/api/user/sign-up/email',
    '/api/user/sign-up/google',
    '/api/user/sign-up/facebook',
    '/api/user/reset-password',
    '/api/user/new-password',
    '/api/user/verification/code',
    '/api/user/register-verification',
    '/api/user/register-verification-resend',
    '/user/login',
    '/user/sign-up',
    '/user/sign-up/google',
    '/user/sign-up/facebook',
    '/user/reset-password',
    '/user/register-verification',
    '/user/register-verification-resend',
    '/register-verification/:key',
  ];

  return urls.includes(url);
};

/**
 * middleware to check whether user has access to a specific endpoint
 * @param {string[]} allowedAccessTypes list of allowed access types
 * of a specific endpoint
 * @return {boolean}
 */
const authorizeApi = (allowedAccessTypes: string[]) => async (
    req: Request,
    res: Response,
    next: NextFunction) => {
  try {
    if (bypassUrl(req.originalUrl)) {
      next();
      return true;
    }

    let jwt = req.headers.authorization;

    // verify request has token
    if (jwt) {
      // remove Bearer if using Bearer Authorization mechanism
      if (jwt.toLowerCase().startsWith('bearer')) {
        jwt = jwt.slice('bearer'.length).trim();
      }

      // verify token hasn't expired yet
      const decodedToken = await validateToken(jwt);
      if (decodedToken) {
        res.locals.userSave = decodedToken;

        // const hasAccessToEndpoint = allowedAccessTypes.some(
        //     (at) => (decodedToken.access_types as string[]).some(
        //         (uat) => uat === at,
        //     ),
        // );

        // if (!hasAccessToEndpoint) {
        //   res.status(401).json(
        //       {message: 'No enough privileges to access endpoint'},
        //   );
        // }

        next();
        return true;
      }
    }

    res.status(500).json({message: 'Failed to authenticate user'});
    return false;
  } catch (error) {
    console.log(error);
    // if (error.name === 'TokenExpiredError') {
    //   res.status(401).json({message: 'Expired token'});
    // }

    res.status(500).json({message: 'Failed to authenticate user'});
    return false;
  }
};

/**
 * middleware to check whether user has access to a specific endpoint
 * @param {string[]} allowedAccessTypes list of allowed access types
 * of a specific endpoint
 * @return {boolean}
 */
const authorize = (allowedAccessTypes: string[]) => async (
    req: Request,
    res: Response,
    next: NextFunction) => {
  try {
    if (bypassUrl(req.originalUrl)) {
      next();
      return true;
    }

    const token = req.cookies['userSave'];

    // verify request has token
    if (token) {
      // verify token hasn't expired yet
      const decodedToken = await validateToken(token) as TokenPayload;
      if (decodedToken) {
        res.locals.userSave = decodedToken;

        const result = await apiPost(req, '/user/session', {
          session_id: req.sessionID,
        });

        if (result) {
          res.locals.userSessionSave = result.current;
          if (result.previous) {
            res.locals.userSessionPreviousSave = result.previous;
          }
          if (result.refresh_token) {
            const cookieOptions = getCookieOptions();
            res.cookie('userSave', result.refresh_token, cookieOptions);
          }
        }

        if (!decodedToken.date_verified) {
          if (bypassUrl(req.originalUrl) || bypassUrl(req.route.path)) {
            next();
            return true;
          } else {
            res.status(200).redirect('/user/register-verification-resend');
            return false;
          }
        }

        // const hasAccessToEndpoint = allowedAccessTypes.some(
        //     (at) => (decodedToken.access_types as string[]).some(
        //         (uat) => uat === at,
        //     ),
        // );

        // if (!hasAccessToEndpoint) {
        //   res.status(401).json(
        //       {message: 'No enough privileges to access endpoint'},
        //   );
        // }

        next();
        return true;
      }
    }
    res.status(200).redirect('/user/login');
    return false;
  } catch (error) {
    res.status(200).redirect('/user/login');
    return false;
  }
};

/**
 * middleware to check whether user has access to a specific endpoint
 * @return {boolean}
 */
const isAuthorized = () => async (
    req: Request,
    res: Response,
    next: NextFunction) => {
  try {
    const token = req.cookies['userSave'];

    // verify request has token
    if (token) {
      // verify token hasn't expired yet
      const decodedToken = await validateToken(token) as TokenPayload;
      if (decodedToken) {
        res.locals.userSave = decodedToken;

        if (!decodedToken.date_verified) {
          if (bypassUrl(req.originalUrl) || bypassUrl(req.route.path)) {
            next();
            return true;
          } else {
            res.status(200).redirect('/user/register-verification-resend');
            return false;
          }
        }

        res.status(200).redirect('/');
        return false;
      }
    }

    next();
    return true;
  } catch (error) {
    next();
    return true;
  }
};

module.exports = {
  authorizeApi,
  authorize,
  isAuthorized,
};
