var eventParseObjectVar ;
var photoAdded = 0;
var photoToAdd = 0;

var photoToAddArrayFiles =[];

var currentUser;

var photoAddedObject ;


/*************************************
   vérification user logué ou non
*************************************/
function isUserConnected(){
	
    FB.getLoginStatus(function(response) {
		console.log("fb response : ");
		
		//check si le user a deja accepté l'appli Woovent
		if (response.status === 'connected') {
			//on cache le bouton login on affiche le logout
			$(".btn-login").hide();
			$(".btn-logged-in").show();
			
			
			console.log("\n ***** User already connected to Facebook! ***** \n");
			
			//on regarde si il existe en base
			var queryCheckUser = new Parse.Query(Parse.User);
			
			queryCheckUser.equalTo("facebookId",response.authResponse.userID);
			
			//on verif si existe
			queryCheckUser.first({
	
				success: function(result) {
					if(result){	
						currentUser = result ;	
						initJS();
							mixpanel.identify(result.id);
							mixpanel.people.set({
								"Parse Id": result.id,
							});
							mixpanel.track(
							    "WebSession",
							    { "Source": "EventView" }
							);
						
					}	
					//si il n'y a pas de resultat (user deja accepté l'appli mais plus de compte
					else{
						console.log("le user a deja accepté l'appli mais n'a pas de compte en base");
						fblogin();
						
					
					}
				
				},
			  error: function(error) {
					console.log('\n  !!!!! Echec de la verification si User exist !!!!! \n ');   
			  }
			  
		});	
			
			
			
			
		}
		else {
			//si il n'est pas loggué on ne fait rien car on a besoins du clic pour ouvrir la pop up Facebook
			console.log("le user n'a pas accepté l'appli pour le moment on attend qu'il se logg");
			//$('.container').hide();
			//on affiche la pop up de login à Facebook
			$('#needFbLogin').modal('show');
			initJS();
			
			
		}
	});	
	


}
/*************************************
   connexion ou creation de compte
*************************************/
function fblogin() {
//on appel le login de parse et demande les bonnes autorisations
Parse.FacebookUtils.logIn("email,user_events,user_birthday,user_location,user_likes,user_friends", {
	  success: function(user) {
	  
	  	mixpanel.identify(user.id);
	  	mixpanel.people.set({
			"Parse Id": user.id,
		});
	  	mixpanel.track(
		    "WebSession",
		    { "Source": "EventView" }
		);
	  
	  	//si le user nexistait pas on le crée
	    if (!user.existed()) {
	      console.log("\n ***** User signed up and logged in through Facebook! ***** \n");
	      
	      createUserAccount(user);
	      mixpanel.track(
		    "CreatedAccountWeb",
		    { "Source": "Lookback" }
		  );
		
	    } else {
	      console.log("\n ***** User logged in through Facebook! ***** \n");
	      currentUser = user ;
	      
	      mixpanel.track(
		    "LogginWeb",
		    { "Source": "Lookback" }
		  );

	    }
	    //on masque la pop up de login à Facebook
		$('#needFbLogin').modal('hide');
	    
	    //on cache le bouton login on affiche le logout
	    $(".btn-login").hide();
		$(".btn-logged-in").show();
	  },
	  error: function(user, error) {
	    console.log("\n !!!!! User cancelled the Facebook login or did not fully authorize. !!!!! \n");
	    //on affiche la pop up de login à Facebook
		$('#needFbLogin').modal('show');
		//on affiche un message d'erreur
		$('.fbConnectionError').show();
	  }
	});

}

/*************************************
   connexion ou creation de compte
*************************************/
function logoutUser() {

Parse.User.logOut();

$(".btn-login").show();
$(".btn-logged-in").hide();

$(".container").hide();

window.location.href = "https://www.woovent.com/";
}

/*************************************
   mise à jour des infos du user
*************************************/
function createUserAccount(parseCurrentUser){
	
	//on va recup les infos
	FB.api("/me", function(response) {
		
		    // do stuff with the user
		    if (response.email){
		    	parseCurrentUser.set("email",response.email);
		    	mixpanel.people.set({
					"email": response.email,
				});
		    }
		    
		    if (response.id){
		    	parseCurrentUser.set("facebookId",response.id);
		    	//on génère l'url de la photo
		    	var userPhotoUrl = "https://graph.facebook.com/" + response.id + "/picture?type=large&return_ssl_resources=1";
		    	parseCurrentUser.set("pictureURL", userPhotoUrl);
		    	mixpanel.people.set({
					"Profile Picture": userPhotoUrl,
				});
		    }
		    
		    if (response.first_name){
		    	parseCurrentUser.set("first_name",response.first_name);
		    	mixpanel.people.set({
					"First Name": response.first_name,
				});
		    }
		    
		    if (response.last_name){
		    	parseCurrentUser.set("last_name",response.last_name);
		    	mixpanel.people.set({
					"Last Name": response.last_name,
				});
		    }
		    
		    if (response.name){
		    	parseCurrentUser.set("name",response.name);
		    	mixpanel.people.set({
					"$name": response.name,
				});
		    }
		    
		    if (response.devices){
		    	parseCurrentUser.set("devices",response.devices);

		    }
		    
		    if (response.location){
		    	parseCurrentUser.set("location",response.location.name);
		    	mixpanel.people.set({
					"Location": response.email,
				});
		    }
		    if (response.gender){
		    	parseCurrentUser.set("gender",response.gender);
		    	//on set le genre du user pour le shareToSee
		    	currentUserGender = response.gender;
		    	mixpanel.people.set({
					"Gender": response.gender,
				});
		    }
		    
		    if (response.birthday){
		    	parseCurrentUser.set("birthday",response.birthday);
		    	mixpanel.people.set({
					"Birthday": response.birthday,
				});
		    }
		    			
			parseCurrentUser.save(null, {
				  success: function(parseUserSaved) {
				  
				  	currentUser = parseUserSaved;
				  
				    // Execute any logic that should take place after the object is saved.
				    console.log('\n ***** User information update with success **** \n');
				    

					initJS();

				  },
				  error: function(parseUserSaved, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    console.log('\n !!!!! Failed to create new object, with error code: !!!!! \n ' + error.description);
				  }
				});	
	
	});


}



