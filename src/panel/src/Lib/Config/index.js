const env = process.env.NODE_COMMAND || 'build';

export const api = env == "build" ? "/api/" : "http://localhost/api/";
export const base = "/";
