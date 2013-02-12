// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/oneTimeCommand.js
// Lazy initialize button using "code" section

// Some initialization
function action() {
	alert("action()");
}

// Prevent subsequent execution of code from button's "code" section
var btn = this;
addEventListener("command", function(e) {
	if(e.target != btn)
		return;
	e.preventDefault();
	e.stopPropagation();
	// Called after second and following clicks on the button:
	alert("Catch command: don't initialize twice");
	action();
}, true, this.parentNode);

// Called only after first click on the button:
alert("Initialize");
action();