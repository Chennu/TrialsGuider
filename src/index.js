/**
 *  Copyright 2009-2016 Chennu.com, TrialsGuider.com and Amazon.com, Inc, or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0/
 *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


 /**
 * TrialsGuider is a child of AlexaSkill, see link below for more information
 * 
 * https://developer.amazon.com/alexa-skills-kit
 * 
 * See the below Alexa Skills Kit reference URLs, which were used extensively to build this tool
 * 
 * Requirements to build a service : https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/requirements-to-build-a-skill
 * Voice Design HandBook :https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-voice-design-handbook
 * SSML (Speech Synthesis Markup Language) : https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference
 * Built-in Library : https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/built-in-intent-library
 * Standard Intents: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/standard-intents
 * Slot Type : https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/slot-type-reference
 * Certification Requirements: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-submission-checklist
 *
 * 
 * This tool helps to find Cancer Clinical Trials in the requested area by calling NCI Clinical Trials API. To read more about the API, see the link below for more information
 * 
 * https://clinicaltrialsapi.cancer.gov/v1/
 * https://www.cancer.gov/syndication/api
 * 
 * NCI Clinical Trials API needs Latitude and Longitude to get Clinical Trials for the near by location. 
 * Used google maps API to get latitude and longitude for the given address location, see the link below for more information 
 * 
 * https://developers.google.com/maps/documentation/geocoding
 * 
 * 
 * Used DeaSync module to turns async function into sync via JavaScript wrapper of Node event loop, see the link below for more information
 * 
 * https://www.npmjs.com/package/deasync
 * https://github.com/abbr/deasync
 * 
 * Used Request moduel to handle HTTP/HTTPS calls in a better way, see the link below for more information
 * 
 * https://www.npmjs.com/package/request
 * https://github.com/request/request
 * 
 * NCI Clinical API needs state 2 letter abbreviation instead of full name. Used existing json object from github, see the link below for more information
 *
 * https://gist.github.com/mshafrir/2646763
 * 
 * 
 * THIS TOOL DOES NOT PROVIDE MEDICAL ADVICE, AND IS FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY, AND IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, TREATMENT OR DIAGNOSIS. 
 * CALL YOUR DOCTOR TO RECEIVE MEDICAL ADVICE. IF YOU THINK YOU MAY HAVE A MEDICAL EMERGENCY, PLEASE DIAL 911.
 * 
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
 
/**
 * Initializing App ID and other variables for the skill
 */
var APP_ID = ''; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]',
CARD_TITLE = "Trials Guider",
request = require('request'),
usaStates = require('./usaStates'),
anounceDiseasesCount = 10,
anounceSitesCount = 5;


exports.handler = function (event, context) {
	try {
		console.log("event.session.application.applicationId=" + event.session.application.applicationId);

		/**
		 * Uncomment this if statement and populate with your skill's application ID to
		 * prevent someone else from configuring a skill that sends requests to this function.
		 */

		if (event.session.application.applicationId !== APP_ID) {
			context.fail("Invalid Application ID");
		}

		if (event.session.new) {
			onSessionStarted({
				requestId: event.request.requestId
			}, event.session);
		}

		if (event.request.type === "LaunchRequest") {
			onLaunch(event.request,
				event.session,
				function callback(sessionAttributes, speechletResponse) {
				context.succeed(buildResponse(sessionAttributes, speechletResponse));
			});
		} else if (event.request.type === "IntentRequest") {
			onIntent(event.request,
				event.session,
				function callback(sessionAttributes, speechletResponse) {
				context.succeed(buildResponse(sessionAttributes, speechletResponse));
			});
		} else if (event.request.type === "SessionEndedRequest") {
			onSessionEnded(event.request, event.session);
			context.succeed();
		}
	} catch (ex) {
		console.log("Unexpected exception " + ex);
		context.fail(ex);
	}
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
	console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
		 + ", sessionId=" + session.sessionId);
	// add any session init logic here
}

/**
 * Called when the user specifies an intent for this skill.
 * Master piese which redirecting to the corresponding business functionality.
 * Check Sample Utterences for more information.
 */
function onIntent(intentRequest, session, callback) {
	console.log("onIntent requestId=" + intentRequest.requestId
		 + ", sessionId=" + session.sessionId);

	var intent = intentRequest.intent,
	intentName = intentRequest.intent.name;

	// dispatch custom intents to handlers here
	if ("TrialsGuiderSearchIntent" === intentName) {
		handleTrialsRequest(intent, session, callback);
	} else if ("TrialDiseaseIntent" === intentName) {
		handleDiseasesRequest(intent, session, callback);
	} else if ("TrialSitesIntent" === intentName) {
		handleSitesRequest(intent, session, callback);
	} else if ("NextTrialIntent" === intentName) {
		handleNextTrialRequest(intent, session, callback);
	} else if ("AMAZON.StartOverIntent" === intentName) {
		getWelcomeResponse(callback);
	} else if ("AMAZON.RepeatIntent" === intentName) {
		handleRepeatRequest(intent, session, callback);
	} else if ("AMAZON.HelpIntent" === intentName) {
		handleGetHelpRequest(intent, session, callback);
	} else if ("AMAZON.StopIntent" === intentName) {
		handleFinishSessionRequest(intent, session, callback);
	} else if ("AMAZON.CancelIntent" === intentName) {
		handleNextTrialRequest(intent, session, callback);
	} else {
		throw "Invalid intent";
	}
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
	console.log("onLaunch requestId=" + launchRequest.requestId
		 + ", sessionId=" + session.sessionId);
	getWelcomeResponse(callback);
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
	console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
		 + ", sessionId=" + session.sessionId);
	// Add any cleanup logic here
}

