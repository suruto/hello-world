var sum = 0; //副标题总数
$(function() {
	getJson(function(d) {
		var de_arr = [];
		d = d.main_head;
		console.log(d);
		//获取时间轴分段
		for (i = 0; i < d.length; i++) {
			sum += d[i].sub_head.length;
			de_arr.push(parseInt(d[i].sub_head.length));
		}
		console.log(sum)
		setTimeline(sum, de_arr, d);
		$("#start_point").trigger("click");
		setStartInfo(d);
		setContent(sum, d);
		$(document).on('keydown', function(e) { //上下左右键触发事件
			e.preventDefault();
			var cSum = $('.chapter:visible li').length;
			var cIndex = parseInt(sessionStorage.chapterIndex);
			if (e.keyCode == 37) { //左
				$("#s_prev").trigger('click');
			}
			if (e.keyCode == 39) { //右
				$("#s_next").trigger('click');
			}
			if (e.keyCode == 38) { //上
				if (cIndex == 0) {
					return;
				} else {
					imgToggle(cIndex - 1);
				}

			}
			if (e.keyCode == 40) { //下
				if (cIndex == cSum - 1) {
					return;
				} else {
					imgToggle(cIndex + 1);
				}
			}
		});
		$(window).on('resize', function(e) { //重新计算高度
			setTimeout(function() {
				setMaxHeight($(".book-etc h4"));
				setMaxHeight($(".book-etc"));
			}, 50)
		});
	});
});

function getJson(callback) { //获取data.js
	$.getJSON("data.js", function(d) {
		callback && callback(d);
	});
}

function clearTC() { //清空时间轴上的top主标题
	$("#content_top").text('');
}

function setTimeline(sum, de_arr, d) { //渲染时间轴DOM
	var point_wra = $("#pt_wra");
	var sub_titles = $("#content_bottom");
	var sub_wra = $("#pb_bottom");
	var c = "",
		b = "";
	var const1 = 100 - 5;
	var left = 5;
	var n = 0;
	//init dots & bottom_title
	for (var i = 0; i < de_arr.length; i++) {
		c += '<div class="pt-dot" style="left: ' + left + '%;"></div>';
		left += const1 * (de_arr[i] / sum);
		b += '<div class="content s_c" id="content_bottom_' + i + '">';
		for (var j = 0; j < d[i].sub_head.length; j++) {
			var sb = n / sum * const1 + 5;
			b += '<span data-left="' + sb + '" data-index="' + i + '-' + j + '">' + d[i].sub_head[j].sub_title_name + '</span>';
			n++;
		}
		b += '</div>';
	}
	point_wra.html(c);
	sub_wra.html(b);
	$(".pt-dot").on('click mouseover',function() { //圆点点击事件
		var i = $('.pt-dot').index($(this));
		$(".s_c").hide().eq(i).show().find("span").eq(0).trigger('click');
	});
	$(".s_c span").on("click", function() { //副标题文本点击事件
		var index = $(".s_c span").index($(this));

		subtitleEventHandler($(this), index);
	});
	$("#start_point").on('click mouseover',function() { //开始圆点点击显示预览
		clearTC();
		$(".s_c,#cWra").hide();
		$("#kaishi").show();
		$("#on").stop().animate({'width':0},450,'swing');
		$('.pt-dot,#end_point').removeClass('dot-orange');
		$('#s_prev').addClass('s-lr-inactive');
		$('#s_next').removeClass('s-lr-inactive');
		sessionStorage.dotIndex = -1;

	});
	$("#end_point").click(function() { //结束圆点点击显示预览
		clearTC();
		$(this).addClass('dot-orange');
		$("#on").stop().animate({'width':'100%'},450,'swing');
		$(".s_c,#cWra,#kaishi").hide();
		$('.pt-dot').addClass('dot-orange');
		$('#s_next').addClass('s-lr-inactive');
		$('#s_prev').removeClass('s-lr-inactive');
		sessionStorage.dotIndex = sum;
		setTimeout(function() {
			location.href = 'http://www.360scm.com/#/demo';
		}, 100);
	});
}

