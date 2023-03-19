import {execute} from '../../utils/db.mysql';

import {UserSessionQueries} from './user-session.queries';
import {IUserSession} from './user-session.model';

import {dateToDateString} from '../../utils/utils';

/**
 * gets a user session valid
 * @param {int} userId
 * @param {string} sessionId
 */
export const getUserSession = async (
    userId: IUserSession['user_id'],
    sessionId: IUserSession['session_id'],
) => {
  return execute<IUserSession>(
      UserSessionQueries.GetUserSession,
      [userId, sessionId],
  );
};

/**
 * gets a previous user session
 * @param {int} userId
 */
export const getUserSessionPrevious = async (
    userId: IUserSession['user_id'],
) => {
  return execute<IUserSession>(
      UserSessionQueries.GetUserSessionPrevious,
      [userId, dateToDateString(new Date())],
  );
};

/**
 * adds a new user session record
 * @param {int} userId
 * @param {int} userAccessTokenId
 * @param {string} sessionId
 */
export const addUserSession = async (
    userId: IUserSession['user_id'],
    userAccessTokenId: number | null,
    sessionId: IUserSession['session_id'],
) => {
  const result = await execute<{affectedRows: number}>(
      UserSessionQueries.AddUserSession, [
        userId,
        userAccessTokenId,
        sessionId,
      ],
  );
  return result.affectedRows > 0;
};

/**
 * updates user ssession date updated
 * @param {int} userId
 * @param {string} sessionId
 * @param {string} date
 */
export const updateUserSessionDateUpdated = async (
    userId: IUserSession['user_id'],
    sessionId: IUserSession['session_id'],
) => {
  const result = await execute<{affectedRows: number}>(
      UserSessionQueries.UpdateUserSessionDateUpdated, [
        userId,
        sessionId,
        dateToDateString(new Date()),
      ],
  );
  return result.affectedRows > 0;
};
