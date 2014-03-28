var todayTimestamp = (new Date).getTime();
todayTimestamp = Math.floor(todayTimestamp / 1000);

//variables pour la recuperations des amis
var friendsToAddCount = 0;
var friendsAddedCount = 0;
var friendsAddedPourcent = 0;

//variables pour la récupération des amis invités
var invitedFriendsFind = 0;
var invitedFriendsQueried = 0;
var invitedFriendsQueriedPourcent = 0;

//variables pour la récupération du total des invités par event
var invitedEventsFind = 0;
var invitedEventsQueried = 0;
var invitedEventsQueriedPourcent = 0;

//variables pour les invits aux evenements a créer en base
var invitCreated = 0;
var totalInvitToCreate= 0;
//on declare le tableau d'object newInvit
var newInvitArrayObject = [];

//variables pour les evenements a créer en base
var eventCreated = 0;
var totalEventToCreate= 0;
var eventAnalysedPourcent = 1;

//on declare le tableau d'objet des event fb a créer
var newEventToCreateArrayObject = [];

var totalEventMemberCount = 0;

var allUserEvent = [];
var currentUserGender = "male";

var currentUser ;

var totalInvitRecieve=0;
var totalEventCreated=0;

var top3BroParseObject = [];
var top3GirlsParseObject = [];

var photoTogetherWithFriend = new Array();

photoTogetherWithFriend['0'] = new Array();
photoTogetherWithFriend['1'] = new Array();
photoTogetherWithFriend['2'] = new Array();

var photoTogetherWithFriendsTotal = 0;
var photoTogetherWithFriendsTotalAdd = 0;

var topFriendFemaleName = [];
var topFriendMaleName = [];

var topFriendMaleFirstName = [];
var topFriendMaleLastName = [];
var topFriendFemaleFirstName = [];
var topFriendFemaleLastName = [];

var topFriendMale = [];
var topFriendFemale = [];

var photoArrayForCanva = [];

var urlPhotoToShare = "";

var userStatParseObject;

//boolean pour savoir si on affiche les tops après avoir recup les infos
var top3ToPrint = true;
var top3NotToPrint = false;

var friendsListInBase = [];

var allEventFetched = false;
var allEventFetchedCount = 0;

var answeredEventCountAllTime = 0;
var maybeEventCountAllTime = 0;
var declineEventCountAllTime = 0;
var notAnsweredEventCountAllTime = 0;
var attendingEventCountAllTime = 0;

var windyVar;

var nbCoverAddWindy = 0;

var photoHasBeenCreated = false;

var userFriendArrayMale = [];
var userFriendArrayMaleScore = [];
var userFriendArrayFemale = [];
var userFriendArrayFemaleScore = [];


//options du wait pour le partage Facebook
var opts = {
lines: 13, // The number of lines to draw
length: 11, // The length of each line
width: 5, // The line thickness
radius: 17, // The radius of the inner circle
corners: 1, // Corner roundness (0..1)
rotate: 0, // The rotation offset
color: '#FFF', // #rgb or #rrggbb
speed: 1, // Rounds per second
trail: 60, // Afterglow percentage
shadow: false, // Whether to render a shadow
hwaccel: false, // Whether to use hardware acceleration
className: 'spinner', // The CSS class to assign to the spinner
zIndex: 2e9, // The z-index (defaults to 2000000000)
top: 'auto', // Top position relative to parent in px
left: 'auto' // Left position relative to parent in px
};


var overlay;
var target = document.createElement("div");

var isNewUser = false ;

function sendMailNewUser(){

	var userLang = navigator.language || navigator.userLanguage; 
	console.log("sending mail");
	Parse.Cloud.run('sendMailNewUsersLookback', { userMail: currentUser.attributes.email , userName: currentUser.attributes.name , userLang: userLang, userFirstName: currentUser.attributes.first_name }, {
	  success: function(responseMail) {
	    console.log("email sent");
	  },
	  error: function(error) {
	  }
	});

}


/*************************************
   vérification user logué ou non
*************************************/
function isUserConnected(){
	
    FB.getLoginStatus(function(response) {
		
		//check si le user a deja accepté l'appli Woovent
		if (response.status === 'connected') {
		
			
			//console.log("\n ***** User already connected to Facebook! ***** \n");
			
			//on regarde si il avait des stats ou pas
			var queryCheckUserHasStats = new Parse.Query(Parse.User);
			
			queryCheckUserHasStats.equalTo("facebookId",response.authResponse.userID);
			
			//on verif si existe
			queryCheckUserHasStats.first({
	
				success: function(result) {
					if(result){

						currentUser = result;
						//console.log("result.attributes.hasWebStatistics =" + result.attributes.hasWebStatistics + "=");
						
						//si il avait des stats on affiche les stats
						if(result.attributes.hasWebStatistics == true) {
							
							$(".connection-div").hide();
							whatStatsToShow ();
							//console.log("has web stat ok");
							mixpanel.identify(result.id);
							mixpanel.people.set({
								"Parse Id": result.id,
							});
							mixpanel.track(
							    "WebSession",
							    { "Source": "Lookback" }
							);
						}
						
						//si il avait pas de stats on update les infos du new user
						else {
							//console.log("has web stat PAS ok");		
							$(".connection-div").fadeIn();
							$(".btn-login-big	").show();
						}
					}	
					//si il n'y a pas de resultat (user deja accepté l'appli mais plus de compte
					else{
						 //console.log("le user a deja accepté l'appli mais n'a pas de compte en base");
						 //on cache le bouton login on affiche le logout
						 $(".btn-login").show();
						 $(".btn-logged-in").hide();
						 $(".connection-div").fadeIn();
						 $(".btn-login-big	").show();
						
					
					}
				
				},
			  error: function(error) {
					//console.log('\n  !!!!! Echec de la verification si User exist !!!!! \n ');  
					 $(".btn-login-big	").show();
			  }
			  
		});	
			
		}
		else {
			//si il n'est pas loggué on ne fait rien car on a besoins du clic pour ouvrir la pop up Facebook
			//console.log("le user n'a pas accepté l'appli pour le moment on attend qu'il se logg");
			
			$(".btn-logged-in").fadeOut();
			$(".btn-login").fadeIn();
			$(".connection-div").fadeIn();
			$(".btn-login-big").show();
			
			
			fblogin();
		}
	});	
	
	
	
	//on check si il y a deja un currentUser en cache
	//si oui on check si il a des stats
	/*if (currentUser) {
    	
    	// do stuff with the user
    	//SI LE USER EXISTAIT DEJA ET AVAIT DES STATS
		if (currentUser.attributes.hasWebStatistics == true)
		{
			console.log("utilisateur avait deja des stats");
			
			whatStatsToShow();			
				
		}
		//SI LE USER etait deja connecté mais sans stats
		else {
			updateUserInfoLogin();
		}
		//on cache le bouton login on affiche le logout
		$(".btn-login").hide();
		$(".btn-logged-in").show();
    
    
	} 
	//si non on check si il est déjà connecté à Facebook
	else {
	

	}*/

	//on centre les images cover & top event
	initImagePosition ();
	
	
	/*************************************************************
	****************** Detect Si Like OR Not *********************
	*************************************************************/
	
	//on detect quand il like la page facebook pour le ShareToSee
	FB.Event.subscribe('edge.create',
	    function(href, widget) {
	        //si il clic on passe la variable 
	        //on passe la variable shareorlike a true pour le current user
	        currentUser.set("hasShareOrLike",true);
	        currentUser.save();
	        
	        //on cache le ShareToSee
	        $(".femaleHiddingRow").hide();
	        $(".maleHiddingRow").hide();
	        
	        //on affiche le top 3 manquant
	  		//si c'est un mec, on affiche les top femme 
		  	if (currentUser.attributes.gender == "male"){
			  	//on cherche les meilleurs amis male
			  	findUserBestFriendsFemale(top3ToPrint);
			  	findUserBestFriendsMale(top3NotToPrint);
			  		
		  	}
		  	//si c'est une fille on affiche les top mec 
		  	else {
			  	findUserBestFriendsMale(top3ToPrint);
			  	findUserBestFriendsFemale(top3NotToPrint);
			}
			
			_gaq.push(['_trackEvent', 'Like', 'UserLikeWooventFanPage', 'UserLikeWooventFanPage']);

	    }
	);
	
	
	

}
/*************************************
   connexion ou creation de compte
*************************************/
function fblogin() {
	//on appel le login de parse et demande les bonnes autorisations
Parse.FacebookUtils.logIn("email,user_events,user_birthday,user_location,user_likes,user_friends ", {
	  success: function(user) {
	  	mixpanel.identify(user.id);
	  	mixpanel.people.set({
			"Parse Id": user.id,
		});
	  	mixpanel.track(
		    "WebSession",
		    { "Source": "Lookback" }
		);
	  	//si le user nexistait pas on le crée
	    if (!user.existed()) {
	      //console.log("\n ***** User signed up and logged in through Facebook! ***** \n");
	      
	      isNewUser = true;
	      
	      createUserAccount(user);
	      
	      mixpanel.track(
		    "CreatedAccountWeb",
		    { "Source": "Lookback" }
		);
		
		//si il existait on regarde si il avait des stats
	    } else {
	    
	    mixpanel.track(
		    "LogginWeb",
		    { "Source": "Lookback" }
		);
		
	      //console.log("\n ***** User logged in through Facebook! ***** \n");
	      
	        //on regarde si il avait des stats ou pas
			var hasStat = user.get("hasWebStatistics");
			
			if(hasStat == true) {
				currentUser = user;
				//on affiche les stats
				whatStatsToShow();
				$(".connection-div").hide();
			}
			else {
				//on va updater son compte puis recup les stats
				createUserAccount(user);
			}

	    }
	    
	    
	    //on cache le bouton login on affiche le logout
	    $(".btn-login").fadeOut();
		$(".btn-logged-in").fadeIn();
		$(".connection-div").hide();
	  },
	  error: function(user, error) {
	    //console.log("\n !!!!! User cancelled the Facebook login or did not fully authorize. !!!!! \n");
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

$(".container").empty();

window.location.href = "https://www.woovent.com/";
}

/*************************************
   mise à jour des infos du user
*************************************/
function createUserAccount(parseCurrentUser){
	
	//on va recup les infos
	FB.api("me?fields=birthday,email,first_name,name,last_name,devices,location,gender,id", function(response) {
			
			$(".connection-div").hide();
		
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
				  	
				  	if (isNewUser == true) {
					  	sendMailNewUser();
				  	}
				  
				    // Execute any logic that should take place after the object is saved.
				    //console.log('\n ***** User information update with success **** \n');
				    
				    //on lance la récupération des statistiques
				    //on va recuperer sa liste d'amis
					var userFriendApiUrl = "/me/friends?fields=id,gender&limit=50";
					getUserFriendList(userFriendApiUrl);

				  },
				  error: function(parseUserSaved, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    //console.log('\n !!!!! Failed to create new object, with error code: !!!!! \n ' + error.description);
				  }
				});	
	
	});


}

