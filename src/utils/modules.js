exports.uncache = function uncache(id) {
  var mod = require.cache[id];
  if (!mod) return;
  delete require.cache[id];
  if (mod.children)
    for(var i = 0; i < mod.children.length; i++)
      uncache(mod.children[i].id);
  return mod;
};

exports.recache = function recache(mod) {
  if (require.cache[mod.id] === mod) return;
  require.cache[mod.id] = mod;
  if (mod.children)
    for(var i = 0; i < mod.children.length; i++)
      recache(mod.children[i]);
};
