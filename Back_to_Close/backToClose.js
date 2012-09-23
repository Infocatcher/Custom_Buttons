// https://github.com/Infocatcher/Custom_Buttons/tree/master/Back_to_Close

// Back to Close button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2009-2010, 2012
// version 0.2.0a1 - 2012-09-23

var backBtn = document.getElementById("back-button");

// See UpdateBackForwardCommands() in chrome://browser/content/browser.js
// Now we always can go back
var backBroadcaster = document.getElementById("Browser:Back");
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
eval(
	"UpdateBackForwardCommands = "
	+ UpdateBackForwardCommands.toString()
		.replace(
			/[ \t]*if \(backDisabled == aWebNavigation\.canGoBack\)/,
			'\
			var backBtn = document.getElementById("back-button");\n\
			var backToClose = backBtn.hasAttribute("_cb_backToClose");\n\
			if(aWebNavigation.canGoBack == backToClose) {\n\
				if(backToClose)\n\
					backBtn.removeAttribute("_cb_backToClose");\n\
				else\n\
					backBtn.setAttribute("_cb_backToClose", "true");\n\
			}\n$&'
		)
);

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

// Used images from this style: http://userstyles.org/styles/15313
var style = '\
	@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
	#back-button[_cb_backToClose] > .toolbarbutton-icon {\n\
		list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAYCAMAAAAmopZHAAAB7FBMVEUAAAD+8/MJAQH86OgOAgJpDAzqOzskBATVGBiNEBDnICAJAQHcGRkQAgISAgLpNzftWFi9FRUJAQEUAwMLAgLoLS3mHh70m5u2FBQNAgIUAwMbAwPmGhqvFBTXGBjVGBgbAwOrExPnJCR3DQ3OFxcNAgL73d3wdXWkEhLGFhbqQED85OT61NSgEhIyBgbeGRn85OTwdXWfEhJyDQ384eH84+O2FBSvFBRFCAj85ub84eGbERG6FRX4wsL84+OrExOHDw9cCwv98fH61NTmHBzYGBjsTU3pMjLsVlaNEBCWERGvFBS9FRXoKyuiEhKdEhLoLi6oExPvbW3vb2/nJyfrRET97e3mGhr5yMj61NT86Oj5zc3qOzutExP+8/PuY2OJDw/sUVHwdnbOFxfnJSXrSUnuaGjyhYXrRkaUERHyjIzsUlLqPT3rSEiLEBDoLS2kEhK2FBTlGRnGFha/FRXMFxfuZmbtWlqrExOzFBT+9vb0l5fqPz/DFha4FRWOEBDweHjmHh7pNjbXGBjPFxfhGRnzkpLcGRnoKSnsVFTzkJD72tqbERGCDw+ADg7tX1/tXV2pExPnIiLKFxf4v7/pOTnjGRnvbGz84eHzjo6gEhLoMDDnJCS8FRXpNDSFDw/4wsK0FBTVGBjxfn7SC4CzAAAARHRSTlMAo0hCMi/YIFoZaz26BiznKt4cHhy6bTm6FQQpdY5X3hdaxhv2NDNBxPbzCVN1I45ES7c1Dlxb4iIxZWzvQ2pz2B6MQ/MoKJkAAAF4SURBVHheXcljjyRhFIbhM7Ztrm37LaNt29bYtmfNP7rVlUlPuq7kOfeHA3mtdaVSIGi/0lkZlgCAnvLam19Oip0CNDQONtkWJH4CtD3qwFUqpfJcqVQV+g16+/qXvN6sjYyQtmyhHAxXjEb2D3IaYprQ5PYvevAdqqrdJLmp4bam1txmh9m9NrXFaTYX4e49tcfjjwWtVmsQEUhszH8Gz+tjMzNhedKn1Wp9q+JNysPr8GGIIwhCjrB/RqNRHIbkxF8YG3erBUfYsfNznvMYO1KrXVBzY54SRHf38O08fG83SlEpaG7ZoWk6QNlxg8Egzk4FaBa6uhU8z8to3GQy4QHx0jI+AW8GGIaxxB16vd4hi8vExi0MfBphWJZNTIR+hw4nf0weCp1IsAq4eu36rMuVSc+Rc+lMoV/h1u07fzAMW15JrSxfdgfg/oOHLoSQTqdDqNAAwOMnT58lNyTmAeDFy1evI85iURCUvX33/pcEiI+PJVL/AVfFvH3AyAjJAAAAAElFTkSuQmCC") !important;\n\
		-moz-image-region: auto !important;\n\
	}\n\
	#back-button[_cb_backToClose]:hover > .toolbarbutton-icon {\n\
		list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAYCAMAAAAmopZHAAAB7FBMVEUAAAAJAQH+8/P86OjqQkIkBATpNzcJAQHqOzvuY2MNAgJ3DQ3nIiLrREToMDCNEBAyBgYQAgISAgLoLi4JAQH0m5sLAgJFCAgUAwOOEBD4wsLhGRnvamoUAwMbAwPqQEDmHBz61NTgGRkbAwOCDw/sT0/lGRn73d3xfHzTGBgNAgIOAgL85OT61NTXGBjtWFj85OTxfHzOFxfuY2P84eH84+PlGRnTGBjsUlL85ub84eHTGBjYGBhcCwvpNDT84+PcGRm2FBT98fHoKyurExPyhYWtExOzFBT1oqLzkpK8FRXuZmbuYWHMFxfxfHzVGBjhGRn0l5fGFhbwdXXtWlr++Pjyh4f1oKD3srLOFxftXV3uZGT85OT729v98fH0mZn739/1pKTuY2P+9fXxfn7BFhbsUlLzjo6/FRW6FRXsUVHtW1v1p6e4FRXwc3PsVFTPFxf3trbDFhbyiIjqPz/0np7vamrgGRncGRnIFhamExP3ubnXGBjxgYGvFBSxFBS2FBTqQEDoLi7xf3/60tKkEhLFFhbpNDTsVlbuaGj72NjsTU3nJSX2qan2ra3TGBj0m5voKSn86OjeGRn++vrrSUnlGRnnJyfqPT361NTrRETnJCT97OzrS0vKFxfoKyvpNjaoExP4vb3zkJBeForuAAAARHRSTlMASKNChiDPPafmNBv5hHAZIwYsbRw5HCIePEOm9wQpjupDbxc02c4zRdUVMglTjCpEUcrwDlxu69AxZYH1HupqiOSM+bkz+jAAAAF4SURBVHheXckDjyQBEIbhb2mcbds22hzbtmdtW2frj25P53YnPU9S9VZSqNjXUlcLigPtjW1OrQCAK1e7jtmmv2gsALv37L2rT61o8cChw4+mGD/DWBnG79+ugOMnTjrL1rKXnWK91SZx9tx5yatnQ71/eyVWz0pKQ6w+gqbuRPRfVBKG3g8ljUVjUqkgRX9gV+v8yEgokDebzfnIQkRtIPQVB5sdRmPGuWQLBoO2D+pecmY+4/kLB8/zQqK06vF41CklBH4OHW/nTYrsxGTqe0VqciJrMv1CT+copSAGZyybFZaZQYKivuHmqTitoAjS5XKpQ1A0/RH7Lxg4Lj5Okz6fjxxTNz0ef4cjR8VCIcxZ3G63Jc2l1XJhGafP5ERRNITJRTI2+3M2pjRsEO24eOny2vCwbB8oDtjlnRpw7fqNnE6n6+uX+/uqjQG3bt/RffpveftIA/fuP3i48bsGDeDxk6fPAutaFBQNL1+9JrT+QH28qa+1BUwLvgHarLakAAAAAElFTkSuQmCC") !important;\n\
	}\n\
	#back-button[_cb_backToClose]:active > .toolbarbutton-icon {\n\
		list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAYCAMAAAAmopZHAAAB6VBMVEX////+8/MJAQH86OiCDw8UAwMyBgYUAwNaCgoNAgIJAQENAgIkBAQJAQFcCwtuDQ18Dg6JDw+ADg6FDw+FDw8OAgJFCAgLAgJwDQ30m5v4wsJqDAwbAwOHDw93DQ361NRuDQ2NEBB+Dg4bAwNXCgr73d3sUlJlDAyNEBCHDw/85OT61NRnDAyNEBDtWFj85OTsT09nDAwQAgISAgL84eH84+OADg5+Dg5sDAyHDw/85ub84eFnDAyOEBB1DQ384+N3DQ1RCQn98fFuDQ2oExO4FRW6FRWiEhKbERHMFxetExO2FBSrExNaCgq9FRWSEBC/FRXVGBj2ra28FRXrRETKFxf4v7/3tLT729v739/60tKfEhLYGBhgCwuvFBSkEhKQEBBeCwuEDw+ZERFOCQmJDw+pExPOFxeCDw9PCQlqDAx5Dg6gEhJ3DQ1+Dg7pMjKLEBBuDQ3GFhaxFBSOEBC0FBTXGBhVCgqXERFRCQmFDw9jCwvrSEjPFxfrRkbBFhaUERGADg7qPz/pNzdsDAzoMDCdEhJpDAx1DQ3RFxeHDw9zDQ1YCgrqOzvqQkJMCQmNEBDgGRncGRmzFBR7Dg6mExPqPT2WERHmHh58Dg7pNDRnDAxcCwvIFhbjGRlyDQ31pKTeGRn5yMgz7SLnAAAARHRSTlMAo0hCeh4jBEA0PRUgHB7w2fridvUyIhz8OUOxKZobQ3cZtBc2M0fcke4JU5WQKkRT0wYsDlx08NfbMWWJ9/Bqj+mM/BkShYgAAAGUSURBVHheXcpjkyUxFIDhM7bWtm17kzRxbdvG2Nba3l863ZkP03Wfqpy36uSApq+7uRGo9ndduDjTAAB69l4d4vLf9fLq/tbt3XsymBDzDkLUfVvnw+kqxkQglFaME9Bx5GjI94EIyI2wLMtYqxmPwukzu6ZFASP2M4uIgdBiEoXe1pyfN5czFtdkOCbHwpMuS6YsR6H91KifJ2jc4XCMh2NhWqTe7xusMKIgshan02n5QicrCqvQ/0xxI1/ZHdhQL+kLuH18CI4dUFgGiUgJLbg0CyHlE2JycPJ1ff1n0BtMRkr/NaVIMhiU0nBtYOxHan7eK/2y2Wz0Sd7U0hocfPDnY24mW+TsdjuXorOY/VaEQ4ezhUAgMWEymSbSiTRt4u0SHD+xzKDYYsX411gYRsMFtZVF/xicPXfeLxtknvnH8PLUdgn2wqXLV6JWLm41VA3WeHy7pSkJ4PqNm76ax1OrqcNDa1yx1gHu3L13n/ut9+69cQQAHj1+8vTrps7sXD4CqpbnL16O6CUjb4B+vGpqtAUlaregregFbwAAAABJRU5ErkJggg==") !important;\n\
	}';
document.insertBefore(
	document.createProcessingInstruction(
		"xml-stylesheet",
		'href="' + "data:text/css,"
			+ encodeURIComponent(style) + '" type="text/css"'
	),
	document.firstChild
);

function fixIconSize() {
	var stopTime = Date.now() + 500;
	setTimeout(function fixIconSize() { // Wait for applying of XBL binding
		var btnIcon = backBtn.ownerDocument.getAnonymousElementByAttribute(backBtn, "class", "toolbarbutton-icon");
		if(!btnIcon) {
			if(Date.now() < stopTime)
				setTimeout(fixIconSize, 10);
			return;
		}

		var backToClose = backBtn.hasAttribute("_cb_backToClose");
		if(backToClose)
			backBtn.removeAttribute("_cb_backToClose");

		var s = btnIcon.style;
		s.width = s.height = "";
		var bo = btnIcon.boxObject;
		s.setProperty("width",  bo.width  + "px", "important");
		s.setProperty("height", bo.height + "px", "important");

		if(backToClose)
			backBtn.setAttribute("_cb_backToClose", "true");
	}, 0);
}
fixIconSize();
addEventListener("aftercustomization", fixIconSize, false);