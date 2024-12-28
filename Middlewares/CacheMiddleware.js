const cache = require('memory-cache');

// Cache middleware
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url;
        let cachedBody = cache.get(key);
        
        if (cachedBody) {
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                cache.put(key, body, duration * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
}

module.exports = cacheMiddleware;