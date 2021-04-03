VCO Statistics Downloader - Chrome Extension
=====================================
The VMware SD-WAN Orchestrator (VCO) presents a lot of statistical graphs; however, these data sets for the graphs are not downloadable when the graphs are called. 

This extension, tries to solve that problem. 

It gives the user the ability to download the statistics as CSV after a given webpage (Transport, Destination, Source, etc.) is opened. 

Enjoy!

## Warning

This extension injects javascript code into the existing VCO website. 

As such, please before filling any bugs around UI to support, remove the extension first and try again.

Depending on the demand, I might program a switch for enable/disable the plugin. 


## Versions

* 0.4: 
    * Supporting now remote diag functionality (flows, paths, routes).

* 0.3:
    * Supporting now Systems Statistics.
    * Supporting now Paths statistics for Edges (new UI).
    * Optimized Code
* 0.2:
    * Supporting now QoE Statistics.

* 0.1:
    * First release.

## Demo

![VCO Statistics Downloader Demo](https://github.com/iddocohen/vco-stats-downloader/blob/main/demo.gif?raw=true)

## Tested

System tested on:

* Google Chrome version: 89.0.4389.90 (Official Build) (x86_64)
* VCO version: 4.2.0 

Different VCO versions could work as well but not tested.

## Install

To load the extension, you need to:

* Clone this repository
* Go to chrome://extensions/
* Make sure you are in development mode
* Click on "Load unpacked extension" and navigate to your extension folder.

The extension is configured to only allow .velocloud.net based addresses.
This can be changed by altering the manifest.json and change it to your URL.

## Storage

The extension uses the local storage to save data. As such, depending on sizes of the CSVs it might take some storage.

Depending on the demand, I may create "storage handling" feature (e.g. clean the data after downloaded).

For now to remove all local storage, remove extension and load it back.

## Known Warning/Error

When using the extension, it will display under the development mode the following error:

"Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/."

This will be fixed automatically as soon as the UI will change (which will happen soon).

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

## Licence
MIT, see ``LICENSE``


