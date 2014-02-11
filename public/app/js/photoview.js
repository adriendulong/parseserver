


/**************
function resize
***************/


function addOrientationClass (){

	var photoHeightJS = parseInt(photoHeight);
	var photoWidthJS = parseInt(photoWidth);
	 
	//si c'est en carré
	if (photoHeightJS == photoWidthJS){
		$( "#img-full-div" ).addClass( "orientation-square" );
		console.log("carré");
	}
	//si c'est en portrait
	else if (photoHeightJS >= photoWidthJS) {
		$( "#img-full-div" ).addClass( "orientation-portrait" );
		console.log("portrait");
		
	}
	//si c'est en paysage
	else if (photoHeightJS <= photoWidthJS) {
		$( "#img-full-div" ).addClass( "orientation-paysage" );
		console.log("paysage");
	}

	
	
	
	//set hauteur full
	var fullHeight = $( window ).height();
	fullHeight -= 3;
	$( "body" ).height(fullHeight);
	var heightPx = fullHeight + "px";
	
	$(".photo-line-height").css("line-height", heightPx); 
	
	
	//on set la taille min de tout les comment à full - photo
	
	var fullImgHeight = $( ".col-img-full" ).height();
	
	console.log("fullHeight " + fullHeight + " fullImgHeight " + fullImgHeight);
	
	//si on est pas en grand ecran
	if (fullImgHeight != fullHeight){
	var newCommentFullHeight =  fullHeight - fullImgHeight;
	//$( ".col-comment-full" ).height(newCommentFullHeight);
	}
	
	console.log("fullHeight " + fullHeight + " fullImgHeight " + fullImgHeight);
	//si on est pas en grand ecran
	if (fullImgHeight != fullHeight){
		var commentDivHeight = $( ".comment-div" ).height();
		//on rajoute juste la place pour la barre de commentaire
		commentDivHeight += 75;
		$( ".comment-div" ).height(commentDivHeight);
	}
	else {
		var commentDivHeight = $( "#comment-full-div" ).height();
		//on rajoute juste la place pour la barre de commentaire
		commentDivHeight -= 194;
		$( ".comment-div" ).height(commentDivHeight);
	}
	
}


/**************
function init
***************/
function initPhotoInfo(){

	//on creer la requete pour verif si existe sur le serveur
	var Photo = Parse.Object.extend("Photo");
	var queryGetPhoto = new Parse.Query(Photo);
	
	//on verifie sil existe en base un event avec le meme facebook id
	queryGetPhoto.equalTo("objectId", idPhoto);
	
	//on va recuperer les photos
	queryGetPhoto.first({
		 success: function(imgParseObject) {


			 //on affiche les likes
			 $(".like-div-likers ").empty();
			 var htmlToPrint = '';
			 
			 
			 //si il y a des likes
			 if(imgParseObject.attributes.likes) {
			 	console.log(imgParseObject.attributes.likes);
				 for (j = 0; j < imgParseObject.attributes.likes.length ; j++){
				 	
				 	var jplusun = j + 1;
				 	//si c'est le dernier
				 	if(jplusun == imgParseObject.attributes.likes.length) {
				 		//si il y en a plus d'un
				 		if(imgParseObject.attributes.likes.length > 1) {
					 		htmlToPrint += photoview_and;
				 		}
					 	htmlToPrint += imgParseObject.attributes.likes[j].name + photoview_likethis;
				 	}
				 	else {
				 		//si ce n'est pas le premier
				 		if(j != 0) {
				 		htmlToPrint += ", " ;
				 		}
					 	htmlToPrint += imgParseObject.attributes.likes[j].name;
				 	}
				 	
				 	
				 }
				 
				if (imgParseObject.attributes.likes.length == 0) {
					htmlToPrint += photoview_nolike;
				}
			 }
			 else {
				 htmlToPrint += photoview_nolike;
			 }
			 $(".like-div-likers ").empty();
			 
			 $(".like-div-likers ").append(htmlToPrint);
			 
			 htmlToPrint = "";
			 
			 //on affiche les commentaires
			 if(imgParseObject.attributes.comments) {
			 	for (j = 0; j < imgParseObject.attributes.comments.length ; j++){
			 	
					htmlToPrint +="<div class=\"comment-content\" id=\"imgParseObject.attributes.comments[j].id\">";
					htmlToPrint +="<div class=\"userCommentProfilPic\">";
					if(imgParseObject.attributes.comments[j].facebookId){
					htmlToPrint +="<img src=\"https:\/\/graph.facebook.com\/"+ imgParseObject.attributes.comments[j].facebookId +"\/picture?type=square&amp;return_ssl_resources=1\" alt=\"Woovent Progil pic Photo\" height=\"\"\/>";
					} else {
					htmlToPrint +="<img src=\"http:\/\/www.vincegolangco.com\/wp-content\/uploads\/2010\/12\/batman-for-facebook.jpg\" alt=\"Woovent Progil pic Photo\" height=\"45px\"\/>";	
					}
					
					htmlToPrint +="<\/div>";
					htmlToPrint +="<div class=\"comment-text\">";
					htmlToPrint +="<span class=\"commentUserName\">" + imgParseObject.attributes.comments[j].name + "<\/span><br \/>";
					htmlToPrint +="<span class=\"comment-text-content\"> " + imgParseObject.attributes.comments[j].comment + "<\/span>";
					htmlToPrint +="<\/div><\/div>";	
					
					$(".comment-div").empty();
					$(".comment-div").append(htmlToPrint);
							 
			 
			 	}
			 
			 }
			 	 

			//on regarde si il a deja like la photo
			if(imgParseObject.attributes.likes && parent.currentUser){
				
				//on parcours le tableau de like
				for (j = 0; j < imgParseObject.attributes.likes.length ; j++){
					//si on trouve un like avec le même id que le current user
					if (imgParseObject.attributes.likes[j].id == parent.currentUser.id){
						$(".like-button-picto").css("color", "red"); 
					}
				}
				
			}
			
			addOrientationClass ();
			
			finishLoader();
			
			
			
				
		 },
		 error : function(error){
			console.log("ERROR to find the picture of the event "); 
			finishLoader();
		 }
	});
}


