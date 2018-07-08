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
	  console.log(user);
	  if(user !== null) {
		  signInUser(user);
	  } else {
		  loadAuthCard();
	  }
	} catch (e) {
	  console.error(e);
	  document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
	}
});

loadAuthCard = function() {
	// $('#main_box').load('auth_card.html');
	let newRequest = new XMLHttpRequest();
	newRequest.open('GET', 'auth_card.html', true);
	newRequest.onreadystatechange = function() {
		if(this.readyState !== 4) return;
		if(this.status !== 200) return;

		document.querySelector('#main_box').innerHTML = this.responseText;
		setupSignUpListener();	
		setupSignInListener();
	}
	newRequest.send();
};

/*****
 * Signs in a user. Actually, this method does the necessary visual setup AFTER a sign in
 * is done.
 */
signInUser = function(user) {
	// Make changes to the navigation tab.
	let navBarRight = document.querySelector('#nav-mobile');

	navBarRight.innerHTML = '';
	navBarRight.innerHTML += '<li id="signed_in_as">' + user.email + '</li>';
	navBarRight.innerHTML += '<li><a id="signout_button" href="#">Sign out</a></li>';

	document.querySelector('#signout_button').addEventListener('click', function() {
		firebase.auth().signOut().then(function() {
			signOutUser();
		});
	});

	// Make changes to the main box.
	let newRequest = new XMLHttpRequest();
	newRequest.open('GET', 'blogpost.html', true);
	newRequest.onreadystatechange = function() {
		if(this.readyState !== 4) return;
		if(this.status !== 200) return;

		document.querySelector('#main_box').innerHTML = this.responseText;
		setupBlogPostListener();	
	}
	newRequest.send();
}


setupBlogPostListener = function() {
	document.querySelector('#submit_blogpost').addEventListener('click', function() {
		// Clear all existing errors.
		let blogPostErrorsDiv = document.querySelector('#blogpost_errors');
		document.querySelector('#blogpost_errors').style.display = "none";
		blogPostErrorsDiv.innerHTML = '';

		let postTitle = document.querySelector('#blogpost_title').value,
			postText = document.querySelector('#blogpost_text').value;

		if(postTitle.length === 0 || postText.length === 0) {
			let errorMessage = 'Your blog post must contain a title and some text. Bear with us.';
			blogPostErrorsDiv.style.display = "block";
			blogPostErrorsDiv.style.color = "red";
			blogPostErrorsDiv.innerHTML += '<h5>Something went wrong.</h5>';
			blogPostErrorsDiv.innerHTML += '<p>' + errorMessage + '</p>';
			return;
		}

		// If there are no errors, then store the blogpost in the database and add it
		// to the list below.
		// Since all that doesn't exist yet, just log it to the console.
		console.log('New blog post!');
		console.log('Title: ' + postTitle);
		console.log('Content: ' + postText);
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
	/*
	 * Event listener for the sign up tab.
	 * Needed for error message displays.
	 */
	document.querySelector('#signin_tab_button').addEventListener('click', function() {
		document.querySelector('#signup_tab').style.display = "none";
		document.querySelector('#signin_tab').style.display = "block";
	
		document.querySelector('#signin_tab_link').setAttribute('class', 'active');
		document.querySelector('#signup_tab_link').removeAttribute('class');
	});

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
			return;
		});

		firebase.auth().onAuthStateChanged(function(user) {
			console.log(firebase.auth().currentUser)
			if(user) {
				signInUser(user);
			}
		});
	});

	
};

/*****
 * Event listener for the sign up button.
 * Creates a new user.
 */
setupSignUpListener = function() {
	/*
	 * Event listener for the sign up tab.
	 * Needed for error message displays.
	 */
	document.querySelector('#signup_tab_button').addEventListener('click', function() {
		document.querySelector('#signin_tab').style.display = "none";
		document.querySelector('#signup_tab').style.display = "block";

		document.querySelector('#signup_tab_link').setAttribute('class', 'active');
		document.querySelector('#signin_tab_link').removeAttribute('class');
	});

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
			return;
		});

		firebase.auth().onAuthStateChanged(function(user) {
			if(user) {
				signInUser(user);
			}
		});
	})
};




