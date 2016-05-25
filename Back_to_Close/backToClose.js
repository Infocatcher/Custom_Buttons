// https://github.com/Infocatcher/Custom_Buttons/tree/master/Back_to_Close

// Back to Close button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2009-2010, 2012-2013
// version 0.2.0b2 - 2013-02-09

if(UpdateBackForwardCommands.toString().indexOf("_cb_backToClose") != -1) {
	LOG("!!! Second initialization !!!");
	return; // Don't patch twice
}

var backBtn = $("back-button");
var backToClose = window.cbBackToClose = {
	enabled: false,
	set: function(enable) {
		if(enable == this.enabled)
			return;
		this.enabled = enable;
		this.setStyle(enable);
		setTimeout(function(_this) { // Don't block main thread
			_this.setTip(enable);
		}, 0, this);
	},
	setStyle: function(enable) {
		if(enable)
			backBtn.setAttribute("_cb_backToClose", "true");
		else
			backBtn.removeAttribute("_cb_backToClose");
	},
	setTip: function(enable) {
		var tt = $("back-button-tooltip");
		if(!tt) {
			this.setTip = function() {};
			return;
		}
		var ttLabel = tt.firstChild;
		var baseTip = ttLabel.getAttribute("value");
		var closeTab = $("tabs-closebutton")
			|| $("context_closeTab")
			|| $("menu_close");
		var closeLabel = closeTab && closeTab.getAttribute("label") || "Close Tab";
		var end = closeLabel.substr(1);
		var endLower = end.toLowerCase();
		var closeTip = closeLabel[0] + endLower;
		var closeAdd = " (" + (end == endLower ? closeLabel.toLowerCase() : closeLabel) + ")";

		var backContext = $("context-back");
		var backMenu = $("historyMenuBack");
		if(backContext) {
			var backContextLabel = backContext.getAttribute("label")
				|| backContext.getAttribute("aria-label");
			var backContextTip = backContext.getAttribute("tooltiptext");
		}
		if(backMenu)
			var backMenuLabel = backMenu.getAttribute("label");

		this.setTip = function(enable) {
			ttLabel.setAttribute("value", enable ? closeTip : baseTip);
			var addLabel = enable ? closeAdd : "";
			if(backContext) {
				backContext.setAttribute("label", backContextLabel + addLabel);
				if(backContext.hasAttribute("aria-label"))
					backContext.setAttribute("aria-label", backContextLabel + addLabel);
				if(backContextTip)
					backContext.setAttribute("tooltiptext", backContextTip + addLabel);
			}
			backMenu && backMenu.setAttribute("label", backMenuLabel + addLabel);
		};
		this.setTip(enable);
	}
};
function $(id) {
	return document.getElementById(id);
}

// See UpdateBackForwardCommands() in chrome://browser/content/browser.js
// Now we always can go back
var backBroadcaster = $("Browser:Back");
if(backBroadcaster.getAttribute("disabled") == "true")
	backBroadcaster.removeAttribute("disabled");
var origSetAttribute = backBroadcaster.setAttribute;
backBroadcaster.setAttribute = function(attr, val) {
	if(attr == "disabled" && String(val) == "true")
		return undefined;
	return origSetAttribute.apply(this, arguments);
};

// Why eval? At least Tree Style Tab patch BrowserBack() function.
// Wrapper will break any patches.
var origUpdateBackForwardCommands = UpdateBackForwardCommands;
eval(
	"UpdateBackForwardCommands = "
	+ UpdateBackForwardCommands.toString()
		.replace(
			/\}$/,
			'\n\n\
			cbBackToClose.set(!aWebNavigation.canGoBack);\n}'
		)
);
UpdateBackForwardCommands(gBrowser.webNavigation);

var origBrowserBack = BrowserBack;
eval(
	"BrowserBack = "
	+ BrowserBack.toString()
		.replace(
			/gBrowser\.goBack\(\);?/,
			'\
			if(gBrowser.canGoBack)\n\
				gBrowser.goBack();\n\
			else\n\
				gBrowser.removeCurrentTab();'
		)
);

