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
export const railwaystationSearch = () => `<railwaystation-search inputprefix="from"><input><input name="from_id"><input name="from_type"><input name="from_city"><input name="from_state"><input name="from_countrycode"><input name="from_coordinates"></railwaystation-search>`;
