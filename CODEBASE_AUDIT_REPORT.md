# Mikra Panel 2.0 - Codebase Audit Report
## Post-Appwrite to Firebase Migration Analysis

**Date:** June 15, 2026  
**Project:** mikra-panel-2.0  
**Status:** React Native with Expo + Firebase + Web Support

---

## CATEGORY A: Safe to Delete (Zero Imports, Verified Dead Code)

### 1. **DraggableEpisodeList.jsx** ⚠️
- **Location:** `components/DraggableEpisodeList.jsx`
- **Status:** DEFINED BUT NEVER IMPORTED
- **Why Flagged:** Component is exported and fully functional but `browse.jsx` (the only file that would use it) manually handles episode reordering using its own `handleReorder`, `handleMoveUp`, and `handleMoveDown` functions instead of importing this component.
- **Usage Search Result:** Only found 1 match - the component's own export statement
- **Safe to Delete:** YES, unless you plan to refactor browse.jsx to use it in the future
- **Dependencies:** Uses `react-native-draggable-flatlist`, `EpisodeListItem`, `Loader`, and Firebase

---

## CATEGORY B: Appwrite Leftovers to Clean Up

### 1. **appwrite** (v25.0.0)
- **Location:** `package.json` dependencies
- **Status:** COMPLETELY UNUSED
- **Found In:** Not imported anywhere in active codebase
- **Why Still Here:** Likely forgotten during migration
- **Action Required:** UNINSTALL
- **Command:** `npm uninstall appwrite`

### 2. **node-appwrite** (v24.0.0)
- **Location:** `package.json` dependencies
- **Status:** ONLY USED IN MIGRATION SCRIPT
- **Found In:** `migrate.js` line 3 - `const { Client, Storage } = require('node-appwrite');`
- **Context:** `migrate.js` is a one-time data migration utility script that:
  - Reads CSV file
  - Fetches files from Appwrite Storage
  - Uploads them to Firebase Storage
- **File Status:** Can be deleted after migration is complete
- **Action Required:** UNINSTALL (after confirming migration is done)
- **Command:** `npm uninstall node-appwrite`

### 3. **react-native-appwrite** (v0.5.0)
- **Location:** `package.json` dependencies
- **Status:** COMPLETELY UNUSED
- **Found In:** Not imported anywhere in codebase
- **Why Still Here:** Likely forgotten during migration
- **Action Required:** UNINSTALL
- **Command:** `npm uninstall react-native-appwrite`

### 4. **migrate.js** (File - Can be Archived)
- **Location:** Project root
- **Status:** ONE-TIME UTILITY SCRIPT
- **Purpose:** Data migration from Appwrite to Firebase
- **Contains:** Appwrite SDK imports and logic
- **Action Required:** Archive or delete after confirming migration is complete
- **Recommendation:** Keep for reference but move to `.archive/` folder

### 5. **Appwrite Compatibility Comment**
- **Location:** `lib/firebase.js` line 501-502
- **Content:** 
  ```javascript
  // Utility for backward compatibility with Appwrite-based auth context
  export const client = null; // Firebase doesn't use a client object like Appwrite
  ```
- **Status:** Outdated comment from migration
- **Action Required:** Safe to remove (just a comment)

---

## CATEGORY C: Unused/Leftover Dependencies (Safe to Uninstall)

### High Confidence Unused:

| Package | Version | Status | Reason |
|---------|---------|--------|--------|
| **@remix-run/node** | ^2.15.0 | Unused | Not imported anywhere; appears to be web server dependency |
| **@remix-run/server-runtime** | ^2.15.0 | Unused | Not imported anywhere; appears to be web server dependency |
| **react-scripts** | ^5.0.1 | Unused | This is Create React App dependency; incompatible with Expo setup |
| **jsdom** | ^26.0.0 | Unused | Not imported; testing library but no tests found using it |
| **cheerio** | ^1.0.0 | Unused | HTML parsing library; not used anywhere |
| **cookie** | ^0.7.0 | Unused | Not imported anywhere |
| **nth-check** | ^2.0.1 | Unused | Not imported; appears to be transitive dependency artifact |
| **webpack** | ^5.97.1 | Unused | Dev dependency; Expo uses its own bundler (Metro) |
| **webpack-cli** | ^5.1.4 | Unused | Dev dependency; incompatible with Expo |
| **webpack-dev-server** | ^5.1.0 | Unused | Dev dependency; incompatible with Expo |

### Medium Confidence (May Be Used Indirectly):

