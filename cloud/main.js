require('cloud/app.js');
////////////
// PUSH NEW PHOTOS EVENT
////////////

Parse.Cloud.define("pushnewphotos", function(request, response) {
	var nbPhotos = request.params.nbphotos;
	var eventId = request.params.eventid;

	///////////////////
	//// GET EVENT ////
	///////////////////

	var Event = Parse.Object.extend("Event");
	var queryEvent = new Parse.Query(Event);
	queryEvent.get(eventId, {
	  success: function(event) {
	    var Invitation = Parse.Object.extend("Invitation");
	    var queryInvits = new Parse.Query(Invitation);
	    queryInvits.equalTo("event", event);
	    queryInvits.notEqualTo("user", request.user);
	    queryInvits.exists("user");
	    queryInvits.include("user");

	    queryInvits.find({
		  success: function(results) {
		    
		    var users=new Array(); 
		    for (var i = 0; i < results.length; i++) { 
		    	users[i] = results[i].get("user");
		    }

		    var query = new Parse.Query(Parse.Installation);
			query.containedIn('owner', users);
			query.equalTo("is_push_notif", true);
			query.notEqualTo("appVersion", "1.0");

			//Preapre name event
			if (event.get("name").length > 20) {
				var nameEvent = event.get("name").substr(0,20) +"...";
			}
			else{
				var nameEvent = event.get("name");
			}

			//Prepare message and arguments to send
			var locKey;
			var locArgs;
			if (nbPhotos < 2) {
				locKey = "PushNotifs_NewPhotoOne";
				locArgs = [nameEvent];
			}
			else{
				locKey = "PushNotifs_NewPhotos";
				locArgs = [nbPhotos, nameEvent];
			}

			Parse.Push.send({
			  where: query, // Set our Installation query
			  data: {
			    alert: {
			    	"loc-key" : locKey,
			    	"loc-args" : locArgs
			    },
			    badge: "Increment",
			    e: event.id

			  }
			}, {
			  success: function() {
			    // Push was successful
			    console.log("Push envoyés !");
			    response.success("PUSH sent");
			  },
			  error: function(error) {
			    console.log("Error :"+error.message);
			    response.error("probleme sending pushs "+error.code+" Infos : "+error.message);
			  }
			});
		  },
		  error: function(error) {
		    console.log("Error: " + error.code + " " + error.message);
		    response.error("Cannot get the invitations");
		  }
		});

	  },
	  error: function(object, error) {
	    response.error("Cannot get the event");
	  }
	});
});



////////////
// PUSH NEW PHOTO LIKE
////////////

Parse.Cloud.define("pushnewlike", function(request, response) {
	var photoId = request.params.photoid;

	///////////////////
	//// GET PHOTO ////
	///////////////////


	var Photo = Parse.Object.extend("Photo");
	var queryPhoto = new Parse.Query(Photo);
	queryPhoto.include("user");
	queryPhoto.notEqualTo("user", request.user);
	queryPhoto.exists("user")
	queryPhoto.get(photoId, {
	  success: function(photo) {

	  		//If not a photo from FB or from a user using the app
	  		if(photo.get("user")!=null){
	  			var query = new Parse.Query(Parse.Installation);
				query.equalTo('owner', photo.get("user"));
				query.equalTo("is_push_notif", true);
				query.notEqualTo("appVersion", "1.0");

				Parse.Push.send({
				  where: query, // Set our Installation query
				  data: {
				    alert: {
				    	"loc-key" : "PushNotifs_LikePhoto",
				    	"loc-args" : [request.user.get("name")]
				    },
				    badge: "Increment",
				    p: photo.id
				  }
				}, {
				  success: function() {
				    // Push was successful
				    console.log("Push envoyés !");
				    response.success("PUSH sent");
				  },
				  error: function(error) {
				    console.log("Error :"+error.message);
				    response.error("probleme sending pushs "+error.code+" Infos : "+error.message);
				  }
				});
	  		}

	   },
	  error: function(object, error) {
	    response.error("Cannot get the photo");
	  }
	});
});









///////////////////////////////////////////////////
///////// BACKGROUND JOBS /////////////////////////
///////////////////////////////////////////////////

