// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/multilinePrompt.js
// Multiline prompt example: opens custom dialog like built-in prompt() function
// Note: may be used not only in Custom Buttons :)

function multilinePrompt(title, desc, defaultVal) {
	function encodeHTML(s, isAttr) {
		s = String(s)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
		if(isAttr) {
			s = s
				.replace(/\t/g, "&#x9;")
				.replace(/\n/g, "&#xA;")
				.replace(/\r/g, "&#xD;");
		}
		return s;
	}
	var xul = '<?xml version="1.0"?>\n\
		<?xml-stylesheet href="chrome://global/skin/" type="text/css"?>\n\
		<dialog xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"\n\
			title="' + encodeHTML(title, true) + '"\n\
			buttons="accept,cancel"\n\
			onload="var ifi = text.inputField; ifi.selectionStart = 0; ifi.selectionEnd = ifi.value.length;"\n\
			ondialogaccept="out(text.value);"\n\
			ondialogcancel="out(null);">\n\
			<label value="' + encodeHTML(desc) + '" />\n\
			<textbox id="text" multiline="true" flex="1"\n\
				cols="40" rows="4"\n\
				value="' + encodeHTML(defaultVal || "", true) + '" />\n\
			<script type="application/javascript">\n\
			var text = document.getElementById(\'text\');\n\
			function out(val) {\n\
				var out = window.arguments[0];\n\
				out.value = val;\n\
			}\n\
			</script>\n\
		</dialog>';
	var data = "data:application/vnd.mozilla.xul+xml," + encodeURIComponent(xul);
	var out = { value: null };
	window.openDialog(data, "_blank", "chrome,all,resizable,centerscreen,modal", out);
	return out.value;
}

// Usage example:
var text = multilinePrompt("Example", "Type some text here:", "Example\ndata...");
alert(text);