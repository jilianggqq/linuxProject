/**
 * linux kernel 构架图绘制功能库
 * 
 * 
 */

//Rapheal Paper 首页引用
var mapPaper = null;

//矩形填充色数组，按level循环顺排
var recFills = ['red', 'green', 'yellow', 'gray', 'red', 'black' , '#808080'];
// var recFills = ['#FF6C00', '#2dd700', '#2aa198', '#eee8d5', '#2dd700', '#7309aa' , '#808080'];
//画笔颜色数组，按level循环顺排
var strokes = ['mediumorchid', 'blue', 'red'];

var moduleMargin = 5;
var modulePadding = 3;
var paddingHeight = 30;
var paddingWidth = 30;
//模块类型：虚拟目录，编译选项，文件，函数，结构体，变量
var types = [0, 1, 2, 3, 4, 5];

var current_arch = getQueryString("arch") ? getQueryString("arch") : 'x86';
function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return null;
}

/**
 * 模块对象
 */
function module(id, name, parentId, type, link, level, direction, recColor) {
	this.id = id;
	this.name = name;
	this.parentId = parentId;
	this.link = link;
	this.level = level;
	this.type = type;

	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;

	this.direction = direction ? direction : 'vertical'; //模块布局方向: horizontal-水平; vertical-垂直
	this.recColor = recColor ? recColor : level;

	this.children = []; //id array of children elements
	this.arrows = []; //id array of arrows

	this.attr = {
		fill : recFills[this.recColor % recFills.length],
		fill_opacity : 0.5,
		stroke : strokes[level % recFills.length],
		stroke_width : 2 / Math.pow(zoomRate, level),
		font_size : 18 / Math.pow(zoomRate, level),
		font_weight : 'bolder'
	};
}
/**
*设置module的位置以及大小
*/
module.prototype.setSize = function (x, y, width, height) {
	this.x = per2px(x, svgViewBoxWidth);
	this.y = per2px(y, svgViewBoxHeight);
	this.width = per2px(width, svgViewBoxWidth);
	this.height = per2px(height, svgViewBoxHeight);
};

/**
 * 绘制模块
 * @param mod 模块对象
 */
function drawModule(paper, mod) {
	if ("vertical" == mod.direction) { // 垂直布局
		return drawModuleVertical(paper, mod);
	} else { // 水平布局
		return drawModuleHorizontal(paper, mod);
	}
}

/**
 * 判断字符串的长度，如果长度过长，就用...代替
 */
function justifyNameLength(name, max_length) {
	if (name.length >= max_length) {
		var newName;
		newName = name.substr(0, max_length - 3);
		name = newName + "...";
	}
	return name;
}

function vitualIntroduce(rect, type, id) {
	if (type == 1) {
		var configId = id.slice(2);
		var url = 'kernel/configinfo.php?jsoncallback=?';
		//!!TODO 改参数
		$.getJSON(url, {
			"time" : (new Date()).getTime(),
			"ConfigID" : configId,
			"arch" : current_arch
		}, function (data) {
			if (data) {
				var info = data.info;
				var menu = data.menu;
				rect.attr("title", "编译选项功能说明:\ninfo:" + info + "\n" + "menu:" + menu);
			}
		});
	}
}

/**
 * 绘制模块, 垂直布局
 *
 * @param mod 模块对象
 */
function drawModuleVertical(paper, mod) {
	var re = paper.rect(mod.x, mod.y, mod.width, mod.height, 5 / Math.pow(zoomRate, mod.level));
	re.id = "r_" + mod.id;
	re.attr({
		title : mod.name,
		fill : mod.attr.fill,
		"fill-opacity" : mod.attr.fill_opacity,
		stroke : mod.attr.stroke,
		"stroke-width" : mod.attr.stroke_width
	});

	re.data("m", {
		id : mod.id,
		level : mod.level,
		parentId : "r_" + mod.parentId,
		children : mod.children,
		arrows : mod.arrows,
		direction : mod.direction
	});
	re.data("type", mod.type);
	re.data("regionId", "");
	re.data("direction", mod.direction);
	re.mouseover(function () { // 鼠标滑过事件
		this.attr("fill-opacity", this.attr("fill-opacity") * 1.6);
		vitualIntroduce(this, mod.type, mod.id);
	}).mouseout(function () { // 鼠标滑出事件
		this.attr("fill-opacity", this.attr("fill-opacity") / 1.6);
	});
	if (re.id.indexOf("region_") == -1) {
		re.click(clickCallback);
	}
	var txt = paper.text(mod.x + mod.width / 2, mod.y + 15, justifyNameLength(mod.name, 17));
	txt.id = "t_" + mod.id;
	txt.attr({
		"font-size" : mod.attr.font_size,
		"font-weight" : mod.attr.font_weight,
		"cursor" : "help",
		"title" : mod.name
	});

	txt.data("mid", re.id);
	txt.data("link", mod.link);
	txt.data("direction", mod.direction);
	txt.click(selectModel); // 通过点击设置模块名称的字体颜色
	re.data("m").children.push(txt.id);

	var parent = paper.getById("r_" + mod.parentId);
	if (parent) {
		parent.data("m").children.push(re.id);
	}
	return {
		r : re,
		t : txt
	};
}
// 设置模块名称的字体颜色
function selectModel() {
	var fill = this.attr("fill");
	if (fill == "red") {
		this.attr("fill", "black");
	} else {
		this.attr("fill", "red");
	}
}
/**
 * 全部关系
 * @Description：包含选中模块之间的关系，以及选中的和其他未选中的模块之间的关系
 *
 */
