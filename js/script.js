(function() {
    var model = {
        time: {},
        isMilitaryTime: true, // 默认24小时制
        timeAbbr: "",
        lastestMinutes: undefined,
        toastTime: 1.8, // 单位秒,取一位小数，默认值1.8
        isPlay: false,
        style: ["clock","poem","todoList"],
        styleType: 1,
        poemText: "",
        todoList: [],
        poemObj: {},
        poemNumber: 0
    };


    var octopus = {
        init: function() {
            octopus.getCurrentTime(model.time);
            octopus.getPoemText();
            octopus.getTodoListText();
            view.init();
        },
        getCurrentTime: function(timeObj) {
            let time = new Date();
            timeObj.year = time.getFullYear();
            timeObj.month = octopus.addZero(time.getMonth() + 1);
            timeObj.day = octopus.addZero(time.getDate());
            timeObj.hours = time.getHours();
            //timeObj.hours = 0; // 调试24小时制
            timeObj.minutes = octopus.addZero(time.getMinutes());
            // timeObj.minutes = 12;
            timeObj.seconds = octopus.addZero(time.getSeconds());
            return timeObj;
        },
        addZero: function(time) {
            if (time < 10) {
                return "0" + time;
            } else {
                return time;
            }
        },
        translateTwelveHour: function(timeObj) {
            if(timeObj.hours > 12){
                timeObj.hours = timeObj.hours - 12;
                model.timeAbbr = "PM";
            }else if (timeObj.hours == 12){
                model.timeAbbr = "PM";
            }else if (timeObj.hours == 0){
                timeObj.hours = 12;
                model.timeAbbr = "AM";
            }else {
                model.timeAbbr = "AM";
            }
            return timeObj;
        },
        updateTime: function() {
            var t = setInterval(function() {
                model.lastestMinutes = model.time.minutes;
                octopus.getCurrentTime(model.time);
                if (!model.isMilitaryTime) {
                    octopus.translateTwelveHour(model.time);
                };
                if (model.toastTime > 0) {
                    model.toastTime = model.toastTime - 0.1;
                };
                view.render();
            }, 100); // 默认100ms刷新一次
        },
        toggleHourSystems: function() {
            model.isMilitaryTime = !model.isMilitaryTime;
            if (!model.isMilitaryTime) {         
                octopus.translateTwelveHour(model.time);
            }
            view.render();
        },
        getPoemText: function(){
            const xhr = new XMLHttpRequest();
            xhr.open('get', '/source/poem.json', true);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const jsonStr = xhr.responseText;
                    model.poemObj = JSON.parse(jsonStr);
                    //console.log(model.poemObj);
                    // model.poemNumber = Math.floor(Math.random()*100+1);
                    // console.log(model.poemNumber);
                    model.poemText = model.poemObj["kk_quote"][model.poemNumber];
                }
            }
            xhr.send();

            // model.poemText = "hello there...";
        },
        getTodoListText: function(){
            model.todoList = ["添加poem显示","拆分样式表","修改刷新逻辑"];
        },
        toggleMusic: function(){
            model.isPlay = !model.isPlay;
            //console.log("playing...");
        },
        toggleStyle: function(){
            if (model.styleType < model.style.length - 1){
                model.styleType ++;
            }else {
                model.styleType = 0;
            }
        },
        togglePoemNumber: function(){
            model.poemNumber = Math.floor(Math.random()*500+1);
            console.log(model.poemNumber);
            view.render();
        }
    };
    var view = {
        init: function() {
            view.hoursElem = document.getElementById("hours");
            view.minutesElem = document.getElementById("minutes");
            view.pmElem = document.getElementById("pm"); 
            view.messageElem = document.getElementById("message");
            view.bgmElem = document.getElementById("bgm");
            view.noteButtonElem = document.getElementById("noteButton");
            view.audioElem = document.getElementById("softRain");
            view.fullscreenElem = document.getElementById("fullscreen");
            view.bodyElem = document.getElementsByTagName("body")[0];
            view.clockElem = document.getElementById("clock");
            view.poemElem = document.getElementById("poem");
            view.todoListElem = document.getElementById("todoList");
            view.documentElem = document.documentElement;
            // view.todoListElem.innerText = model.todoList;
            // model.messageElem.style.display = "block";
            view.messageElem.innerText =  "按"+"\xa0\xa0\xa0"+"Enter"+ "\xa0\xa0\xa0" +"进入全屏";
            view.hoursElem.addEventListener("click", function() {
                octopus.toggleHourSystems();
            });
            view.bgmElem.addEventListener("click", function() {
                octopus.toggleMusic();
            });
            view.noteButtonElem.addEventListener("click", function() {
                octopus.toggleStyle();
            });
            view.poemElem.addEventListener("click",function(){
                octopus.togglePoemNumber();
            })

            document.onkeydown = function(event) {
                var code = event.keyCode;
                if (code == 13) {
                    event.preventDefault();
                    if (!isFullScreen()) {                     
                        requestFullScreen(view.documentElem);
                    }else {
                        cancelFullScreen();
                    }       
                };
            };

            octopus.updateTime();
        },
        render: function() {
            switch(model.styleType){
                case 0:
                view.hidePoem();
                view.hideTodoList();
                view.showClock();
                break;
                case 1:
                view.hideClock();
                view.hideTodoList();
                view.showPoem();
                break;
                case 2:
                view.hidePoem();
                view.hideClock();
                view.showTodoList();
                break;
            }
            
            if (model.isPlay) {
                view.playBgm();
            } else {
                view.pauseBgm();
            }

            if (model.style[model.styleType] == "clock") {
                view.hoursElem.innerText = model.time.hours;
                view.minutesElem.innerText = model.time.minutes;
                if (model.isMilitaryTime) {
                    view.hideAbbr();
                }else {
                    view.showAbbr();
                };
                if (view.hoursElem.innerText != model.time.hours) {
                    view.hoursElem.innerText = model.time.hours;
                };
                if (view.minutesElem.innerText != model.time.minutes) {
                    view.minutesElem.innerText = model.time.minutes;
                };
            }
            

            
            if(model.toastTime <=0 ){
                view.hideMessage();
            }
        },
        showAbbr: function() {
            view.pmElem.innerText = model.timeAbbr;
        },
        hideAbbr: function() {
            view.pmElem.innerText = "";
        },
        showMessage: function() {
            view.messageElem.style.display = 'block';
        },
        hideMessage: function() {
            view.messageElem.style.display = 'none';
        },
        playBgm: function(){
            view.audioElem.play();
            view.bgmElem.style.backgroundColor = "red";
        },
        pauseBgm: function(){
            view.audioElem.pause();
            view.bgmElem.style.backgroundColor = "#b0b0b0";
        },
        showClock: function(){
            view.clockElem.style.display = "flex";
        },
        hideClock: function(){
            view.clockElem.style.display = "none";
        },
        showPoem: function(){
            view.poemElem.innerText = model.poemObj["kk_quote"][model.poemNumber];
            view.poemElem.style.display = "block";
            view.bodyElem.style.backgroundColor = "#d4dfe2";
            view.messageElem.style.backgroundColor = "#d4dfe2";
            view.messageElem.style.color = "black";
            view.messageElem.innerText ="\xa0\xa0\xa0\xa0"+"按"+"\xa0\xa0\xa0"+"Enter"+ "\xa0\xa0\xa0" +"进入全屏...";
        },
        hidePoem: function(){
            view.poemElem.style.display = "none";
            view.bodyElem.style.backgroundColor = "black";
            view.messageElem.style.backgroundColor = "#202328";
            view.messageElem.style.color = "#f0f0f0";
            view.messageElem.innerText ="按"+"\xa0\xa0\xa0"+"Enter"+ "\xa0\xa0\xa0" +"进入全屏";
        },
        showTodoList: function(){
            console.log("todo..");
            view.todoListElem.innerText = "TODOLIST\n";
            for(i=0;i<=model.todoList.length-1;i++){
                view.todoListElem.innerText += (i+1)+"."+model.todoList[i] + "\n";
            }
            view.todoListElem.style.display = "block";
            view.todoListElem.style.backgroundColor = "white";
            view.bodyElem.style.backgroundColor = "#d4dfe2";
            view.messageElem.style.backgroundColor = "#d4dfe2";
            view.messageElem.style.color = "black";
            view.messageElem.innerText ="\xa0\xa0\xa0\xa0"+"按"+"\xa0\xa0\xa0"+"Enter"+ "\xa0\xa0\xa0" +"进入全屏...";
        },
        hideTodoList: function(){
            view.todoListElem.style.display = "none";
            view.todoListElem.style.backgroundColor = "black";
            view.messageElem.style.backgroundColor = "#202328";
            view.messageElem.style.color = "#f0f0f0";
            view.messageElem.innerText ="按"+"\xa0\xa0\xa0"+"Enter"+ "\xa0\xa0\xa0" +"进入全屏";
        }
        
    };

    function requestFullScreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
    //FireFox
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
    //Chrome等
        else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        }
    //IE11
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    };
    function cancelFullScreen(element) {
        if (document.exitFullScreen) {
            document.exitFullScreen();
        }
    //FireFox
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
    //Chrome等
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    //IE11
        else if (document.msExitFullScreen) {
            document.msExitFullScreen();
        }
    };
    function isFullScreen() {
        return  !! (
            document.fullscreen || 
            document.mozFullScreen ||                         
            document.webkitIsFullScreen ||       
            document.webkitFullScreen || 
            document.msFullScreen 
        );
    }

    window.onload = function() {
        octopus.init();
    };
})()
