/*
 * Suggest Javascript, Version 1.00044
 * (c) 2012 Language Tools GmbH, www.language-tools.com
 * All rights reserved
 */

/*
	Developed by Robert Nyman, http://www.robertnyman.com
	Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/
var getElementsByClassName = function (className, tag, elm){
	if (document.getElementsByClassName) {
		getElementsByClassName = function (className, tag, elm) {
			elm = elm || document;
			var elements = elm.getElementsByClassName(className),
				nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
				returnElements = [],
				current;
			for(var i=0, il=elements.length; i<il; i+=1){
				current = elements[i];
				if(!nodeName || nodeName.test(current.nodeName)) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	else if (document.evaluate) {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = "",
				xhtmlNamespace = "http://www.w3.org/1999/xhtml",
				namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
				returnElements = [],
				elements,
				node;
			for(var j=0, jl=classes.length; j<jl; j+=1){
				classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
			}
			try	{
				elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
			}
			catch (e) {
				elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
			}
			while ((node = elements.iterateNext())) {
				returnElements.push(node);
			}
			return returnElements;
		};
	}
	else {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = [],
				elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
				current,
				returnElements = [],
				match;
			for(var k=0, kl=classes.length; k<kl; k+=1){
				classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
			}
			for(var l=0, ll=elements.length; l<ll; l+=1){
				current = elements[l];
				match = false;
				for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
					match = classesToCheck[m].test(current.className);
					if (!match) {
						break;
					}
				}
				if (match) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	return getElementsByClassName(className, tag, elm);
};
/*
 * (c) 2011 Language Tools GmbH, www.language-tools.com
 * All rights reserved
 */

var debug = true;
window.log = function() {
	if (debug) {
		log.history = log.history || [];	 // store logs to an array for reference
		log.history.push(arguments);
		if(this.console) console.log( Array.prototype.slice.call(arguments) );
	}
};

