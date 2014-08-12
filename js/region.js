/**
 *点击一个rect可能出现的区域
 */
var regionY = 10; //区域可能出现的y最小值
var regionYMax = regionY; //区域可能出现的y最大值
var spaceWidth = 20; //region和他的父的宽度间隔
var regionSpaceWidth = 10; //区域内元素之间的间隔
var regionSpaceHeight = 5; //区域内元素之间的间隔
var section = 3;
var regionAllNum = 12;
var current_arch = getQueryString("arch") ? getQueryString("arch") : 'x86';



function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}

/**
 *@description:区域对象，用来展示虚拟目录，编译选项，文件，函数，结构体，变量的区域
 *这个区域是属于一个元素的，可以认为是区域中元素的父元素
 *初始化时根据父元素的位置，来计算区域的起始位置，并根据区域中元素的个数，最终确定区域的宽和高
 *注：现在区域的宽度是一个固定的值，用三个元素的宽相加获得
 */
function region(rect, fortype) {
	this.num = regionAllNum; //region可以展示的model个数
	this.allNum = 0; //这个region拥有的所有model个数
	this.fortype = fortype;
	this.rect = rect;
	this.paper = rect.paper;
	this.pid = rect.id.replace("r_", "");
	this.type = rect.data("type"); //父元素类型：虚拟目录、编译选项、文件、函数，结构体，变量
	this.x = this.initX();
	this.y = this.initY();
	this.initWidth(); //区域中每行现在显示三个元素
	this.height = 0;
	this.virtuals = [];
	this.configs = [];
	this.files = [];
	this.functions = [];
	this.structs = [];
	this.variables = [];
	this.relations = [];
	this.parid = 0;
	return this;
}

function page(obj) {
	regionAllNum = obj.value;
}
/**
 *初始化区域的宽度
 */
region.prototype.initWidth = function() {
	var direction = this.rect.data("direction");
	if (direction == "horizontal") {
		this.width = section * this.rect.attr("height") + (section - 1) * regionSpaceWidth;
	} else {
		this.width = section * this.rect.attr("width") + (section - 1) * regionSpaceWidth;
	}
}
/**
 *初始化x坐标
 *以根模块的最右侧为基准点计算x坐标
 */
region.prototype.initX = function() {
	//2013-7-8 
	var root = getMyRoot(this.rect, 5);
	var xx = this.rect.attr("x");
	var width = this.rect.attr("width");
	if (root != null) {
		xx = root.attr("x");
		width = root.attr("width");
	}
	var result = xx + width + spaceWidth;
	var regionId = this.rect.data("fromRegId");
	var reg = this.paper.getById(regionId);
	if (reg) { //当区域中的元素中还存在区域时
		if (this.type == types[0]) { //虚拟目录横向移动
			result = reg.attr("x") + reg.attr("width") + spaceWidth;
		} else { //其他放在元素所在区域的下方
			result = reg.attr("x");
		}
	}
	return result;
};
/**
 *初始化y坐标
 *类似于x坐标计算方式
 */
region.prototype.initY = function() {
	var result = this.rect.attr("y");
	var regionId = this.rect.data("fromRegId");
	var reg = this.paper.getById(regionId);
	if (reg) {
		if (this.type == types[0]) { //虚拟目录横向移动
			result = reg.attr("y");
		} else { //其他放在元素所在区域的下方
			result = reg.attr("y") + reg.attr("height");
		}
	}
	return result;
}
var nowStartIndex = 0; //换一批标志，初始化时为1
var startIndex = 0;
var endIndex = 0;
/**
 *一个区域中的元素渲染
 *由于区域大小有限制，只能显示有限的module，当module过多时，通过点击这个区域进行区域内部中元素的切换
 *
 */
