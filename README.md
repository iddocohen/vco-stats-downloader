VCO Statistics Downloader - Chrome Extension
=====================================
The VMware SD-WAN Orchestrator presents a lot of statistical graphs; however, these data sets for the graphs are not downloadable when the graphs are called. 

This extension, tries to solve that problem. 

It gives the user the ability to download the statistics as CSV after a given webpage (Transport, Destination, Source, etc.) is opened. 

Enjoy!

## Tested

System tested on:

* Google Chrome: Version 89.0.4389.90 (Official Build) (x86_64)

## Install

To load the extension, you need to:

* Clone this repository
* Go to chrome://extensions/
* Make sure you are in development mode
* Click on "Load unpacked extension" and navigate to your extension folder.

Depending on demand, I may put it under the marketplace of Google. 

## Storage

The extension uses the local storage to save data. As such, depending on sizes of the CSVs it might take some storage.

Depending on the demand, I may create "storage handling" feature (e.g. clean the data after downloaded).

For now to remove all local storage, remove extension and load it back.

## Known Warning/Error

When using the extension, it will display under the development mode the following error:

"Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/."

I will fix it in a later stage, depending on demand. 

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

## Licence
MIT, see ``LICENSE``


