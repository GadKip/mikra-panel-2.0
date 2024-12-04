import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const config = {
    endpoint:'https://cloud.appwrite.io/v1',
    platform: 'com.gadik.mpanel',
    projectId: '674f0083002c2e7b3f65',
    databaseId: '674f0edb002fbcaf83a5',
    userCollectionId: "674f0f4f003c00d9b191",
    htmlCollectionId: "674f0f78000fa33cea7b",
    storageId: "674f11d1000ef0855b2c"
}
// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);
    
const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);


// Register User
export async function createUser (email, password, username) {
    try {
        const newAccount = await account.create(
            ID.unique(), 
            email,
            password,
            username
        );
        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await  databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountID: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl,
            }
        );
        return newUser;
    } catch (error) {
        console.error("Error in createUser:", error);
        if (error.message.includes("session is prohibited")) { 
        // Handle existing session 
            console.log("Clearing existing sessions and retrying...");
            const activeSessions = await account.listSessions();
            await Promise.all(activeSessions.map(session => account.deleteSession(session.$id)));
            return createUser(email, password, username);
        }
        throw new Error(error);
    }
};

// Sign In
export async function signIn(email, password) {
    try {
      console.log("Attempting to sign in...");
      
      // Check for existing sessions
      const activeSessions = await account.listSessions();
      console.log("Active Sessions:", activeSessions);
      if (activeSessions.length > 0) {
        // Clear existing sessions
        await Promise.all(activeSessions.map(session => account.deleteSession(session.$id)));
        console.log("Cleared existing sessions");
      }
      
      // Create a new session
      const session = await account.createEmailSession(email, password);
      console.log("New session created:", session);
      return session;
    } catch (error) {
      console.error("Error in signIn:", error);
      throw new Error("Failed to sign in. Please check your credentials and try again.");
    }
  }
//Get account
export async function getAccount() {
    try {
      console.log("Attempting to get the current account...");
      const currentAccount = await account.get();
      console.log("Current Account retrieved:", currentAccount);
      return currentAccount;
    } catch (error) {
      console.error("Error in getAccount:", error);
      throw new Error("Failed to get account information. Please ensure you are signed in and try again.");
    }
  }
  

// Get Current User
export async function getCurrentUser() {
    try {
      const currentAccount = await getAccount();
      if (!currentAccount) throw Error;
  
      const currentUser = await databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
        [Query.equal("accountID", currentAccount.$id)]
      );
  
      if (!currentUser) throw Error;
  
      return currentUser.documents[0];
    } catch (error) {
        console.error("Error in getCurrentUser:", error);
      return null;
    }
  }
  
