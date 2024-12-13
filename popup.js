let languageOptions = []; // Declare as a global variable

// Rebind event listeners after dynamically loading content
function bindLanguageOptionListeners() {
  languageOptions.forEach(option => {
    option.addEventListener('click', () => {
      option.classList.toggle('selected');
      const bubble = option.querySelector('.bubble');
      if (bubble) {
        bubble.classList.toggle('selected');
      }
    });
  });
}

// Filter languages based on search input
function filterLanguages(query) {
  const filteredOptions = Array.from(languageOptions).filter(option => {
    const label = option.querySelector('.language-label').textContent.toLowerCase();
    return label.includes(query.toLowerCase());
  });

  // Show only the filtered options
  const languageSelect = document.getElementById('language-select');
  languageSelect.innerHTML = ''; // Clear the previous options

  filteredOptions.forEach(option => {
    languageSelect.appendChild(option);
  });
}

// Show languages based on selection status
function showLanguages() {
  const showSelected = document.getElementById('show-selected-btn').classList.contains('active');
  const showUnselected = document.getElementById('show-unselected-btn').classList.contains('active');

  languageOptions.forEach(option => {
    if (option.classList.contains('selected') && showSelected) {
      option.style.display = 'block'; // Show selected
    } else if (!option.classList.contains('selected') && showUnselected) {
      option.style.display = 'block'; // Show unselected
    } else {
      option.style.display = 'none';
    }
  });
}
// Show a notification when saving settings
function showSaveNotification() {
  const notification = document.getElementById('notification');

  // Ensure notification is visible by adding the 'show' class
  notification.classList.add('show');

  // After 3 seconds, hide the notification by removing the 'show' class
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000); // Notification stays visible for 3 seconds
}

// Save selected languages
function saveSettings() {
  const selectedLanguages = [];
  languageOptions.forEach(option => {
    if (option.querySelector('.bubble').classList.contains('selected')) {
      selectedLanguages.push(option.dataset.value);
    }
  });

  chrome.storage.sync.set({ selectedLanguages: selectedLanguages });

  // Call the function to show the save notification
  showSaveNotification();
}


// Load saved settings
function loadSettings() {
  chrome.storage.sync.get('selectedLanguages', function(data) {
    if (data.selectedLanguages) {
      languageOptions.forEach(option => {
        const bubble = option.querySelector('.bubble');
        if (data.selectedLanguages.includes(option.dataset.value)) {
          option.classList.add('selected');
          bubble.classList.add('selected');
        }
      });
      if (data.selectedLanguages.length > 0) switchButton(document.getElementById('show-unselected-btn'));
      showLanguages();
    }
  });
}

// Handle button state switching
function switchButton(btn) {
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
  } else {
    btn.classList.add('active');
  }
}

// Main execution
document.addEventListener('DOMContentLoaded', () => {
  // Load languages from external file
  fetch('languages.json')
    .then(response => response.json())
    .then(languages => {
      const languageSelect = document.getElementById('language-select');

      // Populate the language options
      languages.forEach(language => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'language-option';
        optionDiv.setAttribute('data-value', JSON.stringify(language));

        const labelSpan = document.createElement('span');
        labelSpan.className = 'language-label';
        labelSpan.textContent = language.fieldlabel;

        const bubbleSpan = document.createElement('span');
        bubbleSpan.className = 'bubble';

        optionDiv.appendChild(labelSpan);        
        optionDiv.appendChild(bubbleSpan);

        languageSelect.appendChild(optionDiv);
        optionDiv.addEventListener('click', () => {
          optionDiv.classList.toggle('selected');
          bubbleSpan.classList.toggle('selected');
        });
      });

      // Update `languageOptions` after adding new elements
      languageOptions = document.querySelectorAll('.language-option');

      // Load saved settings (ensure it works with newly added options)
      loadSettings();

      // Initially show all languages, no button is active
      //showLanguages();
    });

  // Add event listeners for UI elements
  document.getElementById('save-settings').addEventListener('click', saveSettings);

  document.getElementById('search-box').addEventListener('input', (e) => {
    filterLanguages(e.target.value);
  });

  document.getElementById('show-selected-btn').addEventListener('click', function() {
    switchButton(this);
    showLanguages();
  });

  document.getElementById('show-unselected-btn').addEventListener('click', function() {
    switchButton(this);
    showLanguages();
  });
});
