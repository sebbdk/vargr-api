const koa = require('koa');
const Router = require('koa-router');
const compress = require('koa-compress');
const MongoMiddlware = require('koa-mongo');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');

const actions = require('./actions');

/**
 * Convenience method to configure the Koa instance
 * and initialize the MongoDB connection
 *
 * @param Object config
 */
module.exports = function init(config) {
    if (!config.server) config.server = new koa();
    if (!config.router) config.router = new Router();

    // Add request handlers
    config.collections && config.collections.forEach((item) => {
        actions.all(config.router, item);
    });

    config.server
        .use(MongoMiddlware(config.dbConfig))
        .use(cors(config.cors))
        .use(compress({
            filter: function (content_type) {
                return /json/i.test(content_type)
            },
            threshold: 2048,
            flush: require('zlib').Z_SYNC_FLUSH
        }))
        .use(bodyParser())
        .use(config.router.routes())
        .use(config.router.allowedMethods());

    return config.server;
}