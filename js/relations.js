/**
 * linux kernel 构架图绘制功能库
 * 关系图
 * 
 */
var viewBoxWidth = svgViewBoxWidth;
var viewBoxHeight = svgViewBoxHeight;
function relationM(id,name,type) {
	this.id = id;
	this.name = name;
	this.type=type;
	
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.arrows = []; //id array of arrows 
	this.attr = {
		fill: recFills[this.type % recFills.length],
		fill_opacity: 0.5,
		stroke: strokes[this.type % recFills.length],
		stroke_width: 2 / Math.pow(zoomRate, this.type),
		font_size: 18 / Math.pow(zoomRate, this.type),
		font_weight: 'bolder'
	};
}
relationM.prototype.setSize = function(x, y, width, height) {
	this.x = per2px(x, viewBoxWidth);
	this.y = per2px(y, viewBoxHeight);
	this.width = per2px(width, viewBoxWidth);
	this.height = per2px(height, viewBoxHeight);
};
function drawRelationM(paper,relationM){
	var re = paper.rect(relationM.x, relationM.y, relationM.width, relationM.height, 5 / Math.pow(zoomRate, relationM.type));
	re.id = "r_" + relationM.id;
	re.attr({
		title:relationM.name,
		fill: relationM.attr.fill, 
		"fill-opacity": relationM.attr.fill_opacity, 
		stroke: relationM.attr.stroke, 
		"stroke-width": relationM.attr.stroke_width});
	var txt = paper.text(relationM.x + relationM.width / 2, relationM.y + 15, justifyNameLength(relationM.name,17));	
	txt.id = "t_" + relationM.id;
	txt.attr({
		"font-size": relationM.attr.font_size, 
		"font-weight": relationM.attr.font_weight,
		"cursor": "help",
		"title":relationM.name});
	return {r: re, t: txt};
}
function showRelationDialog(obj){
		var container = $("#center");
		var width = container.width();
		var height = container.height();
		viewBoxWidth = width;
		viewBoxHeight = height;
		if(viewBoxWidth<(9*200+8*paddingWidth)){
			viewBoxWidth = 9*200+8*paddingWidth;
		}
		var sourceName= obj.data("longName");
		var rePaper = Raphael("relationPaper");
		var sd = $("#relationPaper svg")[0];
		sd.setAttributeNS (null, "width", width-50);
		sd.setAttributeNS (null, "height", height-50);
		sd.setAttribute('viewBox', "0 0 " + viewBoxWidth + " " + viewBoxHeight);
		$( "#selectRelationDig" ).dialog({
			resizable: false,
			draggable: true,
			title: sourceName+"  Relations",
			hide:"slide",
			width: width,
			height: height,
			modal: true,
			beforeClose: function( event, ui ) {
				rePaper.clear();
			},
			open: function( event, ui ) {
				getData(rePaper,obj);
			}
		});
}
var vitualMap ={};
var configMap ={};
var fileMap ={};
var functionMap ={};
var relations=null ;
var currentFromX = 0;
var currentToX =0;
function getData(paper,source){//source为点击的元素
	var url = "relationsData.json";
	//初始化
	vitualMap ={};
	configMap ={};
	fileMap ={};
	functionMap ={};
	relations=null ;
	$.getJSON(url, { "time": (new Date()).getTime()}, function(data) {
		if(data.relations){
			relations = data.relations;
		}
		if(data.modules){
			getModulesMap(data.modules);
		}
		buildPaper(paper,source);
	});	
}
function getModulesMap(modules){
	for(var i=0;i<modules.length;i++){
		var module = modules[i];
		if(module.type==types[0]){
			vitualMap[module.id] = module;
		}else if(module.type==types[1]){
			configMap[module.id] = module;
		}else if(module.type==types[2]){
			fileMap[module.id] = module;
		}else if(module.type==types[3]){
			functionMap[module.id] = module;
		}
	}
}

function buildPaper(paper,source){
	var sd = $("#relationPaper svg")[0];
	var container = $("#center");
	//将source放在paper的中心位置
	var center = new relationM(source.id,source.data("longName"),0);
	var viewBox = sd.getAttribute("viewBox");
	var viewBoxValues = viewBox.split(' ');
	var centerX = viewBoxValues[2]/2-90;
	var centerY = viewBoxValues[3]/2-paddingHeight/2;
	var width = 200;
	var height = paddingHeight;
	currentFromX = centerX -width-paddingWidth;
	currentToX =centerX + width+paddingWidth;
	
	center.setSize(centerX,centerY,width,height);
	drawRelationM(paper,center);
	drawColumn(paper,vitualMap,width,height);
	drawColumn(paper,configMap,width,height);
	drawColumn(paper,fileMap,width,height);
	drawColumn(paper,functionMap,width,height);
}
function drawColumn(paper,map,width,height){
	var currentFromY = paddingHeight;
	var currentToY = paddingHeight;
	var fromXchange = false;//x轴需要移动
	var toXchange = false;
	if(map){
		for(id in map){
			var belong = isFromOrTo(id);
			if(belong == 1){
				fromXchange = true;
				var m = map[id];
				var mod = new relationM(m.id,m.name,m.type);
				mod.setSize(currentFromX,currentFromY,width,height);
				drawRelationM(paper,mod);
				currentFromY = currentFromY + height + paddingHeight;
			}else if(belong ==2){
				toXchange = true;
				var m = map[id];
				var mod = new relationM(m.id,m.name,m.type);
				mod.setSize(currentToX,currentToY,width,height);
				drawRelationM(paper,mod);
				currentToY = currentToY + height + paddingHeight;
			}
		}
		if(fromXchange){
			currentFromX = currentFromX - width-paddingWidth;
		}
		if(toXchange){
			currentToX = currentToX + width + paddingWidth;
		}
	}
}
function isFromOrTo(id){
	var result =0;//0代表没有找到，1代表是from，2代表是to
	if(relations && relations !=null){
		for(var i=0;i<relations.length;i++){
			var relation = relations[i];
			if(id==relation.from){
				result =  1;
				break;
			}else if(id==relation.to){
				result =  2;
				break;
			}
		}
	}
	return result;
}
