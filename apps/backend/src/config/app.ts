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

export const jwtSecret = process.env.JWT_SECRET;