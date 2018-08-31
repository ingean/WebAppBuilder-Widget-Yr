# WebAppBuilder-Widget-Yr
Widget for <a href="https://developers.arcgis.com/web-appbuilder/">ArcGIS Web AppBuilder Developer</a> to show forecast data from yr.no for the current location. The widget shows the weather forecast for the current map center point, and updates with every pan/zoom.

## Installation and prerequisites
Download the yr folder and copy to the widgets repository. By default, the widgets repository is located in the 
``` 
\client\stemapp\widgets 
``` 
folder. If you prefer to deploy the widget to a specific app only, you can copy the widget folder to the 
``` 
stemapp\widgets
``` 
folder in a downloaded app, and configure it in the app config file.
<p>
The widget fetches forecast data from www.yr.no and to avoid cross origin resource blocking a proxy is needed. Esri has one available here at GitHub (https://github.com/Esri/resource-proxy).
<p>
The widget needs to translate the map center point (in coordinates) to a yr.no placename. For this it uses a ArcGIS Polygon Feature Server created from the yr placename points using the <a href="http://pro.arcgis.com/en/pro-app/tool-reference/analysis/create-thiessen-polygons.htm">Thiessen Polygon Method.</a> By default the widget use a service hosted in ArcGIS Online.  

## Setup
The widget exposes two settings for setup in ArcGIS Web AppBuilder Builder, a proxy url and url for yr placename polygons. 

