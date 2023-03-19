import {Router as expressRouter} from 'express';

const router = expressRouter();
const ApiController = require('./api.controller');

/**
 * @openapi
 * components:
 *  schemas:
 *    Session:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        user_id:
 *          type: number
 *        user_access_token_id:
 *          type: number | null
 *        session_id:
 *          type: string
 *        date:
 *          type: date
 *        date_updated:
 *          type: date
 *        date_created:
 *          type: date
 *      example:
 *        id: 1
 *        user_id: 1
 *        user_access_token_id: null
 *        session_id: fVJ113Nnw7FgJMk9C6vz3FV...
 *        date: 2023-03-01
 *        date_updated: 2023-03-01 00:01:01
 *        date_created: 2023-03-01 00:00:01
 *    Payload:
 *      type: object
 *      properties:
 *        payload:
 *          type: object
 *          properties:
 *            access_types:
 *              type: array
 *              items:
 *                type: string
 *            full_name:
 *              type: string
 *            display_name:
 *              type: string
 *            email:
 *              type: string
 *            user_id:
 *              type: number
 *            date_verified:
 *              type: date
 *        token:
 *          type: string
 *        session_id:
 *          type: string
 *      example:
 *        payload:
 *          access_types: []
 *          full_name: Aha
 *          display_name: Aha number one
 *          email: number1@aha.io
 *          user_id: 1
 *          date_verified: 2023-03-01 00:00:01
 *        token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9....
 *        session_id: fVJ113Nnw7FgJMk9C6vz3FV...
 *    Success:
 *      type: object
 *      properties:
 *        success:
 *          type: boolean
 *    Error:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *          example:
 *          - There was an error occur
 *          - Email or Password is incorrect
 *          - Verification code is not valid
 *          - ...
 */

/**
 * @openapi
 * /api:
 *  get:
 *    tags:
 *    - Healthcheck
 *    description: Responds if the app is up and running
 *    summary: Responds if the app is up and running
 *    parameters:
 *    - name: auth
 *      in: header
 *      description: an authorization header
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: App is up and running
 *      500:
 *        description: Failed to authenticate user
 */
router.get('/', ApiController.index);

/**
 * @openapi
 * '/api/user/dashboard':
 *  get:
 *    tags:
 *    - Get user dashboard
 *    description: Get simple dashboard data
 *    summary: Get simple dashboard data
 *    parameters:
 *    - name: auth
 *      in: header
 *      description: an authorization header
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                users:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      display_name:
 *                        type: string
 *                      login_count:
 *                        type: interger
 *                      last_session:
 *                        type: date
 *                    example:
 *                      display_name: Aha number one
 *                      login_count: 99
 *                      last_session: 2023-03-01 00:00:01
 *                dashboard:
 *                  type: object
 *                  properties:
 *                    total_user:
 *                      type: integer
 *                    total_user_active_today:
 *                      type: integer
 *                    avg_user_active_7_days:
 *                      type: integer
 *                  example:
 *                    total_user: 1
 *                    total_user_active_today: 1
 *                    avg_user_active_7_days: 1
 *      500:
 *        description: Failed to authenticate user
 */
router.get('/user/dashboard', ApiController.getUserDashboard);

/**
 * @openapi
 * '/api/user/login':
 *  post:
 *    tags:
 *    - Login by email
 *    description: Use email to login
 *    summary: Use email to login
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *            required:
 *            - email
 *            - password
 *            example:
 *              email: number1@aha.io
 *              example: Ahanumber1!
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Payload'
 *                - $ref: '#/components/schemas/Error'
 */
router.post('/user/login', ApiController.login);

/**
 * @openapi
 * '/api/user/sign-up/email':
 *  post:
 *    tags:
 *    - Sign up by email
 *    description: Use email to sign up
 *    summary: Use email to sign up
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              full_name:
 *                type: string
 *              password:
 *                type: string
 *              confirm_password:
 *                type: string
 *            required:
 *            - email
 *            - full_name
 *            - password
 *            - confirm_password
 *            example:
 *              email: number1@aha.io
 *              full_name: Aha
 *              password: Ahanumber1!
 *              confirm_password: Ahanumber1!
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Payload'
 *                - $ref: '#/components/schemas/Error'
 */
router.post('/user/sign-up/email', ApiController.signUpEmail);

/**
 * @openapi
 * '/api/user/sign-up/google':
 *  post:
 *    tags:
 *    - Sign up by google
 *    description: Use google oauth to sign up
 *    summary: Use google oauth to sign up
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              full_name:
 *                type: string
 *              google_id:
 *                type: string
 *            required:
 *            - email
 *            - full_name
 *            - google_id
 *            example:
 *              email: number1@aha.io
 *              full_name: Aha
 *              google_id: 123456789...
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Payload'
 *                - $ref: '#/components/schemas/Error'
 */
router.post('/user/sign-up/google', ApiController.signUpGoogle);