/*************************************
   initialisation à la fin du chargement de la page
*************************************/
function initJS() {
	$('.container').show();

	//on va fixer la taille des div des photos
	setDivHeight();
	
	//on va récupérer les infos sur l'event à afficher
	getEventInformation();
	

	
}


/*************************************
   on fixe les tailles des divs des photos
*************************************/
function setDivHeight () {

	var divImageWidth = $(".event-name").width();
	divImageWidth = (divImageWidth / 2) + 40;
	$(".button-image").height(divImageWidth);
	
	var divImageWidth = $(".event-name").width();
	divImageWidth = (divImageWidth / 2) - 20;
	$(".photo-container").height(divImageWidth);
	divImageWidth += 40;
	$(".imageDiv").height(divImageWidth);
	
	
	
	//on calcul le margin pour centrer
	var realDivImageHeight = $(".cover-picture").height();
	var initialImageHeight = $(".cover-image-img").height();
	var initialImageWidth = $(".cover-image-img").width();
	
	//on calcul le ratio
	var ratioResize = realDivImageHeight / initialImageHeight;
	
	//on set le margin et on fait plus petit - plus grand pour l'avoir en negatif
	var marginToCenter = ( realDivImageHeight - initialImageHeight) / 2 ;
	
	$(".cover-image-img").css('margin-top',marginToCenter);
}

/*************************************
   on récupère les infos sur l'event
*************************************/
function getEventInformation () {
	
  	//on recup la start date sur le serveur
	var Event = Parse.Object.extend("Event");
	var queryEventInfo = new Parse.Query(Event);
	
	// on recup les infos en base de levent qui a le meme id facebook
	queryEventInfo.get(urlEventId, {
  		success: function(eventParseObject) {
	  		//on va récupérer les photos de l'event
	  		getPictureOfTheEvent(eventParseObject);
  			
  			//on affiche les infos de levent (cover + nom)
  			printEventInfo(eventParseObject);
  			
  			eventParseObjectVar = eventParseObject;
	  	},
	  	error: function(object, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and description.
		    console.log("ERROR to find the event Informations");
		}
	});
	

	
	
}

/*************************************
   on récupère les photos de l'event
*************************************/
function getPictureOfTheEvent (eventParseObject) {

	 //on creer la requete pour verif si existe sur le serveur
	 var Photo = Parse.Object.extend("Photo");
	 var queryGetPhoto = new Parse.Query(Photo);
	 
	 //on verifie sil existe en base un event avec le meme facebook id
	 queryGetPhoto.equalTo("event", eventParseObject);
	 queryGetPhoto.limit(1000);
	 queryGetPhoto.descending("updatedAt");
	 
	 //on va recuperer les photos
	 queryGetPhoto.find({
			 success: function(imgParseObjectArray) {
			 
			 	var totalPhotoCount = imgParseObjectArray.length;
			 	$(".login-count-photo").empty();
			 	$(".login-count-photo").append(totalPhotoCount);
			 	
			 	printEventPicture(imgParseObjectArray);
			 
			 },
			 error : function(error){
				console.log("ERROR to find the picture of the event "); 
			 }
	});
	 
}

