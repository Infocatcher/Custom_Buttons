// https://github.com/Infocatcher/Custom_Buttons/tree/master/tests

// Drag-And-Drop Test button for Custom Buttons
// Code for "code" section

// Writes information about dragged data into Error Console
// (disabled by default, left-click to enable/disable)

// (c) Infocatcher 2013-2014
// version 0.1.1 - 2014-03-07

if("__dndTest" in this) {
	this.checked = false;
	removeEventListener("dragstart", this.__dndTest, true);
	removeEventListener("drop", this.__dndTest, true);
	delete this.__dndTest;
}
else {
	this.checked = true;
	this.__dndTest = function(e) {
		var dt = e.dataTransfer;
		setTimeout(function() {
			var types = dt.types;
			var c = dt.mozItemCount;
			var r = [];
			for(var i = 0, li = types.length; i < li; ++i) {
				var type = types[i];
				r.push(i + ": " + type);
				for(var j = 0; j < c; ++j) {
					var data = dt.mozGetDataAt(type, j);
					if(data)
						r.push("  " + j + ": " + data);
				}
			}
			Components.classes["@mozilla.org/consoleservice;1"]
				.getService(Components.interfaces.nsIConsoleService)
				.logStringMessage("DND test: " + e.type + "\n" + r.join("\n"));
		}, 10);
	};
	addEventListener("dragstart", this.__dndTest, true);
	addEventListener("drop", this.__dndTest, true);
}