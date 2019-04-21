module.exports = function(CollectionName, config = {}) {
  return async function (ctx) {
    const query = {
      ...ctx.request.query,
      where: (ctx.request.query.where ? JSON.parse(ctx.request.query.where) : {}),
      ...ctx.request.body,
      ...(config.query ? config.query : {})
    };

    let items = await ctx.db
      .collection(CollectionName)
      .find(query.where);

    if(query.order && query.orderBy) {
      items = items.sort({
        [ctx.params.orderBy]: ctx.params.order
      });
    }

    if(query.offset) {
      items = items.skip(parseInt(query.offset, 10) || 0);
    }

    if(query.limit) {
      items = items.limit(parseInt(query.limit, 10) || 20);
    }

    items = await items.toArray();

    ctx.body = { items };
  }
};