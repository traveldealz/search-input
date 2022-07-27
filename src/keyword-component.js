import Base from './base-component.js';

export default class extends Base {

	endpoint = '/wp-json/wp/v2/search';
	search_type = 'term';
	search_subtype = 'category,post_tag,origins,destinations,airline,period';

	connectedCallback() {

    super.connectedCallback();

    this.endpoint = this.hasAttribute('endpoint') ? this.getAttribute('endpoint') : this.endpoint;
    this.search_type = this.hasAttribute('search_type') ? this.getAttribute('search_type') : this.search_type;
    this.search_subtype = this.hasAttribute('search_subtype') ? this.getAttribute('search_subtype') : this.search_subtype;

    this.el_input.addEventListener('blur', () => {
      if (this.el_input.value !== this.el_input.dataset.selected) {
        this.el_input.value = '';
      }
    } );

	}

	onSearch() {

		let search = this.el_input.value.trim();

		if (3 > search.length) {
			return;
		}

		fetch(this.endpoint + '?type=' + encodeURIComponent(this.search_type) + '&subtype=' + encodeURIComponent(this.search_subtype) + '&per_page=20&_fields=id,title,type,url&search=' + encodeURIComponent(search))
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
		[...new Set(this.results
      .map(item => item.title)
      .map(item => item.split(' [')[0]))]
      .forEach( item => {
			let el = document.createElement('li');
			el.setAttribute('class', 'result_list_item');
			el.setAttribute('role', 'option');
			el.setAttribute('tabindex', '-1');
			el.setAttribute('aria-selected', 'false');
			let el_button = document.createElement('button');
			el_button.setAttribute('class', 'result_list_item_button');
			el_button.type = 'button';
			el_button.addEventListener( 'click', () => this.select(item) );
			el_button.innerHTML = `<div>${item}</div>`;
			el.append(el_button);
			this.el_list.appendChild(el);
		} );
	}

	selectFocused() {
		let el = this.el_list.childNodes[this.currentFocus];
		this.select(el.innerText);
	}

	select( item ) {
		if (this.el_input.value !== item) {
			this.el_input.value = item;
			this.el_input.dataset.selected = item;
			this.el_input.dispatchEvent(new Event('change'));
			this.el_input.dispatchEvent(new Event('change', { bubbles: true }));
		}
		this.hideList('');
	}

}