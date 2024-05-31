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
        poemAddress: "/source/poem_zh.json",
        poemObj: {}, // json文件
        poemObjName: "", // poemObj是按照时间索引的，比如 "00：00" 
        poemNumber: 0, // 诗歌索引位置
        poemQuantities: 0, // 每个时间对应的诗歌数量，比如"00：00"，对应有五首诗        
        poemText: "Nice to meet you!",
        isPoemTimeChanged: false,
        poemCoordinate:[100, 100], // 诗歌显示的初始坐标
        refreshInterval: 100, // 页面刷新间隔时长, 单位毫秒
        poemRefreshInterval: 10, // 单位秒
        // 上线项目要记得切换baseUrl
        baseUrl : 'https://qin2hou.github.io/', 
        // baseUrl: 'http://127.0.0.1:3000/',
        angle: 0,
        rotateAngle: 0.25,  // 每0.01秒 旋转n度
        pTimer: {}, // 旋转动画定时器
        currentVolume: 10, // 默认音量,10为最大
        blob: "",
    };


    var octopus = {
        init: function() {
            octopus.getCurrentTime(model.time);
            octopus.getPoemText(model.poemAddress);
            octopus.getTodoListText();
            view.init();
        },
        updateTime: function(time) {
            var t = setInterval(function() {
                // 页面每次刷新要做的事
                // 1.显示最新的时间
                octopus.getCurrentTime(model.time);

                if (model.style[model.styleType] == "clock"){
                    view.updateClock();
                }

                // 2.toast倒计时
                if (model.toastTime > 0) {
                    model.toastTime = model.toastTime - model.refreshInterval / 1000;
                };

                // 3.诗歌定时刷新内容              
                // 3.1 每次刷新都更新时间
                if (view.poemTextElem.offsetWidth != 0) {
                    view.updatePoemTime();
                };

                // 3.2 每分钟刷新一次,即秒数等于"00"时 
                if (model.time.seconds == "00" && !model.isPoemTimeChanged) {
                    octopus.togglePoem();
                    view.updatePoemText();
                    model.isPoemTimeChanged = !model.isPoemTimeChanged;
                };
                if (model.time.seconds == "01" && model.isPoemTimeChanged) {
                    model.isPoemTimeChanged = !model.isPoemTimeChanged;
                }

                view.render();
            }, time); 
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
        toggleHourSystems: function() {
            model.isMilitaryTime = !model.isMilitaryTime;
            view.updateClock();
        },
        toggleStyle: function(){
            if (model.styleType < model.style.length - 1){
                model.styleType ++;
            }else {
                model.styleType = 0;
            }
        },
        getPoemText: function(addr){
            const xhr = new XMLHttpRequest();            
            xhr.open('get', addr, true);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const jsonStr = xhr.responseText;
                    
                    // 初始化 poemObj
                    model.poemObj = JSON.parse(jsonStr);
                    model.poemObjName = model.time.hours+":"+model.time.minutes;
                    model.poemQuantities = model.poemObj[model.poemObjName].length;
                    model.poemNumber = Math.floor(Math.random()*model.poemQuantities);
                    model.poemText = model.poemObj[model.poemObjName][model.poemNumber];
                    // console.log("诗歌加载完成。。。");


                    // 加载完成后自动刷新poem   
                    
                    if (model.style[model.styleType] == "poem") {
                        octopus.togglePoem();
                        view.updatePoemText();
                        view.updatePoemTime();
                    }                    
                }
            }
            xhr.send();
        },
        togglePoem: function(){
            // 随机诗歌
            model.poemObjName = model.time.hours+":"+model.time.minutes;
            model.poemQuantities = model.poemObj[model.poemObjName].length;

            // 随机诗歌
            // model.poemNumber = Math.floor(Math.random()*model.poemQuantities);

            //按顺序切换诗歌
            if (model.poemNumber < model.poemQuantities - 1) {
                model.poemNumber += 1;
            } else {
                model.poemNumber = 0;
            }   


            // 调试用
            // console.log(model.poemNumber);
            // console.log(model.poemQuantities);
            // model.poemText = model.poemObj[model.poemObjName][model.poemNumber];

            // 随机位置
            if (view.poemTextElem.offsetWidth == 0) {
                model.poemCoordinate[0] = Math.floor(Math.random()*window.innerWidth / 2);
                model.poemCoordinate[1] = Math.floor(Math.random()*window.innerHeight / 2);
                // console.log("?");
            } else {
                model.poemCoordinate[0]= Math.floor(Math.random()*(window.innerWidth-view.poemTextElem.offsetWidth-100));// 0-页面宽度
                model.poemCoordinate[1]= Math.floor(Math.random()*(window.innerHeight-view.poemTextElem.offsetHeight-100));// 0-页面高度
            }
            
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
        volumeUp: function(elem) {
            model.currentVolume = Math.min(10, model.currentVolume + 1);
            elem.volume = model.currentVolume/10;
        },
        volumeDown: function(elem) {
            model.currentVolume = Math.max(0, model.currentVolume - 1);
            elem.volume = model.currentVolume/10;
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
        }
    };
    var view = {
        init: function() {
            // DOM绑定
            view.bodyElem = document.getElementsByTagName("body")[0];
            view.documentElem = document.documentElement;
            view.fullscreenElem = document.getElementById("fullscreen");

            view.messageElem = document.getElementById("message");
            view.audioElem = document.getElementById("softRain");
            view.bgmButtonElem = document.getElementById("bgm-btn");
            view.changeClockElem = document.getElementById("cc-btn");
            view.fsButtonElem = document.getElementById("fs-btn");

            view.clockElem = document.getElementById("clock");
            view.hoursElem = document.getElementById("hours");
            view.minutesElem = document.getElementById("minutes");
            view.pmElem = document.getElementById("pm");
            
            view.poemElem = document.getElementById("poem");
            view.poemTimeElem = document.getElementById("poem-time");
            view.poemTextElem = document.getElementById("poem-text");

            view.todoListElem = document.getElementById("todoList");
            
            view.phonographElem = document.getElementById("phonograph");
            view.powerElem = document.getElementById("power");
            view.infoElem = document.getElementById("info");
            view.volumeBarElem = document.getElementById("volumeBar");
            view.volumeIndicatorElem = document.getElementById("volume-indicator");
            view.platerElem = document.getElementById("plater");
            
            // view.todoListElem.innerText = model.todoList;
            // model.messageElem.style.display = "block";

            // 初始化消息显示
            view.messageElem.innerText =  "按"+"\xa0\xa0\xa0\xa0\xa0\xa0"+"F"+ "\xa0\xa0\xa0\xa0\xa0\xa0" +"开始播放歌曲";
            view.showMessage();

            // 初始化音量位置
            view.volumeIndicatorElem.style.top = 102 - model.currentVolume*10 + 'px';

            // 添加鼠标点击事件监听
            view.hoursElem.addEventListener("click", function() {
                octopus.toggleHourSystems();
            });
            view.bgmButtonElem.addEventListener("click", function() {
                octopus.toggleMusic();
            });
            view.changeClockElem.addEventListener("click", function() {
                octopus.toggleStyle();
            });
            view.poemTextElem.addEventListener("click",function(){
                octopus.togglePoem();
                view.updatePoemText();
                view.updatePoemTime();
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

            // 添加键盘快捷键事件监听
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

            view.volumeBarElem.addEventListener('wheel', function(event){
                event.preventDefault();
                console.log(event.deltaY);
                if (event.deltaY > 0){
                    octopus.volumeDown(view.audioElem);
                    view.volumeIndicatorElem.style.top = 102 - model.currentVolume*10 + 'px';
                } else {                    
                    octopus.volumeUp(view.audioElem);
                    view.volumeIndicatorElem.style.top = 102 - model.currentVolume*10 + 'px'; 
                }
            },{ passive: false });





            // 自定义console.log
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

            // 每隔10ms 刷新一下页面
            octopus.updateTime(model.refreshInterval);
        },
        render: function() {

            if(model.toastTime > 0 ){
                view.showMessage();
            } else {
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
                break;
            }
            // if (model.style[model.styleType] == "poem") {
            //     octopus.updatePoemPosition(model.poemRefreshInterval);
            // }           
        },
        showMessage: function() {
            view.messageElem.style.display = 'block';
        },
        hideMessage: function() {
            view.messageElem.style.display = 'none';
        },  
        // 调试窗口尺寸时使用
        showSize: function() {
            const vHeight = document.body.clientHeight;
            const vWidth = document.body.clientWidth;
            view.infoElem.innerText = vWidth + "," + vHeight;
            // console.log(vWidth + "," + vHeight);
        },
        showAbbr: function() {
            view.pmElem.innerText = model.timeAbbr;
        },
        hideAbbr: function() {
            view.pmElem.innerText = "";
        },      
        showClock: function(){   
            view.clockElem.style.display = "flex";
            view.messageElem.classList.add("message-black");
        },
        hideClock: function(){
            view.clockElem.style.display = "none";
            view.messageElem.classList.remove("message-black");
        },
        updateClock: function() {
            // 如果不是24小时制,则转换成12小时制,并且角标显示缩写字母
            if (!model.isMilitaryTime) {
                octopus.translateTwelveHour(model.time);
                view.showAbbr();
            } else {
                view.hideAbbr();
            }
            view.hoursElem.innerText = model.time.hours;
            view.minutesElem.innerText = model.time.minutes;
        },
        showPoem: function(){
            view.poemTextElem.innerText = model.poemText;
            view.poemTimeElem.innerText = model.time.year + "-" + model.time.month + "-" + model.time.day + "\xa0\xa0\xa0\xa0" + model.time.hours + ":"+ model.time.minutes + ":" + model.time.seconds;
            view.poemElem.style.display = "block";
            view.poemTextElem.style.display = "block";
            view.poemTimeElem.style.display = "block";
            view.bodyElem.classList.add("body-grey");
            view.messageElem.classList.add("message-grey");
        },
        hidePoem: function(){
            view.poemElem.style.display = "none";
            view.poemTextElem.style.display = "none";
            view.poemTimeElem.style.display = "none";
            view.bodyElem.classList.remove("body-grey");
            view.messageElem.classList.remove("message-grey");
        },
        updatePoemText: function() {
            model.poemObjName = model.time.hours+":"+model.time.minutes;
            // console.log(model.poemObj);

            // 更新诗歌内容
            if(JSON.stringify(model.poemObj) !== "{}"){
                model.poemText = model.poemObj[model.poemObjName][model.poemNumber];
            }; 
            view.poemTextElem.innerText = model.poemText;


            // 更新显示坐标
            model.poemCoordinate[0] = ( model.poemCoordinate[0] + view.poemTextElem.offsetWidth > window.innerWidth - 100) ? window.innerWidth - view.poemTextElem.offsetWidth - 100 : model.poemCoordinate[0];
            if (model.poemCoordinate[0] < 100) {
                model.poemCoordinate[0] = 100;
            }
            model.poemCoordinate[1] = ( model.poemCoordinate[1] + view.poemTextElem.offsetHeight > window.innerHeight - 100) ? window.innerHeight-view.poemTextElem.offsetHeight - 100 : model.poemCoordinate[1];
            if (model.poemCoordinate[1] < 100) {
                model.poemCoordinate[1] = 100;
            }
            
            // console.log("model.poemCoordinate" + ":", model.poemCoordinate);
            // console.log("window.innerWidth" + ":", window.innerWidth);
            // console.log("window.innerHeight" + ":", window.innerHeight);
            // console.log("view.poemTextElem.offsetWidth" + ":", view.poemTextElem.offsetWidth);
            // console.log("view.poemTextElem.offsetHeight" + ":", view.poemTextElem.offsetHeight);
            // console.log("view.poemTimeElem.offsetWidth" + ":", view.poemTimeElem.offsetWidth);
            // console.log("view.poemTimeElem.offsetHeight" + ":", view.poemTimeElem.offsetHeight);


            view.poemTextElem.style.left = model.poemCoordinate[0]+"px";
            view.poemTextElem.style.top = model.poemCoordinate[1]+"px";


            
        },
        updatePoemTime: function() {
            var ctime = model.time;
            view.poemTimeElem.innerText = ctime.year + "-" + ctime.month + "-" + ctime.day + "\xa0\xa0\xa0\xa0" + ctime.hours + ":"+ ctime.minutes + ":" + ctime.seconds;
            
            view.poemTimeElem.style.left = model.poemCoordinate[0] + view.poemTextElem.offsetWidth - view.poemTimeElem.offsetWidth - 8 + "px";
            view.poemTimeElem.style.top = model.poemCoordinate[1] + 6 + "px";
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
            view.bodyElem.classList.add("body-white");
            view.messageElem.classList.add("message-black");
            view.phonographElem.style.display = "flex";
        },
        hidePhonograph: function(){
            view.phonographElem.style.display = "none";
            view.bodyElem.classList.remove("body-white");
            view.messageElem.classList.remove("message-black");
        },
        playBgm: function(){
            // view.audioElem.src = model.musicSrc;
            const audioNodeList = view.audioElem.childNodes;
            // console.log(audioNodeList);
            audioNodeList[1].src = model.musicSrc;
            audioNodeList[3].src = model.musicSrc.replace("mp3","ogg");
            audioNodeList[5].src = model.musicSrc;

            // 修改src之后，要手动加载下，才会更新音乐
            view.audioElem.load();
            

            // console.log(window.location.host);
            // model.baseUrl = (model.baseUrl == "https://" + window.location.host + "/") ? model.baseUrl : "https://" + window.location.host + "/";
            // console.log(model.baseUrl + model.musicSrc);

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
            // 尝试用blob保存文件 失败，读取失败，看不懂 blobreader 源代码
            // var blobUrl;
            // var xhr = new XMLHttpRequest();
            // xhr.responseType = "blob";
            // xhr.open("GET", model.baseUrl + model.musicSrc, true);            
            // xhr.onreadystatechange = function () {
            //     if (xhr.readyState === 4 && xhr.status === 200) {
            //         // var data = this.response;
            //         // model.blob = new Blob([data], { type: "audio/mpeg" });
            //         model.blob = this.response;
            //         blobUrl = URL.createObjectURL(model.blob);
            //         console.log("url:");
            //         console.log(blobUrl);
            //         console.log(model.blob);
            //     }
            // };
            // xhr.send();
            // jsmediatags.read(blobUrl, result => {
            //     console.log(result.tags);
            // });

            // view.audioElem.addEventListener('canplaythrough',function(){
            //     view.audioElem.play();
            // },false);

            view.audioElem.play();
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
        rotatePic: function(){            
            model.angle += model.rotateAngle;
            view.platerElem.firstElementChild.style.transform = 'rotate(' + model.angle + 'deg)';
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
