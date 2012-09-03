// http://infocatcher.ucoz.net/js/cb/cookiesPermissions.js

// Cookies Permissions button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2010-2012
// version 0.2.0pre8 - 2012-08-17

var options = {
	removeUnprotectedCookiesInterval: 30*60*1000, // -1 to disable
	removeAllUnprotectedCookies: false,
	useBaseDomain: { // If set to true, will use short domain like google.com instead of www.google.com
		addPermission: false,
		openPermissions: false,
		showCookies: true,
		removeCurrentSiteCookies: true,
		preserveCurrentSiteCookies: true
	},
	prefillMode: 1, // 0 - move caret to start, 1 - select all, 2 - move caret to end
};

function _localize(sid) {
	var strings = {
		en: {
			defaultTooltiptext: "Cookies: Default",
			denyTooltiptext: "Cookies: Deny",
			allowSessionTooltiptext: "Cookies: Allow Session",
			allowTooltiptext: "Cookies: Allow",
			notAvailableTooltiptext: "Cookies: n/a",
			unknownTooltiptext: "Cookies: ???",
			errorTooltiptext: "Cookies: Error!",

			defaultLabel: "Default",
			defaultAccesskey: "f",
			denyLabel: "Deny",
			denyAccesskey: "D",
			allowSessionLabel: "Allow Session",
			allowSessionAccesskey: "S",
			allowLabel: "Allow",
			allowAccesskey: "A",

			showPermissionsLabel: "Show Exceptions…",
			showPermissionsAccesskey: "x",
			showCookiesLabel: "Show Cookies…",
			showCookiesAccesskey: "h",
			removeUnprotectedCookiesLabel: "Remove Unprotected Cookies",
			removeUnprotectedCookiesTip: "Except cookies from opened sites",
			removeUnprotectedCookiesAccesskey: "U",
			removeAllUnprotectedCookiesLabel: "Remove All Unprotected Cookies",
			removeAllUnprotectedCookiesAccesskey: "R",
			removeCurrentSiteCookiesLabel: "Remove All Current Site Cookies",
			removeCurrentSiteCookiesAccesskey: "A",
			removeAllCookiesLabel: "Remove ALL Cookies",
			removeAllCookiesAccesskey: "L",

			buttonMenu: "Button Menu",
			buttonMenuAccesskey: "M"
		},
		ru: {
			defaultTooltiptext: "Cookies: По умолчанию",
			denyTooltiptext: "Cookies: Блокировать",
			allowSessionTooltiptext: "Cookies: Разрешить на сессию",
			allowTooltiptext: "Cookies: Разрешить",
			notAvailableTooltiptext: "Cookies: н/д",
			unknownTooltiptext: "Cookies: ???",
			errorTooltiptext: "Cookies: Ошибка!",

			defaultLabel: "По умолчанию",
			defaultAccesskey: "у",
			denyLabel: "Блокировать",
			denyAccesskey: "Б",
			allowSessionLabel: "Разрешить на сессию",
			allowSessionAccesskey: "с",
			allowLabel: "Разрешить",
			allowAccesskey: "Р",

			showPermissionsLabel: "Показать исключения…",
			showPermissionsAccesskey: "и",
			showCookiesLabel: "Показать cookies…",
			showCookiesAccesskey: "П",
			removeUnprotectedCookiesLabel: "Удалить незащищённые cookies",
			removeUnprotectedCookiesTip: "Исключая cookies открытых сайтов",
			removeUnprotectedCookiesAccesskey: "н",
			removeAllUnprotectedCookiesLabel: "Удалить все незащищённые cookies",
			removeAllUnprotectedCookiesAccesskey: "д",
			removeCurrentSiteCookiesLabel: "Удалить все cookies текущего сайта",
			removeCurrentSiteCookiesAccesskey: "в",
			removeAllCookiesLabel: "Удалить ВСЕ cookies",
			removeAllCookiesAccesskey: "Е",

			buttonMenu: "Меню кнопки",
			buttonMenuAccesskey: "М"
		}
	};
	var locale = (cbu.getPrefs("general.useragent.locale") || "en").match(/^[a-z]*/)[0];
	_localize = function(sid) {
		return strings[locale] && strings[locale][sid] || strings.en[sid] || sid;
	};
	return _localize.apply(this, arguments);
}

