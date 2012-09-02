// http://forum.mozilla-russia.org/viewtopic.php?pid=470532#p470532
// http://infocatcher.ucoz.net/js/cb/attrsInspector.js

// (c) Infocatcher 2010-2011
// version 0.5.1 - 2011-05-28

//===================
// Attributes Inspector button for Custom Buttons
// (for "code" section)
// Also the code can be used from main window context (as Mouse Gestures code, for example)

// Usage:
//   Use middle-click or Ctrl + left-click (or press Ctrl+Shift+I) to inspect node in DOM Inspector
//   Hold Shift key to show and don't hide tooltips and popups
// Hotkeys:
//   Escape             - cancel
//   Ctrl+Up, Ctrl+Down - go to parent/child node
//   Ctrl+Shift+C       - copy tooltip contents

// Icon: http://www.iconsearch.ru/detailed/278/2/
//===================

var _highlight = true;
var _highlightUsingFlasher = false; // Don't modify DOM, but has some side effects (and more slow)
var _forbidTooltips = true;
var _showFullTree = 2; // 0 - current frame, 1 - top frame, 2 - topmost frame
var _borderColor = "red";
var _debug = false; // Show debug messages in error console

function _log() {
	if(!_debug)
		return _log = function() {};
	var cs = Components.classes["@mozilla.org/consoleservice;1"]
		.getService(Components.interfaces.nsIConsoleService);
	_log = function() {
		cs.logStringMessage("[Attributes Inspector]: " + Array.map(arguments, String).join("\n"));
	};
	return _log.apply(this, arguments);
}

const _ns = "__attributesInspector";
var context = _ns in window && window[_ns] || (
	window[_ns] = {
		button: "getAttribute" in this && this,
		checked: false,
		toggle: function() {
			toggle.call(context);
		},
		stop: function() {
			this.checked && this.toggle();
		}
	}
);
var ael = function(type, func, useCapture, target) {
	return (target || window).addEventListener(type, func, useCapture);
};
var rel = function(type, func, useCapture, target) {
	return (target || window).removeEventListener(type, func, useCapture);
};

context.toggle();

