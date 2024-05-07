(function() {
    var model = {
        time: {},
        isMilitaryTime: true, // 默认24小时制
        timeAbbr: "",
        lastestMinutes: undefined,
        toastTime: 1.8, // 单位秒,取一位小数
        isPlay: false
    };


    var octopus = {
        init: function() {
            octopus.getCurrentTime(model.time);
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
            }, 100);
        },
        toggleHourSystems: function() {
            model.isMilitaryTime = !model.isMilitaryTime;
            if (!model.isMilitaryTime) {         
                octopus.translateTwelveHour(model.time);
            }
            view.render();
        },
        toggleMusic: function(){
            model.isPlay = !model.isPlay;
            //console.log("playing...");
        }
    };
    var view = {
        init: function() {
            view.hoursElem = document.getElementById("hours");
            view.minutesElem = document.getElementById("minutes");
            view.pmElem = document.getElementById("pm"); 
            view.messageElem = document.getElementById("message");
            view.bgmElem = document.getElementById("bgm");
            view.audioElem = document.getElementById("softRain");
            view.fullscreenElem = document.getElementById("fullscreen");
            view.documentElem = document.documentElement;
            view.hoursElem.innerText = model.time.hours;
            view.minutesElem.innerText = model.time.minutes;
            view.messageElem.innerText =  "按"+"\xa0\xa0\xa0"+"Enter"+ "\xa0\xa0\xa0" +"进入全屏";
            view.hoursElem.addEventListener("click", function() {
                octopus.toggleHourSystems();
            });
            view.bgmElem.addEventListener("click", function() {
                octopus.toggleMusic();
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

            octopus.updateTime();
        },
        render: function() {
            if (model.isMilitaryTime) {
                view.hideAbbr();
            }else {
                view.showAbbr();
            };
            if (model.isPlay) {
                view.playBgm();
            } else {
                view.pauseBgm();
            }
            if (view.hoursElem.innerText != model.time.hours) {
                view.hoursElem.innerText = model.time.hours;
            };
            if (view.minutesElem.innerText != model.time.minutes) {
                view.minutesElem.innerText = model.time.minutes;
            };
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
            view.bgmElem.style.backgroundColor = "gray";
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
