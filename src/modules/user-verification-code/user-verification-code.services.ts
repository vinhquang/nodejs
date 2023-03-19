import {execute} from '../../utils/db.mysql';

import {UserVerificationCodeQueries} from './user-verification-code.queries';
import {IUserVerificationCode} from './user-verification-code.model';

import {generateRandomString} from '../../utils/utils';
import {smtpEmail} from '../../utils/send.email';

export const ActionType = {
  resetPassword: 'reset-password',
  registerVerification: 'register-verification',
};

/**
 * gets a user verification code valid
 * @param {string} action
 * @param {string} email
 */
export const getUserVerificationCodeValidByAction = async (
    action: IUserVerificationCode['action'],
    email: IUserVerificationCode['email'],
) => {
  return execute<IUserVerificationCode>(
      UserVerificationCodeQueries.GetUserVerificationCodeValidByAction,
      [action, email],
  );
};

/**
 * gets a user verification code by code
 * @param {string} action
 * @param {string} verificationCode
 */
export const getUserVerificationCodeValidByCode = async (
    action: IUserVerificationCode['action'],
    verificationCode: IUserVerificationCode['verification_code'],
) => {
  return execute<IUserVerificationCode>(
      UserVerificationCodeQueries.GetUserVerificationCodeValidByCode,
      [action, verificationCode],
  );
};

/**
 * adds a new user verification code record
 * @param {string} action
 * @param {string} email
 * @param {int} userId
 */
export const addUserVerificationCode = async (
    action: IUserVerificationCode['action'],
    email: IUserVerificationCode['email'],
    userId: IUserVerificationCode['user_id'],
) => {
  const minuteExpired = getMinuteExpired(action);
  const verificationCode =
      generateRandomString(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

  const result = await execute<{affectedRows: number}>(
      UserVerificationCodeQueries.AddUserVerificationCode, [
        userId,
        action,
        email,
        verificationCode,
        minuteExpired,
      ],
  );

  if (result.affectedRows > 0) {
    sendEmail(action, email, verificationCode);

    return true;
  } else {
    return false;
  }
};

/**
 * updates user verification code resend count
 * @param {IUserVerificationCode} verificationCode
 */
export const updateUserVerificationCodeResendCount = async (
    verificationCode: IUserVerificationCode,
) => {
  const minuteExpired = getMinuteExpired(verificationCode.action);

  const result = await execute<{affectedRows: number}>(
      UserVerificationCodeQueries.UpdateUserVerificationCodeResendCount, [
        minuteExpired,
        verificationCode.id,
      ],
  );

  if (result.affectedRows > 0) {
    sendEmail(
        verificationCode.action,
        verificationCode.email,
        verificationCode.verification_code,
    );

    return true;
  } else {
    return false;
  }
};

/**
 * updates user verification code verified
 * @param {int} id
 */
export const updateUserVerificationCodeVerified = async (
    id: IUserVerificationCode['id'],
) => {
  const result = await execute<{affectedRows: number}>(
      UserVerificationCodeQueries.UpdateUserVerificationCodeVerified, [
        id,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * get minute expired by action
 * @param {string} action
 * @return {Date}
 */
const getMinuteExpired = (action: String) => {
  let minutes = 0;
  switch (action) {
    case ActionType.resetPassword:
      minutes = 5;
      break;
    case ActionType.registerVerification:
      minutes = 60 * 24 * 365;
      break;
    default:
      break;
  }

  return minutes;
};

/**
 * get date expired by action
 * @param {string} action
 * @return {Date}
 */
// const getDateExpired = (action: String) => {
//   let minutes = 0;
//   switch (action) {
//     case ActionType.resetPassword:
//       minutes = 5;
//       break;
//     case ActionType.registerVerification:
//       minutes = 60 * 24 * 365;
//       break;
//     default:
//       break;
//   }

//   const dateExpired = new Date(
//       Date.now() + (minutes * 60 * 1000),
//   );

//   return dateExpired;
// };

export const sendEmail = async (
    action: IUserVerificationCode['action'],
    email: IUserVerificationCode['email'],
    verificationCode: IUserVerificationCode['verification_code'],
) => {
  let subject = '';
  let link = '';
  let html = '';

  switch (action) {
    case ActionType.resetPassword:
      subject = 'Reset password';
      link = process.env.FRONTEND_URL + '/user/new-password/' +
          verificationCode;
      html = '<h1>Reset password</h1>' +
          'Please click this link: ' + link;
      break;
    case ActionType.registerVerification:
      subject = 'Account verification';
      link = process.env.FRONTEND_URL + '/user/register-verification/' +
          verificationCode;
      html = '<h1>Account verification</h1>' +
          'Please click this link: ' + link;
      break;
    default:
      break;
  }

  smtpEmail(email, subject, html);
};