function arrowFilter(paper) {
	paper.forEach(function (el) {
		if (el.id.indexOf("arr_") != -1) {
			var fromId = el.data("from").replace("r_", "");
			var toId = el.data("to").replace("r_", "");
			var fromEle = paper.getById("t_" + fromId);
			var toEle = paper.getById("t_" + toId);
			if (fromEle.attr("fill") != "red" && toEle.attr("fill") != "red") {
				el.hide();
			} else {
				el.show();
			}
		}
	});
}

/**
 * 内部关系
 * @Description：只展示选中模块之间的关系
 *
 */
function arrowTwoFilter(paper) {
	paper.forEach(function (el) {
		if (el.id.indexOf("arr_") != -1) {
			var fromId = el.data("from").replace("r_", "");
			var toId = el.data("to").replace("r_", "");
			var fromEle = paper.getById("t_" + fromId);
			var toEle = paper.getById("t_" + toId);
			if (fromEle.attr("fill") == "red" && toEle.attr("fill") == "red") {
				el.show();
			} else {
				el.hide();
			}
		}
	});
}

/**
 * 清华调用
 * @Description：展示清华调用关系
 *
 */
function getLXRFromTsinghua(paper, TsinghuaType) {
	var count = 0;
	var fromID = "";
	var fromType = "";
	var toID = "";
	var toType = "-1";
	paper.forEach(function (el) {
		if (el.attr("fill") == "red" && el.id.indexOf("t_") != -1) {
			// alert(el.id + el.attr("fill"));
			count++;
			if (count > 2) {
				alert("最多只能选取两项.");
				restoreLink(paper);
				return;
			} else if (count == 1) {
				fromType = el.id.slice(2, 3);
				fromID = el.id.slice(4);
			} else if (count == 2) {
				toType = el.id.slice(2, 3);
				toID = el.id.slice(4);
			} else {
				alert("something error");
			}
		}
	});
	if (count <= 2 && count > 0) {
		window.open("../kernel/lxrForward.php?fromType=" + fromType + "&fromId=" + fromID + "&toType=" + toType + "&toId=" + toID + "&arch=" + current_arch + "&tsinghuaType=" + TsinghuaType);
	}
}

/**
 * 外部关系
 * @Description：选中模块之间的关系不画出，选中的和其他未选中的关系展示出来
 *
 */
function arrowOtherFilter(paper) {
	paper.forEach(function (el) {
		if (el.id.indexOf("arr_") != -1) {
			var fromId = el.data("from").replace("r_", "");
			var toId = el.data("to").replace("r_", "");
			var fromEle = paper.getById("t_" + fromId);
			var toEle = paper.getById("t_" + toId);
			if ((fromEle.attr("fill") == "red" || toEle.attr("fill") == "red") && !(fromEle.attr("fill") == "red" && toEle.attr("fill") == "red")) {
				el.show();
			} else {
				el.hide();
			}
		}
	});
}
function restoreLink(paper) {
	paper.forEach(function (el) {
		if (el.id.indexOf("arr_") != -1) {
			el.show();
		}
	});
}

/**
 * 绘制模块, 水平布局
 *
 * @param mod 模块对象
 */
