const horoscope = require('horoscope');
const https = require('http');
const url = require('url');

function httpGet(horoscopeSign) {
  return new Promise( (resolve, reject) => {

    const options = url.parse('http://horoscope-api.herokuapp.com/horoscope/today/'+horoscopeSign);
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        console.log(returnData);
        resolve(returnData);
      });
    });
    request.end();
  });
}

const handleRequest = {
  async handle() {
    const dateOfBirth = '1994-06-17';

    const splitDate = dateOfBirth.split('-');

    const horoscopeSign = horoscope.getSign({month: parseInt(splitDate[1],10), day: parseInt(splitDate[2],10)});

    const response = await httpGet(horoscopeSign);

    console.log(JSON.parse(response).horoscope);
  }
}

// console.log('outpt');
handleRequest.handle();

// let promise = new Promise(function(resolve, reject) {
//   setTimeout( () => resolve("done!"), 1000);
// });
//
// promise.then(result => console.log(result),
//   error => console.log(error));