function regionSet(that, same) {
	if (!same) {
		nowStartIndex = 0; //换一批标志，初始化时为1
		startIndex = 0;
		endIndex = 0;
	}
	if (that.virtuals.length + that.configs.length + that.files.length + that.functions.length + that.structs.length + that.variables.length > 0) {
		startIndex = nowStartIndex;
		if (startIndex > that.allNum - 1) {
			count = 0;
			startIndex = 0;
		}
		endIndex = startIndex + that.num - 1;
		if (endIndex > that.allNum - 1) {
			endIndex = that.allNum - 1;
		}
		if (!that.hasPaint()) {
			translation(that, that.width + spaceWidth, that.height + regionSpaceHeight);
		}
		that.paintRegion();
		refreshSVGBox(that.paper, $("svg")[0]);
		nowStartIndex = startIndex + that.num;
	}
}
/**
 *读取数据
 *各种类型的module数据的获得，并存放在事先准备的集合容器中
 */
region.prototype.init = function() {
	//获取数据
	var that = this;
	var url = '';
	$.ajaxSettings.async = false;
	if (that.type == types[0]) { //虚拟目录
		//		url='clickvirdir_test-new.json';
		url = 'kernel/virdir.php?jsoncallback=?';
		this.pid = this.pid.slice(2);
		console.log("url:" + url);
		$.getJSON(url, {
			"time": (new Date()).getTime(),
			"VirDirID": this.pid,
			"arch": current_arch
		}, function(data) {

			if (data == null || data == "NULL" || data == "") {
				return;
			} else if (data.modules == null || data.modules == "NULL" || data.modules == "") {
				return;
			}
			var eles = data.modules;
			if (eles) {
				for (var i = 0; i < eles.length; i++) {
					var ele = eles[i];
					if (ele.type == types[0]) { //虚拟目录
						that.virtuals[that.virtuals.length++] = ele;
					} else if (ele.type == types[1]) { //编译选项
						that.configs[that.configs.length++] = ele;
					} else if (ele.type == types[2]) { // 文件
						that.files[that.files.length++] = ele;
					} else if (ele.type == types[3]) { // 函数
						that.functions[that.functions.length++] = ele;
					}
				}
				//初始化高度
				that.allNum = eles.length;
				var realNum = that.num > that.allNum ? that.allNum : that.num;
				that.height = (realNum / section + 1) * (paddingHeight + regionSpaceHeight);

			}
			if (data.relations) {
				that.relations = data.relations;
			}
			regionSet(that);
		});
	} else if (that.type == types[1]) { //编译选项
		url = 'kernel/module.php?jsoncallback=?';
		this.parid = this.rect.data("m").parentId.slice(2);
		this.pid = this.pid.slice(2);

		$.getJSON(url, {
			"time": (new Date()).getTime(),
			"ConfigID": this.pid,
			"arch": current_arch,
			"parentId": this.parid
		}, function(data) {
			var eles = data.modules;
			if (eles) {
				for (var i = 0; i < eles.length; i++) {
					var ele = eles[i];
					if (ele.type == types[0]) { //虚拟目录
						that.virtuals[that.virtuals.length++] = ele;
					} else if (ele.type == types[1]) { //编译选项
						that.configs[that.configs.length++] = ele;
					} else if (ele.type == types[2]) {
						that.files[that.files.length++] = ele;
					} else if (ele.type == types[3]) {
						that.functions[that.functions.length++] = ele;
					}
				}
				//初始化高度
				that.allNum = eles.length;
				var realNum = that.num > that.allNum ? that.allNum : that.num;
				that.height = (realNum / section + 1) * (paddingHeight + regionSpaceHeight);
			}
			if (data.relations) {
				that.relations = data.relations;
			}
			regionSet(that);
		});
	} else if (that.type == types[2]) { //文件
		if (that.fortype == types[4]) {
			url = ""; //结构体
		} else if (that.fortype == types[5]) { // 变量
			this.pid = this.pid.slice(2);
			url = 'kernel/type.php?jsoncallback=?';
			$.getJSON(url, {
				"time": (new Date()).getTime(),
				"TypeID": this.pid,
				"arch": current_arch
			}, function(data) {
				var eles = data.modules;
				if (eles) {
					for (var i = 0; i < eles.length; i++) {
						var ele = eles[i];
						if (ele.type == types[0]) { //虚拟目录
							that.virtuals[that.virtuals.length++] = ele;
						} else if (ele.type == types[1]) { //编译选项
							that.configs[that.configs.length++] = ele;
						} else if (ele.type == types[2]) {
							that.files[that.files.length++] = ele;
						} else if (ele.type == types[3]) {
							that.functions[that.functions.length++] = ele;
						} else if (ele.type == types[5]) {
							that.variables[that.variables.length++] = ele;
						}
					}
					//初始化高度
					that.allNum = eles.length;
					var realNum = that.num > that.allNum ? that.allNum : that.num;
					that.height = (realNum / section + 1) * (paddingHeight + regionSpaceHeight);
				}
				if (data.relations) {
					that.relations = data.relations;
				}
				regionSet(that);
			});
		} else {
			//			url ='clickfiletest.json';
			url = 'kernel/file.php?jsoncallback=?';
			this.pid = this.pid.slice(2);
			$.getJSON(url, {
				"time": (new Date()).getTime(),
				"FileID": this.pid,
				"arch": current_arch
			}, function(data) {
				var eles = data.modules;
				if (eles) {
					for (var i = 0; i < eles.length; i++) {
						var ele = eles[i];
						if (ele.type == types[0]) { //虚拟目录
							that.virtuals[that.virtuals.length++] = ele;
						} else if (ele.type == types[1]) { //编译选项
							that.configs[that.configs.length++] = ele;
						} else if (ele.type == types[2]) {
							that.files[that.files.length++] = ele;
						} else if (ele.type == types[3]) {
							that.functions[that.functions.length++] = ele;
						}
					}
					//初始化高度
					that.allNum = eles.length;
					var realNum = that.num > that.allNum ? that.allNum : that.num;
					that.height = (realNum / section + 1) * (paddingHeight + regionSpaceHeight);
				}
				if (data.relations) {
					that.relations = data.relations;
				}
				regionSet(that);
			});
		}

	} else if (that.type == types[3]) { // 函数
		//		url='clickfunctiontest.json';
		this.pid = this.pid.slice(2);
		url = 'kernel/function.php?jsoncallback=?';
		$.getJSON(url, {
			"time": (new Date()).getTime(),
			"FuncID": this.pid,
			"arch": current_arch
		}, function(data) {
			var eles = data.modules;
			if (eles) {
				for (var i = 0; i < eles.length; i++) {
					var ele = eles[i];
					if (ele.type == types[0]) { //虚拟目录
						that.virtuals[that.virtuals.length++] = ele;
					} else if (ele.type == types[1]) { //编译选项
						that.configs[that.configs.length++] = ele;
					} else if (ele.type == types[2]) {
						that.files[that.files.length++] = ele;
					} else if (ele.type == types[3]) {
						that.functions[that.functions.length++] = ele;
					}
				}
				//初始化高度
				that.allNum = eles.length;
				var realNum = that.num > that.allNum ? that.allNum : that.num;
				that.height = (realNum / section + 1) * (paddingHeight + regionSpaceHeight);
			}
			if (data.relations) {
				that.relations = data.relations;
			}
			regionSet(that);
		});
	} else if (that.type == types[4]) { //结构体

	} else if (that.type == types[5]) { //变量
		//		url='clickfunctiontest.json';
		this.pid = this.pid.slice(2);
		url = 'kernel/type.php?jsoncallback=?';
		$.getJSON(url, {
			"time": (new Date()).getTime(),
			"TypeID": this.pid,
			"arch": current_arch
		}, function(data) {
			var eles = data.modules;
			if (eles) {
				for (var i = 0; i < eles.length; i++) {
					var ele = eles[i];
					if (ele.type == types[0]) { //虚拟目录
						that.virtuals[that.virtuals.length++] = ele;
					} else if (ele.type == types[1]) { //编译选项
						that.configs[that.configs.length++] = ele;
					} else if (ele.type == types[2]) {
						that.files[that.files.length++] = ele;
					} else if (ele.type == types[3]) {
						that.functions[that.functions.length++] = ele;
					} else if (ele.type == types[5]) {
						that.variables[that.variables.length++] = ele;
					}
				}
				//初始化高度
				that.allNum = eles.length;
				var realNum = that.num > that.allNum ? that.allNum : that.num;
				that.height = (realNum / section + 1) * (paddingHeight + regionSpaceHeight);
			}
			if (data.relations) {
				that.relations = data.relations;
			}
			regionSet(that);
		});
	}
};
/**
 *区域的删除（包含区域自身的删除）
 *将在由x，y，width，height确定的区域内的所有元素移除
 *移除元素的是通过元素的占据位置来确定是否删除的（只要在区域范围内的）
 *在移除的元素中当这个元素也存在他的区域时，关联的将他的区域也删除
 */
