var photoToAdd = 0;
var photoAdded = 0;
var eventToFetch = 0;
var eventFetched = 0;

var newPhotoToCheckArrayFBId = [];
var newPhotoToCheckArrayObject = [];

var eventFetchedPourcent;

var eventEstimatedEndTime;
var eventBeginTime

var currentUser;

//tableau des objects event
var eventArrayObjectToFetch = [];

var todayDate = new Date(Date.now());

var eventFetchedAndPrint = 0;

var eventArrayToRetrievePicture = new Array();

eventArrayToRetrievePicture['eventParseObject'] = new Array();
eventArrayToRetrievePicture['eventStartDate'] = new Array();
eventArrayToRetrievePicture['eventEndDate'] = new Array();

var eventBeingPrinting = 0;

/*************************************
   vérification user logué ou non
*************************************/
function isUserStillConnected(){
	var currentUser = Parse.User.current();
	
		FB.getLoginStatus(function(response) {
		//check si le user est deja loggue
			if (response.status === 'connected') {
				//on cache le bouton login on affiche le logout
				$(".btn-login").hide();
				$(".btn-logged-in").show();
				// user logged in and linked to app
				// handle this case HERE
				console.log("\n ***** User already connected to Facebook! ***** \n");
				
				var userAlreadyExist = true;
				updateUserInfoLogin(userAlreadyExist);
				
			}
			else {
				fblogin();
			}
		});	
}

/*************************************
   connexion ou creation de compte
*************************************/
function fblogin() {
	//on appel le login de parse et demande les bonnes autorisations
	Parse.FacebookUtils.logIn("user_likes,email,user_events,user_about_me,user_birthday,user_location,user_photos,friends_photos", {
	  success: function(user) {
	    if (!user.existed()) {
	      console.log("\n ***** User signed up and logged in through Facebook! ***** \n");
	      var userAlreadyExist = false;
	      //on cache le bouton login on affiche le logout
	      $(".btn-login").hide();
		  $(".btn-logged-in").show();
		  //on update les infos du new user
	      updateUserInfoLogin(userAlreadyExist);
	    } else {
	      console.log("\n ***** User logged in through Facebook! ***** \n");
	      var userAlreadyExist = true;
	      //on cache le bouton login on affiche le logout
	      $(".btn-login").hide();
		  $(".btn-logged-in").show();
		  //on update les infos de l'existing user
	      updateUserInfoLogin(userAlreadyExist);
	    }
	  },
	  error: function(user, error) {
	    console.log("\n !!!!! User cancelled the Facebook login or did not fully authorize. !!!!! \n");
	  }
	});

}

/*************************************
   mise à jour des infos du user
*************************************/
function updateUserInfoLogin(userAlreadyExist){
	var currentUser = Parse.User.current();
	
	//on va recup les infos
	FB.api("/me", function(response) {
		if (currentUser) {
			
		    // do stuff with the user
		    if (response.email){
		    	currentUser.set("email",response.email);
		    }
		    if (response.id){
		    	currentUser.set("facebookId",response.id);
		    }
		    if (response.first_name){
		    	currentUser.set("first_name",response.first_name);
		    }
		    if (response.last_name){
		    	currentUser.set("last_name",response.last_name);
		    }
		    if (response.name){
		    	currentUser.set("name",response.name);
		    }
		    if (response.location){
		    	currentUser.set("location",response.location.name);
		    }
		    if (response.gender){
		    	currentUser.set("gender",response.gender);
		    }
		    if (response.birthday){
		    	currentUser.set("birthday",response.birthday);
		    }
			
			currentUser.save(null, {
				  success: function(currentUser) {
				    // Execute any logic that should take place after the object is saved.
				    console.log('\n ***** User information update with success **** \n');

				  },
				  error: function(currentUser, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    console.log('\n !!!!! Failed to create new object, with error code: !!!!! \n ' + error.description);
				  }
				});
		    
		} else {
		    // show the signup or login page
		    fblogin();
		    
		}	
	
	});
	
	//SI LE USER EXISTAIT DEJA
	if (userAlreadyExist == true)
	{
		console.log("utilisateur existait déjà");
		beginLoadJS();
			
	}
	
	
	
	// SI LE USER NEXISTAIT PAS ET A ETE CREE
	else {
		console.log("utilisateur n'existait pas");
		beginLoadJS();
		
	}

}


/****************************************************
   a la fin du chargement de la page pour SINGLE EVENT
*****************************************************
function beginLoadJS () {
	
	$('#selectTimeModal').modal('show');
	
		//on va recup la date de debut de levent
	  	var eventID = getEventId();
	  	
	  	//on recup la start date sur le serveur
		var Event = Parse.Object.extend("Event");
		var queryEventInfo = new Parse.Query(Event);
		
		// on recup les infos en base de levent qui a le meme id facebook
		queryEventInfo.get(eventID, {
	  		success: function(eventParseObject) {
	  		
	  			//on affiche le nom de l'event
	  			if (eventParseObject.attributes.name) {
	  				$(".nameOfTheEvent").append(eventParseObject.attributes.name);
	  			}
	  		
		  	},
		  	error: function(object, error) {
			    // The object was not retrieved successfully.
			    // error is a Parse.Error with an error code and description.
			    console.log("ERROR to find event date");
			}
	});
	
}



/****************************************************
   Afficher les 10 meilleurs Event
*****************************************************/

