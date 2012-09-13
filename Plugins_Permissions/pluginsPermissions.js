// http://infocatcher.ucoz.net/js/cb/pluginsPermissions.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Plugins_Permissions

// Plugins Permissions button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012
// version 0.1.0pre - 2012-09-13

// Based on Cookies Permissions button
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Cookies_Permissions

var options = {
	useBaseDomain: { // If set to true, will use short domain like google.com instead of www.google.com
		addPermission: false, // Add (and toggle) permission action
		openPermissions: false,  // Filter in "Show Exceptions" window
	},
	showDefaultPolicy: true, // Show default policy
	toggleMode: Components.interfaces.nsIPermissionManager.ALLOW_ACTION,
	// ALLOW_ACTION or DENY_ACTION
	//~ todo: EXPIRE_SESSION
	// https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIPermissionManager#Permission_expiration_constants
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
		en: {
			defaultTooltiptext: "Plugins: Default",
			denyTooltiptext: "Plugins: Block",
			allowTooltiptext: "Plugins: Allow",
			notAvailableTooltiptext: "Plugins: n/a",
			unknownTooltiptext: "Plugins: ???",
			errorTooltiptext: "Plugins: Error!",

			defaultDenyTooltiptext: "Plugins: Block (Default)",
			defaultAllowTooltiptext: "Plugins: Allow (Default)",

			defaultLabel: "Default",
			defaultAccesskey: "D",
			denyLabel: "Block",
			denyAccesskey: "B",
			allowLabel: "Allow",
			allowAccesskey: "A",

			showPermissionsLabel: "Show Exceptions…",
			showPermissionsAccesskey: "x",

			buttonMenu: "Button Menu",
			buttonMenuAccesskey: "M",

			exceptionsTitle: "Exceptions — Plugins",
			exceptionsDesc: "You can specify which websites are always or never allowed to \
				play plugins. Type the exact address of the site you want to manage and \
				then click Block or Allow."
		},
		ru: {
			defaultTooltiptext: "Плагины: По умолчанию",
			denyTooltiptext: "Плагины: Блокировать",
			allowTooltiptext: "Плагины: Разрешить",
			notAvailableTooltiptext: "Плагины: н/д",
			unknownTooltiptext: "Плагины: ???",
			errorTooltiptext: "Плагины: Ошибка!",

			defaultDenyTooltiptext: "Плагины: Блокировать (по умолчанию)",
			defaultAllowTooltiptext: "Плагины: Разрешить (по умолчанию)",

			defaultLabel: "По умолчанию",
			defaultAccesskey: "у",
			denyLabel: "Блокировать",
			denyAccesskey: "Б",
			allowLabel: "Разрешить",
			allowAccesskey: "Р",

			showPermissionsLabel: "Показать исключения…",
			showPermissionsAccesskey: "и",

			buttonMenu: "Меню кнопки",
			buttonMenuAccesskey: "М",

			exceptionsTitle: "Исключения — Плагины",
			exceptionsDesc: "Вы можете указать, каким веб-сайтам разрешено или запрещено \
				автоматически проигрывать плагины. Введите точный адрес сайта и нажмите \
				кнопку «Блокировать» или «Разрешить»."
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
		this.permissions.openPluginsPermissions();
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
	permissionType: "plugins",

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
	init: function() {
		if(this.initialized)
			return;
		this.initialized = true;

		if(this.options.moveToStatusBar.enabled)
			this.moveToStatusBar();

		this.mpId = this.button.id + "-context";
		var pm = this.pm;
		var mp = this.mp = this.button.appendChild(this.parseXULFromString('\
			<menupopup xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"\
				id="' + this.mpId + '"\
				class="cbPluginsPermissionsPopup"\
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
				<menuitem type="radio" cb_permission="' + pm.ALLOW_ACTION + '"\
					oncommand="this.parentNode.parentNode.permissions.addPermission(Components.interfaces.nsIPermissionManager.ALLOW_ACTION);"\
					label="' + _localize("allowLabel") + '"\
					accesskey="' + _localize("allowAccesskey") + '" />\
				<menuseparator />\
				<menuitem\
					cb_id="openPluginsPermissions"\
					oncommand="this.parentNode.parentNode.permissions.openPluginsPermissions();"\
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
				var type = this.context.permissionType;
				if(permission.type != type)
					return;
				this.context.updButtonState();
				if(data == "deleted") {
					// See chrome://browser/content/preferences/permissions.js
					// observe: function (aSubject, aTopic, aData)
					let win = this.context.wm.getMostRecentWindow("Browser:Permissions");
					if(win && "gPermissionManager" in win && win.gPermissionManager._type == type)
						win.gPermissionManager._loadPermissions();
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

		if(this.options.showDefaultPolicy) {
			let po = this.prefsObserver = {
				context: this,
				get prefs() {
					delete this.prefs;
					return this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("plugins.click_to_play")
						.QueryInterface(Components.interfaces.nsIPrefBranch2 || Components.interfaces.nsIPrefBranch);
				},
				getBoolPref: function(name) {
					try {
						return this.prefs.getBoolPref(name);
					}
					catch(e) {
						Components.utils.reportError(e);
					}
					return false;
				},
				observe: function(subject, topic, data) {
					if(topic != "nsPref:changed")
						return;
					if(data != "")
						return;
					this.context.defaultDeny = this.getBoolPref(data);
					this.context.updButtonState();
				}
			};
			this.defaultDeny = po.getBoolPref("");
			po.prefs.addObserver("", po, false);
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
			this.prefsObserver.prefs.removeObserver("", this.prefsObserver);
		this.progressListener = this.permissionsObserver = this.prefsObserver = null;
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
		var loc = content.location;
		if(["view-source:", "about:", "chrome:", "resource:", "javascript:", "data:"].indexOf(loc.protocol) == -1) try {
			return loc.hostname;
		}
		catch(e) {
		}
		return "";
	},
	get currentBaseDomain() {
		return this.getBaseDomain(this.currentHost);
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

		return true;
	},

	openPluginsPermissions: function() {
		var host = this.options.useBaseDomain.openPermissions
			? this.currentBaseDomain
			: this.currentHost;

		// chrome://browser/content/preferences/privacy.js
		// Like gPrivacyPane.showCookieExceptions()
		var params = { blockVisible   : true,
					   sessionVisible : false,
					   allowVisible   : true,
					   prefilledHost  : host,
					   permissionType : this.permissionType,
					   windowTitle    : _localize("exceptionsTitle"),
					   introText      : _localize("exceptionsDesc") };
		var win = this.wm.getMostRecentWindow("Browser:Permissions");
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
	tweakWindow: function(win) {
		if("__cbPluginsPermissionsTweaked" in win)
			return;
		win.__cbPluginsPermissionsTweaked = true;
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

	addPermission: function(capability, expireType, expireTime) {
		// capability:
		//  this.pm.ALLOW_ACTION
		//  this.pm.DENY_ACTION
		// expireType:
		//  this.pm.EXPIRE_NEVER
		//  this.pm.EXPIRE_SESSION
		//  this.pm.EXPIRE_TIME
		// expireTime:
		//  time in milliseconds since Jan 1 1970 0:00:00

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
			if(
				permission.type == this.permissionType
				&& permission.host == host
				&& permission.capability == capability
				&& (!expireType || !("expireType" in permission) || permission.expireType == expireType)
				&& (!expireTime || !("expireTime" in permission) || permission.expireTime == expireTime)
			)
				return; // Already added
		}

		var args = [this.getURI(host), this.permissionType, capability];
		if(expireType) {
			args.push(expireType);
			if(expireTime)
				args.push(expireTime);
		}
		pm.add.apply(pm, args);
	},
	removePermission: function() {
		var host = this.currentHost;
		if(!host)
			return;

		this.updButtonState(this.pm.UNKNOWN_ACTION); // Faster than ProgressListener (70-80 ms for me)

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
	}'
	.replace(/%windowURL%/g, window.location.href)
	.replace(/%button%/g, "#" + this.id)
	.replace(/%attr%/g, "cb_" + this.permissions.permissionType);
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