


/*************************************
   initialisation à la fin du chargement de la page
*************************************/
function initJS() {

	//on va fixer la taille des div des photos
	setDivHeight();
	
	//on va récupérer les infos sur l'event à afficher
	getEventInformation();
	

	
}


/*************************************
   on fixe les tailles des divs des photos
*************************************/
function setDivHeight () {
	var divImageWidth = $(".image-xs").width();
	$(".image-xs").height(divImageWidth);
	
	var divImageWidth = $(".image-md").width();
	$(".image-md").height(divImageWidth);
	
	var divImageWidth = $(".image-lg").width();
	$(".image-lg").height(divImageWidth);
	
	var divImageWidth = $(".image-lg").width();
	$(".border-picture").height(divImageWidth);
	
	var divImageWidth = $(".button-image").width();
	$(".button-image").height(divImageWidth);
	
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
	 
	 
	 //on va recuperer les photos
	 queryGetPhoto.find({
			 success: function(imgParseObjectArray) {
			 	console.log(imgParseObjectArray);
			 	
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

	console.log(eventParseObject);
	/*
	//si il y a une cover
	if(eventParseObject.attributes.cover){
		$(".cover").append("<img src=\"" + eventParseObject.attributes.cover + "\" class=\"\" style=\"width : 100%\">");
	}
	
	//si il n'y a pas de cover on en met une par défaut
	else{
		$(".cover").append("<img src=\"https://www.woovent.com/app/img/cover_default.png\" class=\"\" style=\"width : 100%\">");cover_default
	}*/
	 

}



/*************************************
   on affiche les infos de l'event
*************************************/
function printEventPicture (imgParseObjectArray) {
	//variable pour savoir si photo pair ou impair (1 3 ...)
	var photoPosition = 1 ;
	var htmlToPrint = "";
	
	for (i=0; i< imgParseObjectArray.length; i++){
	
	
		//si c'est une image recupéré sur Facebook
		if (imgParseObjectArray[i].attributes.facebook_url_full) {
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
			var pairClassName = "pair-image";
			photoPosition = 1;
		}
		
		//si la photo est en mode portrait
		if (imgParseObjectArray[i].attributes.height > imgParseObjectArray[i].attributes.width){
			var orientationPhotoClassName = " img-portrait ";
			
			//on calcul le margin pour centrer
			var realDivImageHeight = $(".loading-div").height();
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
			var realDivImageWidth= $(".loading-div").width();
			var initialImageWidth = imgParseObjectArray[i].attributes.width;
			var initialImageHeight = imgParseObjectArray[i].attributes.height;
			
			//on calcul le ratio
			var ratioResize = realDivImageWidth / initialImageHeight;
			
			//on set le margin et on fait plus petit - plus grand pour l'avoir en negatif
			var marginToCenter = ( realDivImageWidth - (initialImageWidth * ratioResize)) / 2 ;
			var marginToCenterText = " margin-left : " + marginToCenter + "px;";

		}
		
		htmlToPrint = "<div class=\"col-xs-6 col-sm-4 col-md-3 col-lg-3 "+ pairClassName +"\">";
			htmlToPrint += "<div class=\"image-md " + orientationPhotoClassName + "\" style=\"\">";
				htmlToPrint += "<a href=\"" + imageSrc + " \" data-lightbox=\"album \" title=\" \" >";
					htmlToPrint += "<img src=\"" + imageSrc + " \" class=\" uhu \" style=\"" + marginToCenterText + "\">";
				htmlToPrint += "<\/a>";
			htmlToPrint += "<\/div>";
		htmlToPrint +=	"<\/div>";
		
		$(".img-container").append(htmlToPrint);
		
		htmlToPrint = "";
			
		
	}
	
	setDivHeight ();
	resizeImg();
	
	$(".loading-div").hide();

}



function resizeImg (){

	$('.img-portrait img').animate({'width':'=100%'}, 0);
	$('.img-paysage img').animate({'height':'=100%'}, 0);
}




