function beginLoadJS (){
	 currentUser = Parse.User.current();
	 
	 //on affiche la modal
	 $('#selectTimeModal').modal('show');
	 
	 //on creer la requete pour verif si existe dans la table friends
	 var Invitation = Parse.Object.extend("Invitation");
	 var queryCheckInInvitationBase = new Parse.Query(Invitation);
	 
	 queryCheckInInvitationBase.equalTo("user", currentUser);
	 queryCheckInInvitationBase.equalTo("is_memory", true);
	 queryCheckInInvitationBase.lessThan("start_time", todayDate );
	 
	 //on recupere du plus grand au plus petit
	 queryCheckInInvitationBase.descending("eventInterestRatio");
	 // on ne prend que les 10 premiers
	 queryCheckInInvitationBase.limit(10);
	 queryCheckInInvitationBase.include("event");
	 
	 queryCheckInInvitationBase.find({
		 success: function(topInvitObject) {
		 
		 	eventArrayObjectToFetch=topInvitObject;
		 
		 	$(".eventListTab").append("<table class=\"table-responsive table-striped\" style=\"\" ><thead ><tr><th class=\"\"  > &nbsp <\/th><th class=\"col-xs-4 col-sm-4 col-md-4 col-lg-4\"  > Nom des évènements &nbsp <\/th><th class=\"col-xs-3 col-sm-3 col-md-3 col-lg-3\"  > Date de Début &nbsp <\/th><th class=\"col-xs-3 col-sm-3 col-md-3 col-lg-3\"  > Date de Fin &nbsp <\/th><th class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\"  >Type <\/th><\/tr><\/thead><tbody class=\"eventList\">");
		 	
		 	
		 	
		 	for (var i=0; i<topInvitObject.length; i++){
			 		 
			 		//on recup le nom de levent
					var eventName = topInvitObject[i].attributes.event.attributes.name;
					
					//on converti la date de debut en une phrase francaise
					var eventStartDay = topInvitObject[i].attributes.start_time.getDay();
					var eventStartMonth= topInvitObject[i].attributes.start_time.getMonth();
					var frenchEventBeginDay = getFrenchDay(eventStartDay);
					var frenchEventbeginMonth = getFrenchMonth(eventStartMonth);
					var eventStartDayFrench = frenchEventBeginDay + " " + topInvitObject[i].attributes.start_time.getDate() +" "+ frenchEventbeginMonth;
					var eventStartHourFrench = topInvitObject[i].attributes.start_time.getHours() + " heures "
					
					//idem si la date de fin existe
					if (topInvitObject[i].attributes.event.attributes.end_time) {
					
						var eventEndDay = topInvitObject[i].attributes.event.attributes.end_time.getDay();
						var eventEndMonth = topInvitObject[i].attributes.event.attributes.end_time.getMonth();
						var frenchEventEndDay = getFrenchDay(eventEndDay);
						var frenchEventendMonth = getFrenchMonth(eventEndMonth);
						var eventEndDayFrench = frenchEventEndDay + " " + topInvitObject[i].attributes.event.attributes.end_time.getDate() + " " + frenchEventendMonth ;
						var eventEndHourFrench = topInvitObject[i].attributes.event.attributes.end_time.getHours() + " heures ";
						var classColor = "success-color";
					}
					
					//si il n'y avait pas de date de fin alors on met en vide
					else {
						var eventEndDayFrench = " A définir ";
						var eventEndHourFrench = "";
						var classColor = "error-color";
						
					}
					
					
					//on l'affiche dans la pop up
					$(".eventList").append("<tr><td > <input type=\"checkbox\" name=\"event"+ i +"\" id=\"checkedEvent"+ i +"\" value=\"eventChecked\" align=\"right\" checked> <\/td><td > "+ eventName +" <\/td><td > "+ eventStartDayFrench + "<\/br><span class=\" tab_hour \"> <i>"+ eventStartHourFrench +" <\/i><\/spans><\/td><td ><span class=\" "+ classColor +" eventEndDaySpan" + i +"\"> "+ eventEndDayFrench + "<\/span><\/br> <span class=\" " + classColor + " tab_hour eventEndHourSpan" + i +"\"><i> "+ eventEndHourFrench +" </i><\/spans><\/td><td > <select class=\"form-control time_selection\" onchange=\"affichageDureeEstime(this.id, this.value)\" id=\"select_duree"+ i +"\" ><option value=\"0\" > A saisir <\/option><option value=\"12\" > Une Nuit <\/option><option value=\"24\" > Une journée <\/option><option value=\"48\" > Un Week End <\/option><option value=\"72\" > 3 Jours <\/option><option value=\"168\" > Une semaine<\/option><option value=\"336\" > Deux semaines <\/option><\/select><\/td><\/tr>");
					
					//si il y a une date de fin on défini le select en fonction
					if (topInvitObject[i].attributes.event.attributes.end_time) {
						var ecart = topInvitObject[i].attributes.event.attributes.end_time - topInvitObject[i].attributes.event.attributes.start_time;
						var dureeEcart = ecart / 1000 / 60 / 60;
						var selectElmtClassName = "select_duree" + i;
						var selector = document.getElementById(selectElmtClassName);
						console.log(dureeEcart);
						
						if (dureeEcart > 0 && dureeEcart <= 12) {
							selector.selectedIndex = 1;
						}
						if (dureeEcart > 12 && dureeEcart <= 24) {
							selector.selectedIndex = 2;
						}
						if (dureeEcart > 24 && dureeEcart <= 48) {
							selector.selectedIndex = 3;
						}
						if (dureeEcart > 48 && dureeEcart <= 72) {
							selector.selectedIndex = 4;
						}
						if (dureeEcart > 72 && dureeEcart <= 168) {
							selector.selectedIndex = 5;
						}
						if (dureeEcart > 168) {
							selector.selectedIndex = 6;
						}
					}
					//si il n'y a pas de date de fin on met à saisir
					else {
						var selectElmtClassName = "select_duree" + i;
						var selector = document.getElementById(selectElmtClassName);
						selector.selectedIndex = 0;
						
						//on decoche la checkbox
						var checkBoxElmtId = "#checkedEvent" + i;
						$(checkBoxElmtId).prop('checked', false);
						
					}
					
		 	}
		 	
		 	$(".eventListTab").append("<\/tbody><\/table>");
			
			//on affiche le bouton de récupération des photos
			$("#recupPhotoButton").show();		 
		 },
		 error: function() {
			 console.log(" \n !!!!! !!!!! \n" );
			 }
		}); 
}

