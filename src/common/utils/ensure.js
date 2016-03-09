module.exports.notNullOrEmpty = function(value, name) {
  if (value === null)
    throw new Error(name + " is null.");
  if (value === '')
    throw new Error(name + " is empty.");
};
