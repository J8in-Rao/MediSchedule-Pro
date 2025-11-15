import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { User, Firestore } from '@/lib/types';

type Action = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'CREATE_PATIENT'
  | 'UPDATE_PATIENT'
  | 'DELETE_PATIENT'
  | 'CREATE_STAFF'
  | 'UPDATE_STAFF'
  | 'DELETE_STAFF'
  | 'CREATE_OT'
  | 'UPDATE_OT'
  | 'DELETE_OT'
  | 'CREATE_RESOURCE'
  | 'UPDATE_RESOURCE'
  | 'DELETE_RESOURCE'
  | 'CREATE_SCHEDULE'
  | 'UPDATE_SCHEDULE'
  | 'DELETE_SCHEDULE'
  | 'CREATE_SURGERY_REQUEST'
  | 'UPDATE_SURGERY_REQUEST'
  | 'APPROVE_SURGERY_REQUEST'
  | 'REJECT_SURGERY_REQUEST';

/**
 * Logs a user action to the 'logs' collection in Firestore.
 * This is a fire-and-forget operation.
 *
 * @param user The Firebase authenticated user object, or null if not authenticated.
 * @param firestore The Firestore instance.
 * @param action A string identifier for the action being performed.
 * @param details An optional object containing additional context about the action.
 */
export function logAction(
  user: { uid: string, email?: string | null } | null,
  firestore: Firestore,
  action: Action,
  details: Record<string, any> = {}
) {
  if (!firestore) {
    console.error("Logging failed: Firestore instance not available.");
    return;
  }

  const logsCollection = collection(firestore, 'logs');
  
  const logEntry = {
    action,
    details,
    userId: user?.uid || 'anonymous',
    userEmail: user?.email || 'anonymous',
    timestamp: serverTimestamp(),
  };

  addDocumentNonBlocking(logsCollection, logEntry).catch(error => {
    // We log to console here as a last resort, since logging to Firestore itself failed.
    console.error("Failed to write to log collection:", error);
  });
}