/**********************************************************
   On va regarder quelles stats affichées 
***********************************************************/
function whatStatsToShow () {

	hasUserLikeFanPage();

	//on cache le bouton login on affiche le logout
	$(".btn-login").fadeOut();
	$(".btn-logged-in").fadeIn();
	$(".connection-div").hide();
	
	$(".footer_all").fadeIn();
	

	//print user cover
	printUserCover();

	//on affiche les premières stats
	showBasicStats();
					  		
	
	//on va regarder si il a liker ou share deja
	//si il a deja share ou like on affiche tout
	if (currentUser.attributes.hasShareOrLike == true) {
	
		//on cherche les meilleurs amis male et on affiche	
		findUserBestFriendsMale(top3ToPrint);
		
		//on cherche les meilleurs amies female et on affiche
		findUserBestFriendsFemale(top3ToPrint);
		
	}
		
		//si il n'a pas share ou like on regarde si c'est un mec ou une fille
	else {
			//si c'est un mec, on affiche les top potes et on met le shareToSee sur les tops meuf
  		if (currentUser.attributes.gender == "male"){
	  		//on cherche les meilleurs amis male
	  		findUserBestFriendsMale(top3ToPrint);
	  		findUserBestFriendsFemale(top3NotToPrint);
	  		
	  		//on masque le top fille avec le ShareToSee
	  		printShareToSee();
	  		
	  		
  		}
  		//si c'est une fille on affiche les top copines et on met le shareToSee sur les tops mecs
  		else {
	  		//on cherche les meilleurs amies female
	  		findUserBestFriendsFemale(top3ToPrint);
	  		findUserBestFriendsMale(top3NotToPrint);
	  		
	  		//on masque le top mec avec le ShareToSee
	  		printShareToSee();
	  		
  		}
  		
  	}
}

/**********************************************************
   On récupère la liste des amis du user
***********************************************************/
function getUserFriendList (userFriendApiUrl) {


	hasUserLikeFanPage();

	//on cache le bouton login on affiche le logout
	$(".btn-login").fadeOut();
	$(".btn-logged-in").fadeIn();
	$(".connection-div").hide();
	
	$(".footer_all").fadeIn();

	//print user cover
	printUserCover();
	
	//on affiche le loader
	$(".loader").fadeIn(); 

	//on check si il a deja des friends dans la liste
	var FriendsList = Parse.Object.extend("FriendsList");
	var queryCheckInFriendsListBase = new Parse.Query(FriendsList);

	queryCheckInFriendsListBase.equalTo("user", currentUser);
	queryCheckInFriendsListBase.limit(1000);
	
	//on verif si existe
	queryCheckInFriendsListBase.find({
		 success: function(results) {
		 	
		 	for (var i = 0; i < results.length; i++) {	
				//on rempli le tableau avec l'ensemble des friends trouvé
				friendsListInBase.push(results[i]);
				
			
			}
			//si il y en avant deja, on supprime tout
			if (results.length > 0){
			document.body.appendChild(target);
			var spinner = new Spinner(opts).spin(target);
			overlay = iosOverlay({
						text: wording_stats_popup_recover,
						spinner: spinner
					});	
					
			Parse.Object.destroyAll(friendsListInBase, function(success, error) {
			    if (success) {
			      // All the objects were delete
			      overlay.hide();
			      //on lance la recup des amis
				  searchUserFriendsList(userFriendApiUrl);
			      
			    } else { 
			    //console.log("error while deleting");
			    }
			  });
			} else {
				//on lance la recup des amis
				searchUserFriendsList(userFriendApiUrl);
			}
			
			
			
		 },
		 //si erreur
		 error: function(error) {
				//console.log('\n  !!!!! Echec de verif si amis deja en base !!!!! \n '); 
			  
		 }
		});	
	
}
/*********************************************************
   creation de la liste des amis
*********************************************************/

function searchUserFriendsList(userFriendApiUrl){

	//on declare le tableau de user
	var friendUserObject = new Array();
	//on lance la requete
	FB.api(userFriendApiUrl, function(response) {
		//console.log(response);
		
		//on boucle pour chaque event de la reponse
		for (var i=0; i<response.data.length; i++) {
		
				//on incremente la variable friendsListCount
				friendsToAddCount ++;
				
				$(".friendsFind").empty(); 
				$(".friendsFind").append(friendsToAddCount);
				$(".progress-friendsAdd").attr('aria-valuemax', friendsToAddCount);
				$(".friendsFind").show(); 
						 
				//on cree un objet qui contient les elements du user
				 friendUserObject[i] = response.data[i];
				 var pagingUrlNext = response.paging.next ;	
				 
				 
				 if (response.data[i].gender) {
					 if (response.data[i].gender == "female") {
					 
					 	userFriendArrayFemale.push(response.data[i].id);
					 	
					 } else {
						userFriendArrayMale.push(response.data[i].id);
					 } 
					 
					 
				 }	 
				 		friendsAddedCount++;
						$(".friendsAdd").empty(); 
						$(".friendsAdd").append(friendsAddedCount);
						$(".progress-friendsAdd").attr('aria-valuenow', friendsAddedCount);
						friendsAddedPourcent = friendsAddedCount / friendsToAddCount * 100;
						$(".progress-friendsAdd").css( "width", friendsAddedPourcent+"%")
						$(".friendsAdd").show(); 
			}
			

		
		//si il y a une pagination on relance une recherche sur lapi
		if (pagingUrlNext) {
			searchUserFriendsList(pagingUrlNext);
			pagingUrlNext = null;
		}	
		else{
		
			$(".loading-bar-friend").hide();  
			$(".loading-bar-event").fadeIn(); 
			
			//on passe tout à 0 pour les scores
			for (var i=0; i<userFriendArrayFemale.length; i++) {
				userFriendArrayFemaleScore[i] = 0;
			
			}
			//on passe tout à 0 pour les scores
			for (var i=0; i<userFriendArrayMale.length; i++) {
				userFriendArrayMaleScore[i] = 0;
			
			}
			
			//on envoi l'object complet pour créer tout les friends
			friendListCreated();
			
		} 
	});

}
/*********************************************************
   creation de la liste des amis
*********************************************************/
function friendListCreated(){
	
	
					
				 	 //on lance la recup des invités aux events passés
				 	 var beforeTodayAttendingApiUrl = "/me/events?fields=id,owner.fields(id,name,first_name,last_name,picture),name,venue,location,start_time,end_time,rsvp_status,cover,updated_time,description,is_date_only,admins.fields(id,name,first_name,last_name,picture)&limit=100&type=attending&since=2011-12-31";
				 	 getInvitedFriendsToPastEvent(beforeTodayAttendingApiUrl);
				 	 
				 	 var beforeTodayMaybeApiUrl = "/me/events?fields=id,owner.fields(id,name,first_name,last_name,picture),name,venue,location,start_time,end_time,rsvp_status,cover,updated_time,description,is_date_only,admins.fields(id,name,first_name,last_name,picture)&limit=100&type=maybe&since=2012-12-31";
				 	  //getInvitedFriendsToPastEvent(beforeTodayMaybeApiUrl);
				 	  
				 	  
				 	  
				 	  //on va recup juste le nombre total d'invitations
				 	  var totalNumberOfInvitationApiUrl = "/me/events/not_replied?fields=id&limit=300&until=now"
				 	  var rsvpStatus = "not_replied";
				 	  getUserTotalNumberOfInvit(totalNumberOfInvitationApiUrl, rsvpStatus);
				 	  
				 	  var totalNumberOfInvitationApiUrl = "/me/events/attending?fields=id&limit=300&until=now"
				 	  var rsvpStatus = "attending";
				 	  getUserTotalNumberOfInvit(totalNumberOfInvitationApiUrl, rsvpStatus);
				 	  
				 	  var totalNumberOfInvitationApiUrl = "/me/events/declined?fields=id&limit=300&until=now"
				 	  var rsvpStatus = "declined";
				 	  getUserTotalNumberOfInvit(totalNumberOfInvitationApiUrl, rsvpStatus);
				 	  
				 	  var totalNumberOfInvitationApiUrl = "/me/events/maybe?fields=id&limit=300&until=now"
				 	  var rsvpStatus = "maybe";
				 	  getUserTotalNumberOfInvit(totalNumberOfInvitationApiUrl, rsvpStatus);
				 	  
				 	  var totalNumberOfInvitationApiUrl = "/me/events/created?fields=id&limit=300&until=now"
				 	  var rsvpStatus = "created";
				 	  getUserTotalNumberOfCreatedEvent(totalNumberOfInvitationApiUrl, rsvpStatus);

		
}