// ------- Skill specific business logic -------
/**
 * Called when the user says Diseases or Next Disease or More Diseases
 * Please check Sample Utterences for more information.
 */
function handleDiseasesRequest(intent, session, callback) {
    var speechOutput = "",
	   repromptText = "",
	   cardText = "",
	   noOfDiseases = 0,
	   shouldEndSession = false,
	   anouncedAllDesease = false,
	   trialName = "",
	   primaryPurpose = "",
	   phase = "";
	//console.log(session.attributes.userPromptedToContinue);
	if(session.attributes.userPromptedToContinue){
	    if(session.attributes.trialsSearchResult){
	        
	       var diseases =  session.attributes.trialsSearchResult[session.attributes.currentTrialIndex+1].diseases,
	       tmpMaxAnounceCount = 0,
	       tmpDeseaseIndex = 0;
	       trialName = session.attributes.trialsSearchResult[session.attributes.currentTrialIndex+1].trialName;
	       primaryPurpose = session.attributes.trialsSearchResult[session.attributes.currentTrialIndex+1].primaryPurpose;
	       phase = session.attributes.trialsSearchResult[session.attributes.currentTrialIndex+1].phase;
	       noOfDiseases = Object.keys(diseases).length;
	       tmpMaxAnounceCount = noOfDiseases;
	       
	       //console.log(" currentDiseaseIndex : "+session.attributes.currentDiseaseIndex);
	       //console.log("noOfDiseases : "+noOfDiseases);
	       if(session.attributes.currentDiseaseIndex){
	           tmpDeseaseIndex = session.attributes.currentDiseaseIndex+1;
	           if(tmpDeseaseIndex===noOfDiseases){
	               anouncedAllDesease = true;
	           }else{
	              if((tmpDeseaseIndex+anounceDiseasesCount)<noOfDiseases){
	                tmpMaxAnounceCount = tmpDeseaseIndex+anounceDiseasesCount;
	              } 
	           }
	       }
	       //console.log("TmpDeseaseIndex : "+tmpDeseaseIndex);
	       //console.log("TmpMaxAnounceCount : "+tmpMaxAnounceCount);
	       //console.log("anouncedAllDesease : "+anouncedAllDesease);
	       if(anouncedAllDesease){
	           
	           if(noOfDiseases == 0){
	                speechOutput = " <s>no active deseases were found.</s> <s>say, locations</s> or <s>say, next trial</s> ";
	                cardText = "no active deseases were found.\n say, locations or \n say, next trial";
	           }else{
	                speechOutput = " <s>all the <say-as interpret-as=\"number\">"+noOfDiseases+"</say-as> deseases were anounced.</s> <s>say, deseases to anounce again</s> or <s>say, locations</s> or <s>say, next trial</s> ";  
	                cardText = "all the "+noOfDiseases+" deseases were anounced. \n say, deseases to anounce again or \n say, locations or \n say, next trial \n";   
	           }
	           session.attributes.currentDiseaseIndex = -1;
	       }else{
	           speechOutput +=" <s>Diseases are</s>";
	           cardText += " Diseases are : \n";
	           for(var diseasesIndex = tmpDeseaseIndex;diseasesIndex<tmpMaxAnounceCount;diseasesIndex++){
	                speechOutput += "<s> <say-as interpret-as=\"number\">"+(diseasesIndex+1)+" </say-as>  "+ diseases[diseasesIndex]+".</s> ";
	                cardText += (diseasesIndex+1)+" : "+ diseases[diseasesIndex]+"\n ";
	                session.attributes.currentDiseaseIndex = diseasesIndex;
	           }
	       }
	    }else{
	        //console.log("Trials search result not found.");
	        speechOutput = " <s>No  trials  were found.</s> <s>Please say,  something like,</s> <s>Get  trials  in  Stillwater</s> ";
	        cardText = " <s>No  trials  were found.</s> <s>Please say,  something like,</s> <s>Get  trials  in  Stillwater</s> ";
	    }
	}else{
	    //console.log("currentDiseaseIndex not found.");
	    speechOutput = " <s>No  trials  were found.</s> <s>Please say,  something like,</s> <s>Get  trials  in  Stillwater</s> ";
	    cardText = " No  trials  were found. Please say,  something like, \n Get  trials  in  Stillwater\n";
	    
	}
	if((session.attributes.currentDiseaseIndex !== -1) && ((session.attributes.currentDiseaseIndex+1)<noOfDiseases)){
	    speechOutput += " <s>you  are  listening  diseases  for  the  trial,</s>   <p>"+trialName+" .</p>  <s>primary  purpose  is  "+primaryPurpose+ "  for  phase "+phase+" .</s> ";
	    speechOutput += " <s>there  are  <say-as interpret-as=\"number\">"+(noOfDiseases-(session.attributes.currentDiseaseIndex+1) )+"</say-as>  more   diseases  exist.</s>  <s>say,  next  disease.</s>  or   <s>more  diseases. </s>";
	    cardText += " \n you  are  listening  diseases  for  the  trial, \n "+trialName+" \n primary  purpose  is  "+primaryPurpose+ "  for  phase "+phase+" \n ";
	    cardText += " there  are  "+(noOfDiseases-(session.attributes.currentDiseaseIndex+1) )+"  more   diseases  exist. \n say,  next  disease.  or   \n more  diseases. or \n say, next trail.";
	}
	
	if((session.attributes.currentDiseaseIndex+1)===noOfDiseases){
		session.attributes.currentDiseaseIndex = -1;
	    speechOutput += " <s>all the <say-as interpret-as=\"number\">"+noOfDiseases+"</say-as> deseases were anounced.</s> <s>say, deseases to anounce again</s> or <s>say, locations</s> or <s>say, next trial</s> ";  
	    cardText += "all the "+noOfDiseases+" deseases were anounced. \n say, deseases to anounce again or \n say, locations or \n say, next trial \n";   
	}
	
	repromptText = speechOutput;
	session.attributes.speechOutput = speechOutput;
	session.attributes.repromptText = repromptText;
	session.attributes.cardText = cardText;
	callback(session.attributes,
		buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, cardText, shouldEndSession));
}

