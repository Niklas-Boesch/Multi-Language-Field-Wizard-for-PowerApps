chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed or reloaded.");
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "getSelectedLanguages") {
      // Retrieve data from chrome.storage.sync
      chrome.storage.sync.get("selectedLanguages", (data) => {
        sendResponse({ selectedLanguages: data.selectedLanguages });
      });
      // Keep the response open for asynchronous response
      return true;
    };
    if (request.action == "addEventListener") {
      // Retrieve data from chrome.storage.sync
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        files: ["eventListener.js"]
      });
      return false;
    };


    if (request.action == "saveToInputStorage") {
      // Insert the interceptRequest.js script into the active tab
      function storeStuff(store) {window.nbcInputStorage = store}

      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: storeStuff,
        args: [request.inputs],
        world: "MAIN"
      });
    };

    if (request.action == "addInterceptRequest") {
      // Insert the interceptRequest.js script into the active tab

      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: interceptAndModifyXHR,
        world: "MAIN"
      });
      return false;  // Keep the response open for asynchronous response
    };

    if (request.action == "resetXHR") {
      // Reset XHR on demand

      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: resetXHR,
        world: "MAIN"
      });
      return false;  // Keep the response open for asynchronous response
    };
  });



  // Listen for history state updates (e.g., SPA navigation)
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  // Filter URLs that match your desired pattern
  if (details.url.match(/\/environments\/[a-f0-9-]+\/(solutions\/[a-f0-9-]+\/)?entities\/[a-f0-9-]+\/fields$/)) {

      // Inject content.js into the matching tab
      chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          files: ["eventListener.js"]
      });
  }
});

function resetXHR() {
        if (window._oldOpen && window._oldSend) {
        XMLHttpRequest.prototype.open = window._oldOpen;
        XMLHttpRequest.prototype.send = window._oldSend;
        window._oldOpen = null;
        window._oldSend = null;
        jsonBody = null;
        originalLanguageCode = null;
        newLabelsArray = null;
        window._switcher = null;
        };
        
}

function interceptAndModifyXHR() {
  // Save a reference to the native methods
  window._oldOpen = window._oldOpen ?? XMLHttpRequest.prototype.open;
  window._oldSend = window._oldSend ?? XMLHttpRequest.prototype.send;
  window._switcher = false;

  // Overwrite open to capture the method and URL
  XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
      this._method = method; // Store the HTTP method
      this._url = url; // Store the URL
      window._oldOpen.call(this, method, url, async, user, pass);
  };

  // Overwrite send to modify the request body
  XMLHttpRequest.prototype.send = function(body) {
      // Check if the request matches the specific conditions
      if (
          this._method === "POST" &&
          this._url.match(/^https:\/\/[a-z0-9\-]+\.crm[0-9]*\.dynamics\.com\/api\/data\/v9\.0\/EntityDefinitions\([a-f0-9\-]+\)\/Attributes$/)
      ) {
          try {
              // Parse the request body to JSON
              window._switcher = true;
              let jsonBody = JSON.parse(body);

              // Ensure the LocalizedLabels array exists
              if (jsonBody.DisplayName && Array.isArray(jsonBody.DisplayName.LocalizedLabels)) {
                  // Get the language code from the original request body
                  let originalLanguageCode = jsonBody.DisplayName.LocalizedLabels[0]?.LanguageCode;

                  // Get the array from window.nbcInputStorage
                  let newLabelsArray = window.nbcInputStorage;

                  // Check if the array exists and is not empty
                  if (Array.isArray(newLabelsArray) && newLabelsArray.length > 0) {
                      // Filter the array to remove objects with the same LanguageCode as the original request
                      let filteredNewLabels = newLabelsArray.filter(newLabel => newLabel.LanguageCode !== originalLanguageCode);

                      // Add the filtered labels to the LocalizedLabels array
                      jsonBody.DisplayName.LocalizedLabels.push(...filteredNewLabels);

                      // Convert the modified JSON back to a string
                      body = JSON.stringify(jsonBody);
                  } else {
                      console.warn("No valid objects found in window.nbcInputStorage.");
                  }
              } else {
                  console.warn("LocalizedLabels array not found in the request body.");
              }
          } catch (error) {
              console.error("Failed to parse or modify the request body:", error);
          }
      }

      // Call the original send method with the modified (or unmodified) body
      window._oldSend.call(this, body);
      if(window._switcher) {
        XMLHttpRequest.prototype.open = window._oldOpen;
        XMLHttpRequest.prototype.send = window._oldSend;
        window._oldOpen = null;
        window._oldSend = null;
        jsonBody = null;
        originalLanguageCode = null;
        newLabelsArray = null;
        window._switcher = null;
      }
  };
}
