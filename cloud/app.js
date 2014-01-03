// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());   // Middleware for reading request body

var url = require('url');
var querystring = require('querystring');


app.post('/', function(req, res) {
   res.redirect('/');
 });

app.get('/testimage', function(req, res) {
	var Buffer = require('buffer').Buffer;
	 var params = querystring.parse(url.parse(req.url).query);
	var pictureNewUrl = params['url'];
	console.log("url : " + pictureNewUrl);
   Parse.Cloud.httpRequest({
	  	url: pictureNewUrl ,
	  success: function(httpResponse) {
	    var imageBuffer = httpResponse.buffer;
	    res.set('Content-Type', 'image/jpeg');
	    res.send(imageBuffer);

	    
	  },
	  error: function(httpResponse) {
	    console.error('Request failed with response code ' + httpResponse.status);
	  }
	});
   
 });

//on redirige en attendant vers la home
app.get('/f/:idevent', function(req, res) {
res.redirect('/');
});

//on redirige pour le formulaire de contact
app.get('/process-contact.php', function(req, res) {
res.redirect('http://www.woovent.com/process-contact.php');
});

app.get('/cgu/:lg', function(req, res) {
	console.log("Lang : "+req.params.lg);
	if (req.params.lg == "fr") {
		res.render("cgu");
	}
	else{
		res.render("cgu_en");
	}
	
});

//on a les pages event au /f/id
app.get('/e/:idevent', function(req, res) {
	var idEvent = req.params.idevent;
	console.log("Id event"+idEvent);
	
	var eventUrl = "https://www.woovent.com/e/" + idEvent;
	
	//Get the event with its id
	var Event = Parse.Object.extend("Event");
	var queryEvent = new Parse.Query(Event);
	queryEvent.get(idEvent, {
	  success: function(event) {
	  	//We have the event
	  	//See if there is at least one photo
	  	var Photo = Parse.Object.extend("Photo");
		var queryPhoto = new Parse.Query(Photo);
		queryPhoto.equalTo("event", event);
		queryPhoto.first({
		  success: function(photo) {
		    //We have at least one photo
		    if(photo.get("facebookId")==null){
		    	var photoUrl = photo.get("full_image").url();
		    }else{
		    	var photoUrl = photo.get("facebook_url_full");
		    }

		    res.render('eventview', { eventObject: event, photoUrl : photoUrl, eventId : idEvent, eventUrl : eventUrl});
		  },
		  error: function() {
		    //No photo, give url of the event cover if there is one
		    if (event.get("cover")!=null){
		    	res.render('eventview', { eventObject: event, photoUrl : event.get("cover"),eventId : idEvent, eventUrl : eventUrl});
		    }
		    else {
			    res.render('eventview', { eventObject: event, photoUrl : "",eventId : idEvent, eventUrl : eventUrl});
		    }
		    
		  }
		});


	  },
	  error: function() {
		    //console.log("Error: "+ error.message);
		    res.send("Cannot get the event");
		 }
	});
   
 });
// Attach the Express app to Cloud Code.
app.listen();