/**
 * Called when the user says Diseases or Next Disease or More Diseases or Next Disease Please
 * Please check Sample Utterences for more information.
 */
function handleSitesRequest(intent, session, callback) {
	var speechOutput = "",
	   repromptText = "",
	   cardText = "",
	   noOfSites = 0,
	   shouldEndSession = false,
	   anouncedAllSites = false,
	   trialName = "",
	   primaryPurpose = "",
	   phase = "";
	//console.log(session.attributes.userPromptedToContinue);
	if(session.attributes.userPromptedToContinue){
	    if(session.attributes.trialsSearchResult){
	       var sites =  session.attributes.trialsSearchResult[session.attributes.currentTrialIndex+1].sites,
	       tmpMaxAnounceCount = 0,
	       tmpSiteIndex = 0;
	       trialName = session.attributes.trialsSearchResult[session.attributes.currentTrialIndex+1].trialName;
	       primaryPurpose = session.attributes.trialsSearchResult[session.attributes.currentTrialIndex+1].primaryPurpose;
	       phase = session.attributes.trialsSearchResult[session.attributes.currentTrialIndex+1].phase;
	       noOfSites = Object.keys(sites).length;
	       tmpMaxAnounceCount = noOfSites;
	       
	       //console.log(" currentSitesIndex : "+session.attributes.currentSitesIndex);
	       //console.log("noOfSites : "+noOfSites);
	       if(session.attributes.currentSitesIndex){
	           tmpSiteIndex = session.attributes.currentSitesIndex+1;
	           if(tmpSiteIndex===noOfSites){
	               anouncedAllSites = true;
	           }else{
	              if((tmpSiteIndex+anounceSitesCount)<noOfSites){
	                tmpMaxAnounceCount = tmpSiteIndex+anounceSitesCount;
	              } 
	           }
	       }
	       //console.log("TmpDeseaseIndex : "+tmpSiteIndex);
	       //console.log("TmpMaxAnounceCount : "+tmpMaxAnounceCount);
	       //console.log("anouncedAllSites : "+anouncedAllSites);
	       if(anouncedAllSites){
	           if(noOfSites === 0){
	              speechOutput = " <s>no active locations found were found.</s> <s>say, diseases</s>  or  <s>say,  next  trial</s> "; 
	              cardText = " no active locations found were found.\n say, diseases or  \n say,  next  trial"; 
	           }else{
	              speechOutput = " <s>all  the <say-as interpret-as=\"number\">"+noOfSites+"</say-as> locations  were  anounced.</s> <s>say, locations  to  anounce  again</s>  or  <s>say, diseases</s>  or  <s>say,  next  trial</s> ";  
	              cardText = " all  the "+noOfSites+" locations  were  announced.\n say, locations  to announce again  or  \n say, diseases  or  \n say,  next  trial \n ";   
	           }
	           
	           session.attributes.currentSitesIndex = -1;
	       }else{
	           speechOutput += "<s>Total active locations are <say-as interpret-as=\"number\">"+noOfSites+ "</say-as></s>";
	           cardText += "Total active locations are "+noOfSites+ "\n";
	           for(var sitesIndex = tmpSiteIndex;sitesIndex<tmpMaxAnounceCount;sitesIndex++){
	                var siteObj = sites[sitesIndex];
	                speechOutput += "<s>location <say-as interpret-as=\"number\">"+(sitesIndex+1)+ "</say-as> is</s>  <s>"+ siteObj.orgName+" .</s> ";
	                speechOutput += " located  at <say-as interpret-as=\"address\"> "+ siteObj.orgAddress+"</say-as>";
	                speechOutput += " <s>you  can  reach  at  </s><s>  "+ siteObj.orgPhone+" . </s>";
	                speechOutput += " <s>contact name is </s><s>  "+ siteObj.contactName+" . </s>";
	                speechOutput += " <s>you  can  reach contact person at  </s><s>  "+ siteObj.contactPhone+" . </s>";
	                speechOutput += " <s>you  can  email to </s><p>  "+ siteObj.contactEmail+" . </p>";
	                cardText += "location "+(sitesIndex+1)+ " is  "+ siteObj.orgName+":\n ";
	                cardText += siteObj.orgAddressCard+", \n";
	                cardText += "Phone Number : "+ siteObj.orgPhone+"\n";
	                cardText += "Contact Name: "+ siteObj.contactName+"\n";
	                cardText += "Contact Phone Number: "+ siteObj.contactPhone+"\n";
	                cardText += "Contact Email :   "+ siteObj.contactEmail+"\n";
	                session.attributes.currentSitesIndex = sitesIndex;
	           }
	       }
	    }else{
	        //console.log("Trials search result not found.");
	        speechOutput = "<s> No  trials were found.</s> <s>Please say,  something like,</s><s> Get  trials  in  Stillwater </s>";
	    	cardText = " No active trials  were found. Please say,  something like, Get trials in Stillwater";
	    }
	}else{
	    //console.log("currentSitesIndex not found.");
	    speechOutput = "<s> No  trials were found.</s> <s>Please say,  something like,</s><s> Get  trials  in  Stillwater </s>";
	    cardText = " No active trials  were found. Please say,  something like, Get trials in Stillwater";
	}
	if((session.attributes.currentSitesIndex !== -1) && ((session.attributes.currentSitesIndex+1)<noOfSites)){
	    speechOutput += " <s>you  are  listening  locations  for  the  trial,</s> <p>  "+trialName+" .</p> <s> primary  purpose  is  "+primaryPurpose+ "  for  phase "+phase+" . </s>";
	    speechOutput += " <s>there  are <say-as interpret-as=\"number\"> "+(noOfSites-(session.attributes.currentSitesIndex+1) )+"</say-as>  more   locations  exist.</s>  <s>say,  next  location</s>  or   <s>more  locations</s> ";
	    cardText += " \n you  are  listening  locations  for  the  trial,  \n"+trialName+" \n primary  purpose  is  "+primaryPurpose+ "  for  phase "+phase+" \n";
	    cardText += " there  are "+(noOfSites-(session.attributes.currentSitesIndex+1) )+"  more   locations  exist. \n say,  next  location  or \n more  locations or \n say, next trial.";
	}
	
	if((session.attributes.currentSitesIndex+1)===noOfSites)){
		session.attributes.currentSitesIndex = -1;
	    speechOutput += " <s>all  the <say-as interpret-as=\"number\">"+noOfSites+"</say-as> locations  were  anounced.</s> <s>say, locations  to  anounce  again</s>  or  <s>say, diseases</s>  or  <s>say,  next  trial</s> ";  
	    cardText += " all  the "+noOfSites+" locations  were  announced.\n say, locations  to announce again  or  \n say, diseases  or  \n say,  next  trial \n ";   
	}
	
	repromptText = speechOutput;
	session.attributes.speechOutput = speechOutput;
	session.attributes.repromptText = repromptText;
	session.attributes.cardText = cardText;
	callback(session.attributes,
		buildSpeechletResponse(CARD_TITLE,speechOutput, repromptText,cardText, shouldEndSession));
}

