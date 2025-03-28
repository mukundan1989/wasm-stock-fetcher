package main

import (
	"encoding/json"
	"syscall/js"
	"time"
)

func fetchStockData(this js.Value, args []js.Value) interface{} {
	// The actual HTTP request will be done in JavaScript due to CORS restrictions
	// This function just formats the request and processes the response
	ticker := args[0].String()
	days := args[1].Int()
	
	// Calculate date range
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)
	
	// Return the parameters for the JavaScript fetch
	params := map[string]interface{}{
		"ticker":    ticker,
		"startDate": startDate.Format("2006-01-02"),
		"endDate":   endDate.Format("2006-01-02"),
	}
	
	return js.ValueOf(params)
}

func storeInIndexedDB(this js.Value, args []js.Value) interface{} {
	// This is just a stub - the actual IndexedDB operations will be done in JavaScript
	data := args[0].String()
	ticker := args[1].String()
	
	// Return success
	return js.ValueOf(true)
}

func main() {
	c := make(chan struct{}, 0)
	
	// Expose Go functions to JavaScript
	js.Global().Set("goFetchStockData", js.FuncOf(fetchStockData))
	js.Global().Set("goStoreInIndexedDB", js.FuncOf(storeInIndexedDB))
	
	<-c
}
