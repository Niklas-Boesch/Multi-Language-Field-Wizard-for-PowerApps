//#region initFields

initializeDynamicFields();
function initializeDynamicFields() {
    let inputs = [];
    /**
     * Function to create the input field and label for each selected language.
     */
    function createInputAndLabel(selectedLanguages) {

        chrome.runtime.sendMessage({ action: "saveToInputStorage", inputs: null});
        const labelElement = document.querySelector('label[for="ColumnForm_DisplayName"]');
        const targetDiv = labelElement ? labelElement.parentElement.parentElement.parentElement : null;
        inputs.length = 0;
        selectedLanguages.forEach(language => {
    
            if (targetDiv) {
                // Create the outer wrapper div
                const wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'nbc-StackItem';
    
                // Create the TextField container div
                const textFieldDiv = document.createElement('div');
                textFieldDiv.className = 'nbc-TextField';
    
                // Create the TextField wrapper
                const textFieldWrapper = document.createElement('div');
                textFieldWrapper.className = 'nbc-TextField-wrapper';
    
                // Create the label for the input field
                const label = document.createElement('label');
                label.htmlFor = `ColumnForm_${language.fieldlabel}`;
                label.id = `TextFieldLabel_${language.fieldlabel}`;
                label.className = 'nbc-Label';
                label.textContent = "Label " + language.fieldlabel;
    
                // Apply custom styles to the label
                label.style.cssText = `
                    font-family: "Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
                    -webkit-font-smoothing: antialiased;
                    font-size: 14px;
                    font-weight: 600;
                    color: rgb(50, 49, 48);
                    box-sizing: border-box;
                    box-shadow: none;
                    margin: 0px;
                    display: block;
                    padding: 5px 0px;
                    overflow-wrap: break-word;
                    line-height: 20px;
                `;
    
                // Create the field group div
                const fieldGroupDiv = document.createElement('div');
                fieldGroupDiv.className = 'nbc-TextField-fieldGroup';
                fieldGroupDiv.style.cssText = `
                    box-shadow: none;
                    max-width: 308px;
                    margin: 0px;
                    padding: 0px;
                    box-sizing: border-box;
                    border: 1px solid rgb(96, 94, 92);
                    border-radius: 2px;
                    background: rgb(255, 255, 255);
                    cursor: text;
                    height: 32px;
                    display: flex;
                    flex-direction: row;
                    align-items: stretch;
                    position: relative;
                `;
    
                // Create the input element
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `ColumnForm_${language.fieldlabel}`;
                input.setAttribute('languagecode', language.code);
                input.setAttribute('maxlength', '50');
                input.setAttribute('aria-labelledby', `TextFieldLabel_${language.fieldlabel}`);
                input.setAttribute('aria-label', language.fieldlabel);
                input.className = 'nbc-TextField-field';
                input.setAttribute('aria-invalid', 'false');
                input.style.cssText = `
                    -webkit-font-smoothing: antialiased;
                    font-size: 14px;
                    font-weight: 400;
                    box-shadow: none;
                    margin: 0px;
                    padding: 0px 8px;
                    box-sizing: border-box;
                    border-radius: 0px;
                    border: none;
                    background: none transparent;
                    color: rgb(50, 49, 48);
                    width: 100%;
                    min-width: 0px;
                    text-overflow: ellipsis;
                    outline: 0px;
                `;
    
                // Attach the input event listener to call saveInputsToStorage
                input.addEventListener('input', saveInputsToStorage);
                inputs.push(input);
    
                // Build the structure
                fieldGroupDiv.appendChild(input);
                textFieldWrapper.appendChild(label);
                textFieldWrapper.appendChild(fieldGroupDiv);
                textFieldDiv.appendChild(textFieldWrapper);
                wrapperDiv.appendChild(textFieldDiv);
    
                // Insert the new element after the target div
                targetDiv.insertAdjacentElement('afterend', wrapperDiv);
            } else {
                console.warn('No div found with the outerText "Display name".');
            }
        });

        observeOverlay();
        chrome.runtime.sendMessage({ action: "addInterceptRequest"});
    }
    

    function observeOverlay() {
        const targetNode = document.getElementById('root'); // Targeting the div with id="root"
    
        // Check if the node exists before proceeding
        if (!targetNode) {
            console.error('Target node with id "root" not found');
            return;
        }
    
        // Create a MutationObserver to observe attribute changes on the #root element
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Check if the mutation is related to the 'aria-hidden' attribute
                if (mutation.attributeName === 'aria-hidden') {
                    const ariaHidden = targetNode.getAttribute('aria-hidden');
                    
                    // If aria-hidden is removed (i.e., it's null or undefined), proceed
                    if (ariaHidden === null || ariaHidden === undefined) {
                        observer.disconnect(); // Stop observing
                        chrome.runtime.sendMessage({ action: "resetXHR" });
    
                        // Remove input event listeners
                        inputs.forEach(input => {
                            input.removeEventListener('input', saveInputsToStorage);
                        });
                    }
                }
            });
        });
    
        // Set up the observer for attribute changes
        observer.observe(targetNode, { attributes: true });
    }
    


    /**
     * Observes changes in the DOM to detect when the input field with ID 'ColumnForm_DisplayName' is added or modified.
     */
    function observeInputElement() {
        const observer = new MutationObserver((mutationsList, observer) => {
            mutationsList.forEach(mutation => {
                try {
                    if (mutation.type === 'attributes') {
                        const target = mutation.target;

                        if (target.id === 'ColumnForm_DisplayName') {

                            chrome.storage.sync.get('selectedLanguages', function(data) {
                                if (data.selectedLanguages) {
                                let selectedLanguages = data.selectedLanguages.map(item => JSON.parse(item));

                                if(selectedLanguages.length > 0) {
                                    createInputAndLabel(selectedLanguages);
                                }
                                }});

                            // Disconnect the observer after the first relevant change
                            observer.disconnect();
                        }
                    }
                } catch (error) {
                    console.error("Error in mutation observation:", error);
                }
            });
        });

        // Start observing the DOM
        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['id', 'class']
        });

    }

/**
 * Registers a listener for the button to initialize the observer when clicked.
 */
function registerButtonListener() {

    // Function to handle button creation and click event
    function handleButtonCreation(button) {

        // Add the event listener once the button is available
        button.addEventListener('click', () => {
            observeInputElement();
        });

        // Disconnect the observer after the button is found and event listener is added
        observer.disconnect();
    }

    // Observer callback function
    function observeDOM(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Look for the button in the added nodes
                const newButton = document.querySelector('button[data-test-key="NewFields"]');
                if (newButton) {
                    // Button found, add the click listener
                    handleButtonCreation(newButton);
                    break;
                }
            }
        }
    }

    // Create the observer instance
    const observer = new MutationObserver(observeDOM);

    // Start observing the DOM for changes
    observer.observe(document.body, {
        childList: true,  // Monitor direct children changes
        subtree: true     // Monitor all descendants
    });
}




    // Function to handle the button click event
    function saveInputsToStorage() {
      // Get all input elements with the specified class
      const inputs = document.querySelectorAll('.nbc-TextField-field');
  
      // Create an array to hold the JSON objects
      var jsonArray = [];
  
      // Loop through the inputs and create JSON objects
      jsonArray = Array.from(inputs)
        .filter(input => input.value !== '') // Skip empty inputs
        .map(input => ({
           "Label": input.value,
            "LanguageCode": Number(input.attributes.languagecode.value)
        }));
      chrome.runtime.sendMessage({ action: "saveToInputStorage", inputs: jsonArray});
  
    }

    // Start by registering the button listener

    registerButtonListener();
}
//#endregion