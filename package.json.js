const basePackageJson = require('../package.json');


const keys = [
  'name',
  'version',
  'productName',
  'description',
  'homepage',
  'repository',
  'bugs',
  'license',
  'author',
];

const newPackageJson = {};
for (const key of keys) {
  newPackageJson[key] = basePackageJson[key];
}


module.exports = newPackageJson;
