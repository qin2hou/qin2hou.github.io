// var APP = (function(){
// 	var _ = {
// 		_.extend: function (o1, o2) {
// 			for (var i in o2) {
// 				if (typeof o1[i] == 'undefined') {
// 					o1[i] = o2[i];
// 				}
// 			}
// 			return o1;
// 		},
// 		_.addClass: function (node,className) {
// 			var oldName = node.className || "";
// 			if ((' '+oldName+' ').indexOf(' '+className+' ') == -1) {
// 				node.className = oldName ? (oldName + ' ' + className) : className; 
// 			}
// 		},
// 		_.delClass: function(node, className) {
// 			var oldName = node.className || " ";
// 			node.className = (' '+oldName+' ').repleace(' '+ className+ ' ',' ').trim();
// 		}
// 	};
// 	return _;
// })();


function addLoadEvent(func) {
	var oldLoad = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			oldLoad();
			func();
		}
	}
}



(function (APP) {
	function Tabs(options) {
		_.extend(this, options);
		this.index = this.index || 0;
		// 缓存节点

		this.nTab = this.container.getElementsByTagName("ul")[0];
		this.nTabs = this.nTab.children;

		// 动态构建滑动条
		this.cursors = html2node(template).cloneNode(true);
		var hdtabs = document.getElementById("hdtabs");
		hdtabs.appendChild(cursors);

		this.init();
	}
	Tabs.prototype.init = function () {
		for (i=0;i<this.nTabs.length;i++) {
			this.nTabs[i].addEventListener("mouseenter", function(index) {
				this.highlight(index);
			}.bind(this, i);
			this.nTabs[i].addEventListener("click",function(index) {
				this.setCurrent(index);
			}.bind(this,i);
			this.nTab.addEventListener("mouseleave",function() {
				this.highlight(this.index);
			}.bind(this));

			this.setCurrent(this.index);
			
		}
	}
	Tabs.prototype.highlight = function(index) {
		var target = event.target;
		nTabs[index].style.color = "#5ed0ba";
		cursors[index].style.width = target.offsetWidth + 'px';
		cursors[index].style.left = target.offsetLeft + 'px';
	}
	Tabs.prototype.setCurrent = function(index) {
		nTabs[index].className = "z-active";
	}



	APP.Tabs = Tabs;
})(window.APP);

	var template = 
	`<div class="tabs_cursors">
		<div class="tabs_cursor" style="width: 68px;left: 0;"></div>
	</div>`;

	function html2node(str) {
		var container = document.createElement('div');
		container.innerHTML = str;
		return container.children[0];
	}

	var  = html2node(template);


// var tabs = new Tabs({
// 	index: 1,
// 	drag: true
// });




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

addLoadEvent(tabsHover);