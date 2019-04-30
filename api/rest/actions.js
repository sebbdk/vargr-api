function camelize(text) {
    return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
}

async function indexAction(ctx, dbi, collections, collectionConfigs) {
    const collectionName = camelize(ctx.params.collectionName);
    const include = collectionConfigs[ctx.params.collectionName].include;

    if(collections.indexOf(collectionName) > -1) {
        let where = ctx.query.where ? JSON.parse(ctx.query.where) : {};
        let limit = ctx.query.limit ? ctx.query.limit : undefined;
        let offset = ctx.query.offset ? ctx.query.offset : undefined;
        let orderby = ctx.query.orderby ? ctx.query.orderby : undefined;
        let order = ctx.query.order ? ctx.query.order : undefined;
        let orderArr = orderby ? [orderby, order] : undefined;

        const result = await dbi.find(collectionName, { where, offset, limit, orderBy: orderArr, include });
        ctx.body = { result };
    } else {
        ctx.response.status = 404;
    }
}

async function viewAction(ctx, dbi, collections) {
    const collectionName = camelize(ctx.params.collectionName);

    if(collections.indexOf(collectionName) > -1) {
        const result = await dbi.findOne('messages', { where: { id: ctx.params.id }});

        if (!result) {
            ctx.response.status = 404;
            return;
        }

        ctx.body = { result };
    }
}

async function addAction(ctx, dbi, collections) {
    const collectionName = camelize(ctx.params.collectionName);

    if(collections.indexOf(collectionName) > -1) {
        const result = await dbi.create(collectionName, { data: ctx.request.body });
        ctx.response.status = 201;
        ctx.body = { result };
    }
}

async function updateAction(ctx, dbi, collections) {
    const collectionName = camelize(ctx.params.collectionName);

    if(collections.indexOf(collectionName) > -1) {
        const result = await dbi.update(collectionName, { where: {id: ctx.params.id}, data: ctx.request.body });

        if (!result) {
            ctx.response.status = 404;
            return;
        }

        ctx.body = { result };
    }
}

async function deleteAction(ctx, dbi, collections) {
    const collectionName = camelize(ctx.params.collectionName);

    if(collections.indexOf(collectionName) > -1) {
        const result = await dbi.delete(collectionName, { where: { id: ctx.params.id } });
        ctx.response.status = 204;
        ctx.body = { result };
    }
}

module.exports = {
    indexAction,
    viewAction,
    addAction,
    deleteAction
}