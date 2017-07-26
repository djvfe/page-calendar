var pc;
//主调方法
/**调用示例：var param = {'containerid':'containerid'//页面容器ID *******************必须
 * 			 ,'fromdate':new Date()//有效日期开始  *************必须
 * 			 ,'todate':new Date('2011/2/21')//有效日期结束  *******************必须
 * 			 ,'GMT_milliseconds':19595949559495  *******************必须
 * 			 ,'unit_content':[{'id':单元格对应产品价格的ID,'title':'单元格title属性值','text':'单元格显示内容（除当日日期外）','clickable':单元格是否可点击true/false,'date':'单元格日期yyyyMMdd','price':'价格'},{....},{..},....]//单元格对应内容
 * 			 ,.........
 * 			}
 * 			var handler = {'F20110101':function(){}}
 * 			showCalendar(param,content,handler);
 * param	日历类相关初始化数据，包含单元格数据
 * handler	日历框单元格点击事件(json对象)
 * @author dengjun
 * 2010.11.01
 * */
function showCalendar(param,handler) {
	pc = new PageCalendar(param,handler);
	pc.show();
}
//Date类增加比较大小的函数
//返回-1 this<参数日期
//返回0	this==参数日期
//返回1 this>参数日期
Date.prototype.compare = function(year,month,day) {
	if(this.getFullYear()<year) {
		return -1;
	} else if(this.getFullYear()>year) {
		return 1;
	} else {
		if(this.getMonth()<month) {
			return -1;
		} else if(this.getMonth()>month) {
			return 1;
		} else {
			return this.getDate()==day?0:(this.getDate()<day?-1:1);
		}
	}
}
Date.prototype.compare2 = function(pdate) {
	return this.compare(pdate.getFullYear(),pdate.getMonth(),pdate.getDate());
}
Date.prototype.format =function(format) {
	var o = {
	"M+" : this.getMonth()+1, //month
	"d+" : this.getDate(), //day
	"h+" : this.getHours(), //hour
	"m+" : this.getMinutes(), //minute
	"s+" : this.getSeconds(), //second
	"q+" : Math.floor((this.getMonth()+3)/3), //quarter
	"S" : this.getMilliseconds() //millisecond
	}
	if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
	(this.getFullYear()+"").substr(4- RegExp.$1.length));
	for(var k in o)if(new RegExp("("+ k +")").test(format))
	format = format.replace(RegExp.$1,
	RegExp.$1.length==1? o[k] :
	("00"+ o[k]).substr((""+ o[k]).length));
	return format;
}
/**
 * 页面日历类
 * @param param
 * @return
 * @author dengjun
 * 2010.08.18
 */
