const sock = require('./index.js');
const { lowdb } = require('vargr-dbai');

describe(`Test API methods`, () => {
    let ws = null;
    let dbi = null;
    let sockRef = null;

    beforeAll(async () => {
        dbi = new lowdb()
        await dbi.init()
        await dbi.createCollection('messages')
        sockRef = sock(dbi);
        sockRef.listen(3000);

        return new Promise((done) => {
            ws = new WebSocket('ws://localhost:3000/messages');
            ws.onopen = () => {
                done();
            };
        });
    });

    it('Can add a document', async () => {
        return new Promise((done) => {
            ws.onmessage = ({ data }) => {
                const msg = JSON.parse(data);
                expect(msg.data.message).toEqual('hello world');
                done();
            };

            ws.send(JSON.stringify({
                action: 'add',
                data: { message: 'hello world' }
            }));
        });
    });

    it('Can update a document', async () => {
        await dbi.create('messages', { data: { id: 3, type: 'A', name: 'poppa doe' } });

        return new Promise((done) => {
            ws.onmessage = ({ data }) => {
                const msg = JSON.parse(data);
                expect(msg.data.message).toEqual('hello world');
                done();
            };

            ws.send(JSON.stringify({
                action: 'update',
                data: { message: 'hello world' },
                where: { id: 3 }
            }));
        });
    });


    it('Can delete a document', async () => {
        await dbi.create('messages', { data: { id: 5, type: 'A', name: 'poppa doe' } });

        return new Promise((done) => {
            ws.onmessage = ({ data }) => {
                const msg = JSON.parse(data);
                expect(msg.data.where.id).toEqual(5);
                done();
            };

            ws.send(JSON.stringify({
                action: 'delete',
                where: { id: 5 }
            }));
        });
    });

    it('Can ping for servertime', async () => {
        const mytime = performance.now();

        return new Promise((done) => {
            ws.onmessage = ({ data }) => {
                const msg = JSON.parse(data);
                expect(msg.data.clienttime).toEqual(mytime);
                expect(msg.data).toHaveProperty('servertime');
                done();
            };

            ws.send(JSON.stringify({
                action: 'ping',
                clienttime: mytime
            }));
        });
    });

});