function getIcon() {
	return backBtn.ownerDocument.getAnonymousElementByAttribute(backBtn, "class", "toolbarbutton-icon");
}
function fixIconSize() {
	var stopTime = Date.now() + 500;
	(function fixIconSize() {
		var btnIcon = getIcon();
		if(!btnIcon) {
			if(Date.now() < stopTime)
				setTimeout(fixIconSize, 10); // Wait for applying of XBL binding
			return;
		}

		var btc = backToClose.enabled;
		btc && backToClose.setStyle(false);

		// Fix button size and allow use small icons (like 16x16 instead of 18x18)
		var sb = backBtn.style;
		sb.width = sb.height = "";

		var si = btnIcon.style;
		si.maxWidth = si.maxHeight = "";

		var bo = backBtn.boxObject;
		sb.setProperty("width",  bo.width  + "px", "important");
		sb.setProperty("height", bo.height + "px", "important");

		bo = btnIcon.boxObject;
		si.setProperty("max-width",  bo.width  + "px", "important");
		si.setProperty("max-height", bo.height + "px", "important");

		btc && backToClose.setStyle(true);
	})();
}
fixIconSize();
//addEventListener("aftercustomization", fixIconSize, false);

// Used images from this style: http://userstyles.org/styles/15313
var cssStr = '\
	@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
	@-moz-document url("' + window.location.href + '") {\n\
		#back-button[_cb_backToClose] > .toolbarbutton-icon {\n\
			list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAYCAMAAAAmopZHAAAB7FBMVEUAAAD+8/MJAQH86OgOAgJpDAzqOzskBATVGBiNEBDnICAJAQHcGRkQAgISAgLpNzftWFi9FRUJAQEUAwMLAgLoLS3mHh70m5u2FBQNAgIUAwMbAwPmGhqvFBTXGBjVGBgbAwOrExPnJCR3DQ3OFxcNAgL73d3wdXWkEhLGFhbqQED85OT61NSgEhIyBgbeGRn85OTwdXWfEhJyDQ384eH84+O2FBSvFBRFCAj85ub84eGbERG6FRX4wsL84+OrExOHDw9cCwv98fH61NTmHBzYGBjsTU3pMjLsVlaNEBCWERGvFBS9FRXoKyuiEhKdEhLoLi6oExPvbW3vb2/nJyfrRET97e3mGhr5yMj61NT86Oj5zc3qOzutExP+8/PuY2OJDw/sUVHwdnbOFxfnJSXrSUnuaGjyhYXrRkaUERHyjIzsUlLqPT3rSEiLEBDoLS2kEhK2FBTlGRnGFha/FRXMFxfuZmbtWlqrExOzFBT+9vb0l5fqPz/DFha4FRWOEBDweHjmHh7pNjbXGBjPFxfhGRnzkpLcGRnoKSnsVFTzkJD72tqbERGCDw+ADg7tX1/tXV2pExPnIiLKFxf4v7/pOTnjGRnvbGz84eHzjo6gEhLoMDDnJCS8FRXpNDSFDw/4wsK0FBTVGBjxfn7SC4CzAAAARHRSTlMAo0hCMi/YIFoZaz26BiznKt4cHhy6bTm6FQQpdY5X3hdaxhv2NDNBxPbzCVN1I45ES7c1Dlxb4iIxZWzvQ2pz2B6MQ/MoKJkAAAF4SURBVHheXcljjyRhFIbhM7Ztrm37LaNt29bYtmfNP7rVlUlPuq7kOfeHA3mtdaVSIGi/0lkZlgCAnvLam19Oip0CNDQONtkWJH4CtD3qwFUqpfJcqVQV+g16+/qXvN6sjYyQtmyhHAxXjEb2D3IaYprQ5PYvevAdqqrdJLmp4bam1txmh9m9NrXFaTYX4e49tcfjjwWtVmsQEUhszH8Gz+tjMzNhedKn1Wp9q+JNysPr8GGIIwhCjrB/RqNRHIbkxF8YG3erBUfYsfNznvMYO1KrXVBzY54SRHf38O08fG83SlEpaG7ZoWk6QNlxg8Egzk4FaBa6uhU8z8to3GQy4QHx0jI+AW8GGIaxxB16vd4hi8vExi0MfBphWJZNTIR+hw4nf0weCp1IsAq4eu36rMuVSc+Rc+lMoV/h1u07fzAMW15JrSxfdgfg/oOHLoSQTqdDqNAAwOMnT58lNyTmAeDFy1evI85iURCUvX33/pcEiI+PJVL/AVfFvH3AyAjJAAAAAElFTkSuQmCC") !important;\n\
			-moz-image-region: auto !important;\n\
		}\n\
		#back-button[_cb_backToClose]:hover > .toolbarbutton-icon {\n\
			list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAYCAMAAAAmopZHAAAB7FBMVEUAAAAJAQH+8/P86OjqQkIkBATpNzcJAQHqOzvuY2MNAgJ3DQ3nIiLrREToMDCNEBAyBgYQAgISAgLoLi4JAQH0m5sLAgJFCAgUAwOOEBD4wsLhGRnvamoUAwMbAwPqQEDmHBz61NTgGRkbAwOCDw/sT0/lGRn73d3xfHzTGBgNAgIOAgL85OT61NTXGBjtWFj85OTxfHzOFxfuY2P84eH84+PlGRnTGBjsUlL85ub84eHTGBjYGBhcCwvpNDT84+PcGRm2FBT98fHoKyurExPyhYWtExOzFBT1oqLzkpK8FRXuZmbuYWHMFxfxfHzVGBjhGRn0l5fGFhbwdXXtWlr++Pjyh4f1oKD3srLOFxftXV3uZGT85OT729v98fH0mZn739/1pKTuY2P+9fXxfn7BFhbsUlLzjo6/FRW6FRXsUVHtW1v1p6e4FRXwc3PsVFTPFxf3trbDFhbyiIjqPz/0np7vamrgGRncGRnIFhamExP3ubnXGBjxgYGvFBSxFBS2FBTqQEDoLi7xf3/60tKkEhLFFhbpNDTsVlbuaGj72NjsTU3nJSX2qan2ra3TGBj0m5voKSn86OjeGRn++vrrSUnlGRnnJyfqPT361NTrRETnJCT97OzrS0vKFxfoKyvpNjaoExP4vb3zkJBeForuAAAARHRSTlMASKNChiDPPafmNBv5hHAZIwYsbRw5HCIePEOm9wQpjupDbxc02c4zRdUVMglTjCpEUcrwDlxu69AxZYH1HupqiOSM+bkz+jAAAAF4SURBVHheXckDjyQBEIbhb2mcbds22hzbtmdtW2frj25P53YnPU9S9VZSqNjXUlcLigPtjW1OrQCAK1e7jtmmv2gsALv37L2rT61o8cChw4+mGD/DWBnG79+ugOMnTjrL1rKXnWK91SZx9tx5yatnQ71/eyVWz0pKQ6w+gqbuRPRfVBKG3g8ljUVjUqkgRX9gV+v8yEgokDebzfnIQkRtIPQVB5sdRmPGuWQLBoO2D+pecmY+4/kLB8/zQqK06vF41CklBH4OHW/nTYrsxGTqe0VqciJrMv1CT+copSAGZyybFZaZQYKivuHmqTitoAjS5XKpQ1A0/RH7Lxg4Lj5Okz6fjxxTNz0ef4cjR8VCIcxZ3G63Jc2l1XJhGafP5ERRNITJRTI2+3M2pjRsEO24eOny2vCwbB8oDtjlnRpw7fqNnE6n6+uX+/uqjQG3bt/RffpveftIA/fuP3i48bsGDeDxk6fPAutaFBQNL1+9JrT+QH28qa+1BUwLvgHarLakAAAAAElFTkSuQmCC") !important;\n\
		}\n\
		#back-button[_cb_backToClose]:active > .toolbarbutton-icon {\n\
			list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAYCAMAAAAmopZHAAAB6VBMVEX////+8/MJAQH86OiCDw8UAwMyBgYUAwNaCgoNAgIJAQENAgIkBAQJAQFcCwtuDQ18Dg6JDw+ADg6FDw+FDw8OAgJFCAgLAgJwDQ30m5v4wsJqDAwbAwOHDw93DQ361NRuDQ2NEBB+Dg4bAwNXCgr73d3sUlJlDAyNEBCHDw/85OT61NRnDAyNEBDtWFj85OTsT09nDAwQAgISAgL84eH84+OADg5+Dg5sDAyHDw/85ub84eFnDAyOEBB1DQ384+N3DQ1RCQn98fFuDQ2oExO4FRW6FRWiEhKbERHMFxetExO2FBSrExNaCgq9FRWSEBC/FRXVGBj2ra28FRXrRETKFxf4v7/3tLT729v739/60tKfEhLYGBhgCwuvFBSkEhKQEBBeCwuEDw+ZERFOCQmJDw+pExPOFxeCDw9PCQlqDAx5Dg6gEhJ3DQ1+Dg7pMjKLEBBuDQ3GFhaxFBSOEBC0FBTXGBhVCgqXERFRCQmFDw9jCwvrSEjPFxfrRkbBFhaUERGADg7qPz/pNzdsDAzoMDCdEhJpDAx1DQ3RFxeHDw9zDQ1YCgrqOzvqQkJMCQmNEBDgGRncGRmzFBR7Dg6mExPqPT2WERHmHh58Dg7pNDRnDAxcCwvIFhbjGRlyDQ31pKTeGRn5yMgz7SLnAAAARHRSTlMAo0hCeh4jBEA0PRUgHB7w2fridvUyIhz8OUOxKZobQ3cZtBc2M0fcke4JU5WQKkRT0wYsDlx08NfbMWWJ9/Bqj+mM/BkShYgAAAGUSURBVHheXcpjkyUxFIDhM7bWtm17kzRxbdvG2Nba3l863ZkP03Wfqpy36uSApq+7uRGo9ndduDjTAAB69l4d4vLf9fLq/tbt3XsymBDzDkLUfVvnw+kqxkQglFaME9Bx5GjI94EIyI2wLMtYqxmPwukzu6ZFASP2M4uIgdBiEoXe1pyfN5czFtdkOCbHwpMuS6YsR6H91KifJ2jc4XCMh2NhWqTe7xusMKIgshan02n5QicrCqvQ/0xxI1/ZHdhQL+kLuH18CI4dUFgGiUgJLbg0CyHlE2JycPJ1ff1n0BtMRkr/NaVIMhiU0nBtYOxHan7eK/2y2Wz0Sd7U0hocfPDnY24mW+TsdjuXorOY/VaEQ4ezhUAgMWEymSbSiTRt4u0SHD+xzKDYYsX411gYRsMFtZVF/xicPXfeLxtknvnH8PLUdgn2wqXLV6JWLm41VA3WeHy7pSkJ4PqNm76ax1OrqcNDa1yx1gHu3L13n/ut9+69cQQAHj1+8vTrps7sXD4CqpbnL16O6CUjb4B+vGpqtAUlaregregFbwAAAABJRU5ErkJggg==") !important;\n\
		}\n\
	}';
