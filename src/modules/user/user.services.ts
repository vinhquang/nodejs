import {execute} from '../../utils/db.mysql';

import {UserQueries} from './user.queries';
import {IUser} from './user.model';

import * as UserVerificationCodeServices
  from '../user-verification-code/user-verification-code.services';

export const Provider = {
  email: 'email',
  google: 'google',
  facebook: 'facebook',
};

/**
 * gets active user
 */
export const getUsers = async () => {
  return execute<IUser[]>(UserQueries.GetUsers, []);
};

/**
 * gets dashboard user
 */
export const getDashboardUsers = async () => {
  return execute<IUser[]>(UserQueries.GetDashboardUsers, []);
};

/**
 * gets a user based on id provided
 * @param {int} id
 */
export const getUserById = async (id: IUser['id']) => {
  return execute<IUser>(UserQueries.GetUserById, [id]);
};

/**
 * gets a user based on email provided
 * @param {string} email
 */
export const getUserByEmail = async (email: IUser['email']) => {
  return execute<IUser>(UserQueries.GetUserByEmail, [email]);
};

/**
 * gets a user based on identity provided
 * @param {string} identity
 */
export const getUserByIdentity = async (identity: string) => {
  return execute<IUser>(UserQueries.GetUserByIdentity, [
    identity,
    identity,
    identity,
  ]);
};

/**
 * adds a new user by email
 * @param {IUser} user
 */
export const addUserEmail = async (user: IUser) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.AddUserEmail, [
        user.full_name,
        user.full_name,
        user.email,
        user.password,
      ],
  );

  if (result.affectedRows > 0) {
    const results = await getUserByEmail(user.email);
    const users = Object.values(JSON.parse(JSON.stringify(results)));
    const newUser = users[0] as IUser;

    UserVerificationCodeServices
        .addUserVerificationCode(
            UserVerificationCodeServices.ActionType.registerVerification,
            newUser.email,
            newUser.id as number,
        );

    return true;
  } else {
    return false;
  }
};

/**
 * adds a new user by google
 * @param {IUser} user
 */
export const addUserGoogle = async (user: IUser) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.AddUserGoogle, [
        user.full_name,
        user.full_name,
        user.email,
        user.google_id,
        user.password,
      ],
  );

  if (result.affectedRows > 0) {
    return true;
  } else {
    return false;
  }
};

/**
 * adds a new user by facebook
 * @param {IUser} user
 */
export const addUserFacebook = async (user: IUser) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.AddUserFacebook, [
        user.full_name,
        user.full_name,
        user.email,
        user.facebook_id,
        user.password,
      ],
  );

  if (result.affectedRows > 0) {
    return true;
  } else {
    return false;
  }
};

/**
 * updates user google_id
 * @param {int} id
 * @param {string} googleId
 */
export const updateGoogleIdByUserId = async (
    id: IUser['id'],
    googleId: IUser['google_id'],
) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.UpdateGoogleIdByUserId, [
        googleId,
        id,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * updates user facebook_id
 * @param {int} id
 * @param {string} facebookId
 */
export const updateFacebookIdByUserId = async (
    id: IUser['id'],
    facebookId: IUser['facebook_id'],
) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.UpdateFacebookIdByUserId, [
        facebookId,
        id,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * updates user information based on the id provided
 * @param {int} id
 * @param {string} fullName
 */
export const updateFullNameByUserId = async (
    id: IUser['id'],
    fullName: IUser['full_name'],
) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.UpdateFullNameByUserId, [
        fullName,
        id,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * updates user information based on the id provided
 * @param {int} id
 * @param {string} displayName
 */
export const updateDisplayNameByUserId = async (
    id: IUser['id'],
    displayName: IUser['display_name'],
) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.UpdateDisplayNameByUserId, [
        displayName,
        id,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * updates user password by id
 * @param {int} id
 * @param {string} password
 */
export const updatePasswordByUserId = async (
    id: IUser['id'],
    password: IUser['password'],
) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.UpdatePasswordByUserId, [
        password,
        id,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * updates user verified by id
 * @param {int} id
 * @param {string} password
 */
export const updateVerifiedByUserId = async (
    id: IUser['id'],
) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.updateVerifiedByUserId, [
        id,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * updates user information based on the id provided
 * @param {int} id
 */
export const deleteUser = async (id: IUser['id']) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.DeleteUserById, [
        id,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * gets a user access token valid
 * @param {int} userId
 */
export const getUserAccessToken = async (userId: IUser['id']) => {
  return execute<IUser>(UserQueries.GetUserAccessToken, [userId]);
};

/**
 * adds a new access token record
 * @param {int} userId
 * @param {string} accessToken
 * @param {date} dateExpired
 */
export const addUserAccessToken = async (
    userId: IUser['id'],
    accessToken: string,
    dateExpired: string,
) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.AddUserAccessToken, [
        userId,
        accessToken,
        dateExpired,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * updates access token date updated
 * @param {int} userId
 */
export const updateUserAccessTokenDateUpdated = async (userId: IUser['id']) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.UpdateUserAccessTokenDateUpdated, [
        userId,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * updates user information based on the id provided
 * @param {int} userId
 */
export const deleteUserAccessToken = async (userId: IUser['id']) => {
  const result = await execute<{affectedRows: number}>(
      UserQueries.DeleteUserAccessTokenByUserId, [
        userId,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * get cookie options
 * @return {object}
 */
export const getCookieOptions = () => {
  const cookieOptions = {
    expires: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  return cookieOptions;
};
