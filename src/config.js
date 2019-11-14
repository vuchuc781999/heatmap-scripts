
export const rootUrl = 'http://localhost:5000';
export const fixedEncodeURIComponent = (str) => encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
