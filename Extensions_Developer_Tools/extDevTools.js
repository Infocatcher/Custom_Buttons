// http://infocatcher.ucoz.net/js/cb/extDevTools.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57296
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Developer_Tools

// Extensions Developer Tools button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2011-2019
// version 0.1.2pre12 - 2020-01-04

// Includes Attributes Inspector
//   http://infocatcher.ucoz.net/js/cb/attrsInspector.js
//   https://forum.mozilla-russia.org/viewtopic.php?id=56041
//   https://github.com/Infocatcher/Custom_Buttons/tree/master/Attributes_Inspector

// Icon: http://www.iconfinder.com/icondetails/22560/16/gear_preferences_settings_tool_tools_icon

// Screenshots:
// http://infocatcher.ucoz.net/js/cb/extDevTools-en.png
// http://infocatcher.ucoz.net/js/cb/extDevTools-ru.png

var options = {
	locales: ["ru", "en-US"],
	forceRestartOnLocaleChange: false,
	updateLocales: true,
	closeOptionsMenu: false,
	restoreErrorConsole: true, // Restore Error Console and Browser Console (if available)
	reopenWindowFlushCaches: true,
	shitchLocaleFlushCaches: true,
	changeButtonIcon: true,
	// Use icon of default menu item as button icon
	// (middle-click on menu item to mark it as default,
	// middle-click on button to execute default action)
	showMiddleClickActionTip: true, // Show "Middle-click: action not selected…" in tooltip
	prefValues: {
		// https://developer.mozilla.org/en-US/Add-ons/Installing_extensions#Disabling_install_locations
		"extensions.autoDisableScopes": 14
	},
	showDebugPrefs: 3, // Sum of flags: 1 - extensions, 2 - application
	debugPrefsTypes: -1, // -1 to show all or sum of flags: 1 - boolean, 2 - integer, 4 - string
	debugPrefsInclude: /\.(?:debug|dev(?:el(?:opment)?)?_?Mode)(?:[-.]?\w+)?$/i,
	debugPrefsExclude: /\.debugger/i,
	debugPrefsTrimExtPrefix: true, // Remove leading "extensions." from labels
	confirm: {
		reopen: false,
		reopenAfterLocaleChange: true,
		restart: false,
		restartAfterLocaleChange: true,
		exit: false
	},
	hotkeys: {
		cleanAndRestart: "control alt shift R",
		attrsInspector: "control alt I",
		openErrorConsole: "control alt J",
		openScratchpad: {
			key: "shift VK_F4",
			override: "key_scratchpad",
			has: "hasScratchpad"
		}
	}
};
var images = {
	// Fugue Icons by Yusuke Kamiyamane, http://www.iconfinder.com/icondetails/25550/16/applications_blue_icon
	reopenWindow: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAZtJREFUeNqUk79Lw1AQxy/pxUqFoLZg7SAiFqy6OOlWxFnByUFwcXBT8B8RJ3HRzdHF3f9ApEPRgoMIKo2VUK22fS8v8e6lEQc16cGXHO/H993n8p5RPqlDFIZhrNBnj1SA+HgiHSJnge/rkYA2L85my6NDaCupwBMKBKnt+fBOk68pA+pWCupphG5XFadqLiCdCmCaoKRkj0Kz0bJdxwefTD3PA6WUFueUQI40TDnN29cPzQL2SgccGKASAjheHYGksXzqABt8c1OVpZ0Ll3yCXzfkMiaszwzCQh71oVwV+kol5rYYp9qC+WyGqE1aK7RBP9xwRb0SS0VARJBsgJbVF/f2uUMVCo0pOx3A6MS/uH9GxC1EoHOhDcjN65UXF8ytuHGY1gbddhtQ9gw0b0wwd+Xe/Zzer97oi9eoVZA5JDVGhhfp32BMw/fuWmeba+HFhTeTOUIuESteJ6WSE1tH/A6eSR8mc+ibSOXFKeJOjZUgv3EQYjmVy8rk7mPi38jc/sutzq3xOaCXBBmSzU1Osp+5ufRo4EuAAQB5oyk+Ipyd+wAAAABJRU5ErkJggg==",
	// Oxygen Icons, http://www.iconfinder.com/icondetails/9469/16/breakoff_tab_icon
	moveTabsToNewWindow: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAe1BMVEUAAAD///8AAADo6OgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD7+/vx8fHv7+/w8PD19fX29vakpKT39/fz8/P09PTy8vKmpqbp6emnp6fT09Po6Oj6+vq5ubmlpaXq6uq4uLj8/PyQkJB+YnRlAAAAEnRSTlNSAD7xCSSLaWBbJ2VrbW5sZFQ8gZOKAAAAhElEQVR4XkXNxxLDMAhF0RdZbulB1SW9/v8XRqCMchYMcxcArZAovfiBqmxSqRJgXWJbsJqDY1eZAziYWRgmYcyerxhjozQwZfdTPg74y4N97C2xAMJxyHc5OAB0NrySMECNZqZiBD+aqJgk+HfhJYR/CBJoKIjDsu9W68121+67/lB/ASRHEVtnjo8SAAAAAElFTkSuQmCC",
	// Fugue Icons by Yusuke Kamiyamane, http://www.iconfinder.com/icondetails/11449/16/135_arrow_circle_double_icon
	restart: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAuZJREFUeNqkU0lPU1EUPvcNHaCUWlpsERGooIhxwQPFSNUgKpEYTRQXhpi44g+48W8YFy7cmOgC4hRjDEGjosEQpQRRKQQoFmgZSqGldHrDvZ7XohJWJr7kyx3e/b57vnPOJYwx+J9POHpnJj8RRRAEATietxFCvLh1CtGEKERMIQbxsqeU0jDP81249r67Wdot7BCsFjh2rarMfKS81FxnLRSqcc+aSKp1C6uZlpn55BXK2KCmqu2/CdwfKmNug8C8HcedrspSs9VAiFGRKegQCSnY5zCVn29ynFaR3HnGLeGYj5xqGmDIBgJa3blGl3U9mgGNAzoRjIfmllIR3UKFq9DWULvLE19X4LLXJW3Esygs5wU0RdHHkkqX1RJdSQLlCXnzOTyOoh84QXil4sFAMHs3EFxrvtpWKS0vxMFiNYKazeYF5PzEYi8QDHJWod/nY4uo3k8IjKiplB5dF6L5eketlIhlQDTorhnIvwX0G9C/YjbyEVXVVoNz0YRGtZG8NQ5EUfTqpX7wZMy3PdsomlsL6WRSX9x+/vqHtLPGlKk+JHdj2SB3ESFSq/dAkYil6ns7HvwbAYDUfrFJSmXymS0pNsKzx0M+FP6Idc+RRYOhYXeZ/Ww0QxNUTi8r2Ww4J6BseVnMAKwmGFQ4TND7aEAPbwjJDzW0gg12AfNy0uHZa46CkEyFF2XkbW5PIsR5A9icJhiLKVBzqVVa+TJmi8yGhvFXsniPQ3bW16TDnCngLhLAPzW/qSlqdLsFMFpM8Olej6/yRqc0LzPgpUaP+5jeybCRUVkoRFnAVciBr+flhpJM+7Hlc0TCOQ8C33JreCtvfcRoPOE4XLtf9FTZid1eoAuw6FpAnp7xx/zTY8rCt146+SJAVyZAr45AIxPlsOwfh2x8lPruD3Clh94v/WxrgZKaeuBE/S1sgpr5Cqv+UTbdP8nWZ02450SsITSiPxaEqNtB8P/wgvXWTSHSGAH9JcAAMrRspwHKXNQAAAAASUVORK5CYII=",
	// Tango icons, http://www.iconfinder.com/icondetails/15273/16/
	//cleanAndRestart: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABqlBMVEX///9Vu1V8SwB4SABHrUd4SAB4SAB7SgB7SgB7SgCKaQB7SgBHrUd7SgB5SQCGUgOEUgGahQBVu1UfhR94SAB7SgCATgG+rjJWlCERdxERdxGHZACciABecBNUWAigjwF+nyOciwCejQGciwCejQC7pSkzmDKciwChJACtQhNkkR2djACcfwDAsC+fjQGciwCllBEzmTPGtjOfjgCgjgGfjgSciwCciwCrmxrWyFagjwWciwCfjgDFtTbFtDKejQCciwCciwCejQDSw0/GtTChkAifjQCciwCciwCdjACejQCejQCciwCI7ogfhR9Vu1VHrUfawgMzmTMRdxHBfRCydgupawrr3ne8eg/NvUH77Yv85Tz75Df23i/u1yPlzRTbwwT974rm1laycgz96l/962Hdz17t2kbn0BjjyxHcxAfk00zczVjYyE/s3GjIbTOrGw3o2mzcxRDcxhXn11vXsWLB0Gdv1G/96VLByjHn2F/fyibl1E7n2W27Sii4OB322GHK1VahiAF7oxTh01vcxhDk0kn76oT97Gv974TF0lmmaQqrbQvi1GcsT/8kAAAATXRSTlMAgNpEgEc77fXaAuNw5W/08s5AQAKV9P7BgECB/vvy0pla9l/r9oEH1/z56l/16Rr3QPuo1PQcQ/b+8T/F+vvmJhPi/fr2qRQf7eyeIXNWOwoAAADfSURBVHhePcyDcsRgAIDBL6Vt27Zt/EhyV9u2bfede5PpdB9g8fMK9sVhqCiA0K/vAG/w0VoLHQL4L7lGA4MSLCHEmbAqISx83BURKYWUUsloICY2zv0Yb9uQaCdhGEByysRYalp6hjJAKcjM2tnd2z851cJ5ITsn9/bu/sHynEJYeUB+QeHb+8en55SyqBigpHRheeX8wn56ef0pAyivmJyanpmdmzcXq6oBqFldW9/YNM2t7do6AOobDg5N8+i4sakZBy2tl1fXN23tHfzp7Op+7unt6+ffwODQ8AgAvxF5NOfaFCP2AAAAAElFTkSuQmCC",
	cleanAndRestart: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AoDDQYmfaJwkwAAAyxJREFUOMulk21oU2cUx//PTXLTNPFqF61pV1zaElmXbYq3hVYNCrqtVdSNrbKXWsVBM6afFDaYKCgYWAXHpMIUFd+G22jrRBGRKXauo2yNG1XnWBO1Tfpia2PitVmel3sfP9iq69edjwfOD87/dw7wP4tMbSw5PDyDEBICsARAFQA3gF4AnVLK9o6PfYNLj9xrABC6snF2+D+A0MGBMtWhrC0tzn+9pNBVobntZQA0Y1xkk/dzqXhiPMaF1QmgFgCuNr1YqUwO1+y/W6TaZWhlzSyfv9ClqYQ4ObPAmQUHIfkvzcwreatq5lIhRG39siJdCAEAsANA5Vf/qARmxZuVPu3BWA6mAuvvvsxA/3B2FIB7js89Y8HcgvLMA463Qz79YYaCM/YMIBjz+n2aZ2xkHJaNkJ9+G/yLEPLzH58FzwOA+PJGy+2+VPV7y/36vWQGHs0JQekzAKPU80K+XWWUWzcS6SHO2MWb2xdcA4CKnd0NjNLqD1fO1Y10Dg5VASDBngcISrnLaRsVwrzf1z9m9EYWXZvMxmQsJKXEsbaeaKDvlvvl29en9ZS+aojSYPSpxjlbLh0ghOhTlUopo/17l4UB4KwSqB7wFq9vOrnnk+Obdx3tt9RzO+LtbXYA4JTqtauq9GzuSbLe6U6cbu2KEkKuAsAZJVCTKJi9vunI7vDYyAgaW3ZsOFC/iZ5SykeVCQCGckDckOBOJ374tiPKKe0abKk7GYlE5v34+acfbEhcDI8OD0MKgVh3N1bv2hzmkGsIAGjrvusOrq3T3Q4Fd9Mcs9w2jPzeE7cN9NIi1XCca94YoBOhDX59HB6PB5e/aN5PpNk+qRFOTx5+/eb7qL+xXk8wCZteWe4vNtH2/nwYhgEASCaT0D5agbPz3jmaJ83TYevO5ScrMIbOfSeinLELsROtV6yb15PIGtlxISClBGMMsVgMqqpixbsN22zi31Nh686lSQslysKtEdDMn1b0UIdS+EoBypYvhjcQzBepoIcO2dsjjQFFUfBG3arm3KN0F+f8FwApACYBoAFwTNyEbYpJr8vlek1KWcI5h2ma8YnPTAFIA8g9Bl0WdNxWEAyoAAAAAElFTkSuQmCC",
	// Tango icons http://www.iconfinder.com/icondetails/15273/16/ + Diagona Icons http://www.iconfinder.com/icondetails/14146/10/arrows_refresh_reload_icon
	flushCaches: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKXSURBVDiNlZJLaJRnFIaf75uZ6EwSm9tIQpNIvNWoFCsmiwrSgotKS3aCl4WL0Y2CIvwLBV0YFwYckFIQhI7GhWBLdaEL6Y0WMS20aTQxijGNmnFGSZPJZcw/80/+//uOK0VjIfisz/twzstRR75gczjEBRGixrL31A35kfdAhzTfr22OrdqworwxpLl6dJva+l4CYHFFVLO0KsLHLbFYSHP29H6lU0nVmUqq2gUFVugcfFJ0fSPU15QRXazqqxrpBY4DSxcUiPCN65mLtwbz7kzJp6mdypWtGzfE400vgLqFBEpEAOjap07EV3L8k7bPVXNLOz2nu73pf8Zy7FSTxsglEc4nHBn/X0EqqXZprb79dHNHtK6ugX+//punVx+y/ux2atdVkR7t9+7f/UOM9b4zRo4lHMnOF+zRmmRTfWs5lyRqJl22dG9lUY0GFYVQNX5Qzr3BX/2B/t8N4v9gDCng5usTUkm1KHKOOxXNtas6Lh8Oaf0cQg1gxsBksUEez7bgzdWQyQzI45EBd2oyW9SvVkk4UvJ301V7sLGkI2VgZyEYAZMF8x9e4RmzuevMjJ0jXo3a1P5VhVZKwm81UsHP2UxaW6tQ/ggiPv6ch1eapViYoVCYRkTQ4UrST3oDlPym38wnHHnmz02PpNN3mXFjTEyMksulmcxlcN0pRIRY9TYKRc3Qg/6SMThvCQACI4f6en8p+qzGdT2KxTzWBuhwDZXxHeTdmNy6eSVvTPBlwpHM6xLfpPuM6ln9UXvb8hWtES//J2WxNejIMh4N9wRDQ33j1vJZwpGHAOF30oAxdAw9+Ot25ZKGDz+oatOjo/f84eGfAmu869ZyIOHIxDufOJ9UUi1Tij6lEOCatZxMOPJ4/txLfgdDCCiEEtoAAAAASUVORK5CYII=",
	// Flags by Mark James
	// http://www.iconfinder.com/icondetails/4778/16/america_american_flag_united_states_of_america_us_icon
	// http://www.iconfinder.com/icondetails/4737/16/ru_russia_icon
	switchLocale: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sHDAoNI1aFrw0AAAH0SURBVDjL3ZK/S9VhFMY/7/dejcrJIBKhC2ltjUVLVINZDU0t/VwMXFpcukFQQ7chaGgKiQYLIsegDIQSCReVhiiLDLmgKKm3uqnde7/vOe97Gr5K2D8Q9MCHc3jgOcPhgX8t19M7ZpucGCEq4AEDPA8Kr7DaLyrLXzO3Yz/JyQuEpBl6escsxmCPR9XEvD0aURMRe/haLU0b1j+s5n1qaZpao1G3ev0P5fKyuZ7eMTty9hBP30RChBDBqxEs2xtqvOU6fK8SDx4gXLqIOYdzjoWFFfIgWIRnReP4bcfLotBVyjN0tcbR0lamHNRu3GR8PGFiIofeNVSN1lbo64vkiTkAum85YjS6SnlUyMKk6Nok90/XGKx2IWJ4b4gYhUL2soRY49xhI0TjRbGBCgwVV/gQv/HlygodH/cyWO3Cr4c3UAWIJGAMjDpU4VhpC16NXaUatvaJ7vM5Wn7uzELp5gMiBkTc7OyMtbXtRkSIMWJmyI9V5q/1U58qE0WIXoiiRK8EEaIGtu9p5/m7J+TbB+7hTpwhGRrBFhexSoWmuTk663VMBPM+mxu7CmjAhU52JA43Pf3eCoV9rDY10VKegTt3YWkREwERTDULq2aEAOtUpj/j5i+fsmDglqpsG54EL1kh/0LzOTRxRCCsl1ab8/wH+g3SxWVrARSXnQAAAABJRU5ErkJggg==",
	// http://www.iconfinder.com/icondetails/29415/16/exit_system_xfce_icon
	saveSessionAndExit: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH1goUDSQ2q/JqlwAAAlZJREFUOMulkz9PU2EUxn/vvbe3rf2DpVyQ2MZYtKKRhNEPgH9CgokLAT8ADsYQHcQPwOCgMW4kDjIpCQtKXJRRBBaDkUGCbQcFsSmkFNpLafseBwgKNTj4Jmd5z5PfOU9yHiUi/M+zDn8opcxoNHo5mUzGRATDMFBKobVGa02tphGB1dUfm8vL398gInXV29v/rFoVyeU2ZG2tIOvrBcnl8pLN5mVlJSeFwo4MDz+cBYJ/20B1d19nZuYjIyNP8Pv9WNaubGzsJSLCxMQ7XHenClh1ABGRrp4btZoIbW0J+vr78Nk+AEZHn6PUvg4A4zDAVMqTyOWilVIJfzCIE20i6uxWPB7HcZyjAQInBzJLV9WLURDB8HjYG0ok0khjY/RowCnweR0n0L5TpCuVolLTVLTmw/R75uZmCQSOHdAbAK+93sl0PD7/LRabH4/FXgVMU/l8fuKZDMXHj9BKUdjaYuDWwL4FrfXvO/A0NFyK9PQ0VbTmnGFQ3diglkrhsW2CU1PUDJNrQ/dJpzJYpnXAggVgFIvl6vQ02nUpuy6qXMasVGB7G7taZTlynDjQfr6dUnGzHlB2XdlaWEBrjQ2E9xo28Lmjg+ztO7ipr7Q4DpFIZM/CH4CbIg9MkQRQboATn2AwAMZiZyeZoSHakmextebMhYuk02kAwuGQB9BKRFBKmYAJEIQrBcuafCuyc6+1dcZobl4Keb21UCisbNvezufzXqWM09nsz+XFxS9P63LgVSpxNxwebzXNQSB6uA8ooAVoBfzqcJyVUjYQAkoi4v4rzr8AOtoq54WTN98AAAAASUVORK5CYII=",
	// https://addons.mozilla.org/firefox/addon/console%C2%B2/
	errorConsole: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAz1JREFUeNpMU11oVEcYPTP33uy9m5sN5gdLtYkvgjQgaEKVPBgoxR9okCoV7Yu1T30vFEqlFYUgYi1U+lRqiZZKIxFjobUtJoYm0RcRi1KtQRKzu7nJ7ia7m937s/fOTL+7WyUD8zDDnHO+75z5mFIK61d8ruRXWhUUB1j9jjEGKQQ0ziu1hBG2pVKv3uvrwaHn4t7Zc4dEduG8aScTxAb1P0HkVpF/Mvv45/TiRx//9GN6YNeuBvnLCkQY4s7nJ4805dLf9/Vus/WgQpcCiOJdAzcM5Moefrv2x4Ph3Oqhz26Oze0bGGgQhJ6HyS9PHU0sL/zQ+1aPyZbTkKSoogiu69V5LBXB7OhEVTfxy8jv94czy4dPT9yeZwRm00NDB9ncsyt9u3ts5DJ1MJPkRdUD238E2mubEVy+iJZSHlrnRlSaLNwavf1gxI8Oc7/qpkT6xTd9O7fazFmArFLpUkL5PqpGEvaevTDf6EawViEvNARODpbr4uB7b+9oK5dPcikVt5qThrFWgCgXqd+IdghVC4BmGyyRwNLYCMzCIiSZLCtVuE+fo8kPoCetFKWgKKJIyoDMDGsA16DCiMhK4O2bEORzCG6Noq1SRkh3IqREPIGovTUOXTayjpOIVclMuVKAzDkQTpYUbJTu3kGzMx+7DUnFSTJUyFi28Uf0OERFYLm6ArnkNPjIwBigiEhmXsCmN5GsW1NPREhW14z/h67oFJaKCd5CPVPfisd/S8HnBtzZJ7Cob6YlCMga6oIq4QRMaLFIEzd07hed/MOCbkNv7wAjklqRzHz/BLaM3UXUtRVh1afeY38VIsXQ2tMNxw9R8WuPdE/j7rXF5ePFbObGu/v6epMigj/vwZuZxvN//oUxOwulmQhDBRIncBcKzMCViYeXfi2uXmDkP8anpjA0OLjleOeG6wfe2bnDdDJYezaHKBDQLRsCHJJxpN7sJrCOyxN/f/ets/gpOtqLr2ZhfGYGZ/bu7/7w9Y7RwT3bey1qRZCZikqOzdNNHUteDcN/Pbr0VTb7SWhZpanJScXWj/P49DQuHPuga6PnfaF03vJylBtTB+o5ePpnufy1tXnT6sjVq+jv78d/AgwAz5rMGbA9L4wAAAAASUVORK5CYII=",
	// chrome://global/skin/icons/warning-16.png
	browserConsole: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAq5JREFUeNqMk19IU1Ecx3/37t5uXmRuKyndalMpFcl0NHFE0UMOVGIP0hqh5FPTiVRKTCeIPQh7EHwIcWSLkBFBPQYFUY+9SS4RQdLNP0Q6y+sftqn33tPv3FBIV3TYh/Pbub/f93zPj3MYQghkGwzDmHEqR3aRGcxLZsvjRkdHjyz6/f4iu91+c2hoqEWSpFRHR0cUBSPd3d2pIwImkymbcPnIyIhPPL5anKfXQ39//4/29vYJnuc/HU5kDy94vd7Kzs7ORqv1dPHmah+k10Pgcrnqq6urr4ZCIcsRB/F44uBPb29PDt29q6vrdmL+GVReYCCzvQKzyx9gcHCwuaGhYcJoNC7/y0FFJBJp4bktQ17ua2j0COC9K8Ax+QmUlFgrPB6PKxAIlGUVwN3zzWazs6mp6Xp8LgRnLTxkMgBb2wDnbTJ8W3wF6KyFOozH47APi5aAQj+MjT1tln5OCrbCL0BkBtLptAZR98DIvgBBkE+hA3c4HL70h4O2Nl9RXV3dNYfDXjM/EwS9yIGSzhwIZNaTcFKQYPXrY2htbfUWFBQ4UUTUBBRF1XYfGHh0ZynxFsqsEuxIK7CzsY7WNzXIHmgU8h9hLTktBIPBeqypEkURGAwqfb42X0/gvj/x+QaUntnEJaL9FhZ1mk1LvgJ4ClDxTs4mrWBzRgEb2huLxaJU4NbkZCy8thQ1lOrH8Q4TvMYAG1sqeB/magJvhlOaANnDvqQIfDf2wfaubdrtdj9gHY4al14vGHI2xkHJEFCx8wqi7tD3wGrQmBZTER5NK3PDUHXxQgX24gqHb4lRsQ2W2pfAsizodBQdiBi/f4eFNAHPo2LSbwick3EmWu909AiXa2ud90ymEwae54DjKDptpoK0SFEUjf1YlmVYwDE1NfWc+dtz/t/xS4ABAFPwJo86gIiiAAAAAElFTkSuQmCC",
	// nuove by Alexander Moore, http://www.iconsearch.ru/detailed/278/1/
	attrsInspector: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACW0lEQVQ4jW2TQUsbQRiG3/l2ui4hPaSbCBZPsR6kMXrwYP9AK+JJKOJZKPgD1KMXf0ELPffsoRDpxUv2aLUHKamHikJxi1gQktXNzrqbna+HJJPE9oNhGJh55n3f+UYwM7a2tuzNzc13RETMTADAzOjN/bVGr7Isw+rq6vuzszMtAWB8fDxXKBQ+EBHSNIXWGpZlGYgQAkIIEBGEENBaw3XdjwASCQCO41Cr1YLv+8jlchBCIAxDFItFlEolc5CZDaxarUoDsG3nme//xuLiK3NDlmmcn/9EEAQoFAp4XBMTExIACAB8/2ppbm4OzAytu1YtizA19QI3Nzf/HBZCoFgsSgCQXdrz6bSjIZIEJGhkY5p2Rtb9yufztlHQaDR81hpRO0a7raDUA1T8gLCtcHd3Z3wPB+o4DhnA/X3wpV73kKYdPCQJokihHUb40WjAdV0T4jDEtu2BhbW1tbhUKuHgoIby1DSeSImLi3Ocnn7DwsICZmcrBtCHSCkHCpgZlUoF6+tv8TRvQ4gUKytL2N7eRr1eR61WGwH0eoKMAgDUk4X5+Xkws2mi3d1d7O3twXEcLC8v97pTQAgxUNAHDHskIhARJicnsbOzA8/z4HketGZkWpvnpu6bW3I4qMejXC5jY2MDx8fHODr6CtYZkiQZAIiIhrz9FzIz8xKv3yzh6uoXpLRwcnISoh/g4eFhNY5jVkqxUoqjKBoZYdjmZjPgZrPFSim+vLz87rquw8zdEJVSrevr60+9L6uZWQshNDNrZuhMs+50Eu2MjSVBEPzZ39//fHt7GwPAX9zKMQVPs/QoAAAAAElFTkSuQmCC",
	browserToolbox: "chrome://devtools/skin/images/command-pick.svg",
	// FatCow icons, http://www.iconfinder.com/icondetails/36398/16/code_script_icon
	scratchpad: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAArBJREFUeNqMU11IFFEU/vbO7Iyuums/GvmXhISBiOWWGFgGiyaC0UMkWRT11FNPQbEl9iNb0mtgUEQW+xjUQ5RrlClZ5IbaQ0bpw+paSGLGbrs7O3emc2d/kKjowBnm3HvnO9/5vju2Tb4ARJiUOjcQ1fhizUZnkVORsBzXMT7/HZLNZp0RT8ZssEuUjEGVWZWMdJimibhuXO4/UFvUWVeKf0Xg0yJcOXa03359i2UWDQKIackTmY91qkXyVWmmz/qezyBBbCvX5TXLGfpUo7mquETUEY1bgKtD0JeIvsMu4cXsNxz2R6DIDHJGAOqQX6CmyjjnEN/bfqPuYJIFrPLY5Ly346RYyzLQE/Hq7SUu66CWNFJd0+KZaTYFioxgeAV2mKH1vYPBfFVCWgOa0eB76stcpHwSmmFAQMiktkjxLpJUR2glBtlIzArsn9QoxYAaGJxXr8lVECHruGHSrEDxhccWfLinLcXozEM4cmTkJmITWVuzNkpKQ32pC1GuW1039DzB6OlWSCQaSUoacTCJYfiUB2ZRxR3RRAzGLAeIQmFeTrkAUumCVF4ZxMCR3bg0HLaU13UDMaJr0GjnhkLoP9gIjXNT1CxJUHT7zKhuFO68MYKqa8/g62jEgw/LePP5I3ZVroV/cgGin9m3HyPT0/BPLcHbskOMasoJQl+52Ja1ip19hIWoBofKLG2ut29Fp/8duraVIvwjBiGe2AtHEpYIjGnRt30vZxCizTnKJRLs7qsp5NOdONRQi703x9Dt2QInWbj56hC6GutQoNpxb+w9vpzf57Y5Pcc9SlNngEaxRJFpZoVEFN4fbarDwMhkyiXaFYofo7X7oxP42t3mrvAFgsIJlbLmTz9NWe/TcRvxnPO2uEVd3js4LrSY97a66S8O4j+iPp1/q/FLgAEAGto2bg8Nx1UAAAAASUVORK5CYII=",
	// Fugue Icons by Yusuke Kamiyamane, https://www.iconfinder.com/icons/84569/eyedropper_icon
	eyedropper: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAeRJREFUeNpi/P//PwMlgIWRkRHOsQKyi4C0JZKCv1AMAkCr7H4yMBR/ZWBg/czA0PP7//99LLg0ogOYZtX+fr9PT58yHOnu5v7NwLCPZQ1QsyUBZyJrfrp/P8MfdnaGDwwMbH9AXsCj2QaI84Ga9wI1eyJrPrpq1YlvDAwN/0AG3MIRiEDRCY4rVhjfjYxkwaF5JzgQn7i6gjUwMTExIAfov3//JuyIiChwnTw54OmePVg1gw145uICYbCwMDAzM8M0q3z48IHrR1zP+m8xegz6ISHG+1atOg2Mjc3/kTSDLUZ3OlSzU25xVaGhgoDFySWX1h9fs+ZsaFiYKdDmoP8Q78ExCy7Ney6/uiPEw/Zye2f06xcCAhO+r1pVAFRSg6z+NrIBf/78Uf706ZNjQVktXHNRtPNJoNj+v3//3gHatgRZ4zYgvgUy4Pz582D/s7Oz23b0TS2Cac4Ktj7y9evXw8DAvYtNIwwwCwsLM3z58kWJk19Um0XaWAikOd7D4ABQ7AjQVfeALmA4/+0bwxag4hNA/BY90Dg5ORmkpaVjX3/8cd3S3jWXh4cnloODQxHkKmIAKOLlgM43B+ZKPqBf7wLxO1CQoOHfaPQfWD4DGcAPxFxQw0Ax8w8P/ovEBqsFCDAAxpr/WSMLDJQAAAAASUVORK5CYII="
};