/**
 * Called when the user says Sites or Locations or Hospital or Organization (next/more)
 * Please check Sample Utterences for more information.
 */
function handleNextTrialRequest(intent, session, callback) {
	var speechOutput = "",
	   repromptText = "",
	   cardText = "",
	   noOfTrials = 0,
	   noOfSites = 0,
	   noOfDiseases = 0,
	   tmpTrialIndex  = 0,
	   shouldEndSession = false,
	   anouncedAllTrials = false,
	   trialName = "",
	   primaryPurpose = "",
	   phase = "";
	//console.log(session.attributes.userPromptedToContinue);
	if(session.attributes.userPromptedToContinue){
	    if(session.attributes.trialsSearchResult){
	        noOfTrials = Object.keys(session.attributes.trialsSearchResult).length;
	        
	       if(session.attributes.currentTrialIndex){
	           tmpTrialIndex = session.attributes.currentTrialIndex;
	       }
	       
	       if(tmpTrialIndex===noOfTrials){
	           anouncedAllTrials = true;
	       }
	       
	       if(anouncedAllTrials){
	           speechOutput = "<s> all  the <say-as interpret-as=\"number\">"+noOfTrials+"</say-as> trials  were  anounced.</s> <s>say, trials  to  anounce  again</s>  or  <s>say,  diseases</s>  or  <s>say,  locations</s> ";
	           cardText = "all the "+noOfTrials+"trials  were  anounced. \n say, trials  to  anounce  again  or  \n say,  diseases  or  \n say,  locations ";
	           
	           session.attributes.currentTrialIndex = 0;
	           session.attributes.currentSitesIndex = -1;
	           session.attributes.currentDiseaseIndex = -1;
	       }else{
	            trialName = session.attributes.trialsSearchResult[tmpTrialIndex].trialName;
	            primaryPurpose = session.attributes.trialsSearchResult[tmpTrialIndex].primaryPurpose;
	            phase = session.attributes.trialsSearchResult[tmpTrialIndex].phase; 
	            noOfSites = Object.keys(session.attributes.trialsSearchResult[tmpTrialIndex].sites).length;
	            noOfDiseases = Object.keys(session.attributes.trialsSearchResult[tmpTrialIndex].diseases).length;
	            speechOutput += " <s>total active trials are <say-as interpret-as=\"number\">"+noOfTrials+"</say-as> </s>";
	            speechOutput += " <s>trial <say-as interpret-as=\"number\">"+(tmpTrialIndex+1)+"</say-as> </s>is  <p>"+trialName+".</p>  <s>primary  purpose   is "+primaryPurpose+" for phase "+phase+" .</s> ";
	            speechOutput += " <s>there  are  <say-as interpret-as=\"number\">"+noOfSites+"</say-as>  locations</s>  and  <s><say-as interpret-as=\"number\">"+noOfDiseases+"</say-as> diseases are exist for this trial.</s>";
	            speechOutput += " <s>say,  next  trial</s>,  or  <s>say,  diseases to  know  what  diseases  are  treating</s> ,  or  <s>say,  locations to  know  hospital locations</s>";
	            cardText += " total active trials are "+noOfTrials+"\n";
	            cardText += " trial "+(tmpTrialIndex+1)+" : \n"+trialName+". \n primary  purpose   is "+primaryPurpose+" for phase "+phase+". ";
	            cardText += " there  are  "+noOfSites+" locations  and  "+noOfDiseases+" diseases are exist for this trial.\n";
	            cardText += " say,  next  trial,  or  \n say,  diseases to  know  what  diseases  are  treating ,  or  \n say,  locations to  know  hospital locations\n";
	            
	            session.attributes.currentTrialIndex = tmpTrialIndex+1;
	            session.attributes.currentSitesIndex = -1;
	           session.attributes.currentDiseaseIndex = -1;
	       }
	    }else{
	        //console.log("Trials search result not found.");
	        speechOutput = " <s>No  trials  were found.</s> <s>Please say,  something like,</s> <s>Get  trials  in  Stillwater</s> ";
	        cardText = " No active trials were found. Please say, something like, Get trials in Stillwater";
	        session.attributes.currentTrialIndex = 0;
	        session.attributes.currentSitesIndex = -1;
	        session.attributes.currentDiseaseIndex = -1;
	    }
	}else{
	    //console.log("currentSitesIndex not found.");
	    speechOutput = " <s>No  trials  were found.</s> <s>Please say,  something like,</s> <s>Get  trials  in  Stillwater</s> ";
	    cardText = " No active trials  were found. Please say,  something like, Get trials in Stillwater";
	    session.attributes.currentTrialIndex = 0;
	    session.attributes.currentSitesIndex = -1;
	    session.attributes.currentDiseaseIndex = -1;
	}
	
	repromptText = speechOutput;
	session.attributes.speechOutput = speechOutput;
	session.attributes.repromptText = repromptText;
	session.attributes.cardText = cardText;
	callback(session.attributes,
		buildSpeechletResponse(CARD_TITLE,speechOutput, repromptText,cardText, shouldEndSession));
}

