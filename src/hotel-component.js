import Base from './base-component.js';

export default class extends Base {
	
	onSearch() {

		let search = this.el_input.value.trim();

		if (3 > search.length) {
			return;
		}

		fetch('https://photon.komoot.io/api/?q=' + encodeURIComponent(search) + '&osm_tag=tourism:hotel&limit=10')
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
			item.city = feature.properties.city;
			item.country = feature.properties.country;
      return item;
    } ).forEach( item => {
			let el = document.createElement('li');
			el.setAttribute('class', 'result_list_item');
			el.setAttribute('role', 'option');
			el.setAttribute('tabindex', '-1');
			el.setAttribute('aria-selected', 'false');
			el.setAttribute('data-id', item.id);
			el.dataset.id = item.id;
			el.dataset.name = item.name;
			el.dataset.city = item.city;
			el.dataset.country = item.country;
			el.innerHTML = `<div><div>${item.name}</div><div><small>${item.city}, ${item.country}</small></div></div>`;
			el.addEventListener( 'click', (event) => this.select(item) );
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
		this.el_selected.innerHTML = `<div class="selected_item">${name}</div>`;
		this.el_selected.style.display = 'flex';
	}

}