function _localize(s, key) {
	var strings = {
		"Reopen window": {
			ru: "Переоткрыть окно"
		},
		reopenWindowKey: {
			ru: "о"
		},
		"Move tabs to new window": {
			ru: "Перенести вкладки в новое окно"
		},
		moveTabsToNewWindowKey: {
			ru: "в"
		},
		"Restart": {
			ru: "Перезапустить"
		},
		restartKey: {
			ru: "П"
		},
		"Clean and restart": {
			ru: "Сбросить кэш и перезапустить"
		},
		cleanAndRestartKey: {
			ru: "С"
		},
		"Flush caches": {
			ru: "Сбросить кэш"
		},
		flushCachesKey: {
			ru: "б"
		},
		"Switch locale to “%S”": {
			ru: "Переключить локаль на «%S»"
		},
		switchLocaleKey: {
			ru: "л"
		},
		"Current locale: %S": {
			ru: "Текущая локаль: %S"
		},
		"Switch locale to:": {
			ru: "Переключить локаль на:"
		},
		"Install %S locale?": {
			ru: "Установить локаль %S?"
		},
		"Update %S locale?": {
			ru: "Обновить локаль %S?"
		},
		"Can't install %L locale: %R!\nURL: %U": {
			ru: "Не удалось установить локаль %L: %R!\nСсылка: %U"
		},
		"download failed": {
			ru: "ошибка загрузки"
		},
		"install failed": {
			ru: "ошибка установки"
		},
		"Download language pack…": {
			ru: "Загрузка языкового пакета…"
		},
		"Download language pack: %S%": {
			ru: "Загрузка языкового пакета: %S%"
		},
		"Download language pack: done!": {
			ru: "Загрузка языкового пакета: готово!"
		},
		"Save session and exit": {
			ru: "Сохранить сессию и выйти"
		},
		saveSessionAndExitKey: {
			ru: "ы"
		},
		"Error console": {
			ru: "Консоль ошибок"
		},
		errorConsoleKey: {
			ru: "К"
		},
		"Error Console not found!" : {
			ru: "Консоль ошибок не обнаружена!"
		},
		"Browser console": {
			ru: "Консоль браузера"
		},
		browserConsoleKey: {
			ru: "у"
		},
		"Attributes Inspector": {
			ru: "Инспектор атрибутов"
		},
		attrsInspectorKey: {
			ru: "И"
		},
		"Browser Toolbox": {
			ru: "Инструменты браузера"
		},
		browserToolboxKey: {
			ru: "з"
		},
		"Scratchpad": {
			ru: "Простой редактор JavaScript"
		},
		scratchpadKey: {
			ru: "р"
		},
		"Grab a color from the page": {
			ru: "Захватить цвет со страницы"
		},
		eyedropperKey: {
			ru: "ц"
		},

		"Reopen window?": {
			ru: "Переоткрыть окно?"
		},
		"Restart application?": {
			ru: "Перезапустить приложение?"
		},
		"Are you sure you want to exit?": {
			ru: "Вы уверены, что вы хотите выйти?"
		},

		"Options": {
			ru: "Настройки"
		},
		optionsKey: {
			ru: "Н"
		},
		"Show errors in chrome files": {
			ru: "Показывать ошибки в chrome-файлах"
		},
		"Show strict warnings": {
			ru: "Показывать строгие предупреждения"
		},
		"Show strict warnings in debug builds": {
			ru: "Показывать строгие предупреждения в тестовых сборках"
		},
		"Show stack for async calls": {
			ru: "Показывать стек асинхронных вызовов"
		},
		"Show all exceptions": {
			ru: "Показывать все исключения"
		},
		"Show information about extensions update": {
			ru: "Показывать информацию об обновлении расширений"
		},
		"Enable window.dump()": {
			ru: "Включить window.dump()"
		},
		"Disable XUL cache": {
			ru: "Отключить кэш XUL"
		},
		"Allow XUL and XBL for file://": {
			ru: "Разрешить XUL и XBL для file://"
		},
		"Don't inherit privileged context for data:": {
			ru: "Не наследовать привилегированный контекст для data:"
		},
		"Block top level data: URI navigations": {
			ru: "Блокировать переходы верхнего уровня на data: URI"
		},
		"Enable developer tools for chrome": {
			ru: "Включить инструменты разработчика для chrome"
		},
		"Enable remove debugger (and Browser Toolbox)": {
			ru: "Включить удаленную отладку (и инструменты браузера)"
		},
		"Silently install extensions from browser profile": {
			ru: "Молча устанавливать расширения из профиля браузера"
		},
		"Enable E4X for chrome": {
			ru: "Включить E4X для chrome"
		},
		"Enable E4X for content": {
			ru: "Включить E4X для content"
		},
		"Enable multi-process mode": {
			ru: "Включить мультипроцессный режим"
		},

		"Debug extensions": {
			ru: "Отладка расширений"
		},
		debugExtKey: {
			ru: "р"
		},
		"Debug application": {
			ru: "Отладка приложения"
		},
		debugAppKey: {
			ru: "п"
		},
		"Change “%S” preference:": {
			ru: "Изменить настройку «%S»:"
		},
		"Reset to default value (%S)": {
			ru: "Сбросить на значение по умолчанию (%S)"
		},

		"Middle-click: action not selected, middle-click on some item to set/unset": {
			ru: "Клик средней кнопкой мыши: действие не выбрано, кликните средней кнопкой по какому-нибудь пункту для установки/снятия"
		},
		"Middle-click: %S": {
			ru: "Клик средней кнопкой мыши: %S"
		}
	};
	var locale = (function() {
		if("Services" in window && "locale" in Services) {
			var locales = Services.locale.requestedLocales // Firefox 64+
				|| Services.locale.getRequestedLocales && Services.locale.getRequestedLocales();
			if(locales)
				return locales[0];
		}
		var prefs = Services.prefs;
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
	_localize = !locale || locale == "en"
		? function(s) {
			return s;
		}
		: function(s, key) {
			if(!key)
				key = s;
			return strings[key] && strings[key][locale] || s;
		};
	return _localize.apply(this, arguments);
}

var XULNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

this.onmouseover = function(e) {
	if(e.target != this)
		return;
	Array.prototype.some.call(
		this.parentNode.getElementsByTagName("*"),
		function(node) {
			if(
				node != this
				&& node.namespaceURI == XULNS
				// See https://github.com/Infocatcher/Custom_Buttons/issues/28
				//&& node.boxObject
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
	if(this.commands.updateTipOnMouseover)
		this.commands.setDefaultActionTip();
};
this.onclick = function(e) {
	if(e.target != this || this.disabled)
		return;
	if(e.button == 1 || e.button == 0 && this.commands.hasModifier(e)) {
		var mi = this.commands.defaultActionItem;
		mi && mi.doCommand();
	}
};
this.onmousedown = function(e) {
	if(e.target == this && e.button == 0 && this.commands.hasModifier(e))
		e.preventDefault();
};

var Services = window.Services || {
	get prefs() {
		delete this.prefs;
		return this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.QueryInterface(Components.interfaces.nsIPrefBranch2 || Components.interfaces.nsIPrefBranch);
	},
	get appinfo() {
		delete this.appinfo;
		return this.appinfo = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo);
	},
	get prompt() {
		delete this.prompt;
		return this.prompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
	},
	get wm() {
		delete this.wm;
		return this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
	},
	get obs() {
		delete this.obs;
		return this.obs = Components.classes["@mozilla.org/observer-service;1"]
			.getService(Components.interfaces.nsIObserverService);
	}
};

const btnNum = this.id.match(/\d*$/)[0];
const prefNS = "extensions.custombuttons.button" + btnNum + ".";

var cmds = this.commands = {
	prefs: {
		defaultAction: prefNS + "defaultAction",
		restoreErrorConsole: prefNS + "restoreErrorConsole",
		restoreBrowserConsole: prefNS + "restoreBrowserConsole"
	},
	options: options,
	button: this,
	onlyPopup: this.localName == "popupset",
	popup: null,

	get ss() {
		delete this.ss;
		if(!("nsISessionStore" in Components.interfaces)) // Thunderbird
			return this.ss = window.SessionStore || null; // Firefox 61+ https://bugzilla.mozilla.org/show_bug.cgi?id=1450559
		return this.ss = (
			Components.classes["@mozilla.org/browser/sessionstore;1"]
			|| Components.classes["@mozilla.org/suite/sessionstore;1"]
		).getService(Components.interfaces.nsISessionStore);
	},
	get app() {
		delete this.app;
		return this.app = Services.appinfo.name;
	},
	get platformVersion() {
		delete this.platformVersion;
		return this.platformVersion = parseFloat(Services.appinfo.platformVersion);
	},

	get defaultAction() {
		return this.getPref(this.prefs.defaultAction);
	},
	set defaultAction(val) {
		if(!val)
			this.resetPref(this.prefs.defaultAction);
		else
			this.setPref(this.prefs.defaultAction, val);
	},
	get defaultActionItem() {
		var da = this.defaultAction;
		return da && (
			this.$(da)
			|| this.$(this.cmdToId(da)) // Legacy prefs?
		);
	},
	cmdToId: function(cmd) {
		return cmd.replace(/^open([A-Z])/, function(s, c) {
			return c.toLowerCase();
		});
	},
	initMenu: function(menu) {
		if(!menu)
			menu = this.popup;
		var defaultAction = this.defaultAction;
		Array.prototype.forEach.call(
			menu.getElementsByAttribute("cb_show", "*"),
			function(mi) {
				mi.setAttribute("hidden", !this[mi.getAttribute("cb_show")]);
			},
			this
		);
		Array.prototype.forEach.call(
			menu.getElementsByAttribute("cb_id", "*"),
			function(mi) {
				var cbId = mi.getAttribute("cb_id");
				mi.setAttribute("default", cbId == defaultAction);
				if(cbId == "switchLocale")
					this.initSwitchLocaleItem(mi);
				else if(cbId == "scratchpad")
					this.setPartiallyAvailable(mi, !this.getPref("devtools.chrome.enabled"));
				else if(cbId == "browserToolbox")
					this.setPartiallyAvailable(mi, !this.getPref("devtools.debugger.remote-enabled"));
				else if(cbId == "attrsInspector") {
					var hasDOMi = "@mozilla.org/commandlinehandler/general-startup;1?type=inspector" in Components.classes;
					this.setPartiallyAvailable(mi, !hasDOMi);
					this.setAttrsInspectorActive(mi);
				}
			},
			this
		);
	},
	initSwitchLocaleItem: function(mi) {
		mi.setAttribute(
			"label",
			_localize("Switch locale to “%S”")
				.replace("%S", this.nextLocale)
		);
		mi.setAttribute(
			"tooltiptext",
			_localize("Current locale: %S")
				.replace("%S", this.currentLocale || "???")
		);
	},
	setPartiallyAvailable: function(mi, partially) {
		mi.style.color = partially ? "grayText" : "";
	},
	setCloseMenu: function(e) {
		var mi = e.target;
		if(
			e.button == 0
			&& mi.hasAttribute("cb_id")
		)
			mi.setAttribute("closemenu", this.hasModifier(e) ? "none" : "auto");
	},
	setDefaultActionIcon: function() {
		if(!this.options.changeButtonIcon)
			return;
		var btn = this.button;
		var icon = btn.icon
			|| btn.ownerDocument.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-icon");
		icon.src = images[this.defaultAction] || btn.image;
	},
	setDefaultAction: function(e) {
		if(this.onlyPopup)
			return;
		if(!(e.button == 1 || e.button == 0 && this.hasModifier(e)))
			return;
		var mi = e.target;
		var action = mi.getAttribute("cb_id");
		if(!action || mi.localName != "menuitem")
			return;
		this.defaultAction = this.defaultAction == action ? "" : action;
		this.initMenu();
		this.setDefaultActionIcon();
		this.setDefaultActionTip();
		this.savePrefFile(true);
	},
	updateTipOnMouseover: false,
	setDefaultActionTip: function(delay) {
		this.delayed(function() {
			var mi = this.defaultActionItem;
			var upd = this.updateTipOnMouseover = mi && mi.getAttribute("cb_id") == "switchLocale";
			upd && this.initSwitchLocaleItem(mi);
			var btn = this.button;
			btn.tooltipText = btn.tooltipText.replace(/ \n.*$/, "") + (
				mi
					? " \n" + _localize("Middle-click: %S").replace("%S", mi.getAttribute("label"))
					: this.options.showMiddleClickActionTip
						? " \n" + _localize("Middle-click: action not selected, middle-click on some item to set/unset")
						: ""
			);
		}, this, delay || 0);
	},

	get canReopenWindow() {
		var ss = this.ss;
		delete this.canReopenWindow;
		return this.canReopenWindow = ss && "getWindowState" in ss && "setWindowState" in ss
			&& "gBrowser" in window && "addTab" in gBrowser;
	},
	reopenWindow: function() {
		return this.confirm("reopen", "_reopenWindow", arguments);
	},
	_reopenWindow: function(flushCaches) {
		this.button.disabled = true;

		var ss = this.ss;
		var state = ss.getWindowState(window);
		var sbId = "SidebarUI" in window && SidebarUI.isOpen && SidebarUI.lastOpenedId;

		var win = this.openBrowserWindow();
		win.addEventListener("load", function restoreSession(e) {
			win.removeEventListener(e.type, restoreSession, false);
			win.focus();
			var tryCount = 10;
			(function restore() {
				try { // May fail in SeaMonkey
					ss.setWindowState(win, state, true);
					if(sbId && !win.SidebarUI.isOpen)
						win.SidebarUI.show(sbId);
				}
				catch(e) {
					Components.utils.reportError(e);
					if(!--tryCount)
						return;
					LOG("nsISessionStore.setWindowState() failed, will try again…");
					win.setTimeout(restore, 50);
				}
			})();
			if(!window.closed)
				window.close();
		}, false);

		// Try remove closed window from undo history
		var canForget = "forgetClosedWindow" in ss;
		var forgetFlag = "_cb_extDevTools_forget";
		canForget && ss[
			"setWindowValue" in ss
				? "setWindowValue"
				: "setCustomWindowValue" // Firefox 64+
		](window, forgetFlag, "1");
		window.addEventListener("unload", function clearUndo(e) {
			window.removeEventListener(e.type, clearUndo, false);

			win.setTimeout(function() {
				if(canForget) {
					var closed = JSON.parse(ss.getClosedWindowData());
					for(var i = 0, l = closed.length; i < l; ++i) {
						var winData = closed[i];
						delete winData._shouldRestore;
						//LOG("#" + i + "\n" + JSON.stringify(winData));
						if(winData.extData && forgetFlag in winData.extData) {
							ss.forgetClosedWindow(i);
							break;
						}
					}
				}
				else if(
					"getClosedWindowCount" in ss
						? ss.getClosedWindowCount() == 1
						: "getClosedWindowData" in ss && JSON.parse(ss.getClosedWindowData()).length == 1
				) {
					ss.setWindowState(win, '{"windows":[{}],"_closedWindows":[]}', false);
				}
				else {
					LOG("Can't remove closed window from undo history");
				}
			}, 0);
		}, false);

		if(flushCaches === undefined)
			flushCaches = this.options.reopenWindowFlushCaches;
		if(flushCaches) {
			window.close();
			this.flushCaches();
		}
	},
	get canMoveTabsToNewWindow() {
		delete this.canMoveTabsToNewWindow;
		return this.canMoveTabsToNewWindow = "gBrowser" in window
			&& "swapBrowsersAndCloseOther" in gBrowser;
	},
	moveTabsToNewWindow: function() {
		return this.confirm("reopen", "_moveTabsToNewWindow", arguments);
	},
	_moveTabsToNewWindow: function() {
		this.button.disabled = true;

		var win = this.openBrowserWindow();
		win.addEventListener("load", function moveTabs() {
			win.removeEventListener("load", moveTabs, false);

			if(window.windowState == window.STATE_NORMAL)
				win.moveTo(window.screenX, window.screenY);
			var tabs = Array.prototype.filter.call(
				gBrowser.tabs || gBrowser.tabContainer.childNodes,
				function(tab) {
					return tab.linkedBrowser && !tab.closing;
				}
			);
			var selectedTab = gBrowser.selectedTab;
			var gBrowserNew = win.gBrowser;

			var hasUnloadedTabs = false;
			tabs.forEach(function(tab) {
				if(!tab.linkedBrowser) // What?
					return;
				// We can't swap unloaded tabs! :(
				// Error: NS_ERROR_NOT_IMPLEMENTED: Component returned failure code:
				// 0x80004001 (NS_ERROR_NOT_IMPLEMENTED) [nsIFrameLoaderOwner.swapFrameLoaders]
				// (chrome://global/content/bindings/browser.xml, <method name="swapDocShells">)
				if(
					tab.getAttribute("pending") == "true" // Gecko >= 9.0
					|| tab.linkedBrowser.contentDocument
						&& tab.linkedBrowser.contentDocument.readyState == "uninitialized"
				) {
					hasUnloadedTabs = true;
					tab.linkedBrowser.reload();
				}
			});
			if(hasUnloadedTabs) {
				setTimeout(moveTabs, 500);
				return;
			}
			//~ todo: add support for tab groups

			if("treeStyleTab" in gBrowser) {
				var selectedTabPos = "_tPos" in selectedTab //~ todo: don't use with "closing" tabs?
					? selectedTab._tPos
					: tabs.indexOf(selectedTab);
				(function tstMoveTabs() {
					if("treeStyleTab" in gBrowserNew) {
						gBrowserNew.treeStyleTab.moveTabs(tabs);

						var initialTab = gBrowserNew.selectedTab;
						gBrowserNew.selectedTab = (gBrowserNew.tabs || gBrowserNew.tabContainer.childNodes)[selectedTabPos + 1];
						gBrowserNew.removeTab(initialTab);
					}
					else {
						setTimeout(tstMoveTabs, 10);
					}
				})();
				return;
			}

			tabs.forEach(function(tab) {
				var isRemote = tab.linkedBrowser.getAttribute("remote") == "true";
				var newTab = "Services" in window && "cpmm" in Services // May be remote?
					? gBrowserNew.addTab(isRemote ? "about:blank" : "about:about", {
						triggeringPrincipal: "Services" in window && Services.scriptSecurityManager
							&& Services.scriptSecurityManager.getSystemPrincipal() // Firefox 64+
					})
					: gBrowserNew.addTab();
				gBrowserNew.swapBrowsersAndCloseOther(newTab, tab);
				if(tab == selectedTab) {
					var initialTab = gBrowserNew.selectedTab;
					gBrowserNew.selectedTab = newTab;
					gBrowserNew.removeTab(initialTab);
				}
				tab.getAttribute("pinned") == "true" && gBrowserNew.pinTab && gBrowserNew.pinTab(newTab);
			});
		}, false);
	},
	openBrowserWindow: function() {
		// In SeaMonkey OpenBrowserWindow() doesn't return link to opened window
		//return OpenBrowserWindow();
		var browserURL = "getBrowserURL" in window
			? getBrowserURL()
			: window.AppConstants && AppConstants.BROWSER_CHROME_URL; // Firefox 63+
		return window.openDialog(browserURL, "_blank", "chrome,all,dialog=no");
	},
	restart: function() {
		return this.confirm("restart", "_restart", arguments);
	},
	_restart: function() {
		const pId = "browser.tabs.warnOnClose";
		var woc = this.getPref(pId);
		if(woc != undefined)
			this.setPref(pId, false);
		this.appRestart();
		if(woc != undefined)
			this.setPref(pId, woc);
	},
	cleanAndRestart: function() {
		return this.confirm("restart", "_cleanAndRestart", arguments);
	},
	_cleanAndRestart: function() {
		var xr = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULRuntime);
		if("invalidateCachesOnRestart" in xr)
			xr.invalidateCachesOnRestart();
		else {
			var profile = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
			var eal = Components.classes["@mozilla.org/uriloader/external-helper-app-service;1"]
				.getService(Components.interfaces.nsPIExternalAppLauncher);
			[
				"XUL.mfl",
				"XPC.mfl",
				"xpti.dat",
				"compreg.dat",
				// It's important to leave extensions.rdf - it stores information about disabled extensions
				"extensions.cache",
				"extensions.ini",
				"startupCache/startupCache.4.little"
			].forEach(function(path) {
				var file = profile.clone();
				path.split("/").forEach(function(name) {
					file.append(name);
				});
				eal.deleteTemporaryFileOnExit(file);
				try {
					file.remove(true);
				}
				catch(e) {
				}
			});
		}
		this._restart();
	},

	// Based on code from resource:///components/fuelApplication.js in Firefox 38
	appQuit: function() {
		return this._quitWithFlags(Components.interfaces.nsIAppStartup.eAttemptQuit);
	},
	appRestart: function() {
		return this._quitWithFlags(
			Components.interfaces.nsIAppStartup.eAttemptQuit
			| Components.interfaces.nsIAppStartup.eRestart
		);
	},
	_quitWithFlags: function(flags) {
		var cancelQuit = Components.classes["@mozilla.org/supports-PRBool;1"]
			.createInstance(Components.interfaces.nsISupportsPRBool);
		var quitType = flags & Components.interfaces.nsIAppStartup.eRestart ? "restart" : null;
		Services.obs.notifyObservers(cancelQuit, "quit-application-requested", quitType);
		if(cancelQuit.data)
			return false; // somebody canceled our quit request
		var appStartup = Components.classes["@mozilla.org/toolkit/app-startup;1"]
			.getService(Components.interfaces.nsIAppStartup);
		appStartup.quit(flags);
		return true;
	},

	flushCaches: function() {
		// See resource://gre/modules/XPIProvider.jsm
		// resource://gre/modules/addons/XPIProvider.jsm
		var obs = Services.obs;
		obs.notifyObservers(null, "startupcache-invalidate", null);
		obs.notifyObservers(null, "chrome-flush-skin-caches", null);
		obs.notifyObservers(null, "chrome-flush-caches", null);

		obs.notifyObservers(null, "message-manager-flush-caches", null);
		if("Services" in window && Services.mm && Services.mm.broadcastAsyncMessage)
			Services.mm.broadcastAsyncMessage("AddonMessageManagerCachesFlush", null);
		if("Services" in window && Services.strings && Services.strings.flushBundles)
			Services.strings.flushBundles();
	},
	get currentLocale() {
		return this.getLocale();
	},
	get defaultLocale() {
		return this.getLocale(true);
	},
	getLocale: function(getDefault) {
		if(
			"Services" in window && "locale" in Services
			&& ("getRequestedLocales" in Services.locale || "requestedLocales" in Services.locale)
		) {
			var localePref = "intl.locale.requested";
			if(getDefault && Services.prefs.prefHasUserValue(localePref)) {
				var origLocales = this.getPref(localePref);
				this.resetPref(localePref);
			}
			var locales = Services.locale.requestedLocales || Services.locale.getRequestedLocales();
			if(origLocales)
				this.setPref(localePref, origLocales);
			return locales && locales[0];
		}
		var prefs = getDefault ? this.defaultBranch : Services.prefs;
		var locale = this.getPref("general.useragent.locale", "", prefs);
		if(locale && locale.substr(0, 9) != "chrome://")
			return locale;
		return prefs.getComplexValue(
			"general.useragent.locale",
			Components.interfaces.nsIPrefLocalizedString
		);
	},
	switchLocale: function(onlyGet) {
		var curLocale = this.currentLocale;
		var locales = this.options.locales;
		var i = locales.indexOf(curLocale);
		if(i == -1 || ++i >= locales.length)
			i = 0;
		var locale = locales[i];
		if(onlyGet)
			return locale;
		return this.setLocale(locale);
	},
	get nextLocale() {
		return this.switchLocale(true);
	},
	switchLocaleCustom: function() {
		this.button.open = false;
		var locale = { value: this.nextLocale };
		var ok = Services.prompt.prompt(
			window,
			_localize("Extensions Developer Tools"),
			_localize("Current locale: %S")
				.replace("%S", this.currentLocale || "???")
			+ "\n" + _localize("Switch locale to:"),
			locale,
			null,
			{}
		);
		if(ok && locale.value)
			this.setLocale(locale.value);
	},
	setLocale: function(locale) {
		if(!this.options.updateLocales) {
			this._setLocale(locale);
			return;
		}
		var _this = this;
		var mi = this.$("switchLocale");
		mi.setAttribute("disabled", "true");
		this.ensureLocaleAvailable(locale, function(ok) {
			mi.removeAttribute("disabled");
			_this._setLocale(locale);
		});
	},
	_setLocale: function(locale) {
		if("Services" in window && "locale" in Services && "setRequestedLocales" in Services.locale)
			Services.locale.setRequestedLocales([locale]);
		else if("Services" in window && "locale" in Services && "requestedLocales" in Services.locale)
			Services.locale.requestedLocales = [locale];
		else {
			this.setPref("intl.locale.matchOS", false);
			this.setPref("general.useragent.locale", locale);
		}
		var reopen = !this.options.forceRestartOnLocaleChange
			&& this.canReopenWindow
			&& (
				this.platformVersion >= 18
				|| this.app == "Pale Moon" && this.platformVersion >= 4.1
				|| this.app == "Basilisk"
			);
		if(!this.confirm(reopen ? "reopenAfterLocaleChange" : "restartAfterLocaleChange")) {
			if(this.options.shitchLocaleFlushCaches)
				this.flushCaches();
			this.savePrefFile(true);
			return false;
		}
		if(reopen) {
			this._reopenWindow(this.options.shitchLocaleFlushCaches);
			this.savePrefFile(true);
		}
		else {
			if(this.platformVersion >= 2)
				this._cleanAndRestart();
			else
				this._restart();
		}
		return locale;
	},
	get alwaysUpdateLocale() {
		var isAlpha = /^\d+(?:\.\d+)*a\d/.test(Services.appinfo.version);
		delete this.alwaysUpdateLocale;
		return this.alwaysUpdateLocale = isAlpha;
	},
	ensureLocaleAvailable: function(locale, callback, tryESR) {
		if(locale == this.defaultLocale) {
			callback(true);
			return;
		}
		if(!("AddonManager" in window)) try {
			Components.utils["import"]("resource://gre/modules/AddonManager.jsm");
		}
		catch(e) {
			callback(undefined);
			return;
		}
		var id = "langpack-" + locale + "@firefox.mozilla.org";
		var _this = this;
		function getAddonByID(id, callback) {
			var promise = AddonManager.getAddonByID(id, callback);
			if(promise && typeof promise.then == "function") // Firefox 61+
				promise.then(callback, Components.utils.reportError);
		}
		function getInstallForURL(url, callback, mimeType) {
			if(AddonManager.getInstallForURL.length == 3)
				AddonManager.getInstallForURL(url, callback, mimeType);
			else // Firefox 61+
				AddonManager.getInstallForURL(url, mimeType).then(callback, Components.utils.reportError);
		}
		getAddonByID(id, function(addon) {
			if(addon && addon.isCompatible && !_this.alwaysUpdateLocale) {
				callback(true);
				return;
			}
			var installURL = _this.getInstallURLForLocale(locale, tryESR);
			if(!installURL) {
				callback(false);
				return;
			}
			LOG("installURL: " + installURL);
			if(
				!tryESR
				&& !Services.prompt.confirm(
					window,
					_localize("Extensions Developer Tools"),
					_localize(addon ? "Update %S locale?" : "Install %S locale?")
						.replace("%S", locale)
				)
			) {
				callback(false);
				return;
			}

			var btn = _this.button;
			var progressIcon = new ProgressIcon(btn);
			getInstallForURL(
				installURL,
				function(install) {
					LOG("[Language pack]: Call install()");
					install.addListener({
						onInstallEnded: function(install, addon) {
							LOG("[Language pack]: Ok");
							this._done();
						},
						onDownloadFailed: function(install) {
							LOG("[Language pack]: Download failed");
							this._done("download failed");
						},
						onInstallFailed: function(install) {
							LOG("[Language pack]: Install failed");
							this._done("install failed");
						},
						_done: function(error) {
							progressIcon.restore();
							install.removeListener(this);
							this._progress();
							if(error) {
								if(!tryESR && _this.getInstallURLForLocale(locale, true) != installURL) {
									LOG("[Language pack]: Will try ESR version");
									_this.ensureLocaleAvailable(locale, callback, true);
									return;
								}
								var installURLs = [installURL];
								if(tryESR) {
									var installURLNoESR = _this.getInstallURLForLocale(locale, false);
									if(installURLNoESR != installURL)
										installURLs.unshift(installURLNoESR);
								}
								Services.prompt.alert(
									window,
									_localize("Extensions Developer Tools"),
									_localize("Can't install %L locale: %R!\nURL: %U")
										.replace("%L", locale)
										.replace("%R", _localize(error))
										.replace("%U", installURLs.join("\n"))
								);
							}
							callback(!!error);
						},
						onDownloadStarted: function(install) {
							this._progress(_localize("Download language pack…"));
						},
						onDownloadProgress: function(install) {
							var persent = Math.round(install.progress/install.maxProgress*100);
							this._progress(_localize("Download language pack: %S%").replace("%S", persent));
						},
						onDownloadEnded: function(install) {
							this._progress(_localize("Download language pack: done!"));
						},
						_progress: function(state) {
							if("XULBrowserWindow" in window)
								XULBrowserWindow.setOverLink(state || "", null);
						}
					});
					progressIcon.loading();
					install.install();
				},
				"application/x-xpinstall"
			);
		});
	},
	getInstallURLForLocale: function(locale, useESR) {
		var appInfo = Services.appinfo;
		var app = appInfo.name.toLowerCase();
		if(
			app != "firefox"
			&& app != "seamonkey"
			&& app != "thunderbird"
		)
			return undefined;

		var version = appInfo.version;
		var isRelease = /^\d+(\.\d+)*$/.test(version);
		var os = appInfo.OS;
		var platform;
		if(os == "WINNT")       platform = "win32";
		else if(os == "Darwin") platform = "mac";
		else                    platform = "linux-i686";
		if(!isRelease) {
			// https://ftp.mozilla.org/pub/firefox/nightly/latest-mozilla-central/firefox-###.en-US.langpack.xpi
			// https://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central-l10n/win32/xpi/
			// https://ftp.mozilla.org/pub/mozilla.org/seamonkey/nightly/latest-comm-central-trunk-l10n/win32/xpi/
			// https://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-central-l10n/win32/xpi/
			// firefox-25.0a1.fr.langpack.xpi
			var file = app + "-" + version + "." + locale + ".langpack.xpi";
			if(locale == "en-US")
				return "https://ftp.mozilla.org/pub/" + app + "/nightly/latest-mozilla-central/" + file;
			var dir;
			if(app == "firefox")        dir = "latest-mozilla-central-l10n";
			else if(app == "seamonkey") dir = "latest-comm-central-trunk-l10n";
			else                        dir = "latest-comm-central-l10n";
			return "https://ftp.mozilla.org/pub/mozilla.org/" + app + "/nightly/" + dir + "/" + platform + "/xpi/" + file;
		}
		if(app == "seamonkey") {
			// https://ftp.mozilla.org/pub/mozilla.org/seamonkey/releases/2.17.1/langpack/seamonkey-2.17.1.ru.langpack.xpi
			return "https://ftp.mozilla.org/pub/mozilla.org/seamonkey/releases/"
				+ version + "/langpack/seamonkey-" + version + "." + locale + ".langpack.xpi";
		}
		var file = locale + ".xpi";
		var esr = useESR ? "esr" : "";
		// https://ftp.mozilla.org/pub/mozilla.org/firefox/releases/23.0/win32/xpi/
		// https://ftp.mozilla.org/pub/mozilla.org/firefox/releases/23.0/mac/xpi/
		// https://ftp.mozilla.org/pub/mozilla.org/firefox/releases/23.0/linux-i686/xpi/
		return "https://ftp.mozilla.org/pub/mozilla.org/" + app + "/releases/" + version + esr + "/" + platform + "/xpi/" + file;
	},
	get canSaveSessionAndExit() {
		delete this.canSaveSessionAndExit;
		return this.canSaveSessionAndExit = this.ss
			? this.prefHasDefaultValue("browser.sessionstore.resume_session_once")
			: this.prefHasDefaultValue("extensions.crashrecovery.resume_session_once"); // Session Manager extension?
	},
	saveSessionAndExit: function() {
		if(!this.confirm("exit"))
			return;
		//~ todo: browser.showQuitWarning, browser.warnOnQuit - ?
		var woq = this.getPref("browser.warnOnQuit");
		if(woq != undefined)
			this.setPref("browser.warnOnQuit", false);
		var woc = this.getPref("browser.tabs.warnOnClose");
		if(woc != undefined)
			this.setPref("browser.tabs.warnOnClose", false);
		try {
			if(
				"goQuitApplication" in window
					? goQuitApplication()
					: this.appQuit()
			) {
				if(this.ss)
					this.setPref("browser.sessionstore.resume_session_once", true);
				else
					this.setPref("extensions.crashrecovery.resume_session_once", true);
			}
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		if(woq != undefined)
			this.setPref("browser.warnOnQuit", woq);
		if(woc != undefined)
			this.setPref("browser.tabs.warnOnClose", woc);
	},
	get _hasConsole() {
		// Removed in Firefox 50+: https://bugzilla.mozilla.org/show_bug.cgi?id=1278368
		delete this._hasConsole;
		return this._hasConsole = "@mozilla.org/toolkit/console-clh;1" in Components.classes;
	},
	get _hasConsole2() {
		delete this._hasConsole2;
		return this._hasConsole2 = "@zeniko/console2-clh;1" in Components.classes
			|| "@mozilla.org/commandlinehandler/general-startup;1?type=console2" in Components.classes; // Firefox <= 3.6
	},
	get hasErrorConsole() {
		delete this.hasErrorConsole;
		return this.hasErrorConsole = this._hasConsole || this._hasConsole2;
	},
	openErrorConsole: function() {
		if("toErrorConsole" in window) {
			toErrorConsole();
			return;
		}
		if("toJavaScriptConsole" in window) {
			toJavaScriptConsole();
			return;
		}
		var w = this.getErrorConsole();
		if(w) {
			w.focus();
			return;
		}
		if(!this.hasErrorConsole) {
			Services.prompt.alert(
				window,
				_localize("Extensions Developer Tools"),
				_localize("Error Console not found!")
			);
			return;
		}
		var consoleURI = this._hasConsole2
			? "chrome://console2/content/console2.xul"
			: "chrome://global/content/console.xul";
		window.openDialog(consoleURI, "_blank", "chrome,all,centerscreen,resizable,dialog=0");
	},
	getErrorConsole: function() {
		return Services.wm.getMostRecentWindow("global:console");
	},
	// Note: Browser Console isn't supported without opened browser windows
	get browserWindow() {
		if(window.location.href == "chrome://browser/content/browser.xul")
			return window;
		return Services.wm.getMostRecentWindow("navigator:browser");
	},
	get canOpenBrowserConsole() {
		var window = this.browserWindow;
		return window && !!window.document.getElementById("key_browserConsole")
			|| this.platformVersion >= 57; // Force show menuitem
	},
	openBrowserConsole: function() {
		try { // For Firefox 60+
			var require = Components.utils["import"]("resource://devtools/shared/Loader.jsm", {}).require;
			var HUDService = require("devtools/client/webconsole/hudservice").HUDService;
			HUDService.openBrowserConsoleOrFocus();
			return;
		}
		catch(e) {
		}
		var window = this.browserWindow;
		if(!window)
			return;
		var consoleFrame = this.getBrowserConsole(window);
		if(consoleFrame) {
			consoleFrame.focus();
			return;
		}
		if("HUDService" in window && "toggleBrowserConsole" in window.HUDService) { // Firefox 27.0a1+
			window.HUDService.toggleBrowserConsole();
			return;
		}
		if("HUDConsoleUI" in window && "toggleBrowserConsole" in window.HUDConsoleUI) {
			window.HUDConsoleUI.toggleBrowserConsole();
			return;
		}
		window.document.getElementById("key_browserConsole").doCommand();
	},
	getBrowserConsole: function(window) {
		if(!window)
			window = this.browserWindow;
		if("HUDService" in window && "getBrowserConsole" in window.HUDService) { // Firefox 27.0a1+
			var hud = window.HUDService.getBrowserConsole();
			return hud && hud.iframeWindow;
		}
		if("HUDConsoleUI" in window && window.HUDConsoleUI._browserConsoleID) try {
			var HUDService = Components.utils["import"]("resource:///modules/HUDService.jsm", {}).HUDService;
			var hud = HUDService.getHudReferenceById(window.HUDConsoleUI._browserConsoleID);
			return hud && hud.iframeWindow;
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		return null;
	},
	_restoreErrorConsoleObserver: null,
	initErrorConsoleRestoring: function() {
		if(this._restoreErrorConsoleObserver/* || this.platformVersion < 2*/)
			return;
		this.restoreErrorConsole();
		var obs = Services.obs;
		var _this = this;
		var observer = this._restoreErrorConsoleObserver = {
			observe: function() {
				obs.removeObserver(observer, "quit-application-granted");
				if(_this.getErrorConsole())
					_this.setPref(_this.prefs.restoreErrorConsole, true);
				if(_this.getBrowserConsole())
					_this.setPref(_this.prefs.restoreBrowserConsole, true);
			}
		};
		obs.addObserver(observer, "quit-application-granted", false);
	},
	destroyErrorConsoleRestoring: function() {
		var o = this._restoreErrorConsoleObserver;
		if(o) {
			this._restoreErrorConsoleObserver = null;
			Services.obs.removeObserver(o, "quit-application-granted");
		}
	},
	restoreErrorConsole: function() {
		if(this.getPref(this.prefs.restoreErrorConsole)) {
			this.resetPref(this.prefs.restoreErrorConsole);
			if(this.hasErrorConsole)
				this.openErrorConsole();
		}
		if(this.getPref(this.prefs.restoreBrowserConsole)) {
			this.resetPref(this.prefs.restoreBrowserConsole);
			// Note: #menu_browserConsole doesn't exist yet on startup
			//if(this.canOpenBrowserConsole)
			this.openBrowserConsole();
		}
	},
	attrsInspector: function(e) {
		this.button.attrsInspector(e);
		this.setAttrsInspectorActive();
	},
	setAttrsInspectorActive: function(mi) {
		if(!mi)
			mi = this.$("attrsInspector");
		if("__attributesInspector" in window) {
			mi.setAttribute("type", "checkbox");
			mi.setAttribute("checked", "true");
		}
		else {
			mi.removeAttribute("type");
			mi.removeAttribute("checked");
		}
	},
	get hasBrowserToolbox() {
		delete this.hasBrowserToolbox;
		return this.hasBrowserToolbox = this.app == "Firefox" && this.platformVersion >= 56
			|| this.app == "Pale Moon" && this.platformVersion >= 4.1
			|| this.app == "Basilisk";
	},
	openBrowserToolbox: function() {
		var pref = "devtools.debugger.remote-enabled";
		if(!this.getPref(pref)) {
			this.setPref(pref, true);
			setTimeout(function(_this) {
				_this.resetPref(pref);
				if(_this.getPref(pref)) // Ensure disabled
					_this.setPref(pref, false);
			}, 100, this);
		}
		try {
			var btl = Components.utils["import"]("resource://devtools/client/framework/ToolboxProcess.jsm", {})
				.BrowserToolboxProcess;
		}
		catch(e) { // Firefox 72+
			btl = Components.utils["import"]("resource://devtools/client/framework/browser-toolbox/Launcher.jsm", {})
				.BrowserToolboxLauncher;
		}
		btl.init(/*onClose, onRun, overwritePreferences, binaryPath*/);
	},
	get hasScratchpad() {
		var window = this.browserWindow;
		delete this.hasScratchpad;
		return this.hasScratchpad = window && "Scratchpad" in window && "openScratchpad" in Scratchpad
			|| window && !!window.document.getElementById("key_scratchpad")
			|| this.app == "Firefox" && this.platformVersion >= 58 && this.platformVersion < 72
			|| this.app == "Pale Moon" && this.platformVersion >= 4.1
			|| this.app == "Basilisk";
	},
	openScratchpad: function() {
		var ScratchpadManager = "Scratchpad" in window
			? "ScratchpadManager" in Scratchpad && Scratchpad.ScratchpadManager // Firefox 10+
			: Components.utils["import"]("resource://devtools/client/scratchpad/scratchpad-manager.jsm", {})
				.ScratchpadManager; // Firefox 59+
		if(ScratchpadManager) {
			// Use JSON.stringify(win.Scratchpad.getState()) to get state object
			var context = this.getPref("devtools.chrome.enabled") ? 2 : 1;
			ScratchpadManager.openScratchpad({ text: "", executionContext: context, saved: true });
			return;
		}

		var win = Scratchpad.openScratchpad();
		var _this = this;
		win.addEventListener("load", function tweak(e) {
			win.removeEventListener("load", tweak, false);
			if(_this.getPref("devtools.chrome.enabled"))
				win.document.getElementById("sp-menu-browser").doCommand();
			var stopTime = Date.now() + 3000;
			if(_this.getPref("devtools.editor.component") != "orion") {
				var textbox = win.Scratchpad.textbox;
				if(textbox) {
					textbox.value = "";
					textbox.focus();
					return;
				}
			}
			(function clear() {
				try {
					win.Scratchpad.setText("");
				}
				catch(e) { // Not yet initialized!
					if(Date.now() < stopTime)
						setTimeout(clear, 10);
					else
						Components.utils.reportError(e);
				}
			})();
		}, false);
	},
	get hasEyedropper() {
		var window = this.browserWindow;
		delete this.hasEyedropper;
		return this.hasEyedropper = window && "openEyedropper" in window
			|| this.app == "Firefox" && this.platformVersion >= 50
			|| this.app == "Pale Moon" && this.platformVersion >= 4.1
			|| this.app == "Basilisk";
	},
	openEyedropper: function() {
		if("openEyedropper" in window) {
			openEyedropper();
			return;
		}
		// Firefox 50+, based on code from resource://devtools/client/menus.js
		var require = Components.utils["import"]("resource://devtools/shared/Loader.jsm", {}).require;
		var TargetFactory = require("devtools/client/framework/target").TargetFactory;
		var target = TargetFactory.forTab(gBrowser.selectedTab);
		if("getFront" in target) { // Firefox 64+
			target.makeRemote().then(function() {
				target.getFront("inspector")
					.pickColorFromPage({ copyOnSelect: true, fromMenu: true });
			}, Components.utils.reportError);
			return;
		}
		if("then" in target) { // Firefox 69+
			target.then(function(target) {
				target.attach().then(function() {
					var getInspector = "getInspector" in target
						? target.getInspector()
						: target.getFront("inspector"); // Firefox 70+
					getInspector.then(function(inspectorFront) {
						inspectorFront.pickColorFromPage({ copyOnSelect: true, fromMenu: true });
					}, Components.utils.reportError);
				}, Components.utils.reportError);
			}, Components.utils.reportError);
			return;
		}
		var CommandUtils = require("devtools/client/shared/developer-toolbar").CommandUtils;
		if("executeOnTarget" in CommandUtils) // Firefox 54+
			CommandUtils.executeOnTarget(target, "eyedropper --frommenu");
		else {
			CommandUtils.createRequisition(target, {
				environment: CommandUtils.createEnvironment({ target: target })
			}).then(function(requisition) {
				requisition.updateExec("eyedropper --frommenu");
			}, Components.utils.reportError);
		}
	},

	get isDebugBuild() { //~ todo: find another way
		delete this.isDebugBuild;
		return this.isDebugBuild = this.getPref(
			"general.warnOnAboutConfig",
			true,
			this.defaultBranch
		) == false;
	},
	get canDisableE4X() {
		delete this.canDisableE4X;
		return this.canDisableE4X = this.prefHasDefaultValue("javascript.options.xml.chrome");
	},
	get hasMultiProcessMode() {
		delete this.hasMultiProcessMode;
		return this.hasMultiProcessMode = this.prefHasDefaultValue("browser.tabs.remote.autostart");
	},
	ensureMultiProcessMode: function(isMultiProcess) {
		// It's enough to enable only using browser.tabs.remote.force-enable = true
		// But to disable should be also browser.tabs.remote.autostart = false
		[
			"browser.tabs.remote.autostart",
			"browser.tabs.remote.autostart.1",
			"browser.tabs.remote.autostart.2"
		].forEach(function(pref) {
			this.resetPref(pref);
			if(Services.prefs.getPrefType(pref) == Services.prefs.PREF_BOOL)
				this.setPref(pref, isMultiProcess);
		}, this);
	},

	hasModifier: function(e) {
		return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
	},

	confirm: function(key, method, args) {
		var msg;
		switch(key) {
   			case "reopen":
   			case "reopenAfterLocaleChange":
   				msg = "Reopen window?";
   			break;
   			case "restart":
   			case "restartAfterLocaleChange":
   				msg = "Restart application?";
   			break;
   			case "exit":
   				msg = "Are you sure you want to exit?";
		}
		if(
			!this.options.confirm[key]
			|| Services.prompt.confirm(window, _localize("Extensions Developer Tools"), _localize(msg))
		) {
			method && this[method].apply(this, args);
			return true;
		}
		return false;
	},

	$: function(id) {
		var nodes = this.popup.getElementsByAttribute("cb_id", id);
		return nodes.length ? nodes[0] : null;
	},
	delayed: function(func, context, delay) {
		setTimeout(function(context) {
			func.call(context);
		}, delay || 0, context || this);
	},
	initPrefsMenu: function(popup) {
		var knownPrefs = { __proto__: null };
		var closeMenu = this.options.closeOptionsMenu ? "auto" : "none";
		Array.prototype.forEach.call(
			popup.getElementsByAttribute("cb_pref", "*"),
			function(mi) {
				if(mi.parentNode != popup) // Ignore debug prefs
					return;
				var pref = mi.getAttribute("cb_pref");
				knownPrefs[pref] = true;
				var val = this.getPref(pref);
				var isSpecial = this.options.prefValues.hasOwnProperty(pref);
				var checked = isSpecial
					? this.getCheckedState(pref, val)
					: !!val;
				mi.setAttribute("checked", checked);
				mi.setAttribute("closemenu", closeMenu);
				mi.setAttribute("tooltiptext", isSpecial ? pref + " = " + val : pref);
				this.hlPrefItem(mi, pref);
			},
			this
		);
		this.initDebugPrefsMenus(popup, knownPrefs);
	},
	getCheckedState: function(pref, val) {
		if(pref == "extensions.autoDisableScopes")
			return !(val & 1);
		return val == this.options.prefValues[pref];
	},
	initDebugPrefsMenus: function(parentPopup, knownPrefs) {
		var showDebugPrefs = this.options.showDebugPrefs;
		if(!showDebugPrefs)
			return;
		this.$("debugPrefsSeparator").removeAttribute("hidden");
		if(showDebugPrefs & 1)
			this.$("debugPrefsExtMenu").removeAttribute("hidden");
		if(showDebugPrefs & 2)
			this.$("debugPrefsAppMenu").removeAttribute("hidden");
		this.delayed(function() {
			this.fillDebugPrefsPopup(knownPrefs);
		});
	},
	fillDebugPrefsPopup: function(knownPrefs) {
		var showDebugPrefs = this.options.showDebugPrefs;
		var ext = showDebugPrefs & 1
			&& document.createDocumentFragment();
		var app = showDebugPrefs & 2
			&& document.createDocumentFragment();
		var trimPrefix = this.options.debugPrefsTrimExtPrefix ? 11 /*"extensions.".length*/ : 0;
		var types = this.options.debugPrefsTypes;
		Services.prefs.getBranch("")
			.getChildList("", {})
			.filter(function(pName) {
				var show = !(pName in knownPrefs)
					&& this.options.debugPrefsInclude.test(pName)
					&& !this.options.debugPrefsExclude.test(pName);
				if(show && types != 0) {
					var ps = Services.prefs;
					switch(ps.getPrefType(pName)) {
						case ps.PREF_BOOL:   return types & 1;
						case ps.PREF_INT:    return types & 2;
						case ps.PREF_STRING: return types & 4;
					}
				}
				return show;
			}, this)
			.sort()
			.forEach(function(pName) {
				if(pName.substr(0, 11) == "extensions.")
					ext && ext.appendChild(this.createPrefItem(pName, trimPrefix));
				else
					app && app.appendChild(this.createPrefItem(pName));
			}, this);
		ext && this.delayed(function() {
			this.fillPopup("debugPrefsExtPopup", ext);
		});
		app && this.delayed(function() {
			this.fillPopup("debugPrefsAppPopup", app);
		});
	},
	fillPopup: function(id, df) {
		var node = this.$(id);
		node.textContent = "";
		node.appendChild(df);
		if(node.hasChildNodes())
			node.parentNode.removeAttribute("disabled");
		else
			node.parentNode.setAttribute("disabled", "true");
	},
	createPrefItem: function(pName, trimPrefix) {
		var mi = document.createElementNS(XULNS, "menuitem");
		mi.setAttribute("cb_pref", pName);
		if(trimPrefix) {
			mi.setAttribute("label", pName.substr(trimPrefix));
			mi.setAttribute("tooltiptext", pName);
		}
		else {
			mi.setAttribute("label", pName);
		}
		var pVal = this.getPref(pName);
		mi.setAttribute("type", "checkbox");
		if(typeof pVal == "boolean") {
			if(this.getPref(pName))
				mi.setAttribute("checked", "true");
			if(!this.options.closeOptionsMenu)
				mi.setAttribute("closemenu", "none");
		}
		else {
			mi.setAttribute("autocheck", "false");
		}
		this.showPrefValue(mi, pVal);
		this.hlPrefItem(mi, pName);
		return mi;
	},
	doPrefsMenuCommand: function(mi) {
		var pVal, pName = mi.getAttribute("cb_pref");
		if(!pName)
			return;
		if(mi.getAttribute("type") == "checkbox" && mi.getAttribute("autocheck") != "false")
			pVal = mi.getAttribute("checked") == "true";
		else {
			var curVal = this.getPref(pName);
			var defVal = this.getPref(pName, undefined, this.defaultBranch);
			var resetLabel = curVal != defVal
				? _localize("Reset to default value (%S)").replace("%S", defVal)
				: "";
			var pref = { value: curVal };
			var reset = { value: false };
			var ok = Services.prompt.prompt(
				window,
				_localize("Extensions Developer Tools"),
				_localize("Change “%S” preference:").replace("%S", pName),
				pref,
				resetLabel,
				reset
			);
			if(!ok)
				return;
			pVal = pref.value;
			if(typeof curVal == "number")
				pVal = +pVal;
		}

		if(reset && reset.value) {
			this.resetPref(pName);
		}
		else if(this.options.prefValues.hasOwnProperty(pName)) {
			if(pVal) // Checked
				this.setPref(pName, this.options.prefValues[pName]);
			else
				this.resetPref(pName);
			this.delayed(function() {
				mi.setAttribute("tooltiptext", pName + " = " + this.getPref(pName));
			});
		}
		else {
			// We may have "user changed" devtools.chrome.enabled & Co,
			// will reset for better indication
			this.resetPref(pName);
			if(pVal != this.getPref(pName))
				this.setPref(pName, pVal);
		}

		this.hlPrefItem(mi, pName);
		if(mi.hasAttribute("acceltext"))
			this.showPrefValue(mi, pVal);
		if(
			pName == "devtools.chrome.enabled"
			|| pName == "devtools.debugger.remote-enabled"
		)
			this.initMenu();
		this.prefsChanged = true;
	},
	showPrefValue: function(mi, pVal) {
		var pStr = "" + pVal;
		var pType = typeof pVal;
		if(pType != "boolean") {
			if(pType == "number")
				mi.setAttribute("checked", pVal != 0);
			pStr = pStr.substr(0, 16);
			// Simple trick to align "1" and "false"
			var pad = Math.round((5 - pStr.length)*1.6);
			while(pad-- > 0)
				pStr += " ";
		}
		mi.setAttribute("acceltext", pStr);
	},
	hlPrefItem: function(node, pName) {
		node.style.fontWeight = this.prefHasUserValue(pName) ? "bold" : "";
	},

	get defaultBranch() {
		delete this.defaultBranch;
		return this.defaultBranch = Services.prefs.getDefaultBranch("");
	},
	getPref: function(pName, defaultVal, prefBranch) {
		var ps = prefBranch || Services.prefs;
		try { // getPrefType() returns type of changed value for default branch
			switch(ps.getPrefType(pName)) {
				case ps.PREF_BOOL:   return ps.getBoolPref(pName);
				case ps.PREF_INT:    return ps.getIntPref(pName);
				case ps.PREF_STRING:
					if("getStringPref" in ps) // Firefox 58+
						return ps.getStringPref(pName);
					return ps.getComplexValue(pName, Components.interfaces.nsISupportsString).data;
			}
		}
		catch(e) {
		}
		return defaultVal;
	},
	setPref: function(pName, val, prefBranch) {
		var ps = prefBranch || Services.prefs;
		var pType = ps.getPrefType(pName);
		if(pType == ps.PREF_INVALID)
			pType = this.getValueType(val);
		switch(pType) {
			case ps.PREF_BOOL: return ps.setBoolPref(pName, val);
			case ps.PREF_INT:  return ps.setIntPref(pName, val);
			case ps.PREF_STRING:
			default:
				if("setStringPref" in ps) // Firefox 58+
					return ps.setStringPref(pName, val);
				var ss = Components.interfaces.nsISupportsString;
				var str = Components.classes["@mozilla.org/supports-string;1"]
					.createInstance(ss);
				str.data = val;
				return ps.setComplexValue(pName, ss, str);
		}
	},
	getValueType: function(val) {
		switch(typeof val) {
			case "boolean": return Services.prefs.PREF_BOOL;
			case "number":  return Services.prefs.PREF_INT;
		}
		return Services.prefs.PREF_STRING;
	},
	prefHasUserValue: function(pName) {
		if(!this.prefHasDefaultValue(pName))
			return !!this.getPref(pName);
		return Services.prefs.prefHasUserValue(pName);
	},
	prefHasDefaultValue: function(pName) {
		return this.getPref(pName, null, this.defaultBranch) != null;
	},
	resetPref: function(pName) {
		if(Services.prefs.prefHasUserValue(pName))
			Services.prefs.clearUserPref(pName);
	},

	prefsChanged: false,
	_savePrefFileTimer: null,
	savePrefFile: function(force) {
		if(this._savePrefFileTimer || !this.prefsChanged && !force)
			return;
		var timer = this._savePrefFileTimer = Components.classes["@mozilla.org/timer;1"]
			.createInstance(Components.interfaces.nsITimer);
		timer.init({
			context: this,
			observe: function() {
				this.context.prefsChanged = false;
				this.context._savePrefFileTimer = null;
				Services.prefs.savePrefFile(null);
				LOG("savePrefFile()");
			}
		}, 500, timer.TYPE_ONE_SHOT);
	},

	handleEvent: function(e) {
		if(
			e.type == "command"
			&& this.hasModifier(e)
			&& e.target.hasAttribute("cb_id")
		) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
};
function ProgressIcon(btn) {
	if(!(btn instanceof XULElement)) {
		this.loading = this.restore = function() {};
		return;
	}
	var app = Services.appinfo.name;
	var pv = parseFloat(Services.appinfo.platformVersion);
	if(app == "SeaMonkey")
		this.imgConnecting = this.imgLoading = "chrome://communicator/skin/icons/loading.gif";
	else if(app == "Thunderbird") {
		this.imgConnecting = "chrome://messenger/skin/icons/connecting.png";
		this.imgLoading = "chrome://messenger/skin/icons/loading.png";
	}
	else {
		this.imgConnecting = app == "Firefox" && pv >= 58
			? "chrome://browser/skin/tabbrowser/tab-connecting.png"
			: "chrome://browser/skin/tabbrowser/connecting.png";
		this.imgLoading = app == "Firefox" && pv >= 48
			? "chrome://global/skin/icons/loading.png"
			: "chrome://browser/skin/tabbrowser/loading.png";
	}
	var useAnimation = app == "Firefox" && pv >= 32 && pv < 48;
	var btnIcon = btn.icon
		|| btn.ownerDocument.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-icon");
	var origIcon = btnIcon.src;
	btnIcon.src = this.imgConnecting;
	if(useAnimation) {
		var cs = btnIcon.ownerDocument.defaultView.getComputedStyle(btnIcon, null);
		var s = btnIcon.style;
		s.margin = [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].join(" ");
		s.padding = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(" ");
		s.width = cs.width;
		s.height = cs.height;
		s.boxShadow = "none";
		s.borderColor = s.background = "transparent";
		btnIcon.setAttribute("fadein", "true");
		btnIcon.setAttribute("busy", "true");
		btnIcon.classList.add("tab-throbber");
		btnIcon._restore = function() {
			delete btnIcon._restore;
			btnIcon.removeAttribute("busy");
			btnIcon.removeAttribute("progress");
			setTimeout(function() {
				btnIcon.classList.remove("tab-throbber");
				btnIcon.removeAttribute("style");
				btnIcon.removeAttribute("fadein");
			}, 0);
		};
	}
	this.loading = function() {
		btnIcon.src = this.imgLoading;
		if(useAnimation)
			btnIcon.setAttribute("progress", "true");
	};
	this.restore = function() {
		btnIcon.src = origIcon;
		if(useAnimation)
			btnIcon._restore();
	};
}

var mp = cmds.popup = this.appendChild(parseXULFromString('\
	<menupopup xmlns="' + XULNS + '"\
		onpopupshowing="if(event.target == this) this.parentNode.commands.initMenu(this);"\
		onmousedown="this.parentNode.commands.setCloseMenu(event);"\
		onclick="this.parentNode.commands.setDefaultAction(event);">\
		<menuitem cb_id="reopenWindow"\
			oncommand="this.parentNode.parentNode.commands.reopenWindow();"\
			cb_show="canReopenWindow"\
			label="' + _localize("Reopen window") + '"\
			accesskey="' + _localize("w", "reopenWindowKey") + '"\
			class="menuitem-iconic"\
			image="' + images.reopenWindow + '" />\
		<menuitem cb_id="moveTabsToNewWindow"\
			oncommand="this.parentNode.parentNode.commands.moveTabsToNewWindow();"\
			cb_show="canMoveTabsToNewWindow"\
			label="' + _localize("Move tabs to new window") + '"\
			accesskey="' + _localize("t", "moveTabsToNewWindowKey") + '"\
			class="menuitem-iconic"\
			image="' + images.moveTabsToNewWindow + '" />\
		<menuitem cb_id="restart"\
			oncommand="this.parentNode.parentNode.commands.restart();"\
			label="' + _localize("Restart") + '"\
			accesskey="' + _localize("R", "restartKey") + '"\
			class="menuitem-iconic"\
			image="' + images.restart + '" />\
		<menuitem cb_id="cleanAndRestart"\
			oncommand="this.parentNode.parentNode.commands.cleanAndRestart();"\
			label="' + _localize("Clean and restart") + '"\
			accesskey="' + _localize("C", "cleanAndRestartKey") + '"\
			class="menuitem-iconic"\
			image="' + images.cleanAndRestart + '" />\
		<menuitem cb_id="flushCaches"\
			oncommand="this.parentNode.parentNode.commands.flushCaches();"\
			label="' + _localize("Flush caches") + '"\
			accesskey="' + _localize("F", "flushCachesKey") + '"\
			class="menuitem-iconic"\
			image="' + images.flushCaches + '" />\
		<menuitem cb_id="switchLocale"\
			oncommand="this.parentNode.parentNode.commands.switchLocale();"\
			onclick="if(event.button == 2) { this.parentNode.parentNode.commands.switchLocaleCustom(); }"\
			oncontextmenu="return false;"\
			accesskey="' + _localize("S", "switchLocaleKey") + '"\
			class="menuitem-iconic"\
			image="' + images.switchLocale + '" />\
		<menuitem cb_id="saveSessionAndExit"\
			oncommand="this.parentNode.parentNode.commands.saveSessionAndExit();"\
			label="' + _localize("Save session and exit") + '"\
			accesskey="' + _localize("x", "saveSessionAndExitKey") + '"\
			class="menuitem-iconic"\
			image="' + images.saveSessionAndExit + '"\
			cb_show="canSaveSessionAndExit" />\
		<menuseparator />\
		<menuitem cb_id="errorConsole"\
			oncommand="this.parentNode.parentNode.commands.openErrorConsole();"\
			key="key_errorConsole"\
			label="' + _localize("Error console") + '"\
			accesskey="' + _localize("E", "errorConsoleKey") + '"\
			class="menuitem-iconic"\
			image="' + images.errorConsole + '"\
			cb_show="hasErrorConsole" />\
		<menuitem cb_id="browserConsole"\
			oncommand="this.parentNode.parentNode.commands.openBrowserConsole();"\
			key="key_browserConsole"\
			label="' + _localize("Browser console") + '"\
			accesskey="' + _localize("B", "browserConsoleKey") + '"\
			class="menuitem-iconic"\
			image="' + images.browserConsole + '"\
			cb_show="canOpenBrowserConsole" />\
		<menuitem cb_id="attrsInspector"\
			oncommand="this.parentNode.parentNode.commands.attrsInspector(event);"\
			label="' + _localize("Attributes Inspector") + '"\
			accesskey="' + _localize("A", "attrsInspectorKey") + '"\
			class="menuitem-iconic"\
			image="' + images.attrsInspector + '" />\
		<menuitem cb_id="browserToolbox"\
			oncommand="this.parentNode.parentNode.commands.openBrowserToolbox();"\
			key="key_browserToolbox"\
			label="' + _localize("Browser Toolbox") + '"\
			accesskey="' + _localize("e", "browserToolboxKey") + '"\
			class="menuitem-iconic"\
			image="' + (cmds.hasBrowserToolbox ? images.browserToolbox : "") + '"\
			cb_show="hasBrowserToolbox" />\
		<menuitem cb_id="scratchpad"\
			oncommand="this.parentNode.parentNode.commands.openScratchpad();"\
			label="' + _localize("Scratchpad") + '"\
			accesskey="' + _localize("p", "scratchpadKey") + '"\
			class="menuitem-iconic"\
			image="' + images.scratchpad + '"\
			cb_show="hasScratchpad" />\
		<menuitem cb_id="eyedropper"\
			oncommand="this.parentNode.parentNode.commands.openEyedropper();"\
			label="' + _localize("Grab a color from the page") + '"\
			accesskey="' + _localize("G", "eyedropperKey") + '"\
			class="menuitem-iconic"\
			image="' + images.eyedropper + '"\
			cb_show="hasEyedropper" />\
		<menuseparator />\
		<menu\
			label="' + _localize("Options") + '"\
			accesskey="' + _localize("O", "optionsKey") + '">\
			<menupopup\
				onpopupshowing="if(event.target == this) this.parentNode.parentNode.parentNode.commands.initPrefsMenu(this);"\
				onpopuphidden="if(event.target == this) this.parentNode.parentNode.parentNode.commands.savePrefFile();"\
				oncommand="this.parentNode.parentNode.parentNode.commands.doPrefsMenuCommand(event.target);"\
				onclick="if(event.button == 1) closeMenus(this);">\
				<menuitem cb_pref="javascript.options.showInConsole"\
					type="checkbox"\
					label="' + _localize("Show errors in chrome files") + '" />\
				<menuitem cb_pref="javascript.options.strict"\
					type="checkbox"\
					label="' + _localize("Show strict warnings") + '" />\
				<menuitem cb_pref="javascript.options.strict.debug"\
					type="checkbox"\
					label="' + _localize("Show strict warnings in debug builds") + '"\
					cb_show="cmds.isDebugBuild" />\
				<menuitem cb_pref="javascript.options.asyncstack"\
					type="checkbox"\
					label="' + _localize("Show stack for async calls") + '"\
					hidden="' + !cmds.prefHasDefaultValue("javascript.options.asyncstack") + '" />\
				<menuitem cb_pref="dom.report_all_js_exceptions"\
					type="checkbox"\
					label="' + _localize("Show all exceptions") + '"\
					hidden="' + (cmds.platformVersion < 1.9) + '" />\
				<menuitem cb_pref="extensions.logging.enabled"\
					type="checkbox"\
					label="' + _localize("Show information about extensions update") + '" />\
				<menuseparator />\
				<menuitem cb_pref="browser.dom.window.dump.enabled"\
					type="checkbox"\
					label="' + _localize("Enable window.dump()") + '" />\
				<menuitem cb_pref="nglayout.debug.disable_xul_cache"\
					type="checkbox"\
					label="' + _localize("Disable XUL cache") + '" />\
				<menuitem cb_pref="dom.allow_XUL_XBL_for_file"\
					type="checkbox"\
					label="' + _localize("Allow XUL and XBL for file://") + '"\
					hidden="' + (cmds.platformVersion < 2) + '" />\
				<menuitem cb_pref="security.data_uri.unique_opaque_origin"\
					type="checkbox"\
					label="' + _localize("Don't inherit privileged context for data:") + '"\
					hidden="' + !cmds.prefHasDefaultValue("security.data_uri.unique_opaque_origin") + '" />\
				<menuitem cb_pref="security.data_uri.block_toplevel_data_uri_navigations"\
					type="checkbox"\
					label="' + _localize("Block top level data: URI navigations") + '"\
					hidden="' + !cmds.prefHasDefaultValue("security.data_uri.block_toplevel_data_uri_navigations") + '" />\
				<menuitem cb_pref="devtools.chrome.enabled"\
					type="checkbox"\
					label="' + _localize("Enable developer tools for chrome") + '"\
					hidden="' + !cmds.prefHasDefaultValue("devtools.chrome.enabled") + '" />\
				<menuitem cb_pref="devtools.debugger.remote-enabled"\
					type="checkbox"\
					label="' + _localize("Enable remove debugger (and Browser Toolbox)") + '"\
					hidden="' + !cmds.prefHasDefaultValue("devtools.debugger.remote-enabled") + '" />\
				<menuitem cb_pref="extensions.autoDisableScopes"\
					tooltiptext="extensions.autoDisableScopes"\
					type="checkbox"\
					label="' + _localize("Silently install extensions from browser profile") + '"\
					hidden="' + !cmds.prefHasDefaultValue("extensions.autoDisableScopes") + '" />\
				<menuseparator cb_show="canDisableE4X" />\
				<menuitem cb_pref="javascript.options.xml.chrome"\
					type="checkbox"\
					label="' + _localize("Enable E4X for chrome") + '"\
					cb_show="canDisableE4X" />\
				<menuitem cb_pref="javascript.options.xml.content"\
					type="checkbox"\
					label="' + _localize("Enable E4X for content") + '"\
					cb_show="canDisableE4X" />\
				<menuseparator cb_show="hasMultiProcessMode" />\
				<menuitem cb_pref="browser.tabs.remote.force-enable"\
					type="checkbox"\
					label="' + _localize("Enable multi-process mode") + '"\
					oncommand="this.parentNode.parentNode.parentNode.parentNode.commands.ensureMultiProcessMode(this.getAttribute(\'checked\') == \'true\');"\
					cb_show="hasMultiProcessMode" />\
				<menuseparator cb_id="debugPrefsSeparator" hidden="true" />\
				<menu cb_id="debugPrefsExtMenu" hidden="true"\
					label="' + _localize("Debug extensions") + '"\
					accesskey="' + _localize("e", "debugExtKey") + '">\
					<menupopup cb_id="debugPrefsExtPopup" />\
				</menu>\
				<menu cb_id="debugPrefsAppMenu" hidden="true"\
					label="' + _localize("Debug application") + '"\
					accesskey="' + _localize("a", "debugAppKey") + '">\
					<menupopup cb_id="debugPrefsAppPopup" />\
				</menu>\
			</menupopup>\
		</menu>\
	</menupopup>'
));

var tb = this.parentNode;
if(tb.getAttribute("orient") == "vertical") {
	// https://addons.mozilla.org/firefox/addon/vertical-toolbar/
	var isRight = tb.parentNode.getAttribute("placement") == "right";
	mp.setAttribute("position", isRight ? "start_before" : "end_before");
}

if(!cmds.onlyPopup)
	mp.addEventListener("command", cmds, true);

const keyCbId = "custombuttons-extDevTools-key";
if(!cmds.onlyPopup) for(var kId in options.hotkeys) if(options.hotkeys.hasOwnProperty(kId)) {
	var cmd = options.hotkeys[kId];
	var key = typeof cmd == "string" ? cmd : cmd.key;
	if(!key)
		continue;
	if(cmd.hasOwnProperty("has") && !cmds[cmd.has])
		continue;
	var keyElt;
	if(cmd.hasOwnProperty("override")) {
		cmd.override.split(/,\s*/).forEach(function(id) {
			var keyElt = document.getElementById(id);
			if(!keyElt)
				return;
			// Break old key
			keyElt.setAttribute("__disabledByCBExtDevTools", "true");
			keyElt.setAttribute("key", "\xa0"); // &nbsp;
			keyElt.removeAttribute("keycode");
			keyElt.removeAttribute("modifiers");
			keyElt.removeAttribute("keytext");
		});
	}
	if(!keyset) {
		var keyset = document.getElementById("mainKeyset")
			|| document.getElementById("mailKeys")
			|| document.getElementsByTagName("keyset")[0];
	}
	keyElt = keyset.appendChild(document.createElementNS(XULNS, "key"));
	var keyId = keyElt.id = keyCbId + "-" + kId;
	keyElt.setAttribute("cb_id", keyCbId);

	var tokens = key.split(" ");
	key = tokens.pop() || " ";
	var modifiers = tokens.join(",");
	keyElt.setAttribute(
		key.substr(0, 3) == "VK_" ? "keycode" : "key",
		key
	);
	keyElt.setAttribute("modifiers", modifiers);
	keyElt._cbCommands = cmds;
	keyElt.setAttribute("oncommand", "this._cbCommands." + kId + "();");
	var mi = this.getElementsByAttribute("cb_id", cmds.cmdToId(kId))[0];
	if(mi && (!mi.hasAttribute("key") || !document.getElementById(mi.getAttribute("key"))))
		mi.setAttribute("key", keyId);
}

if(!cmds.onlyPopup) {
	cmds.setDefaultActionIcon();
	cmds.setDefaultActionTip(500);
}
if(options.restoreErrorConsole && !cmds.onlyPopup)
	cmds.initErrorConsoleRestoring();

function parseXULFromString(xul) {
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

this.attrsInspector = function(event) {
//=== Attributes Inspector begin
// http://infocatcher.ucoz.net/js/cb/attrsInspector.js
// https://forum.mozilla-russia.org/viewtopic.php?id=56041
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Attributes_Inspector

// (c) Infocatcher 2010-2019
// version 0.6.5pre2 - 2019-07-31

//===================
// Attributes Inspector button for Custom Buttons
// (for "code" section)
// Also the code can be used from main window context (as Mouse Gestures code, for example)

// Usage:
//   Use middle-click or Ctrl + left-click (or press Ctrl+I) to inspect node in DOM Inspector
//   (additionally hold Shift key to enable popup locker)
//   Hold Shift key to show and don't hide tooltips and popups
// Hotkeys:
//   Escape                - cancel or disable popup locker
//   Ctrl+Up, Ctrl+Down    - navigate to parent/child node
//   Ctrl+Left, Ctrl+Right - navigate to previous/next sibling node
//   Ctrl+Shift+C          - copy tooltip's contents
//   Ctrl+Shift+W          - inspect node's window object in DOM Inspector

// For more developer tools see Extensions Developer Tools button:
//   http://infocatcher.ucoz.net/js/cb/extDevTools.js
//   https://forum.mozilla-russia.org/viewtopic.php?id=57296
//   https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Developer_Tools

// Icon: http://www.iconsearch.ru/detailed/278/2/
//===================

(function() {
var _highlight = true; // Hightlight current node
var _highlightUsingFlasher = false; // Don't modify DOM, but has some side effects (and slower)
// Note: inIFlasher works in Firefox 4+ only with disabled hardware acceleration!
// See https://bugzilla.mozilla.org/show_bug.cgi?id=368608 and https://bugzilla.mozilla.org/show_bug.cgi?id=594299
// Also inIFlasher not available in Firefox 33+, see https://bugzilla.mozilla.org/show_bug.cgi?id=1018324
var _borderColor = "red"; // Any valid CSS color
var _borderWidth = 1; // Border width in pixels
var _borderStyle = "solid"; // border-style property in CSS
// Note: doesn't work with _highlightUsingFlasher = true

// Highlight added/removed/changed attributes, any valid CSS color:
var _addedColor = "-moz-hyperlinktext";
var _removedColor = "grayText";
var _changedColor = "-moz-visitedhyperlinktext";

var _maxTooltipWidth = 600; // Max width in px, 0 to not force limits

var _excludeChildTextNodes = 1;
// 0 - don't exclude
// 1 - exclude, if found element node
// 2 - always exclude
var _excludeSiblingTextNodes = false;

var _useCycleNavigation = false;
// Use cycle navigation for sibling nodes: first -> second -> ... -> last --> first

var _preferNotAnonymousChildNodes = false;
// true  - use not anonymous child nodes, if any (as in version 0.6.1pre and older)
// false - always try get real child nodes (may work wrong in Gecko < 7.0)

var _forbidTooltips = true; // Prevent all other tooltips
var _popupLocker = 1;
// Lock all popups in window while DOM Inspector is opened (or until Escape was not pressed)
// Values: 0 - disable, 1 - only if Shift pressed, 2 - always enable
var _showNamespaceURI = 2; // 0 - don't show, 1 - show as is, 2 - show pretty name instead of URI
var _showMargins = 3; // 0 - don't show, 1 - only if Shift pressed, 2 - only if Shift pressed + auto update, 3 - always show
var _showFullTree = 2; // 0 - current frame, 1 - top frame, 2 - topmost frame
// Note: "View - Show Anonymous Content" should be checked to inspect content documents with "_showFullTree = 2"
var _nodePosition = 0.55; // Position of selected node in DOM Inspector's tree, 0..1 (-1 - don't change)

// Show debug messages in error console:
//var _debug = false;
var _debug = typeof event == "object" && event instanceof Event
	? event.shiftKey || event.ctrlKey || event.altKey || event.metaKey
	: false;

function _log(s) {
	if(!_debug)
		return _log = function(s) {};
	var cs = Components.classes["@mozilla.org/consoleservice;1"]
		.getService(Components.interfaces.nsIConsoleService);
	function ts() {
		var d = new Date();
		var ms = d.getMilliseconds();
		return d.toTimeString().replace(/^.*\d+:(\d+:\d+).*$/, "$1") + ":" + "000".substr(("" + ms).length) + ms + " ";
	}
	_log = function(s) {
		cs.logStringMessage("[Attributes Inspector]: " + ts() + " " + s);
	};
	return _log(s);
}

const _ns = "__attributesInspector";

var context;
var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	.getService(Components.interfaces.nsIWindowMediator);
var ws = wm.getEnumerator(null);
while(ws.hasMoreElements()) {
	var w = ws.getNext();
	if(_ns in w) {
		context = w[_ns];
		break;
	}
}
if(!context) {
	context = window[_ns] = {
		button: this instanceof XULElement && this.localName != "popupset" && this,
		checked: false,
		wm: wm,
		toggle: function() {
			toggle.call(context);
		},
		stop: function() {
			this.checked && this.toggle();
		}
	};
}

function ael(type, func, useCapture, target) {
	return (target || window).addEventListener(type, func, useCapture);
}
function rel(type, func, useCapture, target) {
	// Trick for Firefox 36.0a1
	if("EventTarget" in window && EventTarget.prototype && EventTarget.prototype.removeEventListener) try {
		EventTarget.prototype.removeEventListener.call(target || window, type, func, useCapture);
	}
	catch(e) {
	}
	return (target || window).removeEventListener(type, func, useCapture);
}
function defineGetter(o, p, g) {
	defineGetter = "defineProperty" in Object // Firefox >= 4.0
		? function(o, p, g) {
			Object.defineProperty(o, p, {
				get: g,
				configurable: true,
				enumerable: true
			});
		}
		: function(o, p, g) {
			Object.__defineGetter__.call(o, p, g);
		};
	return defineGetter.apply(this, arguments);
}

context.toggle();

function toggle() {
	var checked = this.checked = !this.checked;
	var btn = this.button;
	if(btn) {
		btn.checked = checked;
		if(!checked) {
			var doc = btn.ownerDocument;
			(function uncheck() { // D'oh...
				for(var node = btn.parentNode; node != doc; node = node.parentNode) {
					if(!node) { // Node was removed from document
						_log("Button was removed from document");
						var toolboxes = doc.getElementsByTagName("toolbox");
						for(var i = 0, l = toolboxes.length; i < l; ++i) {
							var toolbox = toolboxes[i];
							if("palette" in toolbox && toolbox.palette) {
								var paletteBtns = toolbox.palette.getElementsByAttribute("id", btn.id);
								var paletteBtn = paletteBtns.length && paletteBtns[0];
								if(paletteBtn && paletteBtn.getAttribute("checked") == "true") {
									_log("Uncheck pallete button");
									paletteBtn.removeAttribute("checked");
									break;
								}
							}
						}
						return;
					}
				}
				//if(!doc.getElementById("wrapper-" + btn.id)) {
				if(btn.parentNode.localName != "toolbarpaletteitem") {
					if(btn.checked != checked) {
						btn.checked = checked;
						_log("Set checked state: " + checked);
						return;
					}
					_log("Button checked state is correct");
					return;
				}
				if(!uncheck.hasOwnProperty("_logged")) {
					uncheck._logged = true;
					_log("Button is wrapped, wait...");
				}
				doc.defaultView.setTimeout(uncheck, 20);
			})();
		}
	}
	if(checked)
		init.call(this);
	else
		destroy.call(this);
}
function init() {
	var tt = this.tt = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "tooltip");
	tt.id = "__attrsInspectorTooltip";
	tt.setAttribute("orient", "vertical");
	if(_maxTooltipWidth > 0) {
		_maxTooltipWidth = Math.min(_maxTooltipWidth, (screen.availWidth || screen.width) - 20) + "px";
		tt.style.maxWidth = _maxTooltipWidth;
	}
	//if("pointerEvents" in tt.style)
	//	tt.style.pointerEvents = "none";
	tt.setAttribute("mousethrough", "always");
	top.document.documentElement.appendChild(tt);

	var tts = tt.style;
	// Trick to force repaint tooltip, see https://github.com/Infocatcher/Custom_Buttons/issues/25
	tts.opacity = "0.99";

	// Resolve -moz-* and system colors (for copy tooltip contents feature)
	var ttcs = top.getComputedStyle(tt, null);
	tts.color = _addedColor;
	_addedColor = ttcs.color;
	tts.color = _removedColor;
	_removedColor = ttcs.color;
	tts.color = _changedColor;
	_changedColor = ttcs.color;
	tts.color = "";

	if(!_highlightUsingFlasher) {
		this.hlAttrNS = "urn:attrsInspectorNS";
		this.hlAttr = "__attrs_inspector_highlighted__"; // Don't use caps here - works only in Firefox 4
		var sss = this.sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
			.getService(Components.interfaces.nsIStyleSheetService);
		var cssStr = '\
			/* Attributes Inspector highlight styles */\n\
			@namespace ains url("%ns%");\n\
			%priorityHack%[ains|%attr%="true"] {\n\
				outline: %borderWidth%px %borderStyle% %borderColor% !important;\n\
				outline-offset: -%borderWidth%px !important;\n\
			}'
			.replace(/%ns%/g, this.hlAttrNS)
			.replace(/%attr%/g, this.hlAttr)
			.replace(/%borderColor%/g, _borderColor)
			.replace(/%borderWidth%/g, _borderWidth)
			.replace(/%borderStyle%/g, _borderStyle)
			.replace(/%priorityHack%/g, (function() {
				var rnd = Math.random().toFixed(16).substr(2);
				var hack = "*|*";
				for(var i = 0; i < 16; ++i)
					hack += ":not(#__priorityHack__" + rnd + "__" + i + ")";
				return hack;
			})());
		var cssURI = this.cssURI = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService)
			.newURI("data:text/css," + encodeURIComponent(cssStr), null, null);
		if(!sss.sheetRegistered(cssURI, sss.AGENT_SHEET))
			sss.loadAndRegisterSheet(cssURI, sss.AGENT_SHEET);
		if(!sss.sheetRegistered(cssURI, sss.USER_SHEET))
			sss.loadAndRegisterSheet(cssURI, sss.USER_SHEET);
	}

	this.setAllListeners = function(action) {
		var ws = this.wm.getEnumerator(null);
		while(ws.hasMoreElements())
			this.setListeners(action, ws.getNext());
	};
	this.setListeners = function(action, w) {
		var h = this.eventHandler;

		action("mouseover", h, true, w);
		action("mousemove", h, true, w);
		action("mouseout",  h, true, w);

		action("draggesture", h, true, w);
		action("dragover",    h, true, w);
		action("dragexit",    h, true, w);

		action("keydown",   h, true, w);
		action("keypress",  h, true, w);
		action("keyup",     h, true, w);

		//if(action == rel || this.inspector) {
		action("mousedown", h, true, w);
		action("mouseup",   h, true, w);
		action("click",     h, true, w);
		//}

		action("popupshown", h, true, w);
		if(_forbidTooltips) {
			action("popupshowing", h, true, w);
			action("popuphiding",  h, true, w);
		}
	};
	this.ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
		.getService(Components.interfaces.nsIWindowWatcher);

	this.eventHandler = {
		context: this,
		window: window,
		_hl: null,
		_node: null,
		_nodes: [],
		handleEvent: function(e) {
			this[e.type + "Handler"](e);
		},
		e: function(nn) {
			return document.createElementNS("http://www.w3.org/1999/xhtml", nn);
		},
		s: function(v, tag) {
			var s = this.e(tag || "span");
			s.appendChild(document.createTextNode(v));
			return s;
		},
		getHeader: function(v, state) {
			var e = this.s(v, "strong");
			e.className = "attrsInspector-header";
			state && this.setState(e, state);
			return e;
		},
		get separator() {
			var sep = this._separator = this.s(" = ");
			sep.className = "attrsInspector-separator";
			defineGetter(this, "separator", function() {
				return this._separator.cloneNode(true);
			});
			return this.separator;
		},
		get space() {
			var sp = this._space = this.s(" ");
			sp.className = "attrsInspector-space";
			defineGetter(this, "space", function() {
				return this._space.cloneNode(true);
			});
			return this.space;
		},
		get colon() {
			var col = this._colon = this.s(": ");
			col.className = "attrsInspector-colon";
			defineGetter(this, "colon", function() {
				return this._colon.cloneNode(true);
			});
			return this.colon;
		},
		getValue: function(v, state) {
			var e = this.s(v);
			//e.style.whiteSpace = "pre";
			e.className = "attrsInspector-value";
			state && this.setState(e, state);
			return e;
		},
		setState: function(e, state) {
			if(state.isRemoved) {
				e.style.color = _removedColor;
				e.style.textDecoration = "line-through";
				e.className += " attrsInspector-removed";
			}
			if(state.isAdded) {
				e.style.color = _addedColor;
				e.className += " attrsInspector-added";
			}
			if(state.isChanged) { // Can be added and changed!
				e.style.color = _changedColor;
				e.className += " attrsInspector-changed";
			}
		},
		get overflowBox() {
			var overflowBox = this._overflowBox = this.e("div");
			overflowBox.style.overflow = "hidden";
			overflowBox.className = "attrsInspector-itemContainer";

			var item = this.e("div");
			item.style.lineHeight = "1.25";
			item.style.maxHeight = "12.5em";
			// Note: max-width for tooltip itself may not work with classic windows theme
			if(_maxTooltipWidth)
				item.style.maxWidth = _maxTooltipWidth;
			item.className = "attrsInspector-item";

			overflowBox.appendChild(item);

			defineGetter(this, "overflowBox", function() {
				return this._overflowBox.cloneNode(true);
			});
			return this.overflowBox;
		},
		getItem: function(header, value, separator, state) {
			var overflowBox = this.overflowBox;
			var item = overflowBox.firstChild;
			item.appendChild(this.getHeader(header, state));
			if(value) {
				item.appendChild(separator || this.separator);
				item.appendChild(this.getValue(value, state));
			}
			return overflowBox;
		},
		_setDataLast: [0, 0, 0, 0, 0], // Array length - count of fast updates
		_setDataMinDelay: 750, // Delay between two series of fast updates
		_setDataScheduled: false,
		setDataProxy: function(node) {
			if(this._setDataScheduled)
				return;
			var dt = this._setDataLast[0] + this._setDataMinDelay - Date.now();
			if(dt > 0) {
				this._setDataScheduled = true;
				this.timer(function() {
					this._setDataScheduled = false;
					if(node == this._node) {
						this.setData(node);
						this.setDataProxyTime();
					}
				}, this, dt);
				return;
			}
			this.setData(node);
			this.setDataProxyTime();
		},
		setDataProxyTime: function() {
			var a = this._setDataLast;
			a.push(Date.now());
			a.shift();
		},
		_hasData: false,
		setData: function(node) {
			var tt = this.context.tt;
			this._hasData = true;

			var _this = this;
			var df = tt.ownerDocument.createDocumentFragment();
			function flush() {
				tt.textContent = "";
				// Firefox sometimes sets width/height to limit very huge tooltip
				tt.removeAttribute("width");
				tt.removeAttribute("height");
				tt.appendChild(df);
				if("state" in tt && tt.state == "closed") // Strange things happens
					_this.mousemoveHandler(); // Force show
			}

			if(node.nodeType == node.DOCUMENT_NODE) {
				df.appendChild(this.getItem(node.nodeName));
				df.appendChild(this.getItem("documentURI", node.documentURI, this.colon));
				node.title && df.appendChild(this.getItem("title", node.title, this.colon));
				var doctype = "doctype" in node && node.doctype;
				if(doctype && doctype == node.firstChild) {
					var dt;
					if(doctype.name == "html" && doctype.publicId == "" && doctype.systemId == "")
						dt = "HTML5";
					else if(doctype.publicId)
						dt = ("" + doctype.publicId).replace(/^-\/\/W3C\/\/DTD\s+|\/\/EN$/ig, "");
					else
						dt = doctype.systemId;
					df.appendChild(this.getItem("doctype", dt, this.colon));
				}
				if("contentType" in node)
					df.appendChild(this.getItem("contentType", node.contentType, this.colon));
				if("characterSet" in node)
					df.appendChild(this.getItem("characterSet", node.characterSet, this.colon));
				if("compatMode" in node)
					df.appendChild(this.getItem("compatMode", node.compatMode, this.colon));
				if("lastModified" in node) {
					var dt = new Date(node.lastModified);
					var dts = isNaN(dt.getTime()) ? node.lastModified : dt.toLocaleString();
					df.appendChild(this.getItem("lastModified", dts, this.colon));
				}
				if("designMode" in node && node.designMode != "off")
					df.appendChild(this.getItem("designMode", node.designMode, this.colon));
				flush();
				return;
			}

			var rect = this.getRect(node);
			var w = rect && rect.width;
			var h = rect && rect.height;
			if(!w && !h)
				df.appendChild(this.getItem(node.nodeName));
			else {
				//if(Math.floor(w) != w)
				if(/\.\d{4,}$/.test(w))
					w = w.toFixed(3);
				//if(Math.floor(h) != h)
				if(/\.\d{4,}$/.test(h))
					h = h.toFixed(3);
				df.appendChild(this.getItem(node.nodeName, "[" + w + "\xd7" + h + "]", this.space));
			}

			var nodeNS = node.namespaceURI;
			if(_showNamespaceURI/* && node.nodeName.indexOf(":") == -1*/)
				df.appendChild(this.getItem("namespaceURI", this.getNS(nodeNS), this.colon));

			var win = node.ownerDocument.defaultView;
			if(_showMargins && node instanceof Element) {
				var cs = win.getComputedStyle(node, null);
				var dirs = ["Top", "Right", "Bottom", "Left"];
				var getMargins = function(prop, propAdd) {
					if(!propAdd)
						propAdd = "";
					var margins = dirs.map(function(dir, i) {
						var margin = cs[prop + dir + propAdd];
						if(margin == "0px")
							return "0";
						if(/\.\d{4,}px$/.test(margin))
							return parseFloat(margin).toFixed(3) + "px";
						return margin;
					});
					if(margins[0] == margins[2] && margins[1] == margins[3]) {
						if(margins[0] == margins[1])
							return margins[0];
						return margins[0] + " " + margins[1];
					}
					return margins.join(" ");
				}
				var boxSizing = "boxSizing" in cs ? cs.boxSizing : cs.MozBoxSizing;
				var boxSizingNote = " *box-sizing";
				var styles = {
					margin: getMargins("margin"),
					border: getMargins("border", "Width") + (
						boxSizing == "border-box"
							&& nodeNS != "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
						? boxSizingNote
						: ""
					),
					padding: getMargins("padding")
						+ (boxSizing == "padding-box" ? boxSizingNote : ""),
					__proto__: null
				};
				var prevStyles = this.prevStyles;
				var changedStyles = this.changedStyles;
				for(var p in prevStyles)
					if(styles[p] != prevStyles[p])
						changedStyles[p] = true;
				for(var p in styles)
					prevStyles[p] = styles[p];
				if(_showMargins >= 3 || this._shiftKey) {
					df.appendChild(this.getItem("margin", styles.margin, this.colon, {
						isChanged: "margin" in changedStyles
					}));
					df.appendChild(this.getItem("border", styles.border, this.colon, {
						isChanged: "border" in changedStyles
					}));
					df.appendChild(this.getItem("padding", styles.padding, this.colon, {
						isChanged: "padding" in changedStyles
					}));
				}
			}

			if(!node.attributes) {
				df.appendChild(this.getItem("nodeValue", node.nodeValue, this.colon));
				flush();
				return;
			}

			var topAttrs = ["id", "class"].reverse();
			if(this._node) {
				var addedAttrs   = this.addedAttrs;
				var removedAttrs = this.removedAttrs;
				var changedAttrs = this.changedAttrs;
			}
			else {
				addedAttrs = removedAttrs = changedAttrs = { __proto__: null };
			}

			var attrs = Array.prototype.slice.call(node.attributes);
			for(var name in removedAttrs)
				attrs.push(removedAttrs[name]);

			attrs.sort(function(a, b) {
				a = a.name;
				b = b.name;
				var ai = topAttrs.indexOf(a);
				var bi = topAttrs.indexOf(b);
				if(ai != -1 || bi != -1)
					return bi - ai;
				return a > b;
			}).forEach(function(attr) {
				var name = attr.name;
				var val = attr.value;
				var ns = attr.namespaceURI;
				if(!_highlightUsingFlasher) {
					if(name == this.context.hlAttr && ns == this.context.hlAttrNS)
						return;
					if(this.noStyles && name == "style") {
						val = this._oldStyle;
						if(val === false)
							return;
					}
				}
				if(_showNamespaceURI && ns && ns != nodeNS && name.indexOf(":") == -1)
					name += " [" + this.getNS(ns) + "]";
				df.appendChild(this.getItem(name, val, this.separator, {
					isAdded:   name in addedAttrs && addedAttrs[name] == ns,
					isChanged: name in changedAttrs && changedAttrs[name] == ns,
					isRemoved: name in removedAttrs && removedAttrs[name].namespaceURI == ns
				}));
			}, this);
			flush();
		},
		getRect: function(node) {
			return this.getScreenRect(node, 1);
		},
		getScreenRect: function(node, scale) {
			var win = node.ownerDocument.defaultView;
			if(!scale) try {
				var dwu = "windowUtils" in win && win.windowUtils instanceof Components.interfaces.nsIDOMWindowUtils
					? win.windowUtils // Firefox 63+
					: win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						.getInterface(Components.interfaces.nsIDOMWindowUtils);
				scale = dwu.screenPixelsPerCSSPixel || 1;
			}
			catch(e) {
				Components.utils.reportError(e);
				scale = 1;
			}

			if(!(node instanceof Element)) try {
				var rng = node.ownerDocument.createRange();
				rng.selectNodeContents(node);
				node = rng;
			}
			catch(e) {
				Components.utils.reportError(e);
			}

			if("getBoundingClientRect" in node) {
				var rect = node.getBoundingClientRect();
				return {
					x: rect.left*scale,
					y: rect.top*scale,
					screenX: (rect.left + win.mozInnerScreenX)*scale,
					screenY: (rect.top + win.mozInnerScreenY)*scale,
					width: (rect.right - rect.left)*scale,
					height: (rect.bottom - rect.top)*scale
				};
			}

			try {
				var bo = node instanceof XULElement && node.boxObject
					|| node.ownerDocument && "getBoxObjectFor" in node.ownerDocument
						&& node.ownerDocument.getBoxObjectFor(node);
			}
			catch(e) {
			}
			if(bo) {
				if(!("width" in bo)) {
					bo.width = bo.right - bo.left;
					bo.height = bo.bottom - bo.top;
				}
				return {
					x: bo.x*scale,
					y: bo.y*scale,
					screenX: bo.screenX*scale,
					screenY: bo.screenY*scale,
					width: bo.width*scale,
					height: bo.height*scale
				};
			}
			return null;
		},
		isNodeVisible: function(node, rect) {
			if(!rect)
				rect = this.getRect(node);
			if(rect.width == 0 && rect.height == 0)
				return false;
			for(var p = node; p; p = p.parentNode) {
				if(
					p instanceof XULElement
					&& (p.localName == "menupopup" || p.localName == "popup")
					&& "state" in p
					&& p.state == "closed"
				)
					return false;
			}
			return true;
		},
		getNS: function(ns) {
			if(_showNamespaceURI == 2) switch(ns) {
				case "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul": return "XUL";
				case "http://www.w3.org/1999/xhtml":                                  return "XHTML";
				case "http://www.mozilla.org/xbl":                                    return "XBL";
				case "http://www.w3.org/2000/svg":                                    return "SVG";
				case "http://www.w3.org/1998/Math/MathML":                            return "MathML";
				case "http://www.w3.org/1999/xlink":                                  return "XLink";
				case "http://www.w3.org/2000/xmlns/":                                 return "XMLNS";
				case "http://www.w3.org/XML/1998/namespace":                          return "XML";
				case "http://www.w3.org/1999/XSL/Transform":                          return "XSLT";
				case "http://www.w3.org/1999/02/22-rdf-syntax-ns":                    return "RDF";
				case "http://www.w3.org/2001/xml-events":                             return "XML Events";
			}
			return "" + ns; // Can be null for #text
		},
		stop: function() {
			this.context.stop();
		},
		canInspect: function(e) {
			var noMdf = /*!e.shiftKey && */!e.altKey && !e.metaKey;
			if(!_forbidTooltips && e.shiftKey)
				return false;
			return e.button == 1 && noMdf && !e.ctrlKey // Middle-click
			    || e.button == 0 && noMdf &&  e.ctrlKey; // Ctrl + left-click
		},
		get appInfo() {
			delete this.appInfo;
			return this.appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
				.getService(Components.interfaces.nsIXULAppInfo);
		},
		get fxVersion() {
			delete this.fxVersion;
			var pv = this.appInfo.platformVersion;
			var v = parseFloat(pv);
			if(this.appInfo.name == "Pale Moon" || this.appInfo.name == "Basilisk")
				return this.fxVersion = v >= 4.1 ? 56 : 28;
			// https://developer.mozilla.org/en-US/docs/Mozilla/Gecko/Versions
			if(v < 5) {
				var vc = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
					.getService(Components.interfaces.nsIVersionComparator);
				if(vc.compare(pv, "2.0a1pre") >= 0)
					v = 4.0;
				else if(vc.compare(pv, "1.9.2a1pre") >= 0)
					v = 3.6;
				else if(vc.compare(pv, "1.9.1a1pre") >= 0)
					v = 3.5;
				else if(vc.compare(pv, "1.9a1pre") >= 0)
					v = 3.0;
				else if(vc.compare(pv, "1.8.1a1pre") >= 0)
					v = 2.0;
				else //if(vc.compare(pv, "1.8a1pre") >= 0)
					v = 1.5;
			}
			return this.fxVersion = v;
		},
		get noStyles() {
			delete this.noStyles;
			//return this.noStyles = this.fxVersion < 3;
			return this.noStyles = Components.ID("{41d979dc-ea03-4235-86ff-1e3c090c5630}")
				.equals(Components.interfaces.nsIStyleSheetService);
		},
		stopEvent: function(e) {
			try {
				e.preventDefault();
				e.stopPropagation();
				"stopImmediatePropagation" in e && e.stopImmediatePropagation();
			}
			catch(e) { // e10s: TypeError: 'preventDefault' called on an object that does not implement interface Event.
				if(_debug || ("" + e).indexOf("does not implement interface") == -1)
					Components.utils.reportError(e);
			}
			//_log("stopEvent: " + e.type);
		},
		_timers: { __proto__: null },
		_timersCounter: 0,
		get Timer() {
			delete this.Timer;
			return this.Timer = Components.Constructor("@mozilla.org/timer;1", "nsITimer");
		},
		timer: function(callback, context, delay, args) {
			var id = ++this._timersCounter;
			var _timers = this._timers;
			var timer = new this.Timer();
			timer.init({
				observe: function(subject, topic, data) {
					delete _timers[id];
					callback.apply(context, args);
				}
			}, delay || 0, timer.TYPE_ONE_SHOT);
			return id;
		},
		cancelTimer: function(id) {
			var _timers = this._timers;
			if(id in _timers) {
				_timers[id].cancel();
				delete _timers[id];
			}
		},
		destroyTimers: function() {
			var _timers = this._timers;
			for(var id in _timers)
				_timers[id].cancel();
			this._timers = { __proto__: null };
			this._timersCounter = 0;
		},
		get flasher() {
			try { // Will be removed in Gecko 33+, see https://bugzilla.mozilla.org/show_bug.cgi?id=1018324
				var flasher = Components.classes["@mozilla.org/inspector/flasher;1"]
					.getService(Components.interfaces.inIFlasher);
				flasher.color = _borderColor;
				flasher.thickness = _borderWidth;
				flasher.invert = false;
			}
			catch(e) {
				_log("inIFlasher not available");
				Components.utils.reportError(e);
			}
			delete this.flasher;
			return this.flasher = flasher;
		},
		hl: function(node) {
			if(!_highlight)
				return;
			this.unhl(); // Only one highlighted node
			if(!("setAttributeNS" in node))
				return;
			this._hl = node;

			if(_highlightUsingFlasher) {
				this.flasher.drawElementOutline(node);
				this._hlInterval = node.ownerDocument.defaultView.setInterval(function(_this) {
					_this.flasher.drawElementOutline(node);
				}, 10, this);
				return;
			}

			if(node.hasAttributeNS(this.context.hlAttrNS, this.context.hlAttr))
				return;
			if(this.noStyles) {
				this._oldStyle = node.hasAttribute("style") && node.getAttribute("style");
				node.style.outline = _borderWidth + "px " + _borderStyle + " " + _borderColor;
				node.style.outlineOffset = "-" + _borderWidth + "px";
			}
			node.setAttributeNS(this.context.hlAttrNS, this.context.hlAttr, "true");
		},
		unhl: function() {
			var node = this._hl;
			if(!node)
				return;
			this._hl = null;
			try {
				if(!("removeAttributeNS" in node))
					return;
			}
			catch(e) { // TypeError: can't access dead object
				return;
			}

			if(_highlightUsingFlasher) {
				var win = node.ownerDocument.defaultView;
				win.clearInterval(this._hlInterval);
				this.flasher.repaintElement(node);
				//this.flasher.repaintElement(node.ownerDocument.documentElement);
				this.flasher.repaintElement(this.getTopWindow(win).document.documentElement);
				return;
			}

			if(this.noStyles) {
				if(this._oldStyle === false)
					node.removeAttribute("style");
				else
					node.setAttribute("style", this._oldStyle);
			}
			node.removeAttributeNS(this.context.hlAttrNS, this.context.hlAttr);
		},

		get mutationObserver() {
			delete this.mutationObserver;
			return this.mutationObserver = "MutationObserver" in this.window // Firefox 14+
				&& new this.window.MutationObserver(this.handleMutations.bind(this));
		},
		watchAttrs: function(node) {
			this.unwatchAttrs(); // Only one watched node
			this._node = node;

			this.addedAttrs   = { __proto__: null };
			this.removedAttrs = { __proto__: null };
			this.changedAttrs = { __proto__: null };

			var mo = this.mutationObserver;
			if(mo) {
				// http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#mutation-observers
				try {
					mo.observe(node, {
						attributes: true,
						attributeOldValue: true
					});
				}
				catch(e) { // e10s: Argument 1 of MutationObserver.observe does not implement interface Node.
					if(_debug || ("" + e).indexOf("does not implement interface") == -1)
						Components.utils.reportError(e);
				}
				return;
			}
			// Legacy version
			var aw = this;
			if(this.fxVersion == 2) { // Hack for Firefox 2.0
				aw = this._attrsWatcher = {
					parent: this,
					handleEvent: function(e) {
						this.parent.DOMAttrModifiedHandler(e);
					}
				};
			}
			ael("DOMAttrModified", aw, true, node);
		},
		unwatchAttrs: function() {
			if(!this._node)
				return;
			var mo = this.mutationObserver;
			if(mo)
				mo.disconnect();
			else
				rel("DOMAttrModified", this._attrsWatcher || this, true, this._node);
			this._node = this._attrsWatcher = null;
			this.addedAttrs = this.removedAttrs = this.changedAttrs = null;
		},
		handleMutations: function(mutations) {
			mutations.forEach(function(mutation) {
				var node = mutation.target;
				if(mutation.type != "attributes" || node != this._node)
					return;
				var attrName = mutation.attributeName;
				var attrNS = mutation.attributeNamespace;
				var oldVal = mutation.oldValue;
				var isAdded = oldVal === null;
				var isRemoved = !node.hasAttributeNS(attrNS, attrName);
				this.handleMutation(attrName, attrNS, isAdded, isRemoved, oldVal);
			}, this);
			this.setDataProxy(this._node);
		},
		DOMAttrModifiedHandler: function(e) {
			if(e.originalTarget != this._node) // Ignore mutations in child nodes
				return;
			this.handleMutation(
				e.attrName,
				e.relatedNode && e.relatedNode.namespaceURI || null,
				e.attrChange == e.ADDITION,
				e.attrChange == e.REMOVAL,
				e.prevValue
			);
			this.setDataProxy(this._node);
		},
		handleMutation: function(attrName, attrNS, isAdded, isRemoved, oldValue) {
			if(isAdded) {
				this.addedAttrs[attrName] = attrNS;
				delete this.removedAttrs[attrName];
				delete this.changedAttrs[attrName];
			}
			else if(isRemoved) {
				this.removedAttrs[attrName] = {
					name: attrName,
					value: oldValue,
					namespaceURI: attrNS
				};
				delete this.addedAttrs[attrName];
				delete this.changedAttrs[attrName];
			}
			else {
				this.changedAttrs[attrName] = attrNS;
				delete this.removedAttrs[attrName]; // ?
			}
		},

		setClipboardData: function(dataObj, sourceWindow, clipId) {
			var ta = Components.classes["@mozilla.org/widget/transferable;1"]
				.createInstance(Components.interfaces.nsITransferable);
			if(sourceWindow && "init" in ta) {
				// The clipboard will be cleared when private browsing mode ends,
				// removed in Firefox 41+ https://bugzilla.mozilla.org/show_bug.cgi?id=1166840
				// QueryInterface removed in Firefox 70+ https://bugzilla.mozilla.org/show_bug.cgi?id=1568585
				var privacyContext = sourceWindow.QueryInterface && sourceWindow
					.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIWebNavigation)
					.QueryInterface(Components.interfaces.nsILoadContext);
				ta.init(privacyContext || null);
			}
			for(var flavor in dataObj) if(dataObj.hasOwnProperty(flavor)) {
				var value = dataObj[flavor];
				var str = Components.classes["@mozilla.org/supports-string;1"]
					.createInstance(Components.interfaces.nsISupportsString);
				str.data = value;
				ta.addDataFlavor(flavor);
				ta.setTransferData(flavor, str, value.length * 2);
			}
			var cb = Components.classes["@mozilla.org/widget/clipboard;1"]
				.getService(Components.interfaces.nsIClipboard);
			cb.setData(ta, null, clipId === undefined ? cb.kGlobalClipboard : clipId);
		},
		_noMouseover: false,
		_noMouseoverTimer: -1,
		mouseoverHandler: function(e) {
			if(this._noMouseover)
				return;
			var node = e.originalTarget;
			if(node == this.context.tt)
				return;
			this._nodes = [node];
			this.handleNodeFromEvent(node, e);
		},
		handleNodeFromEvent: function(node, e) {
			this.hl(node);
			if(node != this._node) {
				this.prevStyles    = { __proto__: null };
				this.changedStyles = { __proto__: null };
			}
			this.setData(node);
			this.watchAttrs(node);
			this.mousemoveHandler(e);
		},
		handleNode: function(node) {
			// Tooltip with big height -> wrongly under cursor -> reposition -> mouseover
			// And setTimeout() in parent window fail for modal child window
			if(this._noMouseover)
				this.cancelTimer(this._noMouseoverTimer);
			this._noMouseover = true;

			this.handleNodeFromEvent(node);

			this._noMouseoverTimer = this.timer(function() {
				this._noMouseover = false;
				this._noMouseoverTimer = null;
			}, this, 200);
		},
		mousemoveHandler: function(e) {
			var tt = this.context.tt;

			if(!this._hasData) {
				this.mouseoverHandler(e);
				return;
			}

			var x, y;
			if(e) {
				x = e.screenX;
				y = e.screenY;
				if(
					"_lastScreenX" in this
					&& x == this._lastScreenX
					&& y == this._lastScreenY
				)
					return;

				this._lastScreenX = x;
				this._lastScreenY = y;

				this._shiftKey = e.shiftKey;
			}
			else {
				x = this._lastScreenX || 0;
				y = this._lastScreenY || 0;
			}

			var fxVersion = this.fxVersion;

			if(fxVersion <= 2) {
				// Ugly workaround...
				var text = Array.prototype.map.call(tt.childNodes, function(node) {
					return node.textContent;
				}).join("\n");
				tt.textContent = "";
				var d = this.e("div");
				d.style.whiteSpace = "-moz-pre-wrap";
				d.textContent = text;
				tt.height = null;
				tt.appendChild(d);
				tt.height = tt.boxObject.height;
			}

			if("openPopupAtScreen" in tt) // Firefox 3.0+
				tt.openPopupAtScreen(x, y, false /*isContextMenu*/);
			else
				tt.showPopup(document.documentElement, x, y, "tooltip", null, null);

			if(fxVersion <= 2)
				return;
			if(fxVersion <= 3.5) {
				x = Math.min(screen.width  - tt.boxObject.width,  x);
				y = Math.min(screen.height - tt.boxObject.height, y);
				var debo = document.documentElement.boxObject;
				x += debo.screenX;
				y += debo.screenY;
			}
			if(fxVersion != 3.6)
				y += 22;
			tt.moveTo(x, y);
		},
		mouseoutHandler: function(e) {
			if(!e.relatedTarget)
				this.context.tt.hidePopup();
			this.unwatchAttrs();
			this.unhl();
		},
		draggestureHandler: function(e) {
			this.makeTooltipTopmost();
			_log(e.type + " => make tooltip topmost");
		},
		dragoverHandler: function(e) {
			var node = e.originalTarget || e.target;
			if(node != this._node)
				this.mouseoverHandler(e);
			else
				this.mousemoveHandler(e);
		},
		dragexitHandler: function(e) {
			if(!e.relatedTarget && this._node)
				this.mouseoutHandler(e);
		},
		keydownHandler: function(e) {
			this._shiftKey = e.shiftKey;
			this.keypressHandler.apply(this, arguments);
		},
		keyupHandler: function(e) {
			this._shiftKey = e.shiftKey;
			this.keypressHandler.apply(this, arguments);
		},
		keypressHandler: function(e) {
			// See https://github.com/Infocatcher/Custom_Buttons/issues/12
			// keydown  => stopEvent() + hetkey action in Firefox >= 25
			// keypress => stopEvent() + hetkey action in Firefox < 25
			// keyup    => stopEvent()
			var onlyStop = this.fxVersion < 25
				? e.type == "keydown" || e.type == "keyup"
				: e.type == "keypress" || e.type == "keyup";
			//_log(e.type + ": keyCode: " + e.keyCode + " charCode: " + e.charCode);
			if(e.keyCode == e.DOM_VK_ESCAPE) {
				this.stopEvent(e);
				if(onlyStop)
					return;
				this.stopSingleEvent(e, "keyup");
				this.stop();
				return;
			}
			var ctrlOrCtrlShift = (e.ctrlKey || e.metaKey) && !e.altKey;
			var ctrl      = ctrlOrCtrlShift && !e.shiftKey;
			var ctrlShift = ctrlOrCtrlShift &&  e.shiftKey;
			if(!ctrlOrCtrlShift)
				return;

			if(!_forbidTooltips)
				ctrlOrCtrlShift = ctrl;

			if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_UP) { // Ctrl+Up
				this.stopEvent(e);
				if(!onlyStop)
					this.navigateUp();
			}
			else if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_DOWN) { // Ctrl+Down
				this.stopEvent(e);
				if(!onlyStop)
					this.navigateDown();
			}
			if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_RIGHT) { // Ctrl+Right
				this.stopEvent(e);
				if(!onlyStop)
					this.navigateNext();
			}
			else if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_LEFT) { // Ctrl+Left
				this.stopEvent(e);
				if(!onlyStop)
					this.navigatePrev();
			}
			else if( // Ctrl+Shift+C
				ctrlShift && (
					e.keyCode == e.DOM_VK_C // keydown || keyup
					|| e.keyCode == 0 && String.fromCharCode(e.charCode).toUpperCase() == "C" // keypress
				)
			) {
				this.stopEvent(e);
				if(!onlyStop)
					this.copyTootipContent();
			}
			else if( // Ctrl+I, Ctrl+Shift+I
				ctrlOrCtrlShift && (
					e.keyCode == e.DOM_VK_I // keydown || keyup
					|| e.keyCode == 0 && String.fromCharCode(e.charCode).toUpperCase() == "I" // keypress
				)
			) {
				this._checkPreventDefault(e);
				this.stopEvent(e);
				if(onlyStop)
					return;
				this.stopSingleEvent(e, "keyup");
				var nodes = this._nodes;
				var node = nodes.length && nodes[0];
				node && this.inspect(node, e.shiftKey);
			}
			else if( // Ctrl+Shift+W
				ctrlShift && (
					e.keyCode == e.DOM_VK_W // keydown || keyup
					|| e.keyCode == 0 && String.fromCharCode(e.charCode).toUpperCase() == "W" // keypress
				)
			) {
				this._checkPreventDefault(e);
				this.stopEvent(e);
				if(onlyStop)
					return;
				this.stopSingleEvent(e, "keyup");
				var nodes = this._nodes;
				var node = nodes.length && nodes[0];
				if(node) {
					this.stop();
					this.hideUnclosedPopups();
					this.closeMenus(node);
					this.inspectWindow(node);
				}
			}
		},
		navigateUp: function() {
			var nodes = this._nodes;
			var node = nodes.length && this.getParentNode(nodes[0]);
			if(node) {
				nodes.unshift(node);
				this.handleNode(node);
			}
		},
		navigateDown: function() {
			var nodes = this._nodes;
			if(nodes.length > 1) {
				nodes.shift();
				this.handleNode(nodes[0]);
			}
			else if(nodes.length == 1) {
				var node = nodes[0];
				var childs = this.getChildNodes(node);
				if(!childs)
					return;
				var child;
				for(var i = 0, l = childs.length; i < l; ++i) {
					var ch = childs[i];
					if(!_excludeChildTextNodes || ch instanceof Element) {
						child = ch;
						break;
					}
				}
				if(!child && _excludeChildTextNodes == 1 && l)
					child = childs[0];
				if(child) {
					this._nodes = [child];
					this.handleNode(child);
				}
			}
		},
		navigateNext: function() {
			this.navigateSibling(true);
		},
		navigatePrev: function() {
			this.navigateSibling(false);
		},
		navigateSibling: function(toNext) {
			var nodes = this._nodes;
			if(!nodes.length)
				return;
			var node = nodes[0];
			//var sibling = node;
			//do sibling = toNext ? sibling.nextSibling : sibling.previousSibling;
			//while(_excludeSiblingTextNodes && sibling && !(sibling instanceof Element));
			var parent = this.getParentNode(node);
			var siblings = parent && this.getChildNodes(parent, node);
			if(!siblings || siblings.length < 2)
				return;
			var max = siblings.length - 1;
			var pos = Array.prototype.indexOf.call(siblings, node);
			if(pos == -1)
				return;
			var shift = toNext ? 1 : -1;
			var sibling;
			for(var i = pos + shift; ; i += shift) {
				if(_useCycleNavigation) {
					if(i < 0)
						i = max;
					else if(i > max)
						i = 0;
					if(i == pos)
						break;
				}
				if(i < 0 || i > max)
					break;
				var sb = siblings[i];
				if(sb && (!_excludeSiblingTextNodes || sb instanceof Element)) {
					sibling = sb;
					break;
				}
			}
			if(!sibling)
				return;
			// Update screen position for mousemoveHandler()
			var rect = this.getScreenRect(sibling);
			if(
				rect
				&& (this.fxVersion < 3 || this.fxVersion > 3.5)
				&& this.isNodeVisible(sibling, rect) // Wrong coordinates for hidden nodes
			) {
				var x = rect.screenX;
				var y = rect.screenY + rect.height;
				if(x != undefined && y != undefined) {
					this._lastScreenX = x;
					this._lastScreenY = y - 22 + 8;
				}
			}
			this._nodes = [sibling];
			this.handleNode(sibling);
		},
		get domUtils() {
			delete this.domUtils;
			return this.domUtils = "inIDOMUtils" in Components.interfaces
				? Components.classes["@mozilla.org/inspector/dom-utils;1"]
					.getService(Components.interfaces.inIDOMUtils)
				: InspectorUtils; // Firefox 59+
		},
		getParentNode: function(node) {
			try {
				var pn = this.domUtils.getParentForNode(node, true);
			}
			catch(e) {
				if(("" + e).indexOf("NS_ERROR_XPC_CANT_PASS_CPOW_TO_NATIVE") == -1)
					Components.utils.reportError(e);
				pn = node.parentNode;
			}
			if(!pn && node.nodeType == Node.DOCUMENT_NODE) { // Firefox 1.5?
				pn = node.defaultView.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIWebNavigation)
					.QueryInterface(Components.interfaces.nsIDocShell)
					.chromeEventHandler;
			}
			return pn;
		},
		getTopWindow: function(node) {
			var win = node.ownerDocument && node.ownerDocument.defaultView
				|| node.defaultView
				|| node;
			//for(;;) {
			//	var browser = this.domUtils.getParentForNode(win.document, true);
			//	if(!browser)
			//		break;
			//	win = browser.ownerDocument.defaultView.top;
			//}
			try {
				return "QueryInterface" in win
					? win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						.getInterface(Components.interfaces.nsIWebNavigation)
						.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
						.rootTreeItem
						.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						.getInterface(Components.interfaces.nsIDOMWindow)
					: win.docShell.rootTreeItem.domWindow; // Firefox 70+
			}
			catch(e) {
				Components.utils.reportError(e);
			}
			return win;
		},
		getChildNodes: function(node, child) {
			if(_preferNotAnonymousChildNodes) {
				var childNodes = node.childNodes;
				if(!childNodes.length && "getAnonymousNodes" in node.ownerDocument)
					childNodes = node.ownerDocument.getAnonymousNodes(node);
				return childNodes;
			}
			var du = this.domUtils;
			if("getChildrenForNode" in du) try { // Gecko 7.0+
				return du.getChildrenForNode(node, true);
			}
			catch(e) {
				if(("" + e).indexOf("NS_ERROR_XPC_CANT_PASS_CPOW_TO_NATIVE") == -1)
					Components.utils.reportError(e);
				//return node.childNodes;
			}
			var childNodes = node instanceof XULElement
				&& "getAnonymousNodes" in node.ownerDocument
				&& node.ownerDocument.getAnonymousNodes(node)
				|| node.childNodes;
			// We can't get child nodes of anonymous node...
			if(!childNodes || !childNodes.length) {
				if(!child)
					child = node.firstChild;
				if(!child) { // Get nearest not anonymous parent
					for(var p = node.parentNode; p; p = p.parentNode)
						if(p.childNodes.length)
							return p.childNodes;
				}
				if(child) {
					var childNodes = [child];
					var sibling = child;
					while((sibling = sibling.previousSibling))
						childNodes.unshift(sibling);
					sibling = child;
					while((sibling = sibling.nextSibling))
						childNodes.push(sibling);
				}
			}
			return childNodes;
		},
		get hasDOMInspector() {
			delete this.hasDOMInspector;
			return this.hasDOMInspector = "@mozilla.org/commandlinehandler/general-startup;1?type=inspector" in Components.classes;
		},
		checkDOMInspector: function() {
			if(this.hasDOMInspector)
				return true;
			_log("DOM Inspector not installed!");
			var label = this.context.button && this.context.button.label
				|| "Attributes Inspector";
			Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService)
				.alert(null, label, "DOM Inspector not found!");
			return false;
		},
		inspectNode: function(node) {
			if(!this.checkDOMInspector())
				return;

			var top = this.getTopWindow(node);
			_log("Open DOM Inspector for <" + node.nodeName + "> from " + top.location);
			if(!_showFullTree || _nodePosition < 0 || this.fxVersion < 2) {
				// See window.inspectDOMNode()
				top.openDialog("chrome://inspector/content/", "_blank", "chrome,all,dialog=no", node);
				return;
			}

			var inspWin = top.openDialog(
				"chrome://inspector/content/",
				"_blank",
				"chrome,all,dialog=no",
				_showFullTree == 0
					? node.ownerDocument || node
					: _showFullTree == 1
						? (node.ownerDocument || node).defaultView.top.document
						: (top || window.top).document
			);
			inspWin = inspWin.wrappedJSObject || inspWin; // At least for Firefox 3.0
			inspWin.addEventListener("load", function onLoad(e) {
				inspWin.removeEventListener("load", onLoad, false);
				inspect();
			}, false);

			var _this = this;
			var stopTime = Date.now() + 5e3;
			var restoreBlink = this.overrideBoolPref("inspector.blink.on", false);
			function wait() {
				if(Date.now() < stopTime)
					inspWin.setTimeout(inspect, 10);
				else
					_log("inspectNode(): take too many time");
			}
			function inspect() {
				var inspector = "inspector" in inspWin && inspWin.inspector;
				if(!inspector)
					return wait();
				try {
					// Avoid warnings in error console after getViewer("dom")
					var hash = inspector.mPanelSet.registry.mViewerHash;
					if(hash && !("dom" in hash))
						return wait();
				}
				catch(e) {
					Components.utils.reportError(e);
				}
				try {
					var viewer = inspector.getViewer("dom");
				}
				catch(e) {
					Components.utils.reportError(e);
					return wait();
				}

				_this.timer(restoreBlink);

				if("showNodeInTree" in viewer) // New DOM Inspector
					viewer.showNodeInTree(node);
				else
					viewer.selectElementInTree(node);
				if(_nodePosition >= 0) {
					if("nsITreeBoxObject" in Components.interfaces) {
						var tbo = viewer.mDOMTree.treeBoxObject;
						var visibleRows = tbo.height/tbo.rowHeight;
					}
					else { // Firefox 66+, https://bugzilla.mozilla.org/show_bug.cgi?id=1482389
						var tbo = viewer.mDOMTree;
						var visibleRows = tbo.getPageLength();
					}
					var cur = tbo.view.selection.currentIndex;
					var first = tbo.getFirstVisibleRow();
					var newFirst = cur - _nodePosition*visibleRows + 1;
					tbo.scrollByLines(Math.round(newFirst - first));
					tbo.ensureRowIsVisible(cur); // Should be visible, but...
				}
				return true;
			}
		},
		inspectWindow: function(node) {
			if(!this.checkDOMInspector())
				return;

			_log("inspectWindow(): open DOM Inspector for <" + node.nodeName + ">");
			var top = this.getTopWindow(node);
			var inspWin = top.openDialog(
				"chrome://inspector/content/",
				"_blank",
				"chrome,all,dialog=no",
				//node.ownerDocument || node
				node
			);
			inspWin = inspWin.wrappedJSObject || inspWin; // At least for Firefox 1.5
			inspWin.addEventListener("load", function onLoad(e) {
				inspWin.removeEventListener("load", onLoad, false);
				_log("inspectWindow(): DOM Inspector loaded");
				wait(_this.fxVersion == 1.5 ? 200 : 0);
			}, false);

			var _this = this;
			var stopTime = Date.now() + 5e3;
			var restoreBlink = this.overrideBoolPref("inspector.blink.on", false);
			function wait(delay) {
				if(Date.now() < stopTime)
					inspWin.setTimeout(inspect, delay || 10);
				else
					_log("inspectWindow(): take too many time");
			}
			function inspect() {
				var doc = inspWin.document;
				var panel = doc.getElementById("bxDocPanel");
				if(!panel)
					return wait();
				var js = doc.getAnonymousElementByAttribute(panel, "viewerListEntry", "8")
					|| doc.getAnonymousElementByAttribute(panel, "viewerListEntry", "7"); // DOM Inspector 1.8.1.x, Firefox 2.0.0.x
				var browser = doc.getAnonymousElementByAttribute(panel, "anonid", "viewer-iframe");
				if(!js || !browser)
					return wait();
				_this.timer(restoreBlink);
				browser.addEventListener("load", function load(e) {
					if(e.target.documentURI == "about:blank")
						return;
					browser.removeEventListener(e.type, load, true);
					stopTime = Date.now() + 3e3;
					inspWin.setTimeout(function selectWindow() {
						var brDoc = browser.contentDocument;
						var tree = brDoc && brDoc.getElementById("treeJSObject");
						if(tree && tree.view && tree.view.selection && tree.columns) {
							var keyCol = tree.columns.getKeyColumn();
							var view = tree.view;
							var rowCount = view.rowCount;
							if(rowCount == 1) { // DOM Inspector 1.8.1.x, Firefox 2.0.0.x
								tree.changeOpenState(0, true);
								rowCount = view.rowCount;
							}
							for(var i = 0; i < rowCount; ++i) {
								var cellText = view.getCellText(i, keyCol);
								if(cellText == "defaultView") {
									_log('inspectWindow(): scroll to "defaultView" entry');
									var tbo = "nsITreeBoxObject" in Components.interfaces
										? tree.treeBoxObject
										: tree; // Firefox 66+
									tbo.beginUpdateBatch();
									tree.changeOpenState(i, true);
									view.selection.select(i);
									tbo.scrollByLines(i);
									tbo.ensureRowIsVisible(i);
									tbo.endUpdateBatch();
									inspWin.setTimeout(function() { // Tree not yet loaded?
										var di = i - tbo.getFirstVisibleRow();
										if(di) {
											_log("inspectWindow(): tree changed => scrollByLines(" + di + ")");
											tbo.scrollByLines(di);
											tbo.ensureRowIsVisible(i);
										}
									}, 0);
									return;
								}
							}
						}
						if(Date.now() < stopTime)
							inspWin.setTimeout(selectWindow, 25);
					}, _this.fxVersion == 1.5 ? 50 : 0);
				}, true);
				_log("inspectWindow(): select JavaScript Object panel");
				return js.doCommand();
			}
		},
		overrideBoolPref: function(prefName, prefVal) {
			var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
			try {
				var origVal = prefs.getBoolPref(prefName);
			}
			catch(e) {
				// Firefox 58+: Remove support for extensions having their own prefs file
				// https://bugzilla.mozilla.org/show_bug.cgi?id=1413413
			}
			if(origVal == prefVal || origVal === undefined)
				return function restore() {};
			prefs.setBoolPref(prefName, prefVal);
			var _this = this;
			function restore() {
				_this.cancelTimer(timer);
				prefs.setBoolPref(prefName, origVal);
			}
			var timer = this.timer(restore, this, 3e3);
			return restore;
		},
		copyTootipContent: function() {
			var node = this._node;
			var sourceWindow = node && (node.ownerDocument || node).defaultView;
			var tt = this.context.tt;
			var text = Array.prototype.map.call(tt.childNodes, function(node) {
				return node.textContent;
			}).join("\n");
			var _tt = tt.cloneNode(true);
			Array.prototype.forEach.call(_tt.getElementsByAttribute("class", "attrsInspector-value"), function(elt) {
				elt.style.whiteSpace = "pre";
			});
			if(_tt.firstChild.style.whiteSpace == "-moz-pre-wrap") // Part of hack for Firefox 1.5 and 2.0
				_tt.firstChild.style.whiteSpace = "pre";
			var html = Array.prototype.map.call(_tt.childNodes, function(node) {
				return new XMLSerializer().serializeToString(node);
			}).join("\n");
			this.setClipboardData({
				"text/unicode": text.replace(/\r\n?|\n/g, this.lineBreak),
				"text/html":    html.replace(/\r\n?|\n/g, this.lineBreak)
			}, sourceWindow);

			if(!/(?:^|\s)attrsInspector-copied(?:\s|$)/.test(tt.className))
				tt.className += " attrsInspector-copied";
			//tt.style.opacity = "0.75";
			tt.style.color = "grayText";
			this.timer(function() {
				tt.className = tt.className
					.replace(/(?:^|\s)attrsInspector-copied(?:\s|$)/, " ")
					.replace(/\s+$/, "");
				//tt.style.opacity = "";
				tt.style.color = "";
			}, this, 150);
		},
		get lineBreak() {
			delete this.lineBreak;
			return this.lineBreak = this.appInfo.OS == "WINNT" ? "\r\n" : "\n";
		},
		stopSingleEvent: function(e, type) {
			var top = this.getTopWindow(e.target);
			var stopEvent = this.stopEvent;
			top.addEventListener(type, function handler(e) {
				top.removeEventListener(type, handler, true);
				stopEvent(e);
			}, true);
		},
		mousedownHandler: function(e) {
			if(this.canInspect(e)) {
				this._checkPreventDefault(e);
				this.stopEvent(e);
			}
		},
		mouseupHandler: function(e) {
			this.mousedownHandler.apply(this, arguments);
		},
		clickHandler: function(e) {
			if(!this.canInspect(e))
				return;
			this._checkPreventDefault(e);
			this.stopEvent(e);
			var nodes = this._nodes;
			var node = nodes.length ? nodes[0] : e.originalTarget;
			this.inspect(node, e.shiftKey);
		},
		inspect: function(node, forcePopupLocker) {
			var top = this.getTopWindow(node);
			if(this.hasDOMInspector && _popupLocker && (_popupLocker == 2 || forcePopupLocker))
				this.lockPopup(node);
			this.stop();
			this.closeMenus(node);
			this.hideUnclosedPopups();
			this.inspectNode(node);
		},
		getPopup: function(node) {
			for(; node && "tagName" in node; node = node.parentNode)
				if(
					node.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
					&& "hidePopup" in node
				)
					return node;
			return null;
		},
		lockPopup: function(node) {
			var popup = this.getPopup(node);
			if(!popup)
				return;

			var popupLocker = {
				context: this,
				domiWindow: null,
				window: this.getTopWindow(node),
				popup: popup,
				tt: this.context.tt,
				ww: this.context.ww,
				fxVersion: this.fxVersion,
				closeMenus: this.closeMenus,
				stopEvent: this.stopEvent,
				stopSingleEvent: function() {
					this.context.stopSingleEvent.apply(this.context, arguments);
				},
				_getPopupInfo: this._getPopupInfo,
				_popups: [],
				init: function() {
					var w = this.window;
					//w.addEventListener("unload",       this, false);
					w.addEventListener("keydown",      this, true);
					w.addEventListener("keypress",     this, true);
					w.addEventListener("keyup",        this, true);
					w.addEventListener("popupshowing", this, true);
					w.addEventListener("popuphiding",  this, true);
					this.ww.registerNotification(this);
					_log("Popup locker: start");
				},
				destroy: function() {
					var w = this.window;
					//w.removeEventListener("unload",       this, false);
					w.removeEventListener("keydown",      this, true);
					w.removeEventListener("keypress",     this, true);
					w.removeEventListener("keyup",        this, true);
					w.removeEventListener("popupshowing", this, true);
					w.removeEventListener("popuphiding",  this, true);
					this.ww.unregisterNotification(this);
					this._popups.forEach(function(popup) {
						if("hidePopup" in popup)
							popup.hidePopup();
					});
					_log("Popup locker: stop");
				},
				handleEvent: function(e) {
					switch(e.type) {
						case "popupshowing":
							var popup = e.originalTarget;
							if(popup == this.tt)
								break;
							this.stopEvent(e);
							_log("Popup locker: prevent popup showing: " + this._getPopupInfo(popup));
						break;
						case "popuphiding":
							var popup = e.originalTarget;
							if(popup == this.tt)
								break;
							//if(e.originalTarget == this.popup)
							this.stopEvent(e);
							_log("Popup locker: prevent popup hiding: " + this._getPopupInfo(popup));
							if(this._popups.indexOf(popup) == -1)
								this._popups.push(popup);
						break;
						case "keydown":
						case "keypress":
						case "keyup":
							var onlyStop = this.fxVersion < 25 // See notes in keypressHandler()
								? e.type == "keydown" || e.type == "keyup"
								: e.type == "keypress" || e.type == "keyup";
							if(e.keyCode == e.DOM_VK_ESCAPE) {
								this.stopEvent(e);
								if(onlyStop)
									return;
								this.stopSingleEvent(e, "keyup");
								_log("Popup locker: Escape pressed => destroy");
								this.destroy();
								this.closeMenus(this.popup);
							}
						break;
						case "load":
							var win = e.target.defaultView;
							win.removeEventListener("load", this, false);
							if(!this.domiWindow && win.location.href == "chrome://inspector/content/inspector.xul") {
								_log("Popup locker: DOM Inspector opened");
								this.domiWindow = win;
							}
					}
				},
				observe: function(subject, topic, data) {
					if(topic == "domwindowopened") {
						subject.addEventListener("load", this, false);
					}
					else if(topic == "domwindowclosed") {
						subject.removeEventListener("load", this, false);
						if(subject == this.domiWindow) {
							_log("Popup locker: DOM Inspector closed => destroy");
							this.destroy();
						}
						else if(subject == this.window) {
							_log("Popup locker: locked window closed => destroy");
							this.destroy();
						}
					}
				}
			};
			popupLocker.init();
		},
		_checkPreventDefault: function(e) {
			try {
				if("defaultPrevented" in e ? e.defaultPrevented : e.getPreventDefault())
					_log('Warning! Default action for "' + e.type + '" event is already cancelled!');
			}
			catch(e) { // e10s: TypeError: 'getPreventDefault' called on an object that does not implement interface Event.
				if(_debug || ("" + e).indexOf("does not implement interface") == -1)
					Components.utils.reportError(e);
			}
		},
		closeMenus: function(node) {
			// Based on function closeMenus from chrome://browser/content/utilityOverlay.js
			for(; node && "tagName" in node; node = node.parentNode) {
				if(
					node.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
					&& (node.localName == "menupopup" || node.localName == "popup")
				)
					node.hidePopup();
			}
		},

		_popups: [],
		__shiftKey: false,
		get _shiftKey() {
			return this.__shiftKey;
		},
		set _shiftKey(val) {
			if(val == this.__shiftKey)
				return;
			this.__shiftKey = val;
			!val && this.hideUnclosedPopups();
			if(_showMargins == 2 && this._node)
				this.setDataProxy(this._node);
		},
		hideUnclosedPopups: function() {
			this._popups.forEach(function(popup) {
				if("hidePopup" in popup) {
					popup.hidePopup();
					_log("Hide popup: " + this._getPopupInfo(popup));
				}
			}, this);
			this._popups = [];
		},
		popupshowingHandler: function(e) {
			var tar = e.originalTarget;
			if(tar == this.context.tt)
				return;
			if(this._shiftKey)
				return;
			if(tar.localName == "tooltip") {
				this.stopEvent(e);
				_log("Forbid tooltip showing: " + this._getPopupInfo(tar));
			}
		},
		popupshownHandler: function(e) {
			var tar = e.originalTarget;
			if(tar == this.context.tt)
				return;
			if(/*this._shiftKey && */tar.localName == "tooltip")
				return;
			this.makeTooltipTopmost(true);
			_log(e.type + " => make tooltip topmost");
		},
		makeTooltipTopmost: function(restorePos) {
			this.context.tt.hidePopup(); // Ugly with show/hide tooltips animation
			restorePos && this.mousemoveHandler();
		},
		popuphidingHandler: function(e) {
			if(!this._shiftKey)
				return;
			var tar = e.originalTarget;
			if(/*tar.localName == "tooltip" && */tar != this.context.tt) {
				this.stopEvent(e);
				if(this._popups.indexOf(tar) == -1)
					this._popups.push(tar);
				_log("Forbid popup hiding: " + this._getPopupInfo(tar));
			}
		},
		_getPopupInfo: function(tt) {
			var ret = "<" + tt.nodeName + ">";
			if(tt.id)
				ret += ' id="' + tt.id + '"';
			if(tt.className)
				ret += ' class="' + tt.className + '"';
			var val = tt.value || tt.getAttribute("value") || tt.getAttribute("label") || tt.textContent;
			if(val)
				ret += ' "' + val + '"';
			return ret;
		},

		observe: function(subject, topic, data) {
			if(topic == "domwindowopened") {
				this.context.setListeners(ael, subject);
				_log("New window opened");
				if(!_debug)
					return;
				this._loadHandler = {
					parent: this,
					window: subject,
					handleEvent: function(e) {
						if(e.target.defaultView != this.window) //?
							return;
						_log("New window loaded: " + e.target.title + " (" + e.target.location + ")");
						this.destroy();
					},
					destroy: function() {
						this.window.removeEventListener("load", this, false);
						delete this.parent._loadHandler;
					}
				};
				subject.addEventListener("load", this._loadHandler, false);
			}
			else if(topic == "domwindowclosed") {
				if(this.hasOwnProperty("_loadHandler")) // Window can be closed before "load" event happens
					this._loadHandler.destroy();
				this.context.setListeners(rel, subject);
				if(subject == this.window)
					this.stop();
				_log("Window closed: " + (subject.document && subject.document.title) + " (" + subject.location + ")");
			}
		}
	};

	this.setAllListeners(ael);
	this.ww.registerNotification(this.eventHandler);
	var btn = this.button;
	if(btn) {
		var destructor = function(reason) {
			if(reason == "delete") {
				_log('"Delete button" pressed -> stop()');
				context.stop();
			}
		};
		if(
			typeof addDestructor == "function" // Custom Buttons 0.0.5.6pre4+
			&& addDestructor != ("addDestructor" in window && window.addDestructor)
		) {
			btn._attrsInspectorHasAddDestructor = true;
			addDestructor(destructor, this);
		}
		else {
			if("onDestroy" in btn)
				var origOnDestroy = btn._attrsInspectorOrigOnDestroy = btn.onDestroy;
			btn.onDestroy = function(reason) {
				destructor(reason);
				origOnDestroy && origOnDestroy.apply(this, arguments);
			};
		}
	}
	_log(
		"Successfully started!"
		+ "\nMode: " + (
			btn
				? "Custom Button"
				: "No Button"
		)
		+ ", highlighter: " + (
			_highlightUsingFlasher
				? "inIFlasher"
				: this.eventHandler.noStyles
					? "inline CSS"
					: "nsIStyleSheetService"
		)
	);
}
function destroy() {
	var tt = this.tt;
	if(!tt || !tt.parentNode)
		return;
	tt.hidePopup();
	tt.parentNode.removeChild(tt);

	var eh = this.eventHandler;
	eh.unwatchAttrs();
	eh.unhl();
	eh.destroyTimers();
	if(!_highlightUsingFlasher) {
		var sss = this.sss;
		var cssURI = this.cssURI;
		if(sss.sheetRegistered(cssURI, sss.AGENT_SHEET))
			sss.unregisterSheet(cssURI, sss.AGENT_SHEET);
		if(sss.sheetRegistered(cssURI, sss.USER_SHEET))
			sss.unregisterSheet(cssURI, sss.USER_SHEET);
	}
	this.setAllListeners(rel);
	this.ww.unregisterNotification(eh);
	var btn = this.button;
	if(btn) {
		if("_attrsInspectorOrigOnDestroy" in btn)
			btn.onDestroy = btn._attrsInspectorOrigOnDestroy;
		else if(!("_attrsInspectorHasAddDestructor" in btn))
			delete btn.onDestroy;
		delete btn._attrsInspectorOrigOnDestroy;
		delete btn._attrsInspectorHasAddDestructor;
	}
	delete window[_ns];
	_log("Shutdown finished!");
}
}).call(this);
//=== Attributes Inspector end
};