/*************************************
   on affiche les infos de l'event
*************************************/
function printEventInfo (eventParseObject) {

	
	//si il y a une cover
	if(eventParseObject.attributes.cover){
		$(".cover").append("<img src=\"" + eventParseObject.attributes.cover + "\" class=\"cover-image-img\" >");
	}
	
	//si il n'y a pas de cover on en met une par défaut
	else{
		$(".cover").append("<img src=\"https://www.woovent.com/images/base-top.jpg\" class=\"cover-image-img\" >");
	}
	 
	//on ajoute le nom
	if(eventParseObject.attributes.name){
			$(".event-name-login").empty();
			$(".event-name-login").append(eventParseObject.attributes.name);
			
			$(".event-name").empty();
			$(".event-name").append(eventParseObject.attributes.name);
			
	}
	else {
		$(".event-name-login").append("");
		
		$(".event-name").empty();
		$(".event-name").append("Non Défini");
	}

var userLang = navigator.language || navigator.userLanguage; 

if (userLang == "fr"){

	//on converti la date de debut en une phrase francaise
	if(eventParseObject.attributes.start_time){
		var eventStartDay = eventParseObject.attributes.start_time.getDay();
		var eventStartMonth= eventParseObject.attributes.start_time.getMonth();
		var frenchEventBeginDay = getFrenchDay(eventStartDay);
		var frenchEventbeginMonth = getFrenchMonth(eventStartMonth);
		var eventStartDayFrench = frenchEventBeginDay + " " + eventParseObject.attributes.start_time.getDate() +" "+ frenchEventbeginMonth;
		var eventStartHourFrench = eventParseObject.attributes.start_time.getHours() + " heures ";
		
		var eventStartDate = eventStartDayFrench ;
	}

}else {

	//on converti la date de debut en une phrase anglaise
	if(eventParseObject.attributes.start_time){
		var eventStartDay = eventParseObject.attributes.start_time.getDay();
		var eventStartMonth= eventParseObject.attributes.start_time.getMonth();
		var englishEventBeginDay = getEnglishDay(eventStartDay);
		var englishEventbeginMonth = getEnglishMonth(eventStartMonth);
		var eventStartDayEnglish = englishEventBeginDay + ", " + englishEventbeginMonth + " " + eventParseObject.attributes.start_time.getDate();
		var eventStartHourEnglish = eventParseObject.attributes.start_time.getHours() + " heures ";
		if(eventParseObject.attributes.start_time.getHours() > 12) {
			var eventStartHourEnglishNew = eventParseObject.attributes.start_time.getHours() - 12;
			var eventStartHourEnglish = eventStartHourEnglishNew + " pm ";
		} else {
			var eventStartHourEnglish = eventParseObject.attributes.start_time.getHours() + " am ";
		}
	var eventStartDate = eventStartDayEnglish ;
	
	}

}

	//on ajoute la date
	if(eventParseObject.attributes.start_time){
			
		$(".event-date").empty();
		$(".event-date").append(eventStartDate);
			
	}
	else {
		$(".event-date").empty();
		$(".event-date").append("Non Défini");
	}
	

}



