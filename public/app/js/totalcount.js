var totalNumber = 0;
var totalStatsScroll = 0;
var totalEventCreated = 0;
var totalFriendsWithEvent = 0;
var totalFriendsWithEventCreate = 0;

/****************************************************
  On va chercher les meilleures amis du user
*****************************************************/

function getStats (numberToBegin) {

	 var Statistics = Parse.Object.extend("Statistics");
	 var queryCheckInStatistics = new Parse.Query(Statistics);
	 
	 queryCheckInStatistics.limit(1000);
	 queryCheckInStatistics.skip(numberToBegin);
	 
	 queryCheckInStatistics.find({
		 success: function(results) {
			 for (var i = 0; i < results.length; i++) { 
			 		
			 	  if (results[i].attributes.invitedEventCount >0){
				 	  totalFriendsWithEvent++;
			 	  }
			 	  if (results[i].attributes.createdEventCount >0){
				 	  totalFriendsWithEventCreate++;
			 	  }
			 	  
			 	  totalStatsScroll++;
			 	  totalNumber += results[i].attributes.invitedEventCount;
			 	  
			 	  if (results[i].attributes.createdEventCount){
			      	totalEventCreated += results[i].attributes.createdEventCount;
			      }
			      
			 	  $(".stats").empty();
			 	  $(".stats").append(numberWithCommas(totalStatsScroll));
			 	  $(".number").empty();
			 	  $(".number").append(numberWithCommas(totalNumber));
			 	  $(".event").empty();
			 	  $(".event").append(numberWithCommas(totalEventCreated));
			 	  $(".userAttend").empty();
			 	  $(".userAttend").append(numberWithCommas(totalFriendsWithEvent));
			 	  $(".userCreate").empty();
			 	  $(".userCreate").append(numberWithCommas(totalFriendsWithEventCreate));
			      
			      
			    }
		 if (results.length == 1000) {
			 numberToBegin += 1000;
			 getStats(numberToBegin);
		 }
		 else {
		 		  $(".ratioAttend").empty();
			 	  var temp = totalNumber / totalFriendsWithEvent;
			 	  $(".ratioAttend").append(temp);
			 	  
			 	  $(".ratioCreate").empty();
			 	  var temp = totalEventCreated / totalFriendsWithEventCreate;
			 	  $(".ratioCreate").append(temp);
		 }
		 
		 },
		 error: function() {
			 //console.log(" \n !!!!! !!!!! \n" );
			 }
		}); 
		
	 
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


function sendPushNotif () {

 	 var User = Parse.Object.extend("User");
	 var queryCheckInUser = new Parse.Query(User);
	 
	 queryCheckInUser.limit(10);
	 queryCheckInUser.doesNotExist("hasWebStatistics");
	 
	 queryCheckInUser.find({
		 success: function(results) {
		 	console.log(results);
			 for (var i = 0; i < results.length; i++) { 
			      	
			      	FB.api(
					    "/"+ results[i].attributes.facebookId +"/notifications",
					    "POST",
					    {
					    	"access_token" : "493616390746321|JyEPLPbbwdOY60uNdRlM4ROJAvE",
							"template" : "Find your Top 3 best party girls with Facebook Event Lookback!",
					    	"href" : "lookback/",
					    	"ref" : "lookbackPushTest"
					    },
					    function (response) {
					    
					    	 if (response && !response.error) {
					    	 
					    	 console.log("ok");
					    	 }

						}
					);
					
					console.log(results[i].attributes.name);
			      
			    }
		 
		 },
		 error: function() {
			 //console.log(" \n !!!!! !!!!! \n" );
			 }
		}); 
	
	
}