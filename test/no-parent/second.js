console.log('second module');
console.assert(!module.parent,
  'second module should not have a parent!');
