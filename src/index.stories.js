import "./index.js";

export default {
  parameters: {
    layout: "centered",
  },
};

export const airportSearch = () => `<airport-search><input></airport-search>`;
export const destinationSearch = () => `<destination-search><input></destination-search>`;
export const keywordSearch = () => `<keyword-search endpoint="https://cors-anywhere.herokuapp.com/https://travel-dealz.de/wp-json/wp/v2/search"><input></keyword-search>`;
export const hotelSearch = () => `<hotel-search><input><input name="location_type"><input name="location_city"><input name="location_countrycode"><input name="location_coordinates"></hotel-search>`;
export const railwaystationSearch = () => `<railwaystation-search><input><input name="location_id"><input name="location_type"><input name="location_city"><input name="location_state"><input name="location_countrycode"><input name="location_coordinates"></railwaystation-search>`;
