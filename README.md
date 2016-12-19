# Trails Guider

This is [Chennu's](https://www.chennu.com) entry for 
the [Hackster.io The Amazon Alexa API Mashup Contest](https://www.hackster.io/contests/alexa-api-contest).
Since all entries are required to be published, I will be donating this base version to the community.
I would like to see more high quality skills available on the Alexa platform. Hoping that by providing this skill to community, users will be able to take the techniques shown here and use them to build their own Alexa Skills. Or that people will contribute to make this skill even better than it is. 

I am very happy if you can contribute your valuable time to make this skill even better than it is.

### Need your contribution for this Skill on the following areas:

1. Sending Trials information to the provided Email
 * Subscribing with a valid email id
 * Storing subscribed email id in AWS Dynamodb and doing all the CRUD operations through AWS Gateway. [Click for more info..](https://aws.amazon.com/blogs/compute/using-amazon-api-gateway-as-a-proxy-for-dynamodb/)
 * Sending a unique token to the provided email id for verification
 * Confirming back to the Alexa with a token to confirm the email id
 * Asking Alexa to send Trials Information
 * Sending active Cancer Clinical Trials search result back to the user email id
 * User can be opted out from the email subsription at any time
2. Extending to support trails search for all the contries. Right now based version supports only to search Cacner Clinical Trials within the USA. NCI is maintaing all the world wide trials information. 
3. Any Performance tuning
4. Improved Voice User Interface Design
5. Adding more Intents to make the usage of this skill is easy for all the users
6. Promoting this skill in your social media to reach all the users throughout the world to get the valid Cancer Trials information.

***

Cancer Clinical Trials are critically important to patients. This skill with Alexa helps patients to find the right trial for them in USA.

![](docs/TrialsGuider_Architecture_Transparent.png)

The making-of story of this skill can be found here: [Trials Guider at Hackster.io](https://www.hackster.io/enrich-your-thoughts/trialsguider-a02c99 "Trials Guider at The Amazon Alexa API Mashup Contest")

##Finding right active cancer clinical trial.
If you are interested in If you are interested in Trials Guider, go for something like:
```
"Alexa, Open trials guider"
"Search trials in {City}"
```
where {City} is any city name in USA of your choice.

With this intent Alexa plays back the number of active trials available in that city. Moreover, this skill provides all the trials information back to Alexa App.


![](docs/TrialsGuider_SearchTrials_Transparent.png)


##General features
"Repeat" during search plays back the previous response.

"Next" or "Next Trial" or "More Trials" at any time after the trials search, it will responded with the next trial information.

"Cancel" after the trials search will jump to the next trial.

"Stop" quits the skill and responded with the Thank You message and Good Bye!

"Help" gives more information about how to search trials.

##Trials Guider with Alexa Testing
<a href="https://www.youtube.com/watch?v=pE0b4rU-Y4s" target="_blank"><img src="docs/trials-guider-youtube.JPG" 
alt="Trials Guider with Alexa" width="500" height="350" border="10" /></a>

***
“THIS TOOL DOES NOT PROVIDE MEDICAL ADVICE, AND IS FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY, AND IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, TREATMENT OR DIAGNOSIS. CALL YOUR DOCTOR TO RECEIVE MEDICAL ADVICE. IF YOU THINK YOU MAY HAVE A MEDICAL EMERGENCY, PLEASE DIAL 911.”
***