/*************************************
   on affiche les infos de l'event
*************************************/
function printEventPicture (imgParseObjectArray) {


	

	//variable pour savoir si photo pair ou impair (1 3 ...)
	var photoPosition = 1 ;
	var photoPositionNumber = 1;
	var htmlToPrint = "";
	
	for (i=0; i< imgParseObjectArray.length; i++){
	
	
		//si c'est une image recupéré sur Facebook
		if (imgParseObjectArray[i].attributes.facebook_url_full !=null) {
			var imageSrc = imgParseObjectArray[i].get("facebook_url_full");
		}
		//si c'est une photo uploadé sur parse
		else {
			var imageSrc = imgParseObjectArray[i].get("full_image").url();
		}	
		
		//si c'est une photo pair
		if (photoPosition == 1) {
			var pairClassName = "pair-image";
			photoPosition = 0;
		}
		//si c'est une photo impair 
		else {
			var pairClassName = "impair-image";
			photoPosition = 1;
		}
		
		//si la photo est en mode portrait
		if (imgParseObjectArray[i].attributes.height > imgParseObjectArray[i].attributes.width){
			var orientationPhotoClassName = " img-portrait ";
			
			//on calcul le margin pour centrer
			var realDivImageHeight = $(".button-image").width();
			var initialImageHeight = imgParseObjectArray[i].attributes.height;
			var initialImageWidth = imgParseObjectArray[i].attributes.width;
			
			//on calcul le ratio
			var ratioResize = realDivImageHeight / initialImageWidth;
			
			//on set le margin et on fait plus petit - plus grand pour l'avoir en negatif
			var marginToCenter = ( realDivImageHeight - (initialImageHeight * ratioResize)) / 2 ;
			var marginToCenterText = " margin-top : " + marginToCenter + "px;";
			
		}
		//si elle est carré on rajoute aussi paysage en plus du portrait
		else if (imgParseObjectArray[i].attributes.height == imgParseObjectArray[i].attributes.width){
			var orientationPhotoClassName = " img-paysage img-portrait ";
			var marginToCenterText = "";
		}
		//si  elle est en paysage 
		else {
			var orientationPhotoClassName = " img-paysage ";
			
			//on calcul le margin pour centrer
			var realDivImageWidth= $(".button-image").width();
			var initialImageWidth = imgParseObjectArray[i].attributes.width;
			var initialImageHeight = imgParseObjectArray[i].attributes.height;
			
			//on calcul le ratio
			var ratioResize = realDivImageWidth / initialImageHeight;
			
			//on set le margin et on fait plus petit - plus grand pour l'avoir en negatif
			var marginToCenter = ( realDivImageWidth - (initialImageWidth * ratioResize)) / 2 ;
			var marginToCenterText = " margin-left : " + marginToCenter + "px;";

		}
		
		//on va récupérer les likes si il y en a
		var nblikes = 0;
		var hasCurrentUserLikeThePicture = false;
		if(imgParseObjectArray[i].attributes.likes){
			nblikes = imgParseObjectArray[i].attributes.likes.length;
		}
		
		//on va récupérer les comments si il y en a
		var nbcomments = 0;
		if(imgParseObjectArray[i].attributes.comments){
			nbcomments = imgParseObjectArray[i].attributes.comments.length;
		}
		
		//on regarde si il a deja like la photo
		if(imgParseObjectArray[i].attributes.likes && currentUser){
			
			//on parcours le tableau de like
			for (j = 0; j < imgParseObjectArray[i].attributes.likes.length ; j++){
				//si on trouve un like avec le même id que le current user
				if (imgParseObjectArray[i].attributes.likes[j].id == currentUser.id){
					hasCurrentUserLikeThePicture = true;
				}
			}
			
		}
		
		

		htmlToPrint = '';	
			htmlToPrint += '<a href=\"#\" onclick=\"openIframe(this.id) \" onload="\loadedIframe()\" id=\"' + imgParseObjectArray[i].id  + '\" >';
			htmlToPrint += '<div class=\"col-xs-6 col-sm-6 col-md-3 col-lg-3 image-div-wrapper\">';
			
			htmlToPrint += '<div class=\" imageDiv '+ pairClassName +'\">';
			
			//htmlToPrint += '<div class=\"titlePicture hidden-xs \">  Titre de la photo  <\/div>';
			
			htmlToPrint += '<div class=\"photo-container  ' + orientationPhotoClassName +'\" style=\"\"><img src=\"' + imageSrc + '\" class=\" uhu \" style=\"' + marginToCenterText +'\"><\/div>'
			
			htmlToPrint += '<div class=\"likePicture \" style=\"  \" > ';
			
			//htmlToPrint += '<a onclick=\"likeButtonPicture(this.id)\" id=\"' + imgParseObjectArray[i].id  + '\">';
			
			//si il a deja like la photo
			if (hasCurrentUserLikeThePicture == true){
				htmlToPrint += '<i class=\"icon-heart\" style=\"color : #d95454;\"><\/i>'
			} else {
				htmlToPrint += '<i class=\"icon-heart\" style=\"color : #d95454;\"><\/i>'
			}
			
			//htmlToPrint += '<\/a>';
			htmlToPrint += ' <span class=\"nbLikePhotoId' + imgParseObjectArray[i].id + '\"> &nbsp '+ nblikes + '<\/span> &nbsp; &nbsp; &nbsp; &nbsp; <i class=\"icon-comment\" style=\"color : white;\"><\/i>  <span class=\"nbChatPhotoId\"> &nbsp ' + nbcomments ;
			
			htmlToPrint += 	'<\/div><\/div><\/div><\/a>';
					
		//si c'est les 2 premieres photo on les met entre les deux boutons
		if (photoPositionNumber < 3) {
			$(".image-between").append(htmlToPrint);
		}
		//si c'est superieur on affiche en dehors
		else {
			$(".image-out").append(htmlToPrint);
		}
		photoPositionNumber++;
		
		
		htmlToPrint = "";
			
		
	}
	
	setDivHeight ();
	resizeImg();
	
	$(".loading-div").hide();


}


/*************************************
   on affiche le centre des images
*************************************/
function resizeImg (){

	$('.img-portrait img').animate({'width':'=100%'}, 0);
	$('.img-paysage img').animate({'height':'=100%'}, 0);
}



/*************************************
   on detect l'ajout de photos à uploader
*************************************/
function addPhotoFromBrowser (isFromMobile){
	
	if(isFromMobile ==  true){
		var inputId = "#file-input-mobile"
	}
	else {
		var inputId = "#file-input"
	}
	
	//on affiche les bonnes infos dans la pop up
	$("#photoLoading").show();
	$("#shareLink").hide();
	
	//si il y a au moins une photo
	if ($(inputId)[0].files.length > 0){
	
		photoAdded = 0;
		//on affiche la modal
		$('#uploadPicture').modal('show');
	
		photoToAddArrayFiles = $(inputId)[0].files;
				
		photoToAdd = photoToAddArrayFiles.length;
		
		var htmlCountToPrint = "1 / " + photoToAdd;
		$(".loading-photo-count").empty();
		$(".loading-photo-count").append(htmlCountToPrint);
				
		console.log ("coucou on est là");
				
		savePicture(photoToAddArrayFiles[photoAdded]);
		
	}   	

}

/*************************************
   on detect l'ajout de photos à uploader
**************************************/