region.prototype.remove = function() {
	var that = this;
	var id = "r_region_" + this.pid;
	var tid = "t_region_" + this.pid;
	var nowregion = that.paper.getById(id);
	if (!nowregion) {
		return;
	}
	var nowx = nowregion.attr("x");
	var nowy = nowregion.attr("y");
	that.x = nowx;
	that.y = nowy;
	var needMoveEle = [];
	that.paper.forEach(function(el) {
		var regionid = el.data("fromRegId");
		if ((regionid && (regionid != null && regionid != "")) || el.id.indexOf("region_") != -1) {
			var ex = el.attr("x");
			var ey = el.attr("y");
			if (ex <= nowx + that.width && ex >= nowx && ey >= nowy && ey <= nowy + that.height) {
				if (el.id.indexOf("r_") != -1) {
					var reg = el.data("region");
					if (reg && reg != "") {
						reg.remove();
						el.data(region, "");
						el.data("regionId", "");
					}
					var arrows = el.data("m").arrows;
					for (var i = 0; i < arrows.length; i++) {
						var arr = that.paper.getById(arrows[i]);
						if (arr == null) {
							continue;
						}
						needMoveEle[needMoveEle.length] = arr;
					}
				}
				needMoveEle[needMoveEle.length] = el;
			}
		}
	});
	var reEle = that.paper.getById(id);
	if (reEle) {
		needMoveEle[needMoveEle.length] = reEle;
	}
	for (var i = 0; i < needMoveEle.length; i++) {
		var ele = needMoveEle[i];
		ele.remove();
	}
	if (needMoveEle.length > 0) {
		translation(that, -(that.width + spaceWidth), -(that.height + regionSpaceHeight));
		refreshSVGBox(that.paper, $("svg")[0]);
	}
}
/**
 *与remove相同，只是不包括区域自身的删除
 */