/**
 * Called when the application started or restarted search
 * Please check Sample Utterences for more information.
 */

function getWelcomeResponse(callback) {
	var sessionAttributes = {},
	speechOutput = "<s>Welcome to Trials Guider.</s>",
	shouldEndSession = false,
	repromptText = " <s>Please  say,  something like,</s> <p>search  trials  in  Stillwater. </p>",
	cardText = "Welcome to Trials Guider. \nPlease  say,  something like, search  trials  in  Stillwater.\n or say, Help.";
	repromptText += " <s> or say,  Help</s>";
	speechOutput += repromptText;

	sessionAttributes = {
		"speechOutput": speechOutput,
		"repromptText": repromptText,
		"cardText" : cardText
	};
	callback(sessionAttributes,
		buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText,cardText, shouldEndSession));
}

/**
 * Called when the user says Repeat
 */
function handleRepeatRequest(intent, session, callback) {
	// Repeat the previous speechOutput and repromptText from the session attributes if available
	// else start a new game session
	if (!session.attributes || !session.attributes.speechOutput) {
		getWelcomeResponse(callback);
	} else {
		callback(session.attributes,
			buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
	}
}

/**
 * Called when the user says Help
 */
function handleGetHelpRequest(intent, session, callback) {
	// Provide a help prompt for the user, explaining how the game is played. Then, continue the game
	// if there is one in progress, or provide the option to start another one.

	// Ensure that session.attributes has been initialized
	if (!session.attributes) {
		session.attributes = {};
	}

	// Set a flag to track that we're in the Help state.
	session.attributes.userPromptedToContinue = true;

	// Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.
	var speechOutput = " <p>I  will  guide  you  to  get  the  proper  cancer  clinical  trials  in  the  requested  location.</p>"
		 + " <s>For  example,</s>  <p>say,  breast  cancer trials  in  Stillwater.</p> or "
		 + " <s>say,  start  search.</s> <s>To  start  a  new  search, </s>  or "
		 + " <s>say, diseases</s> <s>To know diseases treating under trial,</s> or "
		 + " <s> say, hospitals</s> or <s>locations</s> or <s>sites</s> <s>To know hospital locations,</s> or "
		 + " <s> say,  repeat.</s> <s>To  repeat  the  previous information.</s>",
	repromptText = " <s>To search cancer  clinical  trials,</s>"
		 + " <p>say,  trials for breast cancer in Stillwater.</p>",
	cardText = "I will guide you to get the proper cancer clinical trials in the requested location. \n"
		 + " For  example, say, breast cancer trials in Stillwater. or \n"
		 + " say, start search. To start a new search,  or \n"
		 + " say, diseases To know diseases treating under trial, or \n"
		 + " say, hospitals or locations or sites To know hospital locations, once search the trials or \n"
		 + " say,  repeat. To  repeat  the  previous information.";
	var shouldEndSession = false;
	
	callback(session.attributes,
		buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText,cardText, shouldEndSession));
}