function savePicture(photoToAddArray) {
	
		
    // MegaPixImage constructor accepts File/Blob object.
    var mpImg = new MegaPixImage(photoToAddArray);
    

    EXIF.getData(photoToAddArray, function() {
        var orientationPic = EXIF.getTag(this, "Orientation");
    
		if (orientationPic != "") {
		// Render resized image into image element using quality option.
	    // Quality option is valid when rendering into image element.
	    
	    var resPreview = document.getElementById('resPreview');
	    mpImg.render(resPreview, { maxWidth: 600, maxHeight: 600, quality: 0.8 , orientation : orientationPic});
	    
	 	    		//on cree la photo low size
				    // Render resized image into canvas element.
				    var resCanvasFull = document.getElementById('resultCanvasFull');
				    var resCanvasLow = document.getElementById('resultCanvasLow');
				    
				    $.when(mpImg.render(resCanvasLow, { maxWidth: 200, maxHeight: 200, quality: 0.6 , orientation : orientationPic })).done(function(){
						setTimeout(function() 
						{
						 $.when(mpImg.render(resCanvasFull, { maxWidth: 1000, maxHeight: 1000, quality: 0.8, orientation : orientationPic })).done(function(){
							setTimeout(function() 
							{
							saveThePicture(photoToAddArray);
							},500);
							});
						},500);
						});
		
		}
		//si il y a pas d'orientation particulière
		else {
				// Render resized image into image element using quality option.
	    // Quality option is valid when rendering into image element. 
	    
	    var resPreview = document.getElementById('resPreview');
	    mpImg.render(resPreview, { maxWidth: 600, maxHeight: 600, quality: 0.8 });
	    
	 	    		//on cree la photo low size
				    // Render resized image into canvas element.
				    var resCanvasFull = document.getElementById('resultCanvasFull');
				    var resCanvasLow = document.getElementById('resultCanvasLow');
				    
				    $.when(mpImg.render(resCanvasLow, { maxWidth: 200, maxHeight: 200, quality: 0.6  })).done(function(){
						setTimeout(function() 
						{
						 $.when(mpImg.render(resCanvasFull, { maxWidth: 1000, maxHeight: 1000, quality: 0.8 })).done(function(){
							setTimeout(function() 
							{
							saveThePicture(photoToAddArray);
							},500);
							});
						},500);
						});
		}

	});			
							    
}

/*************************************
   save d'une picture
**************************************/

function saveThePicture(photoToAddArray) {
	var Photo = Parse.Object.extend("Photo");
	
	var resCanvasFull = document.getElementById('resultCanvasFull');
	var resCanvasLow = document.getElementById('resultCanvasLow');

	//on cree le file pour le photo low					
    // The resized file ready for upload
    var finalFileLow = resCanvasLow.toDataURL('image/jpeg');
    var finalFileStringLow = finalFileLow.replace("data:image/jpeg;base64,","")
    
    
    //on enregistre le file en full size (taille max à 1000px)	    
	var parseFileLow = new Parse.File("photo.jpeg", { base64: finalFileStringLow });
			
 	//on save le file
    parseFileLow.save().then(function() {
				
		    // The resized file ready for upload
		    var finalFile = resCanvasFull.toDataURL('image/jpeg');
		    var finalFileString = finalFile.replace("data:image/jpeg;base64,","")
		    //on enregistre le file en full size (taille max à 1000px)
			var parseFileFull = new Parse.File("photo.jpeg", { base64: finalFileString });
		
			//on save le file
			parseFileFull.save().then(function() {
	    
			  	// The file has been saved to Parse.
			  	var newPicture = new Photo();
			
				if (photoToAddArray.lastModifiedDate){
					var createdTimeVar = new Date(photoToAddArray.lastModifiedDate);
					newPicture.set("created_time",createdTimeVar);
				}
				
				//file full image
				if (parseFileFull){
					newPicture.set("full_image",parseFileFull);
				}
				//file low image
				if (parseFileLow){
					newPicture.set("low_image",parseFileLow);
				}
				//prospect ou user
				if (currentUser){
					newPicture.set("user",currentUser);
				}

				
				if (resCanvasFull.height){
				 newPicture.set("height",resCanvasFull.scrollHeight);
				}
				if (resCanvasFull.width){
				 newPicture.set("width",resCanvasFull.scrollWidth);
				}
				
				if (eventParseObjectVar){
				 newPicture.set("event",eventParseObjectVar);
				}
				
				newPicture.save(null, {
				  success: function(parsePhotoObjectSaved) {
				  			//on a ajouté une photo de plus
				  			photoAdded++;
				  			photoAddedObject = parsePhotoObjectSaved;
				
							mixpanel.track(
									    "AddAPicture",
									    { "Source": "EventView" }
							);
				
							//si on a ajouté toutes les photos
							if (photoAdded == photoToAdd){
							
								//on vide les spans d'image pour mettre les nouvelles
								$(".image-between").empty();
								$(".image-out").empty();
								
								
								//on refresh les photos
								getPictureOfTheEvent(eventParseObjectVar);
								
								//on essaye de poster un message sur Facebook
								checkPublishPermission();
								
								/*
								Parse.Cloud.run('pushnewphotos', { nbphotos: photoAdded , eventid: eventParseObjectVar.id  }, {
								  success: function(responseMail) {
								  
								  },
								  error: function(error) {
								  }
								});*/
								
								
							}
							//sinon on passe à la suivante
							else{
								var htmlCountToPrint = (photoAdded+1) + " / " + photoToAdd;
								$(".loading-photo-count").empty();
								$(".loading-photo-count").append(htmlCountToPrint);
							
								savePicture(photoToAddArrayFiles[photoAdded]);
							}


				  },
				  error: function(parsePhotoObjectSaved, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    console.log('\n !!!!! Failed to add the picture!!!!! \n ' );
				  }
				});	
			
			
		}, function(error) {
		  // The low size file either could not be read, or could not be saved to Parse.
		});	
	}, function(error) {
	  // The full file either could not be read, or could not be saved to Parse.
	}); 

}

