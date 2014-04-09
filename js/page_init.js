var GET_MAP_URL = 'map711.json';

/**
 * 绘制顶层模块
 */
function drawTopModules(paper) {
	//进程管理
	var processing = new module("0_1", "进程", "-1", 0, "#", 0);
	processing.setSize(10, regionY, 180, paddingHeight);
	//系统运行
	var system = new module("0_2", "系统管理", "-1", 0, "#", 0);
	system.setSize(210, regionY, 180, paddingHeight);

	//内存管理
	var memory = new module("0_3", "内存", "-1", 0, "#", 0);
	memory.setSize(410, regionY, 180, paddingHeight);

	//文件系统
	var storage = new module("0_4", "文件系统", "-1", 0, "#", 0);
	storage.setSize(610, regionY, 180, paddingHeight);

	//网络协议
	var networking = new module("0_5", "网络", "-1", 0, "#", 0);
	networking.setSize(810, regionY, 180, paddingHeight);

	//内核安全
	var security = new module("0_6", "安全", "-1", 0, "#", 0);
	security.setSize(1010, regionY, 180, paddingHeight);

	//设备驱动
	var electronics = new module("0_7", "设备驱动", "-1", 0, "#", 0, "horizontal");
	electronics.setSize(10, 10, paddingHeight + 2, 250);

	//虚拟化
	var virtualization = new module("0_8", "虚拟化", "-1", 0, "#", 0);
	virtualization.setSize(10, 20, paddingHeight + 2, 250);

	drawModule(paper, processing);
	drawModule(paper, system);
	drawModule(paper, memory);
	drawModule(paper, storage);
	drawModule(paper, networking);
	drawModule(paper, security);
	drawModule(paper, electronics);
	drawModule(paper, virtualization);
}

/**
 * 页面加载完毕后的初始化
 */
