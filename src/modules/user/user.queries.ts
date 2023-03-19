export const UserQueries = {
  GetUsers: `
  SELECT
    user.id,
      full_name,
      display_name,
      email,
      password,
    (case when user.is_disabled = 1
      then true
      else false
    end) as 'is_disabled',
    COUNT(DISTINCT user_access_token.id) as login_count,
    IF(MAX(user_session.date_created) > MAX(user_session.date_updated),
      MAX(user_session.date_created),
      MAX(user_session.date_updated)) as last_session,
    user.date_verified,
    user.date_created
  FROM user
    LEFT JOIN user_access_token ON (user_access_token.user_id = user.id)
    LEFT JOIN user_session ON (user_session.user_id = user.id)
  WHERE
      is_disabled = false
  GROUP BY user.id
  ORDER BY user.id DESC
  `,

  GetDashboardUsers: `
  SELECT
    COUNT(DISTINCT user.id) AS total_user,
    COUNT(DISTINCT IF (DATE(user_session.date_created) = CURDATE(),
      user_session.user_id, NULL)) AS total_user_active_today,
    (SELECT AVG(total_user)
      FROM (SELECT
      COUNT(DISTINCT user_session.user_id) AS total_user,
      DATE(user_session.date_created) AS date
      FROM user_session
      WHERE DATE(user_session.date_created)
        BETWEEN (CURDATE() - INTERVAL 7 DAY) AND CURDATE()
      GROUP BY DATE(user_session.date_created))
        AS user_active_7_days) AS avg_user_active_7_days
  FROM user
    LEFT JOIN user_access_token ON (user_access_token.user_id = user.id)
    LEFT JOIN user_session ON (user_session.user_id = user.id)
  WHERE
      is_disabled = false
  `,

  GetUserById: `
  SELECT
    id,
      full_name,
      display_name,
      email,
      password,
    (case when u.is_disabled = 1
      then true
      else false
    end) as 'is_disabled',
    date_verified
  FROM user as u
  WHERE
    id = ?
  `,

  GetUserByEmail: `
  SELECT
    id,
      full_name,
      display_name,
      email,
      password,
    (case when u.is_disabled = 1
      then true
      else false
    end) as 'is_disabled',
    date_verified
  FROM user as u
  WHERE
    email = ?
  `,

  GetUserByIdentity: `
  SELECT
    id,
      full_name,
      display_name,
      email,
      password,
    (case when u.is_disabled = 1
      then true
      else false
    end) as 'is_disabled',
    date_verified
  FROM user as u
  WHERE
    email = ? OR google_id = ? OR facebook_id = ?
  `,

  AddUserEmail: `
  INSERT INTO user
    (provider, full_name, display_name, email,
      password, is_disabled, date_created)
      VALUES ('email', ?, ?, ?, ?, 0, NOW());
  `,

  AddUserGoogle: `
  INSERT INTO user
    (provider, full_name, display_name, email, google_id,
      password, is_disabled, date_verified, date_created)
        VALUES ('google', ?, ?, ?, ?, ?, 0, NOW(), NOW());
  `,

  AddUserFacebook: `
  INSERT INTO user
    (provider, full_name, display_name, email, facebook_id,
      password, is_disabled, date_verified, date_created)
        VALUES ('facebook', ?, ?, ?, ?, ?, 0, NOW(), NOW());
  `,

  UpdateGoogleIdByUserId: `
  UPDATE user
  SET google_id = ?
  WHERE
    id = ?
  `,

  UpdateFacebookIdByUserId: `
  UPDATE user
  SET facebook_id = ?
  WHERE
    id = ?
  `,

  UpdateFullNameByUserId: `
  UPDATE user
  SET full_name = ?
  WHERE
    id = ?
  `,

  UpdateDisplayNameByUserId: `
  UPDATE user
  SET display_name = ?
  WHERE
    id = ?
  `,

  UpdatePasswordByUserId: `
  UPDATE user
  SET password = ?
  WHERE
    id = ?
  `,

  updateVerifiedByUserId: `
  UPDATE user
  SET date_verified = NOW()
  WHERE
    id = ?
  `,

  DeleteUserById: `
  UPDATE user
  SET is_disabled = 1
  WHERE
    id = ?
  `,

  GetUserAccessToken: `
  SELECT
    id,
      user_id,
      access_token,
      date_expired
  FROM user_access_token
  WHERE
    user_id = ?
    AND date_deleted IS NULL
  `,

  AddUserAccessToken: `
  INSERT INTO user_access_token
    (user_id, access_token, date_expired, date_created)
    VALUES (?, ?, ?, NOW());
  `,

  DeleteUserAccessTokenByUserId: `
  UPDATE user_access_token
  SET date_deleted = NOW()
  WHERE
    user_id = ?
    AND date_deleted IS NULL
  `,

  UpdateUserAccessTokenDateUpdated: `
  UPDATE user_access_token
  SET date_updated = NOW()
  WHERE
    user_id = ?
    AND date_deleted IS NULL
  `,
};
