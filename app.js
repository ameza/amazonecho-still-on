var alexa = require('alexa-app');
var app = new alexa.app('still-open');
var config = require('./config/config');
var stillOpenController = require('./controllers/stillOpenController');






exports.handler = function(event, context) {

    console.info("Request:", event.request);

    if(event.request.intent) {
        if(event.request.intent.slots) {
            console.info('Slots:', event.request.intent.slots);
        }
    }
    else{
        console.log('here');
    }

    // Send requests to the alexa-app framework for routing
    app.lambda()(event, context);
};

app.sessionEnded(function(request,response) {
    // Clean up the user's server-side stuff, if necessary
    response.clearSession();
    // No response necessary
});

app.pre = function (request, response, type) {
    if(process.env.ALEXA_APP_ID) {
        if (request.sessionDetails.application.applicationId != 'amzn1.echo-sdk-ams.app.'+config.alexaAppId) {
            // Fail silently
            response.send();
        }
    }
};


// TODO: change this message before production release
app.error = function(error, request, response) {
        console.log(error);
        response.say("Something went wrong the Still open app: ");
    exitIntent(request,response);
};

app.launch(function (request, response){

    //console.error(JSON.stringify(request));
    if (!request.sessionDetails.accessToken) {
        response.linkAccount();
        response.say("Welcome to Still On, Follow the instructions on your Alexa App to setup your location");
        response.shouldEndSession(true);
    }
    else{
        response.say("Welcome to Still On, A World wide tool to Find Store Hours and Business Information in your area. Just ask if a business or store is still open");
        response.shouldEndSession(false, "You can ask: is Walmart still on?, or is McDonal's still open?");
    }


});


function OnHelpIntent (request, response){

    var message="You can say something like: Is Walgreen's still open? or is Target still on? go ahead and try.";


    response.say(message);
    response.shouldEndSession(false, "You can ask: is Walmart still on?, or is McDonal's still open?");
};


//app.intent(null, exitIntent)


app.intent('OnHelpIntent', {
    "utterances":["help","what can I ask you",
        "get help",
        "what do you do",
        "how can I use you",
        "help me"]
},OnHelpIntent)


function OnAboutIntent (request, response){

    var message=["Still Open is an Amazon Echo Skill Created by Andres Meza in Costa Rica. The Alexa built-in business hours app lacks business hours information and it" +
    "doesn't work outside the US, Still Open provides business hours information for multiple businesses in different countries."
       ].join("<break time='500ms'/>");

    response.say(message);
    response.card("Still On by Andrés Meza","For more info visit www.andresmeza.com.");
    response.shouldEndSession(false, "You can ask: is Walmart still on?, or is McDonal's still open?");
};

app.intent('OnAboutIntent', {
    "utterances":["about","Who created this app", "Who created this skill"]
},OnAboutIntent)



app.intent('OnStillIntent',
    {
        "slots":{"STORE":"LIST_OF_STORES"},
        "utterances":[
            "if {|STORE} is still available",
            "is {|STORE} still available",
            "{|STORE} is still available",
            "if {|STORE} is still open",
            "is {|STORE} still open",
            "{|STORE} is still open",
            "if {|STORE} is available",
            "is {|STORE} available",
            "{|STORE} is available",
            "if {|STORE} is open",
            "is {|STORE} open",
            "{|STORE} is open",
            "if {|STORE} is still on",
            "is {|STORE} still on",
            "{|STORE} is still on",
            "if {|STORE} is still on",
            "is {|STORE} still on",
            "{|STORE} is still on",
            "if {|STORE} is on",
            "is {|STORE} on",
            "{|STORE} is on",
            "if {|STORE} is on",
            "is {|STORE} on",
            "{|STORE} is on",
        ]
    }, OnSecretIntent);

function OnSecretIntent(request, response){

    if (!request.sessionDetails.accessToken) {
        response.linkAccount();
        response.say("Welcome to Still On, Follow the instructions on your Alexa App to setup your location");
        response.shouldEndSession(true);
    }
    else {
        var currentStore = request.slot('STORE');
        if (currentStore !== '') {
            stillOpenController.GetPlaces(request.sessionDetails.accessToken,currentStore, function (data) {
                console.log(data);
                if (data.length>0) {


                    var hours=data[0].Hours;

                    if (hours.toLowerCase().indexOf('always')>-1){
                        hours = "This business is always open";
                    }

                    if (hours.toLowerCase().indexOf('still')>-1){
                        hours = hours.toLowerCase().replace("still","It will still be ");
                    }

                    var voice="I found " +data.length+" "+ data[0].Name + " still open. <audio src='https://s3.amazonaws.com/tsatsatzu-alexa/sound/tech/OPTIMIS.mp3'></audio>" + ((data.length>1)? " The nearest is ":"")+
                             "Located: "+data[0].Distance+" at: "+data[0].Address+". "+hours+". Check the Alexa App for driving information and more.";

                    var card="I found " +data.length+" "+data[0].Name + " still open:\r\n";

                    data.forEach(function(item){
                        card+="--------------------------"+
                              "\r\nName: "+item.Name+
                              "\r\nDistance: "+item.Distance+
                              "\r\nAddress: "+item.Address+
                              "\r\nHours: "+item.Hours+
                              "\r\nDrive there: "+item.Map+
                              "\r\n--------------------------\r\n\r\n";

                    })

                    response.say(voice);
                    response.card("Still On by Andrés Meza",card+"Pura Vida!!");
                    response.send();
                }
                else{
                    response.say("I'm sorry, I couldn't find any " + currentStore + " open");
                    response.send();
                }
            })


        }
        else {
            response.say("I couldn't get your store or business name");
            response.send();
        }
    }


    return false;
}


app.intent('OnExitIntent', {
        "utterances":["leave",
            "quit",
            "bye",
            "good bye",
            "stop",
            "enough",
            "please stop",
            "cancel"]
},exitIntent);


function exitIntent(request,response) {
    response.clearSession(); // or: response.clearSession('key') to clear a single value
    response.say("Thank you for using Still On, Good bye");
    response.send();
};



// Output the schema
console.log( "\n\nSCHEMA:\n\n"+app.schema()+"\n\n" );
// Output sample utterances
console.log( "\n\nUTTERANCES:\n\n"+app.utterances()+"\n\n" );



