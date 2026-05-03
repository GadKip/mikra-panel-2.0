import { db, auth } from '../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { convertDocxToJson } from './docxConverter';

const CATEGORY_ORDER = {
  'הקדמה והסכמות': 0,
  'תורה': 1,
  'נביאים': 2,
  'כתובים': 3,
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
  'דברי הימים': 7,
};

const VALID_CATEGORIES = ['הקדמה והסכמות', 'תורה', 'נביאים', 'כתובים'];

// Validate file type
function validateFile(file) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/html', // .html
  ];

  if (!validTypes.includes(file.type)) {
    throw new Error(
      'Invalid file type. Only DOCX and HTML files are allowed.'
    );
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    return {
      $id: currentUser.uid,
      email: currentUser.email,
      username: currentUser.displayName || currentUser.email,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Sign in a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - User object
 */
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return {
      $id: user.uid,
      email: user.email,
      username: user.displayName || user.email,
    };
  } catch (error) {
    console.error('Error in sign in:', error);
    throw new Error('Failed to sign in. Please check your credentials and try again.');
  }
}

/**
 * Create a new user account
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} username - Username
 * @returns {Promise<object>} - Created user object
 */
export async function createUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: username,
    });

    return {
      $id: user.uid,
      email: user.email,
      username: username,
    };
  } catch (error) {
    console.error('Error in createUser:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already in use.');
    }
    throw new Error(`Error creating user: ${error.message}`);
  }
}

// Get user session
export async function getUserSession() {
  try {
    return auth.currentUser;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}

// Sign out
export async function signOut() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Sign in with Google using popup
 * @returns {Promise<object>} - User object
 */
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    return {
      $id: user.uid,
      email: user.email,
      username: user.displayName || user.email,
    };
  } catch (error) {
    console.error('Error in Google sign in:', error);
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign in was cancelled.');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign in popup was blocked. Please check your browser settings.');
    }
    throw new Error('Failed to sign in with Google. Please try again.');
  }
}

// Get max episode order for a book
async function getMaxEpisodeOrder(book) {
  if (!book) return 0;

  try {
    const episodesRef = collection(db, 'episodes');
    const q = query(
      episodesRef,
      where('book', '==', book),
      orderBy('episodeOrder', 'desc')
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const maxDoc = querySnapshot.docs[0];
      const currentOrder = parseFloat(maxDoc.data().episodeOrder);
      return currentOrder + 1;
    }

    return 1; // First episode in the book
  } catch (error) {
    console.error('Error getting max episode order:', error);
    return 1;
  }
}

/**
 * Upload a DOCX file and save as JSON to Firestore
 * @param {string} category - Category of the episode
 * @param {string} book - Book name
 * @param {string} episode - Episode name
 * @param {object} file - File object with uri, type, and fileBlob
 * @param {string} userId - User ID (optional, will use auth.currentUser.uid if not provided)
 * @returns {Promise<object>} - The created Firestore document with ID
 */
export async function upload(category, book, episode, file, userId) {
  // Validate inputs
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error('Invalid category');
  }
  if (!category || !book || !episode) throw new Error('Missing required fields');
  if (!file) throw new Error('No file provided');

  try {
    // Get user ID from Firebase Auth - if not provided as parameter
    let currentUserId = userId;
    
    if (!currentUserId) {
      // Check if auth.currentUser exists
      if (!auth.currentUser) {
        // Wait for 1 second to allow auth to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check again after waiting
        if (!auth.currentUser) {
          throw new Error('Connecting to auth... Please try again.');
        }
      }
      currentUserId = auth.currentUser.uid;
    }

    if (!currentUserId) throw new Error('No user in context');

    validateFile(file);

    // Convert DOCX to JSON if it's a Word document
    let jsonContent;

    if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      jsonContent = await convertDocxToJson(file.fileBlob);
    } else {
      // For HTML files, create a simple content structure
      jsonContent = {
        content: [
          {
            type: 'text',
            data: {
              text: 'HTML content imported',
              style: null,
            },
          },
        ],
      };
    }

    // Get max order for this book
    const episodeOrder = await getMaxEpisodeOrder(book);

    // Create document data
    const docData = {
      category,
      book,
      episode,
      content: jsonContent, // Save the entire JSON object
      episodeOrder,
      userId: currentUserId, // Store user reference using Firebase Auth UID
      categoryOrder: CATEGORY_ORDER[category] || 99,
      bookOrder: BOOK_ORDER[book] || 99,
      createdAt: serverTimestamp(), // Firestore server timestamp
    };

    // Save to Firestore 'episodes' collection
    const episodesRef = collection(db, 'episodes');
    const docRef = await addDoc(episodesRef, docData);

    // Return the created document with its ID
    return {
      $id: docRef.id,
      ...docData,
    };
  } catch (error) {
    console.error('Error in upload:', error);
    throw new Error(`Error uploading file: ${error.message}`);
  }
}

/**
 * List all episodes grouped by category and book
 * @returns {Promise<object>} - Grouped episodes
 */
