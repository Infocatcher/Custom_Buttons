// http://infocatcher.ucoz.net/js/cb/pluginsPermissions.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57303
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Plugins_Permissions

// Plugins Permissions button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012-2015
// version 0.1.2pre2 - 2015-09-19

// Based on Cookies Permissions button
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Cookies_Permissions

// Note: plugins.click_to_play in about:config ("Block plugins" checkbox) should be enabled
// Unfortunately since Firefox 20 (Gecko 20) global exclusions doesn't work, only on per-plugin basis.
// So you should change "Flash", "Shockwave Flash" and "plugin:flash" in the source (and create copy
// of this button) to menage other plugins, see "// Rename to use button for another plugin" comments.

var options = {
	showTempPermissions: true, // Show items about temporary permissions (only Gecko 2.0+)
	tempExpire: -1, // Type of temporary permissions
	// -1 - session, otherwise - expire after given time (in milliseconds)
	useBaseDomain: {
		// 0 - use full domain name: addons.mozilla.org, www.google.com
		// 1 - strip "www." prefix from full domain name: addons.mozilla.org, google.com
		// 2 - use top-level domains (TLDs): mozilla.org, google.com
		addPermission: 1, // Add (and toggle) permission action
		openPermissions: 0,  // Filter in "Show Exceptions" window
	},
	showDefaultPolicy: true, // Show default policy
	toggleMode: Components.interfaces.nsIPermissionManager.ALLOW_ACTION,
	// ALLOW_ACTION or DENY_ACTION
	reusePermissionsWindow: false, // Use any already opened permissions window
	// E.g. "Show Exceptions" may convert "Exceptions - Cookies" to "Exceptions — Plugins"
	prefillMode: 1, // 0 - move caret to start, 1 - select all, 2 - move caret to end
	moveToStatusBar: {
		// Move button to Status Bar, only for SeaMonkey or Firefox < 4.0
		// Be careful, has some side-effects and button can't be edited w/o restart
		enabled: false,
		insertAfter: "custombuttons-cookiesPermissionsSBPanel,download-monitor,popupIcon,statusbar-progresspanel"
		// Like https://developer.mozilla.org/en-US/docs/XUL/Attribute/insertafter
		// Also looks for nodes with "cb_id" attribute
	}
};

