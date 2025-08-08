export const BASE_URL = process.env.REACT_APP_BASE_URL || "https://blissful-connection-production.up.railway.app";
export const BASE_WS_URL = (process.env.REACT_APP_WS_URL || BASE_URL).replace(/^http/, 'ws');
