Purpose

Have access to a widespread database filled with the store hours and store locations for your local retailers. Find out if the store you are looking for is still open after your late-night shift, or be there first thing in the morning by knowing their hours of operation and store location. Creating a must have for the late night crowd, first-responders or 24 hour shift workers, or even just finishing errands on a weeknight.

Are you looking for Best Buy Store hours? Need Walmart store hours, Looking for pizza that is open late? Grab last minute purchases or late night food from local places with help from our store hours and store locations database. Rather than calling one store location at a time, this skill provides you with store hours and alternate business listings just by asking.

The built-in information is not enough
Asking Alexa for business hours will let you disappointed, Alexa uses Yelp as source of information for business hours however this built-in skill has two main deficiencies:

1- There's no business hours information for all the businesses

2-There's no way to get information about businesses in your area if you live in another country.

Still On comes to the rescue providing a platform that provides business hours for all the places in most of the countries.

We use your real location
Still On does not work with Alexa's default location, the problem with that location is that it doesn't allow addresses outside the US, I wanted Still On to be a tool for international users as well (I live in Costa Rica).

Still On gets your location in the account linking page with two simple steps:

https://hackster.imgix.net/uploads/attachments/176886/Screenshot_20160731-230344.png?w=680&h=510&fit=max

Copy the link in step 1 and paste it in your phone browser
Copy the link in step 1 and paste it in your phone browser
Allow your browser to use your location, click on copy location
Allow your browser to use your location, click on copy location
Paste your location on step 2 and click on Use this location
Paste your location on step 2 and click on Use this location
Done, your location is now set as default for Still On
Done, your location is now set as default for Still On


Real location Account Linking Page
I came up with the page flow above by looking at the original hack to use the authorization token as bridge of information, created by Colin-McGraw in the Tickle Monster Skill.

What I'm doing is pretty much forcing the user to open a site in a browser that asks for location and then having the user copy the geo coordinates back to the Alexa App. The extra step of opening a browser is required only because the Alexa App prevents any popup that request permissions, otherwise I would have done it the same page, once I have the geo coordinates I'm using the auth token as way of sending the collected coordinates back to my lambda program, same as Tickle Monster does, no need of DB or any other kind of storage.

Demo

Using Costa Rica Address

https://youtu.be/WT-k3263mbc

Using US Address

https://youtu.be/iWt16WKfbgg

Current Status
Certified

http://alexa.amazon.com/spa/index.html#skills/dp/B01JA5A88Y/?ref=skill_dsk_skb_sr_0

Origin of Information

This skill retrieves all its information by doing a web scraping on the public site stillopen.com all the credit on the info goes to them, I just exposed their site as an Alexa Skill, they don't provide any kind of api, and I couldn't find any kind of publicity or copyright policy that prevent me from extracting the information.

Live Web Scraping Technique

Since stillopen.com does not provide any kind of API, I decided to use Jam API, a service that allows you to turn any site into a JSON accessible api using CSS selectors, I went through the site and by inspecting their css classes I was able to define a model to extract the businesses information and hours.

By using a combination of the input from the user, the jam api model and the coordinates that I previously collected in the singup page, I can make realtime requests to stillopen.com and retrieve information of businesses in a json format, and eventually have Alexa output that information.

Jam API Model

{
"title": "title",
"Names": [{"elem": "span.placeName", "Link": "href", "Name": "text"}],
"Links":[{"elem": "#placesList a",  "Link":"href"}],
"Addresses": [{"elem": "span.placeAddr", "Address": "text"}],
"Distances": [{"elem": "span.milesAway", "Distance": "text"}],
"CloseOpen": [{"elem": ".placeImages", "class": "html"}]
}

Cards Info

Still On will let you know how many open businesses are that match your request and which one is the nearest, if there's more than one you'll be able to find information about them in the Alexa App, Still On will include the business hours information and also a link to drive there, I'm using google maps to generate the driving link and also goo.gl to make the urls to the maps short and easy to copy. Still On even provides addresses in countries where directions and street names are not well defined (like mine).

Using US address

https://hackster.imgix.net/uploads/attachments/176902/Screenshot_20160801-001142.png?w=680&h=510&fit=max

Using Costa Rica address

https://hackster.imgix.net/uploads/attachments/176901/Screenshot_20160801-001254.png?w=680&h=510&fit=max

Disclaimer
No copyright infringement intended, I'm just collecting information publicly available.
