function tabsHover() {
	var hdtabs = document.getElementById("hdtabs");
	hdtabs.addEventListener("mouseover",tabsMouseoverHandler);
	hdtabs.addEventListener("mouseleave",tabsMouseleaveHandler);
	hdtabs.addEventListener("click",tabsClickHandler);
}
function tabsMouseoverHandler(event){
	var target = event.target;
	var cursor = document.getElementsByClassName("tabs_cursor")[0];	
	if (target.nodeName == "LI") {
		var active = hdtabs.getElementsByClassName("z-active")[0];
		if (target.className == "z-active") {
			active.style.color = "#5ed0ba";
		}else {
			active.style.color = "#dcdddd";
		}
		cursor.style.width = target.offsetWidth + 'px';
		cursor.style.left = target.offsetLeft + 'px';		
	}	
}

function tabsMouseleaveHandler(event) {
	var target = event.target;
	var cursor = document.getElementsByClassName("tabs_cursor")[0];
	if (target.className == "m-nav") {
		var active = hdtabs.getElementsByClassName("z-active")[0];
		active.style.color = "#5ed0ba";
		cursor.style.width = active.offsetWidth + 'px';
		cursor.style.left = active.offsetLeft + 'px';
	}
}
function tabsClickHandler(event) {
	var target = event.target;	
	if (target.nodeName == "LI") {
		var active = hdtabs.getElementsByClassName("z-active")[0];
		if (target.className != "z-active") {
			active.style.color = "";
			target.className = "z-active";
			active.className = "";
		}else {
			//
		}
		return false;
	}
}
