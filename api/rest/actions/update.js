const  { ObjectID } = require('mongodb');

module.exports = function(CollectionName) {
  return async function (ctx) {
    const item = await ctx.db
      .collection(CollectionName)
      .findOneAndUpdate(
        { _id: new ObjectID(ctx.params.id) },
        { $set: ctx.request.body },
        { returnOriginal: false }
      );

    if (item.value === null) {
      ctx.response.status = 404;
    }

    ctx.body = { ...item.value };
  }
};