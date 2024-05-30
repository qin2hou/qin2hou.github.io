// import { jsmediatag } from './jsmediatags.js'
// var jsmediatags = require("jsmediatags");

var jsmediatags = window.jsmediatags;
// console.log(jsmediatags);





(function() {
    var model = {
        time: {},
        isMilitaryTime: true, // 默认24小时制
        timeAbbr: "",
        lastestMinutes: undefined,
        toastTime: 1.8, // 单位秒,取一位小数，默认值1.8
        isPlay: false,
        musicLib: ["","Sayama_Rain_1.mp3","Luv.mp3","怀念.mp3"],
        musicDefaultNum: 2,// 设置默认音乐，数组角标表示第几首,undefined 表示无默认音乐
        musicSrc: "",
        musicNum: 0,
        musicAlbumCover: "",
        style: ["clock","poem","todoList","phonograph"],
        styleType: 3,
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
        // baseUrl : 'https://qin2hou.github.io/',
        baseUrl: 'http://127.0.0.1:3000/',
        angle: 0,
        rotateAngle: 0.25,  // 每0.01秒 旋转n度
        pTimer: {}, // 旋转动画定时器
        currentVolume: 10, // 默认音量,10为最大
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
            model.todoList = ["增加播放器","增加圆形时钟显示","挑选js库","拆分样式表"];
        },
        toggleMusic: function(){
            if (model.musicDefaultNum === undefined) {
                // 默认从第0首开始，空歌曲路径，即不播放
                if (model.musicNum == 0) {
                    model.isPlay = false;
                    model.musicSrc = "";
                }else{ // 如果不为0，就可以播放对应歌曲
                    model.isPlay = true;
                    model.musicSrc = "source/" + model.musicLib[model.musicNum];
                }
                // 如果歌曲列表结束了，从0开始
                if (model.musicNum < model.musicLib.length-1){
                    model.musicNum += 1;
                    // 调试用
                    //console.log(model.musicNum-1); 
                }else {
                    // 调试用
                    //console.log(model.musicNum);
                    model.musicNum = 0;
                }
            } else {
                // 如果有默认歌曲，直接播放，并且把默认歌曲改为undefined,避免下次继续播放默认歌曲
                model.musicSrc = "source/" + model.musicLib[model.musicDefaultNum];
                model.isPlay = true;
                // 调试用
                //console.log(model.musicDefaultNum);
                model.musicDefaultNum = undefined;                   
            }
            // 调试用
            // console.log(model.isPlay); 
            // console.log(model.musicSrc); 
            if (model.isPlay){
                view.playBgm();
            } else {
                view.pauseBgm();
            }
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
        toggleFullscreen: function(){
            if (!isFullScreen()) {                     
                requestFullScreen(view.documentElem);
                view.fsButtonElem.classList.remove("grey");
                view.fsButtonElem.classList.add("blue");
                
            }else {
                cancelFullScreen();                
                // view.fsButtonElem.classList.remove("blue");
                view.fsButtonElem.classList.add("grey");
            }
        },
        volumeUp: function(elem) {
            model.currentVolume = Math.min(10, model.currentVolume + 1);
            elem.volume = model.currentVolume/10;
        },
        volumeDown: function(elem) {
            model.currentVolume = Math.max(0, model.currentVolume - 1);
            elem.volume = model.currentVolume/10;
        }
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

            view.phonographElem = document.getElementById("phonograph");
            view.powerElem = document.getElementById("power");
            view.infoElem = document.getElementById("info");
            view.volumeIndicatorElem = document.getElementById("volume-indicator");
            view.platerElem = document.getElementById("plater");

            view.documentElem = document.documentElement;
            // view.todoListElem.innerText = model.todoList;
            // model.messageElem.style.display = "block";
            view.messageElem.innerText =  "按"+"\xa0\xa0\xa0\xa0\xa0\xa0"+"F"+ "\xa0\xa0\xa0\xa0\xa0\xa0" +"开始播放歌曲";
            view.showMessage();

            view.volumeIndicatorElem.style.top = 102 - model.currentVolume*10 + 'px';


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
                octopus.toggleFullscreen();  
            });

            view.powerElem.addEventListener("click", function(){
                // view.showSize();
                octopus.toggleMusic();
            });
            view.platerElem.addEventListener("click", function(){
                // view.showSize();
                octopus.toggleMusic();
            });

            document.onkeydown = function(event) {
                var code = event.keyCode;
                if (code == 13) {
                    event.preventDefault();
                    octopus.toggleFullscreen();      
                }else if (code == 70){
                    event.preventDefault();
                    octopus.toggleMusic();
                }else if (code == 9) {
                    event.preventDefault();
                    octopus.toggleStyle(); 
                } else if (code == 38) {
                    event.preventDefault();
                    octopus.volumeUp(view.audioElem);
                    view.volumeIndicatorElem.style.top = 102 - model.currentVolume*10 + 'px'; 
                    // console.log(view.audioElem.volume);
                } else if (code == 40) {
                    event.preventDefault();
                    octopus.volumeDown(view.audioElem);
                    view.volumeIndicatorElem.style.top = 102 - model.currentVolume*10 + 'px'; 
                    // console.log(view.audioElem.volume);
                } else if (code == 32) {
                    event.preventDefault();
                    if (model.isPlay) {
                        view.audioElem.pause();
                        clearInterval(model.pTimer);
                    } else {
                        view.audioElem.play();
                        model.pTimer = setInterval(view.rotatePic, 10);
                    }
                    model.isPlay = !model.isPlay;
                }
            };

            var hello = "";
            if (model.time.hours > 17) {
                hello="晚上好~";
            } else if (model.time.hours > 13) {
                hello = "下午好~";
            } else if (model.time.hours > 11) {
                hello = "中午好~";
            }else if (model.time.hours > 5) {
                hello = "早上好~";
            }else {
                hello = "所以你是睡了还是没睡...";
            }
            

            

            console.log(model.time.year+"-"+model.time.month+"-"+model.time.day+" " +model.time.hours+":"+model.time.minutes+":"+model.time.seconds+'\n'+ hello);
            octopus.updateTime(model.refreshInterval);
        },
        render: function() {

            if(model.toastTime <=0 ){
                view.hideMessage();
            }

            switch(model.styleType){
                case 0:
                view.hidePoem();
                view.hideTodoList();
                view.hidePhonograph();
                view.showClock();
                break;
                case 1:
                view.hideClock();
                view.hideTodoList();
                view.hidePhonograph();
                view.showPoem();
                break;
                case 2:
                view.hidePoem();
                view.hideClock();
                view.hidePhonograph();
                view.showTodoList();
                break;
                case 3:
                view.hidePoem();
                view.hideClock();
                view.hideTodoList();
                view.showPhonograph();
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
        showSize: function() {
            const vHeight = document.body.clientHeight;
            const vWidth = document.body.clientWidth;
            view.infoElem.innerText = vWidth + "," + vHeight;
            // console.log("v");
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
        rotatePic: function(){
            
            model.angle += model.rotateAngle;
            view.platerElem.firstElementChild.style.transform = 'rotate(' + model.angle + 'deg)';
        },
        playBgm: function(){

            // view.audioElem.src = model.musicSrc;
            const audioNodeList = view.audioElem.childNodes;
            // console.log(audioNodeList);
            audioNodeList[1].src = model.musicSrc;
            audioNodeList[3].src = model.musicSrc.replace("mp3","ogg");
            audioNodeList[5].src = model.musicSrc;
            view.audioElem.load();
            

            jsmediatags.read(model.baseUrl + model.musicSrc,{
                onSuccess: function(result) {
                    // console.log(result.tags.picture);

                    if (result.tags.picture) {

                        model.musicAlbumCover = "";
                        view.platerElem.firstElementChild.src = model.musicAlbumCover;
                        clearInterval(model.pTimer);

                        const { data, format } = result.tags.picture;
                        let base64String = "";
                        for (let i = 0; i < data.length; i++) {
                          base64String += String.fromCharCode(data[i]);
                        }
                        model.musicAlbumCover = `data:${data.format};base64,${window.btoa(base64String)}`;
                        // 设置旋转动画                        
                        model.pTimer = setInterval(view.rotatePic, 10);
                    } else {
                        model.musicAlbumCover = "";
                        view.platerElem.firstElementChild.src = model.musicAlbumCover;
                        clearInterval(model.pTimer);
                    }
                    view.platerElem.firstElementChild.src =  model.musicAlbumCover;
                    // console.log(model.musicAlbumCover);
                },
                onError: function(error)  {
                    console.log(error);
                }

            });
            view.audioElem.addEventListener('canplaythrough',function(){
                view.audioElem.play();
            },false);
            view.bgmButtonElem.classList.remove("grey");
            view.bgmButtonElem.classList.add("red");
        },
        pauseBgm: function(){
            view.audioElem.pause();
            model.musicAlbumCover = "";
            // 先清空图片，再停止动画计时
            view.platerElem.firstElementChild.src = model.musicAlbumCover;
            clearInterval(model.pTimer);
            view.bgmButtonElem.classList.remove("red");
            view.bgmButtonElem.classList.add("grey");            
        },
        showClock: function(){
            view.clockElem.style.display = "flex";
            view.messageElem.classList.add("message-black");

        },
        hideClock: function(){
            view.clockElem.style.display = "none";
            view.messageElem.classList.remove("message-black");

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
            view.poemTimeElem.style.left = model.poemCoordinate[0] + view.poemElem.offsetWidth - 156 + "px";
            view.poemTimeElem.style.top = model.poemCoordinate[1] + 6 + "px";


            view.bodyElem.classList.add("body-grey");
            view.messageElem.classList.add("message-grey");
            
        },
        hidePoem: function(){
            view.poemElem.style.display = "none";
            view.poemTimeElem.style.display = "none";
            view.bodyElem.classList.remove("body-grey");
            view.messageElem.classList.remove("message-grey");
        },
        showTodoList: function(){
            // console.log("todo..");
            view.todoListElem.innerText = "TODOLIST\n";
            for(i=0;i<=model.todoList.length-1;i++){
                view.todoListElem.innerText += (i+1)+"."+model.todoList[i] + "\n";
            }
            view.todoListElem.style.display = "block";
            view.bodyElem.classList.add("body-grey");
            view.messageElem.classList.add("message-white");
        },
        hideTodoList: function(){
            view.todoListElem.style.display = "none";
            view.bodyElem.classList.remove("body-grey");
            view.messageElem.classList.remove("message-white");
        },
        showPhonograph:function(){
            view.phonographElem.style.display = "flex";
            view.bodyElem.classList.add("body-white");
            view.messageElem.classList.add("message-black");
        },
        hidePhonograph: function(){
            view.phonographElem.style.display = "none";
            view.bodyElem.classList.remove("body-white");
            view.messageElem.classList.remove("message-black");
        }
        
    };
    // 设置全屏
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

    window.onresize = function(){
        // view.showSize();
    };



})()
