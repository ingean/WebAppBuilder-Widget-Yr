var mapExtentchangeHandler;

define(['dojo/_base/declare',
'jimu/BaseWidget',
'dojo/_base/lang',
'dojo/dom',
'dojo/query',
'esri/tasks/QueryTask',
'esri/tasks/query',
'esri/request',
'esri/config'],
function(declare, BaseWidget, lang, dom, query, QueryTask, Query, esriRequest, esriConfig) {
  return declare([BaseWidget], {
    baseClass: 'jimu-widget-yr', 
    postCreate: function () {
      this.inherited(arguments);
      esri.config.defaults.io.proxyUrl = this.config.customProxyURL;
    },
    onOpen: function () { //Add eventhandler when widget is opened
      mapExtentchangeHandler = this.map.on('extent-change', lang.hitch(this,this._getWeather));
      lang.hitch(this,this._getWeather());
    },
    onClose: function () {
      mapExtentchangeHandler.remove(); //Remove eventhandler when widget is closed
    },
    _getWeather: function () {
      //Query Yr polygons layer to get Yr placename
      var queryTask = new QueryTask(this.config.yrPolygonerURL);
      var query = new Query();
      query.geometry = this.map.extent.getCenter();
      query.outFields = ['Stadnamn', 'Kommune', 'Fylke','Bokmål'];    
      queryTask.execute(query, lang.hitch(this, function(res) {
        //console.log('Found yr placename from polygons: ' + res.features[0].attributes['Stadnamn']);
        var req = esriRequest({
          url: res.features[0].attributes['Bokmål'], //Link to XML forecast
          handleAs: 'xml',
          load: lang.hitch(this, function (response) {
            if (response.error) {
              this.forecast.innerHTML = '<b>Værvarsel ikke tilgjengelig</b>'
              return;
            }
            //Forcast received - render result
            var xml = response.documentElement;
        
            //Set placename and last updated as title
            var placename = xml.getElementsByTagName('location')[0].childNodes[1].innerHTML;
            var lastUpdated = xml.getElementsByTagName('meta')[0].childNodes[1].innerHTML;
            this.location.innerHTML = '<h1 style="display:inline;">' + placename + '</h1>' + //Set title to location 
                                      ' - sist oppdatert: ' + 
                                      new Date(lastUpdated).getHours() + ':' +
                                      ('0' + new Date(lastUpdated).getMinutes()).slice(-2);

            //Create forecast table
            var tabhtml = this._createListItem(xml.getElementsByTagName('tabular')[0].childNodes);
            
            //Create credit link
            var creditText = xml.getElementsByTagName('credit')[0].childNodes[5].getAttribute('text');
            var creditUrl= xml.getElementsByTagName('credit')[0].childNodes[5].getAttribute('url');
            var credit = '<a href="' + creditUrl + '" target="_blank">' + creditText + '</a>';
            
            //Add html to widget
            this.forecast.innerHTML = '<hr>' + tabhtml + '<hr>' + credit;  
            }),
          error: lang.hitch(this, function() {
            this.forecast.innerHTML = '<span class="jimu-widget-note">Værvarsel ikke tilgjengelig</span>'
            console.error('Something went wrong :-/');
          })
        });
      }));
    },
    _createListItem: function(nl) {
      const weekday = {0:'Søndag',1:'Mandag',2:'Tirsdag',3:'Onsdag',4:'Torsdag',5:'Fredag',6:'Lørdag'};
      var html = '';
      var day = 9;
      
      for (i = 0; i < nl.length; i++) {
        if (nl[i].nodeName === 'time') {
          
          if (day === 9) { //First timeslot of first day
            html += '<table>' +
            '<tr>' + 
              '<td><img src="http://yr.github.io/weather-symbols/png/100/' + //Forecast
                    nl[i].childNodes[3].getAttribute('var') +
                    '.png" width="100px" /></td>' +
              '<td class="jimu-widget-yr temp-now ' + this._tempColor(nl[i].childNodes[13].getAttribute('value')) + '">' + //Temperature
              nl[i].childNodes[13].getAttribute('value') + '&deg;</td>' + 
              '<td class="jimu-widget-yr precipitation-now">' + nl[i].childNodes[5].getAttribute('value') + ' mm<br>Nedbør</td>' + //Precipitation
            '</tr>' + 
            '<tr>' +
              '<td colspan="3">' + nl[i].childNodes[11].getAttribute('name') + //Wind
              ', ' + nl[i].childNodes[11].getAttribute('mps') + 
              ' m/s fra ' + nl[i].childNodes[9].getAttribute('name').toLowerCase() + '</td>' +
            '</tr></table><p>' + 
            '<h4>Senere i dag</h4>' +
            '<hr><table><tr class="jimu-widget-yr table-headers"><td>Tid</td><td>Varsel</td><td>Temp.</td><td>Nedbør</td><td>Vind</td></tr>';
          } 
          
          if (new Date(nl[i].getAttribute('from')).getDay() != day && day != 9) { //New day, but not the first
            html += '</table><p><h4>' + weekday[new Date(nl[i].getAttribute('from')).getDay()] + '</h4>' +
                    '<hr><table><tr class="jimu-widget-yr table-headers"><td>Tid</td><td>Varsel</td><td>Temp.</td><td>Nedbør</td><td>Vind</td></tr>';
          }
          
          if(day != 9) {
            var startHr = new Date(nl[i].getAttribute('from')).getHours();
            var endHr = new Date(nl[i].getAttribute('to')).getHours();
            html += '<tr>' +
                      '<td width="50px">kl '+ startHr + '-' + endHr + '</td>' + //Time
                      '<td><img src="http://yr.github.io/weather-symbols/png/100/' + //Forecast
                      nl[i].childNodes[3].getAttribute('var') +
                      '.png" width="30px" /></td>' +
                      '<td class="jimu-widget-yr ' + this._tempColor(nl[i].childNodes[13].getAttribute('value')) + '">' + //Temperature
                      nl[i].childNodes[13].getAttribute('value') + '&deg;</td>' + 
                      '<td class="jimu-widget-yr minus">' + nl[i].childNodes[5].getAttribute('value') + ' mm</td>' + //Precipitation
                      '<td>' + nl[i].childNodes[11].getAttribute('name') + //Wind
                      ', ' + nl[i].childNodes[11].getAttribute('mps') + 
                      ' m/s fra ' + nl[i].childNodes[9].getAttribute('name').toLowerCase() + '</td>' +
                    '</tr>';
          }
          day = new Date(nl[i].getAttribute('from')).getDay();
        }
      }
      html += '</table>';
      return html;
    },
    _tempColor: function(temp) {
      temp = Number(temp);
      if (temp > 0) {return 'plus'} else {return 'minus'};
    }
  });
});