/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var ConversationV1 = require('watson-developer-cloud/conversation/v1');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


var contexts = [];

app.get('/smssent',function(req,res){
	//var message = req.query.Body;
	//var number = req.query.From;
	//var twilionumber = req.query.To;
	
	//var message = 'make appoinment';
	//var number = '+94776186353';
	//var twilionumber = '+1 512-865-4719';
	
	var context = null;
	var index = 0;
	var contextIndex = 0;
	contexts.forEach(function(value){
		console.log(value.from);
		if (value.from === number){
			context = value.context;
			contextIndex = index;
		}
		index = index + 1;
	});
	
	console.log('Received message from '+ number + 'saying\''+ message +'\'');
	
	var conversation = new ConversationV1({
		username:'130414c3-fb08-4178-a3c3-9cf787b088c8',
		password:'NtQwAVkKZJ6M',
		version_date:'2016-10-21'
	});
	console.log(JSON.stringify(context));
	//console.log(context.length);
	
	conversation.message({
		input:{text:message},
		workspace_id:'0c351ca9-1092-4078-823f-69726c911589',
		context:context
	},function(err,response){
		if(err){
			console.error(err);
		} else {
			console.log(response.output.text[0]);
			if(context===null){
				contexts.push({'from':number,'context':response.context});
			} else {
				contexts[contextIndex].context=response.context;
			}
			
			var intents=response.intents[0];
			
			if (intents!=undefined){
			var intent = response.intents[0].intent;
			console.log(intent);
			if(intent==="done"){
				contexts.splice(contextIndex,1);
			}
		}

			var client = require('twilio')(
			'ACcb05d8968a6f4d6a3bfd56811d696c19',
			'6af780368fe871e2dab4955571a5256b'
			);
			
			client.messages.create({
				from:twilionumber,
				to:number,
				body:response.output.text[0]
			},function(err,message){
				if(err){
				console.error(err.message);
			}

			});
		}
	});
	res.send('');
});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
