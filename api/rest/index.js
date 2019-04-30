const koa = require('koa');
const Router = require('koa-router');
const compress = require('koa-compress');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');


const { indexAction, viewAction, addAction, updateAction, deleteAction} = require('./actions.js')

/**
 * Convenience method to configure the Koa instance
 * and initialize the MongoDB connection
 *
 * @param Object config
 */
function Dbapi(dbi, config = {}) {
    if (!config.server) config.server = new koa();
    if (!config.router) config.router = new Router();

    const collections = [];
    const collectionConfigs = {};

    config.router.get(`/:collectionName`, ctx => indexAction(ctx, dbi, collections, collectionConfigs));
    config.router.post(`/:collectionName`, ctx => addAction(ctx, dbi, collections, collectionConfigs));
    config.router.get(`/:collectionName/:id`, ctx => viewAction(ctx, dbi, collections, collectionConfigs));
    config.router.delete(`/:collectionName/:id`, ctx => deleteAction(ctx, dbi, collections, collectionConfigs));
    config.router.put(`/:collectionName/:id`, ctx => updateAction(ctx, dbi, collections, collectionConfigs));

    config.server
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

    return {
        server: config.server,
        serveCollection: (collectionName, config = {}) => {
            collections.push(collectionName);
            collectionConfigs[collectionName] = config;
        }
    };
}

module.exports = { Dbapi }