export async function listFiles() {
  try {
    const episodesRef = collection(db, 'episodes');
    const q = query(
      episodesRef,
      orderBy('categoryOrder', 'asc'),
      orderBy('bookOrder', 'asc'),
      orderBy('episodeOrder', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const allDocuments = [];

    querySnapshot.forEach((doc) => {
      allDocuments.push({
        $id: doc.id,
        ...doc.data(),
      });
    });

    // Group files by category and book
    const groupedFiles = allDocuments.reduce((acc, file) => {
      const category = file.category || 'uncategorized';
      const book = file.book || 'unknown';

      if (!acc[category]) {
        acc[category] = {};
      }
      if (!acc[category][book]) {
        acc[category][book] = [];
      }

      acc[category][book] = [...acc[category][book], file];

      return acc;
    }, {});

    return groupedFiles;
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error(`Could not fetch files: ${error.message}`);
  }
}

/**
 * Delete an episode from Firestore
 * @param {string} docId - Document ID
 */
export async function deleteFile(docId) {
  try {
    const docRef = doc(db, 'episodes', docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Could not delete file');
  }
}

/**
 * Reorder multiple episodes using a batch write
 * Automatically re-indexes episodes based on their position in the array (index + 1)
 * @param {Array} episodes - Array of episode objects with $id
 * @returns {Promise<boolean>}
 */
export async function reorderEpisodes(episodes) {
  try {
    const batch = writeBatch(db);
    
    episodes.forEach((episode, index) => {
      const docRef = doc(db, 'episodes', episode.$id);
      // Re-index based on position: 1, 2, 3, etc.
      batch.update(docRef, {
        episodeOrder: index + 1,
      });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error reordering episodes:', error);
    throw error;
  }
}

/**
 * Reorder an episode (Legacy - use reorderEpisodes instead)
 * @deprecated Use reorderEpisodes instead
 * @param {string} docId - Document ID
 * @param {number} newOrder - New episode order
 */
export async function reorderEpisode(docId, newOrder) {
  try {
    const docRef = doc(db, 'episodes', docId);
    await updateDoc(docRef, {
      episodeOrder: newOrder,
    });
    return true;
  } catch (error) {
    console.error('Error reordering:', error);
    throw error;
  }
}

/**
 * Update an episode document
 * @param {string} docId - Document ID
 * @param {object} updateData - Data to update
 */
export async function updateFile(docId, updateData) {
  try {
    const { category, book, episode, episodeOrder } = updateData;

    const updatePayload = {
      category: category || null,
      book: book || null,
      episode: episode || null,
      categoryOrder: CATEGORY_ORDER[category] || 99,
      bookOrder: BOOK_ORDER[book] || 99,
    };

    if (episodeOrder !== undefined) {
      updatePayload.episodeOrder = parseFloat(episodeOrder);
    }

    const docRef = doc(db, 'episodes', docId);
    await updateDoc(docRef, updatePayload);

    return true;
  } catch (error) {
    console.error('Error updating file:', error);
    throw new Error('Could not update file');
  }
}

/**
 * Delete multiple episodes
 * @param {array} files - Array of files to delete
 */
export async function deleteMultipleFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('No files provided for deletion');
  }

  try {
    const batch = writeBatch(db);

    files.forEach((file) => {
      const docRef = doc(db, 'episodes', file.$id);
      batch.delete(docRef);
    });

    await batch.commit();
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Get an episode by ID
 * @param {string} docId - Document ID
 */
export async function getFileById(docId) {
  try {
    const docRef = doc(db, 'episodes', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        $id: docSnap.id,
        ...docSnap.data(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting file:', error);
    throw error;
  }
}

// Utility for backward compatibility with Appwrite-based auth context
export const client = null; // Firebase doesn't use a client object like Appwrite
export const config = {
  databaseId: 'episodes', // Using 'episodes' collection
};

/**
 * Update all documents' order fields
 * This is useful for maintaining proper sorting
 */
export async function updateAllDocumentsOrder() {
  try {
    const episodesRef = collection(db, 'episodes');
    const q = query(episodesRef);
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    let updated = 0;

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const docRef = doc(db, 'episodes', docSnapshot.id);

      batch.update(docRef, {
        categoryOrder: CATEGORY_ORDER[data.category] || 99,
        bookOrder: BOOK_ORDER[data.book] || 99,
      });
      updated++;
    });

    await batch.commit();

    return {
      total: querySnapshot.size,
      updated,
      failed: 0,
      errors: [],
    };
  } catch (error) {
    console.error('Error in updateAllDocumentsOrder:', error);
    throw error;
  }
}

/**
 * Reupload all problematic files
 * This is a stub function for compatibility - in Firestore, we don't need to reupload
 */
export async function reuploadAllProblematicFiles() {
  try {
    // In Firestore, all data is stored directly, so we just validate existing documents
    const result = await updateAllDocumentsOrder();
    return result;
  } catch (error) {
    console.error('Error in reuploadAllProblematicFiles:', error);
    throw error;
  }
}