function drawModuleHorizontal(paper, mod) {
	var re = paper.rect(mod.x, mod.y, mod.width, mod.height, 5 / Math.pow(zoomRate, mod.level));
	re.id = "r_" + mod.id;
	re.attr({
		title : mod.name,
		fill : mod.attr.fill,
		"fill-opacity" : mod.attr.fill_opacity,
		stroke : mod.attr.stroke,
		"stroke-width" : mod.attr.stroke_width
	});

	re.data("m", {
		id : mod.id,
		level : mod.level,
		parentId : "r_" + mod.parentId,
		children : mod.children,
		arrows : mod.arrows,
		direction : mod.direction
	});
	re.data("type", mod.type);
	re.data("regionId", "");
	re.data("direction", mod.direction);
	re.mouseover(function () {
		this.attr("fill-opacity", this.attr("fill-opacity") * 1.6);
		vitualIntroduce(this, mod.type, mod.id);
	}).mouseout(function () {
		this.attr("fill-opacity", this.attr("fill-opacity") / 1.6);
	});
	if (re.id.indexOf("region_") == -1) {
		re.click(clickCallback);
	}
	var longName = mod.name;
	mod.name = justifyNameLength(mod.name, 11);
	var name = mod.name.substr(0, 1);
	for (var i = 1; i < mod.name.length; i++) {
		name = name + "\n" + mod.name.substr(i, 1);
	}
	var txt = paper.text(mod.x + 19, mod.y + mod.height / 2, name);
	txt.id = "t_" + mod.id;
	txt.attr({
		"font-size" : mod.attr.font_size,
		"font-weight" : mod.attr.font_weight,
		"cursor" : "help",
		"title" : longName
	});

	txt.data("mid", re.id);
	txt.data("link", mod.link);
	txt.data("longName", longName);
	txt.data("direction", mod.direction);
	txt.click(selectModel);
	re.data("m").children.push(txt.id);

	var parent = paper.getById("r_" + mod.parentId);
	if (parent) {
		parent.data("m").children.push(re.id);
	}

	return {
		r : re,
		t : txt
	};
}

/**
 * 绘制模块
 * @param mod 模块对象
 */
function drawArrow(paper, relation, level) {
	var o1 = paper.getById("r_" + relation.from);
	var o2 = paper.getById("r_" + relation.to);
	// 判断这条线如果已经存在，就不再画了 
	var oldArr = paper.getById("arr_" + relation.from+"_"+relation.to);

	if(oldArr  && relation.logicrelation == ""){
		oldArr.show();
		return;
	}

	if(o1 != null && o2 != null) {
		var arr = paper.arrow({ obj1: o1, obj2: o2 }, {
			"stroke": recFills[level % 3], 
			"stroke-width": 1.2 / Math.pow(zoomRate, level),
			"stroke-opacity": 0.8 / Math.pow(zoomRate, level)
		});
		if(arr !=null){
			// alert(relation.logicrelation);
			arr.id = "arr_" + relation.from+"_"+relation.to;
			arr.attr("stroke","mediumorchid");
			arr.mouseover(function () {  
				arr.attr({"stroke": "blue", "stroke-width": 4 / Math.pow(zoomRate, level)});  
	        }).mouseout(function () {  
	        	arr.attr({"stroke": "mediumorchid", "stroke-width": 1.2 / Math.pow(zoomRate, level)});  
	        });  
	        
	        

			if(relation.logicrelation == "" && relation.type){// 通过判断json对象中的type类型设置画线的颜色
				if(relation.type != null && relation.type != "NULL" && relation.type != ""){
					if(relation.type == "0"){// 0 ---depand on
						arr.attr("stroke","black");
						arr.mouseover(function () {  
							arr.attr({"stroke": "red", "stroke-width": 4 / Math.pow(zoomRate, level)});  
						}).mouseout(function () {  
							arr.attr({"stroke": "black", "stroke-width": 1.2 / Math.pow(zoomRate, level)});  
						}); 
					}else if(relation.type == "1"){//1 ---select
						arr.attr("stroke","chocolate");
						arr.mouseover(function () {  
							arr.attr({"stroke": "darkred", "stroke-width": 4 / Math.pow(zoomRate, level)});  
						}).mouseout(function () {  
							arr.attr({"stroke": "chocolate", "stroke-width": 1.2 / Math.pow(zoomRate, level)});  
						}); 
					}else if(relation.type == "2"){//2 ---if条件
						arr.attr("stroke","indianred");
						arr.mouseover(function () {  
							arr.attr({"stroke": "indigo", "stroke-width": 4 / Math.pow(zoomRate, level)});  
						}).mouseout(function () {  
							arr.attr({"stroke": "indianred", "stroke-width": 1.2 / Math.pow(zoomRate, level)});  
						}); 
					}
				}
			}
			


			if(relation.logicrelation){
				if(relation.logicrelation !=null && relation.logicrelation !=""){
					arr.attr("title",relation.logicrelation);
					arr.attr("stroke","green");
					arr.click(function () {
						alert(relation.logicrelation);
					});
					arr.mouseover(function () {  
							arr.attr({"stroke": "green", "stroke-width": 4 / Math.pow(zoomRate, level)});  
						}).mouseout(function () {  
							arr.attr({"stroke": "green", "stroke-width": 1.2 / Math.pow(zoomRate, level)});  
						}); 
				}
			}

			arr.data({
				from : o1.id,
				to : o2.id,
				level : level
			});
			o1.data("m").arrows.push(arr.id);
			o2.data("m").arrows.push(arr.id);
		}
	}
}
function twoOtherfilterClick() {
	arrowOtherFilter(mapPaper);
}
function twoWayfilterClick() {
	arrowTwoFilter(mapPaper);
}
function TsinghuaClick(type) {
	getLXRFromTsinghua(mapPaper, type);
}
function filterClick() {
	arrowFilter(mapPaper);
	/**
	var container = $("#center");
	var width = container.width();
	var height = container.height();
	viewBoxWidth = width;
	viewBoxHeight = height;
	if(viewBoxWidth<(9*200+8*paddingWidth)){
	viewBoxWidth = 9*200+8*paddingWidth;
	}
	var filterPaper = Raphael("filterPaper");
	var sd = $("#filterPaper svg")[0];
	sd.setAttributeNS (null, "width", width-50);
	sd.setAttributeNS (null, "height", height-50);
	sd.setAttribute('viewBox', "0 0 " + viewBoxWidth + " " + viewBoxHeight);

	$( "#filterDialog" ).dialog({
	resizable: false,
	draggable: true,
	title: "filter",
	hide:"slide",
	width: "800",
	height: "600",
	modal: true,
	beforeClose: function( event, ui ) {

	},
	open: function( event, ui ) {

	}
	});
	 **/
}

