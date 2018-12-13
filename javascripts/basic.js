var $ = function(selector) {
			return [].slice.call(document.querySelectorAll(selector))
		};

		var cursors = $('.m-cursor .cursor');
		var prev = $('.m-cursor .prev')[0];
		var next = $('.m-cursor .next')[0]; 

		cursors.forEach(function(cursor,index){
			cursor.addEventListener('click',function(){
				slider.nav(index);
			});
		});
		prev.addEventListener('click',function(){
			slider.prev();
		});
		next.addEventListener('click',function(){
			slider.next();
		});

		var main = $('.main')[0];

    	 var slider = new Slider({
    	 	// 视口容器
    	 	container: main,

    	 	// 图片列表
    	 	images: [
    	 		'./images/Day13_coffee.gif',
    	 		'./images/Day24_sea.gif',
    	 		'./images/Day35_panda.gif',
    	 		'./images/Day36_eclipse.gif',
    	 		'./images/Day38_stage.gif',    	 		
    	 	],

    	 	// 当前页
    	 	pageIndex: 2,

    	 	// 是否允许拖拽
    	 	drag: false,

    	 	titles: [
    	 		'CSS动画：咖啡',
    	 		'CSS动画：海洋',
    	 		'CSS动画：熊猫',
    	 		'CSS动画：月食',
    	 		'CSS动画：阶梯文字',
    	 	],

    	 	descriptions: [
    	 		'1.咖啡杯的杯口和把手可以用伪元素制作；<br />2.托盘的弧度是使用border-radius调整的；<br />3.热气的动画由若干span组成，加上opacity和filter的滤镜。',
    	 		'1.海浪效果由3个旋转的span制作；<br />2.3个span要设置成不同弧度的椭圆，而且背景色、旋转圆心以及旋转时长也要设置不同的参数。',
    	 		'1.熊猫脸只需要一个dom节点制作；<br />2.熊猫的两只眼睛通过伪元素制作，而耳朵巧妙的使用了伪元素的阴影完成；<br />3.眼珠、嘴和鼻子是通过背景的radial-gradient完成。',
    	 		'1.月亮和太阳分别用一个节点制作；<br />2.动画的实现是通过背景的颜色、太阳的颜色和月亮的颜色协同变化完成的。',
    	 		'1.需要三个节点来制作，相邻节点的首尾是重复的文字，这样文字的移动之后才会衔接在一起；<br />2.除了调整skew之外，还调整了scale，最后看上去才觉得自然。',
    	 	],

            links: [
                './daily_exercise/Day13/index.html',
                './daily_exercise/Day24/index.html',
                './daily_exercise/Day35/index.html',
                './daily_exercise/Day36/index.html',
                './daily_exercise/Day38/index.html'
            ]

    	 });
    	 // 通过监听'nav'事件来完成额外逻辑, 此处是给当前的导航添加样式
    	 slider.on('nav', function(ev) {
    	 	// 此处的pageIndex 不太明白
    	 	var pageIndex = ev.pageIndex;
    	 	cursors.forEach(function(cursor,index) {
    	 		if (index === pageIndex) {
    	 			cursor.className = "z-active";
    	 		}else {
    	 			cursor.className = '';
    	 		}
    	 	})
    	 });


    	 // // 3s自动轮播
    	 // var autoplay = setInterval(function() {
    	 // 	// 下一页
    	 // 	slider.next();
    	 // }, 15000);


    	 // 直接跳到第二页
    	 slider.nav(2);