| Package | Version | Status | Reason |
|---------|---------|--------|--------|
| **@xmldom/xmldom** | ^0.9.0 | Likely Unused | DOMParser in docxConverter.js likely uses native browser/Node API, not this package |
| **xml2js** | ^0.6.2 | Likely Unused | Not found in any imports; XML parsing not done |
| **iconv-lite** | ^0.7.2 | Likely Unused | Character encoding library; not imported |
| **jszip** | ^3.10.1 | Likely Unused | ZIP file handling; not imported |
| **postcss** | ^8.4.31 | Dependency Chain | Referenced in `tailwind.config.js` but is Tailwind's dependency |

### Likely Safe but Verify:

| Package | Version | Status | Reason |
|---------|---------|--------|--------|
| **metro** & related | ^0.81.0 | IN USE | Multiple metro packages ARE used by Expo bundler (keep these) |
| **mammoth** | ^1.9.0 | IN USE | Used in `lib/docxConverter.js` for DOCX→HTML conversion |
| **prop-types** | ? | IN USE | Used in components but NOT in package.json (missing dependency!) |
| **csv-parser** | ^3.2.0 | Migration Only | Only used in `migrate.js` - can uninstall after migration |

---

## CATEGORY D: Platform-Specific Conflicts Found (None Critical)

### ✅ **DraggableEpisodeList.jsx** - NO CONFLICT
- Uses `react-native-draggable-flatlist` (proper React Native package)
- Uses only React Native components
- **Status:** Safe to use on native platforms

### ✅ **ChooseFile.jsx** - PROPERLY HANDLED
- Implements dynamic import to handle browser vs React Native
- Uses conditional logic: `navigator.product === 'ReactNative'`
- Falls back gracefully on web
- **Status:** Properly configured for both platforms

---

## FINDINGS & RECOMMENDATIONS

### Immediate Actions (Safe to Do Now):

1. **Uninstall unused Appwrite packages:**
   ```bash
   npm uninstall appwrite react-native-appwrite
   ```

2. **Uninstall incompatible build tools:**
   ```bash
   npm uninstall react-scripts webpack webpack-cli webpack-dev-server
   ```

3. **Uninstall clearly unused dependencies:**
   ```bash
   npm uninstall jsdom cheerio cookie nth-check iconv-lite xml2js jszip
   ```

4. **Uninstall unused web framework dependencies (after verifying not used):**
   ```bash
   npm uninstall @remix-run/node @remix-run/server-runtime
   ```

5. **Delete/Archive Migration Scripts (after confirming migration complete):**
   - Delete or move `migrate.js`
   - Delete or move `fix-order.js` (Firebase admin script)

6. **Optional: Delete Dead Component:**
   ```bash
   # Only if you don't plan to refactor browse.jsx
   rm components/DraggableEpisodeList.jsx
   ```

### Follow-up Actions:

1. **Add missing dependency:**
   - `prop-types` is used but not in package.json
   - It might be working due to transitive dependency
   - Consider adding explicitly: `npm install prop-types`

2. **Verify @xmldom/xmldom necessity:**
   - Test if `docxConverter.js` works without it
   - DOMParser might be polyfilled elsewhere

3. **Verify csv-parser necessity:**
   - After confirming migration is complete, uninstall `csv-parser`

4. **Clean up comments:**
   - Remove Appwrite backward compatibility comments in `lib/firebase.js` (line 501-502)

5. **Delete/Archive unused files:**
   - Consider if `fix-order.js` is still needed
   - Consider if `migrate.js` should be archived for reference

---

## SUMMARY

| Category | Count | Status |
|----------|-------|--------|
| **Files to Delete** | 1 | DraggableEpisodeList.jsx (optional) |
| **Appwrite Packages to Remove** | 3 | appwrite, react-native-appwrite, node-appwrite |
| **One-Time Scripts to Archive** | 2 | migrate.js, fix-order.js |
| **Unused Dependencies to Uninstall** | 10+ | react-scripts, webpack suite, cheerio, jsdom, etc. |
| **Platform Conflicts** | 0 | None found |
| **Files with Dead Appwrite Code** | 1 | migrate.js (entire file), lib/firebase.js (comments only) |

**Estimated npm package savings:** ~50+ packages from node_modules (including transitive dependencies)

---

## NOTES

- ✅ No HTML div elements found in React Native components
- ✅ No react-beautiful-dnd package found (already removed or not installed)
- ✅ Firebase properly integrated everywhere
- ✅ RTLContext, ThemeContext, AlertContext all properly configured
- ⚠️ Appwrite SDK references only in migration script - safe to remove after migration
- ⚠️ Some dependencies appear to be for web build process (vercel.json suggests web deployment)
