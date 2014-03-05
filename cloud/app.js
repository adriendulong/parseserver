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
 
 app.post('/e/:idevent', function(req, res) {
 	var idEvent = req.params.idevent;
 	var eventUrlRed = '/e/' + idEvent ;
 	res.redirect(eventUrlRed);
 });
 
/*on redirige selon la langue du nav
app.get('/', function(req, res) {

     var userLang = req.acceptedLanguages; 
     var userLangFirst = userLang[0];
	 console.log("The userLangFirst is: " + userLangFirst);
	 if (userLangFirst == "fr" || userLangFirst == "fr-fr" || userLangFirst == "FR" || userLangFirst == "fr-FR" || userLangFirst == "fr-be" || userLangFirst == "fr-ca" || userLangFirst == "fr-lu" || userLangFirst == "fr-mc" || userLangFirst == "fr-ch"){
		 res.redirect('/fr');
	 }else {
		 res.redirect('/en');
	 }


});*/

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

//on redirige pour le formulaire de contact
app.get('/process-contact.php', function(req, res) {
res.redirect('http://www.woovent.com/process-contact.php');
});


app.get('/press', function(req, res) {

		res.redirect("http://www.woovent.com/press.html");
	
});

app.get('/presse', function(req, res) {

		res.redirect("http://www.woovent.com/press.html");
	
});



//on a les pages photo sur /p/id
app.get('/p/:idphoto', function(req, res) {
	var idPhoto = req.params.idphoto;
	console.log("Id photo"+idPhoto);
	
	var photoUrl = "http://www.woovent.com/p/" + idPhoto;
	
	var photoSrc = "";
	
	//Get the event with its id
	var Photo = Parse.Object.extend("Photo");
	var queryPhoto = new Parse.Query(Photo);
	
	queryPhoto.include("user");
	
	queryPhoto.get(idPhoto, {
	  success: function(photo) {
	  
	  	var user = photo.get("user");
	  	if (user) {
	  		var userProfilPicUrl = user.attributes.pictureURL;
	  	} else {
			var userProfilPicUrl = "http://www.woovent.com/images/icon_woovent512.png"; 	
	  	}
	  	
	  	if (user) {
	  		var userName = user.attributes.name;
	  	} else {
			var userName = "User"; 	
	  	}
	  	
	  	
	  	
	  
	  	//We find the picture
	    if(photo.get("facebookId")!=null){
	    	 photoSrc = photo.get("facebook_url_full");
	    }else if (photo.get("full_image")!=null){
	   
	    	 photoSrc = photo.get("full_image").url();
	    } else {
	    	 res.send("Cannot get the photo");
		}
		
		if (photo.get("event")!=null) {
			var idEvent = photo.get("event") ;
			var eventUrl = "https://www.woovent.com/e/" + photo.get("event");
		}else {
			var idEvent = "" ;
		}
		
		if (photo.get("height")!=null) {
			var photoHeight = photo.get("height") ;
		}else {
			var photoHeight = "" ;
		}
		
		if (photo.get("width")!=null) {
			var photoWidth = photo.get("width") ;
		}else {
			var photoWidth = "" ;
		}
		
		if (photo.createdAt !=null) {
			var createdTime = photo.createdAt ;
		}else {
			var createdTime = "2014-01-01T00:00:00.871Z" ;
		}
		
		res.render('photoview', { photoUrl : photoUrl, photoSrc : photoSrc, eventId : idEvent, eventUrl : eventUrl , photoWidth : photoWidth, photoHeight : photoHeight, userName : userName, userProfilPicUrl : userProfilPicUrl, idPhoto : idPhoto, createdTime : createdTime });
		
	  },
	  error: function() {
		 res.send("Cannot get the photo");
		 }
	});
   
 });

//on a les pages event au /f/id
app.get('/e/:idevent', function(req, res) {
	var idEvent = req.params.idevent;
	console.log("Id event"+idEvent);
	
	var eventUrl = "https://www.woovent.com/e/" + idEvent;
	
	var photoUrl = "";
	
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
		    if(photo.get("facebookId")!=null){
		    	 photoUrl = photo.get("facebook_url_full");
		    }else if (photo.get("full_image")!=null){
		   
		    	 photoUrl = photo.get("full_image").url();
		    } else {
			     photoUrl = "https://www.woovent.com/images/base-top.jpg";
		    }

		    res.render('eventview', { eventObject: event, photoUrl : photoUrl, eventId : idEvent, eventUrl : eventUrl});
		  },
		  error: function() {
		    //No photo, give url of the event cover if there is one
		    if (event.get("cover")!=null){
		    	res.render('eventview', { eventObject: event, photoUrl : event.get("cover"),eventId : idEvent, eventUrl : eventUrl});
		    }
		    else {
			    res.render('eventview', { eventObject: event, photoUrl : "https://www.woovent.com/images/base-top.jpg",eventId : idEvent, eventUrl : eventUrl});
		    }
		    
		  }
		});
	 //si on a trouvé aucune photo
	 if (photoUrl == ""){
		 	if (event.get("cover")!=null){
		    	res.render('eventview', { eventObject: event, photoUrl : event.get("cover"),eventId : idEvent, eventUrl : eventUrl});
		    }
		    else {
			    res.render('eventview', { eventObject: event, photoUrl : "https://www.woovent.com/images/base-top.jpg",eventId : idEvent, eventUrl : eventUrl});
		    }
	 }


	  },
	  error: function() {
		    //console.log("Error: "+ error.message);
		    res.send("Cannot get the event");
		 }
	});
   
 });
// Attach the Express app to Cloud Code.
app.listen();
