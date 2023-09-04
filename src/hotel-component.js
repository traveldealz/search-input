import Base from './base-component.js';

const style = /*css*/`

	.hotel_text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.location_code {
		display: flex;
		align-items: center;
	}

	.hotel_location {
		font-size: .7rem;
	}

`;

export default class extends Base {

	osm_tags = 'osm_tag=tourism:hotel&osm_tag=place:city&osm_tag=place:town&osm_tag=place:village';

	type_emoji = {
		city: '🏙',
		town: '🏘',
		village: '🏡',
		hotel: '🏨',
		station: '🚉',
		stop: '🚉',
	};

	connectedCallback() {
    super.connectedCallback();

		this.el_input_location_id = this.querySelector(`input[name="${this.inputprefix}_id"]`);
		this.el_input_location_type = this.querySelector(`input[name="${this.inputprefix}_type"]`);
		this.el_input_location_city = this.querySelector(`input[name="${this.inputprefix}_city"]`);
		this.el_input_location_state = this.querySelector(`input[name="${this.inputprefix}_state"]`);
		this.el_input_location_countrycode = this.querySelector(`input[name="${this.inputprefix}_countrycode"]`);
		this.el_input_location_coordinates = this.querySelector(`input[name="${this.inputprefix}_coordinates"]`);

    let el_style = document.createElement('style');
    el_style.innerHTML = style;
    this.shadowRoot.append(el_style);

		if (this.dark) {
			let el_dark_style = document.createElement('style');
			el_dark_style.innerHTML = style_dark;
			this.shadowRoot.append(el_dark_style);
		}
	}
	
	onSearch() {

		let search = this.el_input.value.trim();

		[
			this.el_input_location_type,
			this.el_input_location_city,
			this.el_input_location_countrycode,
			this.el_input_location_coordinates,
		].forEach(el => el && el.value ? el.value = '' : '');

		if (3 > search.length) {
			return;
		}

		fetch('https://photon.komoot.io/api/?q=' + encodeURIComponent(search) + '&' + this.osm_tags + '&limit=10')
			.then((response) => response.json())
			.then((data) => {
        console.log(data);
				if (0 === data.features.length) {
					return;
				}
				this.results = data.features;
				this.updateList();
			});
	}

	setList() {
		this.results.map( feature => {
			let item = {};
			item.id = feature.properties.osm_id;
			item.name = feature.properties.name;
			item.type = feature.properties.osm_value;
			item.city = 'city' === item.type ? feature.properties.name : feature.properties.city;
			item.state = feature.properties.state;
			item.country = feature.properties.country;
			item.countrycode = feature.properties.countrycode;
			item.coordinates = feature.geometry.coordinates[1] + ',' + feature.geometry.coordinates[0];
      return item;
    } ).forEach( item => {
			let el = document.createElement('li');
			el.setAttribute('class', 'result_list_item');
			el.setAttribute('role', 'option');
			el.setAttribute('tabindex', '-1');
			el.setAttribute('aria-selected', 'false');
			el.dataset.id = item.id;
			el.dataset.name = item.name;
			el.dataset.type = item.osm_value;
			el.dataset.city = item.city;
			el.dataset.state = item.state;
			el.dataset.country = item.country;
			el.dataset.countrycode = item.countrycode;
			el.dataset.coordinates = item.coordinates;
			let el_button = document.createElement('button');
			el_button.setAttribute('class', 'result_list_item_button');
			el_button.type = 'button';
			el_button.innerHTML = `<div><div>${item.name}</div><div class="hotel_location">${item.city ? item.city + ', ' : ''}${item.state ? item.state + ', ' : ''}${item.country}</div></div><div class="location_code">${this.type_emoji[item.type] ?? ''}</div>`;
			el_button.addEventListener( 'click', (event) => this.select(item) );
			el.append(el_button);
			this.el_list.appendChild(el);
		} );
	}

	selectFocused() {
		let el = this.el_list.childNodes[this.currentFocus];
		this.select( el.dataset );
	}

	select( item ) {
		if (this.el_input.value !== item.name) {
			this.el_input.value = item.name;
			this.el_input.dispatchEvent(new Event('change'));
			this.el_input.dispatchEvent(new Event('change', { bubbles: true }));
		}
		if (this.el_input_location_id) {
			this.el_input_location_id.value = item.id;
		}
		if (this.el_input_location_type) {
			this.el_input_location_type.value = item.type;
		}
		if (this.el_input_location_city) {
			this.el_input_location_city.value = item.city;
		}
		if (this.el_input_location_state) {
			this.el_input_location_state.value = item.state;
		}
		if (this.el_input_location_countrycode) {
			this.el_input_location_countrycode.value = item.countrycode;
		}
		if (this.el_input_location_coordinates) {
			this.el_input_location_coordinates.value = item.coordinates;
		}
		this.setOverlay(item.name);
		this.hideList('');
	}

	setOverlay( name ) {
		this.el_selected.innerHTML = `<div class="selected_item"><div class="hotel_text">${name}</div></div>`;
		this.el_selected.style.display = 'flex';
	}

}