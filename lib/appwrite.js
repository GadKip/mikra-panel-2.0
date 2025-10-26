import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';
import SessionStorage from 'react-native-session-storage';
import { convertDocxToHtml, convertDocxToJson } from './docxConverter';

const CATEGORY_ORDER = {
    'הקדמה והסכמות': 0,
    'תורה': 1,
    'נביאים': 2,
    'כתובים': 3
};

const BOOK_ORDER = {
    // Introduction
    'הקדמה והסכמות': 1,
    // Torah
    'בראשית': 1,
    'שמות': 2,
    'ויקרא': 3,
    'במדבר': 4,
    'דברים': 5,
    'הפטרות מיוחדות': 6,
    // Prophets
    'יהושע': 1,
    'שופטים': 2,
    'שמואל': 3,
    'מלכים': 4,
    'ישעיהו': 5,
    'ירמיהו': 6,
    'יחזקאל': 7,
    'תרי עשר': 8,
    'הפטרות מיוחדות': 9,
    // Writings
    'תהילים': 1,
    'משלי': 2,
    'איוב': 3,
    'חמש המגילות': 4,
    'דניאל': 5,
    'עזרא-נחמיה': 6,
    'דברי הימים': 7
};

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
const VALID_CATEGORIES = ['הקדמה והסכמות', 'תורה', 'נביאים', 'כתובים'];


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

        // Convert DOCX to JSON if it's a Word document
        let fileToUpload;
        let fileType = 'application/json'; // Changed to JSON type
        let extension;
        
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const jsonData = await convertDocxToJson(file.fileBlob);
            fileToUpload = new Blob(
                [JSON.stringify(jsonData)], 
                { type: 'application/json' }
            );
            fileType = 'application/json';
            extension = 'json';
        } else {
            fileToUpload = file.fileBlob;
            fileType = file.type;
            extension = 'html';
        }

        const fileId = ID.unique();
        const displayName = `${category}-${book}-${episode}.${extension}`;

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

        // Get max order for this book
        const maxOrder = await getMaxEpisodeOrder(databases, book);
        
        // Use the order as-is, don't add 1
        const episodeOrder = maxOrder;

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
                fileId: storageResponse.$id,
                categoryOrder: CATEGORY_ORDER[category] || 99,
                bookOrder: BOOK_ORDER[book] || 99,
                episodeOrder: episodeOrder
            }
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
        let allDocuments = [];
        let offset = 0;
        const limit = 100;

        while (true) {
            const response = await databases.listDocuments(
                config.databaseId,
                config.htmlCollectionId,
                [
                    Query.orderAsc('categoryOrder'),
                    Query.orderAsc('bookOrder'),
                    Query.orderAsc('episodeOrder'), // Add episode order sorting
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            if (!response || !response.documents || response.documents.length === 0) {
                break;
            }

            allDocuments = [...allDocuments, ...response.documents];
            
            if (response.documents.length < limit) {
                break;
            }
            
            offset += limit;
        }

        // Group files by category and book, ensuring arrays
        const groupedFiles = allDocuments.reduce((acc, file) => {
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

async function getMaxEpisodeOrder(databases, book) {
    if (!book) return 0;

    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.htmlCollectionId,
            [
                Query.equal('book', book),
                Query.orderDesc('episodeOrder'),
                Query.limit(1)
            ]
        );

        if (response.documents.length > 0) {
            const currentOrder = parseFloat(response.documents[0].episodeOrder);
            return currentOrder + 1; // Always add 1 to the highest order
        }
        
        return 1; // First episode in the book
    } catch (error) {
        console.error('Error getting max episode order:', error);
        return 1;
    }
}

export async function updateFile(docId, fileId, { category, book, episode, episodeOrder, file }, client) {
    if (!client) throw new Error("No client in context");
    
    try {
        const databases = new Databases(client);
        const storage = new Storage(client);
        let newFileId = fileId;

        // Update document with whatever values were provided
        const updateData = {
            category: category || null,
            book: book || null,
            episode: episode || null,
            categoryOrder: CATEGORY_ORDER[category] || 99,
            bookOrder: BOOK_ORDER[book] || 99,
            fileId: newFileId
        };

        // Only include episodeOrder if it was explicitly provided
        if (episodeOrder !== undefined) {
            updateData.episodeOrder = parseFloat(episodeOrder);
        }

        await databases.updateDocument(
            config.databaseId,
            config.htmlCollectionId,
            docId,
            updateData
        );

        return true;
    } catch (error) {
        console.error("Error updating file:", error);
        throw new Error("Could not update file");
    }
}

export async function deleteMultipleFiles(files, client) {
    if (!client) throw new Error("No client in context");
    if (!Array.isArray(files) || files.length === 0) {
        throw new Error("No files provided for deletion");
    }
    
    try {
        const storage = new Storage(client);
        const databases = new Databases(client);
        
        const deletionResults = await Promise.all(
            files.map(async (file) => {
                try {
                    await storage.deleteFile(config.storageId, file.fileId);
                    await databases.deleteDocument(
                        config.databaseId,
                        config.htmlCollectionId,
                        file.$id
                    );
                    return { success: true, fileId: file.fileId };
                } catch (error) {
                    return { 
                        success: false, 
                        fileId: file.fileId, 
                        error: error.message 
                    };
                }
            })
        );
        
        const failures = deletionResults.filter(result => !result.success);
        if (failures.length > 0) {
            const failedIds = failures.map(f => f.fileId).join(', ');
            throw new Error(`Failed to delete files: ${failedIds}`);
        }

        return true;
    } catch (error) {
        throw error;
    }
}

export async function reorderEpisode(docId, newOrder, client) {
    if (!client) throw new Error("No client provided");
    
    try {
        const databases = new Databases(client);
        await databases.updateDocument(
            config.databaseId,
            config.htmlCollectionId,
            docId,
            {
                episodeOrder: newOrder
            }
        );
        return true;
    } catch (error) {
        console.error('Error reordering:', error);
        throw error;
    }
}

export async function updateAllDocumentsOrder(client) {
    if (!client) throw new Error("No client provided");
    
    try {
        const databases = new Databases(client);
        const results = {
            total: 0,
            updated: 0,
            failed: 0,
            errors: []
        };

        let offset = 0;
        const limit = 25;
        
        while (true) {
            const response = await databases.listDocuments(
                config.databaseId,
                config.htmlCollectionId,
                [Query.limit(limit), Query.offset(offset)]
            );

            if (!response.documents || response.documents.length === 0) break;
            
            results.total += response.documents.length;

            for (const doc of response.documents) {
                try {
                    // Handle potential array values in episodeOrder
                    let episodeOrder = doc.episodeOrder;
                    if (Array.isArray(episodeOrder)) {
                        episodeOrder = episodeOrder[0]; // Take first value if it's an array
                    }
                    episodeOrder = parseFloat(episodeOrder);
                    if (isNaN(episodeOrder)) {
                        episodeOrder = 1; // Default value
                    }

                    const updateData = {
                        categoryOrder: typeof doc.category === 'string' ? (CATEGORY_ORDER[doc.category] ?? 99) : 99,
                        bookOrder: typeof doc.book === 'string' ? (BOOK_ORDER[doc.book] ?? 99) : 99,
                        episodeOrder: episodeOrder
                    };

                    // Log the update attempt
                    console.log(`Updating document ${doc.$id}:`, {
                        original: {
                            category: doc.category,
                            book: doc.book,
                            episodeOrder: doc.episodeOrder
                        },
                        update: updateData
                    });

                    await databases.updateDocument(
                        config.databaseId,
                        config.htmlCollectionId,
                        doc.$id,
                        updateData
                    );
                    results.updated++;
                } catch (error) {
                    results.failed++;
                    results.errors.push({ 
                        id: doc.$id, 
                        error: error.message,
                        originalData: {
                            category: doc.category,
                            book: doc.book,
                            episodeOrder: doc.episodeOrder
                        }
                    });
                    console.error(`Failed to update document ${doc.$id}:`, error);
                }
            }

            offset += response.documents.length;
            if (response.documents.length < limit) break;
        }

        console.log('Update results:', results);
        return results;
    } catch (error) {
        console.error("Error in updateAllDocumentsOrder:", error);
        throw error;
    }
}
// Add these utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry(operation, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    let delayTime = initialDelay;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (error.message?.includes('Rate limit')) {
                console.log(`Rate limit hit, waiting ${delayTime}ms before retry ${i + 1}/${maxRetries}`);
                await delay(delayTime);
                delayTime *= 2; // Exponential backoff
                continue;
            }
            throw error; // If it's not a rate limit error, throw immediately
        }
    }
    throw lastError;
}