/****************************************************
   affiche durée estimé au clic sur une date
*****************************************************/

function affichageDureeEstime (divId, timeValue) {
	console.log ("divID  : " + divId + " timeValue : " + timeValue);
	//on recupère le numéro de la div "select_dureeX" et on ne récupère que le X à la 13eme position
	var divNumberId = divId.substring(12, divId.length);
	
	//on ajoute pour trouver l'heure de fin
	var estimatedEndTime = AddHours(eventArrayObjectToFetch[divNumberId].attributes.start_time, timeValue );
	
	//estimatedEndTime a sauvegarder pour la date de fin
	
	//on met le temps estime en francais
	var eventEndDay = estimatedEndTime.getDay();
	var eventEndMonth = estimatedEndTime.getMonth();
	var frenchEventEndDay = getFrenchDay(eventEndDay);
	var frenchEventendMonth = getFrenchMonth(eventEndMonth);
	var eventEndDayFrench = frenchEventEndDay + " " + estimatedEndTime.getDate() + " " + frenchEventendMonth ;
	var eventEndHourFrench = estimatedEndTime.getHours() + " heures ";
	
	//on modifie la date de fin de la Xeme ligne (eventEndHourSpanX eventEndDaySpanX) 
	var endDaySpanName = ".eventEndDaySpan" + divNumberId;
	var endHourSpanName = ".eventEndHourSpan" + divNumberId;
	
	//on affiche la nouvelle estimation de fin pour le jour
	$(endDaySpanName).empty();
	$(endDaySpanName).append(eventEndDayFrench);
	$(endDaySpanName).addClass( "success-color" );
	$(endDaySpanName).removeClass( "error-color" );
	
	//on affiche la nouvelle estimation de fin pour l'heure
	$(endHourSpanName).empty();
	$(endHourSpanName).append("<i>" + eventEndHourFrench + "<\/i>");
	$(endHourSpanName).addClass( "success-color" );
	$(endHourSpanName).removeClass( "error-color" );
	
	//on coche la checkbox
	var checkBoxElmtId = "#checkedEvent" + divNumberId;
	$(checkBoxElmtId).prop('checked', true);
	
}


/****************************************************
   Recuperation des photos au clic sur le bouton
*****************************************************/
// Ajout de la durée de l'evenement
function fetchPictureOfTheEvent(){
   var j = 0;


	
	for (var i=0; i<eventArrayObjectToFetch.length; i++){
		console.log(i);
		
		//on recupère l'etat de l'input check
		var checkedElmtClassName = "checkedEvent" + i;
		var checkedElmt = document.getElementById(checkedElmtClassName);
		
		//on verifie si le user a laissez cocher l'event
		if (checkedElmt.checked){
			
			//on récupère la durée selectionné pour un event
			var selectElmtClassName = "select_duree" + i;
			var selectElmt = document.getElementById(selectElmtClassName);
			var eventDurationValue = selectElmt.options[selectElmt.selectedIndex].value;
			
			//on va set la date de fin de l'event
			var eventEndTime = getEventEndTime(eventArrayObjectToFetch[i].attributes.event , eventDurationValue);
			
			//on transforme les dates debut et fin
	  		var dateDebut =  eventArrayObjectToFetch[i].attributes.event.attributes.start_time.toISOString(); 
	  		var dateFin =  eventEndTime.toISOString();
			
			//on ajoute dans notre tableau pour la recup l'object event et la date de début et la date de fin
			eventArrayToRetrievePicture['eventParseObject'][j]= eventArrayObjectToFetch[i].attributes.event;
			eventArrayToRetrievePicture['eventStartDate'][j]= dateDebut;
			eventArrayToRetrievePicture['eventEndDate'][j]= dateFin;
			
			//on incremente uniquement lorsque un event a été selectionné
			j++;
			
			
		}
	
	}
	
	//on masque le contenu pour selectionner la durée
	$(".selectTimeModalContent").hide();
	$("#recupPhotoButton").hide()	
	//on affiche la modale de loader
	$(".loader").show(); 

	//on va recuperer les photos pour le premier event
	if (eventArrayToRetrievePicture['eventParseObject'][eventFetchedAndPrint]) {
	
		getPicturePostOnFacebookEvent(eventArrayToRetrievePicture['eventParseObject'][eventFetchedAndPrint] ,eventArrayToRetrievePicture['eventStartDate'][eventFetchedAndPrint] , eventArrayToRetrievePicture['eventEndDate'][eventFetchedAndPrint]);
		
	}

}

