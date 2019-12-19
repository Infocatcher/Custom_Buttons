// https://forum.mozilla-russia.org/viewtopic.php?id=56040
// http://infocatcher.ucoz.net/js/cb/cbEditorToggleOnTop.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/CB_Editor_Toggle_on_Top

// Custom Buttons Editor: Toggle on Top button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012-2015
// version 0.1.11 - 2015-06-04

// Hotkey: Ctrl+T

const watcherId = "customButtonsToggleOnTop_" + this.id;
var {Components} = window; // Prevent garbage collection in Firefox 3.6 and older
var storage = (function() {
	if(!("Services" in window)) // Firefox 3.6 and older
		return Application.storage;
	// Simple replacement for Application.storage
	// See https://bugzilla.mozilla.org/show_bug.cgi?id=1090880
	//var global = Components.utils.getGlobalForObject(Services);
	// Ensure, that we have global object (because window.Services may be overwritten)
	var global = Components.utils.import("resource://gre/modules/Services.jsm", {});
	var ns = "_cbEditorToggleOnTopStorage";
	// Note: Firefox 57+ returns NonSyntacticVariablesObject w/o .Object property
	var storage = global[ns] || (global[ns] = Components.utils.getGlobalForObject(global).Object.create(null));
	return {
		get: function(key, defaultVal) {
			if(key in storage)
				return storage[key];
			return defaultVal;
		},
		set: function(key, val) {
			if(key === null)
				delete storage[key];
			else
				storage[key] = val;
		}
	};
})();
var watcher = storage.get(watcherId, null);
if(!watcher) {
	watcher = {
		btnPos: 0, // 0 - at top right window corner, 1 - at end of tabs, 2 - before dialog buttons spacer
		btnStyle: "button", // "button" or "toolbarbutton"
		btnChecked: true, // use "checked" style: true or false

		// Fogue icons, http://p.yusukekamiyamane.com/
		// http://www.iconfinder.com/icondetails/12276/16/gps_location_pin_icon
		icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AgNBjAx4SevkwAAAjxJREFUKM+FUk1oE0EU/mZnRU0U6cFLIT1KKkkNpIcSWwUvVty2l142hZpDoQcPgYQKQkUEz6V6sHgR/KGQQwleQg/xEKRRsIEmga4NoZa2oRGKpJaWmp2Z52UX12Dxg4838+D73ps3jzUYQycIgDc7l0oNAkgqpZ4n5uc/NgHsEEHDKZB/X5OJRGJcSplemJ6+6SZPFStvJ0Ta4eEhTNMcE0I8fDsxcQsAdPwHc6nUoBRCOz4+Rr1eR39//+18Pn/h/cjIGea+eS6VegLgKoBfRPRdKbXGOf8GIBmPx8cty0Kz2YTf74ff70cmkynpNSIAwP7+/t2ZmZnowcGBPDo6+rm1tdWo1Wo7pmnesSwLtm2jWCx+EkJwKSUnoln2wWnv9eTkMBE9TafT0b29PbTbbXDO0Wq1YNs2lpaWVpVSj8ZyuWXhaPg953CtXK6v9fVtr6ys9A4NDXU3Gg24JoVC4fPJycnjsVxu2TtMzgCUAVQAUKVSrwDtzc3NQCQS6d7d3XU7EK1W62twY+ML84i1N4zB5TvgYrVaPTs1NRXNZDKlrq4u+Hw+BAKBy1LK6zYA2xE+6/gqzhgbXl9fnw+FQrPBYPCHlBKjo6NRIjpPRD3kEdbcJWGMgTF2Y3Fx8UE4HE4yxl70WtYCEc1ms9kS51wDcM4r/FOS87BhGK90XTc0TeNuPgggFosNG4axOjAw8PJKxwIxAD26rt9XShWVUtvOWosO2h1RAJAMwCUAPseInGG6UTlm6l/8DZ+nFuAjSdH0AAAAAElFTkSuQmCC",
		iconPinned: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AgNBjIpwH1VRwAAAgdJREFUKM+FkkFoU0EQhr/dtxFSquLBS8CAICISQci1oBWLKaaINL300psXDxH0ItSD4L21UKgUxV4aWnKyiIGaQwio2IQ0PQQpBaEhoaEk0dSQNsnb9WAepg+LPwz/7DD/7O7MiJIQuGEAV3QIiNowV4f0HlA0BskJsI8fo75YLHIEjw3ccIInivVxX1IqcXFu7l4Lnhq4BaD4P4Y6INsHB+zlcpwfH7+zG48PavCIvj8/B64CRxoqXdg8Bd+BqG9xMVJNpaiUy5zxehkcGCC2uppV28Y44rs3V1aCFIt2p15v/MzlSj/S6eKlmZnRairFoW2zmUx+boHVBsvAtEj+fV5Iw4vbS0tBe2uLw04H2+ulUy5zaNu8X17OdOGZgkTX3TADCRumP0xNZY3fz6/9fSr5PNVGg6/x+BfdE/Y3wxJAHtj6wzt5aHsSiQv+4WFfbWcHu9VCeDzdRq32DdgQfZMQom9JjDGngcn19fWF2shI9vrYWNBqNjFCND8mk+8MTDq5s65RWUKIUKFQmA0EAtP3pawdra0xGokE0dqrwe8kvgS2e1cjpURKORyLxTaUUg+UUuciUvIWQq8hU5uYMPOQmQcuu7fAsqxr4XD4jVIqLKW0nPgV4AmEFiDzCF65hQLwK6Ueaq0/aa13e2vddVnHxV3AFsBZYKBXyPSa6bDuFdP/st/BfOD54p3eIQAAAABJRU5ErkJggg==",

		boxId: "cbToggleOnTopBox",
		btnId: "cbToggleOnTopButton",
		onTopAttr: "cbOnTop",
		naAttr: "cbOnTopNA",
		styleId: "cbToggleOnTopStyle",
		get btnTip() {
			var locale = (function() {
				if("Services" in window && "locale" in Services) {
					var locales = Services.locale.requestedLocales // Firefox 64+
						|| Services.locale.getRequestedLocales && Services.locale.getRequestedLocales();
					if(locales)
						return locales[0];
				}
				var prefs = "Services" in window && Services.prefs
					|| Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefBranch);
				function pref(name, type) {
					return prefs.getPrefType(name) != prefs.PREF_INVALID ? prefs["get" + type + "Pref"](name) : undefined;
				}
				if(!pref("intl.locale.matchOS", "Bool")) { // Also see https://bugzilla.mozilla.org/show_bug.cgi?id=1414390
					var locale = pref("general.useragent.locale", "Char");
					if(locale && locale.substr(0, 9) != "chrome://")
						return locale;
				}
				return Components.classes["@mozilla.org/chrome/chrome-registry;1"]
					.getService(Components.interfaces.nsIXULChromeRegistry)
					.getSelectedLocale("global");
			})().match(/^[a-z]*/)[0];
			if(locale == "ru")
				return "Поверх всех окон (Ctrl+T)";
			return "Always on top (Ctrl+T)";
		},

		REASON_STARTUP: 1,
		REASON_SHUTDOWN: 2,
		REASON_WINDOW_LOADED: 3,
		REASON_WINDOW_CLOSED: 4,

		get obs() {
			delete this.obs;
			return this.obs = Components.classes["@mozilla.org/observer-service;1"]
				.getService(Components.interfaces.nsIObserverService);
		},
		get ww() {
			delete this.ww;
			return this.ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
				.getService(Components.interfaces.nsIWindowWatcher);
		},
		get wm() {
			delete this.wm;
			return this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				.getService(Components.interfaces.nsIWindowMediator);
		},
		init: function(reason) {
			this.obs.addObserver(this, "quit-application-granted", false);
			var ws = this.wm.getEnumerator(null);
			while(ws.hasMoreElements())
				this.initWindow(ws.getNext(), reason);
			this.ww.registerNotification(this);
		},
		destroy: function(reason) {
			this.obs.removeObserver(this, "quit-application-granted");
			var ws = this.wm.getEnumerator(null);
			while(ws.hasMoreElements())
				this.destroyWindow(ws.getNext(), reason);
			this.ww.unregisterNotification(this);
		},
		initWindow: function(window, reason) {
			if(!this.isTargetWindow(window))
				return;
			window.addEventListener("keypress", this, true);
			if(this.hasSizeModeChangeEvent)
				window.addEventListener("sizemodechange", this, false);
			else {
				window.addEventListener("resize", this, false); // Can detect only maximize/restore
				this.legacySizeModeChange(window);
			}

			var document = window.document;
			this.removeStyle(document);
			this.addStyle(document);
			var box = document.getElementById(this.boxId);
			box && box.parentNode.removeChild(box);
			box = document.createElementNS(xulns, "hbox");
			box.id = this.boxId;
			var btn = document.createElementNS(xulns, this.btnStyle);
			btn.id = this.btnId;
			if(this.btnChecked) {
				btn.setAttribute("type", "checkbox");
				btn.setAttribute("autoCheck", "false");
			}
			btn.tooltipText = this.btnTip;
			btn.addEventListener("command", this, false);
			box.appendChild(btn);
			switch(this.btnPos) {
				default:
					box.setAttribute("cbOnTopFloat", "true");
					document.documentElement.appendChild(box);
				break;
				case 1:
					box.setAttribute("align", "right");
					let tabbox = document.getElementById("custombuttons-editbutton-tabbox");
					let tabs = tabbox.getElementsByTagName("tabs")[0];
					tabs.parentNode.insertBefore(box, tabs);
					box.style.marginBottom = -(btn.boxObject || btn.getBoundingClientRect()).height + "px";
				break;
				case 2:
					box.setAttribute("align", "center");
					let btnBox = document.documentElement.getButton("accept").parentNode;
					let insPos = btnBox.firstChild;
					for(let node = insPos; node; node = node.nextSibling) {
						if(node.localName == "spacer") {
							insPos = node;
							break;
						}
					}
					btnBox.insertBefore(box, insPos);
			}
			this.checkWindowStatus(window, box);
			//this.setOnTop(btn);
		},
		destroyWindow: function(window, reason) {
			if(reason == this.REASON_WINDOW_CLOSED)
				window.removeEventListener("DOMContentLoaded", this, false); // Window can be closed before DOMContentLoaded
			if(!this.isTargetWindow(window))
				return;
			window.removeEventListener("keypress", this, true);
			if(this.hasSizeModeChangeEvent)
				window.removeEventListener("sizemodechange", this, false);
			else
				window.removeEventListener("resize", this, false);
			var document = window.document;
			var btn = document.getElementById(this.btnId);
			btn.removeEventListener("command", this, false);
			if(reason == this.REASON_SHUTDOWN) {
				let box = btn.parentNode;
				box.parentNode.removeChild(box);
				this.removeStyle(document);
				let xulWin = this.getXulWin(window);
				xulWin.zLevel = xulWin.normalZ;
			}
		},
		isTargetWindow: function(window) {
			return window.location.href.substr(0, 41) == "chrome://custombuttons/content/editor.xul";
		},
		observe: function(subject, topic, data) {
			if(topic == "quit-application-granted")
				this.destroy();
			else if(topic == "domwindowopened")
				subject.addEventListener("DOMContentLoaded", this, false);
			else if(topic == "domwindowclosed")
				this.destroyWindow(subject, this.REASON_WINDOW_CLOSED);
		},
		handleEvent: function(e) {
			var trg = e.originalTarget || e.target;
			var window;
			switch(e.type) {
				case "DOMContentLoaded":
					window = trg.defaultView;
					window.removeEventListener("DOMContentLoaded", this, false);
					this.initWindow(window, this.REASON_WINDOW_LOADED);
				break;
				case "keypress":
					if(
						!(
							(e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey
							&& String.fromCharCode(e.charCode).toLowerCase() == "t"
						)
					)
						break;
					e.preventDefault();
					e.stopPropagation();
				case "command":
					window = trg.ownerDocument.defaultView.top;
					this.toggleOnTop(window);
				break;
				case "sizemodechange":
				case "resize":
					window = trg;
					this.checkWindowStatus(window);
			}
		},
		get hasSizeModeChangeEvent() {
			var appinfo = "Services" in window && Services.appinfo;
			delete this.hasSizeModeChangeEvent;
			return this.hasSizeModeChangeEvent = appinfo && (
				appinfo.name == "Pale Moon"
				|| parseFloat(appinfo.platformVersion) >= 8
			);
		},
		legacySizeModeChange: function(window) {
			var lastState = window.windowState;
			window.setInterval(function(window, _this) {
				var state = window.windowState;
				if(state != lastState)
					_this.checkWindowStatus(window);
				lastState = state;
			}, 150, window, this);
		},
		checkWindowStatus: function(window, box) {
			if(!box)
				box = window.document.getElementById(this.boxId);
			var na = String(window.windowState != window.STATE_NORMAL);
			if(box.getAttribute(this.naAttr) == na)
				return;
			box.setAttribute(this.naAttr, na);
			//LOG("Set n/a: " + na);
			this.setOnTop(box.firstChild);
		},
		addStyle: function(document) {
			var style = '\
				%box%[cbOnTopFloat] {\n\
					display: block !important;\n\
					position: fixed !important;\n\
					top: 0 !important;\n\
					right: 0 !important;\n\
				}\n\
				%btn%, %btn% * {\n\
					margin: 0 !important;\n\
					padding: 0 !important;\n\
				}\n\
				%btn% > .button-box > .button-icon {\n\
					margin: -3px -1px !important;\n\
				}\n\
				toolbarbutton%btn% {\n\
					padding: 0 2px !important;\n\
				}\n\
				%btn% {\n\
					position: relative !important;\n\
					z-index: 2147483647 !important;\n\
					list-style-image: url("%icon%") !important;\n\
					-moz-user-focus: ignore !important;\n\
					min-height: 0 !important;\n\
					min-width: 0 !important;\n\
				}\n\
				%btn%[%onTopAttr%="true"] {\n\
					list-style-image: url("%iconPinned%") !important;\n\
				}\n\
				%box%[%naAttr%="true"] image {\n\
					opacity: 0.75 !important;\n\
				}'
				.replace(/%box%/g, "#" + this.boxId)
				.replace(/%btn%/g, "#" + this.btnId)
				.replace(/%onTopAttr%/g, this.onTopAttr)
				.replace(/%icon%/g, this.icon)
				.replace(/%iconPinned%/g, this.iconPinned)
				.replace(/%naAttr%/g, this.naAttr);

			document.insertBefore(document.createProcessingInstruction(
				"xml-stylesheet",
				'id="' + this.styleId + '" href="' + "data:text/css,"
					+ encodeURIComponent(style) + '" type="text/css"'
			), document.documentElement);
		},
		removeStyle: function(document) {
			var mark = 'id="' + this.styleId + '"';
			for(var child = document.documentElement; child = child.previousSibling; ) {
				if(
					child.nodeType == child.PROCESSING_INSTRUCTION_NODE
					&& child.data.substr(0, mark.length) == mark
				) {
					document.removeChild(child);
					break;
				}
			}
		},
		getXulWin: function(window) {
			var docShell = "QueryInterface" in window
				? window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIWebNavigation)
					.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
				: window.docShell; // Firefox 70+
			return docShell
				.treeOwner
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(
					Components.interfaces.nsIXULWindow
					|| Components.interfaces.nsIAppWindow // Firefox 72+
				);
		},
		setOnTop: function(btn, toggle) {
			var document = btn.ownerDocument;
			var root = document.documentElement;
			var onTop = root.getAttribute(this.onTopAttr) == "true";
			if(toggle) {
				onTop = !onTop;
				root.setAttribute(this.onTopAttr, onTop);
				if(root.id) {
					if("persist" in document)
						document.persist(root.id, this.onTopAttr);
					else // Firefox 63+
						Services.xulStore.persist(root, this.onTopAttr);
				}
			}
			else if(!onTop) // Just opened or restored window always have zLevel == normalZ
				return;
			var window = document.defaultView;
			var state = window.windowState;
			// Strange glitches with minimized "raisedZ" window...
			var restore = onTop && state == window.STATE_MINIMIZED;
			if(restore || state == window.STATE_NORMAL) {
				if(restore)
					onTop = false;
				let xulWin = this.getXulWin(window);
				xulWin.zLevel = onTop ? xulWin.raisedZ : xulWin.normalZ;
				//LOG("Set on top: " + onTop);
			}
			this.checkButton(btn, onTop);
		},
		toggleOnTop: function(window) {
			this.setOnTop(window.document.getElementById(this.btnId), true);
		},
		checkButton: function(btn, onTop) {
			btn.setAttribute(this.onTopAttr, onTop);
			this.btnChecked && btn.setAttribute("checked", onTop);
		}
	};
	storage.set(watcherId, watcher);
	watcher.init(watcher.REASON_STARTUP);
}
function destructor(reason) {
	if(reason == "update" || reason == "delete") {
		watcher.destroy(watcher.REASON_SHUTDOWN);
		storage.set(watcherId, null);
	}
}
if(
	typeof addDestructor == "function" // Custom Buttons 0.0.5.6pre4+
	&& addDestructor != ("addDestructor" in window && window.addDestructor)
)
	addDestructor(destructor, this);
else
	this.onDestroy = destructor;