/**
 * Called when the user says Stop
 */
function handleFinishSessionRequest(intent, session, callback) {
	callback(session.attributes,
		buildSpeechletResponse(CARD_TITLE, "<p> Thanks  for  using  Trials  Guider.</p> <s>Good  bye!</s>", " ","Thanks for using Trials Guider. Good Bye!", true));
}

/**
 * Called when the user says something for trials search. 
 * Please check Sample Utterences for more information.
 * 
 */
function handleTrialsRequest(intent, session, callback) {
	var speechOutput = " ",
	cardText = "",
	sessionAttributes = {},
	resultTrials = [],
	shouldEndSession = false,
	repromptText = "",
	latLngQueryStr,
	filterByCity = "",
	filterByState = "",
	filterByCountry = "United States";
	
	//This code will call google maps geocode api to get Latitude and Longitude if address slot found
    if (intent.slots.Address.value) {
			getLatLongQueryString(intent.slots.Address.value, function (mapsResponse) {
				//console.log(" API Response : " + mapsResponseObject);
				if (mapsResponse.results) {
					if (mapsResponse.results[0].address_components) {
						var totalCmpnts = Object.keys(mapsResponse.results[0].address_components).length;
						for (var cmpntsIndex = 0; cmpntsIndex < totalCmpnts; cmpntsIndex++) {
							var compntObj = mapsResponse.results[0].address_components[cmpntsIndex],
							isLocality = false,
							isState = false;
							
							if (compntObj.types) {
								var totalTypes = Object.keys(compntObj.types).length;
								for (var typesIndex = 0; typesIndex < totalTypes; typesIndex++) {
									if (compntObj.types[typesIndex] === " locality ") {
										isLocality = true;
									}
									
									if (compntObj.types[typesIndex] === " administrative_area_level_1 ") {
										isState = true;
									}
								}
							}
							
							if (isLocality) {
								filterByCity = compntObj.short_name;
							}
							
							if (isState) {
								filterByState = compntObj.short_name;
							}
						}
					}
					
					var latStr = mapsResponse.results[0].geometry.location.lat;
					var lngStr = mapsResponse.results[0].geometry.location.lng;
				    console.log(" lat : " + latStr + " lng : " + lngStr);
					latLngQueryStr = '&sites.org_coordinates_lat=' + latStr + '&sites.org_coordinates_lon=' + lngStr;

				} else {
					throw " Specified Address is not found!";
				}
			});
		}else{
		   latLngQueryStr = ""; 
		}
		
	//Used DeaSync model to turn Google Maps API call to sync.Sometimes process is continuing to the next step before response coming from google api.
	//This small piece of code saved me allot to make sure retrieving Latitude and Longitude before calling NCI Clinical Trials API
	while (latLngQueryStr === undefined) {
		require('deasync').runLoopOnce();
	}
	
	var totalTrials;
	
	//NCI Clinical Trials API needs State in abbreviation (ex: two letter codes as MN for Minnesota).
	//Following code will lookup the state abbreviation from predefined states array.Please check usaStates.js in src folder
	if(intent.slots.State.value){
	    if(intent.slots.State.value.length >2){
	        for(var stateIndex = 0; stateIndex<usaStates.length;stateIndex++) {
	            if(intent.slots.State.value === usaStates[stateIndex].name){
	               intent.slots.State.value =  usaStates[stateIndex].abbreviation;
	            }
	        }   
	    }
	}
	
	//Calling makeTrialsAPIRequest to populate Trials information by calling NCI Clinical Trials API 
	makeTrialsAPIRequest(intent, latLngQueryStr, function (trialsResponse) {
			if (trialsResponse.trials) {
				totalTrials = Object.keys(trialsResponse.trials).length;
			
				//session.trials = trialsResponse.trials;
				//console.log(" Number of Trials: " + totalTrials);
				for (var trialsIndex = 0; trialsIndex < totalTrials; trialsIndex++) {
					var trialObj = trialsResponse.trials[trialsIndex],
					resultTrialObj = {};
					briefTitle = trialObj.brief_title,
					primaryPurpose = trialObj.primary_purpose.primary_purpose_code,
					phase = trialObj.phase.phase;
					
					if(!filterByCity && intent.slots.City.value){
					    filterByCity = intent.slots.City.value;
					}
					
					if (!filterByState && intent.slots.State.value) {
						filterByState = intent.slots.State.value;
					}
					
					if (filterByCountry) {
						trialObj.sites = trialObj.sites.filter(function (site) {
								return site.org_country === filterByCountry
							});
					}
				
					if (filterByState) {
						trialObj.sites = trialObj.sites.filter(function (site) {
								return site.org_state_or_province === filterByState
							});
					}
                    
					if (filterByCity) {
						trialObj.sites = trialObj.sites.filter(function (site) {
								return site.org_city === filterByCity
							});
					}
					
					if (intent.slots.Hospital.value) {
						trialObj.sites = trialObj.sites.filter(function (site) {
								return site.org_name === intent.slots.Hospital.value
							});
					}
					
					var noOfDiseases = Object.keys(trialObj.diseases).length;
					//console.log(" Number Of Diseases: " + noOfDiseases);
					var diseases = [];
					for (var diseasesIndex = 0; diseasesIndex < noOfDiseases; diseasesIndex++) {
					    diseases[diseasesIndex] = trialObj.diseases[diseasesIndex].preferred_name;
					} //Close Diseases Loop
					
					var resultSites = [],
					noOfSites = Object.keys(trialObj.sites).length;
					for (var sitesIndex = 0; sitesIndex < noOfSites; sitesIndex++) {
						var sitesObj = trialObj.sites[sitesIndex],
						resultSiteObj = {};
						if ("ACTIVE" === sitesObj.org_status) {
							var orgName,
						    orgPhone,
						    contactName,
						    contactPhone,
						    contactEmail,
						    orgStatusDate,
						    orgAddress = " ",
						    orgAddressCard = "";
						    
							if(sitesObj.org_name){
							   orgName =  sitesObj.org_name;
							}
							
							if(sitesObj.org_phone){
							    orgPhone = sitesObj.org_phone;
							}
							
							if(sitesObj.org_status_date){
							    orgStatusDate = sitesObj.org_status_date;
							}
							
							if(sitesObj.contact_name){
							    contactName = sitesObj.contact_name;
							}
							
							if(sitesObj.contact_phone){
							    contactPhone = sitesObj.contact_phone;
							}
							
							if(sitesObj.contact_email){
							    contactEmail = sitesObj.contact_email;
							}
							
							if (sitesObj.org_address_line_1) {
								orgAddress += sitesObj.org_address_line_1;
							}

							if (sitesObj.org_address_line_2) {
								orgAddress += ", " + sitesObj.org_address_line_2;
							}

							if (sitesObj.org_city) {
								orgAddress += ", " + sitesObj.org_city;
							}

							if (sitesObj.org_state_or_province) {
								orgAddress += ", " + sitesObj.org_state_or_province;
							}

							if (sitesObj.org_country) {
								orgAddress += ", " + sitesObj.org_country;
							}

							if (sitesObj.org_postal_code) {
							    orgAddressCard += orgAddress;
							    orgAddressCard += ", " + sitesObj.org_postal_code;
								orgAddress += ", <say-as interpret-as=\"digits\">" + sitesObj.org_postal_code+"</say-as>";
							    
							    
							}
							
							resultSiteObj = {
							  "orgName": orgName,
							  "orgPhone": orgPhone,
							  "orgStatusDate": orgStatusDate,
							  "contactName": contactName,
							  "contactPhone": contactPhone,
							  "contactEmail": contactEmail,
							  "orgAddress": orgAddress,
							  "orgAddressCard":orgAddressCard
							};
							
							 resultSites[sitesIndex] = resultSiteObj;	
						}//Close active sties
					}//Close Sites loop
					resultTrialObj = {
					  "trialName":  briefTitle,
					  "primaryPurpose": primaryPurpose,
					  "phase": phase,
					  "diseases": diseases,
					  "sites":resultSites
					};
					
					resultTrials[trialsIndex] = resultTrialObj;
					
				}//Close trials loop;
				trialsResponse.trials = {};
			}else{
			  totalTrials = 0;  
			} //Close Trials null checking
		});
	
	//Used DeaSync model to turn NCI Clinical Trials API call to sync. Sometimes process is continuing to the next step before response coming from the API.
	//This small piece of code saved me allot to make sure retrieving trials information before moving further.	
	while (totalTrials === undefined) {
		require('deasync').runLoopOnce();
	}
	
	//Preparing User response
	if(totalTrials === 0){
	    speechOutput = "<s>no  active  trials  found.</s>  <s>say,  start  search</s>  or  <s>start  trials  guider</s>  to  <s>provide  a  new  location.</s>";
	    repromptText = speechOutput;
	    cardText = "no  active  trials  found. \n say,  start  search  or \nstart  trials  guider to provide  a  new  location.";
	    sessionAttributes = {
	            "speechOutput": speechOutput,
                "repromptText": repromptText,
                "cardText":cardText,
                "userPromptedToContinue": false
	       };
	}else{
	    if(resultTrials){
	       var noOfActiveTrials = Object.keys(resultTrials).length,
	       noOfSites = Object.keys(resultTrials[0].sites).length,
	       noOfDiseases = Object.keys(resultTrials[0].diseases).length;
	       speechOutput = "<s>found  <say-as interpret-as=\"number\">"+noOfActiveTrials+"</say-as>  active  trials. </s>";
	       speechOutput +=" <s>trial </s><say-as interpret-as=\"number\">1</say-as> is <p> "+resultTrials[0].trialName+" .</p>  <s>primary  purpose   is "+resultTrials[0].primaryPurpose+" </s>for <s>phase "+resultTrials[0].phase+" . </s>";
	       speechOutput += " <s>there  are  <say-as interpret-as=\"number\">"+noOfSites+"</say-as>  locations  and  <say-as interpret-as=\"number\">"+noOfDiseases+"</say-as> diseases are exist.</s>";
	       speechOutput += " <s>say,  next  trial</s>  or  <s>say,  diseases to  know  what  diseases  are  treating,</s>  or  <s>say,  locations to  know  hospital locations</s>";
	       repromptText = speechOutput;
	       
	       cardText = "found "+noOfActiveTrials+" active  trials. \n";
	       cardText +=" Trial 1 :  \n"+resultTrials[0].trialName+". \n primary purpose is "+resultTrials[0].primaryPurpose+" for phase "+resultTrials[0].phase+". ";
	       cardText += " there  are  "+noOfSites+"  locations  and  "+noOfDiseases+" diseases are exist.\n";
	       cardText += " say,  next  trial  or  \n say,  diseases to  know  what  diseases  are  treating,  or  \n say,  locations to  know  hospital locations";
	       
	       sessionAttributes = {
	            "speechOutput": speechOutput,
                "repromptText": repromptText,
                "cardText":cardText,
                "currentTrialIndex": 1,
                "currentDiseaseIndex":-1,
                "currentSitesIndex":-1,
                "userPromptedToContinue": true,
                "trialsSearchResult":resultTrials
	       };
	    }else{
	       speechOutput = "<s>no  active  trials  found.</s>  <s>say,  start  search</s>  or  <s>start  trials  guider</s>  to  <s>provide  a  new  location.</s>";
	        cardText = "no  active  trials  found. \n say,  start  search  or \nstart  trials  guider to provide  a  new  location.";
	        repromptText = speechOutput;
	        sessionAttributes = {
	            "speechOutput": speechOutput,
                "repromptText": repromptText,
                "cardText":cardText,
                "userPromptedToContinue": false
	       };
	    }
	}
	
	shouldEndSession = false;
	callback(sessionAttributes,
		buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, cardText, shouldEndSession));
}