// SEND Notificitaions concerning invitations

Parse.Cloud.job("pushInvitation", function(request, status) {
  var query = new Parse.Query(Parse.User);
  query.each(function(user) {
  	console.log("userId = " + user.id);

  	//Event query
  	var Event = Parse.Object.extend("Event");
  	var queryEvent = new Parse.Query(Event)
  	queryEvent.greaterThan("start_time", new Date());

  	//Get invitations
  	var Invitation = Parse.Object.extend("Invitation");
  	var queryInvitations = new Parse.Query(Invitation)
  	queryInvitations.matchesQuery("event", queryEvent);
  	queryInvitations.equalTo("rsvp_status", "not_replied");
  	queryInvitations.equalTo("user", user);


  	//promise
  	var promise = new Parse.Promise();

  	queryInvitations.count({
	  success: function(count) {
	    // The count request succeeded. Show the count

	    //If more than one invitation, send push
	    if(count >0){
	    	var query = new Parse.Query(Parse.Installation);
			query.equalTo('owner', user);
			query.equalTo("is_push_notif", true);
			//query.notEqualTo("appVersion", "1.0");

			var message;
			if (count>1) {
				message = "PushNotifs_InvitationsMany"
			}
			else{
				message = "PushNotifs_InvitationsOne";
			}

			Parse.Push.send({
				where: query, // Set our Installation query
				data: {
				    alert: {
				    	"loc-key" : message,
				    	"loc-args" : [count]
				    },
				    badge: "Increment",
				    type: 0
				}
			}, 
			{
				success: function() {
				    // Push was successful
				    console.log("Push envoyés !");
				    promise.resolve('Push Sent');
				},
				error: function(error) {
				    console.log("Error :"+error.message);
				    promise.reject(error); 
				}
			});
	    }
	    else{
	    	promise.resolve('No invitation');
	    }

	  },
	  error: function(error) {
	    // The request failed
	    promise.reject(error); 
	  }
	});

	return promise;

  }).then(function(){
    status.success('Done');
  }, function (error) {
    status.error(error.message);
  });

});



//Remove invitation prospect when create invitation for the same event for a user
Parse.Cloud.afterSave("Invitation", function(request) {

	//It is an invitation for a user
	if (request.object.get("user")) {
		console.log(request.object.get("user").id)

		//Get the user
		var query = new Parse.Query("User");
		query.get(request.object.get("user").id, {
		    success: function(user) {
		      console.log("User facebook Id : "+user.get("facebookId"));

		      //Get the prospect
		      var Prospect = Parse.Object.extend("Prospect");
		      var queryProspect = new Parse.Query(Prospect);
		      queryProspect.equalTo("facebookId", user.get("facebookId"));
		      queryProspect.first({
		      	success: function(prospect){

		      		if (prospect) {
		      			console.log(prospect.id);

		      			//Got the prospect, find invitation to this event with this prospect
			      		var Invitation = Parse.Object.extend("Invitation");
					    var queryInvitation = new Parse.Query(Invitation);
					    queryInvitation.exists("prospect");
					    queryInvitation.doesNotExist("user");
					    queryInvitation.equalTo("prospect", prospect);
					    queryInvitation.equalTo("event", request.object.get("event"));

					    queryInvitation.first({
					    	success: function(invit){
					    		console.log("found invit");
					    		invit.destroy({
								  success: function(myObject) {
								    console.log("Deleted one invitation from prospect");
								  },
								  error: function(myObject, error) {
								    // The delete failed.
								    console.log("Error when deleting one invitation from prospect : "+error.message);
								  }
								});
					    	},
					    	error: function(error){
					    	}
					    });
		      		};
		      		
		      	},
		      	error: function(error){
		      		console.error("Got an error " + error.code + " : " + error.message);
		      	}
		      });

		      //Get invitation to this event for a prospect with this facebookId
		      var Invitation = Parse.Object.extend("Invitation");
		      var queryInvitation = new Parse.Query(Invitation);
		      queryInvitation.equalTo("prospect")


		    },
		    error: function(error) {
		      console.error("Got an error " + error.code + " : " + error.message);
		    }
		});
	};

});