/*************************************
   Affichage de la durée estimé en fonction de la selection faite par le user
*************************************/
function getEventEndTime (eventParseObject , eventDurationValue) {
		  	
  	//on recupère la start date de l'event
	if (eventParseObject.attributes.start_time) {	
	  		
		//on converti au format JS
		eventBeginTime = new Date(eventParseObject.attributes.start_time);
		
		//on verifie si il existait déjà une date de fin sur le serveur
		if (eventParseObject.attributes.end_time) {
			eventEstimatedEndTime = eventParseObject.attributes.end_time;
		}
		//si il n'y avait pas de date de fin pour cet event
		else {
			//on set par défaut à la date de début
			eventEstimatedEndTime = new Date(eventParseObject.attributes.start_time);
			//on ajout 50% a la durée réelle indiqué par le user (pour couvrir les cas : juste jour de début et pas d'heure & le délai pour poster)
			eventDurationValue = eventDurationValue * 3 / 2;
			
			//on ajoute pour trouver l'heure de fin
			eventEstimatedEndTime = AddHours(eventEstimatedEndTime, eventDurationValue );
			console.log ("Date de début : " + eventParseObject.attributes.start_time + "\n Date de fin : " + eventEstimatedEndTime)
			
		}
		
		//on save la date de fin sur le serveur
		eventParseObject.set("end_time", eventEstimatedEndTime);
		eventParseObject.save();
		
		//on retourne la date de fin
		return (eventEstimatedEndTime);
		
		/*on converti en texte pour afficher
		
		var eventStartDay = eventParseObject.attributes.start_time.getDay();
		var eventEndDay = eventEstimatedEndTime.getDay();
		
		var eventStartMonth= eventParseObject.attributes.start_time.getMonth();
		var eventEndMonth = eventEstimatedEndTime.getMonth();
		
		
		var frenchEventBeginDay = getFrenchDay(eventStartDay);
		var frenchEventEndDay = getFrenchDay(eventEndDay);
		
		var frenchEventbeginMonth = getFrenchMonth(eventStartMonth);
		var frenchEventendMonth = getFrenchMonth(eventEndMonth);
		
		on affiche dans le champs  la date estimée
		$(".beginDateOfTheEvent").empty();
		$(".endDateOfTheEvent").empty();
		$(".beginDateOfTheEvent").append(frenchEventBeginDay + " " + eventParseObject.attributes.start_time.getDate() + " " + frenchEventbeginMonth + " à " + eventParseObject.attributes.start_time.getHours() + " heures ");
		$(".endDateOfTheEvent").append(frenchEventEndDay + " " + eventEstimatedEndTime.getDate() + " " + frenchEventendMonth + " à " + eventEstimatedEndTime.getHours() + " heures ");
		
		
		//on affiche la date de fin estimé
		$(".dateDeFin").show()*/
		
		
		
		
	}

}

