// http://infocatcher.ucoz.net/js/cb/attrsInspector.js
// https://forum.mozilla-russia.org/viewtopic.php?id=56041
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Attributes_Inspector

// (c) Infocatcher 2010-2013
// version 0.6.2pre - 2013-07-01

//===================
// Attributes Inspector button for Custom Buttons
// (for "code" section)
// Also the code can be used from main window context (as Mouse Gestures code, for example)

// Usage:
//   Use middle-click or Ctrl + left-click (or press Ctrl+I) to inspect node in DOM Inspector
//   (additionally hold Shift key to enable pupup locker)
//   Hold Shift key to show and don't hide tooltips and popups
// Hotkeys:
//   Escape                - cancel or disable popup locker
//   Ctrl+Up, Ctrl+Down    - navigate to parent/child node
//   Ctrl+Left, Ctrl+Right - navigate to previous/next sibling node
//   Ctrl+Shift+C          - copy tooltip's contents

// For more developer tools see Extensions Developer Tools button:
//   http://infocatcher.ucoz.net/js/cb/extDevTools.js
//   https://forum.mozilla-russia.org/viewtopic.php?id=57296
//   https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Developer_Tools

// Icon: http://www.iconsearch.ru/detailed/278/2/
//===================

var _highlight = true; // Hightlight current node
var _highlightUsingFlasher = false; // Don't modify DOM, but has some side effects (and slower)
// Note: inIFlasher works in Firefox 4 and higher only with disabled hardware acceleration!
// See https://bugzilla.mozilla.org/show_bug.cgi?id=368608 and https://bugzilla.mozilla.org/show_bug.cgi?id=594299
var _borderColor = "red"; // Any valid CSS color
var _borderWidth = 1; // Border width in pixels
var _borderStyle = "solid"; // border-style property in CSS
// Note: doesn't work with _highlightUsingFlasher = true

// Highlight added/removed/changed attributes, any valid CSS color:
var _addedColor = "-moz-hyperlinktext";
var _removedColor = "grayText";
var _changedColor = "-moz-visitedhyperlinktext";

var _excludeChildTextNodes = 1;
// 0 - don't exclude
// 1 - exclude, if found element node
// 2 - always exclude
var _excludeSiblingTextNodes = false;

var _preferNotAnonymousChildNodes = false;
// true  - use not anonymous child nodes, if any (as in version 0.6.1pre and older)
// false - always try get real child nodes (may work wrong in Gecko < 7.0)

var _forbidTooltips = true; // Prevent all other tooltips
var _popupLocker = 1;
// Lock all popups in window while DOM Inspector is opened (or until Escape was not pressed)
// Values: 0 - disable, 1 - only if Shift pressed, 2 - always enable
var _showNamespaceURI = 2; // 0 - don't show, 1 - show as is, 2 - show pretty name instead of URI
var _showFullTree = 2; // 0 - current frame, 1 - top frame, 2 - topmost frame
var _nodePosition = 0.55; // Position of selected node in DOM Inspector's tree, 0..1 (-1 - don't change)

// Show debug messages in error console:
//var _debug = false;
var _debug = typeof event == "object" && event instanceof Event
	? event.shiftKey || event.ctrlKey || event.altKey || event.metaKey
	: false;

function _log() {
	if(!_debug)
		return _log = function() {};
	var cs = Components.classes["@mozilla.org/consoleservice;1"]
		.getService(Components.interfaces.nsIConsoleService);
	function ts() {
		var d = new Date();
		var ms = d.getMilliseconds();
		return d.toLocaleFormat("%M:%S:") + "000".substr(String(ms).length) + ms;
	}
	_log = function() {
		cs.logStringMessage("[Attributes Inspector]: " + ts() + " " + Array.map(arguments, String).join("\n"));
	};
	return _log.apply(this, arguments);
}

const _ns = "__attributesInspector";
var context = _ns in window && window[_ns] || (
	window[_ns] = {
		button: this instanceof XULElement && this.localName != "popupset" && this,
		checked: false,
		toggle: function() {
			toggle.call(context);
		},
		stop: function() {
			this.checked && this.toggle();
		}
	}
);
function ael(type, func, useCapture, target) {
	return (target || window).addEventListener(type, func, useCapture);
}
function rel(type, func, useCapture, target) {
	return (target || window).removeEventListener(type, func, useCapture);
}
function defineGetter(o, p, g) {
	defineGetter = "defineProperty" in Object // Firefox >= 4.0
		? function(o, p, g) {
			Object.defineProperty(o, p, {
				get: g,
				configurable: true,
				enumerable: true
			});
		}
		: function(o, p, g) {
			Object.__defineGetter__.call(o, p, g);
		};
	return defineGetter.apply(this, arguments);
}

context.toggle();

