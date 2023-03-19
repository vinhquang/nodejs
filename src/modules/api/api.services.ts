import * as UserServices from '../user/user.services';
import * as UserSessionServices from '../user-session/user-session.services';

import {dateToString} from '../../utils/utils';

/**
 * Update log after login
 * @param {int} userId
 * @param {string} token
 * @param {string} sessionId
 */
export const afterLogin = async (
    userId: number,
    token: string,
    sessionId: string,
) => {
  await UserServices.deleteUserAccessToken(userId);

  const dateExpired = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
  );
  await UserServices.addUserAccessToken(
      userId,
      token,
      dateToString(dateExpired),
  );
  await UserSessionServices.addUserSession(
      userId,
      null,
      sessionId,
  );
};
