const fetch = require('node-fetch');
const { lowdb } = require('vargr-dbai');
const { Dbapi } = require('./index.js');''

describe(`Test API methods`, () => {
    let serverRef;
    let serveCollectionRef;
    let dbi = null;
    beforeAll(async () => {
        dbi = new lowdb()
        await dbi.init()
        await dbi.createCollection('messages')

        await dbi.create('messages', { data: {id: 1, message: 'I like cake', user_id: 1, type: 'A'} });
        await dbi.create('messages', { data: {id: 2, message: 'This is cake', user_id: 1, type: 'A'} });
        await dbi.create('messages', { data: {id: 3, message: 'Hand me the cake', user_id: 2, type: 'B'} });
        await dbi.create('messages', { data: {id: 4, message: 'Cake me now!', user_id: 2, type: 'B'} });

        await dbi.createCollection('users')

        await dbi.create('users', { data: {id: 1, name: 'John doe' } });
        await dbi.create('users', { data: {id: 2, name: 'Jane doe'} });

        const { serveCollection, server } = Dbapi(dbi);
        serverRef = server;

        serveCollection('messages');
        serveCollection('users');

        serveCollectionRef = serveCollection;

        server.listen(4444);
    });

    afterAll(() => {
        serverRef.destroy();
    });

    it('Should be able to get list', async () => {
        const req = await fetch('http://localhost:4444/messages')
        const res = await req.json();

        expect(req.status).toEqual(200);
        expect(Array.isArray(res.result)).toBeTruthy();
        expect(res.result.length).toEqual(4);
    });

    it('Should be able to filter list by field', async () => {
        const req = await fetch('http://localhost:4444/messages?where={"type":"A"}')
        const res = await req.json();

        expect(req.status).toEqual(200);
        expect(Array.isArray(res.result)).toBeTruthy();
        expect(res.result.length).toEqual(2);
    });

    it('Should be able to limit results', async () => {
        const req = await fetch('http://localhost:4444/messages?limit=2')
        const res = await req.json();

        expect(req.status).toEqual(200);
        expect(Array.isArray(res.result)).toBeTruthy();
        expect(res.result.length).toEqual(2);
    });

    it('Should be able to offset results', async () => {
        const req = await fetch('http://localhost:4444/messages?offset=2')
        const res = await req.json();

        expect(req.status).toEqual(200);
        expect(Array.isArray(res.result)).toBeTruthy();
        expect(res.result.length).toEqual(2);
        expect(res.result[0].id).toEqual(3);
    });

    it('Should be able to order results', async () => {
        const req = await fetch('http://localhost:4444/messages?orderby=id&order=desc')
        const res = await req.json();

        expect(req.status).toEqual(200);
        expect(res.result[0].id).toEqual(4);
    });

    it('Should be able to get specific item', async () => {
        const req = await fetch('http://localhost:4444/messages/1')
        const res = await req.json();

        expect(req.status).toEqual(200);
        expect(res.result).toBeTruthy();
        expect(res.result.id).toEqual(1);
    });

    it('Should be able to use configure list to use include', async () => {
        await dbi.createCollection('pancakes')
        await dbi.create('pancakes', { data: {id: 1, message: 'I like cake', pies_id: 1, type: 'A'} });
        await dbi.create('pancakes', { data: {id: 2, message: 'This is cake', pies_id: 1, type: 'A'} });
        await dbi.create('pancakes', { data: {id: 3, message: 'Hand me the cake', pies_id: 2, type: 'B'} });
        await dbi.create('pancakes', { data: {id: 4, message: 'Cake me now!', pies_id: 2, type: 'B'} });

        await dbi.createCollection('pies')
        await dbi.create('pies', { data: {id: 1, name: 'John doe' } });
        await dbi.create('pies', { data: {id: 2, name: 'Jane doe'} });

        serveCollectionRef('pies', { include: { pancakes: {} } });

        const req = await fetch('http://localhost:4444/pies');
        const res = await req.json();

        expect(res.result[0].pancakes.length).toEqual(2);
    });

    it('Should be able to delete and item', async () => {
        const req = await fetch('http://localhost:4444/messages/2', { method: 'DELETE' })

        expect(req.status).toEqual(204);

        const req2 = await fetch('http://localhost:4444/messages')
        const res2 = await req2.json();

        expect(Array.isArray(res2.result)).toBeTruthy();
        expect(res2.result.length).toEqual(3);
    });

    it('Should be able to add and item', async () => {
        const item = { id: 9, message: 'Darth cake' };
        const req = await fetch('http://localhost:4444/messages', {
            method: 'POST',
            body: JSON.stringify(item),
            headers: { 'Content-Type': 'application/json' }
        })
        const res = await req.json();

        expect(req.status).toEqual(201);
        expect(res.result.message).toEqual('Darth cake');
    });

    it('should be able to save multiple', async () => {
        const items = [
            { id: 9, message: 'Darth cake' },
            { id: 10, message: 'Darth marty' }
        ];
        const req = await fetch('http://localhost:4444/messages', {
            method: 'POST',
            body: JSON.stringify(items),
            headers: { 'Content-Type': 'application/json' }
        })
        const res = await req.json();

        expect(req.status).toEqual(201);
        expect(res.result[0].message).toEqual('Darth cake');
        expect(res.result[1].message).toEqual('Darth marty');
    });

    it('should be able to save nested', async () => {
        const items = [
            {
                id: 99,
                name: 'John doe',
                messages: [
                    { message: 'Darth cake' },
                    { message: 'Darth mildew' },
                ]
            }
        ];
        const req = await fetch('http://localhost:4444/users', {
            method: 'POST',
            body: JSON.stringify(items),
            headers: { 'Content-Type': 'application/json' }
        });

        const res = await req.json();

        expect(res.result[0].messages.length).toEqual(2);
        expect(res.result[0].messages[0].users_id).toEqual(99);
        expect(req.status).toEqual(201);

        const req2 = await fetch('http://localhost:4444/messages?where={"users_id":99}');
        const res2 = await req2.json();

        expect(res2.result.length).toEqual(2);
    });
});