/*************************************
   share des photos partagées sur Facebook
**************************************/

function checkPublishPermission(){
	
	
	//on verifie si le user a la permission de share
	FB.api("/me/permissions", function(response) {
	
		//si publish stream est présent est autorisé OK
		if(response.data[0].publish_stream) {
		
			if(response.data[0].publish_stream == 1){
			
				//on masque la modal si on est en refresh apres un ajout
				$('#uploadPicture').modal('hide');
			
				postLinkOnEventWall();
				
			}
			else {
				$("#photoLoading").hide();
				$("#shareLink").show();
			}
			
		}
		else {
			$("#photoLoading").hide();
			$("#shareLink").show();
			
		}

	});
	
	
}

/*************************************
   share des photos partagées sur Facebook
**************************************/

function postLinkOnEventWall(){

	var urlToShare = "http://www.woovent.com/e/" + eventParseObjectVar.id ;
	
	var userLang = navigator.language || navigator.userLanguage; 
		 	 
	if (userLang == "fr"){
		var messageToShare = "Je viens d'ajouter " + photoAdded + " photos de cet évènement. Retrouvez les toutes à cette adresse sur Woovent !" ;
	}
	else {
		var messageToShare = "I've just add " + photoAdded + " photos to this event. See all the photos at this adress on Woovent !" ;
	}
	var apiURL = "/" + eventParseObjectVar.attributes.eventId + "/feed" ;
	
	var pictureURL = photoAddedObject.attributes.full_image._url;
	
	//on fait le post
	
	FB.api(
		    apiURL ,
		    "POST",
		    {
		    	"link" : urlToShare,
		    	"message" : messageToShare,
		    	"picture" : pictureURL
		    },
		    function (response) {
		      if (response && !response.error) {
		      
		        /* handle the result */
		        $('#uploadPicture').modal('hide');
				$("#photoLoading").show();
				$("#shareLink").hide();
				$(".fbPusblishError").hide();
		        
		      }
		    }
	);
	
}

/*************************************
   ask permission to pusblish
**************************************/

function askPermissionToPublish(){

	Parse.FacebookUtils.logIn("publish_stream", {
			  success: function(user) {
				 postLinkOnEventWall();
			  },
			  error: function(user, error) {
			    console.log("\n !!!!! User cancelled the Facebook login or did not fully authorize. !!!!! \n");
			    $(".fbPusblishError").show();
			  }
	});
	
}

/*************************************
   like d'une photo
**************************************/

function likeButtonPicture(photoToLikeId) {



	//on creer la requete pour verif si existe sur le serveur
	var Photo = Parse.Object.extend("Photo");
	var queryGetPhoto = new Parse.Query(Photo);
	
	//on verifie sil existe en base un event avec le meme facebook id
	queryGetPhoto.equalTo("objectId", photoToLikeId);
	
	//on va recuperer les photos
	queryGetPhoto.first({
		 success: function(imgParseObject) {
		 	if(!imgParseObject){
		 	//il n'a rien trouve
		 	} else {
			 	
		 	
		 	var dejaLike = false;
		 	
		 	//on regarde si il a deja like la photo
			if(imgParseObject.attributes.likes && currentUser){
				//on parcours le tableau de like
				for (j = 0; j < imgParseObject.attributes.likes.length ; j++){
					//si on trouve un like avec le même id que le current user
					if (imgParseObject.attributes.likes[j].id == currentUser.id){
						unlikeThePicture(imgParseObject,j);
						var dejaLike = true;
						
					}
				}
				
			}
			
			//si il avait pas deja liké alors on like
			if(dejaLike == false){
				likeThePicture(imgParseObject);
			}
			
		 }
		 },
		 error : function(error){
			console.log("ERROR to find the picture of the event "); 
		 }
	});
	 
}

/*************************************
   like d'une photo
**************************************/

function numberOflikeThePicture(imgParseObject, numberOfLike) {
 	
 	//on change le nombe de like
 	var photoLikeSpanClass = ".nbLikePhotoId" + imgParseObject.id ;
 	$(photoLikeSpanClass).empty();
 	
 	$(photoLikeSpanClass).append('&nbsp; '+ numberOfLike );
 	
 	mixpanel.track(
		"LikeAPicture",
		{ "Source": "EventView" }
	);

}


