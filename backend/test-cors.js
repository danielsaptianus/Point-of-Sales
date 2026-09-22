const https = require('https');

const options = {
  hostname: 'arto.kulidigital.cloud',
  port: 443,
  path: '/api/v1/health',
  method: 'GET',
  headers: {
    'Origin': 'https://pos.danielsaptianus.my.id'
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