function toggle() {
	var checked = this.checked = !this.checked;
	var btn = this.button;
	if(btn) {
		btn.checked = checked;
		if(!checked) {
			var doc = btn.ownerDocument;
			(function uncheck() { // D'oh...
				for(var node = btn.parentNode; node != doc; node = node.parentNode) {
					if(!node) { // Node was removed from document
						_log("Button was removed from document");
						var toolboxes = doc.getElementsByTagName("toolbox");
						for(var i = 0, l = toolboxes.length; i < l; ++i) {
							var toolbox = toolboxes[i];
							if("palette" in toolbox && toolbox.palette) {
								var paletteBtns = toolbox.palette.getElementsByAttribute("id", btn.id);
								var paletteBtn = paletteBtns.length && paletteBtns[0];
								if(paletteBtn && paletteBtn.getAttribute("checked") == "true") {
									_log("Uncheck pallete button");
									paletteBtn.removeAttribute("checked");
									break;
								}
							}
						}
						return;
					}
				}
				//if(!doc.getElementById("wrapper-" + btn.id)) {
				if(btn.parentNode.localName != "toolbarpaletteitem") {
					if(btn.checked != checked) {
						btn.checked = checked;
						_log("Set checked state: " + checked);
						return;
					}
					_log("Button checked state is correct");
					return;
				}
				if(!uncheck.hasOwnProperty("_logged")) {
					uncheck._logged = true;
					_log("Button is wrapped, wait...");
				}
				doc.defaultView.setTimeout(uncheck, 20);
			})();
		}
	}
	if(checked)
		init.call(this);
	else
		destroy.call(this);
}
function init() {
	const ttId = this.ttId = "__attrsInspectorTooltip";
	var tt = this.tt = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "tooltip");
	tt.id = ttId;
	tt.setAttribute("orient", "vertical");
	//if("pointerEvents" in tt.style)
	//	tt.style.pointerEvents = "none";
	tt.setAttribute("mousethrough", "always");
	top.document.documentElement.appendChild(tt);

	// Resolve -moz-* and system colors (for copy tooltip contents feature)
	var tts = tt.style;
	var ttcs = top.getComputedStyle(tt, null);
	tts.color = _addedColor;
	_addedColor = ttcs.color;
	tts.color = _removedColor;
	_removedColor = ttcs.color;
	tts.color = _changedColor;
	_changedColor = ttcs.color;
	tts.color = "";

	if(!_highlightUsingFlasher) {
		this.hlAttrNS = "urn:attrsInspectorNS";
		this.hlAttr = "__attrs_inspector_highlighted__"; // Don't use caps here - works only in Firefox 4
		var sss = this.sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
			.getService(Components.interfaces.nsIStyleSheetService);
		var cssStr = '\
			/* Attributes Inspector highlight styles */\n\
			@namespace ains url("%ns%");\n\
			%priorityHack%[ains|%attr%="true"] {\n\
				outline: %borderWidth%px %borderStyle% %borderColor% !important;\n\
				outline-offset: -%borderWidth%px !important;\n\
			}'
			.replace(/%ns%/g, this.hlAttrNS)
			.replace(/%attr%/g, this.hlAttr)
			.replace(/%borderColor%/g, _borderColor)
			.replace(/%borderWidth%/g, _borderWidth)
			.replace(/%borderStyle%/g, _borderStyle)
			.replace(/%priorityHack%/g, (function() {
				var rnd = Math.random().toFixed(16).substr(2);
				var hack = "*|*";
				for(var i = 0; i < 16; ++i)
					hack += ":not(#__priorityHack__" + rnd + "__" + i + ")";
				return hack;
			})());
		var cssURI = this.cssURI = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService)
			.newURI("data:text/css," + encodeURIComponent(cssStr), null, null);
		if(!sss.sheetRegistered(cssURI, sss.AGENT_SHEET))
			sss.loadAndRegisterSheet(cssURI, sss.AGENT_SHEET);
		if(!sss.sheetRegistered(cssURI, sss.USER_SHEET))
			sss.loadAndRegisterSheet(cssURI, sss.USER_SHEET);
	}

	this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		.getService(Components.interfaces.nsIWindowMediator);
	this.setAllListeners = function(action) {
		var ws = this.wm.getEnumerator(null);
		while(ws.hasMoreElements())
			this.setListeners(action, ws.getNext());
	};
	this.setListeners = function(action, w) {
		var h = new this.evtHandler(w);

		action("mouseover", h, true, w);
		action("mousemove", h, true, w);
		action("mouseout",  h, true, w);

		action("draggesture", h, true, w);
		action("dragover",    h, true, w);
		action("dragexit",    h, true, w);

		action("keydown",   h, true, w);
		action("keypress",  h, true, w);
		action("keyup",     h, true, w);

		//if(action == rel || this.inspector) {
		action("mousedown", h, true, w);
		action("mouseup",   h, true, w);
		action("click",     h, true, w);
		//}

		action("popupshown", h, true, w);
		if(_forbidTooltips) {
			action("popupshowing", h, true, w);
			action("popuphiding",  h, true, w);
		}

		if(action == rel) {
			var ehg = this.evtHandlerGlobal;
			var hi = ehg._windows.indexOf(w);
			delete ehg._windows[hi];
			delete ehg._handlers[hi];
		}
	};
	this.ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
		.getService(Components.interfaces.nsIWindowWatcher);

	this.evtHandlerGlobal = {
		_handlers: [],
		_windows: [],
		context: this,
		window: window,
		_hl: null,
		_node: null,
		_nodes: [],
		handleEvent: function(e) {
			this[e.type + "Handler"](e);
		},
		e: function(nn) {
			return document.createElementNS("http://www.w3.org/1999/xhtml", nn);
		},
		s: function(v, tag) {
			var s = this.e(tag || "span");
			s.appendChild(document.createTextNode(v));
			return s;
		},
		getHeader: function(v, state) {
			var e = this.s(v, "strong");
			e.className = "attrsInspector-header";
			state && this.setState(e, state);
			return e;
		},
		get separator() {
			var sep = this._separator = this.s(" = ");
			sep.className = "attrsInspector-separator";
			defineGetter(this, "separator", function() {
				return this._separator.cloneNode(true);
			});
			return this.separator;
		},
		get space() {
			var sp = this._space = this.s(" ");
			sp.className = "attrsInspector-space";
			defineGetter(this, "space", function() {
				return this._space.cloneNode(true);
			});
			return this.space;
		},
		get colon() {
			var col = this._colon = this.s(": ");
			col.className = "attrsInspector-colon";
			defineGetter(this, "colon", function() {
				return this._colon.cloneNode(true);
			});
			return this.colon;
		},
		getValue: function(v, state) {
			var e = this.s(v);
			//e.style.whiteSpace = "pre";
			e.className = "attrsInspector-value";
			state && this.setState(e, state);
			return e;
		},
		setState: function(e, state) {
			if(state.isRemoved) {
				e.style.color = _removedColor;
				e.style.textDecoration = "line-through";
				e.className += " attrsInspector-removed";
			}
			if(state.isAdded) {
				e.style.color = _addedColor;
				e.className += " attrsInspector-added";
			}
			if(state.isChanged) { // Can be added and changed!
				e.style.color = _changedColor;
				e.className += " attrsInspector-changed";
			}
		},
		get overflowBox() {
			var overflowBox = this._overflowBox = this.e("div");
			overflowBox.style.overflow = "hidden";
			overflowBox.className = "attrsInspector-itemContainer";

			var item = this.e("div");
			item.style.lineHeight = "1.25";
			item.style.maxHeight = "12.5em";
			item.className = "attrsInspector-item";

			overflowBox.appendChild(item);

			defineGetter(this, "overflowBox", function() {
				return this._overflowBox.cloneNode(true);
			});
			return this.overflowBox;
		},
		getItem: function(header, value, separator, state) {
			var overflowBox = this.overflowBox;
			var item = overflowBox.firstChild;
			item.appendChild(this.getHeader(header, state));
			if(value) {
				item.appendChild(separator || this.separator);
				item.appendChild(this.getValue(value, state));
			}
			return overflowBox;
		},
		_setDataLast: [0, 0, 0, 0, 0],
		_setDataMinDelay: 5*150,
		_setDataScheduled: false,
		setDataProxy: function(node) {
			if(this._setDataScheduled)
				return;
			var dt = this._setDataLast[0] + this._setDataMinDelay - Date.now();
			if(dt > 0) {
				this._setDataScheduled = true;
				this.timer(function(node) {
					if(node == this._node) {
						this.setData.apply(this, arguments);
						this.setDataProxyTime();
					}
					this._setDataScheduled = false;
				}, this, dt, arguments);
				return;
			}
			this.setData.apply(this, arguments);
			this.setDataProxyTime();
		},
		setDataProxyTime: function() {
			var a = this._setDataLast;
			a.push(Date.now());
			a.shift();
		},
		_hasData: false,
		setData: function(node) {
			var tt = this.context.tt;
			this._hasData = true;

			//while(tt.hasChildNodes())
			//	tt.removeChild(tt.lastChild);
			tt.textContent = "";
			// Firefox sometimes sets width/height to limit very huge tooltip
			tt.removeAttribute("width");
			tt.removeAttribute("height");

			var df = tt.ownerDocument.createDocumentFragment();

			if(node.nodeType == node.DOCUMENT_NODE) {
				df.appendChild(this.getItem(node.nodeName));
				df.appendChild(this.getItem("documentURI", node.documentURI));
				node.title && df.appendChild(this.getItem("title", node.title));
				tt.appendChild(df);
				return;
			}

			var rect = this.getRect(node);
			var w = rect && rect.width;
			var h = rect && rect.height;
			if(!w && !h)
				df.appendChild(this.getItem(node.nodeName));
			else {
				if(Math.floor(w) != w)
					w = w.toFixed(3);
				if(Math.floor(h) != h)
					h = h.toFixed(3);
				df.appendChild(this.getItem(node.nodeName, "[" + w + "\xd7" + h + "]", this.space));
			}

			var nodeNS = node.namespaceURI;
			if(_showNamespaceURI/* && node.nodeName.indexOf(":") == -1*/)
				df.appendChild(this.getItem("namespaceURI", this.getNS(nodeNS), this.colon));

			var win = node.ownerDocument.defaultView;
			if(node instanceof win.Element) {
				var cs = win.getComputedStyle(node, null);
				var dirs = ["Top", "Right", "Bottom", "Left"];
				var getMargins = function(prop, propAdd) {
					if(!propAdd)
						propAdd = "";
					var margins = dirs.map(function(dir, i) {
						var margin = cs[prop + dir + propAdd];
						if(margin == "0px")
							return "0";
						if(/\.\d{4,}px$/.test(margin))
							return parseFloat(margin).toFixed(3) + "px";
						return margin;
					});
					if(margins[0] == margins[2] && margins[1] == margins[3]) {
						if(margins[0] == margins[1])
							return margins[0];
						return margins[0] + " " + margins[1];
					}
					return margins.join(" ");
				}
				var boxSizing = "boxSizing" in cs ? cs.boxSizing : cs.MozBoxSizing;
				var boxSizingNote = " *box-sizing";
				var styles = {
					margin: getMargins("margin"),
					border: getMargins("border", "Width") + (
						boxSizing == "border-box"
							&& nodeNS != "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
						? boxSizingNote
						: ""
					),
					padding: getMargins("padding")
						+ (boxSizing == "padding-box" ? boxSizingNote : "")
				};
				var prevStyles = this.prevStyles;
				var changedStyles = this.changedStyles;
				for(var p in prevStyles)
					if(styles[p] != prevStyles[p])
						changedStyles[p] = true;
				for(var p in styles)
					prevStyles[p] = styles[p];
				df.appendChild(this.getItem("margin", styles.margin, this.colon, {
					isChanged: "margin" in changedStyles
				}));
				df.appendChild(this.getItem("border", styles.border, this.colon, {
					isChanged: "border" in changedStyles
				}));
				df.appendChild(this.getItem("padding", styles.padding, this.colon, {
					isChanged: "padding" in changedStyles
				}));
			}

			if(!node.attributes) {
				df.appendChild(this.getItem("nodeValue", node.nodeValue, this.colon));
				tt.appendChild(df);
				return;
			}

			var topAttrs = ["id", "class"].reverse();
			if(this._node) {
				var addedAttrs   = this.addedAttrs;
				var removedAttrs = this.removedAttrs;
				var changedAttrs = this.changedAttrs;
			}
			else {
				addedAttrs = removedAttrs = changedAttrs = { __proto__: null };
			}

			var attrs = Array.slice(node.attributes);
			for(var name in removedAttrs)
				attrs.push(removedAttrs[name]);

			attrs.sort(function(a, b) {
				a = a.name;
				b = b.name;
				var ai = topAttrs.indexOf(a);
				var bi = topAttrs.indexOf(b);
				if(ai != -1 || bi != -1)
					return bi - ai;
				return a > b;
			}).forEach(function(attr) {
				var name = attr.name;
				var val = attr.value;
				var ns = attr.namespaceURI;
				if(!_highlightUsingFlasher) {
					if(name == this.context.hlAttr && ns == this.context.hlAttrNS)
						return;
					if(this.noStyles && name == "style") {
						val = val
							.replace(
								"outline-color: " + _borderColor + "; "
									+ "outline-style: " + _borderStyle + "; "
									+ "outline-width: " + _borderWidth + "px; "
									+ "outline-offset: -" + _borderWidth + "px;",
								""
							)
							.replace(/^ | $/g, "");
						if(!val)
							return;
					}
				}
				if(_showNamespaceURI && ns && ns != nodeNS && name.indexOf(":") == -1)
					name += " [" + this.getNS(ns) + "]";
				df.appendChild(this.getItem(name, val, this.separator, {
					isAdded:   name in addedAttrs && addedAttrs[name] == ns,
					isChanged: name in changedAttrs && changedAttrs[name] == ns,
					isRemoved: name in removedAttrs && removedAttrs[name].namespaceURI == ns
				}));
			}, this);
			tt.appendChild(df);
		},
		getRect: function(node) {
			if(!(node instanceof Element)) try {
				var rng = node.ownerDocument.createRange();
				rng.selectNodeContents(node);
				node = rng;
			}
			catch(e) {
				Components.utils.reportError(e);
			}
			try {
				var rect = "getBoundingClientRect" in node
					? node.getBoundingClientRect()
					: node instanceof XULElement
						? node.boxObject
						: node.ownerDocument && "getBoxObjectFor" in node.ownerDocument
							&& node.ownerDocument.getBoxObjectFor(node);
			}
			catch(e) {
			}
			if(rect && !("width" in rect)) {
				rect.width = rect.right - rect.left;
				rect.height = rect.bottom - rect.top;
			}
			return rect;
		},
		getScreenRect: function(node) {
			var win = node.ownerDocument.defaultView;
			var scale = 1;
			try {
				var utils = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIDOMWindowUtils);
				scale = utils.screenPixelsPerCSSPixel || 1;
			}
			catch(e) {
				Components.utils.reportError(e);
			}

			if("getBoundingClientRect" in node) {
				var rect = node.getBoundingClientRect();
				return {
					x: rect.left*scale,
					y: rect.top*scale,
					screenX: (rect.left + win.mozInnerScreenX)*scale,
					screenY: (rect.top + win.mozInnerScreenY)*scale,
					width: (rect.right - rect.left)*scale,
					height: (rect.bottom - rect.top)*scale
				};
			}

			try {
				var bo = node instanceof XULElement && node.boxObject
					|| node.ownerDocument && "getBoxObjectFor" in node.ownerDocument
						&& node.ownerDocument.getBoxObjectFor(node);
			}
			catch(e) {
			}
			if(bo) {
				if(!("width" in bo)) {
					bo.width = bo.right - bo.left;
					bo.height = bo.bottom - bo.top;
				}
				return {
					x: bo.x*scale,
					y: bo.y*scale,
					screenX: bo.screenX*scale,
					screenY: bo.screenY*scale,
					width: bo.width*scale,
					height: bo.height*scale
				};
			}
			return null;
		},
		isNodeVisible: function(node, rect) {
			if(!rect)
				rect = this.getRect(node);
			if(rect.width == 0 && rect.height == 0)
				return false;
			for(var p = node; p; p = p.parentNode) {
				if(
					p instanceof XULElement
					&& (p.localName == "menupopup" || p.localName == "popup")
					&& "state" in p
					&& p.state == "closed"
				)
					return false;
			}
			return true;
		},
		getNS: function(ns) {
			if(_showNamespaceURI == 1)
				return ns;
			switch(ns) {
				case "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul": return "XUL";
				case "http://www.w3.org/1999/xhtml":                                  return "XHTML";
				case "http://www.mozilla.org/xbl":                                    return "XBL";
				case "http://www.w3.org/2000/svg":                                    return "SVG";
				case "http://www.w3.org/1998/Math/MathML":                            return "MathML";
				case "http://www.w3.org/1999/xlink":                                  return "XLink";
				case "http://www.w3.org/2000/xmlns/":                                 return "XMLNS";
				case "http://www.w3.org/XML/1998/namespace":                          return "XML";
				case "http://www.w3.org/1999/XSL/Transform":                          return "XSLT";
				case "http://www.w3.org/1999/02/22-rdf-syntax-ns":                    return "RDF";
				case "http://www.w3.org/2001/xml-events":                             return "XML Events";
			}
			return String(ns); // Can be null for #text
		},
		stop: function() {
			this.context.stop();
		},
		canInspect: function(e) {
			var noMdf = /*!e.shiftKey && */!e.altKey && !e.metaKey;
			if(!_forbidTooltips && e.shiftKey)
				return false;
			return e.button == 1 && noMdf && !e.ctrlKey // Middle-click
			    || e.button == 0 && noMdf &&  e.ctrlKey; // Ctrl + left-click
		},
		get appInfo() {
			delete this.appInfo;
			return this.appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
				.getService(Components.interfaces.nsIXULAppInfo);
		},
		get fxVersion() {
			var pv = this.appInfo.platformVersion;
			var vc = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
				.getService(Components.interfaces.nsIVersionComparator);
			var v;
			if(vc.compare(pv, "5.0a1pre") >= 0)
				v = parseFloat(pv);
			else if(vc.compare(pv, "2.0a1pre") >= 0)
				v = 4.0;
			else if(vc.compare(pv, "1.9.2a1pre") >= 0)
				v = 3.6;
			else if(vc.compare(pv, "1.9.1a1pre") >= 0)
				v = 3.5;
			else if(vc.compare(pv, "1.9a1pre") >= 0)
				v = 3.0;
			else if(vc.compare(pv, "1.8.1a1pre") >= 0)
				v = 2.0;
			else //if(vc.compare(pv, "1.8a1pre") >= 0)
				v = 1.5;
			delete this.fxVersion;
			return this.fxVersion = v;
		},
		get noStyles() {
			delete this.noStyles;
			//return this.noStyles = this.fxVersion < 3;
			return this.noStyles = Components.ID("{41d979dc-ea03-4235-86ff-1e3c090c5630}")
				.equals(Components.interfaces.nsIStyleSheetService);
		},
		stopEvent: function(e) {
			e.preventDefault();
			e.stopPropagation();
			"stopImmediatePropagation" in e && e.stopImmediatePropagation();
			//_log("stopEvent: " + e.type);
		},
		_timers: { __proto__: null },
		_timersCounter: 0,
		timer: function(callback, context, delay, args) {
			var id = ++this._timersCounter;
			var _timers = this._timers;
			var timer = _timers[id] = Components.classes["@mozilla.org/timer;1"]
				.createInstance(Components.interfaces.nsITimer);
			timer.init({
				observe: function(subject, topic, data) {
					delete _timers[id];
					callback.apply(context, args);
				}
			}, delay || 0, timer.TYPE_ONE_SHOT);
			return id;
		},
		cancelTimer: function(id) {
			var _timers = this._timers;
			if(id in _timers) {
				_timers[id].cancel();
				delete _timers[id];
			}
		},
		destroyTimers: function() {
			var _timers = this._timers;
			for(var id in _timers)
				_timers[id].cancel();
			this._timers = { __proto__: null };
			this._timersCounter = 0;
		},
		get flasher() {
			var flasher = Components.classes["@mozilla.org/inspector/flasher;1"]
				.getService(Components.interfaces.inIFlasher);
			flasher.color = _borderColor;
			flasher.thickness = _borderWidth;
			flasher.invert = false;

			delete this.flasher;
			return this.flasher = flasher;
		},
		hl: function(node) {
			if(!_highlight)
				return;
			this.unhl(); // Only one highlighted node
			if(!("setAttributeNS" in node))
				return;
			this._hl = node;

			if(_highlightUsingFlasher) {
				this.flasher.drawElementOutline(node);
				this._hlInterval = node.ownerDocument.defaultView.setInterval(function(_this) {
					_this.flasher.drawElementOutline(node);
				}, 10, this);
				return;
			}

			if(this.noStyles) {
				this._oldStyle = node.hasAttribute("style") && node.getAttribute("style");
				node.style.outline = _borderWidth + "px " + _borderStyle + " " + _borderColor;
				node.style.outlineOffset = "-" + _borderWidth + "px";
				//return;
			}
			node.setAttributeNS(this.context.hlAttrNS, this.context.hlAttr, "true");
		},
		unhl: function() {
			var node = this._hl;
			if(!node)
				return;
			this._hl = null;
			try {
				if(!("removeAttributeNS" in node))
					return;
			}
			catch(e) { // TypeError: can't access dead object
				return;
			}

			if(_highlightUsingFlasher) {
				var win = node.ownerDocument.defaultView;
				win.clearInterval(this._hlInterval);
				this.flasher.repaintElement(node);
				//this.flasher.repaintElement(node.ownerDocument.documentElement);
				this.flasher.repaintElement(this.getTopWindow(win.top).document.documentElement);
				return;
			}

			if(this.noStyles) {
				if(this._oldStyle || this._oldStyle === "")
					node.setAttribute("style", this._oldStyle);
				else
					node.removeAttribute("style");
				//return;
			}
			node.removeAttributeNS(this.context.hlAttrNS, this.context.hlAttr);
		},

		get mutationObserver() {
			var _this = this;
			function callback() {
				_this.handleMutations.apply(_this, arguments);
			}
			delete this.mutationObserver;
			return this.mutationObserver = "MutationObserver" in this.window // Firefox 14+
				&& new this.window.MutationObserver(callback);
		},
		watchAttrs: function(node) {
			this.unwatchAttrs(); // Only one watched node
			this._node = node;

			this.addedAttrs   = { __proto__: null };
			this.removedAttrs = { __proto__: null };
			this.changedAttrs = { __proto__: null };

			var mo = this.mutationObserver;
			if(mo) {
				// http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#mutation-observers
				mo.observe(node, {
					attributes: true,
					attributeOldValue: true
				});
				return;
			}
			// Legacy version
			if(this.fxVersion != 2)
				var aw = this;
			else { // Hack for Firefox 2.0
				var aw = this._attrsWatcher = {
					parent: this,
					handleEvent: function(e) {
						this.parent.DOMAttrModifiedHandler(e);
					}
				};
			}
			ael("DOMAttrModified", aw, true, node);
		},
		unwatchAttrs: function() {
			if(!this._node)
				return;
			var mo = this.mutationObserver;
			if(mo)
				mo.disconnect();
			else
				rel("DOMAttrModified", this._attrsWatcher || this, true, this._node);
			this._node = this._attrsWatcher = null;
			this.addedAttrs = this.removedAttrs = this.changedAttrs = null;
		},
		handleMutations: function(mutations) {
			mutations.forEach(function(mutation) {
				var node = mutation.target;
				if(mutation.type != "attributes" || node != this._node)
					return;
				var attrName = mutation.attributeName;
				var attrNS = mutation.attributeNamespace;
				var oldVal = mutation.oldValue;
				var isAdded = oldVal === null;
				var isRemoved = !node.hasAttributeNS(attrNS, attrName);
				this.handleMutation(attrName, attrNS, isAdded, isRemoved, oldVal);
			}, this);
			this.setDataProxy(this._node);
		},
		DOMAttrModifiedHandler: function(e) {
			if(e.originalTarget != this._node) // Ignore mutations in child nodes
				return;
			this.handleMutation(
				e.attrName,
				e.relatedNode && e.relatedNode.namespaceURI || null,
				e.attrChange == e.ADDITION,
				e.attrChange == e.REMOVAL,
				e.prevValue
			);
			this.setDataProxy(this._node);
		},
		handleMutation: function(attrName, attrNS, isAdded, isRemoved, oldValue) {
			if(isAdded) {
				this.addedAttrs[attrName] = attrNS;
				delete this.removedAttrs[attrName];
				delete this.changedAttrs[attrName];
			}
			else if(isRemoved) {
				this.removedAttrs[attrName] = {
					name: attrName,
					value: oldValue,
					namespaceURI: attrNS
				};
				delete this.addedAttrs[attrName];
				delete this.changedAttrs[attrName];
			}
			else {
				this.changedAttrs[attrName] = attrNS;
				delete this.removedAttrs[attrName]; // ?
			}
		},

		setClipboardData: function(dataObj, sourceWindow, clipId) {
			var ta = Components.classes["@mozilla.org/widget/transferable;1"]
				.createInstance(Components.interfaces.nsITransferable);
			if(sourceWindow && "init" in ta) {
				// The clipboard will be cleared when private browsing mode ends
				var privacyContext = sourceWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIWebNavigation)
					.QueryInterface(Components.interfaces.nsILoadContext);
				ta.init(privacyContext);
			}
			for(var flavor in dataObj) if(dataObj.hasOwnProperty(flavor)) {
				var value = dataObj[flavor];
				var str = Components.classes["@mozilla.org/supports-string;1"]
					.createInstance(Components.interfaces.nsISupportsString);
				str.data = value;
				ta.addDataFlavor(flavor);
				ta.setTransferData(flavor, str, value.length * 2);
			}
			var cb = Components.classes["@mozilla.org/widget/clipboard;1"]
				.getService(Components.interfaces.nsIClipboard);
			cb.setData(ta, null, clipId === undefined ? cb.kGlobalClipboard : clipId);
		},
		_noMouseover: false,
		_noMouseoverTimer: -1,
		mouseoverHandler: function(e) {
			if(this._noMouseover)
				return;
			var node = e.originalTarget;
			if(node == this.context.tt)
				return;
			this._nodes = [node];
			this.handleNodeFromEvent(node, e);
		},
		handleNodeFromEvent: function(node, e) {
			this.hl(node);
			if(node != this._node) {
				this.prevStyles    = { __proto__: null };
				this.changedStyles = { __proto__: null };
			}
			this.setData(node);
			this.watchAttrs(node);
			this.mousemoveHandler(e);
		},
		handleNode: function(node) {
			// Tooltip with big height -> wrongly under cursor -> reposition -> mouseover
			// And setTimeout() in parent window fail for modal child window
			if(this._noMouseover)
				this.cancelTimer(this._noMouseoverTimer);
			this._noMouseover = true;

			this.handleNodeFromEvent(node);

			this._noMouseoverTimer = this.timer(function() {
				this._noMouseover = false;
				this._noMouseoverTimer = null;
			}, this, 200);
		},
		mousemoveHandler: function(e) {
			var tt = this.context.tt;

			if(!this._hasData) {
				this.mouseoverHandler(e);
				return;
			}

			var x, y;
			if(e) {
				x = e.screenX;
				y = e.screenY;
				if(
					"_lastScreenX" in this
					&& x == this._lastScreenX
					&& y == this._lastScreenY
				)
					return;

				this._lastScreenX = x;
				this._lastScreenY = y;

				this._shiftKey = e.shiftKey;
			}
			else {
				x = this._lastScreenX || 0;
				y = this._lastScreenY || 0;
			}

			var fxVersion = this.fxVersion;

			if(fxVersion <= 2) {
				// Ugly workaround...
				var text = Array.map(tt.childNodes, function(node) {
					return node.textContent;
				}).join("\n");
				//while(tt.hasChildNodes())
				//	tt.removeChild(tt.lastChild);
				tt.textContent = "";
				var d = this.e("div");
				d.style.whiteSpace = "-moz-pre-wrap";
				d.textContent = text;
				tt.height = null;
				tt.appendChild(d);
				tt.height = tt.boxObject.height;
			}

			if("openPopupAtScreen" in tt) // Firefox 3.0+
				tt.openPopupAtScreen(x, y, false /*isContextMenu*/);
			else
				tt.showPopup(document.documentElement, x, y, "tooltip", null, null);

			if(fxVersion <= 2)
				return;
			if(fxVersion <= 3.5) {
				x = Math.min(screen.width  - tt.boxObject.width,  x);
				y = Math.min(screen.height - tt.boxObject.height, y);
				var debo = document.documentElement.boxObject;
				x += debo.screenX;
				y += debo.screenY;
			}
			if(fxVersion != 3.6)
				y += 22;
			tt.moveTo(x, y);
		},
		mouseoutHandler: function(e) {
			if(!e.relatedTarget)
				this.context.tt.hidePopup();
			this.unwatchAttrs();
			this.unhl();
		},
		draggestureHandler: function(e) {
			this.makeTooltipTopmost();
			_log(e.type + " => make tooltip topmost");
		},
		dragoverHandler: function(e) {
			var node = e.originalTarget || e.target;
			if(node != this._node)
				this.mouseoverHandler(e);
			else
				this.mousemoveHandler(e);
		},
		dragexitHandler: function(e) {
			if(!e.relatedTarget && this._node)
				this.mouseoutHandler(e);
		},
		keydownHandler: function(e) {
			this._shiftKey = e.shiftKey;
			this.keypressHandler.apply(this, arguments);
		},
		keyupHandler: function(e) {
			this._shiftKey = e.shiftKey;
			this.keypressHandler.apply(this, arguments);
		},
		keypressHandler: function(e, top) {
			// See https://github.com/Infocatcher/Custom_Buttons/issues/12
			// keydown  => stopEvent() + hetkey action in Firefox >= 25
			// keypress => stopEvent() + hetkey action in Firefox < 25
			// keyup    => stopEvent()
			var onlyStop = this.fxVersion < 25
				? e.type == "keydown" || e.type == "keyup"
				: e.type == "keypress" || e.type == "keyup";
			//_log(e.type + ": keyCode: " + e.keyCode + " charCode: " + e.charCode);
			if(e.keyCode == e.DOM_VK_ESCAPE) {
				this.stopEvent(e);
				if(onlyStop)
					return;
				this.stopSingleEvent(top, "keyup");
				this.stop();
				return;
			}
			var ctrlOrCtrlShift = (e.ctrlKey || e.metaKey) && !e.altKey;
			var ctrl      = ctrlOrCtrlShift && !e.shiftKey;
			var ctrlShift = ctrlOrCtrlShift &&  e.shiftKey;
			if(!ctrlOrCtrlShift)
				return;

			if(!_forbidTooltips)
				ctrlOrCtrlShift = ctrl;

			if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_UP) { // Ctrl+Up
				this.stopEvent(e);
				if(!onlyStop)
					this.navigateUp(top);
			}
			else if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_DOWN) { // Ctrl+Down
				this.stopEvent(e);
				if(!onlyStop)
					this.navigateDown();
			}
			if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_RIGHT) { // Ctrl+Right
				this.stopEvent(e);
				if(!onlyStop)
					this.navigateNext(top);
			}
			else if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_LEFT) { // Ctrl+Left
				this.stopEvent(e);
				if(!onlyStop)
					this.navigatePrev(top);
			}
			else if( // Ctrl+Shift+C
				ctrlShift && (
					e.keyCode == e.DOM_VK_C // keydown || keyup
					|| e.keyCode == 0 && String.fromCharCode(e.charCode).toUpperCase() == "C" // keypress
				)
			) {
				this.stopEvent(e);
				if(!onlyStop)
					this.copyTootipContent();
			}
			else if( // Ctrl+I, Ctrl+Shift+I
				ctrlOrCtrlShift && (
					e.keyCode == e.DOM_VK_I // keydown || keyup
					|| e.keyCode == 0 && String.fromCharCode(e.charCode).toUpperCase() == "I" // keypress
				)
			) {
				this._checkPreventDefault(e);
				this.stopEvent(e);
				if(onlyStop)
					return;
				this.stopSingleEvent(top, "keyup");
				var nodes = this._nodes;
				nodes.length && this.inspect(nodes[0], top, e.shiftKey);
			}
		},
		navigateUp: function(top) {
			var nodes = this._nodes;
			var node = nodes.length && this.getParentNode(nodes[0], top);
			if(node) {
				nodes.unshift(node);
				this.handleNode(node);
			}
		},
		navigateDown: function() {
			var nodes = this._nodes;
			if(nodes.length > 1) {
				nodes.shift();
				this.handleNode(nodes[0]);
			}
			else if(nodes.length == 1) {
				var node = nodes[0];
				var childs = this.getChildNodes(node);
				if(!childs)
					return;
				var child;
				for(var i = 0, l = childs.length; i < l; ++i) {
					var ch = childs[i];
					if(!_excludeChildTextNodes || ch instanceof Element) {
						child = ch;
						break;
					}
				}
				if(!child && _excludeChildTextNodes == 1 && l)
					child = childs[0];
				if(child) {
					this._nodes = [child];
					this.handleNode(child);
				}
			}
		},
		navigateNext: function(top) {
			this.navigateSibling(true, top);
		},
		navigatePrev: function(top) {
			this.navigateSibling(false, top);
		},
		navigateSibling: function(toNext, top) {
			var nodes = this._nodes;
			if(!nodes.length)
				return;
			var node = nodes[0];
			//var sibling = node;
			//do sibling = toNext ? sibling.nextSibling : sibling.previousSibling;
			//while(_excludeSiblingTextNodes && sibling && !(sibling instanceof Element));
			var parent = this.getParentNode(node, top);
			var siblings = parent && this.getChildNodes(parent, node);
			if(!siblings || siblings.length < 2)
				return;
			var max = siblings.length - 1;
			var pos = Array.indexOf(siblings, node);
			if(pos == -1)
				return;
			var shift = toNext ? 1 : -1;
			var sibling;
			for(var i = pos + shift; ; i += shift) {
				/* Uncomment to use cycle navigation
				if(i < 0)
					i = max;
				else if(i > max)
					i = 0;
				if(i == pos)
					break;
				*/
				if(i < 0 || i > max)
					break;
				var sb = siblings[i];
				if(sb && (!_excludeSiblingTextNodes || sb instanceof Element)) {
					sibling = sb;
					break;
				}
			}
			if(!sibling)
				return;
			// Update screen position for mousemoveHandler()
			var rect = this.getScreenRect(sibling);
			if(
				rect
				&& (this.fxVersion < 3 || this.fxVersion > 3.5)
				&& this.isNodeVisible(sibling, rect) // Wrong coordinates for hidden nodes
			) {
				var x = rect.screenX;
				var y = rect.screenY + rect.height;
				if(x != undefined && y != undefined) {
					this._lastScreenX = x;
					this._lastScreenY = y - 22 + 8;
				}
			}
			this._nodes = [sibling];
			this.handleNode(sibling);
		},
		get dwu() {
			delete this.dwu;
			return this.dwu = Components.classes["@mozilla.org/inspector/dom-utils;1"]
				.getService(Components.interfaces.inIDOMUtils);
		},
		getParentNode: function(node, top) {
			var pn = this.dwu.getParentForNode(node, true);
			if(!pn && node.nodeType == Node.DOCUMENT_NODE && node != top.document)
				pn = this.getParentFrame(node, top.document); // Only for Firefox 1.5
			return pn;
		},
		getTopWindow: function(window) {
			for(;;) {
				var browser = this.dwu.getParentForNode(window.document, true);
				if(!browser)
					break;
				window = browser.ownerDocument.defaultView.top;
			}
			return window;
		},
		getChildNodes: function(node, child) {
			if(_preferNotAnonymousChildNodes) {
				var childNodes = node.childNodes;
				if(!childNodes.length && "getAnonymousNodes" in node.ownerDocument)
					childNodes = node.ownerDocument.getAnonymousNodes(node);
				return childNodes;
			}
			var dwu = this.dwu;
			if("getChildrenForNode" in dwu) // Gecko 7.0+
				return dwu.getChildrenForNode(node, true);
			var childNodes = node instanceof XULElement
				&& "getAnonymousNodes" in node.ownerDocument
				&& node.ownerDocument.getAnonymousNodes(node)
				|| node.childNodes;
			// We can't get child nodes of anonymous node...
			if(!childNodes || !childNodes.length) {
				if(!child)
					child = node.firstChild;
				if(!child) { // Get nearest not anonymous parent
					for(var p = node.parentNode; p; p = p.parentNode)
						if(p.childNodes.length)
							return p.childNodes;
				}
				if(child) {
					var childNodes = [child];
					var sibling = child;
					while((sibling = sibling.previousSibling))
						childNodes.unshift(sibling);
					sibling = child;
					while((sibling = sibling.nextSibling))
						childNodes.push(sibling);
				}
			}
			return childNodes;
		},
		copyTootipContent: function() {
			var node = this._node;
			var sourceWindow = node && (node.ownerDocument || node).defaultView;
			var tt = this.context.tt;
			var text = Array.map(tt.childNodes, function(node) {
				return node.textContent;
			}).join("\n");
			var _tt = tt.cloneNode(true);
			Array.forEach(_tt.getElementsByAttribute("class", "attrsInspector-value"), function(elt) {
				elt.style.whiteSpace = "pre";
			});
			if(_tt.firstChild.style.whiteSpace == "-moz-pre-wrap") // Part of hack for Firefox 1.5 and 2.0
				_tt.firstChild.style.whiteSpace = "pre";
			var html = Array.map(_tt.childNodes, function(node) {
				return new XMLSerializer().serializeToString(node);
			}).join("\n");
			this.setClipboardData({
				"text/unicode": text.replace(/\r\n?|\n/g, this.lineBreak),
				"text/html":    html.replace(/\r\n?|\n/g, this.lineBreak)
			}, sourceWindow);

			if(!/(?:^|\s)attrsInspector-copied(?:\s|$)/.test(tt.className))
				tt.className += " attrsInspector-copied";
			//tt.style.opacity = "0.75";
			tt.style.color = "grayText";
			this.timer(function() {
				tt.className = tt.className
					.replace(/(?:^|\s)attrsInspector-copied(?:\s|$)/, " ")
					.replace(/\s+$/, "");
				//tt.style.opacity = "";
				tt.style.color = "";
			}, this, 150);
		},
		get lineBreak() {
			delete this.lineBreak;
			return this.lineBreak = this.appInfo.OS == "WINNT" ? "\r\n" : "\n";
		},
		stopSingleEvent: function(target, type) {
			target.addEventListener(type, {
				target: target,
				context: this,
				handleEvent: function(e) {
					this.target.removeEventListener(e.type, this, true);
					this.context.stopEvent(e);
				}
			}, true);
		},
		getParentFrame: function(document, doc) {
			// We don't check anonymous nodes now
			var browser;
			const XULNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
			Array.concat(
				Array.slice(doc.getElementsByTagNameNS(XULNS, "tabbrowser")),
				Array.slice(doc.getElementsByTagNameNS(XULNS, "browser")),
				Array.slice(doc.getElementsByTagName("iframe")),
				Array.slice(doc.getElementsByTagName("frame"))
			).some(function(br) {
				if(!("contentDocument" in br))
					return false;
				var doc = br.contentDocument;
				_log(
					"Search parent frame: <" + br.nodeName + "> "
					+ (doc.title ? doc.title + " " : "") + doc.documentURI
				);
				if(
					doc == document
					|| (br = this.getParentFrame(document, doc))
				) {
					browser = br.localName.toLowerCase() == "tabbrowser" && br.selectedBrowser || br;
					return true;
				}
				return false;
			}, this);
			return browser;
		},
		mousedownHandler: function(e) {
			if(this.canInspect(e)) {
				this._checkPreventDefault(e);
				this.stopEvent(e);
			}
		},
		mouseupHandler: function(e) {
			this.mousedownHandler.apply(this, arguments);
		},
		clickHandler: function(e, top) {
			if(!this.canInspect(e))
				return;
			this._checkPreventDefault(e);
			this.stopEvent(e);
			var nodes = this._nodes;
			var node = nodes.length ? nodes[0] : e.originalTarget;
			this.inspect(node, top, e.shiftKey);
		},
		inspect: function(node, top, forcePopupLocker) {
			var inspect = this.context.inspector;
			if(inspect && _popupLocker && (_popupLocker == 2 || forcePopupLocker))
				this.lockPopup(node, top);
			this.stop();
			_log(inspect ? "Open DOM Inspector for <" + node.nodeName + ">" : "DOM Inspector not found!");
			inspect && inspect(node, top, forcePopupLocker);
			this.closeMenus(node);
			this.hideUnclosedPopups();
			if(!inspect) {
				var label = this.context.button && this.context.button.label
					|| "Attributes Inspector";
				Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService)
					.alert(top, label, "DOM Inspector isn't found!");
			}
		},
		getPopup: function(node) {
			for(; node && "tagName" in node; node = node.parentNode)
				if(
					node.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
					&& "hidePopup" in node
				)
					return node;
			return null;
		},
		lockPopup: function(node, top) {
			var popup = this.getPopup(node);
			if(!popup)
				return;

			var popupLocker = {
				domiWindow: null,
				window: top,
				popup: popup,
				tt: this.context.tt,
				ww: this.context.ww,
				closeMenus: this.closeMenus,
				stopEvent: this.stopEvent,
				stopSingleEvent: this.stopSingleEvent,
				_getPopupInfo: this._getPopupInfo,
				_popups: [],
				init: function() {
					var w = this.window;
					//w.addEventListener("unload",       this, false);
					w.addEventListener("keydown",      this, true);
					w.addEventListener("keypress",     this, true);
					w.addEventListener("keyup",        this, true);
					w.addEventListener("popupshowing", this, true);
					w.addEventListener("popuphiding",  this, true);
					this.ww.registerNotification(this);
					_log("Popup locker: start");
				},
				destroy: function() {
					var w = this.window;
					//w.removeEventListener("unload",       this, false);
					w.removeEventListener("keydown",      this, true);
					w.removeEventListener("keypress",     this, true);
					w.removeEventListener("keyup",        this, true);
					w.removeEventListener("popupshowing", this, true);
					w.removeEventListener("popuphiding",  this, true);
					this.ww.unregisterNotification(this);
					this._popups.forEach(function(popup) {
						if("hidePopup" in popup)
							popup.hidePopup();
					});
					_log("Popup locker: stop");
				},
				handleEvent: function(e) {
					switch(e.type) {
						case "popupshowing":
							var popup = e.originalTarget;
							if(popup == this.tt)
								break;
							this.stopEvent(e);
							_log("Popup locker: prevent popup showing: " + this._getPopupInfo(popup));
						break;
						case "popuphiding":
							var popup = e.originalTarget;
							if(popup == this.tt)
								break;
							//if(e.originalTarget == this.popup)
							this.stopEvent(e);
							_log("Popup locker: prevent popup hiding: " + this._getPopupInfo(popup));
							if(this._popups.indexOf(popup) == -1)
								this._popups.push(popup);
						break;
						case "keydown":
						case "keypress":
						case "keyup":
							var onlyStop = e.type == "keydown" || e.type == "keyup";
							if(e.keyCode == e.DOM_VK_ESCAPE) {
								this.stopEvent(e);
								if(onlyStop)
									return;
								this.stopSingleEvent(this.window, "keyup");
								_log("Popup locker: Escape pressed => destroy");
								this.destroy();
								this.closeMenus(this.popup);
							}
						break;
						case "load":
							var win = e.target.defaultView;
							win.removeEventListener("load", this, false);
							if(!this.domiWindow && win.location.href == "chrome://inspector/content/inspector.xul") {
								_log("Popup locker: DOM Inspector opened");
								this.domiWindow = win;
							}
					}
				},
				observe: function(subject, topic, data) {
					if(topic == "domwindowopened") {
						subject.addEventListener("load", this, false);
					}
					else if(topic == "domwindowclosed") {
						subject.removeEventListener("load", this, false);
						if(subject == this.domiWindow) {
							_log("Popup locker: DOM Inspector closed => destroy");
							this.destroy();
						}
						else if(subject == this.window) {
							_log("Popup locker: locked window closed => destroy");
							this.destroy();
						}
					}
				}
			};
			popupLocker.init();
		},
		_checkPreventDefault: function(e) {
			if("defaultPrevented" in e ? e.defaultPrevented : e.getPreventDefault())
				_log('Warning! Default action for "' + e.type + '" event is already cancelled!');
		},
		closeMenus: function(node) {
			// Based on function closeMenus from chrome://browser/content/utilityOverlay.js
			for(; node && "tagName" in node; node = node.parentNode) {
				if(
					node.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
					&& (node.localName == "menupopup" || node.localName == "popup")
				)
					node.hidePopup();
			}
		},

		_popups: [],
		__shiftKey: false,
		get _shiftKey() {
			return this.__shiftKey;
		},
		set _shiftKey(val) {
			this.__shiftKey = val;
			!val && this.hideUnclosedPopups();
		},
		hideUnclosedPopups: function() {
			this._popups.forEach(function(popup) {
				if("hidePopup" in popup) {
					popup.hidePopup();
					_log("Hide popup: " + this._getPopupInfo(popup));
				}
			}, this);
			this._popups = [];
		},
		popupshowingHandler: function(e) {
			if(this._shiftKey)
				return;
			var tar = e.originalTarget;
			if(tar.localName == "tooltip" && tar.id != this.context.ttId) {
				this.stopEvent(e);
				_log("Forbid tooltip showing: " + this._getPopupInfo(tar));
			}
		},
		popupshownHandler: function(e) {
			var tar = e.originalTarget;
			if(tar.id == this.context.ttId || /*this._shiftKey && */tar.localName == "tooltip")
				return;
			this.makeTooltipTopmost(true);
			_log(e.type + " => make tooltip topmost");
		},
		makeTooltipTopmost: function(restorePos) {
			this.context.tt.hidePopup(); // Ugly with show/hide tooltips animation
			restorePos && this.mousemoveHandler();
		},
		popuphidingHandler: function(e) {
			if(!this._shiftKey)
				return;
			var tar = e.originalTarget;
			if(/*tar.localName == "tooltip" && */tar.id != this.context.ttId) {
				this.stopEvent(e);
				if(this._popups.indexOf(tar) == -1)
					this._popups.push(tar);
				_log("Forbid popup hiding: " + this._getPopupInfo(tar));
			}
		},
		_getPopupInfo: function(tt) {
			var ret = "<" + tt.nodeName + ">";
			if(tt.id)
				ret += ' id="' + tt.id + '"';
			if(tt.className)
				ret += ' class="' + tt.className + '"';
			var val = tt.value || tt.getAttribute("value") || tt.getAttribute("label") || tt.textContent;
			if(val)
				ret += ' "' + val + '"';
			return ret;
		},

		observe: function(subject, topic, data) {
			if(topic == "domwindowopened") {
				this.context.setListeners(ael, subject);
				_log("New window opened");
				if(!_debug)
					return;
				this._loadHandler = {
					parent: this,
					window: subject,
					handleEvent: function(e) {
						if(e.target.defaultView != this.window) //?
							return;
						_log("New window loaded: " + e.target.title + " (" + e.target.location + ")");
						this.destroy();
					},
					destroy: function() {
						this.window.removeEventListener("load", this, false);
						delete this.parent._loadHandler;
					}
				};
				subject.addEventListener("load", this._loadHandler, false);
			}
			else if(topic == "domwindowclosed") {
				if(this.hasOwnProperty("_loadHandler")) // Window can be closed before "load" event happens
					this._loadHandler.destroy();
				this.context.setListeners(rel, subject);
				if(subject == this.window)
					this.stop();
				_log("Window closed: " + (subject.document && subject.document.title) + " (" + subject.location + ")");
			}
		}
	};
	this.evtHandler = function(win) {
		var gh = this.globalHandler;
		var hi = gh._windows.indexOf(win);
		if(hi != -1)
			return gh._handlers[hi];

		this.currentWindow = win;
		gh._handlers.push(this);
		gh._windows.push(win);
		return this;
	};
	this.evtHandler.prototype = {
		globalHandler: this.evtHandlerGlobal,
		handleEvent: function(e) {
			this.globalHandler[e.type + "Handler"](e, this.currentWindow);
		}
	};
	defineGetter(this, "inspector", function() {
		if(!("@mozilla.org/commandlinehandler/general-startup;1?type=inspector" in Components.classes)) {
			_log("DOM Inspector not installed!");
			return null;
		}
		if((_showFullTree || _nodePosition >= 0) && this.evtHandlerGlobal.fxVersion >= 2) {
			return function(node, top) {
				var inspWin = window.openDialog(
					"chrome://inspector/content/",
					"_blank",
					"chrome,all,dialog=no",
					_showFullTree == 0
						? node.ownerDocument || node
						: _showFullTree == 1
							? (node.ownerDocument || node).defaultView.top.document
							: (top || window.top).document
				);
				var tryDelay = 5;
				function inspect() {
					if(!inspWin.inspector) {
						inspWin.setTimeout(inspect, tryDelay);
						return;
					}
					try {
						try {
							// Avoid warnings in error console after getViewer("dom")
							var hash = inspWin.inspector.mPanelSet.registry.mViewerHash;
						}
						catch(e1) {
							Components.utils.reportError(e1);
						}
						if(!hash || ("dom" in hash)) {
							var viewer = inspWin.inspector.getViewer("dom");
							var prefs = Components.classes["@mozilla.org/preferences-service;1"]
								.getService(Components.interfaces.nsIPrefBranch);
							const blinkPref = "inspector.blink.on";
							var blink = prefs.getBoolPref(blinkPref);
							blink && prefs.setBoolPref(blinkPref, false);
							try {
								if("showNodeInTree" in viewer) // New DOM Inspector
									viewer.showNodeInTree(node);
								else
									viewer.selectElementInTree(node);
								if(_nodePosition >= 0) {
									var tbo = viewer.mDOMTree.treeBoxObject;
									var cur = tbo.view.selection.currentIndex;
									var first = tbo.getFirstVisibleRow();
									var visibleRows = tbo.height/tbo.rowHeight;
									var newFirst = cur - _nodePosition*visibleRows + 1;
									tbo.scrollByLines(Math.round(newFirst - first));
									tbo.ensureRowIsVisible(cur); // Should be visible, but...
								}
								return;
							}
							catch(e2) {
								Components.utils.reportError(e2);
							}
							finally {
								blink && prefs.setBoolPref(blinkPref, true);
							}
						}
					}
					catch(e) {
						Components.utils.reportError(e);
					}
					inspWin.setTimeout(inspect, tryDelay);
				}
				inspWin.addEventListener("load", function showNode(e) {
					inspWin.removeEventListener("load", showNode, false);
					inspect();
				}, false);
			};
		}

		var ws = this.wm.getEnumerator(null);
		while(ws.hasMoreElements()) {
			var w = ws.getNext();
			if("inspectDOMNode" in w) {
				return function(node, top) {
					w.inspectDOMNode(node);
				};
			}
		}
		_log("Can't find window with DOM Inspector's inspectDOMNode()");
		return null;
	});

	this.setAllListeners(ael);
	this.ww.registerNotification(this.evtHandlerGlobal);
	var btn = this.button;
	if(btn) {
		var destructor = function(reason) {
			if(reason == "delete") {
				_log('"Delete button" pressed -> stop()');
				context.stop();
			}
		};
		if(
			typeof addDestructor == "function" // Custom Buttons 0.0.5.6pre4+
			&& addDestructor != ("addDestructor" in window && window.addDestructor)
		) {
			btn._attrsInspectorHasAddDestructor = true;
			addDestructor(destructor, this);
		}
		else {
			if("onDestroy" in btn)
				var origOnDestroy = btn._attrsInspectorOrigOnDestroy = btn.onDestroy;
			btn.onDestroy = function(reason) {
				destructor(reason);
				origOnDestroy && origOnDestroy.apply(this, arguments);
			};
		}
	}
	_log(
		"Successfully started!"
		+ "\nMode: " + (
			btn
				? "Custom Button"
				: "No Button"
		)
		+ ", highlighter: " + (
			_highlightUsingFlasher
				? "inIFlasher"
				: this.evtHandlerGlobal.noStyles
					? "inline CSS"
					: "nsIStyleSheetService"
		)
	);
}
function destroy() {
	var tt = this.tt;
	if(!tt || !tt.parentNode)
		return;
	tt.hidePopup();
	tt.parentNode.removeChild(tt);

	var ehg = this.evtHandlerGlobal;
	ehg.unwatchAttrs();
	ehg.unhl();
	ehg.destroyTimers();
	if(!_highlightUsingFlasher) {
		var sss = this.sss;
		var cssURI = this.cssURI;
		if(sss.sheetRegistered(cssURI, sss.AGENT_SHEET))
			sss.unregisterSheet(cssURI, sss.AGENT_SHEET);
		if(sss.sheetRegistered(cssURI, sss.USER_SHEET))
			sss.unregisterSheet(cssURI, sss.USER_SHEET);
	}
	this.setAllListeners(rel);
	this.ww.unregisterNotification(ehg);
	var btn = this.button;
	if(btn) {
		if("_attrsInspectorOrigOnDestroy" in btn)
			btn.onDestroy = btn._attrsInspectorOrigOnDestroy;
		else if(!("_attrsInspectorHasAddDestructor" in btn))
			delete btn.onDestroy;
		delete btn._attrsInspectorOrigOnDestroy;
		delete btn._attrsInspectorHasAddDestructor;
	}
	delete window[_ns];
	_log("Shutdown finished!");
}