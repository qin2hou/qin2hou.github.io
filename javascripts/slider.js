// 事件发射器 （复制）
// -----------------
        var emmitter = {
        // 注册事件
        on: function(event, fn) {
            var handles = this._handles || (this._handles = {}),
            calls = handles[event] || (handles[event] = []);
            // 找到对应名字的栈
            calls.push(fn);
            return this;
        },
        // 解绑事件
        off: function(event, fn) {
            if(!event || !this._handles) this._handles = {};
            if(!this._handles) return;

            var handles = this._handles , calls;

            if (calls = handles[event]) {
              if (!fn) {
                handles[event] = [];
                return this;
              }
              // 找到栈内对应listener 并移除
              for (var i = 0, len = calls.length; i < len; i++) {
                if (fn === calls[i]) {
                  calls.splice(i, 1);
                  return this;
                }
              }
            }
            return this;
        },
        // 触发事件
        emit: function(event) {
            var args = [].slice.call(arguments, 1),
            handles = this._handles, calls;
            if (!handles || !(calls = handles[event])) return this;
            // 触发所有对应名字的listeners
            for (var i = 0, len = calls.length; i < len; i++) {
              calls[i].apply(this, args)
            }
            return this;
        }
    };





!function(){
    // 辅助函数
    // -------------

    // 将HTML转换为节点
    function html2node(str) {
        var container = document.createElement('div');
        container.innerHTML = str;
        return container.children[0];
    }

    // o1={a:1} o2={a:2,b:2}  ==> o1={a:1,b=2}
    function extend(o1, o2) {
        for (var i in o2) {
            if (typeof o1[i] === 'undefined') {
                o1[i] = o2[i];
            }
        }
        return o1;
    }

    function addClass(node, className) {
        var current = node.className || "";
        if ((" "+current+" ").indexOf(" "+className+" ") === -1) {
            node.className = current ? (current+" "+ className) : className;
        }
    }
    function delClass(node, className) {
        var current = node.className || "";
        node.className = (" "+current+" ").replace(" "+className+" "," ").trim();
    }


    var template =
     `<div class="m-slider">
            <div class="slide">
                <a href="#" target="_blank" title="打开新的页面，可以查看源码">
                    <img />
                    <div class="text">
                        <h2 class="header"></h2>
                        <p class="description"></p>
                    </div>
                </a>                
            </div>
            <div class="slide">
                <a href="#" target="_blank" title="打开新的页面，可以查看源码">                    
                    <img />
                    <div class="text">
                        <h2 class="header"></h2>
                        <p class="description"></p>
                    </div>
                </a>
            </div>
            <div class="slide">
               <a href="#" target="_blank" title="打开新的页面，可以查看源码">
                    <img />
                    <div class="text">
                        <h2 class="header"></h2>
                        <p class="description"></p>
                    </div>
                </a>
            </div>
        </div>`;


    function Slider(options) {
        var options = options || {};
        extend(this, options);

        // 容器节点 以及 样式设置
        this.container = this.container || document.body;
        this.container.style.overflow = 'hidden';

        // 组件节点
        this.slider = this._layout.cloneNode(true);
        this.slides = [].slice.call(this.slider.querySelectorAll('.slide'));

        // 拖拽相关
        this.offsetWidth = this.container.offsetWidth;// offsetWidth 为盒模型的宽度
        this.breakPoint = this.offsetWidth / 4;

        // 内部数据结构
        this.slideIndex = 1; // slide下标 0~2 , 1表示中间的slide
        this.pageIndex = this.pageIndex || 0;  // 当前图片下标
        this.offsetAll = this.pageIndex; // 容器(.m-slider)的偏移下标

        // this.pageNum 必须传入
        this.pageNum = this.images.length;
        // 初始化动作
        this.container.appendChild(this.slider);
        // 拖拽事件
        if (this.drag) this._initDrag();

    }


    extend(Slider.prototype, emmitter);
    extend(Slider.prototype, {

        _layout: html2node(template),

        // 跳转到指定张数
        nav: function(pageIndex) {
            this.pageIndex = pageIndex ; //2 
            this.slideIndex = typeof this.slideIndex === 'number' ? this.slideIndex : (pageIndex + 1); // 1
            this.offsetAll = pageIndex; // 2

            this.slider.style.transitionDuration = '0s';
            this._calcSlide();

        },

        // 拖拽事件相关
        // ---------------

        _initDrag: function() {
            this._dragInfo = {};
            this.slider.addEventListener('mousedown',this._dragstart.bind(this));
            this.slider.addEventListener('mousemove',this._dragmove.bind(this));  
            this.slider.addEventListener('mouseup',this._dragend.bind(this));
            this.slider.addEventListener('mouseleave',this._dragend.bind(this));    
        },
        _dragstart: function(event) {
            var dragInfo = this._dragInfo;
            dragInfo.start = {
                x: event.pageX, // 距离文档左上角的位置，不随着滚动条而改变
                y: event.pageY
            };           
        },

        _dragmove: function(event) {
            var dragInfo = this._dragInfo;
            if (!dragInfo.start) return;
            event.preventDefault();
            this.slider.style.transitionDuration = '0s';

            var start = dragInfo.start;
            // 清除选区
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            }else if (window.document.getSelection) {
                window.document.selection.empty();
            }
            // 加入 translateZ  触发硬件加速
            this.slider.style.transform = 'translateX(' +  (-(this.offsetWidth*this.offsetAll - event.pageX + start.x)) + 'px) translateZ(0)';
        },

        _dragend: function(event) {
            var dragInfo = this._dragInfo;
            if (!dragInfo.start) return;

            event.preventDefault();
            var start = dragInfo.start;
            this._dragInfo = {};
            var pageX = event.pageX;

            // 计算移动了多少距离
            var deltX = pageX - start.x;

            if (Math.abs(deltX) > this.breakPoint) {
                this._step( deltX > 0? -1: 1);
            }else{
                this._step(0);
            }

        },



        // 提供上一张、下一张的功能
        next: function() {
            this._step(1);
        },
        prev: function() {
            this._step(-1);
        },

        // 单步移动
        _step: function(offset) {
            this.offsetAll += offset;
            this.pageIndex += offset;
            this.slideIndex += offset;

            this.slider.style.transitionDuration = '0.5s';

            this._calcSlide();
        },

        // 计算Slide
        // 每个slide的left = (offsetAll + offset(1, -1)) * 100%;
        // 外层容器 (.m-slider) 的偏移 = offset * 宽度
        _calcSlide: function() {

            // 
            var slideIndex = this.sliderIndex = this._normIndex(this.slideIndex, 3); // 1
            var pageIndex = this.pageIndex = this._normIndex(this.pageIndex, this.pageNum); // 2
            var offsetAll = this.offsetAll; // 2
            var pageNum = this.pageNum; // 3

            var prevSlideIndex = this._normIndex( slideIndex - 1, 3); // 0
            var nextSlideIndex = this._normIndex( slideIndex + 1, 3); // 2

            var slides = this.slides; 

            // 三个slide的偏移
            slides[slideIndex].style.left = (offsetAll * 100) +  '%'; // 2个单位
            slides[prevSlideIndex].style.left = ((offsetAll-1)*100) +  '%'; // 1个单位
            slides[nextSlideIndex].style.left = ((offsetAll+1)*100) +  '%'; // 3个单位

            // 容器的偏移
            this.slider.style.transform = 'translateX(' + (-offsetAll * 100) + '%) translateZ(0)'; // 相反方向2个单位

            // 当前slide 添加'z-active'的 className
            slides.forEach(function(node) {delClass(node,'z-active')});
            addClass(slides[slideIndex], 'z-active');

            this._onNav(this.pageIndex, this.slideIndex); // 2 , 1

        },

        // 标准化下标
        // 对下标取余，使其不会超过长度
        _normIndex: function(index, len) {
            return (len + index) % len;
        },


        // 跳转时完成的逻辑，这里是设置图片的url
        _onNav: function(pageIndex, slideIndex) {// 2 , 1
            var images = this.images;
            var slides = this.slides;
            var titles = this.titles;
            var descriptions = this.descriptions;
            var links = this.links;

            for (var i=-1;i<=1;i ++) {
                var index = (slideIndex + i +3)%3; // slideIndex 初始时是1，所以此处index为 0~2循环。
                var img = slides[index].querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    slides[index].appendChild(img);
                }
                var header = slides[index].querySelector('.header');
                var desc = slides[index].querySelector('.description');
                var link = slides[index].querySelector('a');

                header.innerHTML = titles[this._normIndex(pageIndex + i, this.pageNum)];
                desc.innerHTML = descriptions[this._normIndex(pageIndex + i, this.pageNum)];
                img.src = images[this._normIndex(pageIndex + i, this.pageNum)];

                link.href = links[this._normIndex(pageIndex + i, this.pageNum)];
                //  console.log(img.src);
                // img.src = './images/00' + (this._normIndex(pageIndex + i, this.pageNum)+1) + '.jpg'; 
                //slideIndex[1]的位置 取出第 pageIndex 张图，并且相邻的slide对应相邻的图片
            }

            this.emit('nav', {
                pageIndex: pageIndex,
                slideIndex: slideIndex
            });
        }


    });




    // 暴露全局
    window.Slider = Slider;


    // 基于继承的组件扩展复用
    // -------------------------------

    // 完全不明白
}()







   





    

    

    

    

   