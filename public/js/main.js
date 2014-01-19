function isUserConnected(){

	
		FB.getLoginStatus(function(response) {
		//check si le user est deja loggue
			if (response.status === 'connected') {

				// user logged in and linked to app
				// handle this case HERE
				console.log("\n ***** User already connected to Facebook! ***** \n");
				
				//fblogin();
				
			}
			else {
				//fblogin();
			}
		});	
}

/*************************************
   connexion ou creation de compte
*************************************/
function fblogin() {
	//on appel le login de parse et demande les bonnes autorisations
Parse.FacebookUtils.logIn("email,user_about_me,user_birthday,user_location", {
	  success: function(user) {
	  
	  	//si le user nexistait pas on le crée
	    if (!user.existed()) {
	      console.log("\n ***** User signed up and logged in through Facebook! ***** \n");
	      console.log(user);
	      createUserAccount(user);

		//si le user existait on redirige direct vers le dashboard
	    } else {
	      $(".user_first_name").empty();
	      $(".user_first_name").append(user.attributes.first_name);
		  $('#facebookLoginComingSoon').modal('show');
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
function createUserAccount(parseCurrentUser){
	
	//on va recup les infos
	FB.api("/me", function(response) {
	
			$(".user_first_name").empty();
			$(".user_first_name").append(response.first_name);
			
		
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
				    // Execute any logic that should take place after the object is saved.
				    console.log('\n ***** User information update with success **** \n');
				    
					$('#facebookLoginComingSoon').modal('show');

				  },
				  error: function(parseUserSaved, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    console.log('\n !!!!! Failed to create new object, with error code: !!!!! \n ' + error.description);
				  }
				});	
	
	});
}

window.jQuery(document).ready(function($){
	
	'use strict';
	
	// Main navigation menu affix
	$('.stickem-container').stickem({ start: 1 });
	
	// Main navigation menu scrollspy to anchor section
	$('#header .navbar-nav').ddscrollSpy({ scrolltopoffset: -50 });
	
	// Slider background with parallax effect que si on est pas sur mobile
	if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
   
  }
 else {
 	//si ecran retina on ne fait pas leffet parallax
	 if (window.devicePixelRatio >= 2) {
	}
	else {
		$.stellar({ horizontalScrolling: false });
	}
    
  }
	
	
	// jQuery smooth scrolling
	$('a.smooth-scroll').on('click', function(event) {
		var $anchor		= $(this);
		var offsetTop	= '';
		
		if ($(document).width() >= 769) { offsetTop = parseInt($($anchor.attr('href')).offset().top - 70, 0);
		} else { offsetTop = parseInt($($anchor.attr('href')).offset().top, 0); }
		
		$('html, body').stop().animate({
			scrollTop: offsetTop
		}, 1500,'easeInOutExpo');
		
		event.preventDefault();
	});
	
	// jQuery placeholder for IE
	$('input, textarea').placeholder();
	
	// jQuery figure hover effect
	$('figure.figure-hover').hover(
		function() {
			$(this).children('div').fadeIn(200);
			$(this).children('div').children('.icon-hover').animate({
				top:0
			}, 200);
		},
		function() {
			$(this).children('div').fadeOut(200);
			$(this).children('div').children('.icon-hover').animate({
				top:'100%'
			}, 200);
		}
	);
	
	// Pretty Photo for image gallery modal popup
	$('a[data-rel^="prettyPhoto"]').prettyPhoto({
		social_tools: false,
		hook: 'data-rel'
	});
	
	// jQuery tooltip for social media link
	$('#footer .social a').tooltip();
	
	// Photo galleries slider with nivoSlider
	$('#main .main-gallery .main-slider .nivoSlider').nivoSlider({
		directionNav: false,
		controlNav: false,
		pauseTime: 3000
	});
	
	// Screenshots slider with Flexslider
	$('#screenshots .slider .flexslider').flexslider({
		animation: 'slide',
		controlNav: false,
		start: function(slider) { $(slider).removeClass('loading'); }
	});
	
	/* Contact us process */
	$('#contact-form').submit(function() {
		var submitData	= $(this).serialize();
		var $name		= $(this).find('input[name="name"]');
		var $email		= $(this).find('input[name="email"]');
		var $subject	= $(this).find('textarea[name="subject"]');
		var $message	= $(this).find('textarea[name="message"]');
		var $submit		= $(this).find('input[name="submit"]');
		var $dataStatus	= $(this).find('.data-status');
		
		$name.attr('disabled','disabled');
		$email.attr('disabled','disabled');
		$subject.attr('disabled','disabled');
		$message.attr('disabled','disabled');
		$submit.attr('disabled','disabled');
		
		$dataStatus.show().html('<div class="alert alert-info"><strong>Chargement en cours...</strong></div>');
		
		$.ajax({ // Send an offer process with AJAX
			type: 'POST',
			url: 'process-contact.php',
			data: submitData + '&action=add',
			dataType: 'html',
			success: function(msg){
				if(parseInt(msg, 0) !== 0) {
					var msg_split = msg.split('|');
					if(msg_split[0] === 'success') {
						$name.val('').removeAttr('disabled');
						$email.val('').removeAttr('disabled');
						$subject.val('').removeAttr('disabled');
						$message.val('').removeAttr('disabled');
						$submit.removeAttr('disabled');
						$dataStatus.html(msg_split[1]).fadeIn();
					} else {
						$name.removeAttr('disabled');
						$email.removeAttr('disabled');
						$subject.removeAttr('disabled');
						$message.removeAttr('disabled');
						$submit.removeAttr('disabled');
						$dataStatus.html(msg_split[1]).fadeIn();
					}
				}
			}
		});
		return false;
	});
	/* End contact us process */
	
	
	/* Email subcribe process */
	$('#subscribe-form input[type="text"]').live('focus keypress',function(){ // Checking subcribe form when focus event
		var $email = $(this);
		if ($email.val() === 'Please enter your email address' || $email.val() === 'Please enter a valid email address' || $email.val() === 'Subscribe process completed' || $email.val() === 'Email is already registered') {
			$(this).val('').css({'backgroundColor': '#FFF'});
		}
	});
	
	$('#subscribe-form').submit(function(){ // Checking subcribe form when submit to database
		var $email	= $(this).find('input[type="text"]');
		var $submit	= $(this).find('input[type="submit"]');
		var email_pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
		if (email_pattern.test($email.val()) === false) {
			$email.val('Please enter a valid email address').css({'backgroundColor': '#f0c0c0'});
		} else {
			var submitData = $(this).serialize();
			$email.attr('disabled','disabled');
			$submit.attr('disabled','disabled');
			$.ajax({ // Subcribe process with AJAX
				type: 'POST',
				url: 'process-subscribe.php',
				data: submitData + '&action=add',
				dataType: 'html',
				success: function(msg){
					if (parseInt(msg, 0) !== 0) {
						var msg_splits = msg.split('|');
						
						if (msg_splits[0] === 'success') {
							$submit.removeAttr('disabled');
							$email.removeAttr('disabled').val(msg_splits[1]).css({'backgroundColor': '#baeaba'}); 
						} else {
							$submit.removeAttr('disabled');
							$email.removeAttr('disabled').val(msg_splits[1]).css({'backgroundColor': '#f0c0c0'});
						}
					}
				}
			});
		}
		return false;
	});
	/* End email subcribe process */

});