this.onclick = function(e) {
	if(e.target != this)
		return;
	var but = e.button;
	var hasModifier = this.permissions.hasModifier(e);
	if(but == 0 && !hasModifier) {
		this.permissions.togglePermission(this.permissions.cp.ACCESS_ALLOW);
		// Allow use "command" section only from hotkey:
		e.preventDefault();
		e.stopPropagation();
	}
	else if(but == 1 || but == 0 && hasModifier)
		this.permissions.openCookiesPermissions();
};
if(!this.hasOwnProperty("defaultContextId"))
	this.defaultContextId = this.getAttribute("context") || "custombuttons-contextpopup";
this.oncontextmenu = function(e) {
	if(e.target != this)
		return;
	this.setAttribute(
		"context",
		this.permissions.hasModifier(e)
			? this.defaultContextId
			: this.permissions.mpId
	);
};

this.permissions = {
	permissionType: "cookie",
	timerId: "customButtonsCookiesCleanupTimer",
	timer: null,

	button: this,
	options: options,

	cp: Components.interfaces.nsICookiePermission,
	PERMISSIONS_NOT_SUPPORTED: -1,
	PERMISSIONS_ERROR:         -2,

	get pm() {
		delete this.pm;
		return this.pm = Components.classes["@mozilla.org/permissionmanager;1"]
			.getService(Components.interfaces.nsIPermissionManager);
	},
	get cm() {
		delete this.cm;
		return this.cm = Components.classes["@mozilla.org/cookiemanager;1"]
			.getService(Components.interfaces.nsICookieManager);
	},
	get io() {
		delete this.io;
		return this.io = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService);
	},
	get oSvc() {
		return Components.classes["@mozilla.org/observer-service;1"]
			.getService(Components.interfaces.nsIObserverService);
	},
	get wm() {
		delete this.wm;
		return this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
	},
	get tld() {
		delete this.tld;
		return this.tld = Components.classes["@mozilla.org/network/effective-tld-service;1"]
			.getService(Components.interfaces.nsIEffectiveTLDService);
	},

	initialized: false,
	init: function() {
		if(this.initialized)
			return;
		this.initialized = true;

		this.mpId = this.button.id + "-context";
		var cp = this.cp;
		var mp = this.mp = this.button.appendChild(this.parseXULFromString('\
			<menupopup xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"\
				id="' + this.mpId + '"\
				onpopupshowing="\
					if(event.target != this)\
						return true;\
					document.popupNode = this.parentNode;\
					return this.parentNode.permissions.updMenu();"\
				onpopuphidden="if(event.target == this) document.popupNode = null;">\
				<menuitem type="radio" cb_permission="' + cp.ACCESS_DEFAULT + '"\
					oncommand="this.parentNode.parentNode.permissions.removePermission();"\
					label="' + _localize("defaultLabel") + '"\
					accesskey="' + _localize("defaultAccesskey") + '" />\
				<menuseparator />\
				<menuitem type="radio" cb_permission="' + cp.ACCESS_DENY + '"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsICookiePermission.ACCESS_DENY);"\
					label="' + _localize("denyLabel") + '"\
					accesskey="' + _localize("denyAccesskey") + '" />\
				<menuitem type="radio" cb_permission="' + cp.ACCESS_SESSION + '"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsICookiePermission.ACCESS_SESSION);"\
					label="' + _localize("allowSessionLabel") + '"\
					accesskey="' + _localize("allowSessionAccesskey") + '" />\
				<menuitem type="radio" cb_permission="' + cp.ACCESS_ALLOW + '"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsICookiePermission.ACCESS_ALLOW);"\
					label="' + _localize("allowLabel") + '"\
					accesskey="' + _localize("allowAccesskey") + '" />\
				<menuseparator />\
				<menuitem\
					oncommand="this.parentNode.parentNode.permissions.openCookiesPermissions();"\
					label="' + _localize("showPermissionsLabel") + '"\
					accesskey="' + _localize("showPermissionsAccesskey") + '" />\
				<menuitem\
					oncommand="this.parentNode.parentNode.permissions.showCookies();"\
					label="' + _localize("showCookiesLabel") + '"\
					accesskey="' + _localize("showCookiesAccesskey") + '" />\
				<menuseparator />\
				<menuitem\
					oncommand="this.parentNode.parentNode.permissions.removeUnprotectedCookies(false);"\
					label="' + _localize("removeUnprotectedCookiesLabel") + '"\
					tooltiptext="' + _localize("removeUnprotectedCookiesTip") + '"\
					accesskey="' + _localize("removeUnprotectedCookiesAccesskey") + '" />\
				<menuitem\
					oncommand="this.parentNode.parentNode.permissions.removeUnprotectedCookies(true);"\
					label="' + _localize("removeAllUnprotectedCookiesLabel") + '"\
					accesskey="' + _localize("removeAllUnprotectedCookiesAccesskey") + '" />\
				<menuseparator />\
				<menuitem\
					cb_id="removeCurrentSiteCookies"\
					oncommand="this.parentNode.parentNode.permissions.removeCurrentSiteCookies();"\
					label="' + _localize("removeCurrentSiteCookiesLabel") + '"\
					accesskey="' + _localize("removeCurrentSiteCookiesAccesskey") + '" />\
				<menuitem\
					cb_id="removeAllCookies"\
					oncommand="this.parentNode.parentNode.permissions.removeCookies();"\
					label="' + _localize("removeAllCookiesLabel") + '"\
					accesskey="' + _localize("removeAllCookiesAccesskey") + '" />\
				<menuseparator />\
				<menu\
					label="' + _localize("buttonMenu") + '"\
					accesskey="' + _localize("buttonMenuAccesskey") + '" />\
			</menupopup>'
		));
		var cbPopup = document.getElementById(this.button.defaultContextId);
		if(!cbPopup)
			Components.utils.reportError("[Custom Buttons :: Cookies Permissions]: cb menu not found");
		else {
			cbPopup = cbPopup.cloneNode(true);
			let id = "-" + this.button.id.match(/\d*$/)[0] + "-cloned";
			cbPopup.id += id;
			Array.slice(cbPopup.getElementsByAttribute("id", "*")).forEach(function(node) {
				node.id += id;
			});
			let menu = mp.lastChild;
			menu.appendChild(cbPopup);
		}

		var dummy = function() {};
		this.progressListener = {
			context: this,
			onStateChange: dummy,
			onProgressChange: dummy,
			onLocationChange: function(aWebProgress, aRequest, aLocation) {
				this.context.updButtonState();
			},
			onStatusChange: dummy,
			onSecurityChange: dummy
		};
		gBrowser.addProgressListener(this.progressListener/*, Components.interfaces.nsIWebProgress.NOTIFY_LOCATION*/);

		this.permissionsObserver = {
			context: this,
			observe: function(subject, topic, data) {
				if(topic != "perm-changed")
					return;
				var permission = subject.QueryInterface(Components.interfaces.nsIPermission);
				if(permission.type != this.context.permissionType)
					return;
				this.context.updButtonState();
				if(data == "deleted") {
					// See chrome://browser/content/preferences/permissions.js
					// observe: function (aSubject, aTopic, aData)
					let win = this.context.wm.getMostRecentWindow("Browser:Permissions");
					win && win.gPermissionManager._loadPermissions();
				}
			}
		};
		this.oSvc.addObserver(this.permissionsObserver, "perm-changed", false);

		this.initCleanupTimer();
		this.updButtonState();
	},
	destroy: function() {
		if(!this.initialized)
			return;
		this.initialized = false;

		gBrowser.removeProgressListener(this.progressListener);
		this.oSvc.removeObserver(this.permissionsObserver, "perm-changed");
		this.progressListener = this.permissionsObserver = null;
	},
	initCleanupTimer: function() {
		//if(this.options.removeUnprotectedCookiesInterval > 0) {
		//	setInterval(function(_this) {
		//		_this.removeUnprotectedCookies();
		//	}, this.options.removeUnprotectedCookiesInterval, this);
		//}
		var interval = this.options.removeUnprotectedCookiesInterval;
		if(interval <= 0)
			return;
		var timerId = this.timerId;
		var timer = this.timer = Application.storage.get(timerId, null);
		if(timer)
			return;
		timer = this.timer = {
			timerId: timerId,
			interval: interval,
			permissions: this,
			get timer() {
				delete this.timer;
				return this.timer = Components.classes["@mozilla.org/timer;1"]
					.createInstance(Components.interfaces.nsITimer);
			},
			init: function() {
				window.addEventListener("unload", this, false);
				this.permissions.oSvc.addObserver(this, "quit-application-granted", false);
				this.timer.init(this, this.interval, this.timer.TYPE_REPEATING_SLACK);
			},
			destroy: function() {
				this.permissions.oSvc.removeObserver(this, "quit-application-granted");
				this.timer.cancel();
				Application.storage.set(this.timerId, null);
				this.permissions = null;
			},
			handleEvent: function(e) {
				if(e.type != "unload")
					return;
				window.removeEventListener("unload", this, false);
				var p = this.permissions;
				p.button = p.mp = null;
			},
			observe: function(subject, topic, data) {
				if(topic == "quit-application-granted")
					this.destroy();
				else if(topic == "timer-callback")
					this.permissions.removeUnprotectedCookies();
			}
		};
		Application.storage.set(timerId, timer);
		timer.init();
	},

	get currentHost() {
		var loc = content.location;
		if(["view-source:", "about:", "chrome:", "resource:", "javascript:", "data:"].indexOf(loc.protocol) == -1) try {
			return loc.hostname;
		}
		catch(e) {
		}
		return "";
	},
	get currentBaseDomain() {
		var host = this.currentHost;
		if(host) try {
			return this.tld.getBaseDomainFromHost(host);
		}
		catch(e) {
		}
		return host;
	},
	get currentHosts() { // returns hosts from all visible tabs in all windows
		var tmp = { __proto__: null };
		var ws = this.wm.getEnumerator("navigator:browser");
		while(ws.hasMoreElements()) {
			let w = ws.getNext();
			let gBrowser = w.gBrowser;
			let tabs = gBrowser.visibleTabs || gBrowser.tabs || gBrowser.tabContainer.childNodes;
			for(let i = 0, l = tabs.length; i < l; ++i) {
				let tab = tabs[i];
				let browser = tab.linkedBrowser;
				if(!browser)
					continue;
				let host;
				try {
					let uri = browser.currentURI;
					if(["view-source", "about", "chrome", "resource", "javascript", "data"].indexOf(uri.scheme) != -1)
						continue;
					host = uri.host;
				}
				catch(e) {
					continue;
				}
				if(!host)
					continue;
				if(this.options.useBaseDomain.preserveCurrentSiteCookies) try {
					host = this.tld.getBaseDomainFromHost(host);
				}
				catch(e) {
				}
				tmp[host] = true;
			}
		}
		var hosts = [];
		for(var host in tmp)
			hosts.push(host);
		return hosts;
	},
	get isSeaMonkey() {
		return Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo)
			.name == "SeaMonkey";
	},
	getURI: function(host) {
		//if(host == "www.google.ru") host += "::: malformed test";
		if(host.indexOf(":") != -1 && /^[:\da-f.]+$/.test(host)) // IPv6
			host = "[" + host + "]";
		try {
			return this.io.newURI("http://" + host, null, null);
		}
		catch(e) {
			Components.utils.reportError("[Custom Buttons :: Cookies Permissions] Invalid host: \"" + host + "\"");
			throw e;
		}
	},

	showMenu: function(e, isContext, mp) {
		document.popupNode = this.button.ownerDocument.popupNode = this.button;
		if(!mp)
			mp = this.mp;
		if("openPopupAtScreen" in mp)
			mp.openPopupAtScreen(e.screenX, e.screenY, isContext);
		else
			mp.showPopup(this, e.screenX, e.screenY, isContext ? "context" : "popup", null, null);
	},
	updMenu: function() {
		var permission = this.getPermission();

		var noPermissions = permission == this.PERMISSIONS_NOT_SUPPORTED;
		Array.forEach(
			this.mp.getElementsByAttribute("cb_permission", "*"),
			function(mi) {
				mi.hidden = noPermissions;
				var ns = mi.nextSibling;
				if(ns && ns.localName == "menuseparator")
					ns.hidden = noPermissions;
			}
		);

		var mi = this.mp.getElementsByAttribute("cb_permission", permission);
		mi.length && mi[0].setAttribute("checked", "true");

		var mi = this.mp.getElementsByAttribute("cb_id", "removeCurrentSiteCookies")[0];
		mi.hidden = noPermissions;
		//var sep = mi.previousSibling;
		//if(sep && sep.localName == "menuseparator")
		//	sep.hidden = noPermissions;
		if(!noPermissions)
			mi.tooltipText = this.removeCurrentSiteCookiesHost;

		return true;
	},

	openCookiesPermissions: function() {
		var host = this.options.useBaseDomain.openPermissions
			? this.currentBaseDomain
			: this.currentHost;

		if(this.isSeaMonkey) {
			this.openCookiesPermissionsSM(host);
			return;
		}

		// chrome://browser/content/preferences/privacy.js
		// gPrivacyPane.showCookieExceptions()
		var bundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
			.getService(Components.interfaces.nsIStringBundleService)
			.createBundle("chrome://browser/locale/preferences/preferences.properties");
		var params = { blockVisible   : true,
					   sessionVisible : true,
					   allowVisible   : true,
					   prefilledHost  : host,
					   permissionType : this.permissionType,
					   windowTitle    : bundle.GetStringFromName("cookiepermissionstitle"),
					   introText      : bundle.GetStringFromName("cookiepermissionstext") };
		var win = this.wm.getMostRecentWindow("Browser:Permissions");
		var _this = this;
		var setFilter = function setFilter(e) {
			e && win.removeEventListener("load", setFilter, false);
			setTimeout(function() {
				_this.setTextboxValue(win.document.getElementById("url"), host, !!e);
			}, 0);
		};
		if(win) {
			win.focus();
			host && setFilter();
		}
		else {
			win = window.openDialog("chrome://browser/content/preferences/permissions.xul", "_blank", "", params);
			host && win.addEventListener("load", setFilter, false);
		}

		this.tweakWindow(win);
	},
	openCookiesPermissionsSM: function(host) {
		var win = this.wm.getMostRecentWindow("mozilla:cookieviewer");
		var _this = this;
		var setFilter = function setFilter(e) {
			e && win.removeEventListener("load", setFilter, false);
			var doc = win.document;
			doc.getElementById("tabbox").selectedTab = doc.getElementById("permissionsTab");
			_this.setTextboxValue(doc.getElementById("cookie-site"), host);
			//win.buttonEnabling(tb);
		};
		if(win) {
			win.focus();
			host && setFilter();
		}
		else {
			win = window.openDialog("chrome://communicator/content/permissions/cookieViewer.xul", "_blank", "");
			host && win.addEventListener("load", setFilter, false);
		}
	},
	tweakWindow: function(win) {
		if("__cbCookiesPermissionsTweaked" in win)
			return;
		win.__cbCookiesPermissionsTweaked = true;
		var keypressHandler = function(e) {
			if(e.keyCode == e.DOM_VK_ESCAPE)
				win.close();
		};
		win.addEventListener("keypress", keypressHandler, false);
		win.addEventListener("unload", function destroy(e) {
			var win = e.target.defaultView;
			if(win !== win.top || e.target.location.protocol != "chrome:")
				return;
			win.removeEventListener(e.type, destroy, false);
			win.removeEventListener("keydown", keypressHandler, false);
		}, false);
	},
	setTextboxValue: function(tb, val, onlySelect) {
		if(!tb)
			return;
		if(!onlySelect)
			tb.value = val;
		tb.focus();
		if(val && "inputField" in tb) {
			var ifi = tb.inputField;
			switch(this.options.prefillMode) {
				case 0: ifi.selectionStart = ifi.selectionEnd = 0;          break;
				case 2: ifi.selectionStart = ifi.selectionEnd = val.length; break;
				default: tb.select();
			}
		}
		if(onlySelect)
			return;
		setTimeout(function() { // For Browser:Cookies in Firefox 14
			tb.doCommand(); // Should be faster than "input" emulation
		}, 0);
		var evt = document.createEvent("UIEvents");
		evt.initUIEvent("input", true, true, tb.ownerDocument.defaultView, 0);
		tb.dispatchEvent(evt);
	},

	addPermission: function(capability) {
		// capability:
		//  this.cp.ACCESS_DENY
		//  this.cp.ACCESS_SESSION
		//  this.cp.ACCESS_ALLOW

		var host = this.options.useBaseDomain.addPermission
			? this.currentBaseDomain
			: this.currentHost;
		if(!host)
			return;

		this.updButtonState(capability); // Faster than ProgressListener (70-80 ms for me)

		var pm = this.pm;
		var enumerator = pm.enumerator;
		while(enumerator.hasMoreElements()) {
			let permission = enumerator.getNext()
				.QueryInterface(Components.interfaces.nsIPermission);
			if(permission.type == this.permissionType && permission.host == host && permission.capability == capability)
				return; // Already added
		}

		pm.add(this.getURI(host), this.permissionType, capability);
	},
	removePermission: function() {
		var host = this.currentHost;
		if(!host)
			return;

		this.updButtonState(this.cp.ACCESS_DEFAULT); // Faster than ProgressListener (70-80 ms for me)

		var uri = this.getURI(host);
		var permission = this.pm.testPermission(uri, this.permissionType);
		this.pm.remove(host, this.permissionType);
		while(this.pm.testPermission(uri, this.permissionType) == permission) {
			let parentHost = host.replace(/^[^.]*\./, "");
			if(parentHost == host)
				break;
			host = parentHost;
			this.pm.remove(host, this.permissionType);
		}
	},
	togglePermission: function(capability) {
		var permission = this.getPermission();
		if(permission == this.PERMISSIONS_NOT_SUPPORTED)
			return;
		if(permission == capability)
			this.removePermission();
		else
			this.addPermission(capability);
	},
	getPermission: function() {
		var host = this.currentHost;
		return host
			? this.pm.testPermission(this.getURI(host), this.permissionType)
			: this.PERMISSIONS_NOT_SUPPORTED;
	},
	showCookies: function() {
		var host = this.options.useBaseDomain.showCookies
			? this.currentBaseDomain
			: this.currentHost;
		if(this.isSeaMonkey) {
			this.showCookiesSM(host);
			return;
		}
		var win = this.wm.getMostRecentWindow("Browser:Cookies");
		var _this = this;
		var setFilter = function setFilter(e) {
			e && win.removeEventListener("load", setFilter, false);
			_this.setTextboxValue(win.document.getElementById("filter"), host);
		};
		if(win) {
			win.focus();
			host && setFilter();
		}
		else {
			win = window.openDialog("chrome://browser/content/preferences/cookies.xul", "_blank", "");
			host && win.addEventListener("load", setFilter, false);
		}
		this.tweakWindow(win);
	},
	showCookiesSM: function(host) {
		var win = this.wm.getMostRecentWindow("mozilla:cookieviewer");
		var _this = this;
		var setFilter = function setFilter(e) {
			e && win.removeEventListener("load", setFilter, false);
			var doc = win.document;
			doc.getElementById("tabbox").selectedTab = doc.getElementById("cookiesTab");
			_this.setTextboxValue(doc.getElementById("filter"), host);
		};
		if(win) {
			win.focus();
			host && setFilter();
		}
		else {
			win = window.openDialog("chrome://communicator/content/permissions/cookieViewer.xul", "_blank", "");
			host && win.addEventListener("load", setFilter, false);
		}
	},
	removeUnprotectedCookies: function(removeAll) {
		if(removeAll == undefined)
			removeAll = this.options.removeAllUnprotectedCookies;
		var cp = this.cp;
		if(!removeAll) {
			let hosts = this.currentHosts;
			let checkCookieHost = this.checkCookieHost;
			var checkCookieHosts = function(cookieHost) {
				return !hosts.some(function(host) {
					return checkCookieHost(cookieHost, host);
				});
			};
		}
		this.removeCookies([
			cp.ACCESS_DEFAULT,
			/*cp.ACCESS_ALLOW,*/
			cp.ACCESS_DENY,
			cp.ACCESS_SESSION
		], checkCookieHosts);
	},
	get removeCurrentSiteCookiesHost() {
		return this.options.useBaseDomain.removeCurrentSiteCookies
			? this.currentBaseDomain
			: this.currentHost;
	},
	removeCurrentSiteCookies: function() {
		var host = this.removeCurrentSiteCookiesHost;
		var checkCookieHost = this.checkCookieHost;
		this.removeCookies(null, function(cookieHost) {
			return checkCookieHost(cookieHost, host);
		});
	},
	checkCookieHost: function(cookieHost, host) {
		return host == cookieHost
			|| cookieHost.substr(-host.length - 1) == "." + host;
	},
	removeCookies: function(types, checkHost) {
		var cm = this.cm;
		var pm = this.pm;
		var cookies = cm.enumerator;
		while(cookies.hasMoreElements()) {
			let cookie = cookies.getNext()
				.QueryInterface(Components.interfaces.nsICookie);
			let cookieHost = cookie.host;
			if(checkHost && !checkHost.call(this, cookieHost)) {
				//LOG("Don't remove: " + cookieHost);
				continue;
			}
			//LOG("!!! Remove: " + cookieHost);
			let uri = this.getURI(cookieHost);
			if(types && types.indexOf(pm.testPermission(uri, this.permissionType)) == -1)
				continue;
			cm.remove(cookieHost, cookie.name, cookie.path, false);
		}
	},

	updButtonState: function(permission) {
		var ttAdd = "";
		if(permission === undefined) try {
			permission = this.getPermission();
		}
		catch(e) { // See this.getURI()
			Components.utils.reportError(e);
			ttAdd = " \n" + e;
			permission = this.PERMISSIONS_ERROR;
		}
		var cp = this.cp;
		var key;
		switch(permission) {
			case this.PERMISSIONS_NOT_SUPPORTED: key = "notAvailable"; break;
			case this.PERMISSIONS_ERROR:         key = "error";        break;
			case cp.ACCESS_DEFAULT:              key = "default";      break;
			case cp.ACCESS_ALLOW:                key = "allow";        break;
			case cp.ACCESS_DENY:                 key = "deny";         break;
			case cp.ACCESS_SESSION:              key = "allowSession"; break;
			default:                             key = "unknown";
		}
		var btn = this.button;
		if(btn.getAttribute("cb_cookies") == key)
			return;
		btn.disabled = permission == this.PERMISSIONS_NOT_SUPPORTED;
		btn.setAttribute("cb_cookies", key);
		btn.tooltipText = _localize(key + "Tooltiptext") + ttAdd;
	},

	hasModifier: function(e) {
		return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
	},
	parseXULFromString: function(xul) {
		xul = xul.replace(/>\s+</g, "><");
		return new DOMParser().parseFromString(xul, "application/xml").documentElement;
	}
};