/**********************************************************
   Récupérer photos postées par le user avant & apres levenement
***********************************************************/
function getPicturePostOnFacebookEvent (eventParseObject, dateDebut , dateFin) {

	//on va recupérer le nombres d'amis invités
	var apiUrlFindInvited = "SELECT uid  FROM event_member WHERE eid=" + eventParseObject.attributes.eventId + " and uid IN (SELECT uid2 FROM friend WHERE uid1 = me());";
	console.log(apiUrlFindInvited);
	FB.api('fql', { q: apiUrlFindInvited },  function(response) {
		if (!response || response.error) {
		    console.log('Error occured on facebook');
		} else {
		
			for (var i = 0; i < response.data.length; i++) {	
			
				//pour chaque amis : on va récuperer les photos des amis uploaded
				var requetePhotoTagged = "/"+ response.data[i].uid +"/photos?fields=source,width,height,created_time,picture,name,from&type=uploaded&until="+ dateFin + "&since=" + dateDebut ;	
				eventToFetch++;
				$(".userPhotoFetched").empty(); 
				$(".userPhotoFetched").append(eventToFetch);
				$(".progress-invitAdd").attr('aria-valuemax', eventToFetch);
				$(".userPhotoFetched").show();  
	
				fetchPicturePostOnFacebook(requetePhotoTagged, eventParseObject, dateDebut , dateFin);
				
				//pour chaque amis : on va récuperer les photos des amis tagged
				var requetePhotoTagged = "/"+ response.data[i].uid  +"/photos?fields=source,width,height,created_time,picture,name,from&type=tagged&until="+ dateFin + "&since=" + dateDebut ;	
				eventToFetch++;
				$(".userPhotoFetched").empty(); 
				$(".userPhotoFetched").append(eventToFetch);
				$(".progress-invitAdd").attr('aria-valuemax', eventToFetch);
				$(".userPhotoFetched").show();  
				
				fetchPicturePostOnFacebook(requetePhotoTagged, eventParseObject, dateDebut , dateFin);
				
			}
		}			
	
		
	//on va recuperer les photos du user uploaded après avoir eu la reponse de la requete pour sa liste d'amis fb
	var requetePhotoUploaded = "/me/photos?fields=source,width,height,created_time,picture,name,from&type=uploaded&until="+ dateFin + "&since=" + dateDebut ;	
	eventToFetch++;
	$(".userPhotoFetched").empty(); 
	$(".userPhotoFetched").append(eventToFetch);
	$(".progress-invitAdd").attr('aria-valuemax', eventToFetch);
	$(".userPhotoFetched").show(); 
	 
	fetchPicturePostOnFacebook(requetePhotoUploaded, eventParseObject, dateDebut , dateFin);
	
	//on va recuperer les photos du user tagged
	var requetePhotoTagged = "/me/photos?fields=source,width,height,created_time,picture,name,from&type=tagged&until="+ dateFin + "&since=" + dateDebut ;
	
	eventToFetch++;
	$(".userPhotoFetched").empty(); 
	$(".userPhotoFetched").append(eventToFetch);
	$(".progress-invitAdd").attr('aria-valuemax', eventToFetch);
	$(".userPhotoFetched").show(); 
	
	fetchPicturePostOnFacebook(requetePhotoTagged, eventParseObject, dateDebut , dateFin);
	
	});

}
	
/**********************************************************
   Récupérer photos postées par le user avant & apres levenement
***********************************************************/
function fetchPicturePostOnFacebook (apiUrl, eventParseObject, dateDebut , dateFin ) {
		
	//On lance la requete a l api Facebook
	FB.api(apiUrl, function(response) {
	
		photoToAdd+=response.data.length;
		
	
		//on verifie si il y a des infos dans lobjet
		//on boucle pour chaque photo de la reponse
		for (var i=0; i<response.data.length; i++) {
		
								
				var photoObject = response.data[i];

				//on verifie si la photo est deja dans le tableau
				var photoDejaAdd = newPhotoToCheckArrayFBId.indexOf(photoObject.id);
					
					//si elle est pas deja add
					if (photoDejaAdd == -1) {
							
							//console.log("la photo n'etait pas dans notre tableau");
					
							//on ajoute l'id dans notre tableau temp
							newPhotoToCheckArrayFBId.push(photoObject.id);
							
							//on ajoute dans le tableau des objet photo
							newPhotoToCheckArrayObject.push(photoObject);
							photoAdded++;
							
							
					}
					//si elle etait deja add
					else {
							photoAdded++;
							//console.log("photo deja dans le tableau en attente de verification ");	
				
					}
						 
				 	 
			}
			
		  eventFetched++;
		  $(".userPhotoToFetch").empty(); 
		  $(".userPhotoToFetch").append(eventFetched);
		  $(".progress-photoFetched").attr('aria-valuenow', eventFetched);
		  eventFetchedPourcent = eventFetched / eventToFetch * 100;
		  $(".progress-photoFetched").css( "width", eventFetchedPourcent+"%") 
		  $(".userPhotoToFetch").show();  
		  
		//quand on a tout parcouru
		//console.log("eventFetched : " + eventFetched + "eventToFetch : " + eventToFetch + "photoAdded : " + photoAdded + "photoToAdd : " + photoToAdd);  
		if (eventFetched == eventToFetch && photoAdded == photoToAdd ) {
		
			//on va verifier si les photos existent deja en base
			verifPicturExist(newPhotoToCheckArrayObject, eventParseObject);
			$( ".progress-photoFetched" ).addClass( "progress-bar-success" );
			
		}
			
		
	});	


}

/****************************************************
   On vérifie si une photo existe deja et on crée ou update
*****************************************************/

