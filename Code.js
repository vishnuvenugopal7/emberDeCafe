function doGet() {
return HtmlService.createHtmlOutputFromFile('Index')
.setTitle('Ember de cafe - Digital Menu')
.addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getMenuData() {
// 1. CHECK HIGH-SPEED MEMORY CACHE FIRST
const cache = CacheService.getScriptCache();
const cachedData = cache.get("emberMenuData");
if (cachedData) {
// If data is in memory, return it instantly
return JSON.parse(cachedData);
}

// 2. IF NOT IN CACHE, READ FROM GOOGLE SHEETS
try {
const ss = SpreadsheetApp.getActiveSpreadsheet();
if (!ss) throw new Error("Spreadsheet context lost.");
const sheetsToRead = [
"Hot Drinks", "Cakes & Pastries", "Ice Cream Scoops",
"Cool Drinks", "Snacks", "Light Meal",
"Heavy Meal", "Edc Specials"
];
const menuData = {};
const allSheets = ss.getSheets(); // Fetch all sheets once

sheetsToRead.forEach(sheetName => {
const targetSheet = allSheets.find(s =>
s.getName().trim().toLowerCase() === sheetName.trim().toLowerCase()
);

if (targetSheet) {
const data = targetSheet.getDataRange().getValues();
const items = [];
for (let i = 1; i < data.length; i++) {
const row = data[i];
const name = row[1];
if (name && name.toString().trim() !== "") {
items.push({
sNo: (row[0] !== undefined && row[0] !== "") ? row[0] : "",
name: name.toString().trim(),
price: (row[2] !== undefined && row[2] !== "") ? row[2] : 0,
imgUrl: row[3] ? row[3].toString().trim() : ""
});
}
}
if (items.length > 0) menuData[sheetName] = items;
}
});

// 3. SAVE TO CACHE FOR 15 MINUTES (900 seconds)
cache.put("emberMenuData", JSON.stringify(menuData), 900);

return menuData;
} catch (e) {
throw new Error("Backend Error: " + e.message);
}
}

// RUN THIS FUNCTION MANUALLY ONLY IF YOU NEED TO FORCE UPDATE THE MENU INSTANTLY
function clearMenuCache() {
CacheService.getScriptCache().remove("emberMenuData");
}