// Move focus back to previous active window
var focusManager = {
	button: this,
	focusedWindow: null,
	outTimer: 0,
	handleEvent: function(e) {
		switch(e.type) {
			case "mouseover":
				clearTimeout(this.outTimer);
				if(e.target == this.button) {
					var focusedWindow = Services.wm.getMostRecentWindow(null);
					this.focusedWindow = focusedWindow != window.top && focusedWindow;
				}
			break;
			case "mouseout":
				clearTimeout(this.outTimer);
				var rel = e.relatedTarget;
				if(!rel || !this.isChild(rel)) {
					this.outTimer = setTimeout(function(_this) {
						_this.focusedWindow = null;
					}, 500, this);
				}
			break;
			case "command":
				if(this.focusedWindow) {
					this.focusedWindow.focus();
					this.focusedWindow = null;
					clearTimeout(this.outTimer);
				}
		}
	},
	isChild: function(node) {
		for(; node; node = node.parentNode)
			if(node == this.button)
				return true;
		return false;
	}
};
this.addEventListener("mouseover", focusManager, true);
this.addEventListener("mouseout", focusManager, true);
this.addEventListener("command", focusManager, true);

this.type = "menu";
this.orient = "horizontal";

this.onDestroy = function(reason) {
	if(reason == "update" || reason == "delete") {
		Array.prototype.slice.call(document.getElementsByAttribute("cb_id", keyCbId)).forEach(function(key) {
			key.parentNode.removeChild(key);
		});
		cmds.destroyErrorConsoleRestoring();
	}
	if(reason != "constructor" && typeof focusManager != "undefined") {
		this.removeEventListener("mouseover", focusManager, true);
		this.removeEventListener("mouseout", focusManager, true);
		this.removeEventListener("command", focusManager, true);
	}
	if(reason != "constructor") {
		if(!cmds.onlyPopup)
			mp.removeEventListener("command", cmds, true);
	}
};