import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';
import SessionStorage from 'react-native-session-storage';
import { convertDocxToHtml } from './docxConverter';

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
// Initialize Appwrite Client
export const client = new Client();
client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

const avatars = new Avatars(client);


// --- Helper Functions ---

// Validate file is HTML or HTM and within size limits
function validateFile(file) {
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'text/html'  // .html
    ];
    
    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only DOCX and HTML files are allowed.');
    }
    
    // Add any other validation as needed
}

// Set client session from storage
const setClientSessionFromStorage = async (client) => {
    if (!client) return;
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

// Get current user data
export async function getCurrentUser(client) {
    if (!client) return null;
    await setClientSessionFromStorage(client);
    try {
        const account = new Account(client);
        const currentAccount = await account.get();
        if (!currentAccount) throw new Error("No current account");

        const databases = new Databases(client);
        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal("accountID", currentAccount.$id)]
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

// Get user session
export async function getUserSession(client) {
    if (!client) return null;
    try {
        const account = new Account(client);
        const user = await account.get();
        return user;
    } catch (error) {
        console.error("Error getting user session:", error);
        return null;
    }
}
// Create a new user account and document
export async function createUser(email, password, username, client) {
    if (!client) throw new Error("No client in context");
    try {
        const account = new Account(client);
        const newAccount = await account.create(ID.unique(), email, password, username);
        if (!newAccount) throw new Error("Failed to create account");

        const avatarUrl = avatars.getInitials(username);
        const databases = new Databases(client);
        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            { accountID: newAccount.$id, email, username, avatar: avatarUrl }
        );

        await signIn(email, password, client); // Sign in the new user
        return newUser;
    } catch (error) {
        console.error("Error in createUser:", error);

        if (error.message.includes("session is prohibited")) {
            try {
                const account = new Account(client);
                const activeSessions = await account.listSessions();
                await Promise.all(activeSessions.sessions.map(session => account.deleteSession(session.$id)));
                return createUser(email, password, username, client); // Retry after clearing sessions
            } catch (sessionError) {
                console.error("Error clearing sessions:", sessionError);
                throw new Error(sessionError);
            }
        }
        throw new Error(error);
    }
}

// Sign in a user with email and password
export async function signIn(email, password, client) {
    if (!client) throw new Error("No client in context");
    const account = new Account(client);
    try {
        // Sign out before creating a new session
        try {
            await signOut(client);
        } catch (e) {
            console.log("Error on sign out (ignoring):", e);
        }

        const session = await account.createEmailPasswordSession(email, password);
        await SessionStorage.setItem('appwrite_session', JSON.stringify(session)); // Store session
        const user = await getCurrentUser(client);

        return user;
    } catch (error) {
        console.error("Error in session creation:", error);
        throw new Error("Failed to sign in. Please check your credentials and try again.");
    }
}

// Sign out the current user
export async function signOut(client) {
    if (!client) throw new Error("No client in context");
    const account = new Account(client);
    try {
        await account.deleteSession('current');
        await SessionStorage.removeItem('appwrite_session');
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

// Upload a file to Appwrite storage
export async function uploadFile(file, client) {
    if (!file || !client) return;
    const { type, ...rest } = file; // changed to 'type'

    if(!type || !(type === 'text/html' || type === 'text/htm')){ // Changed from mimeType to type
      throw new Error('Invalid MIME type. Only HTML or HTM files are allowed')
    }
     const asset = { type: type, ...rest };

    try {
        const storage = new Storage(client);
        const uploadedFile = await storage.createFile(config.storageId, ID.unique(), asset);
        return uploadedFile;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Error uploading file");
    }
}


// Add category order validation
const VALID_CATEGORIES = ['תורה', 'נביאים', 'כתובים'];


// Upload a file and create a document in the database
export async function upload(category, book, episode, file, client, userId) {
    if (!VALID_CATEGORIES.includes(category)) {
        throw new Error('Invalid category');
    }
    if (!client) throw new Error("No client in context");
    if (!userId) throw new Error("No user in context");
    if (!category || !book || !episode) throw new Error("Missing required fields");
    if (!file) throw new Error("No file provided");

    try {
        validateFile(file); // Validate
        const storage = new Storage(client);
        const databases = new Databases(client);

        // Convert DOCX to HTML if it's a Word document
        let fileToUpload;
        let fileType = 'text/html';
        
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            fileToUpload = await convertDocxToHtml(file.fileBlob);
        } else {
            fileToUpload = file.fileBlob;
        }

        const fileId = ID.unique();
        const displayName = `${category}-${book}-${episode}.html`;

        // Create a new file object
        const fileObject = new File([fileToUpload], displayName, { type: fileType });

        // Upload the file to storage
        const storageResponse = await storage.createFile(
            config.storageId,
            fileId,
            fileObject,
            ['read("any")']
        );

        // Check if the file was uploaded successfully
        if (!storageResponse || !storageResponse.$id) {
            throw new Error("File upload failed, no response from storage");
        }

        // Create a new document in the database
        const fileMetadata = await databases.createDocument(
            config.databaseId,
            config.htmlCollectionId,
            ID.unique(),
            {
                category,
                book,
                episode,
                users: userId,
                fileName: displayName,
                uploaded_at: new Date(),
                fileId: storageResponse.$id
            },
            ['read("any")']
        );
        
        return fileMetadata;
    } catch (error) {
        console.error("Error in upload:", error);
        throw new Error(`Error uploading file: ${error.message}`);
    }
}

// List all files with grouping
export async function listFiles(client) {
    if (!client) throw new Error("No client in context");
    
    try {
        const databases = new Databases(client);
        const response = await databases.listDocuments(
            config.databaseId,
            config.htmlCollectionId,
            [
                Query.orderAsc('category'),
                Query.orderAsc('book'),
                Query.orderAsc('episode')
            ]
        );

        // Add debug logging
        console.log("Fetched documents:", response.documents);

        // Group files by category and book, ensuring arrays
        const groupedFiles = response.documents.reduce((acc, file) => {
            const category = file.category || 'uncategorized';
            const book = file.book || 'unknown';

            if (!acc[category]) {
                acc[category] = {};
            }
            if (!acc[category][book]) {
                acc[category][book] = [];
            }
            
            // Ensure we're always pushing to an array
            acc[category][book] = [...acc[category][book], file];
            
            return acc;
        }, {});

        // Add debug logging
        console.log("Grouped structure:", groupedFiles);
        
        return groupedFiles;
    } catch (error) {
        console.error("Error listing files:", error);
        throw new Error(`Could not fetch files: ${error.message}`);
    }
}

// Delete a file
export async function deleteFile(fileId, docId, client) {
    if (!client) throw new Error("No client in context");
    
    try {
        const storage = new Storage(client);
        const databases = new Databases(client);

        // Delete file from storage
        await storage.deleteFile(config.storageId, fileId);
        
        // Delete document from database
        await databases.deleteDocument(
            config.databaseId,
            config.htmlCollectionId,
            docId
        );
    } catch (error) {
        console.error("Error deleting file:", error);
        throw new Error("Could not delete file");
    }
}

// Reorder episodes within a book
export async function reorderEpisodes(docId, newIndex, client) {
    if (!client) throw new Error("No client in context");
    
    try {
        const databases = new Databases(client);
        await databases.updateDocument(
            config.databaseId,
            config.htmlCollectionId,
            docId,
            {
                index: newIndex
            }
        );
    } catch (error) {
        console.error("Error reordering episodes:", error);
        throw new Error("Could not reorder episodes");
    }
}

export async function updateFile(docId, fileId, { category, book, episode, file }, client) {
    if (!client) throw new Error("No client in context");
    
    try {
        const databases = new Databases(client);
        const storage = new Storage(client);
        
        // If a new file was uploaded, delete the old one and upload the new one
        if (file) {
            // Upload new file
            const fileObject = new File([file.fileBlob], `${category}-${book}-${episode}.${file.name.split('.').pop()}`, { type: file.type });
            await storage.deleteFile(config.storageId, fileId);
            const newFile = await storage.createFile(
                config.storageId,
                ID.unique(),
                fileObject,
                ['read("any")']
            );
            fileId = newFile.$id;
        }

        // Update document
        await databases.updateDocument(
            config.databaseId,
            config.htmlCollectionId,
            docId,
            {
                category,
                book,
                episode,
                ...(file && { fileId })
            }
        );
    } catch (error) {
        console.error("Error updating file:", error);
        throw new Error("Could not update file");
    }
}