/**
 * Uses Clinical Trials API, see link below for more information
 * https://clinicaltrialsapi.cancer.gov/v1/
 **/
function makeTrialsAPIRequest(intent, latLngQueryStr, guiderResponseCallback) {
	console.log(" START: makeTrialsAPIRequest ");
	var city = intent.slots.City.value,
	state = intent.slots.State.value,
	address = intent.slots.Address.value,
	radius = intent.slots.Radius.value,
	hospital = intent.slots.Hospital.value,
	cancerType = intent.slots.CancerType.value;

	var endpoint = 'https://clinicaltrialsapi.cancer.gov/v1/clinical-trials?current_trial_status=Active',
	queryString = '';

	if (city) {
		queryString += '&sites.org_city=' + city;
	}

	if (state) {
		queryString += '&sites.org_state_or_province=' + state;
	}

	if (hospital) {
		queryString += '&sites.org_name=' + hospital;
	}

	if (cancerType) {
		queryString += '&brief_title=' + cancerType;
	}

	if (latLngQueryStr) {
		if (radius) {
			queryString += latLngQueryStr + '&sites.org_coordinates_dist=' + radius + 'mi';
		} else {
			queryString += latLngQueryStr + '&sites.org_coordinates_dist=50mi';
		}

	} //Close LatLng
	console.log(" Trials Query: " + endpoint + queryString);
	if (queryString.length > 0) {
		request.get(endpoint + queryString, function (error, response, body) {
			var trialsResponseString = '';
			if (!error && response.statusCode == 200) {
				var trialsResponseObject = JSON.parse(body);
				//console.log(" API Response String: " + trialsResponseString);
				if (trialsResponseObject.error) {
					console.log(" API Error: " + trialsResponseObject.error.message);
					throw " some thing went wrong, Please try again!";
				} else {
					//console.log(" API Response: " + trialsResponseObject);
					guiderResponseCallback(trialsResponseObject);
				}
			} else {
				throw " some thing went wrong, Please try again!";
			}
		});
	} else {
		console.log(" Not found trials.");
		throw " No trials found. Please try again!";
	}

	console.log(" END: makeTrialsAPIRequest ");
}

