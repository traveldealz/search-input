const template = document.createElement('template');
template.innerHTML = /*html*/`
<style>
	.selected_wrapper {
		position: absolute;
		top: .1rem;
		bottom: .1rem;
		right: .25rem;
		left: .25rem;
		align-items: center;
	}

  .selected_item {
		cursor: pointer;
		background-color: #fff;
		color: rgb(41, 41, 41);
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0 .25rem;
	}

	.container {
		position: relative;
		z-index: 30;
	}

	.result_list {
		position: absolute;
		list-style-type: none;
		border: solid rgba(230,230,230);
		border-width: 1px 1px 1px 1px;
		background-color: #fff;
		color: rgba(41, 41, 41);
		padding: 0;
		margin: 0;
		max-height: 20rem;
		overflow-y: scroll;
		-webkit-overflow-scrolling: touch;
		right: 0px;
		left: 0px;
	}

  .result_list_item {
		font-size: .9rem;
		cursor: pointer;
		padding-bottom: .25rem;
		padding-top: .25rem;
		padding-left: .5rem;
		padding-right: .5rem;
		display: flex;
		justify-content: space-between;
		border-bottom: rgba(230,230,230) solid 1px;
	}

  .result_list_item:hover, .result_list_item[aria-selected="true"] {
		background-color: #005EA5;
		border-color: #005EA5;
		color: #ffffff;
	}

</style>
<div class="container">
<slot></slot>
<div class="selected_wrapper" style="display:none;"></div>
</div>
<div class="container">
	<ul class="result_list" role="listbox" style="display:none;"></ul>
</div>
`;

const style_dark = `
	@media (prefers-color-scheme:dark) {
		.selected_item, .result_list {
			background-color:rgb(34,34,34);
			color: #fff;
		}
	}
`;

const debounce = (fn, delay) => {
	let timer = null;
	return function (...args) {
		const context = this;
		timer && clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(context, args);
		}, delay);
	};
}

export default class extends HTMLElement {

	constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.onSearch = debounce(this.onSearch, 500);
    }

	connectedCallback() {

		this.results = [];

		this.dark = this.hasAttribute('dark') ? 'true' == this.getAttribute('dark') : false;
		
		this.shadowRoot.append(template.content.cloneNode(true));

		if (this.dark) {
			let el_dark_style = document.createElement('style');
			el_dark_style.innerHTML = style_dark;
			this.shadowRoot.append(el_dark_style);
		}

		this.el_list = this.shadowRoot.querySelector('[role="listbox"]');

		this.el_selected = this.shadowRoot.querySelector('.selected_wrapper');

		this.el_input = this.querySelector('input');
		this.el_input.setAttribute('aria-autocomplete', 'list');
		this.el_input.setAttribute('aria-expanded', 'false');
		this.el_input.setAttribute('role', 'combobox');

		this.currentFocus = -1;

		this.el_input.addEventListener('keydown', event => this.onKeydown(event) );
		this.el_input.addEventListener('keyup', event => this.onKeyup(event) );

		this.el_input.addEventListener('blur', () => window.setTimeout( () => this.hideList(), 100 ) );
		this.el_input.addEventListener('focus', () => this.showList() );

		this.el_input.addEventListener('focus', () => {
			this.hasFocus = true;
			this.showList();
		} );
		this.el_input.addEventListener('blur', () => this.hasFocus = false );

		this.el_selected.addEventListener('click', event => {
			this.el_selected.style.display = 'none';
			this.el_input.focus();
			this.el_input.select();
		} );

	}

	onKeydown( event ) {
		switch (event.key) {
			case 'ArrowUp':
				this.updateFocus(this.currentFocus - 1);
				break;
			case 'ArrowDown':
				this.updateFocus(this.currentFocus + 1);
				break;
			case 'Enter':
				event.preventDefault();
				this.selectFocused();
				break;
			default:
				this.el_input.focus();
		  }
	}

	onKeyup( event ) {
		switch (event.key) {
			case 'Escape':
				this.hideList('');
				break;
			case 'ArrowUp':
			case 'ArrowDown':
			case 'Enter':
			case 'ArrowRight':
			case 'ArrowLeft':
			case 'Shift':
			  // ignore otherwise the menu will show
			  break;
			case 'Tab':
				this.hideList();
				break;
			default:
			  this.onSearch();
		  }
	}

	onSearch() {

		let search = this.el_input.value.trim();

		if (3 > search.length) {
			return;
		}

		fetch('?search=' + encodeURIComponent(search))
			.then((response) => response.json())
			.then((data) => {
				if (0 === data.length) {
					return;
				}
				this.results = data.slice(0,6);
				this.updateList();
			});
	}

	showList( html = null ) {
		if (this.hasFocus) {
			this.el_list.parentElement.style.zIndex = 31;
			this.el_list.style.display = 'block';
			this.el_selected.style.display = 'none';
		}
		if (null !== html) {
			this.el_list.innerHTML = html;
		}
	}

	hideList() {
		this.el_list.style.display = 'none';
		this.el_list.parentElement.style.zIndex = 30;
	}

	updateList() {
		// Clear List
		this.showList('');

		this.setList();

		this.updateFocus();

	}

	setList() {
		this.results.forEach( item => {
			let el = document.createElement('li');
			el.setAttribute('class', 'airport_item');
			el.setAttribute('role', 'option');
			el.setAttribute('tabindex', '-1');
			el.setAttribute('data-value', item.value);
			el.innerHTML = `<div>${item.value}</div>`;
			el.addEventListener( 'click', () => this.select(item) );
			this.el_list.appendChild(el);
		} );
	}

	updateFocus( id = 0 ) {

		if ( 0 > id ) {
			this.currentFocus -1;
			return;
		}

		let el = this.el_list.childNodes[id];
		if ( ! el ) {
			return;
		}

		[ ...this.el_list.querySelectorAll('li[aria-selected="true"]') ].map( e => e.setAttribute('aria-selected', 'false') );

		el.setAttribute('aria-selected', 'true');
		//el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
		this.currentFocus = id;

		// ToDo Scroll List
		// if( ! el.isElementVisible(el.parentElement, el) ) {
		// 	el.parentElement.scrollTop(el.parentElement.scrollTop() + el.position().top);
		// }
	}

	selectFocused() {
		let el = this.el_list.childNodes[this.currentFocus];
		this.select( { value: el.getAttribute('data-value') } );
	}

	select( item ) {
		if (this.el_input.value !== item.value) {
			this.el_input.value = item.value;
		}
		this.setOverlay(item.value);
		this.hideList('');
	}

	setOverlay( value ) {
		this.el_selected.innerHTML = `<div>${value}</div>`;
		this.el_selected.style.display = 'flex';
	}

}