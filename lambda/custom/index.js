
const Alexa = require('ask-sdk-core')
const horoscope = require('horoscope')
const https = require('http');
const url = require('url');

// Welcome message
const welcomeOutput =  "Welcome to Alexa Greeter Skill. It's a great day you know, and I am glad you came to meet me.";

const greetMessageIntro = [
  'Nice to meet you ',
  'It\'s great to know you '
]
// Launch request handler
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput){
    const responseBuilder = handlerInput.responseBuilder;


    return responseBuilder
      .speak(welcomeOutput)
      .getResponse();
  }
};

// IN progress greet my friend
const InProgressGreetMyFriendHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type == 'IntentRequest' &&
      request.intent.name == 'GreetMyFriend' &&
      request.dialogState != 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;

    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  }
};

// api horoscope call
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
        resolve(JSON.parse(returnData));
      });
    });
    request.end();
  });
}
const CompletedGreetMyFriendHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type == 'IntentRequest'
      && request.intent.name === 'GreetMyFriend';
  },
  async handle(handlerInput) {
    console.log('Greet My Friend - handle');

    const responseBuilder = handlerInput.responseBuilder;

    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
    const slotValues = getSlotValues(filledSlots);
    // const slotValues = JSON.stringify(filledSlots);

    let speechOutput = getRandomPhrase(greetMessageIntro);

    if(slotValues.friendName) {
      speechOutput += slotValues.friendName.synonym;
    }

    if(slotValues.dateOfBirth) {

      const splitDate = slotValues.dateOfBirth.synonym.toString().split('-');

      const horoscopeSign = horoscope.getSign({month: parseInt(splitDate[1],10), day: parseInt(splitDate[2],10)});

      const apiResponse = await httpGet(horoscopeSign);

      console.log(apiResponse.horoscope);

      return responseBuilder
        .speak(speechOutput+ ' I have something to say about your day today. '+apiResponse.horoscope)
        .getResponse();
    } else {
    return responseBuilder
      .speak(speechOutput)
      .getResponse();
    }
  }
};


//
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

// end skill request handler
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};

// end session request handler
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    //any cleanup logic goes here
    console.log(`Session Ended with reason: ${handlerInput.requestEnvelope.request.reason}`)
    return handlerInput.responseBuilder.getResponse();
  }
};

// Error handler
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

function getSlotValues(filledSlots) {
    const slotValues = {};

    console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);

    // filledSlots.map()

    for(let item in filledSlots) {
    // Object.keys(filledSlots).forEach(item) => {
      const name = filledSlots[item].name;

      if(filledSlots[item] &&
        filledSlots[item].resolutions &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
          switch(filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            case 'ER_SUCCESS_MATCH':
              slotValues[name] = {
                synonym: filledSlots[item].value,
                resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                isValidated: true
              };
              break;
            case 'ER_SUCCESS_NO_MATCH':
              slotValues[name] = {
                synonym: filledSlots[item].value,
                resolved: filledSlots[item].value,
                isValidated: false,
              };
              break;
            default:
              break;
          }
        } else  {
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].value,
            isValidated: false,
          };
        }
      }
    // }, this);
    return slotValues;
}

function getRandomPhrase(array) {
  const i = Math.floor(Math.random() * array.length);
  return (array[i]);
}


exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    InProgressGreetMyFriendHandler,
    CompletedGreetMyFriendHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)
  .addErrorHandlers(ErrorHandler)
  .lambda();
