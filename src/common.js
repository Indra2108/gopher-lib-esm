/*jslint node: true */
/*jshint esversion: 6 */

import path from 'node:path'

const GopherURIPattern = '^(gopher:\\/\\/)?(.+?(?=:|\\/|$))(:\\d+?(?=$|\\/))?(\\/(\\d|g|I|h|t|M)?)?([^#]+?(?=\\?|$|#))?(\\?.+?(?=$|#))?(#.+)?';

/** @class */
class GopherResource {

	/**
	 * @param {string} host|url - Hostname or url, if url, do not provide other arguments
	 * @param {string} port - Port for the entry
	 * @param {string} selector - Selector for the entry
	 * @param {string} type - The type of entry (for example 'i')
	 * @param {string} name - The name to show to the user in a gopher-map
	 * @param {string} query - Search string to send to server (not expressed in gopher-map)
	 * @description Describes a gopher-resource (a menu-item)
	 */
	constructor(host, port, selector, type, name, query) {
		if (host && !port) {
			var regEx = new RegExp(GopherURIPattern);
			var matches = regEx.exec(decodeURI(host));
			try {
				this.host = matches[2];
				this.port = (matches[3]) ? matches[3].substring(1) : '70';
				this.type = (matches[5]) ? matches[5] : '1';
				this.selector = (matches[6]) ? matches[6] : '';
				this.query = (matches[7]) ? matches[7].substring(1) : false;
				this.name = (matches[8]) ? matches[8].substring(1) : this.toURI();
			} catch (e) {
				throw new Error('Not a valid gopher URI: ' + host);
			}
		} else if (host && port && typeof selector === 'string' && type) {
			this.host = host;
			this.port = port;
			this.type = type;
			this.selector = selector;
			this.name = name;
			this.query = (query) ? query : false;
		} else {
			throw new Error('Invalid arguments to constructor.');
		}
		if (!this.host || !this.port || !this.type || typeof this.selector !== 'string') {
			throw new Error('Not a valid GopherResource: ' + JSON.stringify(this));
		}
		if (selector && selector.length > 1) {
			this.selector = path.normalize(this.selector);
		}
	}

	toShortURI() {
		return encodeURI('gopher://' + this.host + ':' + this.port + '/' + this.type + this.selector + ((this.query !== false) ? '?' + this.query : ''));
	}

	toURI() {
		return this.toShortURI() + ((this.name) ? '#' + encodeURIComponent(this.name) : '');

	}

	/**
	 * @method
	 * @description Return a goper-map formatted string representation of this resource
	 */
	toDirectoryEntity() {
		return this.type + this.name + '\t' + this.selector + '\t' + this.host + '\t' + this.port + '\r\n';
	}

	toJson() {
		return JSON.stringify(this);
	}
}

/**
 * @method
 * @memberof GopherResource
 * @param {string} txt - Message for this info-item
 * @description Create a new GopherResource with info text, suitable for menus
 * @returns {GopherResource}
 */
GopherResource.info = (txt) => {
	return new GopherResource('i', 1, '-', 'i', txt)
};

/**
 * @method
 * @memberof GopherResource
 * @param {string} txt - Message for this error-item
 * @description Create a new GopherResource with error text, suitable for menus
 * @returns {GopherResource}
 */
GopherResource.error = (txt) => {
	return new GopherResource('e', 1, '-', '3', txt)
};

const GopherType = {
	info: 'i',
	text: '0',
	directory: '1',
	phonebook: '2',
	error: '3',
	binhex: '4',
	dosbinary: '5',
	uuencoded: '6',
	search: '7',
	telnet: '8',
	binary: '9',
	redundant: '+',
	tn3270: 'T',
	gif: 'g',
	image: 'I',
	html: 'h',
	mail: 'M'
};

export {
	GopherResource as Resource,
	GopherType as Type,
	GopherURIPattern as URIPattern
};