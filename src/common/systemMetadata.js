const SystemMetadata = {
  maxAge: '$maxAge',
  maxCount: '$maxCount',
  truncateBefore: '$tb',
  cacheControl: '$cacheControl',
  acl: '$acl',
  aclRead: '$r',
  aclWrite: '$w',
  aclDelete: '$d',
  aclMetaRead: '$mr',
  aclMetaWrite: '$mw',
  userStreamAcl: '$userStreamAcl',
  systemStreamAcl: '$systemStreamAcl'
};
Object.freeze(SystemMetadata);

module.exports = SystemMetadata;