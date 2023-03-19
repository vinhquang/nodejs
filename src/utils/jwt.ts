import {
  sign,
  SignOptions,
  verify,
  VerifyOptions,
} from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

export interface TokenPayload {
  exp: number;
  access_types: string[];
  full_name: string;
  email: number;
  user_id: number;
  date_verified: string;
}

/**
 * generates JWT used for local testing
 * @param {TokenPayload} payload
 * @return {string} token
 */
export function generateToken(payload: any) {
  // read private key value
  const privateKey = fs.readFileSync(path.join(__dirname, '../private.key'));

  const signInOptions: SignOptions = {
    // RS256 uses a public/private key pair. The API provides the private key
    // to generate the JWT. The client gets a public key to validate the
    // signature
    algorithm: 'RS256',
    expiresIn: '30 days',
  };

  // generate JWT
  return sign(payload, privateKey, signInOptions);
}

/**
 * checks if JWT token is valid
 * @param {string} token the expected token payload
 * @return {Promise<TokenPayload>}
 */
export function validateToken(token: string): Promise<TokenPayload> | string {
  const publicKey = fs.readFileSync(path.join(__dirname, '../public.key'));

  const verifyOptions: VerifyOptions = {
    algorithms: ['RS256'],
  };

  return new Promise((resolve, reject) => {
    verify(
        token,
        publicKey,
        verifyOptions,
        (error, decoded) => {
          if (error) return reject(error);

          resolve(decoded as TokenPayload);
        },
    );
  });
}
