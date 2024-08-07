import Base from './base-component.js';

const style = /*css*/`

  .selected_item {
		font-size: .8rem;
  } 

	.airport_text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.airport_location {
		font-size: .7rem;
	}

	.airport_code {
		display: flex;
		align-items: center;
	}

	.airport_code_label {
		display: flex;
		align-items: center;
		text-transform: uppercase;
		color: #fff;
		background-color: #000;
		padding: .25rem;
		line-height: 1;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
		letter-spacing: 0.05em;
		font-size: .8rem;
		font-weight: 700;
		text-transform: uppercase;
		text-decoration: none;
		border-radius: 3px;
	}

`;

const style_dark = `
	@media (prefers-color-scheme:dark) {
		.airport_code_label {
			background-color: rgb(55, 65, 81);
		}
	}
`;

export default class extends Base {

	connectedCallback() {

    super.connectedCallback();

		this.airports = this.hasAttribute('airports') ? this.getAttribute('airports').trim().split(',').map( airport => airport.trim() ) : null;

    let el_style = document.createElement('style');
    el_style.innerHTML = style;
    this.shadowRoot.append(el_style);

		if (this.dark) {
			let el_dark_style = document.createElement('style');
			el_dark_style.innerHTML = style_dark;
			this.shadowRoot.append(el_dark_style);
		}

    this.el_input.addEventListener('blur', () => window.setTimeout( () => this.loadAirport(), 100 ) );

		if (this.airports) {
			//this.loadAirports();
		}

		this.loadAirport();

	}

	static get observedAttributes() {
    return [ 'airport', 'airports' ];
  }

  attributeChangedCallback(name, oldValue, value) {
    if (!this.shadowRoot) {
			return;
		}
		switch (name) {
			case 'airport':
				if ( 3 === value.length ) {
					this.el_input.value = value;
					this.loadAirport();
				}
				break;
			case 'airports':
				if ( 3 <= value.length ) {
					this.airports = value.trim().split(',').map( airport => airport.trim() );
					this.loadAirports();
				}
			break;
		}
  }

	onSearch() {

		let search = this.el_input.value.trim();

		if (3 > search.length) {
			return;
		}

		if (this.airports) {
			return;
		}

		fetch('https://data.travel-dealz.eu/api/airports?search=' + encodeURIComponent(search) + '&type=airport,station,area')
			.then((response) => response.json())
			.then((data) => {
				if (0 === data.data.length) {
					return;
				}
				this.results = data.data.slice(0,6);
				this.updateList();
			});
	}

	loadAirports() {
		fetch('https://data.travel-dealz.eu/api/airports/' + this.airports.join('/') )
			.then((response) => response.json())
			.then((data) => {

				if (0 === data.length) {
					return;
				}

				if (1 === this.airports.length) {
					this.results = [ data ];
				} else {
					this.results = Object.values(data);
				}

				this.setList();
			});
	}

	setList() {
		this.results.forEach( item => {
			let el = document.createElement('li');
			el.setAttribute('class', 'result_list_item');
			el.setAttribute('role', 'option');
			el.setAttribute('tabindex', '-1');
			el.setAttribute('aria-selected', 'false');
			el.setAttribute('data-iatacode', item.iatacode);
			el.setAttribute('data-name', item.name);
			el.setAttribute('data-location', item.location);
			el.setAttribute('data-country', item.country);
			let el_button = document.createElement('button');
			el_button.setAttribute('class', 'result_list_item_button');
			el_button.type = 'button';
			el_button.innerHTML = `<div><div class="airport_name">${item.location}, ${item.country}</div><div class="airport_location">${item.name}</div></div><div class="airport_code"><abbr title="${item.name}" class="airport_code_label">${item.iatacode}</abbr></div>`;
			el_button.addEventListener( 'click', () => this.select(item.iatacode, item.name, item.location, item.country) );
			el.append(el_button);
			this.el_list.appendChild(el);
		} );
	}

	selectFocused() {
		let el = this.el_list.childNodes[this.currentFocus];
		this.select( el.getAttribute('data-iatacode'), el.getAttribute('data-name'), el.getAttribute('data-location'), el.getAttribute('data-country') );
	}

	select( iatacode, name = null, location = null, country = null ) {
		if (this.el_input.value !== iatacode) {
			this.el_input.value = iatacode;
			this.el_input.dispatchEvent(new Event('change', { bubbles: true }));
		}
		this.setOverlay(iatacode, name, location, country);
		this.hideList('');
	}

	setOverlay( iatacode, name, location, country ) {
		this.el_selected.innerHTML = `<div class="selected_item"><div class="airport_text"><div class="airport_name">${location}, ${country}</div><div class="airport_location">${name}</div></div><div class="airport_code"><abbr title="${name}" class="airport_code_label">${iatacode}</abbr></div></div>`;
		this.el_selected.style.display = 'flex';
	}

	loadAirport( value = this.el_input.value ) {
		if (3 !== value.length) {
			this.el_selected.style.display = 'none';
			return;
		}
		let overlay = this.el_selected.querySelector('.airport_code_label');
		if ( overlay && overlay.innerText === value ) {
			this.el_selected.style.display = 'flex';
			return;
		}

		fetch('https://farecollection.travel-dealz.de/api/airports/' + encodeURIComponent(value))
			.then((response) => response.json())
			.then((data) => {
				if (0 === data.length) {
					return;
				}
				this.setOverlay( data.iatacode, data.name, data.location, data.country );
			});
	}
}