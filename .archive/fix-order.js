const admin = require('firebase-admin');

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixOrder() {
  console.log("🚀 מתחיל לעשות סדר בפרקים...");
  
  const episodesRef = db.collection('episodes');
  const snapshot = await episodesRef.get();
  
  if (snapshot.empty) {
    console.log("לא נמצאו פרקים.");
    return;
  }

  // 1. נאסוף את כל הפרקים למערך
  let allEpisodes = [];
  snapshot.forEach(doc => {
    allEpisodes.push({ id: doc.id, ...doc.data() });
  });

  // 2. נקבץ אותם לפי קטגוריה וספר
  // המטרה: שכל ספר יתחיל מ-1 בתוך עצמו
  const groups = {};
  allEpisodes.forEach(ep => {
    const groupKey = `${ep.categoryOrder}_${ep.bookOrder}`;
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(ep);
  });

  const batch = db.batch();
  let count = 0;

  // 3. בכל קבוצה, נמיין לפי ה-Order הקיים וניתן מספרים חדשים
  for (const key in groups) {
    // מיון פנימי לפי מה שיש כרגע (גם אם זה מינוס 1400)
    groups[key].sort((a, b) => (a.episodeOrder || 0) - (b.episodeOrder || 0));

    groups[key].forEach((ep, index) => {
      const newOrder = index + 1; // 1, 2, 3...
      const docRef = episodesRef.doc(ep.id);
      
      batch.update(docRef, { episodeOrder: newOrder });
      console.log(`✅ פרק: ${ep.title} | ספר: ${ep.book} | סדר חדש: ${newOrder}`);
      count++;
    });
  }

  // 4. נבצע את השינוי
  await batch.commit();
  console.log(`\n✨ סיימנו! עודכנו ${count} פרקים עם סדר נקי.`);
  process.exit();
}

fixOrder().catch(err => {
  console.error("❌ שגיאה:", err);
  process.exit(1);
});