/**
 * 调整元素相关联元素的布局
 * @param paper
 * @param id
 */
function layoutArrow(paper, id) {
	var el = paper.getById(id);
	if (el == null) {
		return;
	}
	if (id.indexOf("r_") != -1) {
		var arrows = el.data("m").arrows;
		for (var i = 0; i < arrows.length; i++) {
			var arr = paper.getById(arrows[i]);
			if (arr == null) {
				continue;
			}
			var o1 = paper.getById(arr.data("from"));
			var o2 = paper.getById(arr.data("to"));
			if (o1 != null && o2 != null) {
				var point = calcStartEnd(o1, o2);
				if (point != null) {
					var p = getArr(point.start.x, point.start.y, point.end.x, point.end.y, 8);
					arr.attr("path", p);//重新绘制路径
				}
			}
		}
	}
}
function deleteArrow(paper, id) {
	var el = paper.getById(id);
	if (el == null) {
		return;
	}
	if (id.indexOf("r_") != -1) {
		var arrows = el.data("m").arrows;
		for (var i = 0; i < arrows.length; i++) {
			var arr = paper.getById(arrows[i]);
			if (arr == null) {
				continue;
			}
			arr.remove();
		}
	}
}
/**
 * 重新设置svg的区域
 */
function refreshSVGBox(paper) {
	var svgDom = $("svg")[0];//取第一个svg元素，即主页
	var maxX = 0;
	var maxY = 0;
	var eleWidth = 0;
	var eleHeight = 0;
	paper.forEach(function (el) {
		if (el.id.indexOf("r_") != -1) {
			var x = el.attr("x");
			var y = el.attr("y");
			if (x > maxX) {
				maxX = x;
				eleWidth = el.attr("width");
			}
			if (y > maxY) {
				maxY = y;
				eleHeight = el.attr("height");
			}
		}
	});
	var w = maxX + eleWidth + paddingWidth;
	var h = maxY + eleHeight + paddingHeight;
	svgDom.setAttributeNS(null, "width", w);
	svgDom.setAttributeNS(null, "height", h);
	svgDom.setAttribute('viewBox', "0 0 " + (w * currentRate) + " " + (h * currentRate));
}
/**
 *元素点击事件回调
 *@deprecation: 不再使用 preEvent方法
 **/
var preClickMap = {};
function preEvent(type, obj) {
	//虚拟目录和编译选项不用移除原来的region
	if (type == 0) {
		return;
	}
	var parentId = obj.data("m").parentId;
	var prethis = preClickMap[type + "_" + parentId];
	if (prethis) {
		prethis.attr("stroke-width", prethis.attr("stroke-width") - 5);
		moveRegion(prethis);
	}
	preClickMap[type + "_" + parentId] = obj;
}


