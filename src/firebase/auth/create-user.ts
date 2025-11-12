"use server";

import { initializeApp, deleteApp, FirebaseApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "../config";

// Define a plain, serializable user object to return to the client
interface SerializableUser {
  uid: string;
}

interface SerializableUserCredential {
  user: SerializableUser;
}


// A function to create a user in Firebase Auth without affecting the current session.
export async function createAuthUser(email: string, password: string): Promise<SerializableUserCredential> {
  const tempAppName = `temp-user-creation-${Date.now()}`;
  let tempApp: FirebaseApp | undefined;

  try {
    // Initialize a temporary, secondary Firebase app.
    tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    // Create the user with the temporary auth instance.
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
    const user = userCredential.user;

    // Return only the serializable user data needed by the client
    return {
      user: {
        uid: user.uid,
      },
    };
  } catch (error) {
    // Forward any errors from the user creation process.
    throw error;
  } finally {
    // Ensure the temporary app is always cleaned up.
    if (tempApp) {
      await deleteApp(tempApp);
    }
  }
}
