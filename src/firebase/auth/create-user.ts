"use server";

import { initializeApp, deleteApp, FirebaseApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, UserCredential } from "firebase/auth";
import { firebaseConfig } from "../config";

// A function to create a user in Firebase Auth without affecting the current session.
export async function createAuthUser(email: string, password: string): Promise<UserCredential> {
  const tempAppName = `temp-user-creation-${Date.now()}`;
  let tempApp: FirebaseApp | undefined;

  try {
    // Initialize a temporary, secondary Firebase app.
    tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    // Create the user with the temporary auth instance.
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);

    return userCredential;
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
