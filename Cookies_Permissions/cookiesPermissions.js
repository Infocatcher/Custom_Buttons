// http://infocatcher.ucoz.net/js/cb/cookiesPermissions.js
// https://forum.mozilla-russia.org/viewtopic.php?id=56039
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Cookies_Permissions

// Cookies Permissions button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2010-2016
// version 0.2.1pre4 - 2016-11-24

var {Components} = window; // Prevent garbage collection in Firefox 3.6 and older

var cp = Components.interfaces.nsICookiePermission;
var options = {
	removeUnprotectedCookiesEnabled: false,
	// true  - periodically remove unprotected cookies by default
	// false - don't remove by default
	removeUnprotectedCookiesInterval: 10*60*1000,
	// Periodically remove unprotected cookies (leave only cookies with "Allow" permission)
	// Time in milliseconds like 30*60*1000 (30 minutes) or -1 to disable
	removeAllUnprotectedCookies: false,
	// true  - periodically ("removeUnprotectedCookiesInterval" option) remove all unprotected cookies
	// false - or exclude cookies from opened sites
	showTempPermissions: true, // Show items about temporary permissions (only Gecko 2.0+)
	tempExpire: -1, // Type of temporary permissions
	// -1 - session, otherwise - expire after given time (in milliseconds)
	useBaseDomain: {
		// 0 - use full domain name: addons.mozilla.org, www.google.com
		// 1 - strip "www." prefix from full domain name: addons.mozilla.org, google.com
		// 2 - use top-level domains (TLDs): mozilla.org, google.com
		addPermission: 1, // Add (and toggle) permission action
		openPermissions: 0,  // Filter in "Show Exceptions" window
		showCookies: 2, // Filter in "Show Cookies" window
		removeCurrentSiteCookies: 2, // For "Remove All Current Site Cookies" action
		preserveCurrentSitesCookies: 2 // For "removeAllUnprotectedCookies: false"
	},
	showDefaultPolicy: true, // Show default cookies policy
	toggleMode: [cp.ACCESS_ALLOW, cp.ACCESS_DENY, cp.ACCESS_DEFAULT],
	// ACCESS_DENY, ACCESS_SESSION, ACCESS_ALLOW or ACCESS_DEFAULT
	useCookiesManagerPlus: true, // https://addons.mozilla.org/firefox/addon/cookies-manager-plus/
	reusePermissionsWindow: false, // Use any already opened permissions window
	// E.g. "Show Exceptions" may convert "Allowed Sites - Add-ons Installation" to "Exceptions - Cookies"
	prefillMode: 1, // 0 - move caret to start, 1 - select all, 2 - move caret to end
	confirmRemoval: true,
	moveToStatusBar: {
		// Move button to Status Bar, only for SeaMonkey or Firefox < 4.0
		// Be careful, has some side-effects and button can't be edited w/o restart
		enabled: false,
		insertAfter: "download-monitor,popupIcon,statusbar-progresspanel"
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
			denyTempLabel: "Temporarily Block",
			denyTempAccesskey: "k",
			allowSessionLabel: "Allow for Session",
			allowSessionAccesskey: "S",
			allowSessionTempLabel: "Temporarily Allow for Session",
			allowSessionTempAccesskey: "e",
			allowLabel: "Allow",
			allowAccesskey: "A",
			allowTempLabel: "Temporarily Allow",
			allowTempAccesskey: "w",

			showPermissionsLabel: "Show Exceptions…",
			showPermissionsAccesskey: "x",
			showCookiesLabel: "Show Cookies…",
			showCookiesAccesskey: "h",
			removeTempPermissionsLabel: "Remove Temporary Permissions",
			removeTempPermissionsAccesskey: "T",
			autoRemoveUnprotectedCookiesLabel: "Automatically Remove Unprotected Cookies",
			autoRemoveUnprotectedCookiesTip: "Periodically remove unprotected cookies (if checked)",
			autoRemoveUnprotectedCookiesAccesskey: "n",
			removeUnprotectedCookiesLabel: "Remove Unprotected Cookies",
			removeUnprotectedCookiesTip: "Except cookies marked as “Allow” and except cookies from opened sites",
			removeUnprotectedCookiesAccesskey: "U",
			removeUnprotectedCookiesConfirm: "Remove unprotected cookies?",
			removeAllUnprotectedCookiesLabel: "Remove All Unprotected Cookies",
			removeAllUnprotectedCookiesTip: "Except cookies marked as “Allow”; unprotected cookies from opened sites will be removed",
			removeAllUnprotectedCookiesAccesskey: "R",
			removeAllUnprotectedCookiesConfirm: "Remove ALL unprotected cookies?",
			removeCurrentSiteCookiesLabel: "Remove All Current Site Cookies",
			removeCurrentSiteCookiesAccesskey: "C",
			removeCurrentSiteCookiesConfirm: "Remove ALL current site cookies?",
			removeAllCookiesLabel: "Remove ALL Cookies",
			removeAllCookiesAccesskey: "L",
			removeAllCookiesConfirm: "Remove ALL cookies?",

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
			denyTempLabel: "Временно блокировать",
			denyTempAccesskey: "л",
			allowSessionLabel: "Разрешить на сессию",
			allowSessionAccesskey: "с",
			allowSessionTempLabel: "Временно разрешить на сессию",
			allowSessionTempAccesskey: "е",
			allowLabel: "Разрешить",
			allowAccesskey: "Р",
			allowTempLabel: "Временно разрешить",
			allowTempAccesskey: "ш",

			showPermissionsLabel: "Показать исключения…",
			showPermissionsAccesskey: "и",
			showCookiesLabel: "Показать cookies…",
			showCookiesAccesskey: "П",
			removeTempPermissionsLabel: "Удалить временные исключения",
			removeTempPermissionsAccesskey: "ы",
			autoRemoveUnprotectedCookiesLabel: "Автоматически удалять незащищённые cookies",
			autoRemoveUnprotectedCookiesTip: "Периодически удалять незащищённые cookies (если установлена галочка)",
			autoRemoveUnprotectedCookiesAccesskey: "А",
			removeUnprotectedCookiesLabel: "Удалить незащищённые cookies",
			removeUnprotectedCookiesTip: "Исключая cookies, помеченные как «Разрешить», и исключая cookies из открытых сайтов",
			removeUnprotectedCookiesAccesskey: "н",
			removeUnprotectedCookiesConfirm: "Удалить незащищённые cookies?",
			removeAllUnprotectedCookiesLabel: "Удалить все незащищённые cookies",
			removeAllUnprotectedCookiesTip: "Исключая cookies, помеченные как «Разрешить»; незащищённые cookies из открытых сайтов будут удалены",
			removeAllUnprotectedCookiesAccesskey: "д",
			removeAllUnprotectedCookiesConfirm: "Удалить ВСЕ незащищённые cookies?",
			removeCurrentSiteCookiesLabel: "Удалить все cookies текущего сайта",
			removeCurrentSiteCookiesAccesskey: "в",
			removeCurrentSiteCookiesConfirm: "Удалить все cookies текущего сайта?",
			removeAllCookiesLabel: "Удалить ВСЕ cookies",
			removeAllCookiesAccesskey: "Е",
			removeAllCookiesConfirm: "Удалить ВСЕ cookies?",

			buttonMenu: "Меню кнопки",
			buttonMenuAccesskey: "М"
		}
	};
	var locale = (function() {
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
	_localize = function(sid) {
		return strings[locale] && strings[locale][sid] || strings.en[sid] || sid;
	};
	return _localize.apply(this, arguments);
}

this.onclick = function(e) {
	if(e.target != this)
		return;
	var btn = e.button;
	if(btn == 1 || btn == 0 && this.permissions.hasModifier(e))
		this.permissions.openPermissions();
	else if(btn == 0) {
		this.permissions.togglePermission(this.permissions.options.toggleMode);
		// Prevent "command" event to use "command" section only from hotkey
		e.preventDefault();
		e.stopPropagation();
	}
};
if(!this.hasOwnProperty("defaultContextId"))
	this.defaultContextId = this.getAttribute("context") || "custombuttons-contextpopup";
this.oncontextmenu = function(e) {
	if(e.target != this)
		return;
	this.permissions.initContextOnce();
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
	popupClass: "cbCookiesPermissionsPopup",

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
	mp: null,
	init: function() {
		if(this.initialized)
			return;
		this.initialized = true;

		if(this.options.moveToStatusBar.enabled)
			this.moveToStatusBar();

		var dummy = function() {};
		this.progressListener = {
			context: this,
			onStateChange: dummy,
			onProgressChange: dummy,
			onLocationChange: function(aWebProgress, aRequest, aLocation) {
				setTimeout(function(_this) {
					_this.context.updButtonState();
				}, 0, this);
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
				var type = this.context.permissionType;
				if(permission.type != type)
					return;
				this.context.updButtonState();
				if(data == "deleted") {
					// See chrome://browser/content/preferences/permissions.js
					// observe: function (aSubject, aTopic, aData)
					let win = this.context.wm.getMostRecentWindow("Browser:Permissions");
					if(win && "gPermissionManager" in win && win.gPermissionManager._type == type) {
						let pm = win.gPermissionManager;
						let perms = pm._permissions;
						for(let i = 0, l = perms.length; i < l; ++i) {
							if(this.context.getPermissionHost(perms[i]) == this.context.getPermissionHost(permission)) {
								perms.splice(i, 1);
								--pm._view._rowCount;
								pm._tree.treeBoxObject.rowCountChanged(i, -1);
								pm._tree.treeBoxObject.invalidate();
								break;
							}
						}
					}
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
						.getBranch("network.cookie.")
						.QueryInterface(Components.interfaces.nsIPrefBranch2 || Components.interfaces.nsIPrefBranch);
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
	initContextOnce: function() {
		this.initContextOnce = function() {};

		this.mpId = this.button.id + "-context";
		var cp = this.cp;
		var noTempPermissions = !this.options.showTempPermissions || !this.hasTempPermissions;
		var mp = this.mp = this.button.appendChild(this.parseXULFromString('\
			<menupopup xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"\
				id="' + this.mpId + '"\
				class="' + this.popupClass + '"\
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
				<menuitem type="radio" cb_permission="' + cp.ACCESS_DENY + '-temp"\
					collapsed="' + noTempPermissions + '"\
					class="cbTempPermission"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsICookiePermission.ACCESS_DENY, true);"\
					label="' + _localize("denyTempLabel") + '"\
					accesskey="' + _localize("denyTempAccesskey") + '" />\
				<menuitem type="radio" cb_permission="' + cp.ACCESS_SESSION + '"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsICookiePermission.ACCESS_SESSION);"\
					label="' + _localize("allowSessionLabel") + '"\
					accesskey="' + _localize("allowSessionAccesskey") + '" />\
				<menuitem type="radio" cb_permission="' + cp.ACCESS_SESSION + '-temp"\
					collapsed="' + noTempPermissions + '"\
					class="cbTempPermission"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsICookiePermission.ACCESS_SESSION, true);"\
					label="' + _localize("allowSessionTempLabel") + '"\
					accesskey="' + _localize("allowSessionTempAccesskey") + '" />\
				<menuitem type="radio" cb_permission="' + cp.ACCESS_ALLOW + '"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsICookiePermission.ACCESS_ALLOW);"\
					label="' + _localize("allowLabel") + '"\
					accesskey="' + _localize("allowAccesskey") + '" />\
				<menuitem type="radio" cb_permission="' + cp.ACCESS_ALLOW + '-temp"\
					collapsed="' + noTempPermissions + '"\
					class="cbTempPermission"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsICookiePermission.ACCESS_ALLOW, true);"\
					label="' + _localize("allowTempLabel") + '"\
					accesskey="' + _localize("allowTempAccesskey") + '" />\
				<menuseparator />\
				<menuitem\
					cb_id="openPermissions"\
					oncommand="this.parentNode.parentNode.permissions.openPermissions();"\
					label="' + _localize("showPermissionsLabel") + '"\
					accesskey="' + _localize("showPermissionsAccesskey") + '" />\
				<menuitem\
					cb_id="showCookies"\
					oncommand="this.parentNode.parentNode.permissions.showCookiesEvent(event);"\
					onclick="this.parentNode.parentNode.permissions.showCookiesEvent(event);"\
					label="' + _localize("showCookiesLabel") + '"\
					accesskey="' + _localize("showCookiesAccesskey") + '" />\
				<menuseparator hidden="' + noTempPermissions + '" />\
				<menuitem\
					cb_id="removeTempPermissions"\
					hidden="' + noTempPermissions + '"\
					oncommand="this.parentNode.parentNode.permissions.removeTempPermissions();"\
					label="' + _localize("removeTempPermissionsLabel") + '"\
					accesskey="' + _localize("removeTempPermissionsAccesskey") + '" />\
				<menuseparator />\
				<menuitem\
					cb_id="autoRemoveUnprotectedCookies"\
					type="checkbox"\
					oncommand="this.parentNode.parentNode.permissions.setAutoRemove(this.getAttribute(\'checked\') == \'true\');"\
					label="' + _localize("autoRemoveUnprotectedCookiesLabel") + '"\
					tooltiptext="' + _localize("autoRemoveUnprotectedCookiesTip") + '"\
					accesskey="' + _localize("autoRemoveUnprotectedCookiesAccesskey") + '" />\
				<menuitem\
					cb_id="removeUnprotectedCookies"\
					oncommand="this.parentNode.parentNode.permissions.confirm(\'removeUnprotectedCookiesConfirm\', \'removeUnprotectedCookies\', false);"\
					label="' + _localize("removeUnprotectedCookiesLabel") + '"\
					tooltiptext="' + _localize("removeUnprotectedCookiesTip") + '"\
					accesskey="' + _localize("removeUnprotectedCookiesAccesskey") + '" />\
				<menuitem\
					cb_id="removeAllUnprotectedCookies"\
					oncommand="this.parentNode.parentNode.permissions.confirm(\'removeAllUnprotectedCookiesConfirm\', \'removeUnprotectedCookies\', true);"\
					label="' + _localize("removeAllUnprotectedCookiesLabel") + '"\
					tooltiptext="' + _localize("removeAllUnprotectedCookiesTip") + '"\
					accesskey="' + _localize("removeAllUnprotectedCookiesAccesskey") + '" />\
				<menuseparator />\
				<menuitem\
					cb_id="removeCurrentSiteCookies"\
					oncommand="this.parentNode.parentNode.permissions.confirm(\'removeCurrentSiteCookiesConfirm\', \'removeCurrentSiteCookies\');"\
					label="' + _localize("removeCurrentSiteCookiesLabel") + '"\
					accesskey="' + _localize("removeCurrentSiteCookiesAccesskey") + '" />\
				<menuitem\
					cb_id="removeAllCookies"\
					oncommand="this.parentNode.parentNode.permissions.confirm(\'removeAllCookiesConfirm\', \'removeCookies\');"\
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
			Array.prototype.slice.call(cbPopup.getElementsByAttribute("id", "*")).forEach(function(node) {
				node.id += id;
			});
			cbPopup.setAttribute(
				"onpopupshowing",
				'\
				var btn = document.popupNode = this.parentNode.parentNode.parentNode;\n\
				custombutton.setContextMenuVisibility(btn);'
			);
			let menu = mp.lastChild;
			menu.appendChild(cbPopup);
		}
	},
	setAutoRemove: function(enable) {
		if(enable) {
			this._forceEnableCleanup = true;
			this.initCleanupTimer(); // Ensure initialized
		}
		var timer = this.timer || null;
		if(timer)
			timer.enabled = enable;
	},
	_forceEnableCleanup: false,
	initCleanupTimer: function() {
		if(!this.options.removeUnprotectedCookiesEnabled && !this._forceEnableCleanup)
			return;
		var interval = this.options.removeUnprotectedCookiesInterval;
		if(interval <= 0)
			return;
		var timerId = this.timerId;
		var timer = this.timer = this.storage.get(timerId, null);
		if(timer)
			return;
		timer = this.timer = {
			timerId: timerId,
			interval: interval,
			enabled: true,
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
				this.permissions.storage.set(this.timerId, null);
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
					this.enabled && this.permissions.removeUnprotectedCookies();
			}
		};
		this.storage.set(timerId, timer);
		timer.init();
	},
	moveToStatusBar: function() {
		var insPoint;
		this.options.moveToStatusBar.insertAfter
			.split(/,\s*/)
			.some(function(id) {
				insPoint = document.getElementsByAttribute("cb_id", id)[0]
					|| document.getElementById(id);
				return insPoint;
			});
		if(!insPoint)
			return;

		var btn = this.button;
		// Make <toolbarbutton> looks like <image>, see CSS
		btn.className += " custombuttons-insideStatusbarpanel";
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
		return this.getHostFromBrowser(gBrowser);
	},
	get currentHosts() { // returns hosts from all visible tabs in all windows
		var tmp = { __proto__: null };
		var ws = this.wm.getEnumerator("navigator:browser");
		while(ws.hasMoreElements()) {
			let gBrowser = ws.getNext().gBrowser;
			let tabs = gBrowser.visibleTabs || gBrowser.tabs || gBrowser.tabContainer.childNodes;
			for(let i = 0, l = tabs.length; i < l; ++i) {
				let browser = tabs[i].linkedBrowser;
				let host = browser && this.getHostFromBrowser(browser);
				if(!host)
					continue;
				host = this.getHost(this.options.useBaseDomain.preserveCurrentSitesCookies, host);
				tmp[host] = true;
			}
		}
		var hosts = [];
		for(var host in tmp)
			hosts.push(host);
		return hosts;
	},
	getHostFromBrowser: function(browser) {
		try {
			var uri = browser.currentURI;
			if(["chrome", "resource"].indexOf(uri.scheme) != -1)
				return "";
			return uri.host;
		}
		catch(e) {
		}
		return "";
	},
	get currentProtocol() {
		var scheme = gBrowser.currentURI.scheme;
		if(scheme == "https")
			return scheme;
		return "http";
	},
	get isSeaMonkey() {
		delete this.isSeaMonkey;
		return this.isSeaMonkey = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo)
			.name == "SeaMonkey";
	},
	getHost: function(useBaseDomain, host) {
		if(host === undefined)
			host = this.currentHost;
		switch(useBaseDomain) {
			case 1: return this.stripWww(host);
			case 2: return this.getBaseDomain(host);
		}
		return host;
	},
	getURI: function(host, protocol) {
		if(host.indexOf(":") != -1 && /^[:\da-f.]+$/.test(host)) // IPv6
			host = "[" + host + "]";
		host = host.replace(/^\./, "");
		try {
			return this.io.newURI((protocol || this.currentProtocol) + "://" + host, null, null);
		}
		catch(e) {
			Components.utils.reportError(this.errPrefix + "Invalid host: \"" + host + "\"");
			throw e;
		}
	},
	stripWww: function(host) {
		return host && host.replace(/^www\./i, "");
	},
	getBaseDomain: function(host) {
		if(host) try {
			return this.tld.getBaseDomainFromHost(host);
		}
		catch(e) {
		}
		return host;
	},

	showMenu: function(e, isContext, mp) {
		document.popupNode = this.button.ownerDocument.popupNode = this.button;
		if(!mp) {
			this.initContextOnce();
			mp = this.mp;
		}
		if("openPopupAtScreen" in mp)
			mp.openPopupAtScreen(e.screenX, e.screenY, isContext);
		else
			mp.showPopup(this, e.screenX, e.screenY, isContext ? "context" : "popup", null, null);
	},
	updMenu: function() {
		var permission = this.options.showTempPermissions
			? this.getPermissionEx()
			: this.getPermission();

		var noPermissions = permission == this.PERMISSIONS_NOT_SUPPORTED;
		Array.prototype.forEach.call(
			this.mp.getElementsByAttribute("cb_permission", "*"),
			function(mi) {
				mi.hidden = noPermissions;
				var ns = mi.nextSibling;
				if(ns && ns.localName == "menuseparator")
					ns.hidden = noPermissions;
			}
		);

		if(!noPermissions) {
			let cbPermission = permission.capability || permission;
			if(
				this.options.showTempPermissions
				&& permission instanceof Components.interfaces.nsIPermission
				&& "expireType" in permission
				&& permission.expireType != this.pm.EXPIRE_NEVER
			)
				cbPermission += "-temp";
			let mi = this.mp.getElementsByAttribute("cb_permission", cbPermission)[0] || null;
			mi && mi.setAttribute("checked", "true");
		}

		if(this.hasTempPermissions) {
			let maxItems = 10;
			let removeItem = this.mp.getElementsByAttribute("cb_id", "removeTempPermissions")[0];
			let tempPermissions = this.tempPermissions;
			removeItem.disabled = !tempPermissions.length;
			if(tempPermissions.length > maxItems)
				tempPermissions.splice(maxItems - 2, tempPermissions.length - maxItems + 1, "…");
			let cp = this.cp;
			removeItem.tooltipText = tempPermissions.map(function(permission) {
				if(typeof permission == "string")
					return permission;
				var action = "???";
				switch(permission.capability) {
					case cp.ACCESS_ALLOW:   action = "allowLabel";        break;
					case cp.ACCESS_DENY:    action = "denyLabel";         break;
					case cp.ACCESS_SESSION: action = "allowSessionLabel";
				}
				return (permission.host || permission.principal.URI.spec.replace(/\/$/, ""))
					+ ": " + _localize(action).toLowerCase();
			}, this).join(", \n");
		}

		var removeCurrent = this.mp.getElementsByAttribute("cb_id", "removeCurrentSiteCookies")[0];
		removeCurrent.hidden = noPermissions;
		if(!noPermissions)
			removeCurrent.tooltipText = this.removeCurrentSiteCookiesHost;

		var timer = this.timer || null;
		var autoRemove = this.mp.getElementsByAttribute("cb_id", "autoRemoveUnprotectedCookies")[0];
		autoRemove.setAttribute("checked", timer ? timer.enabled : false);
		autoRemove.hidden = this.options.removeUnprotectedCookiesInterval <= 0;

		return true;
	},

	openPermissions: function() {
		var host = this.getHost(this.options.useBaseDomain.openPermissions);
		if(host && "Services" in window && parseFloat(Services.appinfo.platformVersion) >= 42)
			host = this.currentProtocol + "://" + host;

		if(this.isSeaMonkey) {
			this.openPermissionsSM(host);
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

		var win;
		var ws = this.wm.getEnumerator("Browser:Permissions");
		while(ws.hasMoreElements()) {
			win = ws.getNext();
			if(
				this.options.reusePermissionsWindow
				|| "gPermissionManager" in win && win.gPermissionManager._type == this.permissionType
			)
				break;
			win = null;
		}

		var _this = this;
		var setFilter = function setFilter(e) {
			e && win.removeEventListener("load", setFilter, false);
			setTimeout(function() {
				_this.setTextboxValue(win.document.getElementById("url"), host, !!e);
			}, 0);
		};
		if(win) {
			// See <method name="openWindow"> in chrome://global/content/bindings/preferences.xml#prefwindow
			if("initWithParams" in win)
				win.initWithParams(params);
			win.focus();
			host && setFilter();
		}
		else {
			win = window.openDialog("chrome://browser/content/preferences/permissions.xul", "_blank", "", params);
			host && win.addEventListener("load", setFilter, false);
		}

		this.tweakWindow(win);
	},
	openPermissionsSM: function(host) {
		var win = this.wm.getMostRecentWindow("mozilla:cookieviewer");
		var _this = this;
		if(!host)
			host = "";
		var setFilter = function setFilter(e) {
			e && win.removeEventListener("load", setFilter, false);
			var doc = win.document;
			doc.getElementById("tabbox").selectedTab = doc.getElementById("permissionsTab");
			_this.setTextboxValue(doc.getElementById("cookie-site"), host);
		};
		if(win) {
			win.focus();
			setFilter();
		}
		else {
			win = window.openDialog("chrome://communicator/content/permissions/cookieViewer.xul", "_blank", "");
			win.addEventListener("load", setFilter, false);
		}
	},
	tweakWindow: function(win) {
		if("__cbPermissionsTweaked" in win)
			return;
		win.__cbPermissionsTweaked = true;
		function keypressHandler(e) {
			if(e.keyCode == e.DOM_VK_ESCAPE)
				win.close();
		}
		win.addEventListener("keypress", keypressHandler, false);
		win.addEventListener("unload", function destroy(e) {
			var win = e.target.defaultView;
			if(win != e.currentTarget)
				return;
			win.removeEventListener(e.type, destroy, false);
			win.removeEventListener("keypress", keypressHandler, false);
		}, false);
	},
	setTextboxValue: function(tb, val, onlySelect) {
		if(!tb)
			return;
		if(!onlySelect)
			tb.value = val;
		tb.focus();
		if(val && "inputField" in tb) {
			let ifi = tb.inputField;
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

	get hasTempPermissions() {
		delete this.hasTempPermissions;
		return this.hasTempPermissions = "EXPIRE_SESSION" in this.pm && this.pm.add.length > 3;
	},
	addPermission: function(capability, temporary) {
		// capability:
		//  this.cp.ACCESS_ALLOW (this.pm.ALLOW_ACTION)
		//  this.cp.ACCESS_SESSION
		//  this.cp.ACCESS_DENY (this.pm.DENY_ACTION)

		var host = this.getHost(this.options.useBaseDomain.addPermission);
		if(!host)
			return;

		if(temporary && !this.hasTempPermissions)
			temporary = false;
		this.updButtonState(capability); // Faster than ProgressListener (70-80 ms for me)

		if(this.hasTempPermissions)
			this.removePermissionForHost(host);

		var pm = this.pm;
		var args = [this.getURI(host), this.permissionType, capability];
		if(temporary) {
			let expire = this.options.tempExpire;
			if(expire < 0)
				args.push(pm.EXPIRE_SESSION);
			else
				args.push(pm.EXPIRE_TIME, expire + Date.now());
		}
		pm.add.apply(pm, args);
	},
	removePermission: function() {
		var host = this.currentHost;
		if(!host)
			return;

		this.updButtonState(this.cp.ACCESS_DEFAULT); // Faster than ProgressListener (70-80 ms for me)

		var pm = this.pm;
		var uri = this.getURI(host);
		var permission = pm.testPermission(uri, this.permissionType);
		this.removePermissionForHost(host);
		while(pm.testPermission(uri, this.permissionType) == permission) {
			let parentHost = host.replace(/^[^.]*\./, "");
			if(parentHost == host)
				break;
			host = parentHost;
			this.removePermissionForHost(host);
		}
	},
	togglePermission: function(capabilities) {
		var permission = this.getPermissionEx(this.getHost(this.options.useBaseDomain.addPermission), true);
		if(permission instanceof Components.interfaces.nsIPermission)
			permission = permission.capability;
		if(permission == this.PERMISSIONS_NOT_SUPPORTED)
			return;
		var capability = capabilities[(capabilities.indexOf(permission) + 1) % capabilities.length];

		if(capability == this.cp.ACCESS_DEFAULT)
			this.removePermission();
		else
			this.addPermission(capability);
	},
	get tempPermissions() {
		var out = [];
		if(!this.hasTempPermissions)
			return out;
		var pm = this.pm;
		var enumerator = pm.enumerator;
		while(enumerator.hasMoreElements()) {
			let permission = enumerator.getNext()
				.QueryInterface(Components.interfaces.nsIPermission);
			if(
				permission.type == this.permissionType
				&& permission.expireType != pm.EXPIRE_NEVER
			)
				out.push(permission);
		}
		return out;
	},
	removeTempPermissions: function() {
		this.tempPermissions.forEach(this.removeRawPermission, this);
	},
	getPermission: function() {
		var host = this.currentHost;
		return host
			? this.pm.testPermission(this.getURI(host), this.permissionType)
			: this.PERMISSIONS_NOT_SUPPORTED;
	},
	getPermissionEx: function(host, dontGetInherited) {
		// Unfortunately no API like nsIPermissionManager.testPermission()
		// for temporary permissions
		if(!host)
			host = this.currentHost;
		if(!host)
			return this.PERMISSIONS_NOT_SUPPORTED;
		var pm = this.pm;
		var matchedPermission = pm.UNKNOWN_ACTION;
		var protocol = this.currentProtocol;
		var maxHostLen = -1;
		var enumerator = pm.enumerator;
		while(enumerator.hasMoreElements()) {
			let permission = enumerator.getNext()
				.QueryInterface(Components.interfaces.nsIPermission);
			if(permission.type != this.permissionType)
				continue;
			if("principal" in permission && permission.principal.URI.scheme != protocol) // Firefox 42+
				continue;
			let permissionHost = this.getPermissionHost(permission);
			if(permissionHost == host)
				return permission;
			if(dontGetInherited)
				continue;
			let hostLen = permissionHost.length;
			if(
				hostLen > maxHostLen
				&& host.substr(-hostLen - 1) == "." + permissionHost // ~= checkCookieHost()
			) {
				matchedPermission = permission;
				maxHostLen = hostLen;
			}
		}
		return matchedPermission;
	},
	removePermissionForHost: function(host) {
		try {
			this.pm.remove(host, this.permissionType);
		}
		catch(e) {
			// See https://bugzilla.mozilla.org/show_bug.cgi?id=1170200
			if("Services" in window) try { // Firefox 42+
				let uri = Services.io.newURI(this.currentProtocol + "://" + host, null, null);
				this.pm.remove(uri, this.permissionType);
				return;
			}
			catch(e2) {
				Components.utils.reportError(e2);
			}
			Components.utils.reportError(e);
		}
	},
	removeRawPermission: function(permission) {
		if("principal" in permission) // Firefox 42+
			this.pm.remove(permission.principal.URI, this.permissionType);
		else
			this.removePermissionForHost(permission.host);
	},
	getPermissionHost: function(permission) {
		if("host" in permission)
			return permission.host;
		// See https://bugzilla.mozilla.org/show_bug.cgi?id=1173523
		return permission.principal.URI.host; // Firefox 42+
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
	showCookiesEvent: function(e) {
		if(e.type == "command")
			this.showCookies(this.hasModifier(e));
		else if(e.type == "click" && e.button == 1) {
			this.mp.hidePopup();
			this.showCookies(true);
		}
	},
	showCookies: function(showAll) {
		var host = showAll ? "" : this.getHost(this.options.useBaseDomain.showCookies);
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
			(host || showAll) && setFilter();
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
		if(!host)
			host = "";
		var setFilter = function setFilter(e) {
			e && win.removeEventListener("load", setFilter, false);
			var doc = win.document;
			doc.getElementById("tabbox").selectedTab = doc.getElementById("cookiesTab");
			_this.setTextboxValue(doc.getElementById("filter"), host);
		};
		if(win) {
			win.focus();
			setFilter();
		}
		else {
			win = window.openDialog("chrome://communicator/content/permissions/cookieViewer.xul", "_blank", "");
			win.addEventListener("load", setFilter, false);
		}
	},
	confirm: function(msg, method/*, arg1, arg2*/) {
		if(
			!this.options.confirmRemoval
			|| Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService)
				.confirm(window, _localize("Cookies Permissions"), _localize(msg))
		)
			this[method].apply(this, Array.prototype.slice.call(arguments, 2));
	},
	removeUnprotectedCookies: function(removeAll) {
		if(removeAll == undefined)
			removeAll = this.options.removeAllUnprotectedCookies;
		var cp = this.cp;
		var checkCookieHosts;
		if(!removeAll) {
			let hosts = this.currentHosts;
			let checkCookieHost = this.checkCookieHost;
			checkCookieHosts = function(cookieHost) {
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
		return this.getHost(this.options.useBaseDomain.removeCurrentSiteCookies);
	},
	removeCurrentSiteCookies: function() {
		var host = this.removeCurrentSiteCookiesHost;
		var checkCookieHost = this.checkCookieHost;
		this.removeCookies(null, function(cookieHost) {
			return checkCookieHost(cookieHost, host);
		});
	},
	checkCookieHost: function(cookieHost, host) {
		var fn = this.checkCookieHost = "endsWith" in String.prototype // Firefox 17+
			? function(cookieHost, host) {
				return host == cookieHost
					|| cookieHost.endsWith("." + host);
			}
			: function(cookieHost, host) {
				return host == cookieHost
					|| cookieHost.substr(-host.length - 1) == "." + host;
			};
		return fn(cookieHost, host);
	},
	removeCookies: function(types, checkHost) {
		var cm = this.cm;
		var pm = this.pm;
		var cookies = cm.enumerator;
		while(cookies.hasMoreElements()) {
			let cookie = cookies.getNext()
				.QueryInterface(Components.interfaces.nsICookie);
			let cookieHost = cookie.host;
			if(checkHost && !checkHost(cookieHost))
				continue;
			if(types) {
				// Trick for Firefox 42+, assumed pm.UNKNOWN_ACTION == 0
				let permission = pm.testPermission(this.getURI(cookieHost, "http"), this.permissionType)
					|| pm.testPermission(this.getURI(cookieHost, "https"), this.permissionType);
				if(types.indexOf(permission) == -1)
					continue;
			}
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
		try {
			return new DOMParser().parseFromString(xul, "application/xml").documentElement;
		}
		catch(e) {
			// See http://custombuttons.sourceforge.net/forum/viewtopic.php?f=5&t=3720
			// + https://forum.mozilla-russia.org/viewtopic.php?pid=732243#p732243
			var dummy = document.createElement("dummy");
			dummy.innerHTML = xul.trimLeft();
			return dummy.firstChild;
		}
	},

	get storage() {
		delete this.storage;
		if(!("Services" in window)) // Firefox 3.6 and older
			return this.storage = Application.storage;
		// Simple replacement for Application.storage
		// See https://bugzilla.mozilla.org/show_bug.cgi?id=1090880
		//var global = Components.utils.getGlobalForObject(Services);
		// Ensure, that we have global object (because window.Services may be overwritten)
		var global = Components.utils.import("resource://gre/modules/Services.jsm", {});
		var ns = "_cbCookiesPermissionsStorage";
		var storage = global[ns] || (global[ns] = Components.utils.getGlobalForObject(global).Object.create(null));
		return this.storage = {
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
	}
};

//===================
// Styles
// Used Fugue and Diagona icons (http://p.yusukekamiyamane.com/)

// Styles can't override hardcoded icon
var icon = this.ownerDocument.getAnonymousElementByAttribute(this, "class", "toolbarbutton-icon");
if(icon)
	icon.src = "";
else
	this.image = "";

var cssStr = ('\
	@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
	@-moz-document url("' + window.location.href + '") {\n\
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
		/* "moveToStatusBar" option */\n\
		%button%.custombuttons-insideStatusbarpanel {\n\
			-moz-appearance: none !important;\n\
			border: none !important;\n\
			margin: 0 !important;\n\
			padding: 0 !important;\n\
			min-width: 0 !important;\n\
			max-width: none !important;\n\
		}\n\
		%button%.custombuttons-insideStatusbarpanel > .toolbarbutton-icon {\n\
			margin: 0 !important;\n\
			padding: 0 !important;\n\
		}\n\
		%button%.custombuttons-insideStatusbarpanel > .toolbarbutton-text {\n\
			display: none !important;\n\
		}\n\
		%button% .cbTempPermission {\n\
			font-style: italic !important;\n\
			/*-moz-padding-start: 0.7em !important;*/\n\
		}\n\
	}')
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