/**********************************************************
   On récupère les invités aux event PASSE sur Facebook 
***********************************************************/
function getInvitedFriendsToPastEvent (apiUrl) {
	
	
	//on lance la requete
	FB.api(apiUrl, function(response) {
	//console.log(response);
	
	//on boucle pour chaque event de la reponse
	for (var i=0; i<response.data.length; i++) {
	
			//on ajoute dans liste des photos pour l'animation 
			if (response.data[i].cover && response.data[i].name) {
				nbCoverAddWindy++;
				$(".wi-container").append('<li><img src="'+ response.data[i].cover.source +'" alt="'+ nbCoverAddWindy +'" style="width : 100%;" /><h4>'+ response.data[i].name +'</h4></li>');
			}
			else if (response.data[i].name){
				nbCoverAddWindy++;
				$(".wi-container").append('<li><img src="img/cover_default.jpg" alt="'+ nbCoverAddWindy +'" style="width : 100%;" /><h4>'+ response.data[i].name +'</h4></li>');
			}
			else {
				nbCoverAddWindy++;
				$(".wi-container").append('<li><img src="img/cover_default.jpg" alt="'+ nbCoverAddWindy +'" style="width : 100%;" /><h4></h4></li>');
			}
			 
//on cree un objet qui contient les elements de l'event
			 var eventObject = response.data[i];
			 var pagingUrlNext = response.paging.next ;
			 
			 invitedEventsFind++;
			 $(".eventFind").empty(); 
			 $(".eventFind").append(invitedEventsFind);
			 //$(".progress-eventAdd").attr('aria-valuemax', invitedEventsFind);
			 $(".eventFind").show();
			 

			 
			 //on va recuperer la liste des invites amis avec le user pour chaque event
			var apiUrlFindInvited = "SELECT uid  FROM event_member WHERE eid=" + eventObject.id + "and uid IN (SELECT uid2 FROM friend WHERE uid1 = me());";
			getFriendsInvitListFromAnEvent(apiUrlFindInvited);
			 
			 //on stock tous les event dans un tableau	pour la suite
			 allUserEvent.push(eventObject);

			 	 
		}
	//si il y a une pagination on relance une recherche sur lapi
	if (pagingUrlNext) {
		getInvitedFriendsToPastEvent(pagingUrlNext);
		pagingUrlNext = null;
	}
	else {
		allEventFetchedCount++;
		if (allEventFetchedCount == 1) {
			allEventFetched = true;
			
			$(".loading-bar-event").hide();  
			$(".loading-bar-common").fadeIn(); 
			$(".loader-woovent-circle").hide();  
			$(".windy-event-loading").show(); 
			
			
			
			windyVar = initWindy();
			navnext(windyVar);
		}
		
	}

	});
}

/**********************************************************
   On crawl la liste des invites d'un event
***********************************************************/
function getFriendsInvitListFromAnEvent (fqlQuery) {
	var invitedFriendsObject = [];

	//on lance la requete
	FB.api('fql', { q: fqlQuery },  function(response) {
	
		invitedEventsQueried++;
		$(".eventAdd").empty(); 
		$(".eventAdd").append(invitedEventsQueried);
		$(".progress-eventAdd").attr('aria-valuenow', invitedEventsQueried);
		invitedEventsQueriedPourcent = invitedEventsQueried / invitedEventsFind * 100;
		$(".progress-eventAdd").css( "width", invitedEventsQueriedPourcent+"%") 
		if (invitedEventsQueriedPourcent == 100) {
			$( ".progress-eventAdd" ).addClass( "progress-bar-success" );
			$(".loading-bar-event").hide();  
			$(".loading-bar-common").fadeIn(); 
			$(".loader-woovent-circle").hide();  
			$(".windy-event-loading").fadeIn(); 
		}
		$(".eventAdd").show(); 
		 
		//on boucle pour chaque invite de la reponse
		for (var i=0; i<response.data.length; i++) {
		
			invitedFriendsFind++;
			$(".invitFind").empty(); 
			$(".invitFind").append(invitedFriendsFind);
			$(".progress-invitAdd").attr('aria-valuemax', invitedFriendsFind);
			$(".invitFind").show();  

				 
				 //on cree un objet qui contient les elements du user invite
				 invitedFriendsObject[i] = response.data[i];
				 
				 if (response.data[i].uid) {
					 var friendsWithEventPosition = userFriendArrayMale.indexOf(response.data[i].uid.toString());
					 
					 // si on a trouvé dans les mecs
					 if (friendsWithEventPosition != -1) {
						 userFriendArrayMaleScore[friendsWithEventPosition] = userFriendArrayMaleScore[friendsWithEventPosition] + 1;
					 } 
					 else {
					 	//on regarde dans le tableau des filles
						var friendsWithEventPosition = userFriendArrayFemale.indexOf(response.data[i].uid.toString());
						
						if (friendsWithEventPosition != -1) {
						 	userFriendArrayFemaleScore[friendsWithEventPosition] = userFriendArrayFemaleScore[friendsWithEventPosition] + 1;
						} 
						else{
							console.log ("Invit Trouve ni fille ni dans les mecs : " + response.data[i].uid);
						} 
					 }
					 
				  //on ajoute 1 au invite retrouve save
				  invitedFriendsQueried++;
				  $(".invitAdd").empty(); 
				  $(".invitAdd").append(invitedFriendsQueried);
				  $(".progress-invitAdd").attr('aria-valuenow', invitedFriendsQueried);
				  invitedFriendsQueriedPourcent = invitedFriendsQueried / invitedFriendsFind * 100;
				  $(".progress-invitAdd").css( "width", invitedFriendsQueriedPourcent+"%") 
				  $(".invitAdd").show(); 


				 }
				 	 
			}
	

			
		if (allEventFetchedCount == 1 && invitedEventsFind == invitedEventsQueried) {
			saveUserFriendsStats();
			
							mixpanel.track(
							    "CreatedLookback",
							    { "Source": "Lookback" }
							);
		}
		
		
		});

}
function findTop3InArray (arrayToSort) {

	 var i, one, two, three, pos1, pos2, pos3,posNum;
	    one = -9999;
	    two = -9999;
	    three = -9999;
	
	    for (i = 0; i < arrayToSort.length; i += 1) {
	        num = arrayToSort[i];
	        posNum = i;
	        if (num > three) {
	            if (num >= two) {
	            	pos3 = pos2;
	                three = two;
	                if (num >= one) {
	                	pos2 = pos1;
	                	pos1 = posNum;
	                    two = one;
	                    one = num;
	                }
	                else {
	                    two = num;
	                    pos2 = posNum;
	                }
	            }
	            else {
	                three = num;
	                pos3 = posNum;
	            }
	        }
	    }
	
	    return [pos1, pos2, pos3]
	
}

/****************************************************
   On save les stats des friends des users
*****************************************************/

function saveUserFriendsStats () {

	//on declare le tableau d'object Friendslist
	var friendsListArrayObject = [];
	var FriendsList = Parse.Object.extend("FriendsList");
 
	var top3MalePosition = findTop3InArray(userFriendArrayMaleScore);
	var top3FemalePosition = findTop3InArray(userFriendArrayFemaleScore);
	
	
	//on boucle pour chaque friends fille de la reponse
	for (var i=0; i< 3; i++) {
	
		var newFriendObject = new FriendsList();
		
		newFriendObject.set("user", currentUser);
		//on set prospect avec le newfriend
		newFriendObject.set("friends", userFriendArrayFemale[top3FemalePosition[i]]);
		//on set le sexe 
		newFriendObject.set("sexe", "female");
		//on set le nombre devent ensemble à 1
		newFriendObject.set("eventTogetherCount", userFriendArrayFemaleScore[top3FemalePosition[i]]);
		
		friendsListArrayObject.push(newFriendObject);
		
		
	
	}	
		//on boucle pour chaque friends mec de la reponse
	for (var i=0; i< 3; i++) {
	
		var newFriendObject = new FriendsList();
		
		newFriendObject.set("user", currentUser);
		//on set prospect avec le newfriend
		newFriendObject.set("friends", userFriendArrayMale[top3MalePosition[i]]);
		//on set le sexe 
		newFriendObject.set("sexe", "male");
		//on set le nombre devent ensemble à 1
		newFriendObject.set("eventTogetherCount", userFriendArrayMaleScore[top3MalePosition[i]]);
		
		friendsListArrayObject.push(newFriendObject);
		

	
	}
	
		
	//on save le nouveau prospet pour add en base
	Parse.Object.saveAll(friendsListArrayObject, {
		  success: function(results) {
		  		//on save les stats du user et on les affiche
		  		saveUserBasicStats();					  		
		  		
		  		//on va regarder si il a liker ou share deja
		  		//si il a deja share ou like on affiche tout
		  		if (currentUser.attributes.hasShareOrLike == true) {
		  		
			  		//on cherche les meilleurs amis male et on affiche	
					findUserBestFriendsMale(top3ToPrint);
			  		
			  		//on cherche les meilleurs amies female et on affiche
			  		findUserBestFriendsFemale(top3ToPrint);
			  		
		  		}
		  		
		  		//si il n'a pas share ou like on regarde si c'est un mec ou une fille
		  		else {
		  			//si c'est un mec, on affiche les top potes et on met le shareToSee sur les tops meuf
			  		if (currentUser.attributes.gender == "male"){
				  		//on cherche les meilleurs amis male
				  		findUserBestFriendsMale(top3ToPrint);
				  		findUserBestFriendsFemale(top3NotToPrint);
				  		
				  		//on masque le top fille avec le ShareToSee
				  		printShareToSee()
				  		
				  		
			  		}
			  		//si c'est une fille on affiche les top copines et on met le shareToSee sur les tops mecs
			  		else {
				  		//on cherche les meilleurs amies female
				  		findUserBestFriendsFemale(top3ToPrint);
				  		findUserBestFriendsMale(top3NotToPrint);
				  		
				  		//on masque le top mec avec le ShareToSee
				  		printShareToSee()
				  		
			  		}
			  		
		  		}
			  
		  },
		  error: function( error) {
		    // Execute any logic that should take place if the save fails.
		    // error is a Parse.Error with an error code and description.
		    //console.log(" \n !!!!! Failed to create a new friend:  !!!!! \n" );
		  }
		});



}