export async function safeReuploadFile(doc, client) {
    if (!client) throw new Error("No client provided");
    
    try {
        const databases = new Databases(client);
        const storage = new Storage(client);

        // Get the original file with retry
        const file = await withRetry(() => 
            storage.getFile(config.storageId, doc.fileId)
        );
        if (!file) throw new Error("Original file not found");

        // Extract userId from users array if it exists
        let userId = null;
        if (Array.isArray(doc.users) && doc.users.length > 0) {
            userId = doc.users[0];
        } else if (typeof doc.users === 'string') {
            userId = doc.users;
        }

        const newDoc = {
            category: doc.category,
            book: doc.book,
            episode: doc.episode,
            users: userId,
            fileName: doc.fileName,
            uploaded_at: doc.uploaded_at,
            fileId: doc.fileId,
            categoryOrder: CATEGORY_ORDER[doc.category] || 99,
            bookOrder: BOOK_ORDER[doc.book] || 99,
            episodeOrder: parseFloat(doc.episodeOrder) || 1
        };

        // Create new document with retry
        await withRetry(() =>
            databases.createDocument(
                config.databaseId,
                config.htmlCollectionId,
                ID.unique(),
                newDoc
            )
        );

        // Add delay before delete to avoid rate limits
        await delay(500);

        // Delete old document with retry
        await withRetry(() =>
            databases.deleteDocument(
                config.databaseId,
                config.htmlCollectionId,
                doc.$id
            )
        );

        return true;
    } catch (error) {
        console.error(`Error re-uploading file ${doc.$id}:`, error);
        return false;
    }
}

export async function reuploadAllProblematicFiles(client) {
    if (!client) throw new Error("No client provided");
    
    try {
        const databases = new Databases(client);
        const results = {
            total: 0,
            updated: 0,
            failed: 0,
            errors: []
        };

        let offset = 0;
        const limit = 10; // Reduced batch size

        while (true) {
            const response = await withRetry(() =>
                databases.listDocuments(
                    config.databaseId,
                    config.htmlCollectionId,
                    [Query.limit(limit), Query.offset(offset)]
                )
            );

            if (!response.documents || response.documents.length === 0) break;
            
            results.total += response.documents.length;

            // Process documents with delay between each
            for (const doc of response.documents) {
                try {
                    const success = await safeReuploadFile(doc, client);
                    if (success) {
                        results.updated++;
                    } else {
                        results.failed++;
                    }
                    // Add delay between processing each file
                    await delay(1000);
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        id: doc.$id,
                        error: error.message
                    });
                }
            }

            offset += response.documents.length;
            if (response.documents.length < limit) break;
        }

        return results;
    } catch (error) {
        console.error("Error in reuploadAllProblematicFiles:", error);
        throw error;
    }
}