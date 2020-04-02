import {firebaseConfig} from "../config.js";

// Load firebase
import {default as firebase} from "../../web_modules/firebase/firebase-app.js";
import "../../web_modules/firebase/firebase-auth.js";
import "./../web_modules/firebase/firebase-firestore.js";
import {auth, CollectionNames} from "./auth.js";

let isInitialized = false;

/**
 * Initializes firebase and subscribes to relevant collections.
 */
export async function initFirebase () {
	if (isInitialized) {
		return;
	}

	isInitialized = true;
	await firebase.initializeApp(firebaseConfig);

	// Get database
	const db = firebase.firestore();
	auth.setDb(db);

	// Set Firebase
	auth.setFirebase(firebase);

	// Get auth from firebase
	const firebaseAuth = firebase.auth();

	// Listen for auth changes
	let usersCollectionUnsubscriber = null;
	firebaseAuth.onAuthStateChanged(user => {

		// Unsubscribe from previous collection
		if (usersCollectionUnsubscriber != null) {
			usersCollectionUnsubscriber();
			usersCollectionUnsubscriber = null;
		}

		// Subscribe to new collection
		if (user != null) {
			usersCollectionUnsubscriber = db.collection(CollectionNames.users).doc(user.uid).onSnapshot(doc => {
				const data = doc.data() || {};
				auth.setCompletedSkills("completedSkills" in data ? data.completedSkills : []);
			});

		} else {
			auth.setCompletedSkills([]);
		}

		auth.setUser(user);
	});
}