function initialize(evt) {
	/*
	 * 全局变量设置，设置完成之后不能再修改
	 */
	mapPaper = Raphael("center");
	svgDom = $("svg")[0];

	/*
	 * jquery ajax 设置
	 */
	$.ajaxSetup({
		error: function(x, e) {
			alert("AJAX错误：" + e);
			return false;
		}
	});

	$.getJSON(GET_MAP_URL, {
		"time": (new Date()).getTime()
	}, function(data) {
		autoLayout(evt);
		initTree(GET_MAP_URL);
		//drawTopModules(mapPaper);
		paint(mapPaper, data);



		window.addEventListener('resize', autoLayout, false);
		window.addEventListener('keydown', processKeyPress, true); // OK to let the keydown event bubble.

		svgDom.addEventListener('mousewheel', zoomViaMouseWheel, false); // Don't let the mousewheel event bubble up to stop native browser window scrolling.
		svgDom.addEventListener('dragstart', dragHandler.dragstart, false);
		svgDom.addEventListener('dragend', dragHandler.dragend, false);
		svgDom.addEventListener('mousedown', dragHandler.dragstart, false);
		svgDom.addEventListener('mouseup', dragHandler.dragend, false);


		$('#zoom_in').button({
			icons: {
				primary: "ui-icon-zoomin"
			}
		}).click(function(event) {
			zoom('zoomIn');
		});

		$('#zoom_out').button({
			icons: {
				primary: "ui-icon-zoomout"
			}
		}).click(function(event) {
			zoom('zoomOut');
		});
		$('#filter').button({
			icons: {
				primary: "ui-icon-filter"
			}
		}).click(function() {
			filterClick();
		});
		$('#twoWayfilter').button({
			icons: {
				primary: "ui-icon-filter"
			}
		}).click(function() {
			twoWayfilterClick();
		});
		$('#twoOtherfilter').button({
			icons: {
				primary: "ui-icon-filter"
			}
		}).click(function() {
			twoOtherfilterClick();
		});
		$('#getLXRFromTsinghua').button({
			icons: {
				primary: "ui-icon-filter"
			}
		}).click(function() {
			getLXRFromTsinghua();
		});
		$('#filterRestore').button({
			icons: {
				primary: "ui-icon-filter"
			}
		}).click(function() {
			restoreLink(mapPaper);
		});



		$('#sequence').button({
			icons: {
				primary: "ui-icon-transferthick-e-w"
			}
		}).click(function() {
			window.open("./sequence/index.html", "", "");
		});

		$('#use_hint').button({
			icons: {
				primary: "ui-icon-info"
			}
		});
		$('#arm').button({
			icons: {
				primary: "ui-icon-transferthick-e-w"
			}
		}).click(function() {
			window.open("index-arm.html?arch=arm", "", ""); //
			parent.location.reload();
		});
		$(document).tooltip({
			items: "#zoom_in, #zoom_out, #use_hint, #arm, #filterRestore, #selectDiv, #pageNext",
			track: true,
			content: function() {
				var element = $(this);
				if (element.is("#use_hint")) {
					return "<table border='1' bordercolor='#a0c6e5' style='border-collapse:collapse;'><tr><td style='border: solid 1px #a0c6e5; height: 20px;' bgcolor='#dae9bd' colspan='3'>1、画线的颜色说明：</td></tr><tr><td width='26%'>depand on</td><td width='37%'><font color='black'><span style='font-weight:bold;'>black<hr style='FILTER: progid:DXImageTransform.Microsoft.Shadow(color:#f6ae56,direction:145,strength:15)' color='black' SIZE=5 width='70%' /></span></font></td><td width='37%'><font color='red'><span style='font-weight:bold;'>red<hr style='FILTER: progid:DXImageTransform.Microsoft.Shadow(color:#f6ae56,direction:145,strength:15)' color='red' SIZE=5 width='70%'/></span></font></td></tr><tr><td width='26%'>select</td><td width='37%'><font color='chocolate'><span style='font-weight:bold;'>chocolate<hr style='FILTER: progid:DXImageTransform.Microsoft.Shadow(color:#f6ae56,direction:145,strength:15)' color='chocolate' SIZE=5 width='70%'/></span></font></td><td width='37%'><font color='darkred'><span style='font-weight:bold;'>darkred<hr style='FILTER: progid:DXImageTransform.Microsoft.Shadow(color:#f6ae56,direction:145,strength:15)' color='darkred' SIZE=5 width='70%'/></span</font></td></tr><tr><td width='26%'>if条件</td><td width='37%'><font color='indianred'><span style='font-weight:bold;'>indianred<hr style='FILTER: progid:DXImageTransform.Microsoft.Shadow(color:#f6ae56,direction:145,strength:15)' color='indianred' SIZE=5 width='70%'/></span</font></td><td width='37%'><font color='indigo'><span style='font-weight:bold;'>indigo<hr style='FILTER: progid:DXImageTransform.Microsoft.Shadow(color:#f6ae56,direction:145,strength:15)' color='indigo' SIZE=5 width='70%'/></span</font></td></tr><tr><td width='26%'>默认颜色</td><td width='37%'><font color='mediumorchid'><span style='font-weight:bold;'>mediumorchid<hr style='FILTER: progid:DXImageTransform.Microsoft.Shadow(color:#f6ae56,direction:145,strength:15)' color='mediumorchid' SIZE=5 width='70%'/></span</font></td><td width='37%'><font color='blue'><span style='font-weight:bold;'>blue<hr style='FILTER: progid:DXImageTransform.Microsoft.Shadow(color:#f6ae56,direction:145,strength:15)' color='blue' SIZE=5 width='70%'/></span></font></td></tr></table>2、可用鼠标拖拽图像, 也可用上下左右箭头平移.";
				} else if (element.is("#arm")) {
					return "当前体系结构为X86,点击'切换arm'按钮切换到arm体系结构.";
				} else if (element.is("#filterRestore")) {
					return "重置模块之间的关系到初始化页面时.";
				} else if (element.is("#selectDiv")) {
					return "选择的模块(字体变红)与其他模块之间的关系.";
				} else if (element.is("#pageNext")) {
					return "编译选项下文件的分批展示.";
				} else if (element.is("#sequence")) {
					return "查看Linux内核时序图";
				}
				var text = $("#currentZoomFactorText").text();
				return "当前显示比例为：" + text;
			}
		});
	});
}