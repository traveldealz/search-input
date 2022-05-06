import "./index.js";

export default {
  parameters: {
    layout: "centered",
  },
};

export const airportSearch = () => `<airport-search><input></airport-search>`;
export const destinationSearch = () => `<destination-search><input></destination-search>`;
export const hotelSearch = () => `<hotel-search><input><input name="location_type"><input name="location_city"><input name="location_countrycode"><input name="location_coordinates"></hotel-search>`;
