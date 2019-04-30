const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');
const { lowdb } = require('vargr-dbai');

const router = new Router();
const app = websockify(new Koa());

function addSubscriptions(sock, collectionName, subscriptions) {
    if (!subscriptions[collectionName]) {
        subscriptions[collectionName] = [];
    }

    subscriptions[collectionName].push(sock);
}

function removeSubscriptions(sock, collectionName, subscriptions) {
    if (!subscriptions[collectionName]) {
        subscriptions[collectionName] = [];
    }

    subscriptions[collectionName] = subscriptions[collectionName].filter((s) => s != sock);
}

function dispatchMessage(msg, collectionName, subscriptions, ignore = []) {
    if (subscriptions[collectionName]) {
        subscriptions[collectionName].forEach((sock) => {
            if (ignore && ignore.indexOf(sock) === -1) {
                sock.send(msg);
            }
        });
    }
}

// CRUD
function listAction(collectionName, sock, message) {}
function viewAction(collectionName, sock, message) {}
function addAction(collectionName, sock, message) {}
function updateAction(collectionName, sock, message) {}
function deleteAction(collectionName, sock, message) {}
function pingAction(collectionName, sock, message) {}

// Subscribtions
function subViewAction(collectionName, sock, message) {}
function unSubViewAction(collectionName, sock, message) {}

function subListAction(collectionName, sock, message) {}
function unSubListAction(collectionName, sock, message) {}

function handleDisconnect(collectionName, sock, message) {}

const subscriptions = {};
router.get(`/:collectionName`, ctx => {
    const collectionName = ctx.params.collectionName;

    ctx.websocket.on('message', (message) => {
        message.
        dispatchMessage(message, collectionName, subscriptions)
    });

    addSubscriptions(ctx.websocket, collectionName, subscriptions)

    ctx.websocket.on('close', () => {
        removeSubscriptions(ctx.websocket, collectionName, subscriptions);
    });
});

app.ws.use(router.routes())


app.listen(3000);