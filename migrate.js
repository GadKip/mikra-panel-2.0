const fs = require('fs');
const csv = require('csv-parser');
const { Client, Storage } = require('node-appwrite');
const admin = require('firebase-admin');

// 1. הגדרות Firebase
const serviceAccount = require("./serviceAccountKey.json");
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

// 2. הגדרות Appwrite
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('674f0083002c2e7b3f65')
    .setKey('standard_f465f71c27d2f4d2ff0a6d2e0891fa00f134847326a744748affaf6f43b7775d676728c3e7050e50ea6823d858099ade19a2137debb385d34c6e35b96ccd3fe3f527e438f83ac0499181ae37f5bcc1a5a5a3f3459a63883eb2800d3d7e6a0e907c8b04d79cf47dd9d8fe79736a7fe0da1ed2b649cdc0555bbadd9288adaf422d');

const storage = new Storage(client);
const BUCKET_ID = '674f11d1000ef0855b2c'; 

async function runMigration() {
    const results = [];
    console.log("קורא את קובץ ה-CSV (UTF-8)...");

    // קריאה ישירה של הקובץ - הפעם בלי תיקוני קידוד מורכבים
    fs.createReadStream('data.csv')
        .pipe(csv({ separator: '\t' })) 
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log(`נמצאו ${results.length} שורות.`);

for (const row of results) {
                const fileId = row['fileId'];
                
                // לוגיקה חכמה לשם הפרק:
                // לוקח את הפרק, אם ריק לוקח את הספר, אם ריק לוקח קטגוריה
                let title = row['episode'] || row['book'] || row['category'];
                
                title = title.trim();

                if (!fileId) {
                    console.log(`מדלג על שורה - חסר fileId עבור: ${title}`);
                    continue;
                }

                try {
                    console.log(`מעבד: [${row['category'] || 'ללא קטגוריה'}] -> ${row['book'] || ''} -> ${title}`);

                    // הורדת הקובץ מ-Appwrite
                    const fileBuffer = await storage.getFileDownload(BUCKET_ID, fileId);
                    const contentJson = JSON.parse(fileBuffer.toString());

                    // העלאה ל-Firebase
                    await db.collection('episodes').add({
                        title: title,
                        book: row['book'] || "",
                        category: row['category'] || "",
                        bookOrder: parseInt(row['bookOrder']) || 0,
                        categoryOrder: parseInt(row['categoryOrder']) || 0,
                        episodeOrder: parseInt(row['episodeOrder']) || 0,
                        content: contentJson,
                        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                        userId: "MIGRATED_USER"
                    });

                    console.log(`✅ הועלה בהצלחה: ${title}`);
                } catch (error) {
                    console.error(`❌ שגיאה בפרק ${title}:`, error.message);
                }
            }
            console.log("--- המרת הנתונים הסתיימה! ---");
        });
}

runMigration();