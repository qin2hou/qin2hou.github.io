(function() {
    var model = {
        time: {},
        isPm: true,
        lastestMinutes: undefined
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
            // timeObj.hours = 6;
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
        translatePm: function(timeObj) {
            if ( timeObj.hours >= 12 ) {
                timeObj.hours = timeObj.hours - 12;
            }
            return timeObj;
        },
        updateTime: function() {
            var t = setInterval(function() {
                model.lastestMinutes = model.time.minutes;
                octopus.getCurrentTime(model.time);
                if (model.isPm) {
                    octopus.translatePm(model.time);
                };
                view.render();
            }, 100)
        },
        togglePm: function() {
            model.isPm = !model.isPm;
            if (model.isPm) {
                octopus.translatePm(model.time);
            };
            view.render();
        }
    };
    var view = {
        init: function() {
            view.hoursElem = document.getElementById("hours");
            view.minutesElem = document.getElementById("minutes");
            view.pmElem = document.getElementById("pm");           
            view.fullscreenElem = document.getElementById("fullscreen");
            view.documentElem = document.documentElement;

            view.hoursElem.innerText = model.time.hours;
            view.minutesElem.innerText = model.time.minutes;
            view.hoursElem.addEventListener("click", function() {
                octopus.togglePm();
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
            if (model.isPm) {
                view.showPm();
            }else {
                view.hidePm();
            };
            octopus.updateTime();
        },
        render: function() {
            if (model.isPm) {
                view.showPm();
            }else {
                view.hidePm();
            };
            if (view.hoursElem.innerText != model.time.hours) {
                view.hoursElem.innerText = model.time.hours;
            };
            if (view.minutesElem.innerText != model.time.minutes) {
                view.minutesElem.innerText = model.time.minutes;
            };

        },
        showPm: function() {
            // console.log(view.hoursElem.innerText);
            view.pmElem.style.display = 'block';
        },
        hidePm: function() {
            view.pmElem.style.display = 'none';
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
