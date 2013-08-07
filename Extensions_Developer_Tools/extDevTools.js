// http://infocatcher.ucoz.net/js/cb/extDevTools.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57296
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Developer_Tools

// Extensions Developer Tools button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2011-2013
// version 0.1.2pre2 - 2013-07-26

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
	closeOptionsMenu: false,
	restoreErrorConsole: true, // Only for Gecko 2.0+
	reopenWindowFlushCaches: true,
	changeButtonIcon: true,
	// Use icon of default menu item as button icon
	// (middle-click on menu item to mark it as default,
	// middle-click on button to execute default action)
	confirm: {
		reopen: false,
		restart: false,
		exit: false
	},
	hotkeys: {
		cleanAndRestart: "control alt shift R",
		attrsInspector: "control alt I",
		openScratchpad: {
			key: "shift VK_F4",
			override: "key_scratchpad"
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
	// FatCow icons, http://www.iconfinder.com/icondetails/36398/16/code_script_icon
	scratchpad: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAArBJREFUeNqMU11IFFEU/vbO7Iyuums/GvmXhISBiOWWGFgGiyaC0UMkWRT11FNPQbEl9iNb0mtgUEQW+xjUQ5RrlClZ5IbaQ0bpw+paSGLGbrs7O3emc2d/kKjowBnm3HvnO9/5vju2Tb4ARJiUOjcQ1fhizUZnkVORsBzXMT7/HZLNZp0RT8ZssEuUjEGVWZWMdJimibhuXO4/UFvUWVeKf0Xg0yJcOXa03359i2UWDQKIackTmY91qkXyVWmmz/qezyBBbCvX5TXLGfpUo7mquETUEY1bgKtD0JeIvsMu4cXsNxz2R6DIDHJGAOqQX6CmyjjnEN/bfqPuYJIFrPLY5Ly346RYyzLQE/Hq7SUu66CWNFJd0+KZaTYFioxgeAV2mKH1vYPBfFVCWgOa0eB76stcpHwSmmFAQMiktkjxLpJUR2glBtlIzArsn9QoxYAaGJxXr8lVECHruGHSrEDxhccWfLinLcXozEM4cmTkJmITWVuzNkpKQ32pC1GuW1039DzB6OlWSCQaSUoacTCJYfiUB2ZRxR3RRAzGLAeIQmFeTrkAUumCVF4ZxMCR3bg0HLaU13UDMaJr0GjnhkLoP9gIjXNT1CxJUHT7zKhuFO68MYKqa8/g62jEgw/LePP5I3ZVroV/cgGin9m3HyPT0/BPLcHbskOMasoJQl+52Ja1ip19hIWoBofKLG2ut29Fp/8duraVIvwjBiGe2AtHEpYIjGnRt30vZxCizTnKJRLs7qsp5NOdONRQi703x9Dt2QInWbj56hC6GutQoNpxb+w9vpzf57Y5Pcc9SlNngEaxRJFpZoVEFN4fbarDwMhkyiXaFYofo7X7oxP42t3mrvAFgsIJlbLmTz9NWe/TcRvxnPO2uEVd3js4LrSY97a66S8O4j+iPp1/q/FLgAEAGto2bg8Nx1UAAAAASUVORK5CYII="
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
		"Can't install %L locale!\nURL: %U": {
			ru: "Не удалось установить локаль %L!\nСсылка: %U"
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
		"Scratchpad": {
			ru: "Простой редактор JavaScript"
		},
		scratchpadKey: {
			ru: "р"
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
		"Enable developer tools for chrome": {
			ru: "Включить инструменты разработчика для chrome"
		},
		"Enable E4X for chrome": {
			ru: "Включить E4X для chrome"
		},
		"Enable E4X for content": {
			ru: "Включить E4X для content"
		},
		"Middle-click: %S": {
			ru: "Клик средней кнопкой мыши: %S"
		}
	};
	var locale = (cmds.getPref("general.useragent.locale") || "en").match(/^[a-z]*/)[0];
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
	Array.some(
		this.parentNode.getElementsByTagName("*"),
		function(node) {
			if(
				node != this
				&& node.namespaceURI == XULNS
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

var cmds = this.commands = {
	options: options,
	button: this,
	onlyPopup: this.localName == "popupset",
	get btnNum() {
		delete this.btnNum;
		return this.btnNum = this.button.id.match(/\d*$/)[0];
	},
	get ss() {
		delete this.ss;
		if(!("nsISessionStore" in Components.interfaces)) // Thunderbird
			return this.ss = null;
		return this.ss = (
			Components.classes["@mozilla.org/browser/sessionstore;1"]
			|| Components.classes["@mozilla.org/suite/sessionstore;1"]
		).getService(Components.interfaces.nsISessionStore);
	},
	get appInfo() {
		delete this.appInfo;
		return this.appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo);
	},
	get platformVersion() {
		delete this.platformVersion;
		return this.platformVersion = parseFloat(this.appInfo.platformVersion);
	},
	get ps() {
		delete this.ps;
		return this.ps = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
	},

	get defaultActionPref() {
		delete this.defaultActionPref;
		return this.defaultActionPref = "extensions.custombuttons.button" + this.btnNum + ".defaultAction";
	},
	get defaultAction() {
		return this.getPref(this.defaultActionPref);
	},
	set defaultAction(val) {
		if(!val)
			this.prefSvc.clearUserPref(this.defaultActionPref);
		else
			this.setPref(this.defaultActionPref, val);
	},
	get defaultActionItem() {
		var defaultAction = this.defaultAction;
		if(!defaultAction)
			return null;
		var mis = this.button.getElementsByAttribute("cb_id", defaultAction);
		if(!mis.length)
			return null;
		return mis[0];
	},
	initMenu: function(menu) {
		if(!menu)
			menu = this.button.lastChild;
		var defaultAction = this.defaultAction;
		Array.forEach(
			menu.getElementsByAttribute("cb_id", "*"),
			function(mi) {
				var cbId = mi.getAttribute("cb_id");
				mi.setAttribute("default", cbId == defaultAction);
				if(cbId == "switchLocale")
					this.initSwitchLocaleItem(mi);
				else if(cbId == "attrsInspector") {
					//~ Note: should be "inspectDOMNode" in window for Firefox 1.5
					this.setPartiallyAvailable(
						mi,
						"@mozilla.org/commandlinehandler/general-startup;1?type=inspector" in Components.classes
					);
					this.setAttrsInspectorActive(mi);
				}
				else if(cbId == "scratchpad") {
					this.setPartiallyAvailable(mi, this.getPref("devtools.chrome.enabled"));
				}
			},
			this
		);
	},
	initSwitchLocaleItem: function(mi) {
		mi.setAttribute(
			"label",
			_localize("Switch locale to “%S”")
				.replace("%S", this.switchLocale(true))
		);
		mi.setAttribute(
			"tooltiptext",
			_localize("Current locale: %S")
				.replace("%S", this.currentLocale || "???")
		);
	},
	setPartiallyAvailable: function(mi, available) {
		mi.style.color = available ? "" : "grayText";
	},
	setCloseMenu: function(e) {
		var mi = e.target;
		if(
			e.button == 0
			&& mi.hasAttribute("cb_id")
		)
			mi.setAttribute("closemenu", this.hasModifier(e) ? "none" : "auto");
	},
	setDefaultAction: function(e) {
		if(this.onlyPopup)
			return;
		if(!(e.button == 1 || e.button == 0 && this.hasModifier(e)))
			return;
		var mi = e.target;
		var action = mi.getAttribute("cb_id");
		if(!action)
			return;
		this.defaultAction = this.defaultAction == action ? "" : action;
		this.initMenu();
		this.setDefaultActionTip();
		this.savePrefFile(true);
	},
	updateTipOnMouseover: false,
	setDefaultActionTip: function(delay) {
		var _this = this;
		setTimeout(function() {
			var mi = _this.defaultActionItem;
			if(mi && mi.getAttribute("cb_id") == "switchLocale") {
				_this.updateTipOnMouseover = true;
				_this.initSwitchLocaleItem(mi);
			}
			else {
				_this.updateTipOnMouseover = false;
			}
			var btn = _this.button;
			btn.tooltipText = btn.tooltipText.replace(/ \n.*$/, "") + (
				mi
					? " \n" + _localize("Middle-click: %S").replace("%S", mi.getAttribute("label"))
					: ""
			);
			if(!_this.options.changeButtonIcon)
				return;
			var icon = btn.ownerDocument.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-icon");
			icon.src = mi
				? mi.getAttribute("image")
				: btn.image;
		}, delay || 0);
	},

	get canReopenWindow() {
		var ss = this.ss;
		delete this.canReopenWindow;
		return this.canReopenWindow = ss && "getWindowState" in ss && "setWindowState" in ss
			&& "gBrowser" in window && gBrowser.localName == "tabbrowser";
	},
	reopenWindow: function() {
		return this.confirm("reopen", "_reopenWindow", arguments);
	},
	_reopenWindow: function(flushCaches) {
		this.button.disabled = true;

		var ss = this.ss;
		var state = ss.getWindowState(window);

		var win = this.openBrowserWindow();
		win.addEventListener("load", function restoreSession(e) {
			win.removeEventListener(e.type, restoreSession, false);
			ss.setWindowState(win, state, true);
			if(!window.closed)
				window.close();
		}, false);

		// Try remove closed window from undo history
		window.addEventListener("unload", function clearUndo(e) {
			window.removeEventListener(e.type, clearUndo, false);

			var canForget = "forgetClosedWindow" in ss;
			if(canForget) {
				var stateObj = JSON.parse(ss.getWindowState(window)).windows[0];
				delete stateObj._shouldRestore;
				var state = JSON.stringify(stateObj);
				//LOG("state:\n" + state);
			}
			win.setTimeout(function() {
				if(canForget) {
					var closed = JSON.parse(ss.getClosedWindowData());
					for(var i = 0, l = closed.length; i < l; ++i) {
						delete closed[i]._shouldRestore;
						//LOG("#" + i + "\n" + JSON.stringify(closed[i]));
						if(JSON.stringify(closed[i]) == state) {
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
			var tabs = Array.filter(
				gBrowser.tabs || gBrowser.tabContainer.childNodes,
				function(tab) {
					return tab.linkedBrowser && !tab.closing;
				}
			);
			var selectedTab = gBrowser.selectedTab;
			var newBrowser = win.gBrowser;

			tabs.forEach(function(tab) {
				if(!tab.linkedBrowser) // What?
					return;
				// We can't swap unloaded tabs! :(
				// Error: NS_ERROR_NOT_IMPLEMENTED: Component returned failure code:
				// 0x80004001 (NS_ERROR_NOT_IMPLEMENTED) [nsIFrameLoaderOwner.swapFrameLoaders]
				// (chrome://global/content/bindings/browser.xml, <method name="swapDocShells">)
				if(
					tab.getAttribute("pending") == "true" // Gecko >= 9.0
					|| tab.linkedBrowser.contentDocument.readyState == "uninitialized"
				)
					tab.linkedBrowser.reload();
			});
			//~ todo: add support for tab groups

			if("treeStyleTab" in gBrowser) {
				var selectedTabPos = "_tPos" in selectedTab //~ todo: don't use with "closing" tabs?
					? selectedTab._tPos
					: tabs.indexOf(selectedTab);
				(function tstMoveTabs() {
					if("treeStyleTab" in newBrowser) {
						newBrowser.treeStyleTab.moveTabs(tabs);

						var initialTab = newBrowser.selectedTab;
						newBrowser.selectedTab = (newBrowser.tabs || newBrowser.tabContainer.childNodes)[selectedTabPos + 1];
						newBrowser.removeTab(initialTab);
					}
					else {
						setTimeout(tstMoveTabs, 10);
					}
				})();
				return;
			}

			tabs.forEach(function(tab) {
				var newTab = newBrowser.addTab();
				newBrowser.swapBrowsersAndCloseOther(newTab, tab);
				if(tab == selectedTab) {
					var initialTab = newBrowser.selectedTab;
					newBrowser.selectedTab = newTab;
					newBrowser.removeTab(initialTab);
				}
			});
		}, false);
	},
	openBrowserWindow: function() {
		// In SeaMonkey OpenBrowserWindow() doesn't return link to opened window
		//return OpenBrowserWindow();
		return window.openDialog(
			getBrowserURL(),
			"_blank",
			"chrome,all,dialog=no"
		);
	},
	restart: function() {
		return this.confirm("restart", "_restart", arguments);
	},
	_restart: function() {
		const pId = "browser.tabs.warnOnClose";
		var woc = this.getPref(pId);
		if(woc != undefined)
			this.setPref(pId, false);
		if("Application" in window && "restart" in Application)
			Application.restart();
		else {
			var appStartup = Components.interfaces.nsIAppStartup;
			if(canQuitApplication())
				Components.classes["@mozilla.org/toolkit/app-startup;1"]
					.getService(appStartup)
					.quit(appStartup.eAttemptQuit | appStartup.eRestart);
		}
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
	flushCaches: function() {
		// See resource://gre/modules/XPIProvider.jsm
		var obs = Components.classes["@mozilla.org/observer-service;1"]
			.getService(Components.interfaces.nsIObserverService);
		obs.notifyObservers(null, "startupcache-invalidate", null);
		obs.notifyObservers(null, "chrome-flush-skin-caches", null);
		obs.notifyObservers(null, "chrome-flush-caches", null);
	},
	get currentLocale() {
		return this.getPref("general.useragent.locale");
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
	switchLocaleCustom: function() {
		this.button.open = false;
		var locale = {
			value: this.switchLocale(true)
		};
		var ok = this.ps.prompt(
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
		var _this = this;
		var mi = this.button.getElementsByAttribute("cb_id", "switchLocale")[0];
		mi.setAttribute("disabled", "true");
		this.ensureLocaleAvailable(locale, function(ok) {
			mi.removeAttribute("disabled");
			_this._setLocale(locale);
		});
	},
	_setLocale: function(locale) {
		this.setPref("general.useragent.locale", locale);
		var reopen = !this.options.forceRestartOnLocaleChange
			&& this.canReopenWindow
			&& this.platformVersion >= 18;
		if(!this.confirm(reopen ? "reopen" : "restart"))
			return false;
		if(reopen) {
			this._reopenWindow(true);
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
	ensureLocaleAvailable: function(locale, callback, tryESR) {
		if(locale == this.getPref("general.useragent.locale", null, this.defaultBranch)) {
			callback(true);
			return;
		}
		try {
			Components.utils["import"]("resource://gre/modules/AddonManager.jsm");
		}
		catch(e) {
			callback(undefined);
			return;
		}
		var id = "langpack-" + locale + "@firefox.mozilla.org";
		var _this = this;
		AddonManager.getAddonByID(id, function(addon) {
			if(addon && addon.version == _this.appInfo.version) {
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
				&& !_this.ps.confirm(
					window,
					_localize("Extensions Developer Tools"),
					_localize("Install %S locale?").replace("%S", locale)
				)
			) {
				callback(false);
				return;
			}

			var imgConnecting = "chrome://browser/skin/tabbrowser/connecting.png";
			var imgLoading = "chrome://browser/skin/tabbrowser/loading.png";
			var appName = _this.appInfo.name;
			if(appName == "SeaMonkey")
				imgConnecting = imgLoading = "chrome://communicator/skin/icons/loading.gif";
			else if(appName == "Thunderbird") {
				imgConnecting = "chrome://messenger/skin/icons/connecting.png";
				imgLoading = "chrome://messenger/skin/icons/loading.png";
			}

			var btn = _this.button;
			var icon = btn.ownerDocument.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-icon");
			var origIcon = icon.src;
			icon.src = imgConnecting;

			AddonManager.getInstallForURL(
				installURL,
				function(install) {
					LOG("[Language pack]: Call install()");
					install.addListener({
						onInstallEnded: function(install, addon) {
							LOG("[Language pack]: Ok");
							this._done(true);
						},
						onDownloadFailed: function(install) {
							LOG("[Language pack]: Download failed");
							this._done(false);
						},
						onInstallFailed: function(install) {
							LOG("[Language pack]: Install failed");
							this._done(false);
						},
						_done: function(ok) {
							icon.src = origIcon;
							install.removeListener(this);
							if(!ok) {
								if(!tryESR && _this.getInstallURLForLocale(locale, true) != installURL) {
									LOG("[Language pack]: Will try ESR version");
									_this.ensureLocaleAvailable(locale, callback, true);
									return;
								}
								_this.ps.alert(
									window,
									_localize("Extensions Developer Tools"),
									_localize("Can't install %L locale!\nURL: %U")
										.replace("%L", locale)
										.replace("%U", installURL)
								);
							}
							callback(ok);
						}
					});
					icon.src = imgLoading;
					install.install();
				},
				"application/x-xpinstall"
			);
		});
	},
	getInstallURLForLocale: function(locale, useESR) {
		var appInfo = this.appInfo;
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
			// ftp://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central-l10n/win32/xpi/
			// ftp://ftp.mozilla.org/pub/mozilla.org/seamonkey/nightly/latest-comm-central-trunk-l10n/win32/xpi/
			// ftp://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-central-l10n/win32/xpi/
			// firefox-25.0a1.fr.langpack.xpi
			var file = app + "-" + version + "." + locale + ".langpack.xpi";
			var dir;
			if(app == "firefox")        dir = "latest-mozilla-central-l10n";
			else if(app == "seamonkey") dir = "latest-comm-central-trunk-l10n";
			else                        dir = "latest-comm-central-l10n";
			return "ftp://ftp.mozilla.org/pub/mozilla.org/" + app + "/nightly/" + dir + "/" + platform + "/xpi/" + file;
		}
		var file = locale + ".xpi";
		var esr = useESR ? "esr" : "";
		// ftp://ftp.mozilla.org/pub/mozilla.org/firefox/releases/23.0/win32/xpi/
		// ftp://ftp.mozilla.org/pub/mozilla.org/firefox/releases/23.0/mac/xpi/
		// ftp://ftp.mozilla.org/pub/mozilla.org/firefox/releases/23.0/linux-i686/xpi/
		return "ftp://ftp.mozilla.org/pub/mozilla.org/" + app + "/releases/" + version + esr + "/" + platform + "/xpi/" + file;
	},
	get canSaveSessionAndExit() {
		delete this.canSaveSessionAndExit;
		return this.canSaveSessionAndExit = this.ss
			&& this.getPref("browser.sessionstore.resume_session_once") != undefined
			&& (
				"goQuitApplication" in window
				|| "Application" in window && "quit" in Application
			);
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
					: "Application" in window && "quit" in Application && Application.quit()
			)
				this.setPref("browser.sessionstore.resume_session_once", true);
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		if(woq != undefined)
			this.setPref("browser.warnOnQuit", woq);
		if(woc != undefined)
			this.setPref("browser.tabs.warnOnClose", woc);
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
		var w = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator)
			.getMostRecentWindow("global:console");
		if(w) {
			w.focus();
			return;
		}
		var consoleURI = "@zeniko/console2-clh;1" in Components.classes
			|| "@mozilla.org/commandlinehandler/general-startup;1?type=console2" in Components.classes // Firefox <= 3.6
			? "chrome://console2/content/console2.xul"
			: "chrome://global/content/console.xul";
		window.openDialog(consoleURI, "_blank", "chrome,all,centerscreen,resizable,dialog=0");
	},
	get canOpenBrowserConsole() {
		delete this.canOpenBrowserConsole;
		//return this.canOpenBrowserConsole = "HUDConsoleUI" in window
		//	&& "toggleBrowserConsole" in HUDConsoleUI;
		return this.canOpenBrowserConsole = !!document.getElementById("menu_browserConsole");
	},
	openBrowserConsole: function() {
		if("HUDConsoleUI" in window && "toggleBrowserConsole" in HUDConsoleUI) {
			if(HUDConsoleUI._browserConsoleID) try {
				var HUDService = Components.utils.import("resource:///modules/HUDService.jsm", {}).HUDService;
				var hud = HUDService.getHudReferenceById(HUDConsoleUI._browserConsoleID);
				if(hud && hud.iframeWindow) {
					hud.iframeWindow.focus();
					return;
				}
			}
			catch(e) {
				Components.utils.reportError(e);
			}
			HUDConsoleUI.toggleBrowserConsole();
			return;
		}
		document.getElementById("menu_browserConsole").doCommand();
	},
	_restoreErrorConsoleObserver: null,
	get restoreErrorConsolePref() {
		delete this.restoreErrorConsolePref;
		return this.restoreErrorConsolePref = "extensions.custombuttons.button" + this.btnNum + ".restoreErrorConsole";
	},
	initErrorConsoleRestoring: function() {
		if(this._restoreErrorConsoleObserver || this.platformVersion < 2)
			return;
		this.restoreErrorConsole();
		var obs = this.obs = Components.classes["@mozilla.org/observer-service;1"]
			.getService(Components.interfaces.nsIObserverService);
		var _this = this;
		var observer = this._restoreErrorConsoleObserver = function() {
			obs.removeObserver(observer, "quit-application-granted");
			if(
				Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator)
					.getMostRecentWindow("global:console")
			)
				_this.setPref(_this.restoreErrorConsolePref, true);
		};
		obs.addObserver(observer, "quit-application-granted", false);
	},
	destroyErrorConsoleRestoring: function() {
		var o = this._restoreErrorConsoleObserver;
		if(o) {
			this._restoreErrorConsoleObserver = null;
			this.obs.removeObserver(o, "quit-application-granted");
		}
	},
	restoreErrorConsole: function() {
		if(this.getPref(this.restoreErrorConsolePref)) {
			this.prefSvc.clearUserPref(this.restoreErrorConsolePref);
			this.openErrorConsole();
		}
	},
	attrsInspector: function(e) {
		this.button.attrsInspector(e);
		this.setAttrsInspectorActive();
	},
	setAttrsInspectorActive: function(mi) {
		if(!mi)
			mi = this.button.getElementsByAttribute("cb_id", "attrsInspector")[0];
		if("__attributesInspector" in window) {
			mi.setAttribute("type", "checkbox");
			mi.setAttribute("checked", "true");
		}
		else {
			mi.removeAttribute("type");
			mi.removeAttribute("checked");
		}
	},
	get hasScratchpad() {
		delete this.hasScratchpad;
		return this.hasScratchpad = "Scratchpad" in window
			&& "openScratchpad" in Scratchpad;
	},
	openScratchpad: function() {
		if("ScratchpadManager" in Scratchpad) { // Firefox 10+
			// Use JSON.stringify(win.Scratchpad.getState()) to get state object
			var context = this.getPref("devtools.chrome.enabled") ? 2 : 1;
			Scratchpad.ScratchpadManager.openScratchpad({ text: "", executionContext: context, saved: true });
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

	hasModifier: function(e) {
		return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
	},

	confirm: function(key, method, args) {
		var msg;
		switch(key) {
   			case "reopen":  msg = "Reopen window?";       break;
   			case "restart": msg = "Restart application?"; break;
   			case "exit":    msg = "Are you sure you want to exit?";
		}
		if(
			!this.options.confirm[key]
			|| this.ps.confirm(window, _localize("Extensions Developer Tools"), _localize(msg))
		) {
			method && this[method].apply(this, args);
			return true;
		}
		return false;
	},

	initPrefsMenu: function(popup) {
		var closeMenu = this.options.closeOptionsMenu ? "auto" : "none";
		Array.forEach(
			popup.getElementsByAttribute("cb_pref", "*"),
			function(node) {
				var pref = node.getAttribute("cb_pref");
				node.setAttribute("checked", !!this.getPref(pref));
				node.setAttribute("closemenu", closeMenu);
				this.hlPrefItem(node, pref);
			},
			this
		);
	},
	doPrefsMenuCommand: function(node) {
		var pref = node.getAttribute("cb_pref");
		this.setPref(pref, node.getAttribute("checked") == "true");
		this.hlPrefItem(node, pref);
		if(pref == "devtools.chrome.enabled")
			this.initMenu();
		this.prefsChanged = true;
	},
	hlPrefItem: function(node, pref) {
		node.style.fontWeight = this.prefHasUserValue(pref) ? "bold" : "";
	},

	get prefSvc() {
		delete this.prefSvc;
		return this.prefSvc = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.QueryInterface(Components.interfaces.nsIPrefBranch2 || Components.interfaces.nsIPrefBranch);
	},
	get defaultBranch() {
		delete this.defaultBranch;
		return this.defaultBranch = this.prefSvc.getDefaultBranch("");
	},
	getPref: function(pName, defaultVal, prefBranch) {
		var ps = prefBranch || this.prefSvc;
		try { // getPrefType() returns type of changed value for default branch
			switch(ps.getPrefType(pName)) {
				case ps.PREF_STRING: return ps.getComplexValue(pName, Components.interfaces.nsISupportsString).data;
				case ps.PREF_INT:    return ps.getIntPref(pName);
				case ps.PREF_BOOL:   return ps.getBoolPref(pName);
			}
		}
		catch(e) {
		}
		return defaultVal;
	},
	setPref: function(pName, pVal) {
		var ps = this.prefSvc;
		var pType = ps.getPrefType(pName);
		var isNew = pType == ps.PREF_INVALID;
		var vType = typeof pVal;
		if(pType == ps.PREF_BOOL || isNew && vType == "boolean")
			ps.setBoolPref(pName, pVal);
		else if(pType == ps.PREF_INT || isNew && vType == "number")
			ps.setIntPref(pName, pVal);
		else if(pType == ps.PREF_STRING || isNew) {
			var str = Components.classes["@mozilla.org/supports-string;1"]
				.createInstance(Components.interfaces.nsISupportsString);
			str.data = pVal;
			ps.setComplexValue(pName, Components.interfaces.nsISupportsString, str);
		}
	},
	prefHasUserValue: function(pName) {
		if(!this.prefHasDefaultValue(pName))
			return !!this.getPref(pName);
		return this.prefSvc.prefHasUserValue(pName);
	},
	prefHasDefaultValue: function(pName) {
		return this.getPref(pName, null, this.defaultBranch) != null;
	},

	prefsChanged: false,
	savePrefFile: function(force) {
		if(!force && !this.prefsChanged)
			return;
		this.prefsChanged = false;
		var _this = this;
		var timer = Components.classes["@mozilla.org/timer;1"]
			.createInstance(Components.interfaces.nsITimer);
		timer.init(function() {
			_this.prefSvc.savePrefFile(null);
			LOG("savePrefFile()");
		}, 100, timer.TYPE_ONE_SHOT);
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

var mp = this.appendChild(parseXULFromString('\
	<menupopup xmlns="' + XULNS + '"\
		onpopupshowing="if(event.target == this) this.parentNode.commands.initMenu(this);"\
		onmousedown="this.parentNode.commands.setCloseMenu(event);"\
		onclick="this.parentNode.commands.setDefaultAction(event);">\
		<menuitem cb_id="reopenWindow"\
			oncommand="this.parentNode.parentNode.commands.reopenWindow();"\
			hidden="' + !cmds.canReopenWindow + '"\
			label="' + _localize("Reopen window") + '"\
			accesskey="' + _localize("w", "reopenWindowKey") + '"\
			class="menuitem-iconic"\
			image="' + images.reopenWindow + '" />\
		<menuitem cb_id="moveTabsToNewWindow"\
			oncommand="this.parentNode.parentNode.commands.moveTabsToNewWindow();"\
			hidden="' + !cmds.canMoveTabsToNewWindow + '"\
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
			hidden="' + !cmds.canSaveSessionAndExit + '" />\
		<menuseparator />\
		<menuitem cb_id="errorConsole"\
			oncommand="this.parentNode.parentNode.commands.openErrorConsole();"\
			key="key_errorConsole"\
			label="' + _localize("Error console") + '"\
			accesskey="' + _localize("E", "errorConsoleKey") + '"\
			class="menuitem-iconic"\
			image="' + images.errorConsole + '" />\
		<menuitem cb_id="browserConsole"\
			oncommand="this.parentNode.parentNode.commands.openBrowserConsole();"\
			key="key_browserConsole"\
			label="' + _localize("Browser console") + '"\
			accesskey="' + _localize("B", "browserConsoleKey") + '"\
			class="menuitem-iconic"\
			image="' + images.browserConsole + '"\
			hidden="' + !cmds.canOpenBrowserConsole + '" />\
		<menuitem cb_id="attrsInspector"\
			oncommand="this.parentNode.parentNode.commands.attrsInspector(event);"\
			label="' + _localize("Attributes Inspector") + '"\
			accesskey="' + _localize("A", "attrsInspectorKey") + '"\
			class="menuitem-iconic"\
			image="' + images.attrsInspector + '" />\
		<menuitem cb_id="openScratchpad"\
			oncommand="this.parentNode.parentNode.commands.openScratchpad();"\
			label="' + _localize("Scratchpad") + '"\
			accesskey="' + _localize("p", "scratchpadKey") + '"\
			class="menuitem-iconic"\
			image="' + images.scratchpad + '"\
			hidden="' + !cmds.hasScratchpad + '" />\
		<menuseparator />\
		<menu\
			label="' + _localize("Options") + '"\
			accesskey="' + _localize("O", "optionsKey") + '">\
			<menupopup\
				onpopupshowing="this.parentNode.parentNode.parentNode.commands.initPrefsMenu(this);"\
				onpopuphidden="this.parentNode.parentNode.parentNode.commands.savePrefFile();"\
				oncommand="this.parentNode.parentNode.parentNode.commands.doPrefsMenuCommand(event.target);"\
				onclick="if(event.button == 1) closeMenus(this);">\
				<menuitem cb_pref="javascript.options.showInConsole"\
					tooltiptext="javascript.options.showInConsole"\
					type="checkbox"\
					label="' + _localize("Show errors in chrome files") + '" />\
				<menuitem cb_pref="javascript.options.strict"\
					tooltiptext="javascript.options.strict"\
					type="checkbox"\
					label="' + _localize("Show strict warnings") + '" />\
				<menuitem cb_pref="javascript.options.strict.debug"\
					tooltiptext="javascript.options.strict.debug"\
					type="checkbox"\
					label="' + _localize("Show strict warnings in debug builds") + '"\
					hidden="' + !this.commands.isDebugBuild + '" />\
				<menuitem cb_pref="dom.report_all_js_exceptions"\
					tooltiptext="dom.report_all_js_exceptions"\
					type="checkbox"\
					label="' + _localize("Show all exceptions") + '"\
					hidden="' + (cmds.platformVersion < 1.9) + '" />\
				<menuitem cb_pref="extensions.logging.enabled"\
					tooltiptext="extensions.logging.enabled"\
					type="checkbox"\
					label="' + _localize("Show information about extensions update") + '" />\
				<menuseparator />\
				<menuitem cb_pref="browser.dom.window.dump.enabled"\
					tooltiptext="browser.dom.window.dump.enabled"\
					type="checkbox"\
					label="' + _localize("Enable window.dump()") + '" />\
				<menuitem cb_pref="nglayout.debug.disable_xul_cache"\
					tooltiptext="nglayout.debug.disable_xul_cache"\
					type="checkbox"\
					label="' + _localize("Disable XUL cache") + '" />\
				<menuitem cb_pref="dom.allow_XUL_XBL_for_file"\
					tooltiptext="dom.allow_XUL_XBL_for_file"\
					type="checkbox"\
					label="' + _localize("Allow XUL and XBL for file://") + '"\
					hidden="' + (cmds.platformVersion < 2) + '" />\
				<menuitem cb_pref="devtools.chrome.enabled"\
					tooltiptext="devtools.chrome.enabled"\
					type="checkbox"\
					label="' + _localize("Enable developer tools for chrome") + '"\
					hidden="' + (cmds.platformVersion < 4 || !cmds.prefHasDefaultValue("devtools.chrome.enabled")) + '" />\
				<menuseparator hidden="' + !this.commands.canDisableE4X + '" />\
				<menuitem cb_pref="javascript.options.xml.chrome"\
					tooltiptext="javascript.options.xml.chrome"\
					type="checkbox"\
					label="' + _localize("Enable E4X for chrome") + '"\
					hidden="' + !this.commands.canDisableE4X + '" />\
				<menuitem cb_pref="javascript.options.xml.content"\
					tooltiptext="javascript.options.xml.content"\
					type="checkbox"\
					label="' + _localize("Enable E4X for content") + '"\
					hidden="' + !this.commands.canDisableE4X + '" />\
			</menupopup>\
		</menu>\
	</menupopup>'
));

if(!cmds.onlyPopup)
	mp.addEventListener("command", cmds, true);

const keyCbId = "custombuttons-extDevTools-key";
if(!cmds.onlyPopup) for(var kId in options.hotkeys) if(options.hotkeys.hasOwnProperty(kId)) {
	var cmd = options.hotkeys[kId];
	var key = typeof cmd == "string" ? cmd : cmd.key;
	if(!key)
		continue;
	var keyElt;
	if(cmd.hasOwnProperty("override")) {
		cmd.override.split(/,\s*/).forEach(function(id) {
			var keyElt = document.getElementById(id);
			if(!keyElt)
				return;
			// Break old key
			keyElt.setAttribute("__disabledByEvtDevTools", "true");
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
	keyElt = keyset.appendChild(document.createElement("key"));
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
	var mi = this.getElementsByAttribute("cb_id", kId)[0];
	mi && mi.setAttribute("key", keyId);
}

if(!cmds.onlyPopup)
	cmds.setDefaultActionTip(100);
if(options.restoreErrorConsole && !cmds.onlyPopup)
	cmds.initErrorConsoleRestoring();

function parseXULFromString(xul) {
	xul = xul.replace(/>\s+</g, "><");
	return new DOMParser().parseFromString(xul, "application/xml").documentElement;
}

this.attrsInspector = function(event) {
//=== Attributes Inspector begin
// http://infocatcher.ucoz.net/js/cb/attrsInspector.js
// https://forum.mozilla-russia.org/viewtopic.php?id=56041
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Attributes_Inspector

// (c) Infocatcher 2010-2013
// version 0.6.2pre - 2013-07-01

//===================
// Attributes Inspector button for Custom Buttons
// (for "code" section)
// Also the code can be used from main window context (as Mouse Gestures code, for example)

// Usage:
//   Use middle-click or Ctrl + left-click (or press Ctrl+I) to inspect node in DOM Inspector
//   (additionally hold Shift key to enable pupup locker)
//   Hold Shift key to show and don't hide tooltips and popups
// Hotkeys:
//   Escape                - cancel or disable popup locker
//   Ctrl+Up, Ctrl+Down    - navigate to parent/child node
//   Ctrl+Left, Ctrl+Right - navigate to previous/next sibling node
//   Ctrl+Shift+C          - copy tooltip's contents

// For more developer tools see Extensions Developer Tools button:
//   http://infocatcher.ucoz.net/js/cb/extDevTools.js
//   https://forum.mozilla-russia.org/viewtopic.php?id=57296
//   https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Developer_Tools

// Icon: http://www.iconsearch.ru/detailed/278/2/
//===================

var _highlight = true; // Hightlight current node
var _highlightUsingFlasher = false; // Don't modify DOM, but has some side effects (and slower)
// Note: inIFlasher works in Firefox 4 and higher only with disabled hardware acceleration!
// See https://bugzilla.mozilla.org/show_bug.cgi?id=368608 and https://bugzilla.mozilla.org/show_bug.cgi?id=594299
var _borderColor = "red"; // Any valid CSS color
var _borderWidth = 1; // Border width in pixels
var _borderStyle = "solid"; // border-style property in CSS
// Note: doesn't work with _highlightUsingFlasher = true

// Highlight added/removed/changed attributes, any valid CSS color:
var _addedColor = "-moz-hyperlinktext";
var _removedColor = "grayText";
var _changedColor = "-moz-visitedhyperlinktext";

var _excludeChildTextNodes = 1;
// 0 - don't exclude
// 1 - exclude, if found element node
// 2 - always exclude
var _excludeSiblingTextNodes = false;

var _preferNotAnonymousChildNodes = false;
// true  - use not anonymous child nodes, if any (as in version 0.6.1pre and older)
// false - always try get real child nodes (may work wrong in Gecko < 7.0)

var _forbidTooltips = true; // Prevent all other tooltips
var _popupLocker = 1;
// Lock all popups in window while DOM Inspector is opened (or until Escape was not pressed)
// Values: 0 - disable, 1 - only if Shift pressed, 2 - always enable
var _showNamespaceURI = 2; // 0 - don't show, 1 - show as is, 2 - show pretty name instead of URI
var _showFullTree = 2; // 0 - current frame, 1 - top frame, 2 - topmost frame
var _nodePosition = 0.55; // Position of selected node in DOM Inspector's tree, 0..1 (-1 - don't change)

// Show debug messages in error console:
//var _debug = false;
var _debug = typeof event == "object" && event instanceof Event
	? event.shiftKey || event.ctrlKey || event.altKey || event.metaKey
	: false;

function _log() {
	if(!_debug)
		return _log = function() {};
	var cs = Components.classes["@mozilla.org/consoleservice;1"]
		.getService(Components.interfaces.nsIConsoleService);
	function ts() {
		var d = new Date();
		var ms = d.getMilliseconds();
		return d.toLocaleFormat("%M:%S:") + "000".substr(String(ms).length) + ms;
	}
	_log = function() {
		cs.logStringMessage("[Attributes Inspector]: " + ts() + " " + Array.map(arguments, String).join("\n"));
	};
	return _log.apply(this, arguments);
}

const _ns = "__attributesInspector";
var context = _ns in window && window[_ns] || (
	window[_ns] = {
		button: this instanceof XULElement && this.localName != "popupset" && this,
		checked: false,
		toggle: function() {
			toggle.call(context);
		},
		stop: function() {
			this.checked && this.toggle();
		}
	}
);
function ael(type, func, useCapture, target) {
	return (target || window).addEventListener(type, func, useCapture);
}
function rel(type, func, useCapture, target) {
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
	const ttId = this.ttId = "__attrsInspectorTooltip";
	var tt = this.tt = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "tooltip");
	tt.id = ttId;
	tt.setAttribute("orient", "vertical");
	//if("pointerEvents" in tt.style)
	//	tt.style.pointerEvents = "none";
	tt.setAttribute("mousethrough", "always");
	top.document.documentElement.appendChild(tt);

	// Resolve -moz-* and system colors (for copy tooltip contents feature)
	var tts = tt.style;
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

	this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		.getService(Components.interfaces.nsIWindowMediator);
	this.setAllListeners = function(action) {
		var ws = this.wm.getEnumerator(null);
		while(ws.hasMoreElements())
			this.setListeners(action, ws.getNext());
	};
	this.setListeners = function(action, w) {
		var h = new this.evtHandler(w);

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

		if(action == rel) {
			var ehg = this.evtHandlerGlobal;
			var hi = ehg._windows.indexOf(w);
			delete ehg._windows[hi];
			delete ehg._handlers[hi];
		}
	};
	this.ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
		.getService(Components.interfaces.nsIWindowWatcher);

	this.evtHandlerGlobal = {
		_handlers: [],
		_windows: [],
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
			item.className = "attrsInspector-item";

			overflowBox.appendChild(item);

			defineGetter(this, "overflowBox", function() {
				return this._overflowBox.cloneNode(true);
			});
			return this.overflowBox;
		},
		getItem: function(header, value, spaceSep, state) {
			var overflowBox = this.overflowBox;
			var item = overflowBox.firstChild;
			item.appendChild(this.getHeader(header, state));
			if(value) {
				item.appendChild(spaceSep ? this.space : this.separator);
				item.appendChild(this.getValue(value, state));
			}
			return overflowBox;
		},
		_setDataLast: [0, 0, 0, 0, 0],
		_setDataMinDelay: 5*150,
		_setDataScheduled: false,
		setDataProxy: function(node) {
			if(this._setDataScheduled)
				return;
			var dt = this._setDataLast[0] + this._setDataMinDelay - Date.now();
			if(dt > 0) {
				this._setDataScheduled = true;
				this.timer(function(node) {
					if(node == this._node) {
						this.setData.apply(this, arguments);
						this.setDataProxyTime();
					}
					this._setDataScheduled = false;
				}, this, dt, arguments);
				return;
			}
			this.setData.apply(this, arguments);
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

			//while(tt.hasChildNodes())
			//	tt.removeChild(tt.lastChild);
			tt.textContent = "";
			// Firefox sometimes sets width/height to limit very huge tooltip
			tt.removeAttribute("width");
			tt.removeAttribute("height");

			var df = tt.ownerDocument.createDocumentFragment();

			if(node.nodeType == node.DOCUMENT_NODE) {
				df.appendChild(this.getItem(node.nodeName));
				df.appendChild(this.getItem("documentURI", node.documentURI));
				node.title && df.appendChild(this.getItem("title", node.title));
				tt.appendChild(df);
				return;
			}

			var rect = this.getRect(node);
			var w = rect && rect.width;
			var h = rect && rect.height;
			if(!w && !h)
				df.appendChild(this.getItem(node.nodeName));
			else {
				if(Math.floor(w) != w)
					w = w.toFixed(3);
				if(Math.floor(h) != h)
					h = h.toFixed(3);
				df.appendChild(this.getItem(node.nodeName, "[" + w + "\xd7" + h + "]", true));
			}

			var nodeNS = node.namespaceURI;
			if(_showNamespaceURI/* && node.nodeName.indexOf(":") == -1*/)
				df.appendChild(this.getItem("namespaceURI", this.getNS(nodeNS)));

			if(!node.attributes) {
				df.appendChild(this.getItem("nodeValue", node.nodeValue));
				tt.appendChild(df);
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

			var attrs = Array.slice(node.attributes);
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
						val = val
							.replace(
								"outline-color: " + _borderColor + "; "
									+ "outline-style: " + _borderStyle + "; "
									+ "outline-width: " + _borderWidth + "px; "
									+ "outline-offset: -" + _borderWidth + "px;",
								""
							)
							.replace(/^ | $/g, "");
						if(!val)
							return;
					}
				}
				if(_showNamespaceURI && ns && ns != nodeNS && name.indexOf(":") == -1)
					name += " [" + this.getNS(ns) + "]";
				df.appendChild(this.getItem(name, val, false, {
					isAdded:   name in addedAttrs && addedAttrs[name] == ns,
					isChanged: name in changedAttrs && changedAttrs[name] == ns,
					isRemoved: name in removedAttrs && removedAttrs[name].namespaceURI == ns
				}));
			}, this);
			tt.appendChild(df);
		},
		getRect: function(node) {
			if(!(node instanceof Element)) try {
				var rng = node.ownerDocument.createRange();
				rng.selectNodeContents(node);
				node = rng;
			}
			catch(e) {
				Components.utils.reportError(e);
			}
			try {
				var rect = "getBoundingClientRect" in node
					? node.getBoundingClientRect()
					: node instanceof XULElement
						? node.boxObject
						: node.ownerDocument && "getBoxObjectFor" in node.ownerDocument
							&& node.ownerDocument.getBoxObjectFor(node);
			}
			catch(e) {
			}
			if(rect && !("width" in rect)) {
				rect.width = rect.right - rect.left;
				rect.height = rect.bottom - rect.top;
			}
			return rect;
		},
		getScreenRect: function(node) {
			var win = node.ownerDocument.defaultView;
			var scale = 1;
			try {
				var utils = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIDOMWindowUtils);
				scale = utils.screenPixelsPerCSSPixel || 1;
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
			if(_showNamespaceURI == 1)
				return ns;
			switch(ns) {
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
			return String(ns); // Can be null for #text
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
			var pv = this.appInfo.platformVersion;
			var vc = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
				.getService(Components.interfaces.nsIVersionComparator);
			var v;
			if(vc.compare(pv, "5.0a1pre") >= 0)
				v = parseFloat(pv);
			else if(vc.compare(pv, "2.0a1pre") >= 0)
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
			delete this.fxVersion;
			return this.fxVersion = v;
		},
		get noStyles() {
			delete this.noStyles;
			//return this.noStyles = this.fxVersion < 3;
			return this.noStyles = Components.ID("{41d979dc-ea03-4235-86ff-1e3c090c5630}")
				.equals(Components.interfaces.nsIStyleSheetService);
		},
		stopEvent: function(e) {
			e.preventDefault();
			e.stopPropagation();
			"stopImmediatePropagation" in e && e.stopImmediatePropagation();
			//_log("stopEvent: " + e.type);
		},
		_timers: { __proto__: null },
		_timersCounter: 0,
		timer: function(callback, context, delay, args) {
			var id = ++this._timersCounter;
			var _timers = this._timers;
			var timer = _timers[id] = Components.classes["@mozilla.org/timer;1"]
				.createInstance(Components.interfaces.nsITimer);
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
			var flasher = Components.classes["@mozilla.org/inspector/flasher;1"]
				.getService(Components.interfaces.inIFlasher);
			flasher.color = _borderColor;
			flasher.thickness = _borderWidth;
			flasher.invert = false;

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

			if(this.noStyles) {
				this._oldStyle = node.hasAttribute("style") && node.getAttribute("style");
				node.style.outline = _borderWidth + "px " + _borderStyle + " " + _borderColor;
				node.style.outlineOffset = "-" + _borderWidth + "px";
				//return;
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
				this.flasher.repaintElement(this.getTopWindow(win.top).document.documentElement);
				return;
			}

			if(this.noStyles) {
				if(this._oldStyle || this._oldStyle === "")
					node.setAttribute("style", this._oldStyle);
				else
					node.removeAttribute("style");
				//return;
			}
			node.removeAttributeNS(this.context.hlAttrNS, this.context.hlAttr);
		},

		get mutationObserver() {
			var _this = this;
			function callback() {
				_this.handleMutations.apply(_this, arguments);
			}
			delete this.mutationObserver;
			return this.mutationObserver = "MutationObserver" in this.window // Firefox 14+
				&& new this.window.MutationObserver(callback);
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
				mo.observe(node, {
					attributes: true,
					attributeOldValue: true
				});
				return;
			}
			// Legacy version
			if(this.fxVersion != 2)
				var aw = this;
			else { // Hack for Firefox 2.0
				var aw = this._attrsWatcher = {
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
				// The clipboard will be cleared when private browsing mode ends
				var privacyContext = sourceWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIWebNavigation)
					.QueryInterface(Components.interfaces.nsILoadContext);
				ta.init(privacyContext);
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
				var text = Array.map(tt.childNodes, function(node) {
					return node.textContent;
				}).join("\n");
				//while(tt.hasChildNodes())
				//	tt.removeChild(tt.lastChild);
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
		keypressHandler: function(e, top) {
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
				this.stopSingleEvent(top, "keyup");
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
					this.navigateUp(top);
			}
			else if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_DOWN) { // Ctrl+Down
				this.stopEvent(e);
				if(!onlyStop)
					this.navigateDown();
			}
			if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_RIGHT) { // Ctrl+Right
				this.stopEvent(e);
				if(!onlyStop)
					this.navigateNext(top);
			}
			else if(ctrlOrCtrlShift && e.keyCode == e.DOM_VK_LEFT) { // Ctrl+Left
				this.stopEvent(e);
				if(!onlyStop)
					this.navigatePrev(top);
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
				this.stopSingleEvent(top, "keyup");
				var nodes = this._nodes;
				nodes.length && this.inspect(nodes[0], top, e.shiftKey);
			}
		},
		navigateUp: function(top) {
			var nodes = this._nodes;
			var node = nodes.length && this.getParentNode(nodes[0], top);
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
		navigateNext: function(top) {
			this.navigateSibling(true, top);
		},
		navigatePrev: function(top) {
			this.navigateSibling(false, top);
		},
		navigateSibling: function(toNext, top) {
			var nodes = this._nodes;
			if(!nodes.length)
				return;
			var node = nodes[0];
			//var sibling = node;
			//do sibling = toNext ? sibling.nextSibling : sibling.previousSibling;
			//while(_excludeSiblingTextNodes && sibling && !(sibling instanceof Element));
			var parent = this.getParentNode(node, top);
			var siblings = parent && this.getChildNodes(parent, node);
			if(!siblings || siblings.length < 2)
				return;
			var max = siblings.length - 1;
			var pos = Array.indexOf(siblings, node);
			if(pos == -1)
				return;
			var shift = toNext ? 1 : -1;
			var sibling;
			for(var i = pos + shift; ; i += shift) {
				/* Uncomment to use cycle navigation
				if(i < 0)
					i = max;
				else if(i > max)
					i = 0;
				if(i == pos)
					break;
				*/
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
		get dwu() {
			delete this.dwu;
			return this.dwu = Components.classes["@mozilla.org/inspector/dom-utils;1"]
				.getService(Components.interfaces.inIDOMUtils);
		},
		getParentNode: function(node, top) {
			var pn = this.dwu.getParentForNode(node, true);
			if(!pn && node.nodeType == Node.DOCUMENT_NODE && node != top.document)
				pn = this.getParentFrame(node, top.document); // Only for Firefox 1.5
			return pn;
		},
		getTopWindow: function(window) {
			for(;;) {
				var browser = this.dwu.getParentForNode(window.document, true);
				if(!browser)
					break;
				window = browser.ownerDocument.defaultView.top;
			}
			return window;
		},
		getChildNodes: function(node, child) {
			if(_preferNotAnonymousChildNodes) {
				var childNodes = node.childNodes;
				if(!childNodes.length && "getAnonymousNodes" in node.ownerDocument)
					childNodes = node.ownerDocument.getAnonymousNodes(node);
				return childNodes;
			}
			var dwu = this.dwu;
			if("getChildrenForNode" in dwu) // Gecko 7.0+
				return dwu.getChildrenForNode(node, true);
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
		copyTootipContent: function() {
			var node = this._node;
			var sourceWindow = node && (node.ownerDocument || node).defaultView;
			var tt = this.context.tt;
			var text = Array.map(tt.childNodes, function(node) {
				return node.textContent;
			}).join("\n");
			var _tt = tt.cloneNode(true);
			Array.forEach(_tt.getElementsByAttribute("class", "attrsInspector-value"), function(elt) {
				elt.style.whiteSpace = "pre";
			});
			if(_tt.firstChild.style.whiteSpace == "-moz-pre-wrap") // Part of hack for Firefox 1.5 and 2.0
				_tt.firstChild.style.whiteSpace = "pre";
			var html = Array.map(_tt.childNodes, function(node) {
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
		stopSingleEvent: function(target, type) {
			target.addEventListener(type, {
				target: target,
				context: this,
				handleEvent: function(e) {
					this.target.removeEventListener(e.type, this, true);
					this.context.stopEvent(e);
				}
			}, true);
		},
		getParentFrame: function(document, doc) {
			// We don't check anonymous nodes now
			var browser;
			const XULNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
			Array.concat(
				Array.slice(doc.getElementsByTagNameNS(XULNS, "tabbrowser")),
				Array.slice(doc.getElementsByTagNameNS(XULNS, "browser")),
				Array.slice(doc.getElementsByTagName("iframe")),
				Array.slice(doc.getElementsByTagName("frame"))
			).some(function(br) {
				if(!("contentDocument" in br))
					return false;
				var doc = br.contentDocument;
				_log(
					"Search parent frame: <" + br.nodeName + "> "
					+ (doc.title ? doc.title + " " : "") + doc.documentURI
				);
				if(
					doc == document
					|| (br = this.getParentFrame(document, doc))
				) {
					browser = br.localName.toLowerCase() == "tabbrowser" && br.selectedBrowser || br;
					return true;
				}
				return false;
			}, this);
			return browser;
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
		clickHandler: function(e, top) {
			if(!this.canInspect(e))
				return;
			this._checkPreventDefault(e);
			this.stopEvent(e);
			var nodes = this._nodes;
			var node = nodes.length ? nodes[0] : e.originalTarget;
			this.inspect(node, top, e.shiftKey);
		},
		inspect: function(node, top, forcePopupLocker) {
			var inspect = this.context.inspector;
			if(inspect && _popupLocker && (_popupLocker == 2 || forcePopupLocker))
				this.lockPopup(node, top);
			this.stop();
			_log(inspect ? "Open DOM Inspector for <" + node.nodeName + ">" : "DOM Inspector not found!");
			inspect && inspect(node, top, forcePopupLocker);
			this.closeMenus(node);
			this.hideUnclosedPopups();
			if(!inspect) {
				var label = this.context.button && this.context.button.label
					|| "Attributes Inspector";
				Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService)
					.alert(top, label, "DOM Inspector isn't found!");
			}
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
		lockPopup: function(node, top) {
			var popup = this.getPopup(node);
			if(!popup)
				return;

			var popupLocker = {
				domiWindow: null,
				window: top,
				popup: popup,
				tt: this.context.tt,
				ww: this.context.ww,
				closeMenus: this.closeMenus,
				stopEvent: this.stopEvent,
				stopSingleEvent: this.stopSingleEvent,
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
							var onlyStop = e.type == "keydown" || e.type == "keyup";
							if(e.keyCode == e.DOM_VK_ESCAPE) {
								this.stopEvent(e);
								if(onlyStop)
									return;
								this.stopSingleEvent(this.window, "keyup");
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
			if("defaultPrevented" in e ? e.defaultPrevented : e.getPreventDefault())
				_log('Warning! Default action for "' + e.type + '" event is already cancelled!');
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
			this.__shiftKey = val;
			!val && this.hideUnclosedPopups();
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
			if(this._shiftKey)
				return;
			var tar = e.originalTarget;
			if(tar.localName == "tooltip" && tar.id != this.context.ttId) {
				this.stopEvent(e);
				_log("Forbid tooltip showing: " + this._getPopupInfo(tar));
			}
		},
		popupshownHandler: function(e) {
			var tar = e.originalTarget;
			if(tar.id == this.context.ttId || /*this._shiftKey && */tar.localName == "tooltip")
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
			if(/*tar.localName == "tooltip" && */tar.id != this.context.ttId) {
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
	this.evtHandler = function(win) {
		var gh = this.globalHandler;
		var hi = gh._windows.indexOf(win);
		if(hi != -1)
			return gh._handlers[hi];

		this.currentWindow = win;
		gh._handlers.push(this);
		gh._windows.push(win);
		return this;
	};
	this.evtHandler.prototype = {
		globalHandler: this.evtHandlerGlobal,
		handleEvent: function(e) {
			this.globalHandler[e.type + "Handler"](e, this.currentWindow);
		}
	};
	defineGetter(this, "inspector", function() {
		if(!("@mozilla.org/commandlinehandler/general-startup;1?type=inspector" in Components.classes)) {
			_log("DOM Inspector not installed!");
			return null;
		}
		if((_showFullTree || _nodePosition >= 0) && this.evtHandlerGlobal.fxVersion >= 2) {
			return function(node, top) {
				var inspWin = window.openDialog(
					"chrome://inspector/content/",
					"_blank",
					"chrome,all,dialog=no",
					_showFullTree == 0
						? node.ownerDocument || node
						: _showFullTree == 1
							? (node.ownerDocument || node).defaultView.top.document
							: (top || window.top).document
				);
				var tryDelay = 5;
				function inspect() {
					if(!inspWin.inspector) {
						inspWin.setTimeout(inspect, tryDelay);
						return;
					}
					try {
						try {
							// Avoid warnings in error console after getViewer("dom")
							var hash = inspWin.inspector.mPanelSet.registry.mViewerHash;
						}
						catch(e1) {
							Components.utils.reportError(e1);
						}
						if(!hash || ("dom" in hash)) {
							var viewer = inspWin.inspector.getViewer("dom");
							var prefs = Components.classes["@mozilla.org/preferences-service;1"]
								.getService(Components.interfaces.nsIPrefBranch);
							const blinkPref = "inspector.blink.on";
							var blink = prefs.getBoolPref(blinkPref);
							blink && prefs.setBoolPref(blinkPref, false);
							try {
								if("showNodeInTree" in viewer) // New DOM Inspector
									viewer.showNodeInTree(node);
								else
									viewer.selectElementInTree(node);
								if(_nodePosition >= 0) {
									var tbo = viewer.mDOMTree.treeBoxObject;
									var cur = tbo.view.selection.currentIndex;
									var first = tbo.getFirstVisibleRow();
									var visibleRows = tbo.height/tbo.rowHeight;
									var newFirst = cur - _nodePosition*visibleRows + 1;
									tbo.scrollByLines(Math.round(newFirst - first));
									tbo.ensureRowIsVisible(cur); // Should be visible, but...
								}
								return;
							}
							catch(e2) {
								Components.utils.reportError(e2);
							}
							finally {
								blink && prefs.setBoolPref(blinkPref, true);
							}
						}
					}
					catch(e) {
						Components.utils.reportError(e);
					}
					inspWin.setTimeout(inspect, tryDelay);
				}
				inspWin.addEventListener("load", function showNode(e) {
					inspWin.removeEventListener("load", showNode, false);
					inspect();
				}, false);
			};
		}

		var ws = this.wm.getEnumerator(null);
		while(ws.hasMoreElements()) {
			var w = ws.getNext();
			if("inspectDOMNode" in w) {
				return function(node, top) {
					w.inspectDOMNode(node);
				};
			}
		}
		_log("Can't find window with DOM Inspector's inspectDOMNode()");
		return null;
	});

	this.setAllListeners(ael);
	this.ww.registerNotification(this.evtHandlerGlobal);
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
				: this.evtHandlerGlobal.noStyles
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

	var ehg = this.evtHandlerGlobal;
	ehg.unwatchAttrs();
	ehg.unhl();
	ehg.destroyTimers();
	if(!_highlightUsingFlasher) {
		var sss = this.sss;
		var cssURI = this.cssURI;
		if(sss.sheetRegistered(cssURI, sss.AGENT_SHEET))
			sss.unregisterSheet(cssURI, sss.AGENT_SHEET);
		if(sss.sheetRegistered(cssURI, sss.USER_SHEET))
			sss.unregisterSheet(cssURI, sss.USER_SHEET);
	}
	this.setAllListeners(rel);
	this.ww.unregisterNotification(ehg);
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
					var focusedWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow(null);
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
		Array.slice(document.getElementsByAttribute("cb_id", keyCbId)).forEach(function(key) {
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