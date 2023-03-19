export const UserSessionQueries = {
  GetUserSessionPrevious: `
  SELECT
    id,
    user_id,
    user_access_token_id,
    session_id,
    date,
    date_updated,
    date_created
  FROM user_session
  WHERE
    user_id = ?
    AND date = CURDATE()
  ORDER BY id DESC
  LIMIT 1,1
  `,

  GetUserSession: `
  SELECT
    id,
    user_id,
    user_access_token_id,
    session_id,
    date,
    date_updated,
    date_created
  FROM user_session
  WHERE
    user_id = ?
    AND session_id = ?
    AND date = CURDATE()
  ORDER BY id DESC
  LIMIT 1
  `,

  AddUserSession: `
  INSERT INTO user_session
    (user_id, user_access_token_id, session_id, date, date_created)
    VALUES (?, ?, ?, CURDATE(), NOW());
  `,

  UpdateUserSessionDateUpdated: `
  UPDATE user_session
  SET date_updated = NOW()
  WHERE
    user_id = ?
    AND session_id = ?
    AND date = ?
  `,

};