function _localize(sid) {
	var strings = {
		// Note: %p will be replaced with "Plugins" (Firefox < 20) or plugin name (Firefox >= 20)
		en: {
			plugins: "Plugins",
			pluginName: "Flash", // Rename to use button for another plugin

			defaultTooltiptext: "%p: Default",
			denyTooltiptext: "%p: Block",
			allowTooltiptext: "%p: Allow",
			notAvailableTooltiptext: "%p: n/a",
			unknownTooltiptext: "%p: ???",
			errorTooltiptext: "%p: Error!",

			defaultDenyTooltiptext: "%p: Block (Default)",
			defaultAllowTooltiptext: "%p: Allow (Default)",

			defaultLabel: "Default",
			defaultAccesskey: "D",
			denyLabel: "Block",
			denyAccesskey: "B",
			denyTempLabel: "Temporarily Block",
			denyTempAccesskey: "k",
			allowLabel: "Allow",
			allowAccesskey: "A",
			allowTempLabel: "Temporarily Allow",
			allowTempAccesskey: "w",

			blockPluginsLabel: "Block plugins",
			blockPluginsAccesskey: "c",
			removeTempPermissionsLabel: "Remove Temporary Permissions",
			removeTempPermissionsAccesskey: "T",

			showPermissionsLabel: "Show Exceptions…",
			showPermissionsAccesskey: "x",

			buttonMenu: "Button Menu",
			buttonMenuAccesskey: "M",

			exceptionsTitle: "Exceptions - %p",
			exceptionsDesc: "You can specify which websites are always or never allowed to \
				play plugins. Type the exact address of the site you want to manage and \
				then click Block or Allow."
		},
		ru: {
			plugins: "Плагины",
			pluginName: "Flash", // Rename to use button for another plugin

			defaultTooltiptext: "%p: По умолчанию",
			denyTooltiptext: "%p: Блокировать",
			allowTooltiptext: "%p: Разрешить",
			notAvailableTooltiptext: "%p: н/д",
			unknownTooltiptext: "%p: ???",
			errorTooltiptext: "%p: Ошибка!",

			defaultDenyTooltiptext: "%p: Блокировать (по умолчанию)",
			defaultAllowTooltiptext: "%p: Разрешить (по умолчанию)",

			defaultLabel: "По умолчанию",
			defaultAccesskey: "у",
			denyLabel: "Блокировать",
			denyAccesskey: "Б",
			denyTempLabel: "Временно блокировать",
			denyTempAccesskey: "л",
			allowLabel: "Разрешить",
			allowAccesskey: "Р",
			allowTempLabel: "Временно разрешить",
			allowTempAccesskey: "ш",

			blockPluginsLabel: "Блокировать плагины",
			blockPluginsAccesskey: "к",
			removeTempPermissionsLabel: "Удалить временные исключения",
			removeTempPermissionsAccesskey: "ы",

			showPermissionsLabel: "Показать исключения…",
			showPermissionsAccesskey: "и",

			buttonMenu: "Меню кнопки",
			buttonMenuAccesskey: "М",

			exceptionsTitle: "Исключения — %p",
			exceptionsDesc: "Вы можете указать, каким веб-сайтам разрешено или запрещено \
				автоматически проигрывать плагины. Введите точный адрес сайта и нажмите \
				кнопку «Блокировать» или «Разрешить»."
		}
	};
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
	//permissionType: "plugins",
	get permissionType() {
		var permissionType = "plugins";
		if(this.perPluginPermissions) try {
			// Rename to use button for another plugin
			let pluginName = "Shockwave Flash";
			permissionType = "plugin:flash"; // Fallback value

			// Based on code from chrome://browser/content/pageinfo/permissions.js
			let pluginHost = Components.classes["@mozilla.org/plugin/host;1"]
				.getService(Components.interfaces.nsIPluginHost);
			let tags = pluginHost.getPluginTags();
			for(let i = 0, l = tags.length; i < l; ++i) {
				let tag = tags[i];
				if(tag.name == pluginName) {
					let mimeType = tag.getMimeTypes()[0]; // This is string since Firefox 24
					let mimeTypeString = mimeType.type || mimeType;
					permissionType = pluginHost.getPermissionStringForType(mimeTypeString);
					break;
				}
			}
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		delete this.permissionType;
		return this.permissionType = permissionType;
	},
	get pluginName() {
		var name = this.perPluginPermissions
			? _localize("pluginName")
			: _localize("plugins");
		delete this.pluginName;
		return this.pluginName = name;
	},
	get perPluginPermissions() {
		delete this.perPluginPermissions;
		return this.perPluginPermissions = this.platformVersion >= 20;
	},
	popupClass: "cbPluginsPermissionsPopup",

	button: this,
	options: options,

	PERMISSIONS_NOT_SUPPORTED: -1,
	PERMISSIONS_ERROR:         -2,

	errPrefix: "[Custom Buttons :: Plugins Permissions] ",

	get pm() {
		delete this.pm;
		return this.pm = Components.classes["@mozilla.org/permissionmanager;1"]
			.getService(Components.interfaces.nsIPermissionManager);
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
				/*
				if(this.context.getBaseDomain(permission.host) == this.context.currentBaseDomain) {
					// See chrome://browser/content/browser.js
					var pm = this.context.pm;
					switch(this.context.getPermission()) {
						case pm.DENY_ACTION:
							let notification = PopupNotifications.getNotification("click-to-play-plugins", gBrowser.selectedBrowser);
							if (notification)
								notification.remove();
							gPluginHandler._removeClickToPlayOverlays(content);
						break;
						case pm.ALLOW_ACTION:
							gPluginHandler.activatePlugins(content);

					}
				}
				*/
			}
		};
		this.oSvc.addObserver(this.permissionsObserver, "perm-changed", false);

		var ps = this.prefs = {
			context: this,
			get branch() {
				delete this.branch;
				return this.branch = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("plugins.click_to_play")
					.QueryInterface(Components.interfaces.nsIPrefBranch2 || Components.interfaces.nsIPrefBranch);
			},
			get: function(name) {
				try {
					return this.branch.getBoolPref(name || "");
				}
				catch(e) {
					Components.utils.reportError(e);
				}
				return false;
			},
			set: function(val, name) {
				try {
					this.branch.setBoolPref(name || "", val);
				}
				catch(e) {
					Components.utils.reportError(e);
				}
			},
			observe: function(subject, topic, data) {
				if(topic != "nsPref:changed" || data != "")
					return;
				var ctx = this.context;
				ctx.defaultDeny = this.get();
				ctx.updButtonState();
				ctx.updToggleBlockItem();
			}
		};
		if(this.options.showDefaultPolicy) {
			this.defaultDeny = ps.get();
			ps.branch.addObserver("", ps, false);
		}

		this.updButtonState();
	},
	destroy: function() {
		if(!this.initialized)
			return;
		this.initialized = false;

		gBrowser.removeProgressListener(this.progressListener);
		this.oSvc.removeObserver(this.permissionsObserver, "perm-changed");
		if(this.options.showDefaultPolicy)
			this.prefs.branch.removeObserver("", this.prefs);
		this.progressListener = this.permissionsObserver = this.prefs = null;
	},
	initContextOnce: function() {
		this.initContextOnce = function() {};

		this.mpId = this.button.id + "-context";
		var pm = this.pm;
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
				<menuitem type="radio" cb_permission="' + pm.UNKNOWN_ACTION + '"\
					oncommand="this.parentNode.parentNode.permissions.removePermission();"\
					label="' + _localize("defaultLabel") + '"\
					accesskey="' + _localize("defaultAccesskey") + '" />\
				<menuseparator />\
				<menuitem type="radio" cb_permission="' + pm.DENY_ACTION + '"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsIPermissionManager.DENY_ACTION);"\
					label="' + _localize("denyLabel") + '"\
					accesskey="' + _localize("denyAccesskey") + '" />\
				<menuitem type="radio" cb_permission="' + pm.DENY_ACTION + '-temp"\
					collapsed="' + noTempPermissions + '"\
					class="cbTempPermission"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsIPermissionManager.DENY_ACTION, true);"\
					label="' + _localize("denyTempLabel") + '"\
					accesskey="' + _localize("denyTempAccesskey") + '" />\
				<menuitem type="radio" cb_permission="' + pm.ALLOW_ACTION + '"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsIPermissionManager.ALLOW_ACTION);"\
					label="' + _localize("allowLabel") + '"\
					accesskey="' + _localize("allowAccesskey") + '" />\
				<menuitem type="radio" cb_permission="' + pm.ALLOW_ACTION + '-temp"\
					collapsed="' + noTempPermissions + '"\
					class="cbTempPermission"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsIPermissionManager.ALLOW_ACTION, true);"\
					label="' + _localize("allowTempLabel") + '"\
					accesskey="' + _localize("allowTempAccesskey") + '" />\
				<menuseparator />\
				<menuitem\
					cb_id="toggleBlock"\
					type="checkbox"\
					oncommand="this.parentNode.parentNode.permissions.toggleBlock(this.getAttribute(\'checked\') == \'true\');"\
					label="' + _localize("blockPluginsLabel") + '"\
					accesskey="' + _localize("blockPluginsAccesskey") + '" />\
				<menuitem\
					cb_id="removeTempPermissions"\
					hidden="' + noTempPermissions + '"\
					oncommand="this.parentNode.parentNode.permissions.removeTempPermissions();"\
					label="' + _localize("removeTempPermissionsLabel") + '"\
					accesskey="' + _localize("removeTempPermissionsAccesskey") + '" />\
				<menuseparator />\
				<menuitem\
					cb_id="openPermissions"\
					oncommand="this.parentNode.parentNode.permissions.openPermissions();"\
					label="' + _localize("showPermissionsLabel") + '"\
					accesskey="' + _localize("showPermissionsAccesskey") + '" />\
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
		sp.setAttribute("cb_id", "custombuttons-pluginsPermissionsSBPanel");
		sp.appendChild(btn);
		insPoint.parentNode.insertBefore(sp, insPoint.nextSibling);
	},

	get currentHost() {
		return this.getHostFromBrowser(gBrowser);
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
	get currentBaseDomain() {
		return this.getBaseDomain(this.currentHost);
	},
	get currentProtocol() {
		var scheme = gBrowser.currentURI.scheme;
		if(scheme == "https")
			return scheme;
		return "http";
	},
	get appInfo() {
		delete this.appInfo;
		return this.appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo);
	},
	get platformVersion() {
		var pv = parseFloat(this.appInfo.platformVersion);
		if(this.appInfo.name == "Pale Moon" || this.appInfo.name == "Basilisk")
			pv = pv >= 4.1 ? 56 : 28;
		delete this.platformVersion;
		return this.platformVersion = pv;
	},
	get isSeaMonkey() {
		delete this.isSeaMonkey;
		return this.isSeaMonkey = this.appInfo.name == "SeaMonkey";
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
	getURI: function(host) {
		if(host.indexOf(":") != -1 && /^[:\da-f.]+$/.test(host)) // IPv6
			host = "[" + host + "]";
		host = host.replace(/^\./, "");
		try {
			return this.io.newURI(this.currentProtocol + "://" + host, null, null);
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
			let mi = this.mp.getElementsByAttribute("cb_permission", cbPermission);
			mi.length && mi[0].setAttribute("checked", "true");
		}

		if(this.hasTempPermissions) {
			let maxItems = 10;
			let removeItem = this.mp.getElementsByAttribute("cb_id", "removeTempPermissions")[0];
			let tempPermissions = this.tempPermissions;
			removeItem.disabled = !tempPermissions.length;
			if(tempPermissions.length > maxItems)
				tempPermissions.splice(maxItems - 2, tempPermissions.length - maxItems + 1, "…");
			let pm = this.pm;
			removeItem.tooltipText = tempPermissions.map(function(permission) {
				if(typeof permission == "string")
					return permission;
				var action = "???";
				switch(permission.capability) {
					case pm.ALLOW_ACTION: action = "allowLabel"; break;
					case pm.DENY_ACTION:  action = "denyLabel";
				}
				return (permission.host || permission.principal.URI.spec.replace(/\/$/, ""))
					+ ": " + _localize(action).toLowerCase();
			}, this).join(", \n");
		}

		this.updToggleBlockItem();

		return true;
	},
	updToggleBlockItem: function() {
		if(!this.mp) // Context menu not yet created
			return;
		this.mp.getElementsByAttribute("cb_id", "toggleBlock")[0]
			.setAttribute(
				"checked",
				this.options.showDefaultPolicy
					? this.defaultDeny
					: this.prefs.get()
			);
	},
	toggleBlock: function(block) {
		this.prefs.set(block);
	},

	openPermissions: function() {
		if(this.isSeaMonkey) {
			this.openPermissionsSM();
			return;
		}
		var host = this.getHost(this.options.useBaseDomain.openPermissions);
		if(host && this.platformVersion >= 42)
			host = this.currentProtocol + "://" + host;
		// chrome://browser/content/preferences/privacy.js
		// Like gPrivacyPane.showCookieExceptions()
		var params = { blockVisible   : true,
					   sessionVisible : false,
					   allowVisible   : true,
					   prefilledHost  : host,
					   permissionType : this.permissionType,
					   windowTitle    : _localize("exceptionsTitle").replace("%p", this.pluginName),
					   introText      : _localize("exceptionsDesc") };

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
	openPermissionsSM: function() {
		var host = this.getBaseDomain(this.currentHost); // Only TLDs are displayed in the list

		//gBrowser.selectedTab = gBrowser.addTab("about:data");
		//toDataManager("|permissions");
		// See chrome://communicator/content/tasksOverlay.js
		var _this = this;
		switchToTabHavingURI("about:data", true, function(browser) {
			var win = browser.contentWindow;
			var content = win.wrappedJSObject || win;

			function selectDomain() {
				var gDomains = content.gDomains;
				var domains = gDomains.displayedDomains;
				for(var i = 0, l = domains.length; i < l; ++i) {
					var domain = domains[i];
					if(domain.title == host) {
						gDomains.tree.view.selection.select(i);
						// For SeaMonkey 2.20a1
						var tab = content.document.getElementById("permissionsTab");
						if(tab && !tab.disabled)
							tab.parentNode.selectedItem = tab;
						break;
					}
				}
			}

			var smVersion = parseFloat(_this.appInfo.version);
			if(smVersion >= 2.20 && smVersion <= 2.22) {
				var ml = content.document.getElementById("typeSelect");
				ml.value = "Permissions";
				ml.doCommand();

				var gDomains = content.gDomains;
				var oldDomainsCount = gDomains.displayedDomains.length;
				var stopWait = Date.now() + 5e3;
				var waitTimer = setTimeout(function wait() {
					var newDomainsCount = gDomains.displayedDomains.length;
					if(
						newDomainsCount > 1 && newDomainsCount == oldDomainsCount
						|| Date.now() > stopWait
					) {
						selectDomain();
						return;
					}
					oldDomainsCount = newDomainsCount;
					waitTimer = setTimeout(wait, 20);
				}, 20);
				return;
			}

			_this.oSvc.addObserver(function observer(subject, topic, data) {
				if(subject != win && subject != content)
					return;
				_this.oSvc.removeObserver(observer, topic);
				selectDomain();
			}, "dataman-loaded", false);
			content.gDataman.loadView("|permissions");
		});
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
		return this.hasTempPermissions = "EXPIRE_SESSION" in this.pm
			&& (!("add" in this.pm) || this.pm.add.length > 3);
	},
	testPermission: function(uri, permission) {
		var pm = this.pm;
		if("testPermission" in pm)
			return (this.testPermission = pm.testPermission.bind(pm))(uri, permission);
		return (this.testPermission = function(uri, permission) { // Firefox 71+
			var principal = Services.scriptSecurityManager.createContentPrincipal(uri, {});
			return pm.testPermissionFromPrincipal(principal, permission);
		})(uri, permission);
	},
	add: function(uri, permission) {
		var pm = this.pm;
		if("add" in pm)
			return (this.add = pm.add.bind(pm)).apply(pm, arguments);
		return (this.add = function(uri, permission) { // Firefox 71+
			var principal = Services.scriptSecurityManager.createContentPrincipal(uri, {});
			var args = Array.from(arguments);
			args[0] = principal;
			return pm.addFromPrincipal.apply(pm, args);
		}).apply(this, arguments);
	},
	addPermission: function(capability, temporary) {
		// capability:
		//  this.pm.ALLOW_ACTION
		//  this.pm.DENY_ACTION

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
		this.add.apply(this, args);
	},
	removePermission: function() {
		var host = this.currentHost;
		if(!host)
			return;

		this.updButtonState(this.pm.UNKNOWN_ACTION); // Faster than ProgressListener (70-80 ms for me)

		var uri = this.getURI(host);
		var permission = this.testPermission(uri, this.permissionType);
		this.removePermissionForHost(host);
		while(this.testPermission(uri, this.permissionType) == permission) {
			let parentHost = host.replace(/^[^.]*\./, "");
			if(parentHost == host)
				break;
			host = parentHost;
			this.removePermissionForHost(host);
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
			? this.testPermission(this.getURI(host), this.permissionType)
			: this.PERMISSIONS_NOT_SUPPORTED;
	},
	getPermissionEx: function() {
		// Unfortunately no API like nsIPermissionManager.testPermission()
		// for temporary permissions
		var host = this.currentHost;
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
			var permissionHost = this.getPermissionHost(permission);
			if(permissionHost == host)
				return permission;
			var hostLen = permissionHost.length;
			if(
				hostLen > maxHostLen
				&& host.substr(-hostLen - 1) == "." + permissionHost
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
		return this.defaultDeny
			? this.pm.DENY_ACTION
			: this.pm.ALLOW_ACTION;
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
		var pm = this.pm;
		var key;
		switch(permission) {
			case pm.UNKNOWN_ACTION:
				key = "default";
				if(this.options.showDefaultPolicy) switch(this.defaultPermission) {
					case pm.ALLOW_ACTION:        key = "defaultAllow";        break;
					case pm.DENY_ACTION:         key = "defaultDeny";
				}
			break;
			case pm.ALLOW_ACTION:                key = "allow";               break;
			case pm.DENY_ACTION:                 key = "deny";                break;
			case this.PERMISSIONS_NOT_SUPPORTED: key = "notAvailable";        break;
			case this.PERMISSIONS_ERROR:         key = "error";               break;
			default:                             key = "unknown";
		}
		var btn = this.button;
		var attr = "cb_" + this.permissionType;
		if(btn.getAttribute(attr) == key)
			return;
		btn.disabled = permission == this.PERMISSIONS_NOT_SUPPORTED;
		btn.setAttribute(attr, key);
		btn.tooltipText = _localize(key + "Tooltiptext")
			.replace("%p", this.pluginName)
			+ ttAdd;
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
	}
};

//===================
// Styles
// Use icon from default Firefox theme (chrome://mozapps/skin/plugins/pluginGeneric-16.png)
// and Diagona icons (http://p.yusukekamiyamane.com/)

// Styles can't override hardcoded icon
var icon = this.icon
	|| this.ownerDocument.getAnonymousElementByAttribute(this, "class", "toolbarbutton-icon");
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
		%button%[%attr%="default"]             { -moz-image-region: rect(0, 16px, 16px, 0)    !important; }\n\
		%button%[%attr%="allow"]               { -moz-image-region: rect(0, 32px, 16px, 16px) !important; }\n\
		%button%[%attr%="allowSession"]        { -moz-image-region: rect(0, 48px, 16px, 32px) !important; }\n\
		%button%[%attr%="deny"]                { -moz-image-region: rect(0, 64px, 16px, 48px) !important; }\n\
		%button%[%attr%="unknown"],\n\
		%button%[%attr%="error"]               { -moz-image-region: rect(0, 80px, 16px, 64px) !important; }\n\
		%button%[%attr%="notAvailable"]        { -moz-image-region: rect(0, 96px, 16px, 80px) !important; }\n\
		%button%[%attr%="defaultAllow"]        { -moz-image-region: rect(16px, 32px, 32px, 16px) !important; }\n\
		%button%[%attr%="defaultAllowSession"] { -moz-image-region: rect(16px, 48px, 32px, 32px) !important; }\n\
		%button%[%attr%="defaultDeny"]         { -moz-image-region: rect(16px, 64px, 32px, 48px) !important; }\n\
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
	.replace(/%button%/g, "#" + this.id)
	.replace(/%attr%/g, "cb_" + this.permissions.permissionType.replace(/[:.]/g, "\\$&"));
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
	}
	this.permissions.destroy();
};
this.permissions.init();