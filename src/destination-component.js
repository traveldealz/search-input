import Base from './base-component.js';

export default class extends Base {

	connectedCallback() {

    super.connectedCallback();

    this.fetch = this.hasAttribute('fetch') ? this.getAttribute('fetch') : '';

	}

	onSearch() {

		let search = this.el_input.value.trim();

		if (3 > search.length) {
			return;
		}

		fetch(this.fetch + '/wp-json/wp/v2/destinations?per_page=20&orderby=count&order=desc&_fields=id,name,slug&search=' + encodeURIComponent(search))
			.then((response) => response.json())
			.then((data) => {
				if (0 === data.length) {
					return;
				}
				this.results = data.slice(0,6);
				this.updateList();
			});
	}

	setList() {
		this.results.map( item => {
      item.name = item.name.split(' [')[0];
      return item;
    } ).forEach( item => {
			let el = document.createElement('li');
			el.setAttribute('class', 'result_list_item');
			el.setAttribute('role', 'option');
			el.setAttribute('tabindex', '-1');
			el.setAttribute('aria-selected', 'false');
			el.setAttribute('data-id', item.id);
			el.setAttribute('data-name', item.name);
      el.setAttribute('data-slug', item.slug);
			el.innerHTML = `<div>${item.name}</div>`;
			el.addEventListener( 'click', () => this.select(item) );
			this.el_list.appendChild(el);
		} );
	}

	selectFocused() {
		let el = this.el_list.childNodes[this.currentFocus];
		this.select( {
      id: el.getAttribute('data-id'),
      name: el.getAttribute('data-name'),
      slug: el.getAttribute('data-slug'),
    } );
	}

	select( item ) {
		if (this.el_input.value !== item.slug) {
			this.el_input.value = item.slug;
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