/****************************************************
  On affiche les statistiques de base du user
*****************************************************/

function showBasicStats () {
	
	$(".totalInvitedEventsAnswer").empty();
	$(".totalInvitedFriends").empty();
	$(".totalEventMember").empty();
	$(".totalInvitedEventsRecieve").empty();
	$(".totalInvitedFriendsFemale").empty();
	$(".totalInvitedFriendsMale").empty();
	$(".totalInvitedEventsRecieveRatio").empty();
	$(".stat_number_created").empty();
	
	var Statistics = Parse.Object.extend("Statistics");
	var queryCheckInStatisticsBase = new Parse.Query(Statistics);
	
	
	
	queryCheckInStatisticsBase.equalTo("user", currentUser);
	queryCheckInStatisticsBase.first({
		 success: function(userStat) {
			 if(userStat){
			 userStatParseObject = userStat;
			 
			 	var totalInvitedEventsRecieveRatio = Math.round(userStat.attributes.answeredEventCount * 100 /userStat.attributes.invitedEventCount) ;
			 	
			 	$(".totalInvitedEventsAnswer").append(userStat.attributes.answeredEventCount);
			 	$(".totalInvitedFriends").append(userStat.attributes.friendsMetDuringEvent);
			 	$(".totalEventMember").append(userStat.attributes.personMetDuringEvent);
			 	$(".totalInvitedEventsRecieve").append(userStat.attributes.invitedEventCount);
			 	$(".totalInvitedEventsRecieveRatio").append(" (" + totalInvitedEventsRecieveRatio + "%) ");

			 	$(".totalInvitedFriendsFemale").append(userStat.attributes.totalInvitedFriendsFemale  + "&nbsp;");
			 	$(".totalInvitedFriendsMale").append( "" + userStat.attributes.totalInvitedFriendsMale);
			 	$(".stat_number_created").append(userStat.attributes.createdEventCount);
			 	
			 	findUserStatsPosition();
			 }
		 },
		 error: function() {
			 //console.log(" \n !!!!! Fail to retrieve user Stats !!!!! \n" );
			 }
		}); 
	
	$(".basicStat").show();
	

}

/****************************************************
  On save les statistiques de base du user
*****************************************************/

function saveUserBasicStats () {
	
	var Statistics = Parse.Object.extend("Statistics");
	var newUserStat = new Statistics();
	
	newUserStat.set("user", currentUser);
	
	if (invitedEventsFind){
		newUserStat.set("answeredEventCount",answeredEventCountAllTime);
	}
	if (invitedFriendsFind){
		newUserStat.set("friendsMetDuringEvent",invitedFriendsFind);
	}
	if (totalEventMemberCount){
		newUserStat.set("personMetDuringEvent",totalEventMemberCount);
	}
	if (totalInvitRecieve){
		newUserStat.set("invitedEventCount",totalInvitRecieve);
	}
	if (totalEventCreated){
		newUserStat.set("createdEventCount",totalEventCreated);
	}
	
	if (attendingEventCountAllTime){
		newUserStat.set("attendingEventCount",attendingEventCountAllTime);
	}
	if (notAnsweredEventCountAllTime){
		newUserStat.set("notRepliedEventCount",notAnsweredEventCountAllTime);
	}
	if (declineEventCountAllTime){
		newUserStat.set("declinedEventCount",declineEventCountAllTime);
	}
	if (maybeEventCountAllTime){
		newUserStat.set("maybeEventCount",maybeEventCountAllTime);
	}
	
	
	//on save les nouvelles stats
	newUserStat.save(null, {
		  success: function(userStats) {
		  	
		  	userStatParseObject = userStats;
		  
		  	//on save pour le user qu'il a bien des stats
		  	currentUser.set("hasWebStatistics",true);
	        currentUser.save();
	        
		  
		  	//on vide les spans
			$(".totalInvitedEventsAnswer").empty();
			$(".totalInvitedFriends").empty();
			$(".totalEventMember").empty();
			$(".totalInvitedEventsRecieve").empty();
			$(".stat_number_created").empty();
			$(".totalInvitedFriendsFemale").empty();
			$(".totalInvitedFriendsMale").empty();
			$(".totalInvitedEventsRecieveRatio").empty();	
		 	
	 		var totalInvitedEventsRecieveRatio = Math.round(userStats.attributes.answeredEventCount * 100 /userStats.attributes.invitedEventCount) ;
		 	
		 	$(".totalInvitedEventsAnswer").append(userStats.attributes.answeredEventCount);
		 	$(".totalInvitedFriends").append(userStats.attributes.friendsMetDuringEvent);
		 	$(".totalEventMember").append(userStats.attributes.personMetDuringEvent);
		 	$(".totalInvitedEventsRecieve").append(userStats.attributes.invitedEventCount);
		 	$(".totalInvitedEventsRecieveRatio").append(" (" + totalInvitedEventsRecieveRatio + "%) ");
		 	$(".stat_number_created").append(userStats.attributes.createdEventCount);
		 	
		 	findUserStatsPosition();
			
			
			var totalMaleInvited = 0;
			var totalFemaleInvited = 0;
			 

			for (var i = 0; i < userFriendArrayMaleScore.length; i++) {	
				totalMaleInvited += userFriendArrayMaleScore[i];
			}
			
			

			$(".totalInvitedFriendsMale").empty();
			$(".totalInvitedFriendsMale").append( "" + totalMaleInvited);
			
			//on save pour le user
			userStats.set("totalInvitedFriendsMale",totalMaleInvited);
			userStats.save();
			
			//on replace la cover
			initImagePosition ();

						
			for (var i = 0; i < userFriendArrayFemaleScore.length; i++) {	
				totalFemaleInvited += userFriendArrayFemaleScore[i];
			}
			
			$(".totalInvitedFriendsFemale").empty();
			$(".totalInvitedFriendsFemale").append(totalFemaleInvited  + "&nbsp;");
			
			
			//on save pour le user
			userStats.set("totalInvitedFriendsFemale",totalFemaleInvited);
			userStats.save();
			
			//on replace la cover
			initImagePosition ();
						

		  },
		  error: function() {
		    // Execute any logic that should take place if the save fails.
		    // error is a Parse.Error with an error code and description.
		    //console.log('\n !!!!! Failed to save user stats !!!!! \n ');
		  }
		});	
		
	$(".basicStat").show();
	
	

}

/****************************************************
  On affiche les statistiques de base du user
*****************************************************/

function getUserTotalNumberOfInvit (apiUrl, rsvpStatus) {



	//on va recup le nombre total d'invitation à des evenements
	FB.api(apiUrl, function(response) {
		totalInvitRecieve+=response.data.length;
		
		if (rsvpStatus == "attending" || rsvpStatus == "maybe") {
			answeredEventCountAllTime+=response.data.length;
		}
		if (rsvpStatus == "not_replied" ) {
			notAnsweredEventCountAllTime +=response.data.length;
		}
		if (rsvpStatus == "maybe" ) {
			maybeEventCountAllTime +=response.data.length;
		}
		if (rsvpStatus == "declined" ) {
			declineEventCountAllTime +=response.data.length;
		}	
		if (rsvpStatus == "attending") {
			attendingEventCountAllTime +=response.data.length;
		}
		
		//si il y a une pagination on relance une recherche sur lapi
		if (response.data.length > 0) {
			getUserTotalNumberOfInvit(response.paging.next);
		}	
	});

}

/****************************************************
  On va recup le nombre total d'event crée
*****************************************************/

function getUserTotalNumberOfCreatedEvent (apiUrl) {

	//on va recup le nombre total d'invitation à des evenements
	FB.api(apiUrl, function(response) {
		totalEventCreated +=response.data.length;
		
		//si il y a une pagination on relance une recherche sur lapi
		if (response.data.length > 0) {
			getUserTotalNumberOfInvit(response.paging.next);
		}	
	});

}


/****************************************************
  On va chercher les meilleures amis male du user
*****************************************************/