// 点击处理事件, 点击以后会隐藏被点击的关系.
function postCallFilter (obj) {
	var paper = mapPaper;
	var regionId = obj.data("regionId").replace("region_r_", "");
	if (regionId != "") {
		paper.forEach(function (el) {
			if (el.id.indexOf("arr_") != -1) {
				var fromId = el.data("from").replace("r_", "");
				var toId = el.data("to").replace("r_", "");
				if (fromId == regionId || toId == regionId) {
					el.hide();
				}
			}
		});
	}
}
function postCallFilterRestroe(obj) {
	var paper = mapPaper;
	var regionId = obj.data("regionId").replace("region_r_", "");
	if (regionId != "") {
		paper.forEach(function (el) {
			if (el.id.indexOf("arr_") != -1) {
				var fromId = el.data("from").replace("r_", "");
				var toId = el.data("to").replace("r_", "");
				if (fromId == regionId || toId == regionId) {
					el.show();
				}
			}
		});
	}
}
/**
*点击事件回调
*@Description：对不同类型模块的点击事件的处理
*
*/
function clickCallback() {
	var type = this.data("type");
	var regionId = this.data("regionId");
	if (regionId != "") {
		this.attr("stroke-width", this.attr("stroke-width") - 5);
		this.data("isOpen", "false");
		moveRegion(this);
		if (type == types[0]) {
			deleteChilren(mapPaper, this.id);
		};
	} else {
		//preEvent(type,this);
		if (type == types[0]) {
			showSelectDialog(this);
		} else if (type == types[3]) {
			showDialog3(this, type);
		} else if (type == types[5]) {
			showDialog3(this, type);
		} else if (type == types[1]) {
			this.attr("stroke-width", this.attr("stroke-width") + 5);
			showDialog(this, type);
		} else if (type == types[2]) {
			this.attr("stroke-width", this.attr("stroke-width") + 5);
			showDialog(this, type);
		}
	}
}
/**
*@description：对弹出框中出现的函数、变量、注释的选择，并关闭弹出框
*/
function selectfsv(type) {
	$("#stype").val(type);
	$("#selectDig").dialog("close");
}
/**
*@description：对弹出框中出现的注释的选择，并关闭弹出框
*/
function selectzs(type) {
	$("#stype").val(type);
	$("#selectDig3").dialog("close");
}
/**
*@description：对弹出框中出现的展开、注释的选择，并关闭弹出框
*/
function selectby(type) {
	$("#stype").val(type);
	$("#selectDig4").dialog("close");
}

function openChild(openId) {
	$("#selectOpenId").val(openId);
	$("#selectDig2").dialog("close");
}
function showSelectDialog(obj) {
	console.log("showSelectDialog");
	var container = $("#center");
	var x = obj.attr("x");
	var y = obj.attr("y"); //-obj.attr("height");
	if (container) {
		x = x - container.scrollLeft() + container.offset().left;
		y = y - container.scrollTop() + container.offset().top;
	}
	$("#selectDig2").dialog({
		resizable : false,
		draggable : true,
		title : "selected",
		hide : "slide",
		width : 70,
		height : 150,
		position : [x, y],
		modal : true,
		beforeClose : function (event, ui) {
			var openId = $("#selectOpenId").val();
			$("#selectOpenId").val(-1);
			if (openId == "1") { //展开虚目录
				var rootId = obj.data("m").id;
				var direction = obj.data("direction");
				var isOpen = obj.data("isOpen");
				if (isOpen == "true") {
					deleteChilren(mapPaper, obj.id);
					obj.data("isOpen", "false");
					return;
				}

				if (direction == "vertical") {
					drawChildrenHeap(mapPaper, rootId, modulesMap, "vertical", 1);
				} else {
					drawChildrenHeap(mapPaper, rootId, modulesMap, "horizontal", 1);
				}

				obj.data("isOpen", "true");
				for (var level in relationsMap) {
					var levelRelations = relationsMap[level];
					for (var j = 0; j < levelRelations.length; j++) {
						var rel = levelRelations[j];
						drawArrow(mapPaper, rel, level);
					}
				}
				// refreshSVGBox(mapPaper,$("svg")[0]);
				// }else if(openId == "2"){//编译选项
				var type = obj.data("type");

				var regionId = obj.data("regionId");
				if (regionId != "") {
					obj.attr("stroke-width", obj.attr("stroke-width") - 5);
					alert("something error");
					 - obj.data("isOpen", "false");
					moveRegion(obj);
				} else {
					obj.attr("stroke-width", obj.attr("stroke-width") + 5);
					showDialog(obj, type);
				}
				refreshSVGBox(mapPaper, $("svg")[0]);
			} else if (openId == "7") {
				alert("将要跳转中科院文档分析");
				window.open("../kernel/analysis.php?type=" + obj.data("type") + "&id=" + obj.id.slice(4) + "&arch=" + current_arch);
			} else {}
		},
		open : function (event, ui) {
			var isOpen = obj.data("isOpen");
			if (isOpen == "true") {
				$("#openpId").html("收缩");
			} else {
				$("#openpId").html("展开");
			}
		}
	});
}
function showDialog(obj, type) {
	var fortype = null;
	if (type == types[2]) {
		var container = $("#center");
		var x = obj.attr("x");
		var y = obj.attr("y") - obj.attr("height");
		if (container) {
			x = x - container.scrollLeft() + container.offset().left;
			y = y - container.scrollTop() + container.offset().top;
		}
		$("#selectDig").dialog({
			resizable : false,
			draggable : true,
			title : "selected",
			hide : "slide",
			width : 70,
			height : 150,
			position : [x, y],
			modal : true,
			beforeClose : function (event, ui) {
				fortype = $("#stype").val();
				$("#stype").val(-1);
				if (fortype == -1) {
					obj.attr("stroke-width", obj.attr("stroke-width") - 5);
				} else if (fortype == "6") {
					window.open("../kernel/annourl.php?type=" + obj.data("type") + "&id=" + obj.id.slice(4) + "&arch=" + current_arch);
				} else {
					addRegion(obj, fortype);
				}
			},
			open : function (event, ui) {}
		});

	} else if (type == types[1]) {
		var container = $("#center");
		var x = obj.attr("x");
		var y = obj.attr("y") - obj.attr("height");
		if (container) {
			x = x - container.scrollLeft() + container.offset().left;
			y = y - container.scrollTop() + container.offset().top;
		}
		$("#selectDig4").dialog({
			resizable : false,
			draggable : true,
			title : "selected",
			hide : "slide",
			width : 70,
			height : 150,
			position : [x, y],
			modal : true,
			beforeClose : function (event, ui) {
				fortype = $("#stype").val();
				$("#stype").val(-1);
				if (fortype == -1) {
					obj.attr("stroke-width", obj.attr("stroke-width") - 5);
				} else if (fortype == "6") {
					window.open("../kernel/annourl.php?type=" + obj.data("type") + "&id=" + obj.id.slice(4) + "&arch=" + current_arch);
				} else {
					addRegion(obj, fortype);
				}
			},
			open : function (event, ui) {}
		});

	} else {
		addRegion(obj, fortype);
	};
	return null;
}

