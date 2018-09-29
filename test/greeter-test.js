/*
Mocha tests for the Alexa skill "Hello World" example (https://github.com/alexa/skill-sample-nodejs-hello-world).
Using the Alexa Skill Test Framework (https://github.com/BrianMacIntosh/alexa-skill-test-framework).
Run with 'mocha examples/skill-sample-nodejs-hello-world/helloworld-tests.js'.
*/

// include the testing framework
const alexaTest = require('alexa-skill-test-framework');
// const alexaTest = require('../../index');

alexaTest.setLocale('en-IN');
// initialize the testing framework
alexaTest.initialize(
	require('../lambda/custom/index.js'),
	"amzn1.ask.skill.00000000-0000-0000-0000-000000000000",
	"amzn1.ask.account.VOID");

describe("Greeter Skill", function () {
	// tests the behavior of the skill's LaunchRequest
	describe("LaunchRequest", function () {
		alexaTest.test([
			{
				request: alexaTest.getLaunchRequest(),
				says: "Welcome to Alexa Greeter Skill. It's a great day you know, and I am glad you came to meet me.", repromptsNothing: true, shouldEndSession: true
			}
		]);
	});

	// tests the behavior of the skill's HelloWorldIntent
	describe("CompletedGreetMyFriendHandler", function () {

		let request = alexaTest.getIntentRequest("CompletedGreetMyFriendHandler", {
			dateOfBirth: '1994-06-17'
		});

		request = alexaTest.addEntityResolutionsToRequest(request, 'dateOfBirth','AMAZON.DATE', '1994-06-17');

		alexaTest.test([
			{
				request: request,
				says: "Hello World!", repromptsNothing: true, shouldEndSession: true,
				// hasAttributes: {
				// 	activity: 'eating'
				// }
			}
		]);
	});
});
