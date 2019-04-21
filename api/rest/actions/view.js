const  { ObjectID } = require('mongodb');

module.exports = function(CollectionName) {
  return async function (ctx) {
    const item = await ctx.db
      .collection(CollectionName)
      .findOne({_id: new ObjectID(ctx.params.id)})

    if (item === null) {
      ctx.response.status = 404;
    }
    ctx.body = { ...item };
  }
};