function PageCalendar(param,handler) {
	this.param = param;
	this.handler = handler;
	var fromdateparam = param['fromdate'];
	this.GMT_milliseconds = param['GMT_milliseconds'];
	this.nowtime = this.GMT_millisecond?new Date(this.GMT_milliseconds):new Date();
	this.fromdate = fromdateparam&&!isNaN(fromdateparam)&&this.nowtime.compare2(fromdateparam)!=1?fromdateparam:this.nowtime;//有效日期开始
	this.todate = param['todate']&&!isNaN(param['todate'])&&this.nowtime.compare2(param['todate'])!=1?param['todate']:this.nowtime;//有效日期结束
	this.fromyear = this.fromdate.getFullYear();
	this.frommonth = this.fromdate.getMonth();
	this.fromday = this.fromdate.getDate();
	this.toyear = this.todate.getFullYear();
	this.tomonth = this.todate.getMonth();
	this.today = this.todate.getDate();
	this.year = this.fromyear;//当前视图显示年份
	this.month = this.frommonth;//当前视图显示月份
	this.day = this.fromday;
	this.panel = document.getElementById(param['containerid']);//页面容器
	this.lang = 0; // 0(中文) | 1(英文)
	this.date = new Date(this.year+'/'+(this.month==11?1:this.month+1)+'/'+this.day);
}
PageCalendar.property = { 
		"year" : ["年", "/"], 
		"months" : [["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"], 
		["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]], 
		"weeks" : [["周日","周一","周二","周三","周四","周五","周六"], 
		["SUN","MON","TUR","WED","THU","FRI","SAT"]],
		"lastmonth":["上月","Last month"],
		"nextmonth":["下月","Next month"]
}
//数据初始化
PageCalendar.prototype.init = function () {
	calendar = this;
}
//根据年、月得到月视图数据(数组形式)
PageCalendar.prototype.getMonthViewArray = function (year, month) { 
	var mvArray = [];
	var dayOfFirstDay = new Date(year, month, 1).getDay(); //本月第一天是星期几
	var daysOfMonth = new Date(year, month + 1, 0).getDate(); //本月天数
	var daysOfLastMonth = new Date(month==0?year-1:year, month==0?12:month, 0).getDate();//上个月天数
	for (var i = 0; i < 42; i++) { 
		mvArray[i] = []; 
	}
	for (var i = 0; i < daysOfMonth; i++) { //当前视图中当月的日期的单元格
		mvArray[i + dayOfFirstDay][0] = year; //年份
		mvArray[i + dayOfFirstDay][1] = month; //月份
		mvArray[i + dayOfFirstDay][2] = i + 1; //天
		//mvArray[i + dayOfFirstDay][3] = (i + dayOfFirstDay)%7;//星期
	}
	for (var i = dayOfFirstDay-1; i>=0;i--) {//当前视图中上月的日期的单元格
		mvArray[i][0] = month==0?year-1:year;
		mvArray[i][1] = month==0?11:month-1;
		mvArray[i][2] = daysOfLastMonth-dayOfFirstDay+1+i;
		//mvArray[i][3] = i%7;;
	}
	for (var i = dayOfFirstDay;i<42-daysOfMonth;i++) {//当前视图中下月的日期的单元格
		mvArray[i + daysOfMonth][0] = month==11?year+1:year;
		mvArray[i + daysOfMonth][1] = month==11?0:month+1;
		mvArray[i + daysOfMonth][2] = i-dayOfFirstDay+1;
		//mvArray[i + daysOfMonth][3] = (i + daysOfMonth)%7;
	}
	return mvArray; 
}

PageCalendar.prototype.getUnitContent =function(date) {
	var all = this.param['unit_content'];
	all = all||[];
	for(i in all) {
		if(all[i] && all[i]['date'] && date==all[i]['date']) {
			return all[i];
		}
	}
	return null;
}
//视图绘制
PageCalendar.prototype.draw = function () {
	calendar = this;
	var mvAry = []; 
	mvAry[mvAry.length] = '<div class="calendar_innercontainer">';
	mvAry[mvAry.length] = '<table id="calendar_table" border="0" cellspacing="0" cellpadding="0">';
		mvAry[mvAry.length] = '<tr>';
		mvAry[mvAry.length] = '<td>';
			mvAry[mvAry.length] = '<table id="calendar_left_table" border="0" cellspacing="0" cellpadding="0">';
				mvAry[mvAry.length] = '<th class="calendar_left_th">';
				mvAry[mvAry.length] = '</th>';
				mvAry[mvAry.length] = '<tr><td class="calendar_lastmonth" id="calendar_lastmonth" title="'
						+ PageCalendar.property["lastmonth"][this.lang]+'">';
				mvAry[mvAry.length] = '</td></tr>';
				mvAry[mvAry.length] = '<tr><td class="calendar_viewdate">';
				mvAry[mvAry.length] = '</td></tr>';
				mvAry[mvAry.length] = '<tr><td class="calendar_nextmonth" id="calendar_nextmonth" title="'
						+ PageCalendar.property["nextmonth"][this.lang]+'">';
				mvAry[mvAry.length] = '</td></tr>';
			mvAry[mvAry.length] = '</table>';
		mvAry[mvAry.length] = '</td>';
		mvAry[mvAry.length] = '<td>';
		mvAry[mvAry.length] = '<table id="calendar_right_table" border="0" cellspacing="0" cellpadding="0"  class="calendar_right_table">';
		mvAry[mvAry.length] = '<tr>'; 
		for(var i = 0; i < 7; i++) { 
			mvAry[mvAry.length] = ' <th>' + PageCalendar.property["weeks"][this.lang][i] + '</th>'; 
		}
		mvAry[mvAry.length] = '</tr>'; 
		for(var i = 0; i < 6;i++) { 
		mvAry[mvAry.length] = ' <tr align="center">'; 
		for(var j = 0; j < 7; j++) {
			switch(j) {
				case 0://周日
					mvAry[mvAry.length] = ' <td class="calendar_sun_td" valign=top></td>';break;
				case 6://周六
					mvAry[mvAry.length] = ' <td class="calendar_sat_td" valign=top></td>'; break;
				default://工作日
					mvAry[mvAry.length] = ' <td class="calendar_workday_td" valign=top></td>'; break;
			}
		}
		mvAry[mvAry.length] = ' </tr>'; 
	}
	mvAry[mvAry.length] = '</table>';
	mvAry[mvAry.length] = '</td>';
	mvAry[mvAry.length] = '</tr>';
	mvAry[mvAry.length] = '</table>';
	mvAry[mvAry.length] = '</div>';
	calendar.panel.innerHTML = mvAry.join(""); 
	
	var obj = document.getElementById("calendar_lastmonth"); 
	obj.onclick = function () {//点击显示上月
		if(calendar.handler.lastmonth) {
			calendar.handler.lastmonth();
		}
		calendar.lastMonth(calendar.year,calendar.month);
	} 
	obj = document.getElementById("calendar_nextmonth"); 
	obj.onclick = function () {//点击显示下月
		if(calendar.handler.nextmonth) {
			calendar.handler.nextmonth();
		}
		calendar.nextMonth(calendar.year,calendar.month);
	}
}
//显示日历框
PageCalendar.prototype.show = function (popControl) { 
	this.draw();
	this.bindData(this.year, this.month,this.day);
}
//显示上个月视图
PageCalendar.prototype.lastMonth = function (year,month) { 
	year = month==0?year-1:year;
	month = month==0?11:month-1;
	this.bindData(year, month,new Date(year, month+1, 0).getDate());
}
//显示下个月视图
PageCalendar.prototype.nextMonth = function (year,month) {
	year = month==11?year+1:year;
	month = month==11?0:month+1;
	this.bindData(year, month,1);
}
//绑定数据到月视图
PageCalendar.prototype.bindData = function (year,month,day) { 
	if(this.fromdate.compare(year,month,day)==1 || this.todate.compare(year,month,day)==-1) {
		return;
	}
	this.year = year;
	this.month = month;
	this.date = new Date(this.year+'/'+(this.month==11?1:this.month+1)+'/'+this.day);
	var lefttds = document.getElementById("calendar_left_table").getElementsByTagName("td"); 
	lefttds[0].innerHTML = "▲";
	lefttds[1].innerHTML = year+PageCalendar.property["year"][this.lang]
	                       +PageCalendar.property["months"][this.lang][month];
	lefttds[2].innerHTML = "▼";
	/*上月下月的按钮样式和可用性等的处理start*/
	var tempyear = month==0?year-1:year;
	var tempmonth = month==0?11:month-1;
	var tempday = (new Date(tempyear,tempmonth+1,0)).getDate();
	if(this.fromdate.compare(tempyear,tempmonth,tempday)==1 
		|| this.todate.compare(tempyear,tempmonth,tempday)==-1) {
		lefttds[0].className = 'calendar_lastmonth_disabled';
	} else lefttds[0].className = 'calendar_lastmonth';
	tempyear = month==11?year+1:year;
	tempmonth = month==11?0:month+1;
	tempday = 1;
	if(this.fromdate.compare(tempyear,tempmonth,tempday)==1 
		|| this.todate.compare(tempyear,tempmonth,tempday)==-1) {
		lefttds[2].className = 'calendar_nextmonth_disabled';
	} else lefttds[2].className = 'calendar_nextmonth';
	/*上月下月的按钮样式和可用性等的处理end*/
	var dateArray = this.getMonthViewArray(year,month); 
	var tds = document.getElementById("calendar_right_table").getElementsByTagName("td"); 
	for(var i = 0; i < tds.length; i++) { //当月表格数据
		if (i > dateArray.length - 1) break; 
		tds[i].id = dateArray[i][0]+'-'+dateArray[i][1]+'-'+dateArray[i][2];//yyyy-MM-dd格式数据，标志该单元格代表的日期
		tds[i].innerHTML = dateArray[i][2]; 
		/*日期单元格的按钮样式和可用性等的处理start*/
		if(this.fromdate.compare(dateArray[i][0],dateArray[i][1],dateArray[i][2])==1
			||this.todate.compare(dateArray[i][0],dateArray[i][1],dateArray[i][2])==-1) {
			//表示该单元格日期不在可操作日期范围内，修改其样式
			switch(i%7) {
				case 0:tds[i].className='calendar_sun_td_disabled'; break;
				case 6:tds[i].className='calendar_sat_td_disabled'; break;
				default:tds[i].className='calendar_workday_td_disabled'; break;
			}
			tds[i].onclick = function () {return;} 
			tds[i].onmouseover = function () {return;} 
			tds[i].onmouseout = function () {return;} 
		} else {
			var temp = dateArray[i][0]+''+(dateArray[i][1]<9?('0'+(dateArray[i][1]+1)):(dateArray[i][1]+1))
			           +''+(dateArray[i][2]<10?('0'+dateArray[i][2]):dateArray[i][2]);

			//var unit_content = this.param['D'+temp];//单元格传入内容
			var unit_content = this.getUnitContent(temp);//单元格传入内容
			switch(i%7) {
				case 0:tds[i].className=unit_content?'calendar_sun_td':'calendar_sun_td_disabled'; break;
				case 6:tds[i].className=unit_content?'calendar_sat_td':'calendar_sat_td_disabled'; break;
				default:tds[i].className=unit_content?'calendar_workday_td':'calendar_workday_td_disabled'; break;
			}
			unit_content = unit_content||{};
			var unit_title = unit_content['title'] || '';//单元格title属性值
			var unit_text = unit_content['text'] || '';//单元格文本内容
			var unit_clickable = unit_content['clickable'] || false;//单元格是否可点击
			var unit_price = unit_content['price'];//单元格对应产品起价
			var unit_price_text = unit_price ? '<font class="price">￥'+unit_price+'起</font>' : '';
			tds[i].innerHTML = dateArray[i][2]+'<br/>'+unit_text+unit_price_text;
			if(this.handler && unit_clickable) {
				tds[i].onclick = eval('this.handler.F'+temp);
				tds[i].title = unit_title;
			} else {
				tds[i].style.cursor = 'block';//没有出发日期价格的日期单元格不显示可以点击的手形图标
			}
			
 			tds[i].onmouseover = function () {return;} 
			tds[i].onmouseout = function () {return;} 
		}
	}
}