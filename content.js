// Define the regex pattern for the URL
const urlRegex = /^https:\/\/make(\.preview)?\.powerapps\.com\/environments\/[a-f0-9\-]+\/(solutions\/[a-f0-9\-]+\/)?entities\/[a-f0-9\-]+\/fields(\?.*)?$/;


// Check if the current URL matches
if (urlRegex.test(window.location.href)) {

    // Wait for the page to fully load
    window.onload = () => {

        // Start observing for the button
        (async () => {
            const response = await chrome.runtime.sendMessage({action: "addEventListener"});
            
          })();
    };
} else {
    console.log("This log should not appear.");
}

