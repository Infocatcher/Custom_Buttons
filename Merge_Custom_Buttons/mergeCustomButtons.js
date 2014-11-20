// http://infocatcher.ucoz.net/js/cb/mergeCustomButtons.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Merge_Custom_Buttons

// Merge Custom Buttons button for Custom Buttons
// (code for "initialization" section)

// Place this button before other custom buttons and separators to move them into submenu of this button.
// Use two separators as "stop" flag.
// May not work for buttons with initialization code.
// Middle-click or left-click with any modifier - temporary split/merge.

// (c) Infocatcher 2011, 2013-2014
// version 0.1.0a6pre2 - 2014-01-27

this.onmouseover = function(e) {
	if(e.target != this)
		return;
	Array.some(
		this.parentNode.getElementsByTagName("*"),
		function(node) {
			if(
				node != this
				&& node.namespaceURI == xulns
				&& node.boxObject
				// See https://github.com/Infocatcher/Custom_Buttons/issues/28
				//&& node.boxObject instanceof Components.interfaces.nsIMenuBoxObject
				&& "open" in node
				&& node.open
				&& node.getElementsByTagName("menupopup").length
			) {
				node.open = false;
				this.open = true;
				return true;
			}
			return false;
		},
		this
	);
};

this.mergeButtons = {
	button: this,
	merged: false,
	get mp() {
		var mp = this.button.appendChild(document.createElement("menupopup"));
		mp.className = "cbMergeButtonsPopup";
		mp.setAttribute("onclick", "this.parentNode.mergeButtons.closeMenus(event);");
		mp.setAttribute("onmouseover", "this.parentNode.mergeButtons.over(event);");
		mp.setAttribute("onpopupshowing", "if(event.target == this) this.parentNode.mergeButtons.merge();");
		// See buttonConstructor() in chrome://custombuttons/content/cbbutton.js
		// Custom Buttons check for oBtn.parentNode.nodeName == "toolbar"
		mp.__defineGetter__("nodeName", function() {
			return "toolbar";
		});
		delete this.mp;
		return this.mp = mp;
	},
	initProxy: function() {
		// Trick: wait for XBL binding tor [type="menu"]
		LOG("initProxy()");
		var btn = this.button;
		if("__initTimer" in btn)
			clearTimeout(btn.__initTimer);
		if(btn.type == "menu") {
			LOG("initProxy(): menu");
			this.init();
			return;
		}
		// This behavior may be changed (fixed?) later, so will initialize anyway after small delay
		btn.__initTimer = setTimeout(function(_this) {
			LOG("initProxy() -> fallback timer");
			_this.init();
		}, 500, this);
	},
	init: function() {
		this.merge();
		setTimeout(function(_this) {
			_this.addStyles();
			//_this.merge();
		}, 50, this);
		function hasModifier(e) {
			return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
		}
		this.button.onmousedown = function(e) {
			if(e.target == this && e.button == 0 && hasModifier(e))
				e.preventDefault();
		};
		this.button.onclick = function(e) {
			if(e.target != this)
				return;
			if(e.button == 0 && hasModifier(e) || e.button == 1)
				this.mergeButtons.toggle();
		};
		addEventListener("beforecustomization", this, false);
		//addEventListener("aftercustomization", this, false);
	},
	destroy: function(reason) {
		if(reason == "update" || reason == "delete") {
			this.split();
			this.removeStyles();
		}
	},
	merge: function() {
		if(this.merged)
			return;
		this.merged = true;
		LOG("merge()");

		var nodes = [];
		var hasSep = false; // Will stop on <toolbarseparator/><toolbarseparator/>
		for(var node = this.button.nextSibling; node; node = node.nextSibling) {
			var isCb = (node.id || "").substr(0, 20) == "custombuttons-button";
			var isSep = !isCb && node.localName == "toolbarseparator";
			if(!isCb && !isSep)
				break;
			if(isSep && hasSep) {
				nodes.pop().collapsed = node.collapsed = true;
				break;
			}
			nodes.push(node);
			hasSep = isSep;
		}

		var df = document.createDocumentFragment();
		nodes.forEach(function(node) {
			df.appendChild(node);
		});

		var mp = this.mp;
		mp.textContent = "";

		setTimeout(function(_this) {
			if(!mp.parentNode) // Hack for SeaMonkey
				mp = _this.mp = _this.button.getElementsByTagName("menupopup")[0];
			mp.appendChild(df);

			if(_this.button.open) {
				_this.reinitButtons(nodes);
				return;
			}
			mp.collapsed = true;
			mp.openPopup(); // Force call XBL destructors/constructors
			setTimeout(function() {
				mp.hidePopup();
				mp.collapsed = false;
				_this.reinitButtons(nodes);
			}, 0);
		}, 0, this);
	},
	split: function(temporarily) {
		if(!this.merged)
			return;
		this.merged = false;
		LOG("split()");

		var btn = this.button;
		var next1 = btn.nextSibling;
		var next2 = next1 && next1.nextSibling;
		if(
			next1 && next1.localName == "toolbarseparator"
			&& next2 && next2.localName == "toolbarseparator"
		) {
			next1.collapsed = false;
			if(!temporarily)
				next2.collapsed = false;
		}

		var df = document.createDocumentFragment();
		var mp = this.mp;
		while(mp.hasChildNodes()) {
			var node = mp.firstChild;
			df.appendChild(node);
			this.reinitButton(node);
		}

		btn.parentNode.insertBefore(df, btn.nextSibling);
	},
	toggle: function() {
		if(this.merged)
			this.split(true);
		else
			this.merge();
	},
	reinitButton: function(btn) {
		var initCode = btn.getAttribute("cb-init");
		if(!initCode || initCode == "/*Initialization Code*/")
			return;
		setTimeout(function() {
			btn.destroy("update");
			btn.init();
		}, 0);
	},
	reinitButtons: function(btns) {
		btns.forEach(this.reinitButton, this);
	},
	getButtonParameters: function(button) {
		// Based on code from \components\CustomButtonsService.js, function getButtonParameters()
		var param = {};

		param.id = button.getAttribute("id");
		param.name = button.getAttribute("name") || button.getAttribute("label") || "";
		param.image = button.getAttribute("image") || button.getAttribute("cb-stdicon") || "";
		param.code = button.getAttribute("cb-oncommand") || "";
		param.initCode = button.getAttribute("cb-init") || "";
		param.accelkey = button.getAttribute("cb-accelkey") || "";
		param.mode = button.getAttribute("cb-mode") || 0;
		param.help = button.getAttribute("Help") || "";

		param. wrappedJSObject = param;
		return param;
	},
	makeButton: function (button, param) {
		function allowedSource() {
			return true;
		}
		// Code from \components\CustomButtonsService.js, function makeButton()
		button.setAttribute("id", param.id);
		button.setAttribute("label", param.name || "");
		button.setAttribute("tooltiptext", param.name || "");
		button.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
		button.setAttribute("context", "custombuttons-contextpopup");
		if(param.image.indexOf("custombuttons-stdicon") == 0)
			button.setAttribute("cb-stdicon", param.image);
		else if(allowedSource(param.image))
			button.setAttribute("image", param.image || "");
		else
			button.setAttribute("image", "");
		button.setAttribute("cb-oncommand", param.code || "");
		button.setAttribute("cb-init", param.initCode || "");
		if(param.accelkey)
			button.setAttribute("cb-accelkey", param.accelkey);
		button.setAttribute("cb-mode", param.mode);
		if(param.help)
			button.setAttribute("Help", param.help);
		if(param.attributes) {
			for(var i in param.attributes) if(param.attributes.hasOwnProperty(i))
				button.setAttribute(i, param.attributes[i]);
		}
	},

	handleEvent: function(e) {
		if(e.type == "beforecustomization")
			this.split();
		//else if(e.type == "aftercustomization")
		//	this.merge();
	},
	closeMenus: function(e) {
		if(e.button == 2)
			return;
		var trg = e.target;
		if(trg.localName == "toolbarbutton" && trg.type != "menu")
			closeMenus(trg);
	},
	_overTimer: 0,
	over: function(e) {
		var trg = e.target;
		if(trg.parentNode != e.currentTarget)
			return;
		if((trg.type || "").substr(0, 4) == "menu") {
			clearTimeout(this._overTimer);
			this._overTimer = 0;
			return;
		}
		if(this._overTimer)
			return;
		this._overTimer = setTimeout(function(_this) {
			_this._overTimer = 0;
			var btns = _this.mp.getElementsByTagName("toolbarbutton");
			for(var i = 0, l = btns.length; i < l; ++i) {
				var btn = btns[i];
				if(
					//btn.boxObject
					//&& btn.boxObject instanceof Components.interfaces.nsIMenuBoxObject
					(btn.type || "").substr(0, 4) == "menu"
					&& "open" in btn
					&& btn.open
				) {
					//btn.open = false;
					var mp = btn.getElementsByTagName("menupopup")[0];
					mp && mp.hidePopup();
					break;
				}
			}
		}, 350, this);
	},

	_style: null,
	addStyles: function() {
		if(this._style)
			return;
		var style = '\
			@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
			%button% > .cbMergeButtonsPopup > toolbarbutton {\n\
				-moz-box-orient: horizontal !important;\n\
				/*-moz-appearance: menuitem !important;*/\n\
				margin: 0 !important;\n\
				padding: 0 2px !important;\n\
			}\n\
			%button% > .cbMergeButtonsPopup > toolbarbutton > .toolbarbutton-icon {\n\
				display: -moz-box !important;\n\
				margin-left: 3px !important;\n\
				margin-right: 3px !important;\n\
				padding: 0 !important;\n\
				max-width: 16px;\n\
				max-height: 16px;\n\
			}\n\
			%button% > .cbMergeButtonsPopup > toolbarbutton > .toolbarbutton-text {\n\
				display: -moz-box !important;\n\
				text-align: left !important;\n\
				margin-left: 6px !important;\n\
				margin-right: 6px !important;\n\
			}\n\
			%button% > .cbMergeButtonsPopup > toolbarbutton > .toolbarbutton-menu-dropmarker {\n\
				display: -moz-box !important;\n\
				/* See styles for .menu-right in chrome://global/skin/menu.css */\n\
				-moz-appearance: menuarrow !important;\n\
				-moz-margin-end: -2px !important;\n\
				list-style-image: none !important;\n\
				min-width: 1.28em !important;\n\
				padding-top: 1px !important;\n\
			}\n\
			%button% > .cbMergeButtonsPopup > toolbarseparator {\n\
				-moz-appearance: menuseparator !important;\n\
			}'
			.replace(/%button%/g, "#" + this.button.id);
		this._style = document.insertBefore(
			document.createProcessingInstruction(
				"xml-stylesheet",
				'href="' + "data:text/css,"
					+ encodeURIComponent(style) + '" type="text/css"'
			),
			document.documentElement
		);
	},
	removeStyles: function() {
		var s = this._style;
		if(s) {
			this._style = null;
			s.parentNode.removeChild(s);
		}
	}
};

function closeMenus(node) {
	// Based on function closeMenus from chrome://browser/content/utilityOverlay.js
	for(; node && "tagName" in node; node = node.parentNode) {
		if(
			node.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
			&& (node.localName == "menupopup" || node.localName == "popup")
		)
			node.hidePopup();
	}
}

LOG("Initialize " + this.type);
this.mergeButtons.initProxy();
this.type = "menu";
this.orient = "horizontal";
this.onDestroy = function(reason) {
	LOG("onDestroy(" + reason + ");");
	if(reason == "constructor")
		return; // Changed XBL binding, ignore
	this.mergeButtons.destroy(reason);
};