function verifPicturExist (newPhotoToCheckArrayObject , eventParseObject ) {

	//on creer la requete pour verif si existe sur le serveur
	 var Photo = Parse.Object.extend("Photo");
	 var queryCheckPictureExist = new Parse.Query(Photo);
	 
	 var newPhotoToCheckArrayId = [];
	 	 
	 for (var i=0; i<newPhotoToCheckArrayObject.length; i++) {
	 
		newPhotoToCheckArrayId[i] = newPhotoToCheckArrayObject[i].id;

	}
	 
	 //on verifie sil existe en base un event avec le meme facebook id
	 queryCheckPictureExist.containedIn("facebookId", newPhotoToCheckArrayId);
	 queryCheckPictureExist.equalTo("event",eventParseObject);
	 
	 //on verif si existe
	 queryCheckPictureExist.find({
	 	 
		 success: function(resultsFind) {
		 	console.log("coucou result");
		 	console.log(resultsFind);
		 	
		 		for (var i = 0; i < resultsFind.length; i++) {	
		 		
		 			console.log("la photo existait déjà");
		 		
		 			//on supprime de notre tableau newPhotoToCheckArrayObject toutes celle qui existaient 			
		 			//on va chercher l'id dans notre tableau
		 			var photoPosition = myIndexOfPhotoArray(newPhotoToCheckArrayObject, resultsFind[i].attributes.facebookId);
		 			//on le supprime
		 			newPhotoToCheckArrayObject.splice(photoPosition,1);
		 			
		 		} 		
		 		 		
		 		//quand on a tout parcouru on lance le saveAll des photos
		 		addPictureInBase(newPhotoToCheckArrayObject , eventParseObject); 
		  
		  },
		  error: function(error) {
				console.log('\n  !!!!! Echec de la verification si picture existe en base !!!!! \n '); 
			  
		  }
		});		
}

/****************************************************
   On ajoute une photo en base
*****************************************************/

function addPictureInBase (newPhotoToCheckArrayObject, eventParseObject) {
	 var Photo = Parse.Object.extend("Photo");
	 var currentUser = Parse.User.current();
	  
	  var j = 0;
	  
	  //on declare le tableau d'object newEvent
	  var newPhotoArrayObject = [];
	  
	  //si aucune photo à ajouter, on affiche les photo au cas où elles étaient déjà en base
	  if (newPhotoToCheckArrayObject.length == 0) {
	  	printPhotoWall(eventParseObject);
	  }
	  
	  for (var i = 0; i < newPhotoToCheckArrayObject.length; i++) {
			  
			 var newPicture = new Photo();
			 
			 if (newPhotoToCheckArrayObject[i].created_time){
			 	 var createdTimeVar = new Date(newPhotoToCheckArrayObject[i].created_time);
				 newPicture.set("created_time",createdTimeVar);
			 }
			 if (newPhotoToCheckArrayObject[i].source){
				 newPicture.set("facebook_url_full",newPhotoToCheckArrayObject[i].source);
			 }
			 if (newPhotoToCheckArrayObject[i].id){
				 newPicture.set("facebookId",newPhotoToCheckArrayObject[i].id);
			 }
			 if (newPhotoToCheckArrayObject[i].picture){
				 newPicture.set("facebook_url_low",newPhotoToCheckArrayObject[i].picture);
			 }
			 if (newPhotoToCheckArrayObject[i].height){
				 newPicture.set("height",newPhotoToCheckArrayObject[i].height);
			 }
			 if (newPhotoToCheckArrayObject[i].width){
				 newPicture.set("width",newPhotoToCheckArrayObject[i].width);
			 }
			 
			 //user ou prospect
			 
			 
			 if (eventParseObject){
				 newPicture.set("event",eventParseObject);
			 }
			 
			 //on ajoute newInvit au tableau des photos
			 newPhotoArrayObject.push(newPicture);
			 
			 //si on a atteint la fin du tableau alors on lance le saveAll
			 if (newPhotoArrayObject.length == newPhotoToCheckArrayObject.length) { 
				 	 //on save le nouvelle event pour add en base
				 	 Parse.Object.saveAll(newPhotoArrayObject, {
						  success: function(newPicture) {
						  	
						  	//pour chaque evenement créer
						  	for (var i = 0; i < newPicture.length; i++) {	
							    // Execute any logic that should take place after the object is saved.
								console.log("Photo ajoutée : **********");
							}
							
							printPhotoWall(eventParseObject);
						    
						  },
						  error: function( error) {
						    // Execute any logic that should take place if the save fails.
						    // error is a Parse.Error with an error code and description.
						    console.log(" \n !!!!! Failed to add the picture : " + error.description + " !!!!! \n" );
						  }
						});
			}
		}
}

/**********************************************************
 Afficher les photos ajoutées
***********************************************************/