function moveFromRegion(paper, regionId) {
	var needMoveEle = [];
	paper.forEach(function(el) {
		var regionid = el.data("fromRegId");
		if (regionid && regionid.indexOf(regionId) != -1) {
			if (el.id.indexOf("r_") != -1) {
				var reg = el.data("region");
				if (reg && reg != "") {
					reg.remove();
					el.data(region, "");
					el.data("regionId", "");
				}
				var arrows = el.data("m").arrows;
				for (var i = 0; i < arrows.length; i++) {
					var arr = paper.getById(arrows[i]);
					if (arr == null) {
						continue;
					}
					needMoveEle[needMoveEle.length] = arr;
				}
			}
			needMoveEle[needMoveEle.length] = el;
		}
	});
	for (var i = 0; i < needMoveEle.length; i++) {
		var ele = needMoveEle[i];
		ele.remove();
	}
}
/**
 *判断是否需要建立区域
 *是否需要一个区域
 */
region.prototype.hasRegion = function() {
	if (this.virtuals.length + this.configs.length + this.files.length + this.functions.length + this.structs.length + this.variables.length > 0) {
		return true;
	} else {
		return false;
	}
}
/**
 *这个区域是否已经渲染过
 */
region.prototype.hasPaint = function() {
	var reg = this.paper.getById("r_" + "region_" + this.pid);
	if (reg != null) {
		return true;
	} else {
		return false;
	}
}
/**
 *区域渲染
 *包括区域的渲染以及区域内的元素的渲染
 *渲染过程中需要区分元素的类型以及元素的是水平or垂直放，这些依赖module类型
 *元素按照每行最多显示三个，多的另起一行继续
 */
