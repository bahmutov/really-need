console.log('loading the second module');

if (module.parent) {
  var parentName = module.parent.filename || module.parent;
  throw new Error('second module should not have a parent, has ' +
    parentName);
}