//===================
// Styles
// Used Fugue and Diagona icons (http://p.yusukekamiyamane.com/)
this.image = ""; // Styles aren't applied, if button has "image" attribute
var cssStr = '\
	@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
	@-moz-document url("%windowURL%") {\n\
		%button% {\n\
			list-style-image: url("data:image/png;base64,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") !important;\n\
			-moz-image-region: rect(0, 16px, 16px, 0) !important;\n\
		}\n\
		%button%[cb_cookies="default"]      { -moz-image-region: rect(0, 16px, 16px, 0)    !important; }\n\
		%button%[cb_cookies="allow"]        { -moz-image-region: rect(0, 32px, 16px, 16px) !important; }\n\
		%button%[cb_cookies="allowSession"] { -moz-image-region: rect(0, 48px, 16px, 32px) !important; }\n\
		%button%[cb_cookies="deny"]         { -moz-image-region: rect(0, 64px, 16px, 48px) !important; }\n\
		%button%[cb_cookies="unknown"],\n\
		%button%[cb_cookies="error"]        { -moz-image-region: rect(0, 80px, 16px, 64px) !important; }\n\
		%button%[cb_cookies="notAvailable"] { -moz-image-region: rect(0, 96px, 16px, 80px) !important; }\n\
	}'
	.replace(/%windowURL%/g, window.location.href)
	.replace(/%button%/g, "#" + this.id);
var cssURI = this.cssURI = Components.classes["@mozilla.org/network/io-service;1"]
	.getService(Components.interfaces.nsIIOService)
	.newURI("data:text/css," + encodeURIComponent(cssStr), null, null);
var sss = this.sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
	.getService(Components.interfaces.nsIStyleSheetService);
if(!sss.sheetRegistered(cssURI, sss.USER_SHEET))
	sss.loadAndRegisterSheet(cssURI, sss.USER_SHEET);


this.onDestroy = function(reason) {
	if(reason == "update" || reason == "delete") {
		let sss = this.sss;
		let cssURI = this.cssURI;
		if(sss.sheetRegistered(cssURI, sss.USER_SHEET))
			sss.unregisterSheet(cssURI, sss.USER_SHEET);
		if(this.permissions.timer)
			this.permissions.timer.destroy();
	}
	this.permissions.destroy();
};
this.permissions.init();