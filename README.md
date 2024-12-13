# PowerApps Multi-Language Field Wizard

Easily manage multi-language fields in **PowerApps** and **Dynamics 365** directly within the PowerApps Maker Portal. This browser add-in saves time and improves localization by automatically generating input fields for additional language labels when creating fields.


## Installation
1. Download the add-in from the [Chrome Web Store](https://chromewebstore.google.com/detail/multi-language-field-wiza/mfodgfglckpdbdclfaekoefakdkfcpag?authuser=0&hl=en).
2. Grant permissions for the domains `https://make.powerapps.com/*` and `https://make.preview.powerapps.com/*`.
3. Open the PowerApps Maker Portal to start using the add-in.

## How to Use
1. **Select Languages**: Open the language settings by clicking on the add-in icon in your toolbar, choose the languages you want additional input fields for (not your environment base language) and save. Refresh any open Maker Portal.
2. **Open Create Dialog**: Open the new column quick create in the Maker Portal.
3. **Enter Labels**: Automatically generated input fields will allow you to enter localization labels for each selected language.
4. **Save and Done**: The localized labels will be added to the field directly.

## Warnings
The add-in requires the following permissions:
- The add-in does not check the installed languages in your environment. Inputs for any languages that are not enabled will be ignored.
- Duplicate inputs for your base language will be ignored.
- The add-in currently only works in the Table-Columns section in the maker portal. It does not work when creating a column from a form.

## Contributing
Contributions are welcome! If you have ideas to improve the add-in, please create an issue or submit a pull request.

## License
This project is licensed under the [MIT License](https://github.com/Niklas-Boesch/Multi-Language-Field-Wizard-for-PowerApps/blob/main/LICENSE).