/*************************************
   comment d'une photo
**************************************/
function numberOfCommentThePicture(imgParseObject, numberOfComment) {
 	
 	//on change le nombe de like
 	var photoChatSpanClass = ".nbChatPhotoId" + imgParseObject.id ;
 	$(photoChatSpanClass).empty();
 	
 	$(photoChatSpanClass).append('&nbsp; '+ numberOfComment );
 	
 	mixpanel.track(
		"CommentAPicture",
		{ "Source": "EventView" }
	);

}



/*************************************
on affiche les infos de levent
**************************************/

function printEventDescription() {


var userLang = navigator.language || navigator.userLanguage; 

if (userLang == "fr"){

	//on converti la date de debut en une phrase francaise
	if(eventParseObjectVar.attributes.start_time){
		var eventStartDay = eventParseObjectVar.attributes.start_time.getDay();
		var eventStartMonth= eventParseObjectVar.attributes.start_time.getMonth();
		var frenchEventBeginDay = getFrenchDay(eventStartDay);
		var frenchEventbeginMonth = getFrenchMonth(eventStartMonth);
		var eventStartDayFrench = frenchEventBeginDay + " " + eventParseObjectVar.attributes.start_time.getDate() +" "+ frenchEventbeginMonth;
		var eventStartHourFrench = eventParseObjectVar.attributes.start_time.getHours() + " heures ";
		
		var eventStartDate = eventStartDayFrench + " à " + eventStartHourFrench;
	}


	
	if(eventParseObjectVar.attributes.end_time){
		var eventEndDay = eventParseObjectVar.attributes.end_time.getDay();
		var eventEndMonth = eventParseObjectVar.attributes.end_time.getMonth();
		var frenchEventEndDay = getFrenchDay(eventEndDay);
		var frenchEventendMonth = getFrenchMonth(eventEndMonth);
		var eventEndDayFrench = frenchEventEndDay + " " + eventParseObjectVar.attributes.end_time.getDate() + " " + frenchEventendMonth ;
		var eventEndHourFrench = eventParseObjectVar.attributes.end_time.getHours() + " heures ";
	
		var eventEndDate = eventEndDayFrench + " à " + eventEndHourFrench;
	}

}else {

	//on converti la date de debut en une phrase anglaise
	if(eventParseObjectVar.attributes.start_time){
		var eventStartDay = eventParseObjectVar.attributes.start_time.getDay();
		var eventStartMonth= eventParseObjectVar.attributes.start_time.getMonth();
		var englishEventBeginDay = getEnglishDay(eventStartDay);
		var englishEventbeginMonth = getEnglishMonth(eventStartMonth);
		var eventStartDayEnglish = englishEventBeginDay + ", " + englishEventbeginMonth + " " + eventParseObjectVar.attributes.start_time.getDate();
		if(eventParseObjectVar.attributes.start_time.getHours() > 12) {
			var eventStartHourEnglishNew = eventParseObjectVar.attributes.start_time.getHours() - 12;
			var eventStartHourEnglish = eventStartHourEnglishNew + " pm ";
		} else {
			var eventStartHourEnglish = eventParseObjectVar.attributes.start_time.getHours() + " am ";
		}
	var eventStartDate = eventStartDayEnglish + " at " + eventStartHourEnglish;
	
	}
	
	if(eventParseObjectVar.attributes.end_time){
		var eventEndDay = eventParseObjectVar.attributes.end_time.getDay();
		var eventEndMonth = eventParseObjectVar.attributes.end_time.getMonth();
		var englishEventEndDay = getEnglishDay(eventEndDay);
		var englishEventendMonth = getEnglishMonth(eventEndMonth);
		var eventEndDayEnglish = englishEventEndDay + ", " + englishEventendMonth + " " +eventParseObjectVar.attributes.end_time.getDate() ;
		if(eventParseObjectVar.attributes.end_time.getHours() > 12) {
			var eventEndHourEnglishNew = eventParseObjectVar.attributes.end_time.getHours() - 12;
			var eventEndHourEnglish = eventEndHourEnglishNew + " pm ";
		} else {
			var eventEndHourEnglish = eventParseObjectVar.attributes.end_time.getHours() + " am ";
		}
		
	var eventEndDate = eventEndDayEnglish + " at " + eventEndHourEnglish;
	}

}


$('#eventInformation').modal('show');

$('.eventName').empty();
if(eventParseObjectVar.attributes.name){
	$('.eventName').append(eventParseObjectVar.attributes.name);	
}else {
	$('.eventName').append("Non Défini");	
}


$('.eventStartDate').empty();
if(eventParseObjectVar.attributes.start_time){
	$('.eventStartDate').append(eventStartDate);	
}else {
	$('.eventStartDate').append("Non Défini");	
}

$('.eventEndDate').empty();
if(eventParseObjectVar.attributes.end_time){
	$('.eventEndDate').append(eventEndDate);	
}else {
	$('.eventEndDate').append("Non Défini");	
}

$('.eventDescription').empty();
if(eventParseObjectVar.attributes.description){
	$('.eventDescription').append(eventParseObjectVar.attributes.description);	
}else {
	$('.eventDescription').append("Non Défini");	
}

$('.eventVenue').empty();
if(eventParseObjectVar.attributes.location){
	$('.eventVenue').append(eventParseObjectVar.attributes.location);	
}else {
	$('.eventVenue').append("Non Défini");	
}

$('.eventURL').empty();
if(eventParseObjectVar.attributes.eventId){
	$('.eventURL').append("<a href='//www.facebook.com/"+ eventParseObjectVar.attributes.eventId + "' target=\"_blank\" > http://www.facebook.com/"+ eventParseObjectVar.attributes.eventId + "<\/a>");	
}else {
	$('.eventURL').append("Non Défini");	
}



}


