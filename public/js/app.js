/*****
 * Event listener for the entire document.
 * Loads the Firebase SDK.
 */
document.addEventListener('DOMContentLoaded', function() {
	try {
	  let app = firebase.app();
	  let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
	  document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;

	  let user = firebase.auth().currentUser;
	  if(user != null) {
		  signInUser(user);
	  } else {
		  loadAuthCard();
		  setupSignInListener();
	  }
	} catch (e) {
	  console.error(e);
	  document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
	}
});

loadAuthCard = function() {
	$('#main_box').load('auth_card.html');
	  
		setupSignUpListener();	
};

/*****
 * Signs in a user. Actually, this method does the necessary visual setup AFTER a sign in
 * is done.
 */
signInUser = function(user) {
	let navBarRight = document.querySelector('#nav-mobile');

	navBarRight.innerHTML = '';
	navBarRight.innerHTML += '<li id="signed_in_as">' + user.email + '</li>';
	navBarRight.innerHTML += '<li><a id="signout_button" href="#">Sign out</a></li>';

	document.querySelector('#signout_button').addEventListener('click', function() {
		firebase.auth().signOut().then(function() {
			signOutUser();
		});
	});
}


/*****
 * Signs out a user.
 */
signOutUser = function() {
	document.querySelector('#nav-mobile').innerHTML = '';
	$(function() {
		$('#main_box').load("auth_card.html");
	});
}


/*****
 * Event listener for the sign in button.
 * Sets up user authentication.
 */
setupSignInListener = function() {
	document.querySelector('#signin_button').addEventListener('click', function() {
		// Get the email and password fields from the input tags
		let email = document.querySelector('#signin_email').value,
			pwd = document.querySelector('#signin_pwd').value;

		let signInErrorsBlock = document.querySelector('#signin_errors');
		signInErrorsBlock.style.display = "none";

		console.log('email: ' + email + ", pwd: " + pwd);
		if(pwd.length < 8) {
			// Add error conditions.
			let error = "Password must be at least 8 characters long.";
			signInErrorsBlock.querySelector('#signin_errors_list').innerText = error;
			return;
		}

		// Firebase sign in.
		firebase.auth().signInWithEmailAndPassword(email, pwd).catch(function(error) {
			signInErrorsBlock.style.display = "block";
			signInErrorsBlock.style.color = "red";
			
			// Handle Errors here.
			let errorCode = error.code,
				errorMessage = error.message;
			// ...

			signInErrorsBlock.querySelector('#signin_errors_list').innerText = errorMessage;
		});

		firebase.auth().onAuthStateChanged(function(user) {
			if(user) {
				signInUser(user);
			}
		});
	});

	document.querySelector('#signin_tab_button').addEventListener('click', function() {
		document.querySelector('#signup_tab').style.display = "none";
		document.querySelector('#signin_tab').style.display = "block";
	
		document.querySelector('#signin_tab_link').setAttribute('class', 'active');
		document.querySelector('#signup_tab_link').removeAttribute('class');
	});
};

/*****
 * Event listener for the sign up button.
 * Creates a new user.
 */
setupSignUpListener = function() {
	document.querySelector('#signup_button').addEventListener('click', function() {
		// Get email and password for signup.
		let email = document.querySelector('#signup_email').value,
			pwd = document.querySelector('#signup_pwd').value,
			confirm = document.querySelector('#signup_confirm').value;

		let signUpErrorsBlock = document.querySelector('#signup_errors');
		signUpErrorsBlock.style.display = "none";

		if(pwd.length < 8 || confirm.length < 8) {
			// Add error conditions.
			let error = "Password must be at least 8 characters long.";
			signInErrorsBlock.querySelector('#signin_errors_list').innerText = error;
			return;
		}

		if(pwd !== confirm) {
			let error = "Passwords do not match.";
			signInErrorsBlock.querySelector('#signin_errors_list').innerText = error;
			return;
		}

		// Firebase sign up.
		firebase.auth().createUserWithEmailAndPassword(email, pwd).catch(function(error) {
			signInErrorsBlock.style.display = "block";
			signInErrorsBlock.style.color = "red";
			
			// Handle Errors here.
			let errorCode = error.code,
				errorMessage = error.message;
			// ...

			signInErrorsBlock.querySelector('#signin_errors_list').innerText = errorMessage;
		});

		firebase.auth().onAuthStateChanged(function(user) {
			if(user) {
				signInUser(user);
			}
		});
	})

	/*
	 * Event listeners for the sign in and sign up tabs.
	 * Needed for error message displays.
	 */
	document.querySelector('#signup_tab_button').addEventListener('click', function() {
		document.querySelector('#signin_tab').style.display = "none";
		document.querySelector('#signup_tab').style.display = "block";

		document.querySelector('#signup_tab_link').setAttribute('class', 'active');
		document.querySelector('#signin_tab_link').removeAttribute('class');
	});
};




