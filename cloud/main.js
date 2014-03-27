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


////////////
// PUSH NEW PHOTO COMMENT
////////////

Parse.Cloud.define("pushnewcomment", function(request, response) {
	var photoId = request.params.photoid;
	var commentMessage = request.params.comment;

	///////////////////
	//// GET PHOTO ////
	///////////////////


	var Photo = Parse.Object.extend("Photo");
	var queryPhoto = new Parse.Query(Photo);
	queryPhoto.include("user");
	//queryPhoto.notEqualTo("user", request.user);
	queryPhoto.exists("user")
	queryPhoto.get(photoId, {
	  success: function(photo) {

	  		//If not a photo from FB or from a user using the app
	  		if(photo.get("user")!=null){

	  			//Get the users of the comment
	  			var comments = photo.get("comments");
	  			var ids = [];
	  			
	  			for(var i=0;i<comments.length;i++){
	  				ids.push(comments[i]["id"]);
	  			}


				var queryUsers = new Parse.Query(Parse.User);
	  			queryUsers.containedIn("objectId", ids);

	  			queryUsers.find({ 
				  success: function(results) {

				    var alreadyOwner = false;
				    var allUser = [];
				    for(var j=0;j<results.length;j++){
				    	if (results[j].id == photo.get("user").id) {
				    		alreadyOwner = true;
				    	}
				    	if (results[j].id != request.user.id) {
				    		allUser.push(results[j]);
				    	}
				    	
				    }
				    if(!alreadyOwner){
				    	allUser.push(photo.get("user"));
				    }


				    //Push
		  			var query = new Parse.Query(Parse.Installation);
					query.containedIn('owner', allUser);
					query.equalTo("is_push_notif", true);
					query.notEqualTo("appVersion", "1.0");
					query.notEqualTo("appVersion", "1.0.1");

					//[request.user.get("name")
					var messagePush;
					if(commentMessage.length >100){
						commentMessage.substring(0,100);
						messagePush = request.user.get("first_name")+' : "'+commentMessage+'..."';
					}
					else{
						messagePush = request.user.get("first_name")+' : "'+commentMessage+'"';
					}

					Parse.Push.send({
					  where: query, // Set our Installation query
					  data: {
					    alert: messagePush,
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
				  },
				  error: function(error){
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
	console.log(request.params.startUser);

	var today = new Date();
	var pushToBeSent = 0;
	var userIncrement = 0;

	//Start Date
	var startDate = new Date();

	//only on sunday
	if(today.getDay() == 1){
		var query = new Parse.Query(Parse.User);
		query.exists("has_rsvp_perm");
	  query.each(function(user) {
	  	//Get invitations

	  	var Invitation = Parse.Object.extend("Invitation");
	  	var queryInvitations = new Parse.Query(Invitation)
	  	queryInvitations.greaterThan("start_time", new Date());
	  	queryInvitations.equalTo("rsvp_status", "not_replied");
	  	queryInvitations.equalTo("user", user);


	  	//promise
	  	var promise = new Parse.Promise();

	  	queryInvitations.find({
		  success: function(invits) {
		    // The count request succeeded. Show the count

		    //If more than one invitation, send push
		    if(invits.length >0){
		    	pushToBeSent++;
		    	var query = new Parse.Query(Parse.Installation);
				query.equalTo('owner', user);
				query.equalTo("is_push_notif", true);
				query.notEqualTo("appVersion", "1.0");
				//query.notEqualTo("appVersion", "1.0");

				var message;
				if (invits.length>1) {
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
					    	"loc-args" : [invits.length]
					    },
					    badge: "Increment",
					    type: 0
					}
				}, 
				{
					success: function() {
					    // Push was successful
					    userIncrement++;
					    promise.resolve('Push Sent');
					},
					error: function(error) {
						userIncrement++;
					    console.log("Error :"+error.message);
					    promise.reject(error); 
					}
				});
				//userIncrement++;

				//promise.resolve('Push Sent');
		    }
		    else{
		    	promise.resolve('No invitation');
		    }

		  },
		  error: function(error) {
		    // The request failed
		    userIncrement++;
		    promise.reject(error); 
		  }
		});

		return promise;

	  	

	  }).then(function(){
	  	var endDate = new Date();
	  	var timeDiff = Math.abs(startDate.getTime() - endDate.getTime());
	    status.success('Done with '+pushToBeSent+" users to send and time : "+timeDiff);
	  }, function (error) {
	    status.error(error.message);
	  });
	}
	else{
		status.success('No need to be done');
	}

  

});


Parse.Cloud.job("getNbLikesPhotos", function(request, status) {
	var nbPhotosDone = 0;

	var photo = Parse.Object.extend("Photo");
	var query = new Parse.Query(photo);
	query.exists("likes");



	query.each(function(photo) {
		var promise = new Parse.Promise();

		photo.set("nb_likes", photo.get("likes").length);
		photo.save(null, {
		  success: function(photo) {
		    nbPhotosDone++;
		    promise.resolve('Likes added');
		  },
		  error: function(photo, error) {
		  	nbPhotosDone++;
		    promise.reject(error); 
		  }
		});

		return promise;
	}).then(function(){
	    status.success('All Photos Done : '+nbPhotosDone);
	}, function (error) {
	    status.error(error.message);
	});
});


Parse.Cloud.job("getNbPhotosPerEvents", function(request, status) {
	var nbEvents = 0;
	var today = new Date();

	var eventObject = Parse.Object.extend("Event");
	var query = new Parse.Query(eventObject);
	query.doesNotExist("nb_photos");

	query.each(function(eventResult) {
		var endDate = new Date();
	  	var timeDiff = Math.abs(today.getTime() - endDate.getTime());
		
		var promise = new Parse.Promise();

		if (timeDiff<750000) {
			var photoObject = Parse.Object.extend("Photo");
			var queryPhoto = new Parse.Query(photoObject);
			queryPhoto.equalTo('event', eventResult);


			queryPhoto.find({
			  success: function(photos) {
			  	nbEvents++;

			  	//if(photos.length>0){
			  		eventResult.set("nb_photos", photos.length);
			  		eventResult.save(null, {
			  			success: function(event){
			  				console.log("nb photos set");
							promise.resolve('Nb Photos set');
			  			},
			  			error: function(event, error){
			  				promise.reject(error); 
			  			}
			  		});

			  	//}
			  	//else{
			  	//	promise.resolve('No Photos');
			  	//}

			    
			  },
			  error: function(photo, error) {
			    promise.reject(error);  
			  }
			});
		}
		else{
			promise.resolve('Too late');
		}

		return promise;
	}).then(function(){
		var endDate = new Date();
	  	var timeDiff = Math.abs(today.getTime() - endDate.getTime());
	    status.success('All Events Done : '+nbEvents+" in time : "+timeDiff);
	}, function (error) {
	    status.error(error);
	});
});



//Remove invitation prospect when create invitation for the same event for a user
/*
Parse.Cloud.afterSave("Invitation", function(request) {

	//It is an invitation for a user
	if (request.object.get("user")) {

		//Get the user
		var query = new Parse.Query("User");
		query.get(request.object.get("user").id, {
		    success: function(user) {

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
*/

//Don't duplicate events

Parse.Cloud.beforeSave("Event", function(request, response) {



	//The app is trying to create the event
	if (!request.object.existed()) {
		var Event = Parse.Object.extend("Event");
		var query = new Parse.Query(Event);
		query.equalTo("eventId", request.object.get("eventId"))

		query.count({
			success: function(count) {
				if(count>0){
					response.error("The event already exists");
				}
				else{
					request.object.set("nb_photos", 0);
					response.success();
				}
			},
			error: function(results){
				response.error("Can't get the count");
			}
		});
	}
	else{
		response.success();
	}
	

});


//Don't duplicate events

Parse.Cloud.beforeSave("Invitation", function(request, response) {

	//The app is trying to create the invitation
	if (!request.object.existed()) {
		var invit = Parse.Object.extend("Invitation");
		var query = new Parse.Query(invit);
		query.equalTo("user", request.user);
		query.equalTo("event", request.object.get("event"));

		query.first({
	      success: function(object) {
	        if (object) {
	          response.error("An invitation for this user and this event already  exists.");
	        } else {
	          response.success();
	        }
	      },
	      error: function(error) {
	        response.error("Could not validate uniqueness for this invitation object.");
	      }
	    });
	}
	else{
		response.success();
	}
	

});


Parse.Cloud.beforeSave(Parse.User, function(request, response) {
	if (!request.object.get("location")) {
		request.object.set("location", "rien");
	};
  response.success();  
});


//////////////
//// UPDATE Nb Photos, Nb Likes, Nb Comments for the event of the Photo
//////////////

Parse.Cloud.beforeSave("Photo", function(request, response) {

	//Photo does not exists
	if (!request.object.existed()) {

		//Get the event
		var query = new Parse.Query("Event");
		query.equalTo("objectId", request.object.get("event").id);

		query.find().then(function(events) {
		  events[0].increment("nb_photos");
		  if (request.object.get("comments")) {
		  	events[0].increment("nb_comments");
		  }
		  return events[0].save();
		 
		}).then(function(event) {
			request.user.set("last_upload", new Date());
			return request.user.save();
		}).then(function(event) {
		 	response.success();
		},function(error){
			response.success();
		});
	
	}

	///
	// Photo exists (take a look at the comments or likes)
	///

	else{
		//One more comments (no way to remove one for the moment)
		if (request.object.dirty("comments")) {
			console.log("COMMENTS HAVE CHANGED");

			//Increment number of comments
			var query = new Parse.Query("Event");
			query.equalTo("objectId", request.object.get("event").id);

			query.find().then(function(events) {
			  events[0].increment("nb_comments");
			  return events[0].save();
			 
			}).then(function(event) {
			  response.success();
			 
			},function(error){
				response.success();
			});
		}

		//Nb like changed, one more or one less ?
		else if(request.object.dirty("likes")){
			console.log("LIKES HAVE CHANGED");

			var increment = true;

			var queryPhoto = new Parse.Query("Photo");
			queryPhoto.equalTo("objectId", request.object.id);
			queryPhoto.find().then(function(photos){
				var photo = photos[0];

				//First like
				if (!photo.get("likes")) {
					increment = true;
				}
				//One like have been removed
				else if (photo.get("likes").length>request.object.get("likes").length) {
					increment = false;
				}

				var query = new Parse.Query("Event");
				query.equalTo("objectId", request.object.get("event").id);
				return query.find();
				
			}).then(function(events){
				if (increment) {
					request.object.increment("nb_likes");
					console.log("INCREMENT LIKE");
					events[0].increment("nb_likes");
				}
				else{
					request.object.increment("nb_likes", -1);
					console.log("DECREMENT LIKE");
					events[0].increment("nb_likes", -1);
				}
				
				return events[0].save();
			 
			}).then(function(event) {
			  response.success();
			 
			}, function(error){
				console.log("ERROR : "+error.message);
				response.success();
			});
		}
		else{
			response.success();
		}

		
	}
});

///
// Remove one to the photos count of the event when we remove one photos
///

Parse.Cloud.afterDelete("Photo", function(request) {
   console.log("Nombre de comments en moins : "+request.object.get("comments").length);

   var query = new Parse.Query("Event");
	query.equalTo("objectId", request.object.get("event").id);

	query.find().then(function(events) {
			events[0].increment("nb_comments", -(request.object.get("comments").length));
			events[0].increment("nb_likes", -(request.object.get("likes").length));
			events[0].increment("nb_photos", -1);
			return events[0].save();
			 
		}).then(function(event) {
			console.log("succes");
			 
		},function(error){
			console.error("Problem modifying nb when delete photo : "+error.message);
		});

});












