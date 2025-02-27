import AirportSearch from './airport-component.js';
import DestinationSearch from './destination-component.js';
import KeywordSearch from './keyword-component.js';
import HotelSearch from './hotel-component.js';
import RailwaystationSearch from './railwaystation-component.js';

if(undefined === window.customElements.get('airport-search')) {
  window.customElements.define('airport-search', AirportSearch);
}
if(undefined === window.customElements.get('destination-search')) {
  window.customElements.define('destination-search', DestinationSearch);
}
if(undefined === window.customElements.get('keyword-search')) {
  window.customElements.define('keyword-search', KeywordSearch);
}
if(undefined === window.customElements.get('hotel-search')) {
  window.customElements.define('hotel-search', HotelSearch);
}
if(undefined === window.customElements.get('railwaystation-search')) {
 window.customElements.define('railwaystation-search', RailwaystationSearch ); 
}