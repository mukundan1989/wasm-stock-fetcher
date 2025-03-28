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

// Fetch stock data from Yahoo Finance
async function fetchStockData(ticker, days) {
    try {
        // Call the Go function to get the parameters
        const params = goFetchStockData(ticker, days);
        
        // Convert to JavaScript object
        const { startDate, endDate } = params;
        
        // Use a CORS proxy to avoid issues
        const proxyUrl = "https://cors-anywhere.herokuapp.com/";
        const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/download/${ticker}?period1=${Math.floor(new Date(startDate).getTime() / 1000)}&period2=${Math.floor(new Date(endDate).getTime() / 1000)}&interval=1d&events=history`;
        
        const response = await fetch(proxyUrl + yahooUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const csvData = await response.text();
        const rows = csvData.split("\n").slice(1); // Remove header
        
        const stockData = rows.map(row => {
            const [date, open, high, low, close, adjClose, volume] = row.split(",");
            return { date, open, close, ticker };
        }).filter(Boolean);
        
        return stockData;
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return null;
    }
}

// Store data in IndexedDB
async function storeStockData(data) {
    try {
        const db = await initDB;
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        
        // Clear existing data for this ticker
        const clearRequest = store.openCursor();
        clearRequest.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.ticker === data[0].ticker) {
                    store.delete(cursor.primaryKey);
                }
                cursor.continue();
            }
        };
        
        // Add new data
        data.forEach(item => {
            store.put(item);
        });
        
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve(true);
            tx.onerror = (event) => {
                console.error("Transaction error:", event.target.error);
                resolve(false);
            };
        });
    } catch (error) {
        console.error("Error storing data:", error);
        return false;
    }
}

// Display data from IndexedDB
async function displayStoredData(ticker) {
    try {
        const db = await initDB;
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const index = store.index("ticker");
        const request = index.getAll(ticker);
        
        return new Promise((resolve) => {
            request.onsuccess = (event) => {
                const data = event.target.result;
                displayData(data);
                resolve(data);
            };
            
            request.onerror = (event) => {
                console.error("Error fetching data:", event.target.error);
                resolve(null);
            };
        });
    } catch (error) {
        console.error("Error displaying data:", error);
        return null;
    }
}

// Display data in the UI
function displayData(data) {
    const container = document.getElementById("stockData");
    
    if (!data || data.length === 0) {
        container.innerHTML = "<p>No data available</p>";
        return;
    }
    
    const ticker = data[0].ticker;
    let html = `<h2>${ticker} Stock Data</h2>`;
    html += `<table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Open</th>
                <th>Close</th>
            </tr>
        </thead>
        <tbody>`;
    
    data.forEach(item => {
        html += `<tr>
            <td>${item.date}</td>
            <td>${item.open}</td>
            <td>${item.close}</td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("fetchBtn").addEventListener("click", async () => {
        const ticker = document.getElementById("ticker").value.toUpperCase();
        const days = parseInt(document.getElementById("days").value);
        
        const data = await fetchStockData(ticker, days);
        if (data) {
            const stored = await storeStockData(data);
            if (stored) {
                displayData(data);
            }
        }
    });
    
    document.getElementById("viewDbBtn").addEventListener("click", async () => {
        const ticker = document.getElementById("ticker").value.toUpperCase();
        await displayStoredData(ticker);
    });
});