function toggle() {
	var checked = this.checked = !this.checked;
	var btn = this.button;
	if(btn) {
		btn.checked = checked;
		if(!checked) {
			var doc = btn.ownerDocument;
			(function uncheck() { // D'oh...
				for(var node = btn.parentNode; ; node = node.parentNode) {
					if(!node) { // Node was removed from document
						_log("Button was removed from document");
						return;
					}
					if(node.nodeType == node.DOCUMENT_NODE)
						break;
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
	top.document.documentElement.appendChild(tt);

	if(!_highlightUsingFlasher) {
		this.hlAttrNS = "urn:attrsInspectorNS";
		this.hlAttr = "__attrs_inspector_highlighted__"; // Don't use caps here - works only in Firefox 4
		this.sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
			.getService(Components.interfaces.nsIStyleSheetService);
		var cssStr = <><![CDATA[
			/* Attributes Inspector highlight styles */
			@namespace ains url("%ns%");
			%priorityHack%[ains|%attr%="true"] {
				outline: 1px solid %borderColor% !important;
				outline-offset: -1px !important;
			}
			]]></>
			.toString()
			.replace(/%ns%/g, this.hlAttrNS)
			.replace(/%attr%/g, this.hlAttr)
			.replace(/%borderColor%/g, _borderColor)
			.replace(/%priorityHack%/g, (function() {
				var rnd = Math.random().toFixed(16).substr(2);
				var hack = "*|*";
				for(var i = 0; i < 16; i++)
					hack += ":not(#__priorityHack__" + rnd + "__" + i + ")";
				return hack;
			})());
		this.cssURI = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService)
			.newURI("data:text/css," + encodeURIComponent(cssStr), null, null);
		if(!this.sss.sheetRegistered(this.cssURI, this.sss.AGENT_SHEET))
			this.sss.loadAndRegisterSheet(this.cssURI, this.sss.AGENT_SHEET);
		if(!this.sss.sheetRegistered(this.cssURI, this.sss.USER_SHEET))
			this.sss.loadAndRegisterSheet(this.cssURI, this.sss.USER_SHEET);
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
		action("keydown",   h, true, w);
		action("keypress",  h, true, w);
		action("keyup",     h, true, w);
		//if(action == rel || this.inspector) {
		action("mousedown", h, true, w);
		action("mouseup",   h, true, w);
		action("click",     h, true, w);
		//}
		if(_forbidTooltips) {
			action("popupshowing", h, true, w);
			action("popuphiding",  h, true, w);
			//action("keydown",      h, true, w);
			//action("keyup",        h, true, w);
		}

		//action("unload", h, false, w);

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
		getHeader: function(v) {
			var e = this.s(v, "strong");
			//e.style.fontWeight = "bold";
			e.className = "attrsInspector-header";
			return e;
		},
		get separator() {
			var sep = this._separator = this.s(" = ");
			sep.className = "attrsInspector-separator";
			delete this.separator;
			this.__defineGetter__("separator", function() {
				return this._separator.cloneNode(true);
			});
			return this.separator;
		},
		getValue: function(v) {
			var e = this.s(v);
			//e.style.whiteSpace = "pre";
			e.className = "attrsInspector-value";
			return e;
		},
		getItem: function(header, value) {
			var overflowBox = this.e("div");
			overflowBox.style.overflow = "hidden";
			overflowBox.className = "attrsInspector-itemContainer";

			var item = this.e("div");
			item.style.lineHeight = "1.25";
			item.style.maxHeight = "12.5em";
			item.className = "attrsInspector-item";
			item.appendChild(this.getHeader(header));
			if(value) {
				item.appendChild(this.separator);
				item.appendChild(this.getValue(value));
			}

			overflowBox.appendChild(item);
			return overflowBox;
		},
		_hasData: false,
		setData: function(node) {
			var tt = this.context.tt;
			this._hasData = true;

			while(tt.hasChildNodes())
				tt.removeChild(tt.lastChild);

			tt.appendChild(this.getItem(node.nodeName));

			if(node.nodeType == node.DOCUMENT_NODE) {
				tt.appendChild(this.getItem("documentURI", node.documentURI));
				node.title && tt.appendChild(this.getItem("title", node.title));
			}

			if(!node.attributes)
				return;
			var topAttrs = ["id", "class"].reverse();
			Array.slice(node.attributes)
				.sort(function(a, b) {
					a = a.name, b = b.name;
					var ai = topAttrs.indexOf(a);
					var bi = topAttrs.indexOf(b);
					if(ai != -1 || bi != -1)
						return bi - ai;
					return a > b;
				}).forEach(function(attr) {
					var name = attr.name;
					var val = attr.value;
					if(!_highlightUsingFlasher) {
						if(name == this.context.hlAttr && attr.namespaceURI == this.context.hlAttrNS)
							return;
						if(this.noStyles && name == "style") {
							val = val
								.replace(
									"outline-color: " + _borderColor + "; outline-style: solid; "
										+ "outline-width: 1px; outline-offset: -1px;",
									""
								)
								.replace(/^ | $/g, "");
							if(!val)
								return;
						}
					}
					tt.appendChild(this.getItem(name, val));
				}, this);
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
		get fxVersion() {
			var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
				.getService(Components.interfaces.nsIXULAppInfo);
			var pv = appInfo.platformVersion;
			var vc = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
				.getService(Components.interfaces.nsIVersionComparator);
			var v;
			if(vc.compare(pv, "2.0a1pre") >= 0)
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
			//_log("stopEvent: " + e.type);
		},
		get flasher() {
			var flasher = Components.classes["@mozilla.org/inspector/flasher;1"]
				.getService(Components.interfaces.inIFlasher);
			flasher.color = _borderColor;
			flasher.thickness = 1;
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
				this._hlInterval = setInterval(function(_this) {
					_this.flasher.drawElementOutline(node);
				}, 10, this);
				return;
			}

			if(this.noStyles) {
				this._oldStyle = node.hasAttribute("style") && node.getAttribute("style");
				node.style.outline = "1px solid " + _borderColor;
				node.style.outlineOffset = "-1px";
				//return;
			}
			node.setAttributeNS(this.context.hlAttrNS, this.context.hlAttr, "true");
		},
		unhl: function() {
			var node = this._hl;
			if(!node)
				return;
			this._hl = null;
			if(!("removeAttributeNS" in node))
				return;

			if(_highlightUsingFlasher) {
				this.flasher.repaintElement(node);
				this.flasher.repaintElement(node.ownerDocument.documentElement);
				clearInterval(this._hlInterval);
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
		watchAttrs: function(node) {
			this.unwatchAttrs(); // Only one watched node
			this._node = node;
			//ael("DOMAttrModified", this, true, node);
			// Hack for Firefox 2
			this._attrsWatcher = {
				parent: this,
				handleEvent: function(e) {
					this.parent.DOMAttrModifiedHandler(e);
				}
			};
			ael("DOMAttrModified", this._attrsWatcher, true, node);
		},
		unwatchAttrs: function() {
			var node = this._node;
			if(!node)
				return;
			this._node = null;
			//rel("DOMAttrModified", this, true, node);
			rel("DOMAttrModified", this._attrsWatcher, true, node);
		},
		DOMAttrModifiedHandler: function(e) {
			//if(e.attrName != this.context.hlAttr)
			//	_log(e.type + " " + e.attrName);
			this._node && this.setData(this._node);
		},
		setClipboardData: function(dataObj, clipId) {
			var ta = Components.classes["@mozilla.org/widget/transferable;1"]
				.createInstance(Components.interfaces.nsITransferable);
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
		_noMouseoverTimer: null,
		mouseoverHandler: function(e) {
			if(this._noMouseover)
				return;
			var node = e.originalTarget;
			this._nodes = [node];
			this.handleNodeFromEvent(node, e);
		},
		handleNodeFromEvent: function(node, e) {
			this.hl(node);
			this.setData(node);
			this.watchAttrs(node);
			this.mousemoveHandler(e);
		},
		handleNode: function(node) {
			// Tooltip with big height -> wrongly under cursor -> reposition -> mouseover
			// And setTimeout() in parent window fail for modal child window
			this._noMouseover = true;
			this._noMouseoverTimer && this._noMouseoverTimer.cancel();

			this.handleNodeFromEvent(node);

			if(!this._noMouseoverTimer)
				this._noMouseoverTimer = Components.classes["@mozilla.org/timer;1"]
					.createInstance(Components.interfaces.nsITimer);
			var timer = this._noMouseoverTimer;
			var observer = {
				context: this,
				observe: function() {
					this.context._noMouseover = false;
				}
			};
			timer.init(observer, 200, timer.TYPE_ONE_SHOT);
		},
		mousemoveHandler: function(e) {
			var tt = this.context.tt;

			if(!this._hasData) {
				this.mouseoverHandler(e);
				return;
			}

			if(e) {
				this._lastScreenX = e.screenX;
				this._lastScreenY = e.screenY;

				this._shiftKey = e.shiftKey;
			}
			else {
				e = {
					screenX: this._lastScreenX || 0,
					screenY: this._lastScreenY || 0
				};
			}

			var fxVersion = this.fxVersion;
			//if(fxVersion <= 2) {
			//	Array.forEach(tt.getElementsByAttribute("class", "attrsInspector-item"), function(elt) {
			//		var win = elt.ownerDocument.defaultView;
			//		elt.parentNode.style.height = Math.min(
			//			parseInt(win.getComputedStyle(elt, null).maxHeight),
			//			parseInt(win.getComputedStyle(elt, null).height)
			//		) + "px";
			//	});
			//}
			if(fxVersion <= 2) {
				// Ugly workaround...
				var text = Array.map(tt.childNodes, function(node) {
					return node.textContent;
				}).join("\n");
				while(tt.hasChildNodes())
					tt.removeChild(tt.lastChild);
				var d = top.document.createElementNS(
					"http://www.w3.org/1999/xhtml",
					"div"
				);
				d.style.whiteSpace = "-moz-pre-wrap";
				d.textContent = text;
				tt.height = null;
				tt.insertBefore(d, tt.firstChild);
				tt.height = tt.boxObject.height;
			}

			if("openPopupAtScreen" in tt) // Firefox 3.0+
				tt.openPopupAtScreen(e.screenX, e.screenY, false /*isContextMenu*/);
			else
				tt.showPopup(document.documentElement, e.screenX, e.screenY, "tooltip", null, null);
			if(fxVersion <= 2)
				return;
			var x = e.screenX;
			var y = e.screenY;
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
		keydownHandler: function(e) {
			this._shiftKey = e.shiftKey;
			this.keypressHandler.apply(this, arguments);
		},
		keyupHandler: function(e) {
			this._shiftKey = e.shiftKey;
			this.keypressHandler.apply(this, arguments);
		},
		keypressHandler: function(e, top) {
			// keydown => stopEvent()
			// keypress => stopEvent() + hetkey action
			// keyup => stopEvent()
			var onlyStop = e.type == "keydown" || e.type == "keyup";
			if(e.keyCode == e.DOM_VK_ESCAPE) {
				this.stopEvent(e);
				if(onlyStop)
					return;
				this.stopSingleEvent(top, "keyup");
				this.stop();
				return;
			}
			var ctrl      = (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey;
			var ctrlShift = (e.ctrlKey || e.metaKey) &&  e.shiftKey && !e.altKey;
			if(!ctrl && !ctrlShift)
				return;

			if(ctrl && e.keyCode == e.DOM_VK_UP) { // Ctrl+Up
				this.stopEvent(e);
				if(!onlyStop)
					this.navigateUp(top);
			}
			else if(ctrl && e.keyCode == e.DOM_VK_DOWN) { // Ctrl+Down
				this.stopEvent(e);
				if(!onlyStop)
					this.navigateDown();
			}
			else if(ctrlShift && e.keyCode == e.DOM_VK_C) // keydown || keyup
				this.stopEvent(e);
			else if(ctrlShift && e.keyCode == 0 && String.fromCharCode(e.charCode) == "C") { // Ctrl+Shift+C
				this.stopEvent(e);
				if(!onlyStop)
					this.copyTootipContent();
			}
			else if(ctrlShift && e.keyCode == e.DOM_VK_I) // keydown || keyup
				this.stopEvent(e);
			else if(ctrlShift && e.keyCode == 0 && String.fromCharCode(e.charCode) == "I") { // Ctrl+Shift+I
				this._checkPreventDefault(e);
				this.stopEvent(e);
				if(onlyStop)
					return;
				this.stopSingleEvent(top, "keyup");
				var nodes = this._nodes;
				nodes.length && this.inspect(nodes[0], top);
			}
		},
		navigateUp: function(top) {
			var nodes = this._nodes;
			var node = nodes.length && nodes[0].parentNode;
			if(!node && nodes.length && nodes[0].nodeType == Node.DOCUMENT_NODE && nodes[0] != top.document)
				node = this.getParentFrame(nodes[0], top.document);
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
				var childs = node.childNodes;
				if(!childs.length && "getAnonymousNodes" in node.ownerDocument)
					childs = node.ownerDocument.getAnonymousNodes(node);
				if(childs) for(var i = 0, l = childs.length; i < l; i++) {
					var node = childs[i];
					if("attributes" in node && node.attributes) {
						this._nodes = [node];
						this.handleNode(node);
						break;
					}
				}
			}
		},
		copyTootipContent: function() {
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
				"text/unicode": text,
				"text/html":    html
			});

			if(!/(?:^|\s)attrsInspector-copied(?:\s|$)/.test(tt.className))
				tt.className += " attrsInspector-copied";
			//tt.style.opacity = "0.75";
			tt.style.color = "GrayText";
			setTimeout(function() {
				tt.className = tt.className
					.replace(/(?:^|\s)attrsInspector-copied(?:\s|$)/, " ")
					.replace(/\s+$/, "");
				//tt.style.opacity = "";
				tt.style.color = "";
			}, 150);
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
			//_log(e.type);
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
			this.inspect(node, top);
		},
		inspect: function(node, top) {
			var inspect = this.context.inspector;
			this.stop();
			_log(inspect ? <>Open DOM Inspector for &lt;{node.nodeName}&gt;</> : "DOM Inspector not found!");
			inspect && inspect(node, top);
			this.closeMenus(node);
			this.hideUnclosedPopups();
		},
		_checkPreventDefault: function(e) {
			if("defaultPrevented" in e ? e.defaultPrevented : e.getPreventDefault())
				_log(<>Warning! Default action for "{e.type}" event is already cancelled!</>);
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
				ret += <> id="{tt.id}"</>;
			if(tt.className)
				ret += <> class="{tt.className}"</>;
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
						_log(<>New window loaded: {e.target.title} ({e.target.location})</>);
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
				_log(<>Window closed: {subject.document && subject.document.title} ({subject.location})</>);
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
	this.__defineGetter__("inspector", function() {
		var ws = this.wm.getEnumerator(null);
		while(ws.hasMoreElements()) {
			var w = ws.getNext();
			if(!("inspectDOMNode" in w))
				continue;
			if(_showFullTree && this.evtHandlerGlobal.fxVersion >= 2) {
				return function(node, top) {
					// Too many hacks...
					//if((node.ownerDocument || node).defaultView == top) {
					//	w.inspectDOMNode(node);
					//	return;
					//}
					var inspWin = window.openDialog(
						"chrome://inspector/content/",
						"_blank",
						"chrome,all,dialog=no",
						_showFullTree == 1
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
								prefs.setBoolPref(blinkPref, false);
								try {
									if("showNodeInTree" in viewer) // New DOM Inspector
										viewer.showNodeInTree(node);
									else
										viewer.selectElementInTree(node);
									return;
								}
								catch(e2) {
									Components.utils.reportError(e2);
								}
								finally {
									prefs.setBoolPref(blinkPref, blink);
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
			return function(node, top) {
				w.inspectDOMNode(node);
			};
		}
		return null;
	});

	this.setAllListeners(ael);
	this.ww.registerNotification(this.evtHandlerGlobal);
	var btn = this.button;
	if(btn) {
		btn._context = context;
		btn.onDestroy = function(reason) {
			if(reason != "delete")
				return;
			_log('"Delete button" pressed -> stop()');
			this._context.stop();
		};
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
	ehg._noMouseoverTimer && ehg._noMouseoverTimer.cancel();
	if(!_highlightUsingFlasher) {
		if(this.sss.sheetRegistered(this.cssURI, this.sss.AGENT_SHEET))
			this.sss.unregisterSheet(this.cssURI, this.sss.AGENT_SHEET);
		if(this.sss.sheetRegistered(this.cssURI, this.sss.USER_SHEET))
			this.sss.unregisterSheet(this.cssURI, this.sss.USER_SHEET);
	}
	this.setAllListeners(rel);
	this.ww.unregisterNotification(ehg);
	var btn = this.button;
	if(btn) {
		delete btn._context;
		delete btn.onDestroy;
	}
	delete window[_ns];
	_log("Shutdown finished!");
}