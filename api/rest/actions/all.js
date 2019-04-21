const listAction = require('./list');
const addAction = require('./add');
const viewAction = require('./view');
const updateAction = require('./update');
const deleteAction = require('./delete');

function underScoreName(string) {
  return string
    .replace(/\.?([A-Z]+)/g, (x,y) => ("_" + y.toLowerCase()))
    .replace(/^_/, "");
}

module.exports = function(router, collectionName, options) {
  options = {
    path: '/',
    index: {},
    add: {},
    view: {},
    update: {},
    delete: {},
    ...options
  }
  const lwrCseName = underScoreName(collectionName);

  router.get(`${options.path}${lwrCseName}`, listAction(collectionName, options.index));
  //router.post(`${options.path}${lwrCseName}`, addAction(collectionName, options.add));
  //router.get(`${options.path}${lwrCseName}/:id`, viewAction(collectionName, options.view));
  //router.put(`${options.path}${lwrCseName}/:id`, updateAction(collectionName, options.update));
  //router.delete(`${options.path}${lwrCseName}/:id`, deleteAction(collectionName, options.delete));
}