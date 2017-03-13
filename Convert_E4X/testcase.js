/*Initialization Code*/

// Testcase for Convert E4X button
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Convert_E4X
// Note: this isn't a real code... just looks like

var x = "E4X";
var y = "y";
var xulNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
XML.prettyPrinting = false;
var xml = <menupopup xmlns={xulNS}>
	<menuitem label="1" />
	<menu label="q\w">
		<menupopup>
			<menuitem label={x} />
			<menuitem label={"Some " + x + " here"} />
			<menuitem label="{" />
			<menuitem label="}" />
			<menuitem label="{x}" />
			<menuitem label="Some {data} here" />
		</menupopup>
	</menu>
</menupopup>;
this.appendChild(cbu.makeXML(xml));

var xml = <menupopup xmlns={xulNS}>
	<menuitem label="1" />
	<menu label="Menu 1">
		<menupopup>
			<menuitem label={x} />
			<menu label="Menu 2">
				<menupopup>
					<menu label={"x" + x}>
						<menupopup>
							<menuitem label="" />
							<menuitem label="" foo="{" bar="}" />
						</menupopup>
					</menu>
					<menuitem label={y} />
					<menuitem label={x + y} />
				</menupopup>
			</menu>
		</menupopup>
	</menu>
</menupopup>;
this.appendChild(cbu.makeXML(xml));

var xml = <menupopup xmlns={xulNS}>
	<menuitem label="1" />
	<menuitem label={x} />
</menupopup>;
this.appendChild(cbu.makeXML(xml));

var xml = <menupopup xmlns={xulNS} />;
this.appendChild(cbu.makeXML(xml));

var xml = <menupopup xmlns={xulNS}></menupopup>;
this.appendChild(cbu.makeXML(xml));

var box = "hbox";
var ipi = XML.ignoreProcessingInstructions;
XML.ignoreProcessingInstructions = false;
var dialog = <>
	<?xml-stylesheet href="chrome://global/skin/"?>
	<dialog xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" title="Test">
		<{box}>
			<button label="1" />
			<button label="2" />
		</{box}>
	</dialog>
</>.toXMLString();
XML.ignoreProcessingInstructions = ipi;
window.openDialog(
	"data:application/vnd.mozilla.xul+xml," + encodeURIComponent(dialog),
	"_blank",
	"chrome,all,resizable,centerscreen"
);