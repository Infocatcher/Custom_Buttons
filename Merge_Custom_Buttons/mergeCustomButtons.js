// http://infocatcher.ucoz.net/js/cb/mergeButtons.js

// Merge Buttons button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2011, 2013
// version 0.1.0a4 - 2013-02-06

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
				&& node.boxObject instanceof Components.interfaces.nsIMenuBoxObject
				&& node.open
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
		mp.setAttribute("onclick", "if(event.target == this) this.parentNode.mergeButtons.close(event);");
		mp.setAttribute("onmouseover", "this.parentNode.mergeButtons.over(event);");
		delete this.mp;
		return this.mp = mp;
	},
	init: function() {
		setTimeout(function(_this) {
			_this.merge();
			setTimeout(function() {
				_this.addStyles();
			}, 50);
		}, 10, this);
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
		mp.appendChild(df);
	},
	split: function() {
		if(!this.merged)
			return;
		this.merged = false;

		var btn = this.button;
		var next1 = btn.nextSibling;
		var next2 = next1 && next1.nextSibling;
		if(
			next1 && next1.localName == "toolbarseparator"
			&& next2 && next2.localName == "toolbarseparator"
		)
			next1.collapsed = next2.collapsed = false;

		var df = document.createDocumentFragment();
		var mp = this.mp;
		while(mp.hasChildNodes())
			df.appendChild(mp.firstChild);

		btn.parentNode.insertBefore(df, btn.nextSibling);
	},
	toggle: function() {
		if(this.merged)
			this.split();
		else
			this.merge();
	},

	handleEvent: function(e) {
		if(e.type == "beforecustomization")
			this.split();
		//else if(e.type == "aftercustomization")
		//	this.merge();
	},
	close: function(e) {
		if(e.button == 2)
			return;
		var trg = e.target;
		if(trg.localName == "toolbarbutton" && trg.type != "menu")
			closeMenus(trg); //~ todo: doesn't work in Thunderbird
	},
	_overTimer: 0,
	over: function(e) {
		var trg = e.target;
		if(trg.parentNode != e.currentTarget)
			return;
		if((trg.type || "").substr(0, 4) == "menu") {
			clearTimeout(this._overTimer);
			return;
		}
		this._overTimer = setTimeout(function(_this) {
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

this.type = "menu";
this.orient = "horizontal";
this.mergeButtons.init();
//LOG("init();");
this.onDestroy = function(reason) {
	//LOG("onDestroy(" + reason + ");");
	this.mergeButtons.destroy(reason);
};