/**
 * @openapi
 * '/api/user/sign-up/facebook':
 *  post:
 *    tags:
 *    - Sign up by facebook
 *    description: Use facebook oauth to sign up
 *    summary: Use facebook oauth to sign up
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              full_name:
 *                type: string
 *              facebook_id:
 *                type: string
 *            required:
 *            - full_name
 *            - facebook_id
 *            example:
 *              full_name: Aha
 *              facebook_id: 123456789...
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Payload'
 *                - $ref: '#/components/schemas/Error'
 */
router.post('/user/sign-up/facebook', ApiController.signUpFacebook);

/**
 * @openapi
 * '/api/user/reset-password':
 *  post:
 *    tags:
 *    - Request a reset password
 *    description: Reset password by email
 *    summary: Reset password by email
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *            required:
 *            - email
 *            example:
 *              email: number1@aha.io
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Success'
 *                - $ref: '#/components/schemas/Error'
 */
router.post('/user/reset-password', ApiController.resetPassword);

/**
 * @openapi
 * '/api/user/new-password':
 *  post:
 *    tags:
 *    - Update new password
 *    description: Verify old password and update new password
 *    summary: Verify old password and update new password
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              verification_code:
 *                type: string
 *              old_password:
 *                type: string
 *              password:
 *                type: string
 *              confirm_password:
 *                type: string
 *            required:
 *            - verification_code
 *            - old_password
 *            - password
 *            - confirm_password
 *            example:
 *              verification_code: 123456
 *              old_password: Ahanumber1!
 *              password: Ahanumber1!
 *              confirm_password: Ahanumber1!
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Payload'
 *                - $ref: '#/components/schemas/Error'
 */
router.post('/user/new-password', ApiController.newPassword);

/**
 * @openapi
 * '/api/user/register-verification':
 *  post:
 *    tags:
 *    - Confirm register verification code
 *    description: Validate code and activate account
 *    summary: Validate code and activate account
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              verification_code:
 *                type: string
 *            required:
 *            - verification_code
 *            example:
 *              verification_code: 123456
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Payload'
 *                - $ref: '#/components/schemas/Error'
 */
router.post('/user/register-verification', ApiController.registerVerification);

/**
 * @openapi
 * '/api/user/register-verification-resend':
 *  post:
 *    tags:
 *    - Request resend verification code
 *    description: Validate email and resend email
 *    summary: Validate email and resend email
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *            required:
 *            - email
 *            example:
 *              email: number1@aha.io
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Success'
 *                - $ref: '#/components/schemas/Error'
 */
router.post(
    '/user/register-verification-resend',
    ApiController.registerVerificationResend,
);

/**
 * @openapi
 * '/api/user/verification/code':
 *  post:
 *    tags:
 *    - Validate verification code
 *    description: Validate code
 *    summary: Validate code
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              verification_code:
 *                type: string
 *            required:
 *            - verification_code
 *            example:
 *              verification_code: 123456
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Success'
 *                - $ref: '#/components/schemas/Error'
 */
router.post('/user/verification/code', ApiController.hasUserVerificationCode);

/**
 * @openapi
 * '/api/user/display-name':
 *  patch:
 *    tags:
 *    - Update user display name
 *    description: Update user display name
 *    summary: Update user display name
 *    parameters:
 *    - name: auth
 *      in: header
 *      description: an authorization header
 *      required: true
 *      type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              display_name:
 *                type: string
 *            required:
 *            - display_name
 *            example:
 *              display_name: 123456
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Payload'
 *                - $ref: '#/components/schemas/Error'
 *      500:
 *        description: Failed to authenticate user
 */
router.patch('/user/display-name', ApiController.updateUserDisplayName);

/**
 * @openapi
 * '/api/user/display-name/reset':
 *  patch:
 *    tags:
 *    - Reset user display name
 *    description: Reset user display name to default
 *    summary: Reset user display name to default
 *    parameters:
 *    - name: auth
 *      in: header
 *      description: an authorization header
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Payload'
 *                - $ref: '#/components/schemas/Error'
 *      500:
 *        description: Failed to authenticate user
 */
router.patch(
    '/user/display-name/reset',
    ApiController.updateUserDisplayNameReset,
);

/**
 * @openapi
 * '/api/user/session':
 *  get:
 *    tags:
 *    - Get user session
 *    description: Get current and previous session
 *    summary: Get current and previous session
 *    parameters:
 *    - name: auth
 *      in: header
 *      description: an authorization header
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - Success:
 *                  type: object
 *                  properties:
 *                    refresh_token:
 *                      type: string
 *                      example: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9....
 *                    current:
 *                      $ref: '#/components/schemas/Session'
 *                    previous:
 *                      nullable: true
 *                      allOf:
 *                        - $ref: '#/components/schemas/Session'
 *                - $ref: '#/components/schemas/Error'
 *      500:
 *        description: Failed to authenticate user
 */
router.post('/user/session', ApiController.getUserSession);

/**
 * @openapi
 * '/api/user/logout':
 *  get:
 *    tags:
 *    - Logout user
 *    description: Logout session
 *    summary: Logout session
 *    parameters:
 *    - name: auth
 *      in: header
 *      description: an authorization header
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/Success'
 *                - $ref: '#/components/schemas/Error'
 *      500:
 *        description: Failed to authenticate user
 */
router.get('/user/logout', ApiController.logout);

module.exports = router;
