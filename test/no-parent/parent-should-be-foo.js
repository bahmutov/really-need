console.log('loading module parent should be "foo"');

console.assert(module.parent, 'has parent');
if (module.parent.filename !== 'foo') {
  throw new Error('parent should be string "foo", has ' + module.parent);
}
