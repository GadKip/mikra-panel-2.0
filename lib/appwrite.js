import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';
import SessionStorage from 'react-native-session-storage';

// Configuration
export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.gadik.mpanel',
    projectId: '674f0083002c2e7b3f65',
    databaseId: '674f0edb002fbcaf83a5',
    userCollectionId: "674f0f4f003c00d9b191",
    htmlCollectionId: "674f0f78000fa33cea7b",
    storageId: "674f11d1000ef0855b2c"
};

// Initialize Appwrite Client - No more client initialization here
// We'll get it from the context


const avatars = new Avatars(null);
const databases = new Databases(null);



// --- Helper Functions ---

/**
 * Sets the Appwrite client session from storage if available.
 */
const setClientSessionFromStorage = async (client) => {
    if(!client) return;
    try {
        const session = await SessionStorage.getItem('appwrite_session');
        if (session) {
            const parsedSession = JSON.parse(session);
            client.setSession(parsedSession.$id);
        }
    } catch (error) {
        console.error("Error loading session from storage:", error);
    }
};

// --- User Authentication Functions ---

/**
 * Retrieves the current user's data.
 * @returns {Promise<object|null>} The user document or null if not found.
 */
export async function getCurrentUser(client) {
    if(!client) return null;
    await setClientSessionFromStorage(client); // Ensure session is set before fetching user
    try {
        const account = new Account(client);
        const currentAccount = await account.get(client);
        if (!currentAccount) throw new Error("No current account");

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal("accountID", currentAccount.$id)], client
        );

        if (!currentUser || currentUser.documents.length === 0) throw new Error("User not found");

        return currentUser.documents[0];
    } catch (error) {
        if (error.message === "User not found") {
            console.error("User not found error");
            return null;
        }
        console.error("Error in getCurrentUser:", error);
        return null;
    }
}

/**
 * Creates a new user account and user document.
 * @param {string} email
 * @param {string} password
 * @param {string} username
 * @returns {Promise<object>} The new user document.
 */
export async function createUser(email, password, username, client) {
    if(!client) throw new Error("No client in context");
     try {
        const account = new Account(client);
        const newAccount = await account.create(ID.unique(), email, password, username, client);
        if (!newAccount) throw new Error("Failed to create account");

        const avatarUrl = avatars.getInitials(username, client);
           const databases = new Databases(client);
        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            { accountID: newAccount.$id, email, username, avatar: avatarUrl }, client
        );

      await signIn(email, password, client); // Sign in the new user
        return newUser;
    } catch (error) {
        console.error("Error in createUser:", error);

        if (error.message.includes("session is prohibited")) {
            try {
                 const account = new Account(client);
                 const activeSessions = await account.listSessions(client);
                 await Promise.all(activeSessions.sessions.map(session => account.deleteSession(session.$id, client)));
                 return createUser(email, password, username, client); // Retry after clearing sessions
             } catch (sessionError) {
                 console.error("Error clearing sessions:", sessionError);
                 throw new Error(sessionError);
             }
         }
         throw new Error(error);
    }
}

/**
 * Signs in a user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} The session object.
 */
export async function signIn(email, password, client) {
    if(!client) throw new Error("No client in context");
    await setClientSessionFromStorage(client); // Set session from storage first
    try {
        const account = new Account(client);
          const activeSessions = await account.listSessions(client);
        if (activeSessions.sessions.length > 0) {
            await Promise.all(activeSessions.sessions.map(session => account.deleteSession(session.$id, client)));
       }
        
        const session = await account.createEmailPasswordSession(email, password, client);
        await SessionStorage.setItem('appwrite_session', JSON.stringify(session)); // Store session

        await getCurrentUser(client); // Verify session

        return session;
    } catch (error) {
        console.error("Error in session creation:", error);
        throw new Error("Failed to sign in. Please check your credentials and try again.");
    }
}

/**
 * Signs out the current user.
 */
export async function signOut(client) {
    if(!client) throw new Error("No client in context");
    try {
          const account = new Account(client)
        await account.deleteSession('current', client);
        await SessionStorage.removeItem('appwrite_session');
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

// --- File Upload Function ---

/**
 * Uploads a file to Appwrite storage.
 * @param {string} category
 * @param {string} book
 * @param {string} episode
 * @returns {Promise<object>} The uploaded file object.
 */
export async function upload(category, book, episode, client) {
     if(!client) throw new Error("No client in context");
     try {
          const storage = new Storage(client);
       const fileContent = new Blob([episode], { type: 'text/plain' });
        const fileName = `${book}-${category}.txt`;

           const response = await storage.createFile(
              config.storageId,
               ID.unique(),
              fileContent,
            fileName,    // Explicit parameter now ommitted
           
          );

            return response;
      
     }
        catch (error) {
        console.error("Error uploading file:", error);
         throw error;
       }
}