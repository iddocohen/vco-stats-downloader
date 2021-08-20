VCO Statistics Downloader - Chrome Extension
=====================================
The VMware SD-WAN Orchestrator (VCO) presents a lot of statistical graphs and remote diagnostic functionalities; however, some of these sets of data are not downloadable for the user in real time.

This extension gives the user the ability to download the graph statistics and remote diagnostics tables as soon as one is either visiting the website itself or executing remote diagnostic functionality.

![VCO Statistics Downloader Demo](https://github.com/iddocohen/vco-stats-downloader/blob/main/demo.gif?raw=true)

As of today, the following content gets extracted and given as CSV to download:

<img src="https://github.com/iddocohen/vco-stats-downloader/blob/main/screenshot.png?raw=true" alt="Downloadable Content for CSV" width="50%" height="50%"> 

More functionality will be added, as demand increases.

Enjoy!

## Warning

This extension injects javascript code into the existing website. 

As such, please before filling any bugs around UI to VMware support, remove the extension first and try again to ensure that the extension does not break anything.

Depending on the demand, I might program a switch for enable/disable the plugin. 

## Versions
* Current not tested (future v1.4):
    * Add feature to get notified that performance of the platform will be reached soon.
        * "Tunnel Count", "Max Concurrent Flows" are "Max Throughput per 1300/IMIX/64 byte packets" are all factors dictating which edge to use. When capacity trendline is now calculated, a notification will popup to tell how far away one is from each.
    * Add support for future trendline calculation for Systems based properties. 
    * Altered drawing graph to support better data handling.
    * "bitsPerSecond" will be computed now when "Average Throughput" is selected in the UI for Transport.
    * "totalbitsPerSecond" will be computed now for all links when "Average Throughput" is selected in the UI for Transport. Important for the notification. 
    * Removing outliner from "Transport (Upper)" to calculate a better trendline. 
    * Removing some stats from "Transpor (Upper)" statistics that are unrelated to calculations (to increase performance). 
* 1.3:
    * Adding regression functionality and drawing functionality of capacity trendline for "System".
    * Adding drawing functionality of capacity trendline for "Transport" tab.
    * Fixed bug when "Capacity Trendline" is not selected.
    * Restructure code for "Capacity Trendline".
    * Convert timestamp to readable date.
* 1.2:
    * Fixed a bug in Transport (Upper) statistics. Data got sorted which was not intended. 
    * Adding "Capacity Trendline" functionality for "Transport (Upper)" statistics
    * Supporting now App identification which are dynamic.  
* 1.1:
    * Performance improvement of around 50-60% for collecting and producing the data.
    * Separating "Transport" and "Business Priority" in UI.
    * Transport tab had two statistics. Now both are supported to be downloadable. Represented via "Transport (Upper)" and "Transport (Lower)" in the UI.
    * Calculating automatically mean, standard deviation, Quantile .95, Quantile .75, Median, Quantile .25 for "Transport (Upper)" and "Business Priority" statistics.
    * Adding green circle indication at UI when new statistics is there.
* 1.0:
    * Changed UI to accomodate more data
    * Supporting now "Threat Analytics" and "Traffic Analytics" statistics of CWS.
* 0.9:
    * Adding Cloud Web Security (CWS) for "Web Log" to download
    * Fixing QoE for 4.4 release. 
* 0.8:
    * Fixing CSS for Chrome version 91
* 0.7:
    * Fixing plugin not working when changing page.
* 0.6:
    * Fixing file location for extension
    * Supporting now list of routes per prefix (route detail output)
* 0.5:
    * Fixing local storage deleting.
    * Fixing date in the menu. 
* 0.4: 
    * Supporting now remote diag functionality.
* 0.3:
    * Supporting now Systems Statistics.
    * Supporting now Paths statistics for Edges (new UI).
    * Optimized Code
* 0.2:
    * Supporting now QoE Statistics.
* 0.1:
    * First release.

## Tested

System tested on:

* Google Chrome version: 89 and 91
* VCO version: 4.2.0, 4.2.1, 4.4 

Different VCO versions could work but not tested.

## Install

To load the extension, you need to:

* Clone/Download this repository
* Enter in the url tab the following address chrome://extensions/
* Make sure you are in development mode.
* Click on "Load unpacked extension" and navigate to folder where you downloaded or extracted the repository. 

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


