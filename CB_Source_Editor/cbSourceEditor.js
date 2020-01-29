// https://github.com/Infocatcher/Custom_Buttons/tree/master/CB_Source_Editor
// http://infocatcher.ucoz.net/js/cb/cbSourceEditor.js

// Source Editor (formerly Orion Editor) button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012-2020
// version 0.1.0a11 - 2020-01-29

var options = {
	cssInHelp: true,
	codeMirror: {
		lineNumbers: true,
		enableCodeFolding: true,
		showTrailingSpace: true,
		lineWrapping: false,
		autocomplete: true,
		fontSize: 12
	},
	orion: {
		lineNumbers: true
	}
};
// Also see devtools.editor.* preferences in about:config

const watcherId = "customButtonsSourceEditor_" + this.id;
var {Components} = window; // Prevent garbage collection in Firefox 3.6 and older
var storage = (function() {
	if(!("Services" in window)) // Firefox 3.6 and older
		return Application.storage;
	// Simple replacement for Application.storage
	// See https://bugzilla.mozilla.org/show_bug.cgi?id=1090880
	//var global = Components.utils.getGlobalForObject(Services);
	// Ensure, that we have global object (because window.Services may be overwritten)
	var global = Components.utils.import("resource://gre/modules/Services.jsm", {});
	var ns = "_cbSourceEditorStorage";
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
		get platformVersion() {
			delete this.platformVersion;
			return this.platformVersion = parseFloat(Services.appinfo.platformVersion);
		},
		get hasCodeMirror() {
			delete this.hasCodeMirror;
			return this.hasCodeMirror = Services.appinfo.name == "Pale Moon" //~ todo: test
				|| this.platformVersion >= 27;
		},
		init: function(reason) {
			if(!this.hasCodeMirror) {
				this.isBrowserWindow = function() {
					return false;
				};
			}
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
		initWindow: function(window, reason, isFrame) {
			if(this.isBrowserWindow(window)) {
				this.initBrowserWindow(window, reason);
				return;
			}
			if(!this.isEditorWindow(window))
				return;
			_log("initWindow(): isFrame: " + isFrame);
			var document = window.document;
			if(isFrame)
				window.addEventListener("unload", this, false);

			Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
				.getService(Components.interfaces.mozIJSSubScriptLoader)
				.loadSubScript("chrome://global/content/globalOverlay.js", window);

			var isCodeMirror = false;
			try { // See chrome://browser/content/devtools/scratchpad.js
				Components.utils.import("resource:///modules/source-editor.jsm", window);
			}
			catch(e) {
				var loader = this.platformVersion >= 44 // See https://bugzilla.mozilla.org/show_bug.cgi?id=912121
					? "resource://devtools/shared/Loader.jsm"
					: "resource://gre/modules/devtools/Loader.jsm";
				var g = Components.utils.import(loader, {});
				var require = (g.devtools || g).require;
				[
					"devtools/sourceeditor/editor",
					"devtools/client/sourceeditor/editor", // Firefox 44+
					"devtools/client/shared/sourceeditor/editor" // Firefox 68+
				].some(function(path) {
					try {
						return window.SourceEditor = require(path);
					}
					catch(e) {
					}
					return null;
				});
				isCodeMirror = true;
			}
			var SourceEditor = window.SourceEditor;

			// See view-source:chrome://browser/content/devtools/scratchpad.xul
			// + view-source:chrome://browser/content/devtools/source-editor-overlay.xul
			var psXUL = (isCodeMirror
			? '<!DOCTYPE popupset [\
				<!ENTITY % editMenuStrings SYSTEM "chrome://global/locale/editMenuOverlay.dtd">\
				%editMenuStrings;\
				<!ENTITY % sourceEditorStrings SYSTEM "' + (
					Services.appinfo.name == "Pale Moon" || Services.appinfo.name == "Basilisk"
						? this.platformVersion >= 4.1
							? "chrome://devtools/locale/sourceeditor.dtd"
							: "chrome://global/locale/devtools/sourceeditor.dtd"
						: this.platformVersion >= 45
							? "chrome://devtools/locale/sourceeditor.dtd"
							: "chrome://browser/locale/devtools/sourceeditor.dtd"
				) + '">\
				%sourceEditorStrings;\
			]>\
			<popupset id="sourceEditorPopupset"\
				xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">\
				<menupopup id="sourceEditorContext"\
					onpopupshowing="goUpdateSourceEditorMenuItems()">\
					<menuitem id="menu_undo" label="&undoCmd.label;" accesskey="&undoCmd.accesskey;"\
						oncommand="goDoCommand(\'cmd_undo\')" />\
					<menuitem id="menu_redo" label="&redoCmd.label;" accesskey="&redoCmd.accesskey;"\
						oncommand="goDoCommand(\'cmd_redo\')" />\
					<menuseparator/>\
					<menuitem id="menu_cut" label="&cutCmd.label;" accesskey="&cutCmd.accesskey;"\
						oncommand="goDoCommand(\'cmd_cut\')" />\
					<menuitem id="menu_copy" label="&copyCmd.label;" accesskey="&copyCmd.accesskey;"\
						oncommand="goDoCommand(\'cmd_copy\')" />\
					<menuitem id="menu_paste" label="&pasteCmd.label;" accesskey="&pasteCmd.accesskey;"\
						oncommand="goDoCommand(\'cmd_paste\')" />\
					<menuitem id="menu_delete" label="&deleteCmd.label;" accesskey="&deleteCmd.accesskey;"\
						oncommand="goDoCommand(\'cmd_delete\')" />\
					<menuseparator/>\
					<menuitem id="menu_selectAll" label="&selectAllCmd.label;" accesskey="&selectAllCmd.accesskey;"\
						oncommand="goDoCommand(\'cmd_selectAll\')" />\
					<menuseparator/>\
					<menuitem id="menu_find" label="&findCmd.label;" accesskey="&findCmd.accesskey;" />\
					<menuitem id="menu_findAgain" label="&findAgainCmd.label;" accesskey="&findAgainCmd.accesskey;" />\
					<menuseparator/>\
					<menuitem id="se-menu-gotoLine"\
						label="&gotoLineCmd.label;"\
						accesskey="&gotoLineCmd.accesskey;"\
						key="key_gotoLine"\
						oncommand="goDoCommand(\'cmd_gotoLine\')"/>\
				</menupopup>\
			</popupset>'
			: '<popupset id="sourceEditorPopupset"\
				xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">\
				<menupopup id="sourceEditorContext"\
					onpopupshowing="goUpdateSourceEditorMenuItems()">\
					<menuitem id="se-menu-undo"/>\
					<menuitem id="se-menu-redo"/>\
					<menuseparator/>\
					<menuitem id="se-menu-cut"/>\
					<menuitem id="se-menu-copy"/>\
					<menuitem id="se-menu-paste"/>\
					<menuitem id="se-menu-delete"/>\
					<menuseparator/>\
					<menuitem id="se-menu-selectAll"/>\
					<menuseparator/>\
					<menuitem id="se-menu-find"/>\
					<menuitem id="se-menu-findAgain"/>\
					<menuseparator/>\
					<menuitem id="se-menu-gotoLine"/>\
				</menupopup>\
			</popupset>'
			).replace(/>\s+</g, "><");

			var ps = this.parseXULFromString(psXUL);
            // "Edit Custom Button in Tab" button, Firefox 71+
            if(isFrame && "parseFromSafeString" in window.DOMParser.prototype)
                ps = window.MozXULElement.parseXULToFragment(ps.outerHTML);
			document.documentElement.appendChild(ps);

			window.setTimeout(function() {
				function appendNode(nodeName, id) {
					var node = document.createElementNS(xulns, nodeName);
					node.id = id;
					document.documentElement.appendChild(node);
				}
				appendNode("commandset", "editMenuCommands");
				appendNode("commandset", "sourceEditorCommands");
				appendNode("keyset", "sourceEditorKeys");
				appendNode("keyset", "editMenuKeys");

				this.loadOverlays(
					window,
					function done() {
						window.setTimeout(function() {
							var mp = document.getElementById("sourceEditorContext");
							if(mp.state == "closed")
								return;
							Array.prototype.forEach.call(
								mp.getElementsByAttribute("command", "*"),
								function(mi) {
									var cmd = mi.getAttribute("command");
									var controller = document.commandDispatcher
										.getControllerForCommand(cmd);
									if(controller && !controller.isCommandEnabled(cmd))
										mi.setAttribute("disabled", "true");
								}
							);
						}, 0);
						if(!isCodeMirror)
							return;
						// See view-source:chrome://browser/content/devtools/scratchpad.xul in Firefox 27.0a1
						window.goUpdateSourceEditorMenuItems = function() {
							goUpdateGlobalEditMenuItems();
							var commands = ["cmd_undo", "cmd_redo", "cmd_cut", "cmd_paste", "cmd_delete"];
							commands.forEach(goUpdateCommand);
						};
						var cmdsMap = {
							"se-menu-undo":   "cmd_undo",
							"se-menu-redo":   "cmd_redo",
							"se-menu-cut":    "cmd_cut",
							"se-menu-copy":   "cmd_copy",
							"se-menu-paste":  "cmd_paste",
							"se-menu-delete": "cmd_delete",
							__proto__: null
						};
						for(var id in cmdsMap) {
							var mi = document.getElementById(id);
							mi && mi.setAttribute("command", cmdsMap[id]);
						}
						// We can't use command="cmd_selectAll", menuitem will be wrongly disabled sometimes
						var enabledCmdsMap = {
							"se-menu-selectAll": "cmd_selectAll",
							"se-menu-findAgain": "cmd_findAgain",
							__proto__: null
						};
						for(var id in enabledCmdsMap) {
							var mi = document.getElementById(id);
							if(mi) {
								mi.removeAttribute("command");
								mi.removeAttribute("disabled");
								mi.setAttribute("oncommand", "goDoCommand('" + enabledCmdsMap[id] + "');");
							}
						}
						// Workaround: emulate keyboard shortcut
						var keyCmdsMap = {
							"menu_find":      { keyCode: KeyboardEvent.DOM_VK_F, charCode: "f".charCodeAt(0), ctrlKey: true },
							"menu_findAgain": { keyCode: KeyboardEvent.DOM_VK_G, charCode: "g".charCodeAt(0), ctrlKey: true },
							__proto__: null
						};
						var _key = function() {
							var e = this._keyData;
							var evt = document.createEvent("KeyboardEvent");
							evt.initKeyEvent(
								"keydown", true /*bubbles*/, true /*cancelable*/, window,
								e.ctrlKey || false, e.altKey || false, e.shiftKey || false, e.metaKey || false,
								e.keyCode || 0, e.charCode || 0
							);
							document.commandDispatcher.focusedElement.dispatchEvent(evt);
						};
						for(var id in keyCmdsMap) {
							var mi = document.getElementById(id);
							if(mi) {
								mi.removeAttribute("command");
								mi.removeAttribute("disabled");
								mi.setAttribute("oncommand", "this._key();");
								mi._keyData = keyCmdsMap[id];
								mi._key = _key;
							}
						}
						// Fix styles for autocomplete tooltip
						function css(uri) {
							document.insertBefore(document.createProcessingInstruction(
								"xml-stylesheet",
								'href="' + uri + '" type="text/css"'
							), document.documentElement);
						}
						css("resource://devtools/client/themes/variables.css");
						css("resource://devtools/client/themes/common.css");
						css("chrome://devtools/skin/tooltips.css");
						if(this.platformVersion >= 68) window.setTimeout(function fixSelection() {
							var sheets = document.styleSheets;
							for(var i = sheets.length - 1; i >= 0; --i) {
								var sheet = sheets[i];
								if(sheet.href != "resource://devtools/client/themes/common.css")
									continue;
								try {
									var rules = sheet.cssRules;
								}
								catch(e) {
									// InvalidAccessError:
									// A parameter or an operation is not supported by the underlying object
									return window.setTimeout(fixSelection, 10);
								}
								for(var j = 0, len = rules.length; j < len; ++j)
									if(rules[j].selectorText == "::selection")
										return !sheet.deleteRule(j);
								break;
							}
							return false;
						}, 10);
					}.bind(this),
					["chrome://global/content/editMenuOverlay.xul", function check(window) {
						return window.document.getElementById("editMenuCommands").hasChildNodes();
					}],
					["chrome://browser/content/devtools/source-editor-overlay.xul", function check(window) {
						return window.document.getElementById("sourceEditorCommands").hasChildNodes();
					}]
				);
			}.bind(this), 500); // We should wait to not break other extensions with document.loadOverlay()

			var tabs = document.getElementById("custombuttons-editbutton-tabbox");
			var selectedPanel = tabs.selectedPanel;
			Array.prototype.slice.call(document.getElementsByTagName("cbeditor")).forEach(function(cbEditor) {
				if("__sourceEditor" in cbEditor)
					return;
				var code = cbEditor.value;
				var isCSS = options.cssInHelp && cbEditor.id == "help";
				if(isCodeMirror) {
					var opts = {
						mode: isCSS
							? SourceEditor.modes.css
							: SourceEditor.modes.js,
						value: code,
						lineNumbers: true,
						enableCodeFolding: true,
						showTrailingSpace: true,
						autocomplete: true,
						contextMenu: "sourceEditorContext"
					};
					var optsOvr = options.codeMirror;
					for(var opt in optsOvr) if(optsOvr.hasOwnProperty(opt))
						opts[opt] = optsOvr[opt];
					var se = new SourceEditor(opts);
					if("codeMirror" in se) window.setTimeout(function() {
						if("insertCommandsController" in se)
							se.insertCommandsController(); // Pale Moon and Basilisk
						else
							this.insertCommandsController(se);
					}.bind(this), 200);
				}
				else {
					var se = new SourceEditor();
				}
				se.__isCodeMirror = isCodeMirror;
				var seElt = document.createElementNS(xulns, "hbox");
				if(cbEditor.id)
					seElt.id = "sourceEditor-" + cbEditor.id;
				seElt.className = "sourceEditor";
				seElt.setAttribute("flex", 1);
				seElt.__sourceEditor = se;
				cbEditor.parentNode.insertBefore(seElt, cbEditor);
				//cbEditor.setAttribute("hidden", "true");
				cbEditor.setAttribute("collapsed", "true");
				cbEditor.parentNode.appendChild(cbEditor);
				cbEditor.__sourceEditor = se;
				cbEditor.__sourceEditorElt = seElt;
				cbEditor.__defineGetter__("value", function() {
					if("__sourceEditor" in this) {
						var se = this.__sourceEditor;
						if(!se.__initialized)
							return se.__value;
						return se.getText().replace(/\r\n?|\n\r?/g, "\n");
					}
					return this.textbox.value;
				});
				cbEditor.__defineSetter__("value", function(v) {
					if("__sourceEditor" in this) {
						var se = this.__sourceEditor;
						if(!se.__initialized) {
							var _this = this;
							se.__onLoadCallbacks.push(function() {
								_this.value = v;
							});
							return se.__value = v;
						}
						return se.setText(v.replace(/\r\n?|\n\r?/g, "\n"));
					}
					return this.textbox.value = v;
				});
				cbEditor.selectLine = function(lineNumber) {
					if("__sourceEditor" in this) {
						var se = this.__sourceEditor;
						if(!se.__initialized) {
							var _this = this, args = arguments;
							se.__onLoadCallbacks.push(function() {
								_this.selectLine.apply(_this, args);
							});
							return undefined;
						}
						if(se.__isCodeMirror) {
							//se.focus();
							//se.setCursor({ line: lineNumber - 1, ch: 0 });
							//~ todo: optimize
							var val = this.value;
							var lines = val.split("\n");
							var line = Math.min(lineNumber - 1, lines.length);
							var ch = lines[line].length;
							se.focus();
							return se.setSelection({ line: line, ch: 0 }, { line: line, ch: ch });
						}
						else {
							var selStart = se.getLineStart(lineNumber - 1);
							var selEnd = se.getLineEnd(lineNumber - 1, false);
							se.focus();
							return se.setSelection(selStart, selEnd);
						}
					}
					return this.__proto__.selectLine.apply(this, arguments);
				};

				// For edit_button() from chrome://custombuttons/content/editExternal.js
				seElt.__cbEditor = cbEditor;
				seElt.__defineGetter__("localName", function() {
					return "cbeditor";
				});
				seElt.__defineGetter__("value", function() {
					return this.__cbEditor.value;
				});
				seElt.__defineSetter__("value", function(val) {
					this.__cbEditor.value = val;
				});

				se.__initialized = false;
				se.__onLoadCallbacks = [];
				se.__value = code;
				var onTextChanged = se.__onTextChanged = function() {
					window.editor.changed = true;
				};
				var isLoaded = reason == this.REASON_WINDOW_LOADED;
				function done() {
					se.__initialized = true;
					se.__onLoadCallbacks.forEach(function(fn) {
						try {
							fn();
						}
						catch(e) {
							Components.utils.reportError(e);
						}
					});
					delete se.__onLoadCallbacks;
					delete se.__value;
				}
				if(isCodeMirror) {
					se.appendTo(seElt).then(function() {
						try {
							se.setupAutoCompletion();
						}
						catch(e) {
							Components.utils.reportError(e);
						}
						if("setFontSize" in se) try {
							se.setFontSize(options.codeMirror.fontSize);
						}
						catch(e) {
							Components.utils.reportError(e);
						}
						window.setTimeout(function() {
							window.editor.changed = false; // Strange...
							window.setTimeout(function() { // Workaround for unexpected onTextChanged() calls
								if(window.editor.changed && cbEditor.value == code)
									window.editor.changed = false;
							}, 100);
							se.on("change", onTextChanged);
							if(isLoaded) {
								if("clearHistory" in se)
									se.clearHistory();
								else {
									var seGlobal = Components.utils.getGlobalForObject(SourceEditor.prototype);
									// Note: this is resource://app/modules/devtools/gDevTools.jsm scope in Firefox 34+
									var cm = seGlobal.editors.get(se);
									cm.clearHistory();
								}
							}
						}, isFrame ? 50 : 15); // Oh, magic delays...
						done();

						// See resource:///modules/devtools/sourceeditor/editor.js
						// doc.defaultView.controllers.insertControllerAt(0, controller(this, doc.defaultView));
						var controllers = window.controllers; // nsIControllers
						var controller = se.__cmdController = controllers.getControllerAt(0);
						if("__cmdControllers" in tabs)
							tabs.__cmdControllers.push(controller);
						else {
							tabs.__cmdControllers = [controller];
							var onSelect = tabs.__onSelect = function() {
								var seElt = tabs.selectedPanel;
								if(!seElt || !("__sourceEditor" in seElt))
									return;
								var se = seElt.__sourceEditor;
								var curController = se.__cmdController;
								tabs.__cmdControllers.forEach(function(controller) {
									try {
										if(controller == curController)
											controllers.insertControllerAt(0, controller);
										else
											controllers.removeController(controller);
									}
									catch(e) {
									}
								});
							};
							tabs.addEventListener("select", onSelect, false);
							window.setTimeout(onSelect, 0); // Activate controller from selected tab
						}
					});
				}
				else {
					var opts = {
						mode: isCSS
							? SourceEditor.MODES.CSS
							: SourceEditor.MODES.JAVASCRIPT,
						showLineNumbers: true,
						initialText: code,
						placeholderText: code, // For backward compatibility
						contextMenu: "sourceEditorContext"
					};
					var optsOvr = options.orion;
					for(var opt in optsOvr) if(optsOvr.hasOwnProperty(opt))
						opts[opt] = optsOvr[opt];
					se.init(seElt, opts, function callback() {
						done();
						isLoaded && se.resetUndo && se.resetUndo();
						se.addEventListener(SourceEditor.EVENTS.TEXT_CHANGED, onTextChanged);

						// Hack to use selected editor
						var controller = se.ui._controller;
						controller.__defineGetter__("_editor", function() {
							var seElt = tabs.selectedPanel;
							var se = seElt && seElt.__sourceEditor
								|| document.getElementsByTagName("cbeditor")[0].__sourceEditor;
							return se;
						});
						controller.__defineSetter__("_editor", function() {});
					});
				}
			}, this);
			// Trick to select correct tab (especially if was selected "Button settings" tab)
			tabs.tabs.advanceSelectedTab(1, true);
			tabs.tabs.advanceSelectedTab(-1, true);

			var origExecCmd = window.editor.execute_oncommand_code;
			window.editor.execute_oncommand_code = function() {
				var cd = document.commandDispatcher;
				var cdFake = {
					__proto__: cd,
					get focusedElement() {
						var selectedTab = tabs.selectedTab;
						if(selectedTab && selectedTab.id == "code-tab")
							return document.getElementById("code").textbox.inputField;
						return cd.focusedElement;
					}
				};
				document.__defineGetter__("commandDispatcher", function() {
					return cdFake;
				});
				try {
					var ret = origExecCmd.apply(this, arguments);
				}
				catch(e) {
					Components.utils.reportError(e);
				}
				// document.hasOwnProperty("commandDispatcher") == false, so we cat just delete our fake property
				delete document.commandDispatcher;
				return ret;
			};

			window.addEventListener("load", function ensureObserversAdded() {
				window.removeEventListener("load", ensureObserversAdded, false);
				window.setTimeout(function() { window.editor.removeObservers(); }, 0);
				window.setTimeout(function() { window.editor.addObservers();    }, 0);
			}, false);
			// Fix for Ctrl+S hotkey (catched by CodeMirror)
			var hke = this.handleKeyEvent;
			window.addEventListener("keydown",  hke, true);
			window.addEventListener("keypress", hke, true);
			window.addEventListener("keyup",    hke, true);
		},
		insertCommandsController: function(se) {
			this.insertCommandsController = insertCommandsController;
			return insertCommandsController(se);
			// devtools/client/sourceeditor/editor-commands-controller in Pale Moon/Basilisk
			function createController(ed) {
				return {
					supportsCommand: function (cmd) {
						switch (cmd) {
							case "cmd_find":
							case "cmd_findAgain":
							case "cmd_gotoLine":
							case "cmd_undo":
							case "cmd_redo":
							case "cmd_delete":
							case "cmd_selectAll":
								return true;
						}

						return false;
					},

					isCommandEnabled: function (cmd) {
						let cm = ed.codeMirror;

						switch (cmd) {
							case "cmd_find":
							case "cmd_gotoLine":
							case "cmd_selectAll":
								return true;
							case "cmd_findAgain":
								return cm.state.search != null && cm.state.search.query != null;
							case "cmd_undo":
								return ed.canUndo();
							case "cmd_redo":
								return ed.canRedo();
							case "cmd_delete":
								return ed.somethingSelected();
						}

						return false;
					},

					doCommand: function (cmd) {
						let cm = ed.codeMirror;

						let map = {
							"cmd_selectAll": "selectAll",
							"cmd_find": "find",
							"cmd_undo": "undo",
							"cmd_redo": "redo",
							"cmd_delete": "delCharAfter",
							"cmd_findAgain": "findNext"
						};

						if (map[cmd]) {
							cm.execCommand(map[cmd]);
							return;
						}

						if (cmd == "cmd_gotoLine") {
							ed.jumpToLine();
						}
					},

					onEvent: function () {}
				};
			}
			function insertCommandsController(sourceEditor) {
				let input = sourceEditor.codeMirror.getInputField();
				let controller = createController(sourceEditor);
				input.controllers.insertControllerAt(0, controller);
			}
		},
		destroyWindow: function(window, reason, isFrame) {
			if(reason == this.REASON_WINDOW_CLOSED)
				window.removeEventListener(this.loadEvent, this, false); // Window can be closed before DOMContentLoaded
			if(this.isBrowserWindow(window)) {
				this.destroyBrowserWindow(window, reason);
				return;
			}
			if(!this.isEditorWindow(window) || !("SourceEditor" in window))
				return;
			_log("destroyWindow(): isFrame: " + isFrame);
			var document = window.document;
			if(isFrame)
				window.removeEventListener("unload", this, false);

			var tabs = document.getElementById("custombuttons-editbutton-tabbox");
			if("__onSelect" in tabs) {
				tabs.removeEventListener("select", tabs.__onSelect, false);
				delete tabs.__onSelect;
				delete tabs.__cmdControllers;
			}

			Array.prototype.slice.call(document.getElementsByTagName("cbeditor")).forEach(function(cbEditor) {
				if(!("__sourceEditor" in cbEditor))
					return;
				var se = cbEditor.__sourceEditor;
				var isCodeMirror = se.__isCodeMirror;
				if(isCodeMirror)
					se.off("change", se.__onTextChanged);
				else
					se.removeEventListener(window.SourceEditor.EVENTS.TEXT_CHANGED, se.__onTextChanged);
				delete se.__onTextChanged;
				if(reason == this.REASON_SHUTDOWN) {
					var val = cbEditor.value;
					delete cbEditor.value;
					delete cbEditor.selectLine;

					var seElt = cbEditor.__sourceEditorElt;
					seElt.parentNode.insertBefore(cbEditor, seElt);
					seElt.parentNode.removeChild(seElt);
					delete cbEditor.__sourceEditorElt;
					delete cbEditor.__sourceEditor;
					delete seElt.__sourceEditor;
					delete seElt.__cbEditor;

					cbEditor.value = val;
					window.setTimeout(function() {
						cbEditor.removeAttribute("collapsed");
					}, 0);
				}
				se.destroy();
				if("__cmdController" in se) {
					try {
						window.controllers.removeController(se.__cmdController);
					}
					catch(e) {
					}
					delete se.__cmdController;
				}
			}, this);

			if(reason == this.REASON_SHUTDOWN) {
				delete window.editor.execute_oncommand_code;
				[
					"sourceEditorPopupset",
					"editMenuCommands",
					"sourceEditorCommands",
					"sourceEditorKeys",
					"editMenuKeys"
				].forEach(function(id) {
					var node = document.getElementById(id);
					node && node.parentNode.removeChild(node);
				});
				[
					// chrome://global/content/globalOverlay.js
					"closeWindow", "canQuitApplication", "goQuitApplication", "goUpdateCommand", "goDoCommand",
					"goSetCommandEnabled", "goSetMenuValue", "goSetAccessKey", "goOnEvent", "visitLink",
					"setTooltipText", "NS_ASSERT",
					// chrome://global/content/editMenuOverlay.xul => view-source:chrome://global/content/editMenuOverlay.js
					"goUpdateGlobalEditMenuItems", "goUpdateUndoEditMenuItems", "goUpdatePasteMenuItems"
				].forEach(function(p) {
					delete window[p];
				});
				for(var child = document.documentElement; child = child.previousSibling; ) {
					if(
						child.nodeType == child.PROCESSING_INSTRUCTION_NODE
						&& child.data.indexOf("://devtools/") != -1
					) {
						setTimeout(function(child) {
							child.parentNode.removeChild(child);
						}, 0, child);
					}
				}
				delete window.SourceEditor;
			}
			var hke = this.handleKeyEvent;
			window.removeEventListener("keydown",  hke, true);
			window.removeEventListener("keypress", hke, true);
			window.removeEventListener("keyup",    hke, true);
			//~ todo: we have one not removed controller!
			//LOG("getControllerCount(): " + window.controllers.getControllerCount());
		},
		initBrowserWindow: function(window, reason) {
			_log("initBrowserWindow()");
			window.addEventListener("DOMContentLoaded", this, false);
			Array.prototype.forEach.call(window.frames, function(frame) {
				this.initWindow(frame, reason, true);
			}, this);
		},
		destroyBrowserWindow: function(window, reason) {
			_log("destroyBrowserWindow()");
			window.removeEventListener("DOMContentLoaded", this, false);
			Array.prototype.forEach.call(window.frames, function(frame) {
				this.destroyWindow(frame, reason, true);
			}, this);
		},
		isEditorWindow: function(window) {
			return window.location.href.substr(0, 41) == "chrome://custombuttons/content/editor.xul";
		},
		isBrowserWindow: function(window) {
			var loc = window.location.href;
			return loc == "chrome://browser/content/browser.xul"
				|| loc == "chrome://browser/content/browser.xhtml" // Firefox 69+
				|| loc == "chrome://navigator/content/navigator.xul";
		},
		get loadEvent() { // "DOMContentLoaded" -> initWindow() may hang editor window (and browser)
			delete this.loadEvent;
			return this.loadEvent = this.platformVersion >= 73 ? "load" : "DOMContentLoaded";
		},
		observe: function(subject, topic, data) {
			if(topic == "quit-application-granted")
				this.destroy();
			else if(topic == "domwindowopened")
				subject.addEventListener(this.loadEvent, this, false);
			else if(topic == "domwindowclosed")
				this.destroyWindow(subject, this.REASON_WINDOW_CLOSED);
		},
		handleEvent: function(e) {
			switch(e.type) {
				case "DOMContentLoaded":
				case "load":
					//var window = e.currentTarget;
					var window = e.target.defaultView || e.target;
					window.removeEventListener(e.type, this, false);
					var isFrame = window != e.currentTarget;
					this.initWindow(window, this.REASON_WINDOW_LOADED, isFrame);
				break;
				case "unload":
					//var window = e.currentTarget;
					var window = e.target.defaultView || e.target;
					window.removeEventListener(e.type, this, false);
					this.destroyWindow(window, this.REASON_WINDOW_CLOSED, true);
			}
		},
		handleKeyEvent: function(e) {
			if(
				(e.keyCode == e.DOM_VK_S || String.fromCharCode(e.charCode).toUpperCase() == "S")
				&& e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey
			) {
				e.preventDefault();
				e.stopPropagation();
				if(e.type == "keydown") {
					var window = e.currentTarget;
					window.editor.updateButton();
				}
			}
		},
		loadOverlays: function() {
			this.runGenerator(this.loadOverlaysGen, this, arguments);
		},

		get loadOverlaysGen() {
			var fn = this._loadOverlaysGen.toString()
				.replace(/__yield/g, "yield");
			try {
				new Function("function test() { yield 0; }");
			}
			catch(e) { // Firefox 58+: SyntaxError: yield expression is only valid in generators
				fn = fn.replace("function", "function*"); // Firefox 26+
			}
			delete this.loadOverlaysGen;
			return this.loadOverlaysGen = eval("(" + fn + ")");
		},
		_loadOverlaysGen: function loadOverlaysGen(window, callback/*, overlayData1, ...*/) {
			var gen = loadOverlaysGen.__generator;
			for(var i = 2, l = arguments.length; i < l; ++i) {
				var overlayData = arguments[i];
				this.loadOverlay(window, overlayData[0], overlayData[1], function() {
					gen.next();
				});
				__yield(0);
			}
			callback();
			__yield(0);
		},
		loadOverlay: function(window, uri, check, callback) {
			var document = window.document;
			var stopWait = Date.now() + 4500;
			window.setTimeout(function load() {
				_log("loadOverlay(): " + uri);
				var tryAgain = Date.now() + 800;
				try {
					document.loadOverlay(uri, null);
				}
				catch(e) {
					window.setTimeout(callback, 0);
					return;
				}
				window.setTimeout(function ensureLoaded() {
					if(check(window))
						window.setTimeout(callback, 0);
					else if(Date.now() > stopWait)
						return;
					else if(Date.now() > tryAgain)
						window.setTimeout(load, 0);
					else
						window.setTimeout(ensureLoaded, 50);
				}, 50);
			}, 0);
		},
		runGenerator: function(genFunc, context, args) {
			var gen = genFunc.apply(context, args);
			genFunc.__generator = gen;
			gen.next();
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
	storage.set(watcherId, watcher);
	setTimeout(function() {
		watcher.init(watcher.REASON_STARTUP);
	}, 50);
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

function ts() {
	var d = new Date();
	var ms = d.getMilliseconds();
	return d.toTimeString().replace(/^.*\d+:(\d+:\d+).*$/, "$1") + ":" + "000".substr(("" + ms).length) + ms + " ";
}
function _log(s) {
	Services.console.logStringMessage("[Custom Buttons :: Source Editor] " + ts() + s);
}