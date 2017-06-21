var mapping = require('../config/mapping');

function getApi(api) {
  return mapping.apiUrl + api + mapping.targetIp
}

module.exports = {
  counselorStep: getApi('/fxweb/cshop.counselorStep/1.0'),
};