function printPhotoWall (eventParseObject) {

	//on ferme la modal
	$('#selectTimeModal').modal('hide');
	 
	 //on creer la requete pour verif si existe sur le serveur
	 var Photo = Parse.Object.extend("Photo");
	 var queryGetPicture = new Parse.Query(Photo);
	 console.log("affichage des photos");
	 
	 //on verifie sil existe en base un event avec le meme facebook id
	 queryGetPicture.equalTo("event", eventParseObject);
	 //on limite au max autorisé par parse (1000)
	 queryGetPicture.limit(1000);
	 
	
	 
	 //on va recuperer les photos
	 queryGetPicture.find({
			 success: function(results) {
			 	if (results != "") {
			 	 console.log(results);
			 	//si il y a au moins une photo
			 	$(".event-list").append("<div class=\"event-div\"><div class=\"row header-event\"><div class=\" col-xs-6 col-sm-6 col-md-6 col-lg-6 \" style=\"\"><p> "+ eventParseObject.attributes.name + "<\/p><\/div><div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6 \" style=\"\"><p><span class=\"photo-number\"> <span class=\"glyphicon glyphicon-camera\" style=\"\"><\/span> "+ results.length + " Photos <\/span><\/p><\/div><\/div><div class=\"row event-photo-div event-photo-div" + eventBeingPrinting + "\">");

			 	var eventPhotoDivClassName = ".event-photo-div" + eventBeingPrinting;
			 	
				 	for (var i = 0; i < results.length; i++) {	
				 		
				 		if (i < 2) {
				 			$(eventPhotoDivClassName).append("<div class=\"col-xs-6 col-sm-6 col-md-2 col-lg-2\"><div class=\"image-preview\" style=\"\"><img src=\" "+ results[i].attributes.facebook_url_low + "\" class=\"\" style=\"\"><\/div><\/div>");				
				 		}
				 		//on affiche les photos cachées sur mobile jusqu'a la 6eme
				 		if (i >= 2 && i < 5){
					 		$(eventPhotoDivClassName).append("<div class=\"col-xs-6 col-sm-6 col-md-2 col-lg-2 hidden-xs hidden-sm\"><div class=\"image-preview\" style=\"\"><img src=\""+ results[i].attributes.facebook_url_low + "\" class=\"\" style=\"\"><\/div><\/div>");	
				 		}

				 	}
				 
				 $(eventPhotoDivClassName).append("<div class=\"col-xs-6 col-sm-6 col-md-2 col-lg-2 hidden-xs hidden-sm\">	<center style=\"margin-top : 17px;\"><a href=\"https://www.woovent.com/e/"+ eventParseObject.id +"\"><p style=\"font-size : 20px;\"><span class=\"glyphicon glyphicon-zoom-in\" style=\"font-size : 60px;\"><\/span><\/br>Voir toutes les photos !<\/p><\/a><\/center><\/div><\/div><\/div>");
				 $(".event-list").append("<\/br><\/br>");
				 //on passe à levent suivant à afficher
				 eventBeingPrinting++;
				 	
				 }
				 
				 //si on ne trouve aucunne photos
				 else {
				 
				     var eventPhotoDivClassName = ".event-photo-div" + eventBeingPrinting;
				     
						$(".event-list").append("<div class=\"event-div\"><div class=\"row header-event\"><div class=\" col-xs-6 col-sm-6 col-md-6 col-lg-6 \" style=\"\"><p> "+ eventParseObject.attributes.name + " <\/p><\/div><div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6 \" style=\"\"><p><span class=\"photo-number\"> <span class=\"glyphicon glyphicon-camera\" style=\"\"><\/span> 0 Photos <\/span><\/p><\/div><\/div><div class=\"row event-photo-div event-photo-div" + eventBeingPrinting + "\">");
						$(eventPhotoDivClassName).append("<center><i><p class=\" no-event \"> Aucune photo récupéré pour cet évènement sur Facebook <\/p><\/i><\/center><\/div><\/div>");
						
					 $(".event-list").append("<\/br><\/br>");
					 
					 //on passe à levent suivant à afficher
					 eventBeingPrinting++;

				 }
			 	
			 	eventFetchedAndPrint++;
			 	
			 	//si il y a un event suivant, on va recuperer les photos pour l'event suivant
			 	if (eventArrayToRetrievePicture['eventParseObject'][eventFetchedAndPrint]) {
			 	//on remet les variables à 0
			 	eventFetched = 0;
			 	eventToFetch =0;
			 	photoAdded = 0;
			 	photoToAdd = 0;
			 	newPhotoToCheckArrayFBId = [];
			 	newPhotoToCheckArrayObject = [];
			 	
			 	
			 	getPicturePostOnFacebookEvent(eventArrayToRetrievePicture['eventParseObject'][eventFetchedAndPrint] ,eventArrayToRetrievePicture['eventStartDate'][eventFetchedAndPrint] , eventArrayToRetrievePicture['eventEndDate'][eventFetchedAndPrint]);
			 	}
			 	else {
			 		console.log("on a tout parcouru");
			 	}
			 	
			 },
			 error: function(error) {
			 
			 
			 }	 
	 });	
}

/**********************************************************
  Conversion date to ISO string
***********************************************************/

if ( !Date.prototype.toISOString ) {
  ( function() {

    function pad(number) {
      var r = String(number);
      if ( r.length === 1 ) {
        r = '0' + r;
      }
      return r;
    }

    Date.prototype.toISOString = function() {
      return this.getUTCFullYear()
        + '-' + pad( this.getUTCMonth() + 1 )
        + '-' + pad( this.getUTCDate() )
        + 'T' + pad( this.getUTCHours() )
        + ':' + pad( this.getUTCMinutes() )
        + ':' + pad( this.getUTCSeconds() )
        + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
        + 'Z';
    };

  }() );
}

/**********************************************************
  Ajouter des jours à une date
***********************************************************/

