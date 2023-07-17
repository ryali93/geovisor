const ee = require('@google/earthengine');
const privateKey = require('../config/private-key.json');

module.exports = function(app, port) {
    return ee.data.authenticateViaPrivateKey(privateKey, () => {
        ee.initialize(null, null, () => {
          console.log('Earth Engine client library initialized.');
          app.listen(port, () => {
            console.log(`Listening on port ${port}`);
          });
        });
      });
    }