region.prototype.paintRegion = function() {
	var that = this;
	if (this.hasRegion()) {
		var regmod = new module("region_" + this.pid, "", this.pid, "", "", 3);
		regmod.setSize(this.x, this.y, this.width, this.height);
		if (this.hasPaint()) {
			moveFromRegion(that.paper, "region_" + this.pid);
		} else {
			drawModule(this.paper, regmod);
			var reg = this.paper.getById("r_" + regmod.id);
			reg.attr("title", "换一批");
			reg.click(function() {
				regionSet(that, true);
			});
		}
		var regtemp = this.paper.getById("r_" + regmod.id);
		regtemp.attr("height", ((endIndex - startIndex + 1) / section + 1) * (paddingHeight + regionSpaceHeight));
		//reg.unclick(next);
		var currentX = this.x;
		var currentY = this.y;
		var virCount = 0;
		for (var i = startIndex; i <= endIndex && this.virtuals.length > 0; i++) {
			var m = this.virtuals[i];
			if (virCount != 0 && virCount % section == 0) {
				currentX = this.x;
				currentY = currentY + paddingHeight + regionSpaceHeight;
			}
			virCount++;
			var mod = new module(m.id, m.name, this.pid, m.type, m.link, m.type);
			var width = this.rect.attr("width");
			var height = paddingHeight;
			if (this.rect.data("direction") == "horizontal") {
				width = this.rect.attr("height");
				height = paddingHeight;
			}
			mod.setSize(currentX, currentY, width, height);
			var moduleObj = drawModule(this.paper, mod);
			moduleObj.r.data("fromRegId", "r_" + regmod.id);
			moduleObj.t.data("fromRegId", "t_" + regmod.id);
			currentX = currentX + width + regionSpaceWidth;
			if (i == endIndex) {
				currentX = this.x;
				currentY = currentY + paddingHeight + regionSpaceHeight;
			}
		}
		var confCount = 0;
		for (var i = startIndex; i <= endIndex && this.configs.length > 0; i++) {
			var m = this.configs[i];
			if (confCount != 0 && confCount % section == 0) {
				currentX = this.x;
				currentY = currentY + paddingHeight + regionSpaceHeight;
			}
			confCount++;
			var mod = new module(m.id, m.name, this.pid, m.type, m.link, m.type);
			var width = this.rect.attr("width");
			var height = paddingHeight;
			if (this.rect.data("direction") == "horizontal") {
				width = this.rect.attr("height");
				height = paddingHeight;
			}
			mod.setSize(currentX, currentY, width, height);
			var moduleObj = drawModule(this.paper, mod);
			moduleObj.r.data("fromRegId", "r_" + regmod.id);
			moduleObj.t.data("fromRegId", "t_" + regmod.id);
			currentX = currentX + width + regionSpaceWidth;
			if (i == endIndex) {
				currentX = this.x;
				currentY = currentY + paddingHeight + regionSpaceHeight;
			}
		}
		var fileCount = 0;
		for (var i = startIndex; i <= endIndex && this.files.length > 0; i++) {
			var m = this.files[i];
			if (fileCount != 0 && fileCount % section == 0) {
				currentX = this.x;
				currentY = currentY + paddingHeight + regionSpaceHeight;
			}
			fileCount++;
			var mod = new module(m.id, m.name, this.pid, m.type, m.link, m.type, null, m.RecColor);
			var width = this.rect.attr("width");
			var height = paddingHeight;
			if (this.rect.data("direction") == "horizontal") {
				width = this.rect.attr("height");
				height = paddingHeight;
			}
			mod.setSize(currentX, currentY, width, height);
			var moduleObj = drawModule(this.paper, mod);
			moduleObj.r.data("fromRegId", "r_" + regmod.id);
			moduleObj.t.data("fromRegId", "t_" + regmod.id);
			currentX = currentX + width + regionSpaceWidth;
			if (i == endIndex) {
				currentX = this.x;
				currentY = currentY + paddingHeight + regionSpaceHeight;
			}
		}
		var funCount = 0;
		for (var i = startIndex; i <= endIndex && this.functions.length > 0; i++) {
			var m = this.functions[i];
			if (funCount != 0 && funCount % section == 0) {
				currentX = this.x;
				currentY = currentY + paddingHeight + regionSpaceHeight;
			}
			funCount++;
			var mod = new module(m.id, m.name, this.pid, m.type, m.link, m.type);
			var width = this.rect.attr("width");
			var height = paddingHeight;
			if (this.rect.data("direction") == "horizontal") {
				width = this.rect.attr("height");
				height = paddingHeight;
			}
			mod.setSize(currentX, currentY, width, height);
			var moduleObj = drawModule(this.paper, mod);
			moduleObj.r.data("fromRegId", "r_" + regmod.id);
			moduleObj.t.data("fromRegId", "t_" + regmod.id);
			currentX = currentX + width + regionSpaceWidth;
			if (i == endIndex) {
				currentX = this.x;
				currentY = currentY + paddingHeight + regionSpaceHeight;
			}
		}
		var variableCount = 0;
		for (var i = startIndex; i <= endIndex && this.variables.length > 0; i++) {
			var m = this.variables[i];
			if (variableCount != 0 && variableCount % section == 0) {
				currentX = this.x;
				currentY = currentY + paddingHeight + regionSpaceHeight;
			}
			variableCount++;
			var mod = new module(m.id, m.name, this.pid, m.type, m.link, m.type);
			var width = this.rect.attr("width");
			var height = paddingHeight;
			if (this.rect.data("direction") == "horizontal") {
				width = this.rect.attr("height");
				height = paddingHeight;
			}
			mod.setSize(currentX, currentY, width, height);
			var moduleObj = drawModule(this.paper, mod);
			moduleObj.r.data("fromRegId", "r_" + regmod.id);
			moduleObj.t.data("fromRegId", "t_" + regmod.id);
			currentX = currentX + width + regionSpaceWidth;
			if (i == endIndex) {
				currentX = this.x;
				currentY = currentY + paddingHeight + regionSpaceHeight;
			}
		}
	}
	//画关系
	for (var i = 0; i < this.relations.length; i++) {
		drawArrow(this.paper, this.relations[i], 1);
	}
};

