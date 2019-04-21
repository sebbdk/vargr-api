module.exports = function(CollectionName) {
  return async function (ctx) {
    const result = await ctx.db
      .collection(CollectionName)
      .insertOne(ctx.request.body);

    const item = await ctx.db
      .collection(CollectionName)
      .findOne({_id: result.insertedId})

    ctx.response.status = 201;
    ctx.body = { ...item };
  }
};