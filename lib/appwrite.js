import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

// Access environment variables
const config = {
    endpoint: process.env.REACT_APP_APPWRITE_ENDPOINT,
    projectId: process.env.REACT_APP_APPWRITE_PROJECT_ID,
    databaseId: process.env.REACT_APP_APPWRITE_DATABASE_ID,
    userCollectionId: process.env.REACT_APP_APPWRITE_USER_COLLECTION_ID,
    htmlCollectionId: process.env.REACT_APP_APPWRITE_HTML_COLLECTION_ID,
    storageId: process.env.REACT_APP_APPWRITE_STORAGE_ID
};
/* export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.gadik.mpanel',
    projectId: '674f0083002c2e7b3f65',
    databaseId: '674f0edb002fbcaf83a5',
    userCollectionId: "674f0f4f003c00d9b191",
    htmlCollectionId: "674f0f78000fa33cea7b",
    storageId: "674f11d1000ef0855b2c"
}; **/

// Initialize Appwrite Client
const client = new Client();
client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);


// Get Current User
export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        console.log("Current Account:", currentAccount); // Log the current account
        if (!currentAccount) throw new Error("No current account");

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal("accountID", currentAccount.$id)]
        );
        console.log("Current User Documents:", currentUser); // Log the retrieved user documents

        if (!currentUser || currentUser.documents.length === 0) throw new Error("User not found");

        return currentUser.documents[0];
    } catch (error) {
        if (error.message === "User not found") {
            // Handle case where user is not found, such as returning null or a default value
            return null;
        }
        console.error("Error in getCurrentUser:", error);
        return null;
    }
}

// Register User
export async function createUser(email, password, username) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );
        if (!newAccount) throw new Error("Failed to create account");
        console.log("Account created:", newAccount);

        const avatarUrl = avatars.getInitials(username);
        console.log("Avatar created!");

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountID: newAccount.$id,
                email,
                username,
                avatar: avatarUrl,
            }
        );
        console.log("User doc created!", newUser);

        await signIn(email, password);
        // Sign in the new user
        return newUser;
    } catch (error) {
        console.error("Error in createUser:", error);

        if (error.message.includes("session is prohibited")) {
            // Handle existing session
            try {
                console.log("Clearing existing sessions and retrying...");
                const activeSessions = await account.listSessions();
                await Promise.all(activeSessions.sessions.map(session => account.deleteSession(session.$id)));
                return createUser(email, password, username);
            } catch (sessionError) {
                console.error("Error clearing sessions:", sessionError);
                throw new Error(sessionError);
            }
        }
        throw new Error(error);
    }
}

// Sign In
export async function signIn(email, password) {
    try {
        // List active sessions
        const activeSessions = await account.listSessions();
        console.log("Active Sessions:", activeSessions);

        if (activeSessions.sessions.length > 0) {
            console.log("There are existing sessions");
            // Clear existing sessions
            await Promise.all(activeSessions.sessions.map(session => account.deleteSession(session.$id)));
            console.log("Cleared existing sessions");
        } else {
            console.log("No existing sessions found");
        }

        // Create a new session
        const session = await account.createEmailPasswordSession(email, password);
        console.log("New session created:", session);

        // Verify session
        const currentUser = await getCurrentUser();
        console.log("Current User:", currentUser);

        return session;
    } catch (error) {
        console.error("Error in session creation:", error);
        throw new Error("Failed to sign in. Please check your credentials and try again.");
    }
}
