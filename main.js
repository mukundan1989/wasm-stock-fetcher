document.addEventListener("DOMContentLoaded", () => {
    const fetchBtn = document.getElementById("fetchBtn");
    if (fetchBtn) {
        fetchBtn.addEventListener("click", () => {
            if (window.stockData) {
                const processedData = window.stockData.map(item => ({
                    date: item.Date,
                    open: item.Open,
                    close: item.Close,
                    ticker: window.ticker
                }));
                displayData(processedData);
                console.log("Using Python-fetched data");
            } else {
                console.error("No data found. Did you click 'Fetch Data'?");
            }
        });
    }
});