/**
 *对于paper中所有元素，当有元素的x坐标大于基准点坐标（controlPointX）时，对其右移offset个位置
 *删除或者加入新的元素时，对整个布局的重绘
 */
function translation(reg, offset, offsetH) {
	if (reg.type == types[0]) { //只有虚拟目录的时候需要平移
		var rect = reg.rect;
		reg.paper.forEach(function(el) {
			if (el.id.indexOf("r_") != -1) {
				var x = el.attr("x");
				var y = el.attr("y");
				if (x >= reg.x && y > regionY - 1) {
					el.attr("x", x + offset);
					layoutArrow(reg.paper, el.id); //如果有关联关系，也需要重新布局
					var txtid = el.id.replace("r_", "t_");
					var txtele = reg.paper.getById(txtid);
					if (txtele) {
						txtele.attr("x", txtele.attr("x") + offset);
					}
				}
			}

		});
	}
	//else{
	/***/
	var oldRegionYMax = regionYMax;
	reg.paper.forEach(function(el) {
		var direction = el.data("direction");
		var ey = el.attr("y");
		var ex = el.attr("x");
		if (direction == "horizontal" && reg.y + reg.height > oldRegionYMax) {
			el.attr("y", ey + offsetH);
			layoutArrow(reg.paper, el.id); //如果有关联关系，也需要重新布局
		}
		if (reg.type != types[0] && direction == "vertical" && ex >= reg.x && ex <= reg.x + reg.width && ey >= reg.y) {
			el.attr("y", ey + offsetH);
			layoutArrow(reg.paper, el.id); //如果有关联关系，也需要重新布局
		}
	});
	//regionYMax = regionYMax+offsetH;

	//}
}
/**
 *取得这个元素的根元素，level代表最多遍历多少层次 2013-7-8
 */
function getMyRoot(ele, level) {
	if (ele == null || !ele.data("m")) {
		return null;
	}
	var pid = ele.data("m").parentId;
	var type = ele.data("type");
	if (pid == "r_" + type + "_-1") {
		return ele;
	} else {
		if (level < 1) {
			return null;
		}
		var el = ele.paper.getById(pid);
		return getMyRoot(el, level - 1);
	}
}