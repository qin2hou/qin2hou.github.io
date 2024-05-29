(function() {
    var model = {
        time: {},
        isMilitaryTime: true, // 默认24小时制
        timeAbbr: "",
        lastestMinutes: undefined,
        toastTime: 1.8, // 单位秒,取一位小数，默认值1.8
        isPlay: false,
        musicLib: ["","soft_rain_01.mp3","Luv.mp3"],
        musicSrc: "source/Luv.mp3",
        musicNum: 0,
        style: ["clock","poem","todoList"],
        styleType: 1,
        todoList: [],
        poemAddress: "/source/poem_en.json",
        poemObj: {}, // json文件
        poemNumber: 0, // 诗歌序号
        poemQuantities: 0, // 诗歌数量
        poemObjName: "",
        poemText: "Nice to meet you!",
        poemCoordinate:[100, 200], // 诗歌显示的初始坐标
        refreshInterval: 100, // 单位毫秒
        poemRefreshInterval: 10, // 单位秒
    };


    var octopus = {
        init: function() {
            octopus.getCurrentTime(model.time);
            octopus.getPoemText(model.poemAddress);
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
        updateTime: function(time) {
            var t = setInterval(function() {
                model.lastestMinutes = model.time.minutes;
                octopus.getCurrentTime(model.time);
                if (!model.isMilitaryTime) {
                    octopus.translateTwelveHour(model.time);
                };
                if (model.toastTime > 0) {
                    model.toastTime = model.toastTime - 0.1;
                };
                if (model.poemRefreshInterval > 0){
                    model.poemRefreshInterval = model.poemRefreshInterval - 0.1;
                } else if(model.time.seconds == "00" ||  model.poemRefreshInterval == "0"){
                    octopus.togglePoemNumber();
                    model.poemRefreshInterval = 60;
                }
                
                view.render();
            }, time); 
        },
        toggleHourSystems: function() {
            model.isMilitaryTime = !model.isMilitaryTime;
            if (!model.isMilitaryTime) {         
                octopus.translateTwelveHour(model.time);
            }
            view.render();
        },
        getPoemText: function(addr){
            const xhr = new XMLHttpRequest();
            model.poemObjName = model.time.hours+":"+model.time.minutes;
            xhr.open('get', addr, true);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const jsonStr = xhr.responseText;
                    model.poemObj = JSON.parse(jsonStr);
                    // console.log(model.poemObj);
                    model.poemQuantities = model.poemObj[model.poemObjName].length;
                    model.poemText = model.poemObj[model.poemObjName][model.poemNumber];
                }
            }
            xhr.send();

        },
        getTodoListText: function(){
            model.todoList = ["增加播放器","增加圆形时钟显示","挑选js库"];
        },
        toggleMusic: function(){
            if (model.musicNum < model.musicLib.length) {
                model.musicNum += 1;
            } else {
            }
            if(model.musicNum == model.musicLib.length) {
                model.isPlay = false;
                model.musicNum = 0;
            } else {
                model.isPlay = true;
            }
            model.musicSrc = model.musicLib[model.musicNum];

            //  console.log(model.isPlay);
            if (model.isPlay) {
                view.playBgm();
            } else {
                view.pauseBgm();
            }
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
            model.poemNumber = Math.floor(Math.random()*model.poemQuantities);
            //console.log(model.poemNumber);
            //console.log(model.poemQuantities);
            model.poemCoordinate[0]= Math.random()*(window.innerWidth-view.poemElem.offsetWidth*1);// 0-页面宽度
            model.poemCoordinate[1]= Math.random()*(window.innerHeight-view.poemElem.offsetHeight*1);// 0-页面高度 
            view.render();
        },
        // updatePoemPosition: function(time){
        //     var t = setInterval(function() {
        //         octopus.togglePoemNumber();
        //         view.render();
        //     }, time); 
        // }
    };
    var view = {
        init: function() {
            view.hoursElem = document.getElementById("hours");
            view.minutesElem = document.getElementById("minutes");
            view.pmElem = document.getElementById("pm"); 
            view.messageElem = document.getElementById("message");
            view.bgmButtonElem = document.getElementById("bgm-btn");
            view.changeClockElem = document.getElementById("cc-btn");
            view.fsButtonElem = document.getElementById("fs-btn");

            
            view.fullscreenElem = document.getElementById("fullscreen");
            view.bodyElem = document.getElementsByTagName("body")[0];
            view.clockElem = document.getElementById("clock");
            view.poemElem = document.getElementById("poem-text");
            view.poemTimeElem = document.getElementById("poem-time");
            view.todoListElem = document.getElementById("todoList");


            view.audioElem = document.getElementById("softRain");
            model.musicSrc = "Luv.mp3";
            view.playBgm();

            view.documentElem = document.documentElement;
            // view.todoListElem.innerText = model.todoList;
            // model.messageElem.style.display = "block";
            view.messageElem.innerText =  "按"+"\xa0\xa0\xa0"+"Enter"+ "\xa0\xa0\xa0" +"进入全屏";
            view.hoursElem.addEventListener("click", function() {
                octopus.toggleHourSystems();
            });
            view.bgmButtonElem.addEventListener("click", function() {
                octopus.toggleMusic();
            });
            view.changeClockElem.addEventListener("click", function() {
                octopus.toggleStyle();
            });
            view.poemElem.addEventListener("click",function(){
                octopus.togglePoemNumber();
            });
            view.fsButtonElem.addEventListener("click", function(){
                if (!isFullScreen()) {                     
                    requestFullScreen(view.documentElem);
                }else {
                    cancelFullScreen();
                }
            });

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
            console.log("Hava a good day~");
            octopus.updateTime(model.refreshInterval);
        },
        render: function() {

            // if (!model.isPlay) {
            //     view.pauseBgm();
            // } else {
            //     view.playBgm();
            // }
            if(model.toastTime <=0 ){
                view.hideMessage();
            }

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
            // if (model.style[model.styleType] == "poem") {
            //     octopus.updatePoemPosition(model.poemRefreshInterval);
            // }


           
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
            view.audioElem.src = "source/" + model.musicSrc;
            // view.audioElem.load();
            view.audioElem.addEventListener('canplaythrough',function(){
                view.audioElem.play();
            },false);
           
            view.bgmButtonElem.style.backgroundColor = "red";
        },
        pauseBgm: function(){
            view.audioElem.pause();
            view.bgmButtonElem.style.backgroundColor = "#b0b0b0";
        },
        showClock: function(){
            view.clockElem.style.display = "flex";
        },
        hideClock: function(){
            view.clockElem.style.display = "none";
        },
        showPoem: function(){
            model.poemObjName = model.time.hours+":"+model.time.minutes;
            // console.log(model.poemObj);
            if(JSON.stringify(model.poemObj) !== "{}"){
                view.poemElem.innerText = model.poemText;
            } 
            view.poemElem.innerText = model.poemText;
            view.poemElem.style.display = "block";
            view.poemTimeElem.style.display = "block";
            model.poemCoordinate[1] = view.poemElem.offsetHeight+model.poemCoordinate[1]>window.innerHeight?window.innerHeight-view.poemElem.offsetHeight*2-100:model.poemCoordinate[1];
            if (model.poemCoordinate[1] < 50) {
                model.poemCoordinate[1] = 50;
            }
            model.poemCoordinate[0] = view.poemElem.offsetWidth+model.poemCoordinate[0]>window.innerWidth?window.innerWidth-view.poemElem.offsetWidth*2-100:model.poemCoordinate[0];
            if (model.poemCoordinate[0] < 50) {
                model.poemCoordinate[0] = 50;
            }
            view.poemElem.style.left = model.poemCoordinate[0]+"px";
            view.poemElem.style.top = model.poemCoordinate[1]+"px";  
            
            var ctime = model.time;
            view.poemTimeElem.innerText = ctime.year + "-" + ctime.month + "-" + ctime.day + "\xa0\xa0\xa0\xa0" + ctime.hours + ":"+ ctime.minutes + ":" + ctime.seconds;
            view.poemTimeElem.style.left = model.poemCoordinate[0]+8+"px";
            view.poemTimeElem.style.top = model.poemCoordinate[1]-20+"px";

            view.bodyElem.style.backgroundColor = "#d4dfe2";
            view.messageElem.style.backgroundColor = "#d4dfe2";
            view.messageElem.style.color = "black";
            view.messageElem.innerText ="\xa0\xa0\xa0\xa0"+"按"+"\xa0\xa0\xa0"+"Enter"+ "\xa0\xa0\xa0" +"进入全屏...";
        },
        hidePoem: function(){
            view.poemElem.style.display = "none";
            view.poemTimeElem.style.display = "none";
            view.bodyElem.style.backgroundColor = "black";
            view.messageElem.style.backgroundColor = "#202328";
            view.messageElem.style.color = "#f0f0f0";
            view.messageElem.innerText ="按"+"\xa0\xa0\xa0"+"Enter"+ "\xa0\xa0\xa0" +"进入全屏";
        },
        showTodoList: function(){
            // console.log("todo..");
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