function showDialog3(obj, type) {
	var fortype = null;
	if (type == types[3] || type == types[5]) {
		var container = $("#center");
		var x = obj.attr("x");
		var y = obj.attr("y") - obj.attr("height");
		if (container) {
			x = x - container.scrollLeft() + container.offset().left;
			y = y - container.scrollTop() + container.offset().top;
		}
		$("#selectDig3").dialog({
			resizable : false,
			draggable : true,
			title : "selected",
			hide : "slide",
			width : 70,
			height : 150,
			position : [x, y],
			modal : true,
			beforeClose : function (event, ui) {
				fortype = $("#stype").val();
				$("#stype").val(-1);
				if (fortype == -1) {
					obj.attr("stroke-width", obj.attr("stroke-width") - 5);
				} else if (fortype == "6") {
					window.open("../kernel/annourl.php?type=" + obj.data("type") + "&id=" + obj.id.slice(4) + "&arch=" + current_arch);
				} else {
					addRegion(obj, fortype);
				}
			},
			open : function (event, ui) {}
		});

	} else {
		addRegion(obj, fortype);
	}
	return null;
}
/**
 *增加一个区域，有多个元素构成
 */
function addRegion(ele, fortype) {
	var reg = new region(ele, fortype);
	reg.init();
	ele.data("region", reg);
	ele.data("regionId", "region_" + ele.id);
	postCallFilter(ele);
}
/**
 *删除一个区域
 */
function moveRegion(ele) {
	postCallFilterRestroe(ele);
	var reg = ele.data("region");
	if (reg) {
		reg.remove();
	}
	ele.data("regionId", "");
}
/**
 * 将json对象中的图形元素渲染至svg中
 *可以分为两大部分，1、module的图形渲染，2、关联关系的图形渲染。其中1的渲染分为水平module和 垂直module的渲染
 *注:如果数据量出现过大，并造成脚本相应促使页面卡死的情况，请使用setTimeout将这这几部分拆分进行渲染
 */