function findUserBestFriendsMale (printTopFriends) {

	
	//on creer la requete pour verif si existe dans la table friends
	 var FriendsList = Parse.Object.extend("FriendsList");
	 var queryCheckInFriendsListBase = new Parse.Query(FriendsList);
	 
	 queryCheckInFriendsListBase.equalTo("user", currentUser);
	 queryCheckInFriendsListBase.equalTo("sexe", "male");
	 
	 //on recupere du plus grand au plus petit
	 queryCheckInFriendsListBase.descending("eventTogetherCount");
	 // on ne prend que les 3 premiers
	 queryCheckInFriendsListBase.limit(3);
	 
	 queryCheckInFriendsListBase.find({
		 success: function(topFriendsId) {
		 	if (topFriendsId != "") {
		 		getBestFriendsInfoMale(topFriendsId, printTopFriends);
		 		
		 		//on ajoute les 3 object dans notre tableau pour la creation de l'image à share
		 		top3BroParseObject = topFriendsId;
		 	}
		 	else {
			 	//si pas de top friends on lance la recuperation des infos sur le user
			 	//on va recuperer sa liste d'amis
				var userFriendApiUrl = "/me/friends?fields=id,gender&limit=50";
				getUserFriendList(userFriendApiUrl);
		 	}
		 
		 },
		 error: function() {
			 //console.log(" \n !!!!! !!!!! \n" );
			 }
		}); 
	 
}

/**********************************************************
   On récupère les infos sur les 3 top friends
***********************************************************/
function getBestFriendsInfoMale (topFriendsId , printTopFriends) {
	$(".loader").hide(); 
	$(".bestFriends").show();
	
	//on fait le top 1	
	var apiUrl = "/"+ topFriendsId[0].get("friends") +"?fields=id,name,first_name,last_name,gender,picture.type(large)";
	
	//on lance la requete
	FB.api(apiUrl, function(response) {
		//on cree un objet qui contient les infos du user
		var fbUserInfoObject = response;
		//on stock les 3 noms des top user Male
		topFriendMaleName[0]= fbUserInfoObject.name;
		topFriendMale[0]= fbUserInfoObject; 
		topFriendMaleFirstName[0]= fbUserInfoObject.first_name;
		topFriendMaleLastName[0]= fbUserInfoObject.last_name;
		

		//on fait le top 2
		var apiUrl = "/"+ topFriendsId[1].get("friends") +"?fields=id,name,first_name,last_name,gender,picture.type(large)";
		
		//on lance la requete
		FB.api(apiUrl, function(response) {
			//on cree un objet qui contient les infos du user
			var fbUserInfoObject = response;
			//on stock les 3 noms des top user Male
			topFriendMaleName[1]= fbUserInfoObject.name;
			topFriendMale[1]= fbUserInfoObject;
			topFriendMaleFirstName[1]= fbUserInfoObject.first_name;
			topFriendMaleLastName[1]= fbUserInfoObject.last_name;
					

			//on fait le top 3
			var apiUrl = "/"+ topFriendsId[2].get("friends") +"?fields=id,name,first_name,last_name,gender,picture.type(large)";
			
			//on lance la requete
			FB.api(apiUrl, function(response) {
					//on cree un objet qui contient les infos du user
					var fbUserInfoObject = response;
					//on stock les 3 noms des top user Male
					topFriendMaleName[2]= fbUserInfoObject.name;
					topFriendMale[2]= fbUserInfoObject; 
					topFriendMaleFirstName[2]= fbUserInfoObject.first_name;
					topFriendMaleLastName[2]= fbUserInfoObject.last_name;
				
					//on regarde si il faut afficher le top
					if (printTopFriends == true){
					
						for (i=0; i<3; i++){
							var friendsCount = topFriendsId[i].get("eventTogetherCount");
							
							//on defini le nom des classes
							var friendNameClassName = ".bestFriends" + i + "_Name_male";
							var friendCountClassName = ".bestFriends" + i + "_Count_male";
							var friendPictureClassName = ".bestFriends_Picture_male" + i;
							var friendPictureFbSend = ".bestFriendsMale" + i + "_Img_Fbsend";
				
							//on vide les champs
							$(friendPictureClassName).empty();
							$(friendNameClassName).empty();
							$(friendCountClassName).empty();
							$(friendPictureFbSend).empty();
							
							//on affiche les infos dans les champs
							$(friendPictureClassName).append("<img  onload=\"initProfilPicturePosition('male')\"  class=\" bestFriends_Picture_male_img" + i +"\" src=\""+ topFriendMale[i].picture.data.url +"\" class=\"img-rounded\"  >");
							$(friendNameClassName).append(topFriendMale[i].name);
							$(friendCountClassName).append(friendsCount);
							$(friendPictureFbSend).append('<img  onclick="fb_send_dialog('+ topFriendsId[i].get("friends") +')" class="hidden-xs hidden-sm" src="img/btn_send.png" width="110px" style="cursor : pointer;" >');	
							
						}
						
					//on affiche le container	
					$(".topMale_Stats").show(); 
					
					}
				});
			});
		});				
}

/****************************************************
  On va chercher les meilleures amis du user
*****************************************************/

function findUserBestFriendsFemale (printTopFriends) {

	
	//on creer la requete pour verif si existe dans la table friends
	 var FriendsList = Parse.Object.extend("FriendsList");
	 var queryCheckInFriendsListBase = new Parse.Query(FriendsList);
	 
	 queryCheckInFriendsListBase.equalTo("user", currentUser);
	 queryCheckInFriendsListBase.equalTo("sexe", "female");
	 
	 //on recupere du plus grand au plus petit
	 queryCheckInFriendsListBase.descending("eventTogetherCount");
	 // on ne prend que les 3 premiers
	 queryCheckInFriendsListBase.limit(3);
	 
	 queryCheckInFriendsListBase.find({
		 success: function(topFriendsId) {
		 	if (topFriendsId != "") {
		 		getBestFriendsInfoFemale(topFriendsId, printTopFriends);
		 		//on ajoute les 3 object dans notre tableau pour la creation de l'image à share
		 		top3GirlsParseObject = topFriendsId;
		 	}
		 	else {
			 		//on a deja lancé la recherche dans la recuperation des tops mecs
		 	}
		 
		 },
		 error: function() {
			 //console.log(" \n !!!!! !!!!! \n" );
			 }
		}); 
	 
}

/**********************************************************
   On récupère les infos sur les 3 top friends
***********************************************************/
function getBestFriendsInfoFemale (topFriendsId,printTopFriends) {
	$(".loader").hide(); 
	$(".bestFriends").show();
	
	
	
	//on fait le top 1	
	var apiUrl = "/"+ topFriendsId[0].get("friends") +"?fields=id,name,first_name,last_name,gender,picture.type(large)";
	
	//on lance la requete
	FB.api(apiUrl, function(response) {
		//on cree un objet qui contient les infos du user
		var fbUserInfoObject = response;
		//on stock les 3 noms des top user fille
		topFriendFemaleName[0]= fbUserInfoObject.name;
		topFriendFemale[0]= fbUserInfoObject; 
		topFriendFemaleFirstName[0]= fbUserInfoObject.first_name;
		topFriendFemaleLastName[0]= fbUserInfoObject.last_name;

		//on fait le top 2
		var apiUrl = "/"+ topFriendsId[1].get("friends") +"?fields=id,name,first_name,last_name,gender,picture.type(large)";
		
		//on lance la requete
		FB.api(apiUrl, function(response) {
				//on cree un objet qui contient les infos du user
				var fbUserInfoObject = response;
				//on stock les 3 noms des top user fille
				topFriendFemaleName[1]= fbUserInfoObject.name;
				topFriendFemale[1]= fbUserInfoObject;	
				topFriendFemaleFirstName[1]= fbUserInfoObject.first_name;
				topFriendFemaleLastName[1]= fbUserInfoObject.last_name;	

				//on fait le top 3
				var apiUrl = "/"+ topFriendsId[2].get("friends") +"?fields=id,name,first_name,last_name,gender,picture.type(large)";
				
				//on lance la requete
				FB.api(apiUrl, function(response) {
						//on cree un objet qui contient les infos du user
						var fbUserInfoObject = response;
						//on stock les 3 noms des top user fille
						topFriendFemaleName[2]= fbUserInfoObject.name;
						topFriendFemale[2]= fbUserInfoObject; 
						topFriendFemaleFirstName[2]= fbUserInfoObject.first_name;
						topFriendFemaleLastName[2]= fbUserInfoObject.last_name;
	
						//on vérifie si il faut afficher le top
						if (printTopFriends == true){	
							//on affiche le top 3
							for (i = 0; i < 3 ; i++){
							
								var friendsCount = topFriendsId[i].get("eventTogetherCount");
					
								//on defini le nom des classes
								var friendNameClassName = ".bestFriends" + i + "_Name_female";
								var friendCountClassName = ".bestFriends" + i + "_Count_female";
								var friendPictureClassName = ".bestFriends_Picture_female" + i;
								var friendPictureFbSend = ".bestFriendsFemale" + i + "_Img_Fbsend";
						
								//on vide les champs
								$(friendPictureClassName).empty();
								$(friendNameClassName).empty();
								$(friendCountClassName).empty();
								$(friendPictureFbSend).empty();
								
								//on affiche les infos dans les champs
								$(friendPictureClassName).append("<img onload=\"initProfilPicturePosition('female')\" class=\" bestFriends_Picture_female_img" + i + "\" src=\""+ topFriendFemale[i].picture.data.url +"\" class=\"img-rounded\"  >");
								$(friendNameClassName).append(topFriendFemale[i].name);
								$(friendCountClassName).append(friendsCount);	
								$(friendPictureFbSend).append('<img  onclick="fb_send_dialog('+ topFriendsId[i].get("friends") +')" class="hidden-xs hidden-sm" src="img/btn_send.png" width="110px" style="cursor : pointer;" >');	
									
											
					
							}
							
							//on affiche le container
							$(".topFemale_Stats").show();
							

							
							
						
						}
						if (photoHasBeenCreated == false) {
							createPictureToShare(false);
						}
				});
			});
		});
					
}

