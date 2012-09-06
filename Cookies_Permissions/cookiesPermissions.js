// http://infocatcher.ucoz.net/js/cb/cookiesPermissions.js
// http://forum.mozilla-russia.org/viewtopic.php?pid=580201
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Cookies_Permissions

// Cookies Permissions button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2010-2012
// version 0.2.0pre10 - 2012-09-05

var options = {
	removeUnprotectedCookiesInterval: -1,
	// Periodically remove unprotected cookies (leave only cookies with "Allow" permission)
	// Time in milliseconds like 30*60*1000 (30 minutes) or -1 to disable
	removeAllUnprotectedCookies: false,
	// true  - periodically ("removeUnprotectedCookiesInterval" option) remove all unprotected cookies
	// false - or exclude cookies from opened sites
	useBaseDomain: { // If set to true, will use short domain like google.com instead of www.google.com
		addPermission: false, // Add (and toggle) permission action
		openPermissions: false,  // Filter in "Show Exceptions" window
		showCookies: true, // Filter in "Show Cookies" window
		removeCurrentSiteCookies: true, // For "Remove All Current Site Cookies" action
		preserveCurrentSitesCookies: true // For "removeAllUnprotectedCookies: false"
	},
	showDefaultPolicy: true, // Show default cookies policy
	toggleMode: Components.interfaces.nsICookiePermission.ACCESS_ALLOW,
	// ACCESS_DENY, ACCESS_SESSION or ACCESS_ALLOW
	useCookiesManagerPlus: true, // https://addons.mozilla.org/firefox/addon/cookies-manager-plus/
	prefillMode: 1, // 0 - move caret to start, 1 - select all, 2 - move caret to end
	moveToSeaMonkeyStatusBar: {
		// Move button to Status Bar, only for SeaMonkey
		// Be careful, has some side-effects and button can't be edited w/o restart
		enabled: true,
		insertAfter: "popupIcon,statusbar-progresspanel"
		// Like https://developer.mozilla.org/en-US/docs/XUL/Attribute/insertafter
		// Also looks for nodes with "cb_id" attribute
	}
};