function AddDays(date, amount) 
{ 
    var tzOff = date.getTimezoneOffset() * 60 * 1000; 
    var t = date.getTime(); 
    t += (1000 * 60 * 60 * 24) * amount; 
    var d = new Date(); 
    d.setTime(t); 
    var tzOff2 = d.getTimezoneOffset() * 60 * 1000; 
    if (tzOff != tzOff2) 
    { 
        var diff = tzOff2 - tzOff; 
        t += diff; 
        d.setTime(t); 
    } 
    return d; 
} 

/**********************************************************
  enelever des jours à une date
***********************************************************/

function removeDays(date, amount) 
{ 
    var tzOff = date.getTimezoneOffset() * 60 * 1000; 
    var t = date.getTime(); 
    t -= (1000 * 60 * 60 * 24) * amount; 
    var d = new Date(); 
    d.setTime(t); 
    var tzOff2 = d.getTimezoneOffset() * 60 * 1000; 
    if (tzOff != tzOff2) 
    { 
        var diff = tzOff2 - tzOff; 
        t += diff; 
        d.setTime(t); 
    } 
    return d; 
} 

/**********************************************************
  Ajouter des jours à une date
***********************************************************/

function AddHours(date, amount) 
{ 
    var tzOff = date.getTimezoneOffset() * 60 * 1000; 
    var t = date.getTime(); 
    t += (1000 * 60 * 60 ) * amount; 
    var d = new Date(); 
    d.setTime(t); 
    var tzOff2 = d.getTimezoneOffset() * 60 * 1000; 
    if (tzOff != tzOff2) 
    { 
        var diff = tzOff2 - tzOff; 
        t += diff; 
        d.setTime(t); 
    } 
    return d; 
} 

/**********************************************************
  enelever des jours à une date
***********************************************************/

function removeHours(date, amount) 
{ 
    var tzOff = date.getTimezoneOffset() * 60 * 1000; 
    var t = date.getTime(); 
    t -= (1000 * 60 * 60) * amount; 
    var d = new Date(); 
    d.setTime(t); 
    var tzOff2 = d.getTimezoneOffset() * 60 * 1000; 
    if (tzOff != tzOff2) 
    { 
        var diff = tzOff2 - tzOff; 
        t += diff; 
        d.setTime(t); 
    } 
    return d; 
} 

/****************************************************
   Pour récupérer un paramètre  de l'url
*****************************************************/

function getURLParameters(paramName) 
{
        var sURL = window.document.URL.toString();  
    if (sURL.indexOf("?") > 0)
    {
       var arrParams = sURL.split("?");         
       var arrURLParams = arrParams[1].split("&");      
       var arrParamNames = new Array(arrURLParams.length);
       var arrParamValues = new Array(arrURLParams.length);     
       var i = 0;
       for (i=0;i<arrURLParams.length;i++)
       {
        var sParam =  arrURLParams[i].split("=");
        arrParamNames[i] = sParam[0];
        if (sParam[1] != "")
            arrParamValues[i] = unescape(sParam[1]);
        else
            arrParamValues[i] = "No Value";
       }

       for (i=0;i<arrURLParams.length;i++)
       {
                if(arrParamNames[i] == paramName){
            //alert("Param:"+arrParamValues[i]);
                return arrParamValues[i];
             }
       }
       return "No Parameters Found";
    }

}

function myIndexOfPhotoArray(arrayToFetch, photoId) {    
    for (var i = 0; i < arrayToFetch.length; i++) {
        if (arrayToFetch[i].id == photoId) {
            return i;
        }
    }
    return -1;
}

/****************************************************
  recup en francais du jour
*****************************************************/
function getFrenchMonth(eventMonth){
	if (eventMonth == 1){
		return "Janvier";
	}
	if (eventMonth == 2){
		return "Fevrier";
	}
	if (eventMonth == 3){
		return "Mars";
	}
	if (eventMonth == 4){
		return "Avril";
	}
	if (eventMonth == 5){
		return "Mai";
	}
	if (eventMonth == 6){
		return "Juin";
	}
	if (eventMonth == 7){
		return "Juillet";
	}
	if (eventMonth == 8){
		return "Aout";
	}
	if (eventMonth == 9){
		return "Septembre";
	}
	if (eventMonth == 10){
		return "Octobre";
	}
	if (eventMonth == 11){
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
	if (eventDay == 6){
		return "Samedi";
	}
	else {
		return "Dimanche";
	}
}

/****************************************************
   Lancement de la recup des photo
*****************************************************/
function getEventId(){
	

	//on recupère l'id Facebook de l'event
	var urlFbEventId = getURLParameters("eid");
	var urlParseObjectEventId = getURLParameters("poeid");
	
	//si le paramètre est bien récupéré -> on va chercher les infos sur levent
	if(urlParseObjectEventId) {
		return urlParseObjectEventId;
		
	}
	
}

/****************************************************
  on set la hauteur des div qui contiennent les images
*****************************************************/
function setDivHeight () {
	var divImageWidth = $(".image-preview").width();
	$(".image-preview").height(divImageWidth);
	
}