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

	connectedCallback() {
    super.connectedCallback();

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

		if (3 > search.length) {
			return;
		}

		fetch('https://photon.komoot.io/api/?q=' + encodeURIComponent(search) + '&osm_tag=tourism:hotel&osm_tag=place:village&limit=10')
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
			item.type = feature.properties.type;
			item.city = 'city' === item.type ? feature.properties.name : feature.properties.city;
			item.country = feature.properties.country;
      return item;
    } ).forEach( item => {
			let el = document.createElement('li');
			el.setAttribute('class', 'result_list_item');
			el.setAttribute('role', 'option');
			el.setAttribute('tabindex', '-1');
			el.setAttribute('aria-selected', 'false');
			el.dataset.id = item.id;
			el.dataset.name = item.name;
			el.dataset.city = item.city;
			el.dataset.country = item.country;
			let el_button = document.createElement('button');
			el_button.setAttribute('class', 'result_list_item_button');
			el_button.type = 'button';
			el_button.innerHTML = `<div><div>${item.name}</div><div class="hotel_location">${item.city}, ${item.country}</div></div><div class="location_code">${'city' === item.type ? '🏙' : 'house' === item.type ? '🏨' : ''}</div>`;
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
		this.setOverlay(item.name);
		this.hideList('');
	}

	setOverlay( name ) {
		this.el_selected.innerHTML = `<div class="selected_item"><div class="hotel_text">${name}</div></div>`;
		this.el_selected.style.display = 'flex';
	}

}