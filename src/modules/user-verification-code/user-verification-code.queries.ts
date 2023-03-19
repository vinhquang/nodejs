export const UserVerificationCodeQueries = {
  GetUserVerificationCodeValidByAction: `
  SELECT
    id,
    user_id,
    action,
    email,
    verification_code,
    resend_count,
    date_expired,
    date_verified,
    date_updated,
    date_created
  FROM user_verification_code
  WHERE
    action = ?
    AND email = ?
    AND date_verified IS NULL
    AND date_expired > NOW()
  ORDER BY id DESC
  LIMIT 1
  `,

  GetUserVerificationCodeValidByCode: `
  SELECT
    id,
    user_id,
    action,
    email,
    verification_code,
    resend_count,
    date_expired,
    date_verified,
    date_updated,
    date_created
  FROM user_verification_code
  WHERE
    action = ?
    AND verification_code = ?
    AND date_verified IS NULL
    AND date_expired > NOW()
  ORDER BY id DESC
  LIMIT 1
  `,

  AddUserVerificationCode: `
  INSERT INTO user_verification_code
    (user_id, action, email, verification_code,
      resend_count, date_expired, date_created)
    VALUES (?, ?, ?, ?, 0, NOW() + INTERVAL ? MINUTE, NOW());
  `,

  UpdateUserVerificationCodeResendCount: `
  UPDATE user_verification_code
  SET resend_count = resend_count + 1,
    date_expired = NOW() + INTERVAL ? MINUTE,
    date_updated = NOW()
  WHERE
    id = ?
  LIMIT 1
  `,

  UpdateUserVerificationCodeVerified: `
  UPDATE user_verification_code
  SET date_verified = NOW(),
    date_updated = NOW()
  WHERE
    id = ?
  LIMIT 1
  `,

};