var _LT = function(inputField, outputField, options) {
	var self = this; // self-hack

	self.element = _getById(inputField);
	self.element.setAttribute("autocomplete", "off");
	self.update	 = _getById(outputField);
	self.formElement = _getFormElement();
	self.originalValue = self.element.value;
	self.options = {
		host: "localhost",
		url: "/",
		queryParam: 'query',
		jsonCallback: 'demo_suggest._results',
		select: "term",
		hl: 'words',
		displayInline: false,
		snapping: false,
		autoselect: false,
		submitFormOnSubmit: true,
		active: true,
		clearHiddenFields: false,
		autoPositionSuggest: false,
		appendParams: ""
	}
	for(option in options) {
		self.options[option] = options[option];
	}

	if (self.options.snapping) self.options.submitFormOnSubmit = false;

	if (self.options.truncation && self.options.truncation.css) self.update.className += ' css_truncate'

	if (self.options.displayInline) {
		self.displayInlineId = "display_inline_" + Math.round(Math.random() * 100000);
		var inlineSuggestion = _newElement('span', { "id": self.displayInlineId, "class": "inlineSuggestion" }, '');
		self.element.parentNode.appendChild(inlineSuggestion);
		self.displayInlineElement = _getById(self.displayInlineId);
		//self.displayInlineElement.style.left = self.element.offsetLeft + 4 + 'px';
	}

	self.safeRegexp = new RegExp("(\\(|\\))", 'g');
	self.extractRegex = new RegExp('<span class="' + self.options.select + '"[^>]*>(.*?)<\/span>', '');
	self.htmlRescueRegex = new RegExp("(<[^>]*)<b>(.*?)<\/b>", 'g');
	self.htmlRescueRegex2 = new RegExp("(&[a-zA-Z0-9]*)<b>(.*?)<\/b>([a-zA-Z0-9]*;)", 'g');
	self.unicodeMap = {"\u00c0":"\u00c0|A", "\u00c1":"\u00c1|A", "\u00c2":"\u00c2|A", "\u00c3":"\u00c3|A", "\u00c4":"\u00c4|Ae|A", "\u00c5":"\u00c5|A", "\u00c6":"\u00c6|Ae", "\u00c7":"\u00c7|C", "\u00c8":"\u00c8|E", "\u00c9":"\u00c9|E", "\u00ca":"\u00ca|E", "\u00cb":"\u00cb|E", "\u00cc":"\u00cc|I", "\u00cd":"\u00cd|I", "\u00ce":"\u00ce|I", "\u00cf":"\u00cf|I", "\u00d1":"\u00d1|N", "\u00d2":"\u00d2|O", "\u00d3":"\u00d3|O", "\u00d4":"\u00d4|O", "\u00d5":"\u00d5|O", "\u00d6":"\u00d6|Oe|O", "\u00d8":"\u00d8|O", "\u00d9":"\u00d9|U", "\u00da":"\u00da|U", "\u00db":"\u00db|U", "\u00dc":"\u00dc|Ue|U", "\u00dd":"\u00dd|Y", "\u00df":"\u00df|ss", "\u00e0":"\u00e0|a", "\u00e1":"\u00e1|a", "\u00e2":"\u00e2|a", "\u00e3":"\u00e3|a", "\u00e4":"\u00e4|ae|a", "\u00e5":"\u00e5|a", "\u00e6":"\u00e6|ae", "\u00e7":"\u00e7|c", "\u00e8":"\u00e8|e", "\u00e9":"\u00e9|e", "\u00ea":"\u00ea|e", "\u00eb":"\u00eb|e", "\u00ec":"\u00ec|i", "\u00ed":"\u00ed|i", "\u00ee":"\u00ee|i", "\u00ef":"\u00ef|i", "\u00f1":"\u00f1|n", "\u00f2":"\u00f2|o", "\u00f3":"\u00f3|o", "\u00f4":"\u00f4|o", "\u00f5":"\u00f5|o", "\u00f6":"\u00f6|oe|o", "\u00f8":"\u00f8|o", "\u00f9":"\u00f9|u", "\u00fa":"\u00fa|u", "\u00fb":"\u00fb|u", "\u00fc":"\u00fc|ue|u", "\u00fd":"\u00fd|y", "\u00ff":"\u00ff|y", "e":"\u00c8|\u00c9|\u00ca|\u00cb|\u00e8|\u00e9|\u00ea|\u00eb|e","n":"\u00d1|\u00f1|n","a":"\u00c0|\u00c1|\u00c2|\u00c3|\u00c4|\u00c5|\u00e0|\u00e1|\u00e2|\u00e3|\u00e4|\u00e5|a","y":"\u00dd|\u00fd|\u00ff|y","u":"\u00dc|\u00d9|\u00da|\u00db|\u00f9|\u00fc|\u00fa|\u00fb|u","c":"\u00c7|\u00e7|c","oe":"\u00d6|\u00f6|oe","ss":"\u00df|ss","ae":"\u00c4|\u00c6|\u00e4|\u00e6|ae","ue":"\u00dc|\u00fc|ue","i":"\u00cc|\u00cd|\u00ce|\u00cf|\u00ec|\u00ed|\u00ee|\u00ef|i","o":"\u00d2|\u00d3|\u00d4|\u00d5|\u00d6|\u00d8|\u00f2|\u00f3|\u00f4|\u00f5|\u00f6|\u00f8|o"};

	self.cache = {};
	self.index = -1;

	_addSnapping(self.options);

	_addEvents();

	if (self.options.autoPositionSuggest) _positionSuggest();

	if (self.options.clearHiddenFields) _clearHiddenFields();

	if (self.options.extraField) {
    if (!self.options.extraFields) {
      self.options.extraFields = [];
    }
    self.options.extraFields.push(self.options.extraField);
  }

	function _positionSuggest() {
		self.update.style.left = self.element.offsetLeft + 'px';
		self.update.style.top = '0';

	}

	function _getFormElement() {
		var parent = self.element.parentNode;
		while(parent.tagName.toLowerCase() != 'form') {
		if(parent.tagName.toLowerCase() == 'body') return null;
			parent = parent.parentNode;
		}
		return parent;
	}

	function _serialize(obj, prefix) {
  	var str = [];
	  for(var p in obj) {
	  	var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
	    str.push(typeof v == "object" ?
	    serialize(v, k) :
	    encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
		return str.join("&");
	}


	function _search() {
		if (!self.options.active) return false;
		self.index = -1;

        if (self.options.selectFirstOnBlurFlag) {
            var fillElem = _getById(self.options.selectFirstOnBlurFlag);
            if (fillElem) fillElem.value = "0";
        }

		var value = _trim(self.element.value);
		console.log(value);

		if (value.length <= 1) {
			_hide();
			return false;
		}
		
		if (self.cache[value] && !self.options.extraFieldsForQuery) { self._results(self.cache[value]); return false; }
		if (value.length == 0) return false;
		var filterPresent = (self.options.preprocess && typeof(LTFilter) != 'undefined' && typeof(LTFilter[self.options.preprocess]) != 'undefined'),
				paramHash = _buildParamHash(value),
				params = (filterPresent ? LTFilter[self.options.preprocess].call(paramHash) : paramHash),
				url = _url() + _serialize(params);
		if (self.scriptTag) self.scriptTag.parentNode.removeChild(self.scriptTag);

		self.scriptTag = _newElement('script', { src: url, type: 'text/javascript' }, '');
		document.getElementsByTagName('head')[0].appendChild(self.scriptTag);
	}

	function _buildParamHash(value) {
		var params = {};
		params[self.options.queryParam] = value;
		if (self.options.extraFieldsForQuery) {
			if (self.options.extraFieldsForQuery && typeof(self.options.extraFieldsForQuery) == 'string') self.options.extraFieldsForQuery = [self.options.extraFieldsForQuery];
			for (var i=0; i < self.options.extraFieldsForQuery.length; i++) {
				var elem = _getById(self.options.extraFieldsForQuery[i]);
				if (elem && elem.value && elem.value.length > 0) {
					params[elem.value.split("=")[0]] = unescape(elem.value.split("=")[1]);
				}
			};
		}
		return params;
	}

	function _getUlHtml(list, liClass) {
		var listElements = "";
		for (var i = 0; i < list.length; i++) {
			var content;
			if(list[i]["header"] && list[i]["list"]) {
				content = '<span class="term">' + list[i].header + '</span>';
				if (list[i]["select"]) {
					var attributes = { "onmouseout": '_LT._deselect(this)', "onmouseover": '_LT._select(this)', "title": "", "class": liClass, 'data-score': (list[i].score ? list[i].score : 0) };
					attributes['data-' + self.options.select] = escape(list[i][self.options.select]);
					listElements += _newElementString('li', attributes, content + ' <span class="' + self.options.select + '" style="display:none;">' + list[i].select + "</span>");
				} else if(list[i]["deeplink"]) {
				  var attributes = { "deeplink": list[i].deeplink, "onmouseout": '_LT._deselect(this)', "onmouseover": '_LT._select(this)', "title": "", "class": liClass, 'data-score': (list[i].score ? list[i].score : 0)	};
				  attributes['data-' + self.options.select] = list[i][self.options.select];
					listElements += _newElementString('li', attributes, content);
				} else {
				  var attributes = { "title": "", "class": liClass + '_ns', 'data-score': (list[i].score ? list[i].score : 0) };
				  attributes['data-' + self.options.select] = list[i][self.options.select];
					listElements += _newElementString('li', attributes, content);
				}

				listElements +=	 _getUlHtml(list[i].list, liClass + '_sub');
				continue;
			}

			if(!(list[i]["term"]) && !(list[i]["header"])) continue;

			/* hightlighting */
			content = '<span class="term">' + (self.options.hl ? _highlightResult(list[i].term) : list[i].term) + "</span>";

			if (self.options.extraFields) {
				for (var o = self.options.extraFields.length - 1; o >= 0; o--){
					if (typeof(list[i][self.options.extraFields[o]]) != 'undefined') {
						content += " <span class='extra_" + self.options.extraFields[o] + "'>"
									+ list[i][self.options.extraFields[o]]
									+ "</span>"
					}
				};
			}

			if (self.options.select != 'term' && list[i][self.options.select]) {
				 content += ' <span class="'
				+ self.options.select
				+ '" style="display:none;">'
				+ list[i][self.options.select]
				+ "</span>"
			}
			var attributes = { 	"onmouseout": '_LT._deselect(this)',
													"onmouseover": '_LT._select(this)',
													"class": liClass
												}
			try {
				if (list[i].deeplink)	attributes["deeplink"] 	= list[i].deeplink;
				if (list[i].meta)	attributes["title"] 				= list[i].meta;
				if (list[i].select) attributes["data-select"] = list[i].select;
				if (list[i].query) attributes["data-query"]   = list[i].query;
				if (list[i].score) attributes["data-score"] 	= list[i].score;
				if (list[i][self.options.select]) attributes['data-' + self.options.select]       = escape(list[i][self.options.select]);

			} catch(err) {}

			listElements += _newElementString('li', attributes, content);
		 };

		if (self.options.snapping && self.options.snapping.showQueryAsSuggest) {
			var attributes = {
				'data-query': self.element.value,
				'data-term': self.element.value,
				"onmouseout": '_LT._deselect(this)',
				"onmouseover": '_LT._select(this)',
				'class': 'autocomplete_results'
			};
			listElements = _newElementString('li', attributes, "Nach '" + self.element.value + "' suchen")  + listElements;
		}

		return listElements;
	}

	self._results = function(result) {
	  // prevent rendering of results when inappropriate (e.g. when the input has been blurred or results have been clicked)
	  if (self.element.getAttribute("hasFocus") !== "true") return false;
	  // check if the call corresponds to the current input. Else dismiss
	  var filterPresent = (self.options.preprocess && typeof(LTFilter) != 'undefined' && typeof(LTFilter[self.options.preprocess]) != 'undefined'),
				query = _trim(filterPresent ? LTFilter[self.options.preprocess].call({ query: self.element.value }).query : self.element.value);
	  if (result.query && query != result.query) return false;

	  // Get result from cache
		//if (!self.cache[result.query]) self.cache[result.query] = result;

    self.resultElements = null;

		// postprecessing
		var filterPresent = (self.options.postprocess && typeof(LTFilter) != 'undefined' && typeof(LTFilter[self.options.postprocess]) != 'undefined');
		if (filterPresent) LTFilter[self.options.postprocess].call(result);
		if (result.suggests && result.suggests.length > 0) {
			if (self.element.value.match(/ $/)) {
				self.spaceTopMatch = result.suggests[0];
			}
			if (self.element.value.length - 1 - self.element.value.lastIndexOf(" ") > 3) {
				self.spaceTopMatch = null;
			}
			self.currentMaxScore = result.suggests[0].score;

			// inlineSuggestion
			var firstResult = result.suggests[0].header ? result.suggests[0].list[0] : result.suggests[0];
			if (self.options.displayInline) {
				if (firstResult.term.match(new RegExp("^" + self.element.value, 'i'))) {
					var content = "<span class='matching_part'>" + self.element.value + "</span>";
					content += "<span class='suggest_part'>" + firstResult.term.replace(new RegExp("^" + self.element.value, 'i'), '') + "</span>";
					//var inlineSuggestion = _newElementString('span', { "id": self.displayInlineId, "class": "inlineSuggestion" }, content);
					self.displayInlineElement.innerHTML = content;
					self.displayInlineElement.style.display = 'block';
				}
				else self.displayInlineElement.innerHTML = '';
			}

			var html = _getUlHtml(result.suggests, 'autocomplete_results');


			self.update.innerHTML = '';
			self.update.innerHTML = _newElementString('ul', { id: 'autocomplete_results' }, html);
			self.resultElements = self.update.firstChild.childNodes;

			_show();

			if (self.options.snapping) _autoSelect(result);
		}
		else if (typeof(result.suggests) === 'undefined') {}
		else self.update.style.display = 'none';
	}

	self.activate = function() { self.options.active = true; }
	self.deactivate = function() { self.options.active = false; }

	function _highlightResult(term) {
		if (!self.options.hl || self.options.hl == 'none') {
			return term;
		}
		else if (self.options.hl == 'words') {
			var regexp = new RegExp("(" + _trim(self.originalValue).replace(self.safeRegexp, "\\$1").split(/[^a-z0-9A-Z\u00c0-\u00d6\u00d8-\u00dd\u00df-\u00f6\u00f8-\u00fd\u00ff]+/).join('|').replace(/\|{2,}/g,"|").replace(/([\u00c0-\u00d6\u00d8-\u00dd\u00df-\u00f6\u00f8-\u00fd\u00ff]|[aou]e?|ss|[ceiy])/gi, function(match, $1) { return "(?:" + self.unicodeMap[$1] + ")" }) + ')', 'ig');
		}
		else if (self.options.hl == 'exact') {
			var regexp = new RegExp("(" + _trim(self.originalValue.replace(self.safeRegexp, "\\$1")
			          .replace(/([\u00c0-\u00d6\u00d8-\u00dd\u00df-\u00f6\u00f8-\u00fd\u00ff]|[aou]e?|ss|[ceiy])/gi, function(match, $1) {
			            return "(?:" + self.unicodeMap[$1] + ")"
			          })) + ')', 'ig');
		}
		return term.replace(regexp, "<span class=hl>$1</span>")
		           .replace(self.htmlRescueRegex, "$1$2")
		           .replace(self.htmlRescueRegex2, "$1$2$3");
	}

	function _url() {
		var host = (self.options.host.match(/^.*\:\/\//) ? self.options.host : "http://" + self.options.host) + (self.options.port ? ":" + self.options.port : '') ;
		return(host + self.options.url + "?jsoncallback=" + self.options.jsonCallback + (self.options.appendParams.length > 0 ? "&"+self.options.appendParams : "")  + "&");
	}

	function _newElement(tag, options, content) {
		var element = document.createElement(tag);
		for (option in options) {
			element.setAttribute(option, options[option]);
		}
		if (tag != 'script' && content) {
			var text = document.createTextNode(content);
			element.appendChild(text);
		}
		return element;
	}

	function _newElementString(tag, options, content) {
		var html = "<" + tag;
		for (option in options) {
			html += " " + option + "='" + options[option] + "'";
		}
		html += ">" + content + "</" + tag + ">";
		return html;
	}

	function _trim(text) {
		text = text.replace( /^\s+/g, "" );
		return text.replace( /\s+$/g, "" );
	}

	function _addEvent(evnt, elem, func) {
		elem = _getById(elem);
		if (elem.addEventListener)
			elem.addEventListener(evnt, func, false);
		else if (elem.attachEvent) {
			var r = elem.attachEvent("on" + evnt, func);
			return r;
		}
	}

	function _stopEvent(e) {
		if (e && e.stopPropogation) e.stopPropogation();
		else if (window.event && window.event.cancelBubble)
			window.event.cancelBubble = true;
		if (e &&e.preventDefault) e.preventDefault();
		else if (window.event && window.event.returnValue)
			window.event.returnValue = false;
	}

	function _eventElement(e) {
		var targ;
		if (!e) e = window.event;
		if (e.target) targ = e.target;
		else if (e.srcElement) targ = e.srcElement;
		if (targ.nodeType == 3) targ = targ.parentNode;
		return targ;
	}

	function _show() {
		self.update.style.display = 'block';
	}
	function _hide() {
		self.update.style.display = 'none';
		//self.element.blur();
	}



	function _stripTags(string) {
		return string.replace(/(<([^>]+)>)/ig,"");
	}

	function html_entity_decode(str) {
    var ta=document.createElement("textarea");
    ta.innerHTML=str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
    return ta.value;
  }

	function _addSnapping(options) {
		var snapOptions = options.snapping;
		if (options.snapping && options.snapping != 'false') {
			switch(options.snapping.mode) {
				case 'smart':
					self.options.snapping = { "minScore": 850,"minLength": 5,"maxLengthDifference": 0.2, peakMaxLengthDifference: 0.3, peakMinScore: 850, singleSelect: false,	peakSingleSelect: true };
					break;
				case 'simple':
				default:
					self.options.snapping = { "minScore": 920,"minLength": 5,"maxLengthDifference": 0.2, singleSelect: true,	peakSingleSelect: false };
					break;
			}
			if (snapOptions) {
				for(option in snapOptions) {
					self.options.snapping[option] = snapOptions[option];
				}
			}
			self.element.parentNode.insertBefore(_newElement('div', { id: 'snappedSelections', style: 'position: absolute;' }), self.element);
			self.snapContainer = _getById('snappedSelections');

		}
	}

	function _addEvents() {
		// event delegation
		_addEvent('blur', self.element, function(event) {
			setTimeout(_selectFirstOnBlur, 50);
			_fillOriginalOnSubmit();
			if (self.displayInlineElement) self.displayInlineElement.style.display = 'none';
			self.element.setAttribute("hasFocus", "false");
		});
		_addEvent('focus', self.element, function(event) {
			self.element.setAttribute("hasFocus", "true");
		});
		_addEvent('keyup', self.element, _onkeyup);
		_addEvent('keydown', self.element, _onkeydown);
		_addEvent('mousedown', self.update, function(event) {
		  self.justClicked = true;
			_fillOriginalOnSubmit();
			var element = _eventElement(event);
			/*if (element == self.element) {
				_show();
			}*/
			//else {
			while ( (element.tagName.toLowerCase() != 'li') && (element.tagName.toLowerCase() != 'body') ) element = element.parentNode;
			if (element.tagName.toLowerCase() == 'li') { //&& element.className == 'lt_selected'
				if(_getById(element).className.match(/_ns$/)) {
					return;
				}
				var url = element.getAttribute("deeplink");
				_submit(url, element, 'mouse');
				self.noActionOnBlur = true;
			}
			_hide();
			//}
		});
		/*if (self.formElement) {
			_addEvent('submit', self.formElement, function(event) {
			  if (self.submitForm) {
  			  log('post form')
			  }
			  else {
			    log('Submit')
  				_stopEvent(event);
  				self.submitForm = false;
			  }
			});
		}*/
		_addEvent('click', document.body, function(event) {
			if (self.update.style.display == 'block') {
			  var element = _eventElement(event);
			  while ( (element != self.update) && (element.tagName.toLowerCase() != 'body') ) element = element.parentNode;
  			if (element != self.update)
				_hide();
			}
		});
		if (self.options['snapping']) {
			_addEvent('click', self.snapContainer, function(event) {
				var target = _eventElement(event);
				if (target.className.match(/delete/)) {
					self.snapContainer.removeChild(target.parentNode);
					_adjustInputForSnaps();
					self.element.focus();

					_triggerSnap();

				}
			});
		}
	}

	function _triggerSnap() {
	  if (self.options['snapping']['onSnap'] && typeof(eval(self.options['snapping']['onSnap'])) == 'function') {
		  eval(self.options['snapping']['onSnap'])(self);
		}
	}

	function _fillOriginalOnSubmit() {
		if (!self.options.fillOriginalOnSubmit) return;
		var fillElem = _getById(self.options.fillOriginalOnSubmit);
		if (fillElem) {
			fillElem.value = self.originalValue;
		}
	}

	function _submit(url, element, eventType) {
		_fillOriginalOnSubmit();
		if (self.displayInlineElement) {
			self.displayInlineElement.style.display = 'none';
		}
		if (!url && !element && self.index >= 0) {
			url = self.resultElements[self.index].getAttribute("deeplink");
		}
		if (self.index >= 0 && !element && self.resultElements && self.resultElements.length > 0) element = self.resultElements[self.index];
		if (element && typeof(element) != 'string') {
			var value = _extractTerm(element);
			self.element.value = value;
			if (self.options.snapping) self.element.focus();
		}

		if (self.options.fillFieldOnSubmit && element) {
			var fillElem = _getById(self.options.fillFieldOnSubmit);
			if (fillElem) {
				fillElem.value = element.getAttribute('data-select');
			}
		}


		if (self.options['snapping'] && (element || self.index >= 0)) {
			var term = element ? _extractTerm(element) : _extractTerm(self.resultElements[self.index]),
			    query = element.getAttribute('data-query');
			self.addSnapElement(term, query);
		}
		if (self.options['onSubmit']) self.options['onSubmit'](eventType, element);
		if (url && url != "undefined") {
			window.location.href = url;
		} else if (self.formElement != null && self.options.submitFormOnSubmit) {
			self.formElement.submit();
		} else {
			_hide();
			return false;
		}
	}

	self.addSnapElement = function(term, query) {
	  self.snapContainer.innerHTML += _newElementString('div', { "data-query": query }, term + _newElementString('span', { "class": 'delete' }, 'x'));
		_adjustInputForSnaps();
		_triggerSnap();
	}

	function _selectFirstOnBlur(event, forceSubmit) {
    if (self.justClicked) {
      self.justClicked = false;
      return false;
    }
		//log('in', self.index)
	  if (self.options.selectFirstOnBlur && self.resultElements && self.resultElements.length > 0) {
			if (self.index == -1) {
				var element = 0;
				var foundPos = false;
				for (var i=1; i < self.resultElements.length; i++) {
					var oldScore = parseInt(self.resultElements[element].getAttribute('data-score')),
							newScore = parseInt(self.resultElements[i].getAttribute('data-score'));
					if(newScore > 0) {
					  //log(i)
						element = i;
						foundPos = true;
						break;
					}
					/*if (newScore > oldScore) {
						element = i;
					}*/

				};
				self.index = element;

				if((foundPos == false) || (self.resultElements[element].getAttribute('deeplink'))) {
					_deleteHiddenFieldValues();
					_hide();
					return;
				}
			}



			if (self.options.selectFirstOnBlurFlag) {
				var fillElem = _getById(self.options.selectFirstOnBlurFlag);
				if (fillElem) fillElem.value = "1";
			}

			_submit(null, null, 'blur');
			self.noActionOnBlur = false;
			//if (event) _stopEvent(event);
		}
	}

  // Public instance method
  // Builds a querystring from the snapped Elements
	self.queryStringFromSnaps = function() {
	  var fragments = [];
	  for (var i=0; i < self.snapContainer.childNodes.length; i++) {
	   fragments.push(self.snapContainer.childNodes[i].getAttribute('data-query'));
	  };
    return fragments.join("###");
  }


	function _adjustInputForSnaps() {
		_hide();
		self.element.value = "";
		self.originalValue = '';
		var inputDims = new ElementDimensions(self.element);
		var dimensions = new ElementDimensions(self.snapContainer);
		self.element.style.paddingLeft = dimensions.inner.width - 5 + "px";
		self.element.style.width = inputDims.inner.width - dimensions.inner.width + "px"
	}

	function _deselectElements(elements) {
		for (var i = elements.length - 1; i >= 0; i--){
			elements[i].className =	 elements[i].className.replace(/lt_selected_/, "");
		};
	}

	function _hideOrShowInlineSuggestion(index) {
		if (self.options.displayInline) {
			index = (typeof(index) != 'undefined') ? index : self.index;
			var sugg = _getById(self.displayInlineId);
			if (!sugg) return false;
			else {
				if (index == -1) {
					sugg.style.display = 'inline';
				}
				else {
					sugg.style.display = 'none';
				}
			}
		}
	}

	function _deleteLastSnappedSuggestion() {
		if (self.snapContainer && self.originalValue == "" && self.snapContainer.childNodes.length > 0) {
			self.snapContainer.removeChild(self.snapContainer.childNodes[self.snapContainer.childNodes.length - 1]);
			_adjustInputForSnaps();
			_triggerSnap();
		}
	}

	function _deleteHiddenFieldValues() {
		if (self.options.fillFieldOnSubmit) {
			_getById(self.options.fillFieldOnSubmit).value = '';
		}
	}

	function _autoSelect(result) {
		if (result && result.suggests && result.suggests.length > 0) {
			var r = result.suggests[0];

			var minScoreCheck 						= (self.options.snapping.minScore && (r.orthoscore ? r.orthoscore : r.score) > self.options.snapping.minScore),
					minLengthCheck 						= (self.options.snapping.minLength && self.element.value.length > self.options.snapping.minLength),
					maxLengthDifferenceCheck 	= (self.options.snapping.maxLengthDifference && _trim(self.element.value).length / _trim(r.term).length > (1 - self.options.snapping.maxLengthDifference)),
					singleSelectCheck 				= (self.options.singleSelect && result.suggests.length == 1) || !self.options.singleSelect;

			if (minScoreCheck && minLengthCheck && maxLengthDifferenceCheck && singleSelectCheck) _submit(null, self.resultElements[0], 'autoSelect');
			//log("minScore:" + minScoreCheck + ", minLengthCheck:" + minLengthCheck + ", maxLengthDifferenceCheck:" + maxLengthDifferenceCheck + ", singleSelectCheck:" + singleSelectCheck);

			if (self.spaceTopMatch && (self.options.snapping.peakMinScore || self.options.snapping.peakMaxLengthDifference || self.options.snapping.peakSingleSelect)) {
				var peakMinScoreCheck 						= (self.options.snapping.peakMinScore && (self.spaceTopMatch.orthoscore ? self.spaceTopMatch.orthoscore : self.spaceTopMatch.score) > self.options.snapping.peakMinScore),
						peakMaxLengthDifferenceCheck	= (self.options.snapping.peakMaxLengthDifference && _trim(self.element.value).length / _trim(self.spaceTopMatch.term).length > (1 - self.options.snapping.peakMaxLengthDifference)),
						peakSingleSelectCheck					= (self.options.snapping.peakSingleSelect && result.suggests.length == 1) || !self.options.snapping.peakSingleSelect;

        log("peakMinScoreCheck: " + peakMinScoreCheck + ", peakMaxLengthDifferenceCheck: " + peakMaxLengthDifferenceCheck + ", peakSingleSelect: " + peakSingleSelectCheck);

				if (peakMinScoreCheck && peakMaxLengthDifferenceCheck) {
				  var attributes = { 'data-query': self.spaceTopMatch.query };
				  attributes['data-' + self.options.select] = self.spaceTopMatch[self.options.select];
				  _submit(null, _newElement('div', attributes, self.spaceTopMatch.term), 'autoSelect');
			  }
			}

		}
	}

	function _onkeyup(event) {
		if (self.element.getAttribute("hasFocus") === "true") {

			//log(event.keyCode);
			switch(event.keyCode) {
				case 27: // ESC
					_hide();
					_stopEvent(event);
					ltIndex = -1;
					break;
				/*case 9: case 39: // Tab (9) and cursor right (39)
					if (self.index == -1) {
						if (event.keyCode == 39 && getCaretPos(self.element) != self.element.value.length) return false
						self.index = 0;
						_submit();
					}
					_stopEvent(event);
					break;*/
				case 38: // cursor up
					_stopEvent(event);
					_markPrevious();
					break;
				case 40: // cursor down
					_stopEvent(event);
					_markNext();
					break;
				case 8: // Backspace key
					/*_hideOrShowInlineSuggestion(0);*/
					if (self.element.value.length === 0) {
						self.displayInlineElement.style.display = 'none';
					}
					_deleteLastSnappedSuggestion();
					_deleteHiddenFieldValues();
					self.originalValue = self.element.value;
					if (self.originalValue.length == 0) {
						self.resultElements = null;
					}
					_search();
					break;
				case 46: // Delete key
					/*_hideOrShowInlineSuggestion(0);*/
					if (self.element.value.length === 0) {
						self.displayInlineElement.style.display = 'none';
					}
					_deleteLastSnappedSuggestion();
					_deleteHiddenFieldValues();
					self.originalValue = self.element.value;
					if (self.originalValue.length == 0) {
						self.resultElements = null;
					}
					_search();
					break;
				case 13: // Return key
				  _stopEvent(event);
					break;
				default:
					self.originalValue = self.element.value;
					_search();
					break;
			}
		}
		/*else {
			_search();
			if (self.element.getAttribute("hasFocus") === "true" && self.update.innerHTML.length == 0) {
				_show();
				_stopEvent(event);
			}
		}*/
	}

	function _onkeydown(event) {
		if (self.element.getAttribute("hasFocus") === "true") {
			switch(event.keyCode) {
				case 38: // Cursor up
					_stopEvent(event);
					break;
				case 40: // Cursor down
					_stopEvent(event);
					break;
				case 9: case 39: // Cancel Tab
					//if (self.index != -1) {
						if (event.keyCode == 39 && getCaretPos(self.element) != self.element.value.length) return false;
						_selectFirstOnBlur(event, true);
						_submit(null, null, 'tab');
						//self.index = 0;
						if (self.options.snapping) {
							_stopEvent(event);
						}
					//}
					break;
				case 8: // backspace
					var m;
					if (self.options.displayInline) {
						var m = self.displayInlineElement.children[0],
								n = self.displayInlineElement.children[1],
								a = m.innerHTML,
								b = n.innerHTML;
						m.innerHTML = a.substr(0, a.length - 1);
						n.innerHTML = a.substr(-1, 1) + b;
					}

					break;
				case 13: // Return Key
				  if (self.update.style.display == 'block') {
				    _stopEvent(event);
				    _selectFirstOnBlur(event, true);
						_submit(null, null, 'return');
						return false;
					}
					break;
				default:

					// hide inlineSuggestion if the new value does not match the current inlineSuggestion
					setTimeout(function() {
						if (self.options.displayInline && self.resultElements && self.resultElements.length > 0) {
							var element = self.resultElements[0].className.match(/_ns/) ? self.resultElements[1] : self.resultElements[0],
									value		= _trim(self.element.value);
							if (!(element.innerText).match(new RegExp("^" + value, 'i')) || value[value.length - 1] != element.innerText[value.length - 1]) {
								_getById(self.displayInlineId).innerHTML = '';
							}
						}
					}, 1);

					break;
			}
		}
	}

	function _markNext() {
		self.index = (self.index == self.resultElements.length -1) ? -1 : self.index + 1;
		_deselectElements(self.resultElements);
		_hideOrShowInlineSuggestion();
		if (self.index > -1) {
			if(_getById(self.resultElements[self.index]).className.match(/_ns$/)) _markNext();
			else {
				_LT._select(self.resultElements[self.index]);
				_show();
				self.element.value = _extractTerm(self.resultElements[self.index]);
			}
		}
/*		else if (self.fromElement == null) {
				self.index = 0;
				_LT._select(self.resultElements[self.index]);
		}*/
		else {
			self.element.value = self.originalValue;
		}
	}

	function _markPrevious() {
		self.index = (self.index == -1) ? self.resultElements.length -1	 : self.index - 1;
		_deselectElements(self.resultElements);
		_hideOrShowInlineSuggestion();
		if (self.index > -1) {
			if(_getById(self.resultElements[self.index]).className.match(/_ns$/)) _markPrevious();
			else {
				_LT._select(self.resultElements[self.index]);
				_show();
				self.element.value = _extractTerm(self.resultElements[self.index]);
			}
		}
/*		else if (self.fromElement == null) {
		self.index = 0;
		_LT._select(self.resultElements[self.index]);
		}*/
		 else {
			self.element.value = self.originalValue;
		}
		return false;
	};

	function _extractTerm(element) {
	  var html = unescape(element.getAttribute('data-' + self.options.select));
	  return html_entity_decode(_stripTags(html && html.length > 0 ? html : ''));
	}

	function getCaretPos(el) {
		var rng, ii=-1;
		if(typeof el.selectionStart=="number") {
			ii=el.selectionStart;
		} else if (document.selection && el.createTextRange){
			rng=document.selection.createRange();
			rng.collapse(true);
			rng.moveStart("character", -el.value.length);
			ii=rng.text.length;
		}
		return ii;
	}

	function _clearHiddenFields() {
		if (self.options.fillFieldOnSubmit) {
			_getById(self.options.fillFieldOnSubmit).value = '';
		}
	}

	/*document.onkeyup = function keyPress(event) {
		if (typeof(event) == "undefined") event = window.event;
		_onkeyup(event);
	}
	document.onkeydown = function keyPressDown(event) {
		if (typeof(event) == "undefined") event = window.event;
		_onkeydown(event);
	}*/

}


_LT._select = function(element) {
	_getById(element).className = 'lt_selected_' + _getById(element).className.replace(/lt_selected_/, "");
};
_LT._deselect = function(element) {
	_getById(element).className = _getById(element).className.replace(/lt_selected_/, "");
};

function _getById(element) {
	if (typeof(element) == 'string')
		return document.getElementById(element);
	else
		return element;
}


//get current dimensions and position of an element
//usage:   var dims = new ElementDimensions(elementToMeasure);
function ElementDimensions(elem)
{
	this.inner = {	//content and padding; gives 0 for inline elements (you can use scrollWidth/Height if it's inline)
		width: elem.clientWidth,
		height: elem.clientHeight
	};
	this.outer = {	//everything (content, padding, scrollbar, border)
		width: elem.offsetWidth,
		height: elem.offsetHeight
	};
	this.scroll = {
		//width & height of entire content field (including padding), visible or not
		//incorrect in Opera; it doesn't include the padding
		width: elem.scrollWidth,
		//if there are no scrollbars, IE gives the actual height of the content instead of the height of the element
		height: elem.scrollHeight<elem.clientHeight ? elem.clientHeight : elem.scrollHeight,

		//scroll position of content & padding
		left: elem.scrollLeft,
		top: elem.scrollTop
	};

	//position of element from the top-left corner of the document
	var tmp = elem;
	this.left = this.top = 0;
	while(tmp.offsetParent)
	{
		this.left += tmp.offsetLeft;
		this.top += tmp.offsetTop;
		tmp = tmp.offsetParent;
	}
}

var LTFilter = {}
window.LTFilter = LTFilter;