var modulesMap = {};
var rootModulesMap = {};
var relationsMap = {};
function paint(paper, jo) {
	var layers = jo.map.layers;
	for (var i = 0; i < layers.length; i++) {
		level = layers[i].level;
		modules = layers[i].modules;
		var relations = layers[i].relations;
		if (relations.length > 0) {
			relationsMap[level] = relations;
		}
		for (var j = 0; j < modules.length; j++) {
			var m = modules[j];
			var derection = "vertical";
			if (m.id == "0_7") { //设备管理水平布局
				derection = "horizontal";
			}
			var mod = new module(m.id, m.name, m.parentid, types[0], m.link, level, derection); //虚拟目录

			if (level == 0) {
				rootModulesMap[m.id] = mod;
			} else {
				//设置过滤条件
				modulesMap[m.id] = mod;
			}
		}
	}
	//纵向排列
	initPaper(paper, rootModulesMap, modulesMap, "vertical");
	//横向排列
	initPaper(paper, rootModulesMap, modulesMap, "horizontal");
	/** */
	for (var level in relationsMap) {
		var levelRelations = relationsMap[level];
		for (var j = 0; j < levelRelations.length; j++) {
			var rel = levelRelations[j];
			drawArrow(paper, rel, level);
		}
	}

	refreshSVGBox(paper, $("svg")[0]);
}
/**
*初始化主页上的module，当中用到的一些常量数值要与index页面中的一一对应
*/
function initPaper(paper, rootModulesMap, modulesMap, direction) {
	if (direction == "horizontal") {
		var x = 10;
		var y = regionYMax;
		for (var rootId in rootModulesMap) {
			var root = rootModulesMap[rootId];
			if (root.direction == "horizontal") {
				root.setSize(x, y + paddingHeight, paddingHeight + 2, 250);
				drawModule(paper, root);
				y = y + 250;
				drawChildrenHeap(paper, rootId, modulesMap, "horizontal", 1);
			}
		}

	} else {
		var x = 10;
		var y = regionY;
		for (var rootId in rootModulesMap) {
			var root = rootModulesMap[rootId];
			if (root.direction == "vertical") {
				root.setSize(x, y, 180, paddingHeight);
				drawModule(paper, root);
				x = x + 200;
				drawChildrenHeap(paper, rootId, modulesMap, "vertical", 1);
			}
		}
		getRegionYMax(paper);
	}
}
/**
*水平布局的module在垂直布局的module下方，故要计算水平布局的最大y坐标（被上方垂直布局占用的高度）
*/
function getRegionYMax(paper) {
	//需要计算regiony的最大值
	var max = 0;
	paper.forEach(function (el) {
		var direction = el.data("direction");
		var ey = el.attr("y");
		var eh = el.attr("height");
		if (direction == "vertical") {
			if (ey + eh + paddingHeight > max) {
				max = ey + eh + paddingHeight;
			}
		}
	});
	regionYMax = max;
}
/**
*渲染子节点的module
*@description：用type分为水平和垂直两种类型的module，deep是来确定需要渲染到子节点的第几层
*注：目前只是用到了一层，如有需要可以扩展，只需要修改deep值
*/
function drawChildrenHeap(paper, parentId, modulesMap, type, deep) {
	for (var moduleId in modulesMap) {
		var mod = modulesMap[moduleId];
		if (parentId == mod.parentId) {
			var parent = paper.getById("r_" + parentId);
			//var brothers = parent.data("m").children;
			var premodule = getPreModule(mod, paper);
			var bb = premodule.getBBox();
			mod.direction = parent.data("m").direction;
			if (type == "horizontal" && "horizontal" == mod.direction) { //she bei guanli
				mod.setSize(bb.x2, parent.getBBox().y + modulePadding,
					paddingHeight, parent.getBBox().height - modulePadding * 2);
				var root = getFirsParent(parent); //多层级展开时，寻找他的跟节点作为y坐标的范围
				horizontalShift(paper, bb.x2 - 5 / Math.pow(zoomRate, mod.level), paddingHeight, root.attr("y"), root.attr("height"));
			} else if (type == "vertical") {
				mod.setSize(parent.getBBox().x + modulePadding, bb.y2,
					parent.getBBox().width - modulePadding * 2, paddingHeight);
				verticalShift(paper, parent.attr("x"), parent.attr("width"), bb.y2 - 5 / Math.pow(zoomRate, mod.level), paddingHeight);
			}
			drawModule(paper, mod);
			if (deep > 1) {
				drawChildrenHeap(paper, moduleId, modulesMap, type, deep - 1);
			}
		}
	}
}
/*
*获得一个元素的最上层父节点
*/
function getFirsParent(ele) {
	if (ele == null || !ele.data("m")) {
		return null;
	}
	var pid = ele.data("m").parentId;
	var type = ele.data("type");
	if (pid == "r_" + type + "_-1") {
		return ele;
	} else {
		var el = ele.paper.getById(pid);
		return getMyRoot(el);
	}
}
function getChildrenHeap(paper, parentId, childrenMap) {
	paper.forEach(function (el) {
		if (el.id.indexOf("r_") == 0) {
			var pid = el.data("m").parentId;
			if (parentId == pid) {
				childrenMap[el.id] = el.id;
				var txtid = el.id.replace("r_", "t_");
				childrenMap[txtid] = txtid;
				getChildrenHeap(paper, el.id, childrenMap);
			}
		}
	});
}
/*
*删除所有的子节点（递归）
*/
function deleteChilren(paper, parentId) {
	var childrenMap = {};
	var parent = paper.getById(parentId);
	getChildrenHeap(paper, parentId, childrenMap);
	for (var index in childrenMap) {
		var ele = paper.getById(childrenMap[index]);
		if (ele) {
			var direction = ele.data("direction");
			if (direction == "vertical") {
				verticalDeleteShift(paper, ele, parent);
			} else {
				horizontalDeleteShift(paper, ele);
			}
			deleteArrow(paper, ele.id);
			var reg = ele.data("region");
			if (reg && reg != "") {
				reg.remove();
				ele.data(region, "");
				ele.data("regionId", "");
			}
			ele.remove();
		}
	}
}
/*
*以下**Shift的方法是实现在操作module时，包括添加和删除操作时，要对已经存在的module重新计算位置
*这里的重新计算其实就是平移操作（上下左右）
*/
function verticalShift(paper, x1, width, y1, height) {
	paper.forEach(function (el) {
		var direction = el.data("direction");
		var ex = el.attr("x");
		var ey = el.attr("y");
		if (direction == "vertical") {
			if (ex >= x1 && ex <= x1 + width && ey >= y1) {
				el.attr("y", ey + height);
				layoutArrow(paper, el.id);
			}
		}
	});
	var oldRegionYMax = regionYMax;
	getRegionYMax(paper);
	if (regionYMax > oldRegionYMax) {
		paper.forEach(function (el) {
			var direction = el.data("direction");
			var ey = el.attr("y");
			if (direction == "horizontal") {
				el.attr("y", ey + regionYMax - oldRegionYMax);
				layoutArrow(paper, el.id);
			}
		});
	}
}
function verticalDeleteShift(paper, ele, parent) {
	var x = parent.attr("x");
	var y = ele.attr("y");
	var height = ele.attr("height");
	var width = parent.attr("width");
	paper.forEach(function (el) {
		var direction = el.data("direction");
		var ex = el.attr("x");
		var ey = el.attr("y");
		if (direction == "vertical") {
			if (ex >= x && ex <= x + width && ey >= y) {
				el.attr("y", ey - height);
				layoutArrow(paper, el.id);
			}
		}
	});
	var oldRegionYMax = regionYMax;
	getRegionYMax(paper);
	if (regionYMax < oldRegionYMax) {
		paper.forEach(function (el) {
			var direction = el.data("direction");
			var ey = el.attr("y");
			if (direction == "horizontal") {
				el.attr("y", ey + regionYMax - oldRegionYMax);
				layoutArrow(paper, el.id);
			}
		});
	}
}
//设备管理部分的展开子节点，对其后的节点平移
function horizontalShift(paper, x1, width, y1, height) {
	paper.forEach(function (el) {
		var direction = el.data("direction");
		var ex = el.attr("x");
		var ey = el.attr("y");
		if (direction == "horizontal") {
			//alert("ex:"+el.attr("title")+"---"+ex+"=="+x1);
			if (ey >= y1 && ey <= y1 + height && ex >= x1) {
				el.attr("x", ex + width);
				layoutArrow(paper, el.id);
			}
		}
	});
}
function horizontalDeleteShift(paper, ele) {
	var x = ele.attr("x");
	var y = ele.attr("y");
	var width = ele.attr("width");
	paper.forEach(function (el) {
		var direction = el.data("direction");
		var ex = el.attr("x");
		var ey = el.attr("y");
		if (direction == "horizontal") {
			if (ey >= regionYMax && ex >= x) {
				el.attr("x", ex - width);
				layoutArrow(paper, el.id);
			}
		}
	});
}
/**
*获得这个要渲染的元素需要紧邻的元素
*/
function getPreModule(module, paper) {
	var parent = paper.getById("r_" + module.parentId);
	var target = null;
	var children = parent.data("m").children;
	while (true) {
		if (children.length > 0) {
			var last = paper.getById(children[children.length - 1]);
			if (!last) {
				children.pop();
				continue;
			}
			target = last;
			if (last.id.indexOf("r_") == 0) {
				children = last.data("m").children;
			} else {
				break;
			}
		} else {
			break;
		}
	}
	var rectModule = paper.getById(target.data("mid"));
	return rectModule;
}