/**
 * Uses Google Maps API, see link below for more information
 * https://developers.google.com/maps/documentation/geocoding
 **/
function getLatLongQueryString(address, mapsResponseCallback) {
	console.log(" START: getLatLongQueryString ");
	var endpoint = 'http://maps.googleapis.com/maps/api/geocode/json';
	var queryString = '?address=' + address + '&sensor=false';
	console.log('Maps URL: ' + endpoint + queryString);
	request.get(endpoint + queryString, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			//console.log(body) // Show the HTML for the Google homepage.
			var mapsResponseObject = JSON.parse(body);
			if (mapsResponseObject.error) {
				//console.log(" Maps API Error: " + mapsResponseObject.error.message);
				throw " some thing went wrong, Please try again!";
			} else {
				mapsResponseCallback(mapsResponseObject);
			}
		} else {
			throw " some thing went wrong, Please try again!";
		}
	});
	console.log(" END: getLatLongQueryString ");
}

// ------- Helper functions to build responses -------
function buildSpeechletResponse(title, output, repromptText,cardText, shouldEndSession) {
	return {
		outputSpeech: {
			type: "SSML",
			ssml: "<speak>"+output+"</speak>"
		},
		card: {
			type: "Simple",
			title: title,
			content: cardText
		},
		reprompt: {
			outputSpeech: {
				type: "SSML",
				ssml: "<speak>"+repromptText+"</speak>"
			}
		},
		shouldEndSession: shouldEndSession
	};
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
	return {
		outputSpeech: {
			type: "SSML",
			ssml: "<speak>"+output+"</speak>"
		},
		reprompt: {
			outputSpeech: {
				type: "SSML",
				ssml: "<speak>"+repromptText+"</speak>"
			}
		},
		shouldEndSession: shouldEndSession
	};
}

function buildResponse(sessionAttributes, speechletResponse) {
	return {
		version: "1.0",
		sessionAttributes: sessionAttributes,
		response: speechletResponse
	};
}