/****************************************************
  recup en francais du jour
*****************************************************/
function getFrenchMonth(eventMonth){
	if (eventMonth == 0){
		return "Janvier";
	}
	if (eventMonth == 1){
		return "Fevrier";
	}
	if (eventMonth == 2){
		return "Mars";
	}
	if (eventMonth == 3){
		return "Avril";
	}
	if (eventMonth == 4){
		return "Mai";
	}
	if (eventMonth == 5){
		return "Juin";
	}
	if (eventMonth == 6){
		return "Juillet";
	}
	if (eventMonth == 7){
		return "Aout";
	}
	if (eventMonth == 8){
		return "Septembre";
	}
	if (eventMonth == 9){
		return "Octobre";
	}
	if (eventMonth == 10){
		return "Novembre";
	}
	else {
		return "Decembre";
	}
}

/****************************************************
  recup en francais du jour
*****************************************************/
function getFrenchDay(eventDay){
	if (eventDay == 0){
		return "Dimanche";
	}
	if (eventDay == 1){
		return "Lundi";
	}
	if (eventDay == 2){
		return "Mardi";
	}
	if (eventDay == 3){
		return "Mercredi";
	}
	if (eventDay == 4){
		return "Jeudi";
	}
	if (eventDay == 5){
		return "Vendredi";
	}
	else {
		return "Samedi";
	}
}

/****************************************************
  recup en francais du jour
*****************************************************/
function getEnglishMonth(eventMonth){
	if (eventMonth == 0){
		return "January ";
	}
	if (eventMonth == 1){
		return "February";
	}
	if (eventMonth == 2){
		return "March ";
	}
	if (eventMonth == 3){
		return "April";
	}
	if (eventMonth == 4){
		return "May";
	}
	if (eventMonth == 5){
		return "June";
	}
	if (eventMonth == 6){
		return "July";
	}
	if (eventMonth == 7){
		return "August";
	}
	if (eventMonth == 8){
		return "September";
	}
	if (eventMonth == 9){
		return "October";
	}
	if (eventMonth == 10){
		return "November";
	}
	else {
		return "December";
	}
}
/****************************************************
  recup en francais du jour
*****************************************************/
function getEnglishDay(eventDay){
	if (eventDay == 0){
		return "Sunday";
	}
	if (eventDay == 1){
		return "Monday";
		
	}
	if (eventDay == 2){
		return "Tuesday";
		
	}
	if (eventDay == 3){
		return "Wednesday";
		
	}
	if (eventDay == 4){
		return " Thursday";
		
	}
	if (eventDay == 5){
		return "Friday";
		
	}
	else {
		return "Saturday";
	}
}


/****************************************************
  ouverture d'une frame
*****************************************************/
function openIframe(imageId){

	//on place les fleche suivant / precedent au milieu de l'ecran
	var windowVisibleHeight = $( window ).height();
	windowVisibleHeight = windowVisibleHeight / 2;
	$(".next-button-iframe").css('top',windowVisibleHeight);
	$(".previous-button-iframe").css('top',windowVisibleHeight);

	var iframeSrc = "//www.woovent.com/p/" + imageId;

	$(".iframe-img").attr("src", iframeSrc);
	$(".ifram-content").fadeIn();

	$("body").css('overflow','hidden');
	
	loadedIframe();
	
	mixpanel.track(
		"PrintAPicture",
		{ "Source": "EventView" }
	);

}

/****************************************************
  Fermeture d'une iframe
*****************************************************/
function closeIframe(){
	
	$(".ifram-content").hide();

	$(".iframe-img").attr("src", "");

	$("body").css('overflow','auto');
	
}

 
/****************************************************
  iFrame loadé
*****************************************************/
function loadedIframe(){
	//on set la taille de l'iframe
	$(".iframe-img").height($(".iframe-img").height());
	
	//on met l'overlay à toutes la taille du body et pas juste la partie visible
	$(".ifram-content").height($("body").height());
	
	//si on est sur un petit écran
	if(window.innerWidth <= 800 ) {
	     $(".iframe-img").css('left','1%');
	     $(".iframe-img").css('width','98%');
	     
	} 
	
}

/****************************************************
  affiche la photo precedente
*****************************************************/
function previousIframe() {
	
	
}


/****************************************************
  affiche la photo suivante
*****************************************************/
function nextIframe() {
	
	
}