function setStartInfo(d) { //渲染起始页以及起始dom事件
	var infoWra = $("#start_info");
	var c = "";
	var tArr = [];
	for (i = 0; i < d.length; i++) {
		c += '<div class="s-book">';
		c += '<div class="book-image"><img src="' + d[i].brief_intro_img + '" alt=""></div>';
		c += '<div class="book-etc"><h4>' + d[i].title_name + '</h4>';
		tArr.push(d[i].title_name);
		c += '<p>' + d[i].brief_intro + '</p>';
		var suoyin = i + 1;
		c += '<div class="small-dot">' + suoyin + '</div>';
		c += '</div></div>';
	}
	c += '<span class="Btnspan">开始演示</span>';
	infoWra.html(c);
	sessionStorage.title_name = JSON.stringify(tArr);
	$(".s-book").css({
		'width': (89 / d.length).toFixed(2) + '%',
		'margin-left': (9 / d.length).toFixed(2) + '%'
	});
	setMaxHeight($(".book-etc h4"));
	setMaxHeight($(".book-etc"));
	//prev next
	$("#s_next").on("click", function() { //上一页触发事件
		var spans = $(".s_c span");
		var i = parseInt(sessionStorage.dotIndex); //联合了起始点的index
		if (i >= sum - 1) {
			$(this).addClass('s-lr-inactive');
			$("#end_point").trigger('click');
			return;
		} else {
			subtitleEventHandler($(spans[i + 1]), i + 1);
		}

	});
	$("#s_prev").on("click", function() { //下一页触发事件
		if ($(this).hasClass('s-lr-inactive')) {

		}
		var spans = $(".s_c span");
		var i = parseInt(sessionStorage.dotIndex); //联合了起始点的index
		if (i <= 0) {
			$(this).addClass('s-lr-inactive');
			$("#start_point").trigger('click');
			return;
		} else {
			subtitleEventHandler($(spans[i - 1]), i - 1);
		}

	});

	$('.s-book').click(function() {
		var index = $(this).index();
		$('.pt-dot').eq(index).trigger('click');
	})
	$('.Btnspan').click(function() {
		$('.pt-dot').eq(0).trigger('click');
	})
}

function setContent(sum, d) { //设置/渲染主体内容
	var cWra = $("#cWra");
	var c = '';
	for (i = 0; i < d.length; i++) {
		for (j = 0; j < d[i].sub_head.length; j++) {
			c += '<section class="chapter"><div class="c-left">';
			c += '<h3>' + d[i].sub_head[j].sub_content_info + '</h3><ul class="bullets">';
			var txt_img = d[i].sub_head[j].sub_content_txt_img;
			for (k = 0; k < txt_img.length; k++) {
				c += '<li>' + txt_img[k].left + '</li>';
			}
			c += '</ul></div><div class="c-right">';
			for (v = 0; v < txt_img.length; v++) {
				debugger;
				c += '<img class="dis-none" src=' + txt_img[v].right + '>';
			}
			c += '</div></section>';
		}

	}
	// console.log(c);
	cWra.html(c);
	//左右对称
	cWra.on("click mouseover", ".chapter:visible li", function() {
		var i = $(this).index();
		imgToggle(i);
	});

}

function subtitleEventHandler(dom, index) { //副标题选中触发
	var dot = $(".pt-dot");
	var subs = $(".s_c");
	var subs_len = subs.length;
	var ai = parseInt(dom.attr("data-index").split("-")[0], 10);
	if (!!sessionStorage.title_name) var tArr = JSON.parse(sessionStorage.title_name)
	sessionStorage.dotIndex = index;
	$("#cWra").show();
	$("#kaishi").hide();
	$('#end_point').removeClass('dot-orange');
	$(".s_c span").removeClass("font-orange").eq(index).addClass("font-orange");
	for (var i = 0; i < subs_len; i++) {
		if (i > ai) {
			dot.eq(i).removeClass("dot-orange");
		} else {
			dot.eq(i).addClass("dot-orange");
		}
	}
	// $("#on").width(dom.attr("data-left") + "%");
	$("#on").stop().animate({'width':dom.attr("data-left") + "%"},350,'swing');
	//联系timeline
	subs.hide().eq(ai).show();
	$('#content_top').text(tArr[ai]);
	//联系content
	$(".chapter").hide().eq(index).show();
	imgToggle(0);
	//联系前进后退
	$('#s_prev,#s_next').removeClass('s-lr-inactive');
}

function setMaxHeight(dom) { //设置所有dom的高为容器最高高度
	dom.removeAttr('style');
	var h = 0;
	dom.each(function(index, el) {
		if ($(el).height() > h) h = $(el).height();
	});
	dom.height(h);
}

function imgToggle(i) { //切换内容中的图片和次标题
	$(".chapter:visible li").removeClass('active').eq(i).addClass('active');
	$(".chapter:visible img").hide().eq(i).show();
	sessionStorage.chapterIndex = i;
}