/**************
function refresh like / comment
***************/
function checkPhotoInfo(){

	//on creer la requete pour verif si existe sur le serveur
	var Photo = Parse.Object.extend("Photo");
	var queryGetPhoto = new Parse.Query(Photo);
	
	//on verifie sil existe en base un event avec le meme facebook id
	queryGetPhoto.equalTo("objectId", idPhoto);
	
	//on va recuperer les photos
	queryGetPhoto.first({
		 success: function(imgParseObject) {


			 //on affiche les likes
			 $(".like-div-likers ").empty();
			 var htmlToPrint = '';
			 
			 
			 //si il y a des likes
			 if(imgParseObject.attributes.likes) {
			 	console.log(imgParseObject.attributes.likes);
				 for (j = 0; j < imgParseObject.attributes.likes.length ; j++){
				 	
				 	var jplusun = j + 1;
				 	//si c'est le dernier
				 	if(jplusun == imgParseObject.attributes.likes.length) {
				 		//si il y en a plus d'un
				 		if(imgParseObject.attributes.likes.length > 1) {
					 		htmlToPrint += photoview_and;
				 		}
					 	htmlToPrint += imgParseObject.attributes.likes[j].name + photoview_likethis;
				 	}
				 	else {
				 		//si ce n'est pas le premier
				 		if(j != 0) {
				 		htmlToPrint += ", " ;
				 		}
					 	htmlToPrint += imgParseObject.attributes.likes[j].name;
				 	}
				 	
				 	
				 }
				 
				if (imgParseObject.attributes.likes.length == 0) {
					htmlToPrint += photoview_nolike;
				}
			 }
			 else {
				 htmlToPrint += photoview_nolike;
			 }
			 $(".like-div-likers ").empty();
			 
			 $(".like-div-likers ").append(htmlToPrint);
			 
			 htmlToPrint = "";
			 //on affiche les commentaires
			 if(imgParseObject.attributes.comments) {
			 	for (j = 0; j < imgParseObject.attributes.comments.length ; j++){
			 	
					htmlToPrint +="<div class=\"comment-content\" id=\"imgParseObject.attributes.comments[j].id\">";
					htmlToPrint +="<div class=\"userCommentProfilPic\">";
					htmlToPrint +="<img src=\"https:\/\/graph.facebook.com\/567053984\/picture?type=large&amp;return_ssl_resources=1\" alt=\"Woovent Progil pic Photo\" height=\"45px\"\/>";
					htmlToPrint +="<\/div>";
					htmlToPrint +="<div class=\"comment-text\">";
					htmlToPrint +="<span class=\"commentUserName\">" + imgParseObject.attributes.comments[j].name + "<\/span><br \/>";
					htmlToPrint +="<span class=\"comment-text-content\"> " + imgParseObject.attributes.comments[j].comment + "<\/span>";
					htmlToPrint +="<\/div><\/div>";	
					
					$(".comment-div").empty();
					$(".comment-div").append(htmlToPrint);
							 
			 
			 	}
			 
			 }
			 	 

			//on regarde si il a deja like la photo
			if(imgParseObject.attributes.likes && parent.currentUser){
				
				//on parcours le tableau de like
				for (j = 0; j < imgParseObject.attributes.likes.length ; j++){
					//si on trouve un like avec le même id que le current user
					if (imgParseObject.attributes.likes[j].id == parent.currentUser.id){
						$(".like-button-picto").css("color", "red"); 
					}
				}
				
			}



			finishLoader();
			
			
				
		 },
		 error : function(error){
			console.log("ERROR to find the picture of the event "); 
			finishLoader();
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
			if(imgParseObject.attributes.likes && parent.currentUser){
				//on parcours le tableau de like
				for (j = 0; j < imgParseObject.attributes.likes.length ; j++){
					//si on trouve un like avec le même id que le current user
					if (imgParseObject.attributes.likes[j].id == parent.currentUser.id){
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

function likeThePicture(imgParseObject) {
	//on converti la date du like en ISO
 	var todayDate = new Date() ;
 	var todayIsoDate = todayDate.toISOString();
 	
 	//on crée le dictionnaire pour le like à ajouter
 	var dateLike = {"__type":"Date", "iso": todayIsoDate };
 	var likeArray = {"date": dateLike, "facebookId": parent.currentUser.attributes.facebookId, "id" : parent.currentUser.id , "name" : parent.currentUser.attributes.name };
 	
 	//on ajoute le like au tableau de like deja present sur la photo
 	//si il y a des likes
 	if(imgParseObject.attributes.likes	!=null){
	 	var photoLikeArray = imgParseObject.attributes.likes;
 	}
 	else {
	 	var photoLikeArray = [];
 	}
 	
 	
 	photoLikeArray.push(likeArray);
 	
 	imgParseObject.set("likes",  photoLikeArray);
 	imgParseObject.save();
 
 	//on change la couleur du like et les noms
 	$(".like-button-picto").css("color", "red"); 
 	checkPhotoInfo();
 	
 	//on change le nombre sur la page event
 	var numberOfLike = photoLikeArray.length;
 	parent.numberOflikeThePicture(imgParseObject, numberOfLike);

}

/*************************************
   unlike d'une photo
**************************************/

function unlikeThePicture(imgParseObject, likePosition) {

	//on delike la photo
	var photoLikeArray = imgParseObject.attributes.likes;
 	
 	photoLikeArray.splice(likePosition,1)
 	
 	imgParseObject.set("likes",  photoLikeArray);
 	imgParseObject.save();
 
 	//on change la couleur du like 
 	$(".like-button-picto").css("color", "grey"); 
 	checkPhotoInfo();
 	
  	//on change le nombre sur la page event
 	var numberOfLike = photoLikeArray.length;
 	parent.numberOflikeThePicture(imgParseObject, numberOfLike);
 	

}

/*************************************
   on affiche la photo
**************************************/

function finishLoader() {

	$(".photo-container").css("visibility" , "visible");

	$(".loading-div").fadeOut(500);
	$(".comment-loading-div").fadeOut(500);

}

/*************************************
   on post un nouveau commentaire
**************************************/
function newCommentToPost() {
	//on recupère le contenu de l'input
	var commentContentText = $(".post-div-input").val();
	
	$(".post-div-input").val("");
	
	//on récupère les comment déjà existant
	//on creer la requete pour verif si existe sur le serveur
	var Photo = Parse.Object.extend("Photo");
	var queryGetPhoto = new Parse.Query(Photo);
	
	//on verifie sil existe en base un event avec le meme facebook id
	queryGetPhoto.equalTo("objectId", idPhoto);
	
	//on va recuperer les photos
	queryGetPhoto.first({
		 success: function(imgParseObject) {
		 	if(!imgParseObject){
		 	//il n'a rien trouve
		 	} else {
			 	
				//on converti la date du like en ISO
			 	var todayDate = new Date() ;
			 	var todayIsoDate = todayDate.toISOString();
			 	
			 	//on crée le dictionnaire pour le comment à ajouter
			 	var dateComment = {"__type":"Date", "iso": todayIsoDate };
			 	var commentArray = {"comment" : commentContentText ,"date": dateComment, "facebookId": parent.currentUser.attributes.facebookId, "id" : parent.currentUser.id , "name" : parent.currentUser.attributes.name };
			 	
			 	//on ajoute le comment au tableau de comment deja present sur la photo
			 	//si il y a des comment
			 	if(imgParseObject.attributes.comments){
				 	var photoCommentArray = imgParseObject.attributes.comments;
			 	}
			 	else {
				 	var photoCommentArray = [];
			 	}
			 	
			 	
			 	photoCommentArray.push(commentArray);
			 	
			 	imgParseObject.set("comments",  photoCommentArray);
			 	imgParseObject.save(null, {
					  success: function() {
					    	//on change le nombre sur la page event
						 	var numberOfComment = photoCommentArray.length;
						 	parent.numberOfCommentThePicture(imgParseObject, numberOfComment);
						 	
						 	//on refresh les commentaires
						 	checkPhotoInfo();
						 	

					  },
					  error: function(gameScore, error) {
					    // Execute any logic that should take place if the save fails.
					    // error is a Parse.Error with an error code and description.
					    console.log('Failed to save new comment ');
					  }
					});


			
		 }
		 },
		 error : function(error){
			console.log("ERROR to find the picture of the event "); 
		 }
	});

	
	
	
	
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



