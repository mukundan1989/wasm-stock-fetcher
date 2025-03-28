// Initialize IndexedDB
let db;
const dbName = "StockDB";
const storeName = "StockPrices";

const initDB = new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    
    request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject("IndexedDB error");
    };
    
    request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: ["ticker", "date"] });
        }
    };
});

// Fetch stock data (with working CORS proxy)
async function fetchStockData(ticker, days) {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        // Updated CORS proxy (choose one):
        const proxyUrl = "https://api.allorigins.win/raw?url=";
        // const proxyUrl = "https://corsproxy.io/?";
        
        const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/download/${ticker}?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d&events=history`;
        
        console.log("Fetching:", proxyUrl + yahooUrl);  // Debug URL
        
        const response = await fetch(proxyUrl + yahooUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const csvData = await response.text();
        console.log("Raw CSV:", csvData.slice(0, 100));  // Debug first 100 chars
        
        const rows = csvData.split("\n").slice(1);
        return rows.map(row => {
            const [date, open, high, low, close] = row.split(",");
            return { date, open, close, ticker };
        }).filter(item => item.date);  // Filter out empty rows
        
    } catch (error) {
        console.error("Fetch failed:", error);
        return null;
    }
}

// Rest of your JS code (no changes needed below)
// ...
