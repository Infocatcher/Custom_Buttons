// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toggle_Find

// (c) Infocatcher 2015
// version 0.1.0 - 2015-09-21

// Toggle Find button for Custom Buttons
// (code for "code" section)
// Also the code can be used from main window context (as Mouse Gestures code, for example)

var fb = window.gFindBar || document.getElementById("FindToolbar") || document.getElementsByTagName("findbar")[0];
if("TabView" in window && TabView.isVisible())
	TabView.enableSearch();
else {
	var handleSelection = function(sel) {
		var fv = fb._findField.value;
		if(fb.hidden || sel && sel != fv) {
			fb._findField.value = sel;
			fb.onFindCommand();
			fb._find();
		}
		else {
			fb.toggleHighlight(false);
			fb.close();
		}
	};
	if("_getInitialSelection" in fb)
		handleSelection(fb._getInitialSelection());
	else { // Firefox 38+
		var finder = fb.browser.finder;
		var listener = {
			onCurrentSelection: function(sel) {
				finder.removeResultListener(listener);
				handleSelection(sel);
			}
		};
		finder.addResultListener(listener);
		finder.getInitialSelection();
	}
}