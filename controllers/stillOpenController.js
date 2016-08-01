var request = require("request");
var forEach = require('async-foreach').forEach;
var googl = require('goo.gl');
var config = require('../config/config');

googl.setKey(config.googlApiKey);


//narrow open stores and get business hours for each one
function findMeOpen(formattedPlaces, cb){

    if (formattedPlaces && formattedPlaces.length>0) {

        var openStores = formattedPlaces.filter(function (item) {
            return item.Open == true;
        })

        var newList = [];

        forEach(openStores, function (item, index) {
            // Break out of asynchronous iteration early...
            var done = this.async();
            // ...by passing false to the done function.
            getMeHours(item, function (data) {
                item.Hours = data.Hours;
                item.Phone = data.Phone;
                item.Map = data.Map;
                newList.push(item);
                done();
            })
        }, function (alldone) {
            cb(newList);
        });
    }
    else{
        cb([]);
    }
}

//get business hours and shortened map for each store
function getMeHours(openStore, cb){

    var url = openStore.Link;

    var request = require("request");

    var options = {
        method: 'POST',
        url: 'http://www.jamapi.xyz/',

        form: {
            url: url,
            json_data: JSON.stringify({
                "Details":{"elem": "#hoursDetails",  "Name":"text"},
                "Phone":{"elem": ".roundButton span",  "Name":"text"}
            })
        }
    }
    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        if (body) {
            var myHours = JSON.parse(body)

            var mapUrl="https://maps.google.com/?daddr="+openStore.Address

            googl.shorten(mapUrl)
                .then(function (shortUrl) {
                    cb({
                        Hours: myHours.Details.Name.replace("Still",", Still").replace(/\\/,""),
                        Phone: myHours.Phone.Name,
                        Map: shortUrl
                    })
                })
                .catch(function (err) {
                    console.error(err.message);
                });
        }
    });

}

//get places based on coordinates
function getPlaces(latlong, place, cb) {

    var url = "https://www.stillopen.com/search/?ll="+latlong+"&q="+place;

    var request = require("request");

    var options = {
        method: 'POST',
        url: 'http://www.jamapi.xyz/',

        form: {
            url: url,
            json_data: JSON.stringify({
                "title": "title",
                "Names": [{"elem": "span.placeName", "Link": "href", "Name": "text"}],
                "Links":[{"elem": "#placesList a",  "Link":"href"}],
                "Addresses": [{"elem": "span.placeAddr", "Address": "text"}],
                "Distances": [{"elem": "span.milesAway", "Distance": "text"}],
                "CloseOpen": [{"elem": ".placeImages", "class": "html"}]
            })
        }
    }
    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        if (body) {
            var myPlaces = JSON.parse(body)
            if (myPlaces.Names && myPlaces.Names.length > 0) {
                var formattedPlaces = [];

                for (var c = 0; c < myPlaces.Names.length; c++) {
                    var newPlace = {
                        Name: myPlaces.Names[c].Name,
                        Address: myPlaces.Addresses[c].Address.replace(" St"," St ").replace(" Ave"," Ave ").replace(" Dr"," Dr "),
                        Link: myPlaces.Links[c].Link.replace('../','https://www.stillopen.com/'),
                        Distance: myPlaces.Distances[c].Distance,
                        Open: (myPlaces.CloseOpen[c].class.toLowerCase().indexOf('open') > 0) ? true : false
                    }
                    formattedPlaces.push(newPlace);
                }
            }
        }
        console.log(JSON.stringify(formattedPlaces));
        findMeOpen(formattedPlaces, function(data){
            cb(data)
        })
    });

}



module.exports = {
    GetPlaces: getPlaces
}