/**********************************************************
   On crawl la liste des invites d'un event
***********************************************************/
function countTotalEventMember (eventId) {
	var fqlQuery = "SELECT all_members_count FROM event WHERE eid=" + eventId;
	//on lance la requete
	FB.api('fql', { q: fqlQuery },  function(response) {
	
		if (!response.data[0].all_members_count){
			
		}
		else {
			totalEventMemberCount += response.data[0].all_members_count;
		}
		
		});

}

/****************************************************************************
   Afficher le shareToSee au bon endroit (sur top fille ou top mec)
*****************************************************************************/

function printShareToSee (){
	
	//si le current user est un homme, on affiche le ShareToSee sur le top fille
	if (currentUser.attributes.gender == "male"){
	$(".topFemale_Stats").hide();
	$(".topFemale_ShareToSee").show();
	
	}// si c'est une femme on fait l'inverse
	else {
	$(".topMale_Stats").hide();
	$(".topMale_ShareToSee").show();
	}

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
	on verifie si il peut publier
***********************************************************/
function canPublishStream(){
	
			Parse.FacebookUtils.logIn("publish_stream", {
					
					  success: function(user) {
					  	if (photoHasBeenCreated == true) {
					  	
					  	//on affiche un loader
						document.body.appendChild(target);
						var spinner = new Spinner(opts).spin(target);
						overlay = iosOverlay({
								text: wording_stats_popup_prepare,
								spinner: spinner
								});	
								
							sharePicture();
						} 
						else {
							createPictureToShare(true);
						}
						
					  },
					  error: function(user, error) {
					    //console.log("\n !!!!! User cancelled the Facebook login or did not fully authorize. !!!!! \n");
					  }
			});

} 


/**********************************************************
	 on creer la photo à partager
***********************************************************/

function createPictureToShare(creationPhotoManuelle) {

	if (creationPhotoManuelle == true) {
	
		//on affiche un loader
		document.body.appendChild(target);
		var spinner = new Spinner(opts).spin(target);
		overlay = iosOverlay({
				text: wording_stats_popup_prepare,
				spinner: spinner
				});		


		
		printUserPhotoOnCanva(0 , creationPhotoManuelle);
	}
	//si c'est la creation automatique en background on n'affiche pas de loader
	else {
		printUserPhotoOnCanva(0 , creationPhotoManuelle);
	}
	
	

}
/**********************************************************
	 Afficher la photo pret à partager dans le Canva
***********************************************************/

function printUserPhotoOnCanva(friendsPosition , creationPhotoManuelle) {	
		var canvaVar = document.getElementById("canvaPhotoToShare");
		var ctx = canvaVar.getContext("2d");
		
		
		var imageMale = new Image();
		var imageFemale = new Image();  
		
		//on encode l'url female
		var urlEncodedFemale = encodeURIComponent(topFriendFemale[friendsPosition].picture.data.url);
		//on va récupérer l'url via notre proxy
		imageFemale.src = "//woovent.com/testimage?url=" + urlEncodedFemale ;

		//on encode l'url male
		var urlEncodedMale = encodeURIComponent(topFriendMale[friendsPosition].picture.data.url);
		//on va récupérer l'url via notre proxy
		imageMale.src = "//woovent.com/testimage?url=" + urlEncodedMale ;
	
	
		if (friendsPosition == 0) {
		
			var x_image_position_Male = 142;
			var x_image_position_Female = 510;
			
			var y_image_position_Female = 498;
			var y_image_position_Male = 498;
			
			var image_position_size =110;
			
		}
		
		if (friendsPosition == 1) {
		
			var x_image_position_Male = 53;
			var x_image_position_Female = 422;
			
			var y_image_position_Female = 785;
			var y_image_position_Male = 785;
			
			var image_position_size =84;
			
		}
		
		if (friendsPosition == 2) {
		
			var x_image_position_Male = 245;
			var x_image_position_Female = 614;
			
			var y_image_position_Female = 785;
			var y_image_position_Male = 785;
			
			var image_position_size =84;
			
		}

	
	
		imageFemale.onload = function() {
			//on récupère dans "image", la portion de widthToCrop x heightToCrop pixels aux coordonnées [pixelToStartCrop, 0], et on la place sur le canvas aux coordonnées [x_image_position, y_image_position] pour enfin l'agrandir à 333x350 pixels.
		  
		  imgFemaleWidth = imageFemale.width;
		  imgFemaleHeight = imageFemale.height;
		  
		  //si photo paysage
		  if (imgFemaleWidth > imgFemaleHeight){
			 var pixelFemaleToStartCropX = (imgFemaleWidth - imgFemaleHeight) / 2;
			 var pixelFemaleToStartCropY = 0;
			 var sizeFemaleToCrop = imgFemaleHeight;
		  }
		  //si photo portrait
		  if (imgFemaleHeight > imgFemaleWidth ){
			 var pixelFemaleToStartCropX = 0;
			 var pixelFemaleToStartCropY = (imgFemaleHeight - imgFemaleWidth) / 2;
			 var sizeFemaleToCrop = imgFemaleWidth;
		  }
		  //si photo deja carré
		  else {
			  var pixelFemaleToStartCropX = 0;
			  var pixelFemaleToStartCropY = 0;
			  var sizeFemaleToCrop = imgFemaleHeight;
		  }
			ctx.drawImage(this,pixelFemaleToStartCropX,pixelFemaleToStartCropY,sizeFemaleToCrop,sizeFemaleToCrop,x_image_position_Female,y_image_position_Female,image_position_size,image_position_size);
			
		};
		
		imageMale.onload = function() {
			//on récupère dans "image", la portion de widthToCrop x heightToCrop pixels aux coordonnées [pixelToStartCrop, 0], et on la place sur le canvas aux coordonnées [x_image_position, y_image_position] pour enfin l'agrandir à 333x350 pixels.
			
		  imgMaleWidth = imageMale.width;
		  imgMaleHeight = imageMale.height;
		  
		  //si photo paysage
		  if (imgMaleWidth > imgMaleHeight){
			 var pixelMaleToStartCropX = (imgMaleHeight - imgMaleHeight) / 2;
			 var pixelMaleToStartCropY = 0;
			 var sizeMaleToCrop = imgMaleHeight;
		  }
		  //si photo portrait
		  if (imgMaleHeight > imgMaleWidth ){
			 var pixelMaleToStartCropX = 0;
			 var pixelMaleToStartCropY = (imgMaleHeight - imgMaleHeight) / 2;
			 var sizeMaleToCrop = imgMaleWidth;
		  }
		  //si photo deja carré
		  else {
			  var pixelMaleToStartCropX = 0;
			  var pixelMaleToStartCropY = 0;
			  var sizeMaleToCrop = imgMaleHeight;
		  }	
			ctx.drawImage(this,pixelMaleToStartCropX,pixelMaleToStartCropY,sizeMaleToCrop,sizeMaleToCrop,x_image_position_Male,y_image_position_Male,image_position_size,image_position_size);
		
			friendsPosition++;
			//on verifie si on a pas deja affiché les 3 top friends
			if (friendsPosition < 3){
				printUserPhotoOnCanva(friendsPosition, creationPhotoManuelle);
			}
			else {
				//si on a affiché les 3 alors on va save la photo
				saveSharePicture(creationPhotoManuelle);
			}
		};
}

/**********************************************************
	 post picture into user wall
***********************************************************/

function saveSharePicture(creationPhotoManuelle) 
{
	if (creationPhotoManuelle == true) {
		overlay.update({
					text: wording_stats_popup_create
					});	
	}	

	//on initialise le canva
	var canvaVar = document.getElementById("canvaPhotoToShare");
	var ctx = canvaVar.getContext("2d");
	
	// Fond Image
	var shareImg = new Image();
	shareImg.src = 'img/BG_Canva_share.png';
	shareImg.onload = function(){
	
	ctx.drawImage(this, 0,0,750,1154,0,0,750, 1154);
	
	
	//nb name
	var text = "- " + currentUser.attributes.name + " -";
	ctx.textAlign = "center";
	ctx.font = "30px helvet_normal";
	ctx.fillStyle = "white";
	ctx.fillText(text,375,100);
	
	//nb event join
	var text = userStatParseObject.attributes.invitedEventCount;
	ctx.font = "48px helvet_normal";
	ctx.fillText(text,375,300);
	
	//nb male meet
	var text = userStatParseObject.attributes.totalInvitedFriendsMale;
	ctx.font = "38px helvet_normal";
	ctx.fillText(text,195,310);
	
	//nb female meet
	var text = userStatParseObject.attributes.totalInvitedFriendsFemale;
	ctx.font = "38px helvet_normal";
	ctx.fillText(text,565,310);
	
	ctx.shadowOffsetX = 2;
	ctx.shadowOffsetY = 2;
	ctx.shadowBlur = 5;
	ctx.shadowColor = 'black';
	
	//Top 1 male & female name
	var textMale1 = topFriendMaleName[0];
	var textFemale1 = topFriendFemaleName[0];
	ctx.font = "24px helvet_bold";
	ctx.fillText(textMale1,200,660);
	ctx.fillText(textFemale1,570,660);
	
	//Top 1 male & female pseudo
	var textMale1 = wording_topMale_1_title;
	var textFemale1 = wording_topFemale_1_title;
	ctx.font = "20px helvet_italic";
	ctx.fillText(textMale1,200,690);
	ctx.fillText(textFemale1,570,690);
	
	//Top 1 male & female count
	var textMale1 = top3BroParseObject[0].get("eventTogetherCount");
	var textFemale1 = top3GirlsParseObject[0].get("eventTogetherCount");
	ctx.font = "24px helvet_normal";
	ctx.fillText(textMale1,130,720);
	ctx.fillText(textFemale1,500,720);
	
	//Top 2 & 3 male quote
	var textMale2 = wording_topMale_2_title;
	var textMale3 = wording_topMale_3_title;
	ctx.font = "19px helvet_italic";
	ctx.fillText(textMale2,95,935);
	ctx.fillText(textMale3,285,935);
	
	//Top 2 & 3 female quote
	var textFemale2 = wording_topFemale_2_title;
	var textFemale3 = wording_topFemale_3_title;
	ctx.font = "19px helvet_italic";
	ctx.fillText(textFemale2,470,935);
	ctx.fillText(textFemale3,655,935);
	
	var textEventCount = "Events together";
	ctx.font = "18px helvet_normal";
	ctx.fillText(textEventCount,213,720);
	ctx.fillText(textEventCount,583,720);
	
	//Top 2 & 3 male name
	var textMale2 = topFriendMaleFirstName[1] + " " + topFriendMaleLastName[1].charAt(0) + ".";
	var textMale3 = topFriendMaleFirstName[2] + " " + topFriendMaleLastName[2].charAt(0) + ".";
	ctx.font = "24px helvet_bold";
	ctx.fillText(textMale2,95,910);
	ctx.fillText(textMale3,285,910);
	
	//Top 2 & 3 male count
	var textMale2 = top3BroParseObject[1].get("eventTogetherCount");
	var textMale3 = top3BroParseObject[2].get("eventTogetherCount");
	ctx.font = "24px helvet_normal";
	ctx.fillText(textMale2,65,960);
	ctx.fillText(textMale3,255,960);
	
	//Top 2 & 3 femmale name
	var textFemale2 = topFriendFemaleFirstName[1] + " " + topFriendFemaleLastName[1].charAt(0) + ".";
	var textFemale3 = topFriendFemaleFirstName[2] + " " + topFriendFemaleLastName[2].charAt(0) + ".";
	ctx.font = "24px helvet_bold";
	ctx.fillText(textFemale2,470,910);
	ctx.fillText(textFemale3,655,910);
	
	//Top 2 & 3 female  count
	var textFemale2 = top3GirlsParseObject[1].get("eventTogetherCount");
	var textFemale3 = top3GirlsParseObject[2].get("eventTogetherCount");
	ctx.font = "24px helvet_normal";
	ctx.fillText(textFemale2,435,960);
	ctx.fillText(textFemale3,620,960);
	
	var textEventCount = "Events";
	ctx.font = "18px helvet_normal";
	ctx.fillText(textEventCount,110,960);
	ctx.fillText(textEventCount,300,960);
	ctx.fillText(textEventCount,480,960);
	ctx.fillText(textEventCount,668,960);
	
	

	var canvasInfos = document.getElementById('canvaPhotoToShare');
	var dataURL = canvasInfos.toDataURL("image/png")
	var dateURLBase64 = dataURL.replace("data:image/png;base64," , "");

	//on va save la photo
	var parseFile = new Parse.File("photoToShare.png", { base64: dateURLBase64 });
	 parseFile.save().then(function() {
	 
		//on recherche les statistics du user
		 var Statistics = Parse.Object.extend("Statistics");
		 var queryCheckInStatisticsBase = new Parse.Query(Statistics);
		 
		 queryCheckInStatisticsBase.equalTo("user", currentUser);
		 
		 queryCheckInStatisticsBase.first({
			 success: function(results) {
			 	
				if (results){
					results.set("topFemalePictureToShare", parseFile);	
				}
				
				//on save les stats avec la photo
				results.save(null, {
					success: function(resultsCreated) {
						
						urlPhotoToShare = resultsCreated.attributes.topFemalePictureToShare._url;	
						photoHasBeenCreated = true;
						
						if (creationPhotoManuelle == true) {
							overlay.update({
										text: wording_stats_popup_save
										});	
						}
						
						//si creation de photo lance manuellement on share
						if (creationPhotoManuelle ==  true) {
							sharePicture();
						}
						
						
						
					},
					error: function() {
				    //console.log(" \n !!!!! !!!!! \n" );
				    }
				});
					
			},
			 error: function() {
			    // Execute any logic that should take place if the save fails.
			    // error is a Parse.Error with an error code and description.
			    //console.log('\n !!!!! Failed to save user stats !!!!! \n ');
			  }
			});
		});		
		
		}


}
/**********************************************************
	 post picture into user wall
***********************************************************/

function sharePicture() {

		 var userLang = navigator.language || navigator.userLanguage; 
		 var textToShare = "Here's my top party bro! Find yours : https://www.woovent.com/lookback #Woovent #FacebookEventsOnSteroids"
		 if (userLang == "fr"){
		 	//si c'est une fille
		 	if (currentUser.attributes.gender == "female"){
		 		var textToShare = topFriendMaleFirstName[0] + ", " + topFriendMaleFirstName[1] + " et " + topFriendMaleFirstName[2] + " sont mes meilleurs potes de soirées ! A vous de découvrir les votres ici : https://www.woovent.com/lookback #Woovent #FacebookEventsOnSteroids";
		 	}
		 	//si c'est un mec
		 	else {
		 		var textToShare = topFriendFemaleFirstName[0] + ", " + topFriendFemaleFirstName[1] + " et " + topFriendFemaleFirstName[2] + " sont mes meilleurs copines de soirées ! A vous de découvrir les votres ici : https://www.woovent.com/lookback #Woovent #FacebookEventsOnSteroids";
		 	}
		 	
		 	
		 }else {
			//si c'est une fille
		 	if (currentUser.attributes.gender == "female"){
		 		var textToShare = topFriendMaleFirstName[0] + ", " + topFriendMaleFirstName[1] + " and " + topFriendMaleFirstName[2] + " are my top party bros! Find yours here : https://www.woovent.com/lookback #Woovent #FacebookEventsOnSteroids";
		 	}
		 	//si c'est un mec
		 	else {
		 		var textToShare = topFriendFemaleFirstName[0] + ", " + topFriendFemaleFirstName[1] + " et " + topFriendFemaleFirstName[2] + " are my top party girls! Find yours here : https://www.woovent.com/lookback #Woovent #FacebookEventsOnSteroids";
		 	}
		 }

	
	
	
	//on fait le post
	FB.api(
		    "/me/photos",
		    "POST",
		    {
		    	"url" : urlPhotoToShare,
		    	"name" : textToShare
		    },
		    function (response) {
		      if (response && !response.error) {
		        /* handle the result */
		        
		        
		        	
				  	overlay.update({
						icon: "img/check.png",
						text: wording_stats_popup_done
					});
				
					_gaq.push(['_trackEvent', 'Share', 'SharePictureStatsFacebook', 'SharePictureOnFacebook']);
				
		        
		        //on tag les tops filles
		        FB.api(
					    "/"+response.id+"/tags",
					    "POST",
					    {
					    	
								"tags" : "[{\"tag_uid\":\"" + top3GirlsParseObject[0].attributes.friends + "\"}, {\"tag_uid\":\"" + top3GirlsParseObject[1].attributes.friends + "\"}, {\"tag_uid\":\"" + top3GirlsParseObject[2].attributes.friends + "\"}, {\"tag_uid\":\"" + top3BroParseObject[0].attributes.friends + "\"}, {\"tag_uid\":\"" + top3BroParseObject[1].attributes.friends + "\"}, {\"tag_uid\":\"" + top3BroParseObject[2].attributes.friends + "\"}]"
							
					    	
					    },
					    function (response) {
					    
					    
					    
					    setTimeout(function () {
							overlay.hide();
					    }, 2000);
					    
					    
					   	 
					      if (response && !response.error) {
							  

					        
					        //on passe la variable shareorlike a true pour le current user
					        currentUser.set("hasShareOrLike",true);
					        currentUser.save();
					        
					        $('#downloadTheApp').modal('show');
					        
					        //on cache le ShareToSee
					        $(".femaleHiddingRow").hide();
					        $(".maleHiddingRow").hide();
					        
					        //on affiche le top 3 manquant
					  		//si c'est un mec, on affiche les top femme 
						  	if (currentUser.attributes.gender == "male"){
							  	//on cherche les meilleurs amis male
							  	findUserBestFriendsFemale(top3ToPrint);
							  		
						  	}
						  	//si c'est une fille on affiche les top mec 
						  	else {
							  	findUserBestFriendsMale(top3ToPrint);
							}

						 }
						}
				);
		      }
		    }
	);

}


/* Scroll Smouth */
$('a[href^="#"]').live('click',function (e) { e.preventDefault(); var target = this.hash, $target = $(target); $('html, body').stop().animate({ 'scrollTop': $target.offset().top }, 900, 'swing', function () { window.location.hash = target; }); });

/*************************************************************
****************** Initialise position des images *********************
*************************************************************/
function initImagePosition () {
	var imgHeight = $("#imgCoverBig").height(); 
	var divHeight = $(".profil_picture_cover").height();
	
	var marginTop = (divHeight - imgHeight) / 2;
		
	$('#imgCoverBig').css('margin-top',marginTop);
	
	for (i=0 ; i< 10 ; i++ ){
		var EventBox_className = ".EventCover_box" + i;
	
		var coverHeight = $(EventBox_className).height(); 
		var coverdivHeight = 170;
		
		var covermarginTop = ((coverdivHeight - coverHeight) / 2 ) - 20;
			
		$(EventBox_className).css('margin-top',covermarginTop);
		
		//console.log("covermarginTop " + covermarginTop +" coverHeight : " + coverHeight) ;
		
	}
	
}

/*************************************************************
****************** Initialise position des images de profil *********************
*************************************************************/
function initProfilPicturePosition (profilPicToInit) {


	if (profilPicToInit == "male"){
		var EventBox_classNameGender = ".bestFriends_Picture_male_img";
	}
	else {
		var EventBox_classNameGender = ".bestFriends_Picture_female_img";
	}

	for (i=0 ; i< 3 ; i++ ){
		var EventBox_className = EventBox_classNameGender + i;
	
		var profilPicHeight = $(EventBox_className).height(); 
		var profilPicWidth = $(EventBox_className).width(); 
		
		var profilPicdivsize = 110;
		
		//si en mode portrait
		if (profilPicHeight > profilPicWidth && profilPicWidth != 0 && profilPicHeight != 0 ){
		
			$(EventBox_className).css('width',110);
			var newProfilPicHeight = $(EventBox_className).height(); 
			
			var profilPicMarginTop = ((profilPicdivsize - newProfilPicHeight) / 2 );
			$(EventBox_className).css('margin-top',profilPicMarginTop);
			
		}
		//si paysage
		else if (profilPicHeight < profilPicWidth && profilPicWidth != 0 && profilPicHeight != 0){
			$(EventBox_className).css('height',110);
			var newProfilPicWidth = $(EventBox_className).width(); 
			
			var profilPicMarginTop = ((profilPicdivsize - newProfilPicWidth) / 2 );
			$(EventBox_className).css('margin-left',profilPicMarginTop);
			
		}
		else if (profilPicHeight == profilPicWidth && profilPicWidth != 0 && profilPicHeight != 0){
			$(EventBox_className).css('height',110);
			$(EventBox_className).css('width',110);
		}
		//si les images ne sont pas encore chargé
		else {
			
		}

		//console.log("profilPicMarginTop " + profilPicMarginTop +" profilPicHeight : " + profilPicHeight + " profilPicWidth " + profilPicWidth) ;
		
		
	}
initProfilPictureCover();

}

/**********************************************************
   On affiche la cover du user
***********************************************************/
function initProfilPictureCover(){
	
	var profilPicHeight = $(".cover_Picture_img").height(); 
	var profilPicWidth = $(".cover_Picture_img").width(); 
	
	var profilPicdivsize = 110;
	
	//si en mode portrait
	if (profilPicHeight > profilPicWidth && profilPicWidth != 0 && profilPicHeight != 0 ){
	
		$(".cover_Picture_img").css('width',110);
		var newProfilPicHeight = $(".cover_Picture_img").height(); 
		
		var profilPicMarginTop = ((profilPicdivsize - newProfilPicHeight) / 2 );
		$(".cover_Picture_img").css('margin-top',profilPicMarginTop);
		
	}
	//si paysage
	else if (profilPicHeight < profilPicWidth && profilPicWidth != 0 && profilPicHeight != 0){
		$(".cover_Picture_img").css('height',110);
		var newProfilPicWidth = $(".cover_Picture_img").width(); 
		
		var profilPicMarginTop = ((profilPicdivsize - newProfilPicWidth) / 2 );
		$(".cover_Picture_img").css('margin-left',profilPicMarginTop);
		
	}
	else if (profilPicHeight == profilPicWidth && profilPicWidth != 0 && profilPicHeight != 0){
		$(".cover_Picture_img").css('height',110);
		$(".cover_Picture_img").css('width',110);
	}
	//si les images ne sont pas encore chargé
	else {
		
	}
	
	initImagePosition ();



}

/**********************************************************
   On affiche la cover du user
***********************************************************/
function printUserCover(){

//on affiche le name
$(".cover_userName").empty();
$(".cover_userName").append(currentUser.attributes.name);

$(".user_FirstName").empty();
$(".user_FirstName").append(currentUser.attributes.first_name);

//on affiche la profil pic

$(".cover_profilPicture").empty();
$(".cover_profilPicture").append("<img  onload=\"initProfilPictureCover()\"  class=\" cover_Picture_img \" src=\""+ currentUser.attributes.pictureURL +"\"  >");


//on affiche la cover

$(".profil_picture_cover").empty();
$(".profil_picture_cover").append("<img src=\""+ currentUser.attributes.pictureURL +"\" onload=\"initProfilPictureCover()\" id=\"imgCoverBig\">");

initImagePosition ();
	
}

/**********************************************************
   Did the user like the fan page
***********************************************************/

function hasUserLikeFanPage() {

	FB.api({
	    method:"pages.isFan",
	    page_id:600308563362702
	},  function(response) {
	        
	        if(response){
	            $(".btn_shareToSee_like_fanpage").hide();
	            $(".btn_shareToSee_like_fanpage_text").hide();
	            $(".shareToSee_or_text").hide();
	            
	            
	        } else {
	            
	        }
	    }
	);
	
}
/**********************************************************
   Twitter Share button
***********************************************************/
function fbs_click() {

		 var userLang = navigator.language || navigator.userLanguage; 
		 
		 
		 if (userLang == "fr"){
		 	var twtTitle = "Wooow! Grâce à @wooventapp j'ai vu que j'avais recu " + userStatParseObject.attributes.invitedEventCount + " invitations à des events Facebook! Toutes les stats ici :";
		 }else {
			 var twtTitle = "Wooow! Thanks to @wooventapp I saw that i received " + userStatParseObject.attributes.invitedEventCount + " Facebook events invites! All the stats here : ";
		 }

    
    var twtUrl = "http://www.woovent.com/lookback";
    var twtLink = 'http://twitter.com/share?text=' + encodeURIComponent(twtTitle + ' ' + twtUrl);
    window.open(twtLink);
    
    _gaq.push(['_trackEvent', 'Share', 'ShareOnTwitter', 'ShareOnTwitter']);
}

/**********************************************************
   fb send button
***********************************************************/
function fb_send_dialog( friendId) {

	FB.ui({
	    method: 'send',
	    to: friendId ,
	    link: 'https://www.woovent.com/lookback/'
	});
	
	_gaq.push(['_trackEvent', 'SendMessage', 'FacebookMessageSend', 'FacebookMessageSend']);

}

/****************************************************
  On cherche la position du user
*****************************************************/

function findUserStatsPosition() {
	var countPeopleGreaterThan, countPeopleLessThan, userPositionPourcent;
	
	$(".stat_number_big").empty();

	
	var Statistics = Parse.Object.extend("Statistics");
	var queryCheckInStatisticsBaseGreater = new Parse.Query(Statistics);
	var queryCheckInStatisticsBaseLess = new Parse.Query(Statistics);
	
	queryCheckInStatisticsBaseGreater.greaterThan("invitedEventCount", userStatParseObject.attributes.invitedEventCount);
	queryCheckInStatisticsBaseGreater.count({
			  success: function(countPeopleGreaterThan) {
			    // The count request succeeded. Show the count
			    
			    
			    queryCheckInStatisticsBaseLess.lessThan("invitedEventCount", userStatParseObject.attributes.invitedEventCount);
			    queryCheckInStatisticsBaseLess.count({
					  success: function(countPeopleLessThan) {
					    // calcul du pourcentage
					    userPositionPourcent = countPeopleGreaterThan * 100 / (countPeopleLessThan + countPeopleGreaterThan);
					    
					    if (userPositionPourcent >= 0 && userPositionPourcent <= 1){
						    $(".stat_number_big").append("1%");
					    }
					    else if (userPositionPourcent > 1 && userPositionPourcent <= 5){
						    $(".stat_number_big").append("5%");
					    }
					    else if (userPositionPourcent > 5 && userPositionPourcent <= 10){
						    $(".stat_number_big").append("10%");
					    }
					    else if (userPositionPourcent > 10 && userPositionPourcent <= 15){
						    $(".stat_number_big").append("15%");
					    }
					    else if (userPositionPourcent > 15 && userPositionPourcent <= 20){
						    $(".stat_number_big").append("20%");
					    }
					    else if (userPositionPourcent > 20 && userPositionPourcent <= 30){
						    $(".stat_number_big").append("30%");
					    }
					    else if (userPositionPourcent > 30 && userPositionPourcent <= 40){
						    $(".stat_number_big").append("40%");
					    }
					    else if (userPositionPourcent > 40 && userPositionPourcent <= 50){
						    $(".stat_number_big").append("50%");
					    }
					    else if (userPositionPourcent > 50 && userPositionPourcent <= 60){
						    $(".stat_number_big").append("60%");
					    }
					    else if (userPositionPourcent > 60 && userPositionPourcent <= 70){
						    $(".stat_number_big").append("70%");
					    }
					    else if (userPositionPourcent > 70 && userPositionPourcent <= 80){
						    $(".stat_number_big").append("80%");
					    }
					    else if (userPositionPourcent > 80 && userPositionPourcent <= 90){
						    $(".stat_number_big").append("90%");
					    }
					    else if (userPositionPourcent > 90 && userPositionPourcent <= 100){
						    $(".stat_number_big").append("100%");
					    }
					    else {
						    $(".stat_number_big").append("NA");
					    }
					    
					    
					    
					    
					    
					    
					  },
					  error: function(error) {
					    // The request failed
					  }
					});
			  },
			  error: function(error) {
			    // The request failed
			  }
			});
}