var cssURI = makeURI("data:text/css," + encodeURIComponent(cssStr));
var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
	.getService(Components.interfaces.nsIStyleSheetService);
if(!sss.sheetRegistered(cssURI, sss.USER_SHEET))
	sss.loadAndRegisterSheet(cssURI, sss.USER_SHEET);

function destructor(reason) {
	// Note: we don't restore patches from another extensions!
	if(reason == "update" || reason == "delete" || reason == "constructor") {
		// Button changed, removed or opened customize toolbar dialog
		backToClose.set(false);

		backBroadcaster.setAttribute = origSetAttribute;
		UpdateBackForwardCommands = origUpdateBackForwardCommands;
		BrowserBack = origBrowserBack;
		UpdateBackForwardCommands(gBrowser.webNavigation);

		let s = backBtn.style;
		s.width = s.height = "";
		let btnIcon = getIcon();
		if(btnIcon) {
			s = btnIcon.style;
			s.maxWidth = s.maxHeight = "";
		}

		if(reason != "constructor") {
			if(sss.sheetRegistered(cssURI, sss.USER_SHEET))
				sss.unregisterSheet(cssURI, sss.USER_SHEET);
		}
	}
}
if(
	typeof addDestructor == "function" // Custom Buttons 0.0.5.6pre4+
	&& addDestructor != ("addDestructor" in window && window.addDestructor)
)
	addDestructor(destructor, this);
else
	this.onDestroy = destructor;