function _localize(sid) {
	var strings = {
		en: {
			defaultTooltiptext: "Cookies: Default",
			denyTooltiptext: "Cookies: Block",
			allowSessionTooltiptext: "Cookies: Allow for Session",
			allowTooltiptext: "Cookies: Allow",
			notAvailableTooltiptext: "Cookies: n/a",
			unknownTooltiptext: "Cookies: ???",
			errorTooltiptext: "Cookies: Error!",

			defaultDenyTooltiptext: "Cookies: Block (Default)",
			defaultAllowSessionTooltiptext: "Cookies: Allow for Session (Default)",
			defaultAllowTooltiptext: "Cookies: Allow (Default)",

			defaultLabel: "Default",
			defaultAccesskey: "D",
			denyLabel: "Block",
			denyAccesskey: "B",
			allowSessionLabel: "Allow for Session",
			allowSessionAccesskey: "S",
			allowLabel: "Allow",
			allowAccesskey: "A",

			showPermissionsLabel: "Show Exceptions…",
			showPermissionsAccesskey: "x",
			showCookiesLabel: "Show Cookies…",
			showCookiesAccesskey: "h",
			removeUnprotectedCookiesLabel: "Remove Unprotected Cookies",
			removeUnprotectedCookiesTip: "Except cookies marked as “Allow” and except cookies from opened sites",
			removeUnprotectedCookiesAccesskey: "U",
			removeAllUnprotectedCookiesLabel: "Remove All Unprotected Cookies",
			removeAllUnprotectedCookiesTip: "Except cookies marked as “Allow”; unprotected cookies from opened sites will be removed",
			removeAllUnprotectedCookiesAccesskey: "R",
			removeCurrentSiteCookiesLabel: "Remove All Current Site Cookies",
			removeCurrentSiteCookiesAccesskey: "C",
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

			defaultDenyTooltiptext: "Cookies: Блокировать (по умолчанию)",
			defaultAllowSessionTooltiptext: "Cookies: Разрешить на сессию (по умолчанию)",
			defaultAllowTooltiptext: "Cookies: Разрешить (по умолчанию)",

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
			removeUnprotectedCookiesTip: "Исключая cookies, помеченные как «Разрешить», и исключая cookies из открытых сайтов",
			removeUnprotectedCookiesAccesskey: "н",
			removeAllUnprotectedCookiesLabel: "Удалить все незащищённые cookies",
			removeAllUnprotectedCookiesTip: "Исключая cookies, помеченные как «Разрешить»; незащищённые cookies из открытых сайтов будут удалены",
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
		this.permissions.togglePermission(this.permissions.options.toggleMode);
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

	errPrefix: "[Custom Buttons :: Cookies Permissions] ",

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

		if(this.isSeaMonkey && this.options.moveToSeaMonkeyStatusBar.enabled)
			this.moveToSeaMonkeyStatusBar();

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
					tooltiptext="' + _localize("removeAllUnprotectedCookiesTip") + '"\
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
			Components.utils.reportError(this.errPrefix + "cb menu not found");
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

		if(this.options.showDefaultPolicy) {
			let po = this.prefsObserver = {
				context: this,
				get prefs() {
					delete this.prefs;
					return this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.QueryInterface(Components.interfaces.nsIPrefBranch2 || Components.interfaces.nsIPrefBranch)
						.getBranch("network.cookie.");
				},
				getIntPref: function(name) {
					try {
						return this.prefs.getIntPref(name);
					}
					catch(e) {
						Components.utils.reportError(e);
					}
					return 0;
				},
				observe: function(subject, topic, data) {
					if(topic != "nsPref:changed")
						return;
					if(data != "cookieBehavior" && data != "lifetimePolicy")
						return;
					this.context.prefs[data] = this.getIntPref(data);
					this.context.updButtonState();
				}
			};
			this.prefs = {
				"cookieBehavior": po.getIntPref("cookieBehavior"),
				"lifetimePolicy": po.getIntPref("lifetimePolicy"),
				__proto__: null
			};
			po.prefs.addObserver("", po, false);
		}

		this.initCleanupTimer();
		this.updButtonState();
	},
	destroy: function() {
		if(!this.initialized)
			return;
		this.initialized = false;

		gBrowser.removeProgressListener(this.progressListener);
		this.oSvc.removeObserver(this.permissionsObserver, "perm-changed");
		if(this.options.showDefaultPolicy)
			this.prefsObserver.prefs.removeObserver("", this.prefsObserver);
		this.progressListener = this.permissionsObserver = this.prefsObserver = null;
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
			storage: Application.storage, // Object from closed window can be not available, so cache it
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
				this.storage.set(this.timerId, null);
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
	moveToSeaMonkeyStatusBar: function() {
		var insPoint;
		this.options.moveToSeaMonkeyStatusBar.insertAfter
			.split(/,\s*/)
			.some(function(id) {
				insPoint = document.getElementsByAttribute("cb_id", id)[0]
					|| document.getElementById(id);
				return insPoint;
			});
		if(!insPoint)
			return;

		var btn = this.button;
		// Make <toolbarbutton> looks like <image>
		btn.classList.remove("toolbarbutton-1");
		btn.removeAttribute("label");
		btn.setAttribute("style", '\
			-moz-appearance: none !important;\
			border: none !important;\
			margin: 0 !important;\
			padding: 0 !important;'
		);
		// And insert it into <statusbarpanel>
		var spId = btn.id + "-statusbarpanel";
		var sp = document.getElementById(spId);
		sp && sp.parentNode.removeChild(sp);
		sp = document.createElement("statusbarpanel");
		sp.id = spId;
		sp.setAttribute("cb_id", "custombuttons-cookiesPermissionsSBPanel");
		sp.appendChild(btn);
		insPoint.parentNode.insertBefore(sp, insPoint.nextSibling);
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
				if(this.options.useBaseDomain.preserveCurrentSitesCookies) try {
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
		delete this.isSeaMonkey;
		return this.isSeaMonkey = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo)
			.name == "SeaMonkey";
	},
	getURI: function(host) {
		if(host.indexOf(":") != -1 && /^[:\da-f.]+$/.test(host)) // IPv6
			host = "[" + host + "]";
		try {
			return this.io.newURI("http://" + host, null, null);
		}
		catch(e) {
			Components.utils.reportError(this.errPrefix + "Invalid host: \"" + host + "\"");
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
	get defaultPermission() {
		// http://kb.mozillazine.org/Network.cookie.cookieBehavior
		// http://kb.mozillazine.org/Network.cookie.lifetimePolicy
		if(this.prefs.cookieBehavior == 2)
			return this.cp.ACCESS_DENY;
		if(this.prefs.lifetimePolicy == 2)
			return this.cp.ACCESS_SESSION;
		return this.cp.ACCESS_ALLOW;
	},
	showCookies: function() {
		var host = this.options.useBaseDomain.showCookies
			? this.currentBaseDomain
			: this.currentHost;
		if("coomanPlus" in window && "coomanPlusCore" in window && this.options.useCookiesManagerPlus) {
			// https://addons.mozilla.org/firefox/addon/cookies-manager-plus/
			this.showCookiesCMP(host);
			return;
		}
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
	showCookiesCMP: function(host) {
		// See openCMP() function in resource://cookiesmanagerplus/coomanPlusCore.jsm
		var win = coomanPlusCore.aWindow;
		var _this = this;
		var setFilter = function setFilter(e) {
			e && win.removeEventListener("load", setFilter, false);
			var doc = win.document;
			setTimeout(function() { // Just loaded window aren't ready
				_this.setTextboxValue(doc.getElementById("lookupcriterium"), host);
			}, 0);
		};
		if(win) {
			win.focus();
			host && setFilter();
		}
		else {
			win = window.openDialog(
				"chrome://cookiesmanagerplus/content/cookiesmanagerplus.xul",
				"coomanPlusWindow", "chrome,resizable=yes,toolbar=no,statusbar=no,scrollbar=no,centerscreen"
			);
			host && win.addEventListener("load", setFilter, false);
		}
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
			case cp.ACCESS_DEFAULT:
				key = "default";
				if(this.options.showDefaultPolicy) switch(this.defaultPermission) {
					case cp.ACCESS_ALLOW:        key = "defaultAllow";        break;
					case cp.ACCESS_DENY:         key = "defaultDeny";         break;
					case cp.ACCESS_SESSION:      key = "defaultAllowSession";
				}
			break;
			case cp.ACCESS_ALLOW:                key = "allow";               break;
			case cp.ACCESS_DENY:                 key = "deny";                break;
			case cp.ACCESS_SESSION:              key = "allowSession";        break;
			case this.PERMISSIONS_NOT_SUPPORTED: key = "notAvailable";        break;
			case this.PERMISSIONS_ERROR:         key = "error";               break;
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
		%button%[cb_cookies="default"]             { -moz-image-region: rect(0, 16px, 16px, 0)    !important; }\n\
		%button%[cb_cookies="allow"]               { -moz-image-region: rect(0, 32px, 16px, 16px) !important; }\n\
		%button%[cb_cookies="allowSession"]        { -moz-image-region: rect(0, 48px, 16px, 32px) !important; }\n\
		%button%[cb_cookies="deny"]                { -moz-image-region: rect(0, 64px, 16px, 48px) !important; }\n\
		%button%[cb_cookies="unknown"],\n\
		%button%[cb_cookies="error"]               { -moz-image-region: rect(0, 80px, 16px, 64px) !important; }\n\
		%button%[cb_cookies="notAvailable"]        { -moz-image-region: rect(0, 96px, 16px, 80px) !important; }\n\
		%button%[cb_cookies="defaultAllow"]        { -moz-image-region: rect(16px, 32px, 32px, 16px) !important; }\n\
		%button%[cb_cookies="defaultAllowSession"] { -moz-image-region: rect(16px, 48px, 32px, 32px) !important; }\n\
		%button%[cb_cookies="defaultDeny"]         { -moz-image-region: rect(16px, 64px, 32px, 48px) !important; }\n\
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