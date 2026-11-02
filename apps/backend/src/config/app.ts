const backDomain = process.env.BACK_APP_URL ?? 'http://localhost'
const frontDomain = process.env.FRONT_APP_URL ?? 'http://localhost'

/**Backend app port */
export const backPort = process.env.BACK_APP_PORT ?? 3000;

/**Backend app complete url (`domain:port`)*/
export const backUrl = `${backDomain}:${backPort}`

/**Frontend app port */
export const frontPort = process.env.FRONT_APP_PORT ?? 5173;

/**Frontend app complete url (`domain:port`)*/
export const frontUrl = `${frontDomain}:${frontPort}`

// Api section ----------------------------

/**JsonWebToken Secret*/
export const jwtSecret = process.env.JWT_SECRET;

/**Access token Time To Live in string format*/
export const accessTTL = '15m';

/**Refresh token (Session) Time To Live in ms*/
export const shortRefreshTTL = 1000 * 60 * 30;

/**Refresh token (Persistent) Time To Live in ms*/
export const longRefreshTTL = 1000 * 60 * 60 * 24 * 7;