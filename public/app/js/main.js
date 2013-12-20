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

var topFriendMale = [];
var topFriendFemale = [];

var photoArrayForCanva = [];

var urlPhotoToShare = "";

var userStatParseObject;

//boolean pour savoir si on affiche les tops après avoir recup les infos
var top3ToPrint = true;
var top3NotToPrint = false;


/*************************************
   vérification user logué ou non
*************************************/
function isUserConnected(){
	
    FB.getLoginStatus(function(response) {
		console.log("fb response : ");
		console.log(response)
		
		//check si le user a deja accepté l'appli Woovent
		if (response.status === 'connected') {
			//on cache le bouton login on affiche le logout
			$(".btn-login").hide();
			$(".btn-logged-in").show();
			
			console.log("\n ***** User already connected to Facebook! ***** \n");
			
			//on regarde si il avait des stats ou pas
			var queryCheckUserHasStats = new Parse.Query(Parse.User);
			
			queryCheckUserHasStats.equalTo("facebookId",response.authResponse.userID);
			
			//on verif si existe
			queryCheckUserHasStats.first({
	
				success: function(result) {
					if(result){
						console.log(result);
						currentUser = result;
						//si il avait des stats on affiche les stats
						if(result.attributes.hasWebStatistics == true) {
							whatStatsToShow ();
						}
						
						//si il avait pas de stats on update les infos du new user
						else {
							createUserAccount(result);					
						}
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

	    }
	);

}
/*************************************
   connexion ou creation de compte
*************************************/
function fblogin() {
	//on appel le login de parse et demande les bonnes autorisations
Parse.FacebookUtils.logIn("email,user_events,user_about_me,user_birthday,user_location,user_photos,friends_photos", {
	  success: function(user) {
	  	//si le user nexistait pas on le crée
	    if (!user.existed()) {
	      console.log("\n ***** User signed up and logged in through Facebook! ***** \n");
	      console.log(user);
	      createUserAccount(user)
		
		//si il existait on regarde si il avait des stats
	    } else {
	      console.log("\n ***** User logged in through Facebook! ***** \n");
	      console.log(user);
	      
	        //on regarde si il avait des stats ou pas
			var hasStat = user.get("hasWebStatistics");
			console.log("le user a des stats ?  " + hasStat) ;
			
			if(hasStat == "true") {
				currentUser = user;
				//on affiche les stats
				whatStatsToShow();
			}
			else {
				//on va updater son compte puis recup les stats
				createUserAccount(user);
			}

	    }
	    
	    
	    //on cache le bouton login on affiche le logout
	    $(".btn-login").hide();
		$(".btn-logged-in").show();
	  },
	  error: function(user, error) {
	    console.log("\n !!!!! User cancelled the Facebook login or did not fully authorize. !!!!! \n");
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
	FB.api("/me", function(response) {
		
		    // do stuff with the user
		    if (response.email){
		    	parseCurrentUser.set("email",response.email);
		    }
		    if (response.id){
		    	parseCurrentUser.set("facebookId",response.id);
		    	//on génère l'url de la photo
		    	var userPhotoUrl = "https://graph.facebook.com/" + response.id + "/picture?type=large&return_ssl_resources=1";
		    	parseCurrentUser.set("pictureURL", userPhotoUrl);
		    }
		    
		    if (response.first_name){
		    	parseCurrentUser.set("first_name",response.first_name);
		    }
		    if (response.last_name){
		    	parseCurrentUser.set("last_name",response.last_name);
		    }
		    if (response.name){
		    	parseCurrentUser.set("name",response.name);
		    }
		    if (response.location){
		    	parseCurrentUser.set("location",response.location.name);
		    }
		    if (response.gender){
		    	parseCurrentUser.set("gender",response.gender);
		    	//on set le genre du user pour le shareToSee
		    	currentUserGender = response.gender;
		    }
		    if (response.birthday){
		    	parseCurrentUser.set("birthday",response.birthday);
		    }
			
			parseCurrentUser.save(null, {
				  success: function(parseUserSaved) {
				  
				  	currentUser = parseUserSaved;
				  
				    // Execute any logic that should take place after the object is saved.
				    console.log('\n ***** User information update with success **** \n');
				    
				    //on lance la récupération des statistiques
				    //on va recuperer sa liste d'amis
					var userFriendApiUrl = "/me/friends?fields=id,gender&limit=50";
					getUserFriendList(userFriendApiUrl);

				  },
				  error: function(parseUserSaved, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    console.log('\n !!!!! Failed to create new object, with error code: !!!!! \n ' + error.description);
				  }
				});	
	
	});


}

/**********************************************************
   On va regarder quelles stats affichées 
***********************************************************/
function whatStatsToShow () {

	//on affiche les premières stats
	showBasicStats();
					  		
	//on va chercher les 3 meilleures event du user
	printUserBestEvent();
	
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

	//on affiche le loader
	$(".loader").show(); 

	//on declare le tableau de user
	var friendUserObject = new Array();
	//on lance la requete
	FB.api(userFriendApiUrl, function(response) {
		//console.log(response);
		
		//on boucle pour chaque event de la reponse
		for (var i=0; i<response.data.length; i++) {
				 
				//on cree un objet qui contient les elements de l'event
				 friendUserObject[i] = response.data[i];
				 var pagingUrlNext = response.paging.next ;		 
				 	 
			}
			
		//on incremente la variable friendsListCount
		friendsToAddCount +=  response.data.length;
		$(".friendsFind").empty(); 
		$(".friendsFind").append(friendsToAddCount);
		$(".progress-friendsAdd").attr('aria-valuemax', friendsToAddCount);
		$(".friendsFind").show(); 
		
		//on envoi l'object complet pour créer tout les friends
		createFriendsList(friendUserObject);
		
		//si il y a une pagination on relance une recherche sur lapi
		if (pagingUrlNext) {
			getUserFriendList(pagingUrlNext);
			pagingUrlNext = null;
		}	
	});
	
}

/*********************************************************
   creation de la liste des amis
*********************************************************/

function createFriendsList(friendUserObject){
	
	//on declare le tableau d'object Friendslist
	var friendsListArrayObject = [];
	
	var FriendsList = Parse.Object.extend("FriendsList");
	
	//on boucle pour chaque event de la reponse
	for (var i=0; i<friendUserObject.length; i++) {
	
		var newFriendObject = new FriendsList();
		
		newFriendObject.set("user", currentUser);
		//on set prospect avec le newfriend
		newFriendObject.set("friends", friendUserObject[i].id);
		//on set le sexe 
		newFriendObject.set("sexe", friendUserObject[i].gender);
		//on set le nombre devent ensemble à 1
		newFriendObject.set("eventTogetherCount", 1);
		
		friendsListArrayObject.push(newFriendObject);
	
	}	
		
	//on save le nouveau prospet pour add en base
	Parse.Object.saveAll(friendsListArrayObject, {
		  success: function(results) {
			  	for (var i = 0; i < results.length; i++) {	
			  			friendsAddedCount++;
						$(".friendsAdd").empty(); 
						$(".friendsAdd").append(friendsAddedCount);
						$(".progress-friendsAdd").attr('aria-valuenow', friendsAddedCount);
						friendsAddedPourcent = friendsAddedCount / friendsToAddCount * 100;
						$(".progress-friendsAdd").css( "width", friendsAddedPourcent+"%")
						$(".friendsAdd").show();  
						console.log("multiple user save : ");
			  	}
			    if (friendsAddedCount == friendsToAddCount) {
			    	$( ".progress-friendsAdd" ).addClass( "progress-bar-success" );
			    
				 	 //on lance la recup des invités aux events passés
				 	 var beforeTodayAttendingApiUrl = "/me/events?fields=id,owner.fields(id,name,first_name,last_name,picture),name,venue,location,start_time,end_time,rsvp_status,cover,updated_time,description,is_date_only,admins.fields(id,name,first_name,last_name,picture)&limit=100&type=attending&since=1356908400&until=now";
				 	 getInvitedFriendsToPastEvent(beforeTodayAttendingApiUrl);
				 	 
				 	 var beforeTodayMaybeApiUrl = "/me/events?fields=id,owner.fields(id,name,first_name,last_name,picture),name,venue,location,start_time,end_time,rsvp_status,cover,updated_time,description,is_date_only,admins.fields(id,name,first_name,last_name,picture)&type=maybe&since=1356908400&until=now";
				 	  //getInvitedFriendsToPastEvent(beforeTodayMaybeApiUrl);
				 	  
				 	  //on va recup juste le nombre total d'invitations
				 	  var totalNumberOfInvitationApiUrl = "/me/events?fields=rsvp_status&until=now&limit=300"
				 	  getUserTotalNumberOfInvit(totalNumberOfInvitationApiUrl);
			 	 }
			  
		  },
		  error: function( error) {
		    // Execute any logic that should take place if the save fails.
		    // error is a Parse.Error with an error code and description.
		    console.log(" \n !!!!! Failed to create a new friend:  !!!!! \n" );
		    console.log(error);
		  }
		});
		
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
			 countTotalEventMember(eventObject.id);
			 getFriendsInvitListFromAnEvent(apiUrlFindInvited);
			 
			 //on stock tous les event dans un tableau	pour la suite	 
			 allUserEvent.push(eventObject);

			 	 
		}
	//si il y a une pagination on relance une recherche sur lapi
	if (pagingUrlNext) {
		getInvitedFriendsToPastEvent(pagingUrlNext);
		pagingUrlNext = null;
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
		}
		$(".eventAdd").show(); 
		 
		//on boucle pour chaque invite de la reponse
		for (var i=0; i<response.data.length; i++) {
				 
				 //on cree un objet qui contient les elements du user invite
				 invitedFriendsObject[i] = response.data[i];

				 //on va ajouter un evenement en commun entre les deux users
				

				 	 
			}
		
		addEventInCommon(invitedFriendsObject);
		
		});

}


/****************************************************
   On ajoute un evenement en commun entre le friend et le current user
*****************************************************/

function addEventInCommon (invitedFriendsObject) {
	var invitedFriendsId = [];
	
	//on creer la requete pour verif si existe dans la table friends
	 var FriendsList = Parse.Object.extend("FriendsList");
	 var queryCheckInFriendsListBase = new Parse.Query(FriendsList);
	 

	 
	//on converti les id en string
	for (var i=0; i<invitedFriendsObject.length; i++) {
		invitedFriendsId[i] = invitedFriendsObject[i].uid.toString();
		
		invitedFriendsFind++;
		$(".invitFind").empty(); 
		$(".invitFind").append(invitedFriendsFind);
		$(".progress-invitAdd").attr('aria-valuemax', invitedFriendsFind);
		$(".invitFind").show();  
		}
	
	queryCheckInFriendsListBase.equalTo("user", currentUser);
	
	 // Finds objects from list of invited
	 queryCheckInFriendsListBase.containedIn("friends",invitedFriendsId); 
	 queryCheckInFriendsListBase.limit(1000);
	
	 
	 //on verif si existe
	 queryCheckInFriendsListBase.find({
		 success: function(results) {
		 	
		 	for (var i = 0; i < results.length; i++) {	
				//on incremente le nombre devent en commun
				results[i].increment("eventTogetherCount");	
			
			}
			
			//si plus de 1000 amis en commun à un event
			if (invitedFriendsId.length >= 1000) {
				
			 		//on ajoute la différence à notre somme pour quand meme passer à la suite mais on 
			 		//analyse pas les user au dessus de 1000
			 		var nbtemp = invitedFriendsId.length - 1000;
			 		invitedFriendsQueried+= nbtemp;
		 		
			}
			
				//on save
				Parse.Object.saveAll(results, {
				  success: function(resultsCreated) {
				  	  for (var i = 0; i < resultsCreated.length; i++) {	
				  	  
					  	  //on ajoute 1 au invite retrouve save
						  invitedFriendsQueried++;
						  $(".invitAdd").empty(); 
						  $(".invitAdd").append(invitedFriendsQueried);
						  $(".progress-invitAdd").attr('aria-valuenow', invitedFriendsQueried);
						  invitedFriendsQueriedPourcent = invitedFriendsQueried / invitedFriendsFind * 100;
						  $(".progress-invitAdd").css( "width", invitedFriendsQueriedPourcent+"%") 
						  $(".invitAdd").show();  
					  }
					 //on compare avec le nombre total trouve d'invite amis
					 // si on en a save autant qu'on en a trouve on va cherche les meilleures potes
					 if (invitedFriendsQueried == invitedFriendsFind){
						  		//on passe la loading barre en verte
						  		$( ".progress-invitAdd" ).addClass( "progress-bar-success" );
						  		
						  		
						  		//on save les stats du user et on les affiche
						  		saveUserBasicStats();
						  		
						  		//on va chercher les 3 meilleures event du user
						  		findUserBestEvent(allUserEvent);						  		
						  		
						  		
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
						  		

						  		

						  }
					  
				  },
				  error: function() {
				    console.log(" \n !!!!! !!!!! \n" );
				  }
				}); 
			
		  },
		  //si erreur
		  error: function(error) {
				console.log('\n  !!!!! Echec de l ajout d un event en commun !!!!! \n '); 
			  
		  }
		});		
}

/****************************************************
  On affiche les statistiques de base du user
*****************************************************/

function showBasicStats () {
	
	$(".totalInvitedEvents").empty();
	$(".totalInvitedFriends").empty();
	$(".totalEventMember").empty();
	$(".totalInvitedEventsRecieve").empty();
	$(".totalInvitedFriendsFemale").empty();
	$(".totalInvitedFriendsMale").empty();
	
	var Statistics = Parse.Object.extend("Statistics");
	var queryCheckInStatisticsBase = new Parse.Query(Statistics);
	
	queryCheckInStatisticsBase.equalTo("user", currentUser);
	queryCheckInStatisticsBase.first({
		 success: function(userStat) {
			 if(userStat){
			 userStatParseObject = userStat;
			 console.log(userStat);
			 	$(".totalInvitedEventsAnswer").append(userStat.attributes.answeredEventCount);
			 	$(".totalInvitedFriends").append(userStat.attributes.friendsMetDuringEvent);
			 	$(".totalEventMember").append(userStat.attributes.personMetDuringEvent);
			 	$(".totalInvitedEventsRecieve").append(userStat.attributes.invitedEventCount);
			 	$(".totalInvitedFriendsFemale").append(userStat.attributes.totalInvitedFriendsFemale);
			 	$(".totalInvitedFriendsMale").append(userStat.attributes.totalInvitedFriendsMale);
			 }
		 },
		 error: function() {
			 console.log(" \n !!!!! Fail to retrieve user Stats !!!!! \n" );
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
		newUserStat.set("answeredEventCount",invitedEventsFind);
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
	
	//on save les nouvelles stats
	newUserStat.save(null, {
		  success: function(userStats) {
		  	//on vide les spans
			$(".totalInvitedEvents").empty();
			$(".totalInvitedFriends").empty();
			$(".totalEventMember").empty();
			$(".totalInvitedEventsRecieve").empty();	
				  			 
			//on remplit les spans
		 	$(".totalInvitedEventsAnswer").append(userStats.attributes.answeredEventCount);
		 	$(".totalInvitedFriends").append(userStats.attributes.friendsMetDuringEvent);
		 	$(".totalEventMember").append(userStats.attributes.personMetDuringEvent);
		 	$(".totalInvitedEventsRecieve").append(userStats.attributes.invitedEventCount);
			
			//on va récupérer les invitées filles & mecs
			var friendsList = Parse.Object.extend("FriendsList");
			var queryCheckFriendsList= new Parse.Query(friendsList);
			
			var totalMaleInvited = 0;
			var totalFemaleInvited = 0;
			
			//on recupère en base les friendlist male
			queryCheckFriendsList.equalTo("user", currentUser);
			queryCheckFriendsList.equalTo("sexe", "male");
			queryCheckFriendsList.limit(1000);
			 
			//on verif si existe
			queryCheckFriendsList.find({
			
				success: function(results) {
				
						for (var i = 0; i < results.length; i++) {	
							totalMaleInvited += results[i].attributes.eventTogetherCount;
						}
						
						$(".totalInvitedFriendsMale").empty();
						$(".totalInvitedFriendsMale").append(totalMaleInvited);
						
						//on save pour le user
						userStats.set("totalInvitedFriendsMale",totalMaleInvited);
						userStats.save();
		
				  },
				  
				  error: function(error) {
						console.log('\n  !!!!! Echec de la verification du nombre de mecs !!!!! \n '); 
					  
				  }
				  
			});	
			
			//on récupère en base les friendslist female
			queryCheckFriendsList.equalTo("user", currentUser);
			queryCheckFriendsList.equalTo("sexe", "female");
			queryCheckFriendsList.limit(1000);
			 
			//on verif si existe
			queryCheckFriendsList.find({
			
				success: function(results) {
						
						for (var i = 0; i < results.length; i++) {	
							totalFemaleInvited += results[i].attributes.eventTogetherCount;
						}
						
						$(".totalInvitedFriendsFemale").empty();
						$(".totalInvitedFriendsFemale").append(totalFemaleInvited);
						
						//on save pour le user
						userStats.set("totalInvitedFriendsFemale",totalFemaleInvited);
						userStats.save();
		
				  },
				  
				  //si event existe pas : Creation
				  error: function(error) {
						console.log('\n  !!!!! Echec de la verification du nombre de filles !!!!! \n '); 
					  
				  }
				  
			});	

		  },
		  error: function() {
		    // Execute any logic that should take place if the save fails.
		    // error is a Parse.Error with an error code and description.
		    console.log('\n !!!!! Failed to save user stats !!!!! \n ');
		  }
		});	
		
	$(".basicStat").show();
	
	

}

/****************************************************
  On affiche les statistiques de base du user
*****************************************************/

function getUserTotalNumberOfInvit (apiUrl) {

	//on va recup le nombre total d'invitation à des evenements
	FB.api(apiUrl, function(response) {
		totalInvitRecieve+=response.data.length;
		
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
			 console.log(" \n !!!!! !!!!! \n" );
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
		

		//on fait le top 2
		var apiUrl = "/"+ topFriendsId[1].get("friends") +"?fields=id,name,first_name,last_name,gender,picture.type(large)";
		
		//on lance la requete
		FB.api(apiUrl, function(response) {
			//on cree un objet qui contient les infos du user
			var fbUserInfoObject = response;
			//on stock les 3 noms des top user Male
			topFriendMaleName[1]= fbUserInfoObject.name;
			topFriendMale[1]= fbUserInfoObject;
					

			//on fait le top 3
			var apiUrl = "/"+ topFriendsId[2].get("friends") +"?fields=id,name,first_name,last_name,gender,picture.type(large)";
			
			//on lance la requete
			FB.api(apiUrl, function(response) {
					//on cree un objet qui contient les infos du user
					var fbUserInfoObject = response;
					//on stock les 3 noms des top user Male
					topFriendMaleName[2]= fbUserInfoObject.name;
					topFriendMale[2]= fbUserInfoObject; 
				
					//on regarde si il faut afficher le top
					if (printTopFriends == true){
					
						for (i=0; i<3; i++){
							var friendsCount = topFriendsId[i].get("eventTogetherCount");
							
							//on defini le nom des classes
							var friendNameClassName = ".bestFriends" + i + "_Name_male";
							var friendGenderClassName = ".bestFriends" + i + "_Gender_male";
							var friendCountClassName = ".bestFriends" + i + "_Count_male";
							var friendPictureClassName = ".bestFriends_Picture_male" + i;
				
							//on vide les champs
							$(friendPictureClassName).empty();
							$(friendNameClassName).empty();
							$(friendCountClassName).empty();
							$(friendGenderClassName).empty();
							
							//on affiche les infos dans les champs
							$(friendPictureClassName).append("<img src=\""+ topFriendMale[i].picture.data.url +"\" class=\"img-rounded\" width=\"200px\" >");
							$(friendNameClassName).append(topFriendMale[i].name);
							$(friendCountClassName).append(friendsCount);
							$(friendGenderClassName).append(topFriendMale[i].gender);
							
						}
						
					//on affiche le container	
					$(".maleRow").show(); 
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
			 console.log(" \n !!!!! !!!!! \n" );
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

		//on fait le top 2
		var apiUrl = "/"+ topFriendsId[1].get("friends") +"?fields=id,name,first_name,last_name,gender,picture.type(large)";
		
		//on lance la requete
		FB.api(apiUrl, function(response) {
				//on cree un objet qui contient les infos du user
				var fbUserInfoObject = response;
				//on stock les 3 noms des top user fille
				topFriendFemaleName[1]= fbUserInfoObject.name;
				topFriendFemale[1]= fbUserInfoObject;		

				//on fait le top 3
				var apiUrl = "/"+ topFriendsId[2].get("friends") +"?fields=id,name,first_name,last_name,gender,picture.type(large)";
				
				//on lance la requete
				FB.api(apiUrl, function(response) {
						//on cree un objet qui contient les infos du user
						var fbUserInfoObject = response;
						//on stock les 3 noms des top user fille
						topFriendFemaleName[2]= fbUserInfoObject.name;
						topFriendFemale[2]= fbUserInfoObject; 
	
						//on vérifie si il faut afficher le top
						if (printTopFriends == true){	
							//on affiche le top 3
							for (i = 0; i < 3 ; i++){
							
								var friendsCount = topFriendsId[i].get("eventTogetherCount");
					
								//on defini le nom des classes
								var friendNameClassName = ".bestFriends" + i + "_Name_female";
								var friendGenderClassName = ".bestFriends" + i + "_Gender_female";
								var friendCountClassName = ".bestFriends" + i + "_Count_female";
								var friendPictureClassName = ".bestFriends_Picture_female" + i;
						
								//on vide les champs
								$(friendPictureClassName).empty();
								$(friendNameClassName).empty();
								$(friendCountClassName).empty();
								$(friendGenderClassName).empty();
								
								//on affiche les infos dans les champs
								$(friendPictureClassName).append("<img src=\""+ topFriendFemale[i].picture.data.url +"\" class=\"img-rounded\" width=\"200px\" >");
								$(friendNameClassName).append(topFriendFemale[i].name);
								$(friendCountClassName).append(friendsCount);
								$(friendGenderClassName).append(topFriendFemale[i].gender);
								
					
							}
							
							//on affiche le container
							$(".femaleRow").show();
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

/**********************************************************
   On va chercher les 3 meilleures event du current user
***********************************************************/
function findUserBestEvent(allEventArray) {
	totalInvitToCreate = allEventArray.length;
	totalEventToCreate = allEventArray.length;
	
	$(".eventAnalyseLoader").show();
	$(".totalEventToAnalyse").empty(); 
	$(".totalEventToAnalyse").append(totalEventToCreate);
	$(".progress-eventAnalysed").attr('aria-valuemax', totalEventToCreate);
	$(".totalEventToAnalyse").show(); 
	
	
	
	for (var i = 0; i < allEventArray.length; i++) {
		createEventInBase(allEventArray[i]);	
	}

}
/**********************************************************
  creation d'un event en base
***********************************************************/
function createEventInBase(fbEventInformation) {

	//on check si il existe
	//on creer la requete pour verif si existe sur le serveur
	
	 var eventFacebook = Parse.Object.extend("Event");
	 var queryCheckEventExist = new Parse.Query(eventFacebook);
	 
	 //on verifie sil existe en base un event avec le meme facebook id
	 queryCheckEventExist.equalTo("eventId", fbEventInformation.id);
	 
	 //on verif si existe
	 queryCheckEventExist.find({
	 	 
		 success: function(results) {

		 		//Si oui -> on va créer l'invitation
				if(results != ""){
					
					//on crée l'invitation
					for (var i = 0; i < results.length; i++) {	
						createInvitationForCurrentUser(results[i]);
					}
					
				}
				//si event existe pas en base on cree l'event puis l'invitation
				else {
					//on ajoute newInvit au tableau des event a créer
					newEventToCreateArrayObject.push(fbEventInformation);
					 							
				}
				//on ajoute 1
		 		eventCreated++;
		 		//quand on a tout parcouru on lance le saveAll des event
		 		if (totalEventToCreate == eventCreated) {
		 			addEventInBase(newEventToCreateArrayObject); 
		 		}
		  },
		  //si event existe pas : Creation
		  error: function(error) {
				console.log('\n  !!!!! Echec de la verification si event existe en base !!!!! \n '); 
			  
		  }
		});	

	
	//si non -> on créer ajout l'event et on créer le prospect avec la note
	
	
}

/****************************************************
   On add un event avec les infos en base
*****************************************************/

function addEventInBase (newEventToCreateArrayObject) {
	  var Event = Parse.Object.extend("Event");
	  
	  var j = 0;
	  //on declare le tableau d'object newEvent
	  var newEventArrayObject = [];
	  
	  for (var i = 0; i < newEventToCreateArrayObject.length; i++) {
	  
		  var newEvent = new Event();
		  

			
		  if (newEventToCreateArrayObject[i].location){ 
		  	newEvent.set("location", newEventToCreateArrayObject[i].location);
		  }
		  if (newEventToCreateArrayObject[i].name){
		  	newEvent.set("name", newEventToCreateArrayObject[i].name);
		  }
		  if (newEventToCreateArrayObject[i].id){
		  	newEvent.set("eventId", newEventToCreateArrayObject[i].id);
		  }
		  if (newEventToCreateArrayObject[i].cover){
		  	newEvent.set("cover", newEventToCreateArrayObject[i].cover.source);
		  }
		  if (newEventToCreateArrayObject[i].description){
		  	newEvent.set("description", newEventToCreateArrayObject[i].description);
		  }
		  
		  if (newEventToCreateArrayObject[i].end_time){
		  	var endTimeVar = new Date(newEventToCreateArrayObject[i].end_time);
		  	newEvent.set("end_time", endTimeVar);
		  }
		  if (newEventToCreateArrayObject[i].owner){
		  	newEvent.set("owner", newEventToCreateArrayObject[i].owner);
		  }
		  
		  if (newEventToCreateArrayObject[i].start_time){
		  	var startTimeVar = new Date(newEventToCreateArrayObject[i].start_time);
		  	newEvent.set("start_time", startTimeVar);
		  }
		  if (newEventToCreateArrayObject[i].admins){
		  	newEvent.set("admins", newEventToCreateArrayObject[i].admins.data);
		  }
		  if (newEventToCreateArrayObject[i].is_date_only){
		  	newEvent.set("is_date_only", newEventToCreateArrayObject[i].is_date_only);
		  }
		  if (newEventToCreateArrayObject[i].rsvp_status){
		  	newEvent.set("rsvp_status", newEventToCreateArrayObject[i].rsvp_status);
		  }
		  if (newEventToCreateArrayObject[i].venue){
		  	newEvent.set("venue", newEventToCreateArrayObject[i].venue);
		  }
		  
		  //on ajoute newInvit au tableau des invités
		  newEventArrayObject.push(newEvent);
		  
		  //si on a atteint la fin du tableau alors on lance le saveAll
		  if (newEventArrayObject.length == newEventToCreateArrayObject.length) {  
		  
			  //on save le nouvelle event pour add en base
			  Parse.Object.saveAll(newEventArrayObject, {
				  success: function(newEventResultObject) {
				  	//pour chaque evenement créer
				  	for (var i = 0; i < newEventResultObject.length; i++) {	
					    // Execute any logic that should take place after the object is saved.
					    console.log("Creation d'un event : **********");
					    
					    //on cree l'invitation
						createInvitationForCurrentUser(newEventResultObject[i]);
					}
				  },
				  error: function(newEvent, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    console.log(" \n !!!!! Failed to create new EVENT, with error code: " + error.description + " !!!!! \n" );
				  }
				});
				
			}
		}
		
}

/***********************************************************************************
   Creation d une invitation a partir des infos d un évènement pour le current User
************************************************************************************/

function createInvitationForCurrentUser (newEventObject) {
	  
	  var totalInvitedUser=0;
	  var totalInvitedFriends=0;
	  var eventInterestRatio=0;
	  
	  var Invitation = Parse.Object.extend("Invitation");
	  var newInvit = new Invitation();
	  var queryCheckInInvitationBase = new Parse.Query(Invitation);
	  
	  //on verifie si l'invitation existait déjà
	  queryCheckInInvitationBase.equalTo("event",newEventObject)
	  queryCheckInInvitationBase.equalTo("user",currentUser)
	  
	  //on recherche
	  queryCheckInInvitationBase.find({
		 success: function(invitationFind) {
		 
			 	//si on a un resultat
			 	if (invitationFind != "") {
				 	//on parcours au cas où plusieurs invitations
				 	for (var i = 0; i <invitationFind.length; i++) {
				 			//on set newInvit par le resultat trouvé pour updater les infos ensuite	
					 		newInvit = invitationFind[i];
					 }
					 
			 	}
	
			  
			  //on va recuperer le nombre total d'invite a levent
			  var fqlQuery = "SELECT all_members_count FROM event WHERE eid=" + newEventObject.attributes.eventId;
			  //on lance la requete
			  FB.api('fql', { q: fqlQuery },  function(response) {
			  		console.log(response);
			  		if (response != ""){
				  		//on stock le nombre total d'invité
						totalInvitedUser = response.data[0].all_members_count;	
			  		}
			  		else {
				  		totalInvitedUser=1;
			  		}
			  		
					
					//on va recupérer le nombres d'amis invités
					var apiUrlFindInvited = "SELECT uid  FROM event_member WHERE eid=" + newEventObject.attributes.eventId + "and uid IN (SELECT uid2 FROM friend WHERE uid1 = me());";
					FB.api('fql', { q: apiUrlFindInvited },  function(response) {
					
					
							  //on stock le nombre d'invités amis
							  totalInvitedFriends = response.data.length;
		
							  //on creer l'invitation avec le eventInterestRatio
							  if (currentUser){ 
							  	newInvit.set("user", currentUser);
							  }
							  if (newEventObject.attributes.rsvp_status){ 
							  	newInvit.set("rsvp_status", newEventObject.attributes.rsvp_status);
							  }
							  if (newEventObject.attributes.start_time){
							  	var startTimeVar = new Date(newEventObject.attributes.start_time);
							  	newInvit.set("start_time", startTimeVar);
							  }
							  if (newEventObject){ 
							  	newInvit.set("event", newEventObject);
							  }
		
							  
							  if (totalInvitedUser &&  totalInvitedFriends ){ 
							  
								  	eventInterestRatio = totalInvitedFriends / (totalInvitedUser+1);
								  	
								  	//si moins de 4 invités  on divise par 2,5
								  	if (totalInvitedFriends < 4) {
								  		eventInterestRatio = eventInterestRatio / 4;
								  	}
								  	
								  	//si rsvp status is attending alors on fait un x1,5 en coef pour ponderer fasse aux maybe
								  	if (newEventObject.attributes.rsvp_status == "attending") {
									  	eventInterestRatio = eventInterestRatio * 4 / 3;	
								  	}
								  	
								  	
								  	newInvit.set("eventInterestRatio", eventInterestRatio);
							  	
							  }
							  
							  //on passe à false le is_memory pour tous les event
							  newInvit.set("is_memory", false);
							  
							  //on ajoute newInvit au tableau des invités
							  newInvitArrayObject.push(newInvit);
							  
							  //on ajoute 1
							  invitCreated++;
							  $(".totalEventAnalysed").empty(); 
							  $(".totalEventAnalysed").append(invitCreated);
							  $(".progress-eventAnalysed").attr('aria-valuenow', invitCreated);
							  eventAnalysedPourcent = invitCreated / totalEventToCreate * 100;
							  $(".progress-eventAnalysed").css( "width", eventAnalysedPourcent+"%") 
							  $(".totalEventAnalysed").show(); 
							  
							  
							  //console.log("invitCreated : "  + invitCreated + " totalInvitToCreate : " + totalInvitToCreate)
									
							  //si on a traité tous les event on affiche le top 10 des events
							  if(invitCreated == totalInvitToCreate) {
								  $( ".progress-eventAnalysed" ).addClass( "progress-bar-success" );
								  
								  //on save le nouvelle event pour add en base
								  Parse.Object.saveAll(newInvitArrayObject, {
									  success: function(invitCreate) {
									  
									  	
									  	
									    // Execute any logic that should take place after the object is saved.
									    for (var i = 0; i < invitCreate.length; i++) {	
										console.log("Invitation crée : **********");
										}
										
										printUserBestEvent();
										
										//on passe la variable hasWebStatistics à true et on save sur le currentUser
										currentUser.set("hasWebStatistics", true);
										currentUser.save();
										
										
									    
									  },
									  error: function(newEvent, error) {
									    // Execute any logic that should take place if the save fails.
									    // error is a Parse.Error with an error code and description.
									    console.log(" \n !!!!! Failed to create the invitation: " + error.description + " !!!!! \n" );
									  }
									});
							 }
					});
			});
		},
		error: function( error) { 
			console.log(" \n !!!!! Failed to retrieve if the invitation exist !!!!! \n" );
		}
	});
	
}

/****************************************************
   Afficher les 10 meilleurs Event
*****************************************************/

function printUserBestEvent (){
	
	 //on creer la requete pour verif si existe dans la table friends
	 var Invitation = Parse.Object.extend("Invitation");
	 var queryCheckInInvitationBase = new Parse.Query(Invitation);
	 
	 queryCheckInInvitationBase.equalTo("user", currentUser);
	 
	 //on recupere du plus grand au plus petit
	 queryCheckInInvitationBase.descending("eventInterestRatio");
	 // on ne prend que les 3 premiers
	 queryCheckInInvitationBase.limit(10);
	 
	 queryCheckInInvitationBase.find({
		 success: function(topInvitObject) {
		 	getUserBestEventInfo(topInvitObject);
		 
		 },
		 error: function() {
			 console.log(" \n !!!!! !!!!! \n" );
			 }
		}); 
}

/**********************************************************
   On récupère les infos sur les 10 top Event
***********************************************************/
function getUserBestEventInfo (topInvitObject) {
	var Event = Parse.Object.extend("Event");
	var queryEvent = new Parse.Query(Event);	
	var j=0;
	
	var arrayOfEventObjectId = [];
	
	for (var i = 0; i <topInvitObject.length; i++) {	
	 
		//on passe à true le is memomry des invitations pour le top 10 event
		topInvitObject[i].set("is_memory", true);
		
		arrayOfEventObjectId.push(topInvitObject[i].attributes.event.id);
		
	}
	
		//si on a save les 10 alors on va save all
		Parse.Object.saveAll(topInvitObject, {
							  success: function(invitCreate) {
								console.log("on a update le top 10 des invitations");							    
							  },
							  error: function(newEvent, error) {
							    // Execute any logic that should take place if the save fails.
							    // error is a Parse.Error with an error code and description.
							    console.log(" \n !!!!! Failed to update invitation !!!!! \n" );
							  }
							});
		
		//on cherche tous les event du tableau de best event Id
		queryEvent.containedIn("objectId",arrayOfEventObjectId); 
		
		queryEvent.find({
			  success: function(topEvent) {
			  	 
			  	 //on masque le loader
			  	 $(".eventAnalyseLoader").hide();
			  	 
			  	 //pour chaque resultat retourné
			  	 for (var i = 0; i < topEvent.length; i++) {	
			  	 
				     // The object was retrieved successfully.
					 var eventName = topEvent[i].attributes.name;
					 var eventUrl = "https://www.woovent.com/app/souvenirs.html" ;
					 
					 j++;
					 
					 //si on est dans les 5 premiers on affiche dans la premiere div
					 if (j <6) {
						var classeNameBestEvent = ".bestEvent-fisrtPart"; 
					 }
					 else {
						var classeNameBestEvent = ".bestEvent-secondePart"; 
					 }
					 
					 
					 $(classeNameBestEvent).append("<a href=\""+ eventUrl +"\" target=\"_blank\">"+ eventName +"<\/a><\/br><\/br>");
					 
					 $(".bestEvent").show();
					 
				 }
			  },
			  error: function(object, error) { 
			  }
			});

}

/****************************************************************************
   Afficher le shareToSee au bon endroit (sur top fille ou top mec)
*****************************************************************************/

function printShareToSee (){
	
	//on affiche 3 personnes vide sur le bon top 3
	for (i = 0; i<3; i++){
	
		//si le current user est un homme, on affiche le ShareToSee sur le top fille
		if (currentUser.attributes.gender == "female"){
		
			//on defini le nom des classes
			var friendNameClassName = ".bestFriends" + i + "_Name_male";
			var friendGenderClassName = ".bestFriends" + i + "_Gender_male";
			var friendCountClassName = ".bestFriends" + i + "_Count_male";
			var friendPictureClassName = ".bestFriends_Picture_male" + i;
			
			$(friendPictureClassName).empty();
			$(friendNameClassName).empty();
			$(friendCountClassName).empty();
			$(friendGenderClassName).empty();
			
			$(friendPictureClassName).append("<img src=\"http://posterjack.files.wordpress.com/2010/01/visualbug-facebook1.jpg\" class=\"img-rounded\" width=\"200px\" style=\" max-height: 200px;  \">");
			$(friendNameClassName).append("John Doe");
			$(friendCountClassName).append(" X ");
			$(friendGenderClassName).append("Male");
			
			//on affiche le bloc du top mec
			$(".maleRow").hide();
			$(".maleRow").show();
			
			//on affiche l'overlay
			$(".maleHiddingRow").show();
			
		}
		// si c'est une femme on fait l'inverse
		else {
			//on defini le nom des classes
			var friendNameClassName = ".bestFriends" + i + "_Name_female";
			var friendGenderClassName = ".bestFriends" + i + "_Gender_female";
			var friendCountClassName = ".bestFriends" + i + "_Count_female";
			var friendPictureClassName = ".bestFriends_Picture_female" + i;
			
			$(friendPictureClassName).empty();
			$(friendNameClassName).empty();
			$(friendCountClassName).empty();
			$(friendGenderClassName).empty();
			
			$(friendPictureClassName).append("<img src=\"http://profile.ak.fbcdn.net/hprofile-ak-snc4/50234_100966998311_6003_n.jpg\" class=\"img-rounded\" width=\"200px\" style=\" max-height: 200px;  \">");
			$(friendNameClassName).append("Carla Rae");
			$(friendCountClassName).append(" X ");
			$(friendGenderClassName).append("Female");
			
			//on affiche le bloc du top fille
			$(".femaleRow").hide();
			$(".femaleRow").show();
		
			//on affiche l'overlay
			$(".femaleHiddingRow").show();
			
			
		}
	
	}

}

/****************************************************
   Pour vider la base
*****************************************************/
function emptyFriendsList () {
	 //on creer la requete pour verif si existe dans la table friends
	 var FriendsList = Parse.Object.extend("FriendsList");
	 var queryCheckInFriendsListBase = new Parse.Query(FriendsList);
	 var friendsListArrayToDelete = [];
	 
	 queryCheckInFriendsListBase.notEqualTo("eventTogetherCount", 12345678);
	 queryCheckInFriendsListBase.limit(1000);
	 queryCheckInFriendsListBase.find({
		 success: function(results) {
		 	for (var i = 0; i < results.length; i++) { 
		 		console.log("un object trouvé");
		 		friendsListArrayToDelete[i] = results[i];
		 	}
		 	Parse.Object.destroyAll(friendsListArrayToDelete, function(success, error) {
			    if (success) {
			      // All the objects were saved.
			      console.log("tout a ete delete");
			    } else { 
			    console.log("error");
			    }
			  });
	 
}
});

}


/****************************************************
   Pour vider la base d'invitation
*****************************************************/
function emptyInvitationAndEventList () {
	 //on creer la requete pour verif si existe dans la table friends
	 var Invitation = Parse.Object.extend("Invitation");
	 var queryCheckInInvitationBase = new Parse.Query(Invitation);
	 
	 var invitationArrayToDelete = [];
	 var eventArrayToDelete = [];
	 
	 queryCheckInInvitationBase.notEqualTo("rsvp_status", "coucou");
	 queryCheckInInvitationBase.limit(1000);
	 queryCheckInInvitationBase.find({
		 success: function(results) {
		 for (var i = 0; i < results.length; i++) { 
		 		console.log("un object trouvé");
		 		invitationArrayToDelete[i] = results[i];
		 	}
			Parse.Object.destroyAll(invitationArrayToDelete, function(success, error) {
						    if (success) {
						      // All the objects were saved.
						      console.log("tout a ete delete");
						    } else { 
						    console.log("error");
						    }
						  });
				 
			}
		});

		
	 //on creer la requete pour verif si existe dans la table friends
	 var Event = Parse.Object.extend("Event");
	 var queryCheckInEventBase = new Parse.Query(Event);
	 
	 queryCheckInEventBase.notEqualTo("eventId", "123456789");
	 queryCheckInEventBase.limit(1000);
	 queryCheckInEventBase.find({
		 success: function(results) {
			 for (var i = 0; i < results.length; i++) { 
			 		console.log("un object trouvé");
			 		eventArrayToDelete[i] = results[i];
			 	}
				Parse.Object.destroyAll(eventArrayToDelete, function(success, error) {
							    if (success) {
							      // All the objects were saved.
							      console.log("tout a ete delete");
							    } else { 
							    console.log("error");
							    }
							  });
					 
				}
			});
	 
}

/****************************************************
   Pour vider la base d'invitation
*****************************************************/
function emptyInvitationListForAUserId (userId) {
	 //on creer la requete pour verif si existe dans la table friends
	 var Invitation = Parse.Object.extend("Invitation");
	 var queryCheckInInvitationBase = new Parse.Query(Invitation);
	 
	 queryCheckInInvitationBase.notEqualTo("user" , userId);
	 queryCheckInInvitationBase.limit(1000);
	 queryCheckInInvitationBase.find({
		 success: function(results) {
		 	for (var i = 0; i < results.length; i++) { 
		 		results[i].destroy({
					  success: function() {
					    // The object was deleted from the Parse Cloud.
					    console.log("un object delete");
					  },
					  error: function(myObject, error) {
					    // The delete failed.
					    // error is a Parse.Error with an error code and description.
					  }
					});
		 	
		 	}
		 },
		 error: function() {
			 console.log(" \n !!!!! !!!!! \n" );
			 }
		}); 
	 
}


/**********************************************************
   Afficher container Statistiques
***********************************************************/
function showStatistique () {

 	$(".souvenir").hide();
  	$(".statistique").show();
}


/**********************************************************
  Ajuster Hauteur Container
***********************************************************/
function ajustElementSize () {
 	var htmlSize = $( document ).height();
 	htmlSize = htmlSize - 100;
 	//$(".avenir").height(htmlSize);
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

function myIndexOfPhotoArray(arrayToFetch, photoId) {    
    for (var i = 0; i < arrayToFetch.length; i++) {
        if (arrayToFetch[i].id == photoId) {
            return i;
        }
    }
    return -1;
}




/**********************************************************
	on verifie si il peut publier
***********************************************************/

function canPublishStream(){
	//on regarde si on a les droits pour publier en son nom 
	FB.api("/me/permissions", function(response) {
		console.log(response);
		//si publish stream est présent est autorisé OK
		if(response.publish_stream == 1) {
			createPictureToShare();
		}
		else {
			Parse.FacebookUtils.logIn("publish_stream", {
					  success: function(user) {
						  createPictureToShare();
					  },
					  error: function(user, error) {
					    console.log("\n !!!!! User cancelled the Facebook login or did not fully authorize. !!!!! \n");
					  }
			});
		}

	});
} 

/**********************************************************
	 on creer la photo à partager
***********************************************************/

function createPictureToShare() {
	//on initialise le canva
	var canvaVar = document.getElementById("canvaPhotoToShare");
	var ctx = canvaVar.getContext("2d");
	
	// Fond
	ctx.fillStyle = "olivedrab";
	ctx.fillRect(0,0,600,600);
	
	//le titre
	var text = 'Vos stats évènements de 2013! ';
	ctx.font = "20pt Verdana";
	ctx.textAlign = "center";
	ctx.fillStyle = "darkorange";
	ctx.fillText(text,300,30);
	
	//les sous titres
	var text = 'Mon Top Meuf';
	ctx.textAlign = "left";
	ctx.font = "14pt Verdana";
	ctx.fillStyle = "darkorange";
	ctx.fillText(text,10,60);
	
	//les sous titres
	var text = 'Mon Top Mec';
	ctx.textAlign = "left";
	ctx.font = "14pt Verdana";
	ctx.fillStyle = "darkorange";
	ctx.fillText(text,10,260);
	
	//les sous titres
	var text = 'Mon rang';
	ctx.textAlign = "left";
	ctx.font = "14pt Verdana";
	ctx.fillStyle = "darkorange";
	ctx.fillText(text,10,460);
	
	//les stats
	var text = ' Avec ' + userStatParseObject.attributes.invitedEventCount + " invitations je suis une Marmotte-Buzy !";
	ctx.textAlign = "left";
	ctx.font = "14pt Verdana";
	ctx.fillStyle = "darkorange";
	ctx.fillText(text,10,500);
	
	//les stats
	var text = ' Avec ' + userStatParseObject.attributes.totalInvitedFriendsMale + " Mec à mes évenement je suis une GeekMotte !";
	ctx.textAlign = "left";
	ctx.font = "14pt Verdana";
	ctx.fillStyle = "darkorange";
	ctx.fillText(text,10,525);
	
	//les stats
	var text = ' Avec ' + userStatParseObject.attributes.totalInvitedFriendsFemale + " Filles à mes event je suis un Mac-Motte";
	ctx.textAlign = "left";
	ctx.font = "14pt Verdana";
	ctx.fillStyle = "darkorange";
	ctx.fillText(text,10,550);
	
	//les 3 noms
	for (i=0 ; i < 3 ; i++) {
	
		var nameGirl = topFriendFemaleName[i]	
		var nameBro = topFriendMaleName[i]
		
		ctx.font = "14pt Verdana";
		ctx.textAlign = "center";
		ctx.fillStyle = "darkorange";
		var x_position = 100 + (i * 200);
		
		ctx.fillText(nameGirl, x_position ,200);
		ctx.fillText(nameBro, x_position ,400);
		
		}	

	printUserPhotoOnCanva(0);

}
/**********************************************************
	 Afficher la photo pret à partager dans le Canva
***********************************************************/

function printUserPhotoOnCanva(friendsPosition) {	
		var canvaVar = document.getElementById("canvaPhotoToShare");
		var ctx = canvaVar.getContext("2d");
		
		console.log("on ajoute les photos");
		
		var imageMale = new Image();
		var imageFemale = new Image();  
		
		//on encode l'url female
		var urlEncodedFemale = encodeURIComponent(topFriendFemale[friendsPosition].picture.data.url);
		//on va récupérer l'url via notre proxy
		imageFemale.src = "https://www.woovent.com/testimage?url=" + urlEncodedFemale ;

		//on encode l'url male
		var urlEncodedMale = encodeURIComponent(topFriendMale[friendsPosition].picture.data.url);
		//on va récupérer l'url via notre proxy
		imageMale.src = "https://www.woovent.com/testimage?url=" + urlEncodedMale ;
	
		var x_image_position = 50 + ( friendsPosition * 200);
		var y_image_position_Female = 80;
		var y_image_position_Male = 280;
	
	
		imageFemale.onload = function() {
			//on récupère dans "image", la portion de widthToCrop x heightToCrop pixels aux coordonnées [pixelToStartCrop, 0], et on la place sur le canvas aux coordonnées [x_image_position, y_image_position] pour enfin l'agrandir à 333x350 pixels.
			console.log("image fille loadé");
		  
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
			ctx.drawImage(this,pixelFemaleToStartCropX,pixelFemaleToStartCropY,sizeFemaleToCrop,sizeFemaleToCrop,x_image_position,y_image_position_Female,100,100);
			
		};
		
		imageMale.onload = function() {
			//on récupère dans "image", la portion de widthToCrop x heightToCrop pixels aux coordonnées [pixelToStartCrop, 0], et on la place sur le canvas aux coordonnées [x_image_position, y_image_position] pour enfin l'agrandir à 333x350 pixels.
			console.log("image mec loadé");
			
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
			ctx.drawImage(this,pixelMaleToStartCropX,pixelMaleToStartCropY,sizeMaleToCrop,sizeMaleToCrop,x_image_position,y_image_position_Male,100,100);
		
			friendsPosition++;
			//on verifie si on a pas deja affiché les 3 top friends
			if (friendsPosition < 3){
				printUserPhotoOnCanva(friendsPosition);
			}
			else {
				//si on a affiché les 3 alors on va save la photo
				saveSharePicture();
			}
		};
}

/**********************************************************
	 post picture into user wall
***********************************************************/

function saveSharePicture() 
{
	$('#canvaPhotoCreated').modal('show');

	var canvasInfos = document.getElementById('canvaPhotoToShare');
	var dataURL = canvasInfos.toDataURL("image/png")
	var dateURLBase64 = dataURL.replace("data:image/png;base64," , "");
	console.log(dataURL);

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
						console.log("coucou");
						console.log(resultsCreated);
						
						urlPhotoToShare = resultsCreated.attributes.topFemalePictureToShare._url;	
						loaderGifPhotoToShareButton
						$('#loaderGifPhotoToShareButton').hide();
						$('#shareTopFriendsButton').show();
					},
					error: function() {
				    console.log(" \n !!!!! !!!!! \n" );
				    }
				});
					
			},
			 error: function() {
			    // Execute any logic that should take place if the save fails.
			    // error is a Parse.Error with an error code and description.
			    console.log('\n !!!!! Failed to save user stats !!!!! \n ');
			  }
			});
		});		

}
/**********************************************************
	 post picture into user wall
***********************************************************/

function sharePicture() 
{
	
	console.log("on est là");
	
	//on fait le post
	FB.api(
		    "/me/photos",
		    "POST",
		    {
		    	"url" : urlPhotoToShare,
		    	"name" : " Mes Statstiques Evenement de 2013 "
		    },
		    function (response) {
		      if (response && !response.error) {
		        /* handle the result */
		        console.log("coucou on a bien share la photo !");
		        
		        //on tag les tops filles
		        FB.api(
					    "/"+response.id+"/tags",
					    "POST",
					    {
					    	
								"tags" : "[{\"tag_uid\":\"" + top3GirlsParseObject[0].attributes.friends + "\"}, {\"tag_uid\":\"" + top3GirlsParseObject[1].attributes.friends + "\"},, {\"tag_uid\":\"" + top3GirlsParseObject[2].attributes.friends + "\"},, {\"tag_uid\":\"" + top3BroParseObject[0].attributes.friends + "\"},, {\"tag_uid\":\"" + top3BroParseObject[1].attributes.friends + "\"}, {\"tag_uid\":\"" + top3BroParseObject[2].attributes.friends + "\"}]"
							
					    	
					    },
					    function (response) {
					      if (response && !response.error) {
							  console.log("coucou on a bien taggué la photo !");
		        
					        //on cache le loader
					        $(".loaderGif").hide();
					        
					        //on passe la variable shareorlike a true pour le current user
					        currentUser.set("hasShareOrLike",true);
					        currentUser.save();
					        
					        //on cache le ShareToSee
					        $(".femaleHiddingRow").hide();
					        $(".maleHiddingRow").hide();
					        
					        //on affiche le top 3 manquant
					  		//si c'est un mec, on affiche les top femme 
						  	if (currentUserGender == "male"){
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
