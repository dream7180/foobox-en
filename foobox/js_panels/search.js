//by Asion, mod for foobox http://blog.sina.com.cn/dream7180
ppt = {
	source: window.GetProperty("Search Source", 1),
	autosearch: window.GetProperty("Search Box: Auto-validation", false),
	scope: window.GetProperty("Search Box: Scope", 0),
	multiple: window.GetProperty("Search Box: Keep Playlist", true),
	historymaxitems: 10,//window.GetProperty("Search Box: Max Of Search History", 10),
	historytext: window.GetProperty("Search Box: Search History", ""),
	showreset: window.GetProperty("Search Box: Always Show Reset Button", false),
	webnb: window.GetProperty("Search Source: Web: Number", 1),//1-QQ,2-kg
	weblistarrname: window.GetProperty("_PROPERTY: Search Source: Web: List Arr Name", "").split(";"),
	weblistarr1: window.GetProperty("_PROPERTY: Search Source: Web: List Arr 1", "").split(";"),
	weblistarr2: window.GetProperty("_PROPERTY: Search Source: Web: List Arr 2", "").split(";"),
	webkgranklistarr: window.GetProperty("_PROPERTY: Search Source: KG Rank List: List Arr", "").split(";"),
	webradiolistarr: window.GetProperty("_PROPERTY: Search Source: Web Radio: List Arr", "").split("|"),
	webradiolistarr2: window.GetProperty("_PROPERTY: Search Source: Web Radio: List Arr 2", "").split(";"),
	quality: window.GetProperty("Search Source: Quality", 4),
	pagesize: window.GetProperty("Search Results Per Page", 50)
};

//=================================================// 定义变量
var fso = new ActiveXObject("Scripting.FileSystemObject");
if (!fso.FolderExists(fb.ProfilePath + "cache")) fso.CreateFolder(fb.ProfilePath + "cache");
//var xmlDoc = new ActiveXObject("MSXML.DOMDocument");
var xmlHttp = new ActiveXObject("Msxml2.XMLHTTP.6.0"),
//xmlHttp2 = new ActiveXObject("Microsoft.XMLHTTP");
xmlHttp2 = new ActiveXObject("Msxml2.XMLHTTP.6.0");
var debug = false;
var oldsearch = oldpid = 0;
var SearchListName, cachefile;
//=================================================// 搜索框
var g_searchbox = null;
searchbox = function() {
	var temp_bmp = gdi.CreateImage(1, 1);
	var temp_gr = temp_bmp.GetGraphics();
	var g_timer_cursor = false;
	var g_cursor_state = true;
	clipboard = {
		text: null
	};
	this.images = {
		resetIcon_off: null,
		resetIcon_ov: null,
		loupe_off: null,
		loupe_ov: null
	}

	this.repaint = function() {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}
	
	this.getTooltip = function(){
		switch (ppt.source){
			case 1:
				return "列表";
				break;
			case 2:
				return "媒体库";
				break;
			case 3:
				return "网络";
				break;
		}
	}

	this.getImages = function() {
		var gb;
		var x2 = 2 * zdpi, x4 = 4 * zdpi, x5 = 5 * zdpi, x11 = 11 * zdpi, x12 = 12 * zdpi, 
			x14 = Math.ceil(14 * zdpi), x17 = 17 * zdpi, x18 = Math.ceil(18 * zdpi);
		// 搜索图标
		//var hov_color = g_color_bt;
		var on_colour = RGB(220,220,220);//g_color_bt & 0xccffffff;
		var reset_off_color = RGB(220,220,220);//g_color_bt & 0xccffffff;

		this.images.resetIcon_off = gdi.CreateImage(x18, x18);
		gb = this.images.resetIcon_off.GetGraphics();
		gb.setSmoothingMode(2);
		gb.FillEllipse(0, 0, x17, x17, RGBA(0, 0, 0, 30));
		gb.DrawLine(x5, x5, x12, x12, 2.0, reset_off_color);
		gb.DrawLine(x5, x12, x12, x5, 2.0, reset_off_color);
		gb.setSmoothingMode(0);
		this.images.resetIcon_off.ReleaseGraphics(gb);

		this.images.resetIcon_ov = gdi.CreateImage(x18, x18);
		gb = this.images.resetIcon_ov.GetGraphics();
		gb.setSmoothingMode(2);
		gb.FillEllipse(0, 0, x17, x17, RGBA(0, 0, 0, 50));
		gb.DrawLine(x5, x5, x12, x12, 2.0, on_colour);
		gb.DrawLine(x5, x12, x12, x5, 2.0, on_colour);
		gb.setSmoothingMode(0);
		this.images.resetIcon_ov.ReleaseGraphics(gb);

		if (typeof(this.reset_bt) == "undefined") {
			this.reset_bt = new button(this.images.resetIcon_off, this.images.resetIcon_ov, this.images.resetIcon_ov);
		} else {
			this.reset_bt.img[0] = this.images.resetIcon_off;
			this.reset_bt.img[1] = this.images.resetIcon_ov;
			this.reset_bt.img[2] = this.images.resetIcon_ov;
		}
/*
		this.images.loupe_off = gdi.CreateImage(18 * zdpi, 18 * zdpi);
		gb = this.images.loupe_off.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawLine(9 * zdpi, 9 * zdpi, 13 * zdpi, 13 * zdpi, 2, on_colour);
		gb.DrawEllipse(1 * zdpi, 1 * zdpi, 9 * zdpi, 9 * zdpi, 2, on_colour);
		gb.SetSmoothingMode(0);
		this.images.loupe_off.ReleaseGraphics(gb);

		this.images.loupe_ov = gdi.CreateImage(18 * zdpi, 18 * zdpi);
		gb = this.images.loupe_ov.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawLine(9 * zdpi, 9 * zdpi, 13 * zdpi, 13 * zdpi, 2, hov_color);
		gb.DrawEllipse(1 * zdpi, 1 * zdpi, 9 * zdpi, 9 * zdpi, 2, hov_color);
		gb.SetSmoothingMode(0);
		this.images.loupe_ov.ReleaseGraphics(gb);
*/
		this.images.source_switch = gdi.CreateImage(x18, x18);
		gb = this.images.source_switch.GetGraphics();
		this.images.source_switch.ReleaseGraphics(gb);
		
		this.images.source_pl = gdi.CreateImage(x14, x14);
		gb = this.images.source_pl.GetGraphics();
		gb.SetSmoothingMode(0);
		var _x2 = Math.ceil(x2);
		gb.DrawRect(x2, x2, x11, x11, 1, on_colour);
		gb.DrawLine(x4, x5, x11, x5, 1, on_colour);
		gb.DrawLine(x4,x5+_x2, x11, x5+_x2, 1, on_colour);
		gb.DrawLine(x4, x5+_x2*2, x11, x5+_x2*2, 1, on_colour);
		this.images.source_pl.ReleaseGraphics(gb);
		
		var img_arc = gdi.CreateImage(x14, x14);
		gb = img_arc.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(0, -3*zdpi, x11, x5, 1, on_colour);
		img_arc.ReleaseGraphics(gb);
		
		this.images.source_lib = gdi.CreateImage(x14, x14);
		gb = this.images.source_lib.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(0, x2, x11, x5, 1, on_colour);
		gb.DrawImage(img_arc, 0, 8*zdpi, x14, zoom(8,zdpi), 0, 0, x14, zoom(8,zdpi), 0, 255);
		gb.DrawImage(img_arc, 0, x11, x14, zoom(8,zdpi), 0, 0, x14, zoom(8,zdpi), 0, 255);
		gb.DrawLine(0, x4, 0, x11, 1, on_colour);
		gb.DrawLine(x11, x4, x11, x11, 1, on_colour);
		this.images.source_lib.ReleaseGraphics(gb);
		
		this.images.source_net = gdi.CreateImage(x14, x14);
		gb = this.images.source_net.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillEllipse(0, 10*zdpi, 3*zdpi, 3*zdpi,on_colour);
		gb.DrawEllipse(-8*zdpi, 6*zdpi, 15*zdpi, 15*zdpi, 1, on_colour);
		gb.DrawEllipse(-13*zdpi, x2, 24*zdpi, 24*zdpi, 1, on_colour);
		gb.SetSmoothingMode(0);
		this.images.source_net.ReleaseGraphics(gb);

		//this.loupe_bt = new button(this.images.loupe_off, this.images.loupe_ov, this.images.loupe_ov);
		this.src_switch = new button(this.images.source_switch, this.images.source_switch, this.images.source_switch, this.getTooltip());
	}
	this.getImages();

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w; //(w > 150) ? w : 150;
		this.h = h; //(h > 22) ? h : 22;
		this.on_init();
	};

	this.on_init = function() {
		this.inputbox = new oInputbox(this.w - 45 * zdpi, this.h - 3, "", "", g_color_normal_txt, g_color_normal_bg, 0, g_color_selected_txt, g_sendResponse, "g_searchbox");
		this.inputbox.autovalidation = (ppt.source == 3) ? false : ppt.autosearch;
	}

	this.reset_colors = function() {
		this.inputbox.backcolor = g_color_normal_bg;
		this.inputbox.textcolor = g_color_normal_txt;
		this.inputbox.backselectioncolor = g_color_selected_txt;
	};

	this.draw = function(gr) {
		// 绘制搜索框背景
		gr.SetSmoothingMode(2);
		gr.FillRoundRect(this.x, this.y, this.w, this.h, 6, 6, g_color_normal_bg);
		gr.DrawRoundRect(this.x, this.y, this.w, this.h, 6, 6, 1, RGBA(0, 0, 0, 30));
		gr.DrawRoundRect(this.x + 1, this.y + 1, this.w - 2, this.h - 2, 5, 5, 1, RGBA(0, 0, 0, 15));
		gr.DrawRoundRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4, 4, 4, 1, RGBA(0, 0, 0, 7));
		gr.SetSmoothingMode(0);

		if (this.inputbox.edit) {
			//gr.SetSmoothingMode(2);
			//gr.DrawRoundRect(this.x + 1, this.y + 1, this.w - 2, this.h, 11.5, 11.5, 2.0, RGB(130,140,240));
			//gr.SetSmoothingMode(0);
		}
		var g_z14 = Math.ceil(14 * zdpi);
		//this.loupe_bt.draw(gr, this.x + 5, this.y + 4 * zdpi, 255);
		//this.src_switch.draw(gr, this.x + 23 * zdpi, this.y + 4, 255);
		this.src_switch.draw(gr, this.x + 5, this.y + 3 * zdpi, 255);
		this.inputbox.draw(gr, this.x + g_z14 + 10, this.y + 2, 0, 0);
		var src_img = ((ppt.source == 1) ? this.images.source_pl : (ppt.source == 2) ? this.images.source_lib : this.images.source_net);
		gr.DrawImage(src_img, this.x + 5, this.y + 3 * zdpi + 1, g_z14, g_z14, 0, 0, g_z14, g_z14, 0, 255);
		if ((this.inputbox.text.length > 0 || ppt.showreset) && this.inputbox.edit) this.reset_bt.draw(gr, this.x + this.inputbox.w + 22 * zdpi, this.y + 3 * zdpi, 255);
	}

	this.historylist = Array();

	this.searchExist = function(search_item) {
		for (var i = 0; i < this.historylist.length; i++) {
			if (this.historylist[i][0] == search_item) return true;
		}
		return false;
	};

	this.historyadd = function(search_item, datetime) {
		if (!this.searchExist(search_item)) {
			var currentdate = new Date();
			datetime = typeof datetime !== 'undefined' ? datetime : currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
			this.historylist[this.historylist.length] = Array(search_item, datetime);
			if (this.historylist.length > ppt.historymaxitems) this.historylist.shift();
			return true;
		}
		return false;
	};

	this.historyreset = function() {
		this.historylist = Array();
		window.SetProperty("Search Box: Search History", "")
	}

	this.save_searchhistory = function(argSearchHistory) {
		var SearchHistory = "";
		if (argSearchHistory.length > 0) {
			try {
				for (var i = 0; i < argSearchHistory.length; i++) {
					if (i > 0) SearchHistory += " $$ ";
					SearchHistory += argSearchHistory[i][0] + " ## " + argSearchHistory[i][1];
					if (i == ppt.historymaxitems) break;
				}
				window.SetProperty("Search Box: Search History", SearchHistory)
			} catch (e) {}
		}
	}

	this.get_searchhistory = function() {
		if (ppt.historytext.length > 0) {
			historytext = ppt.historytext.split(" $$ ");
			try {
				for (var i = 0; i < historytext.length; i++) {
					arguments = historytext[i].split(" ## ");
					this.historyadd(arguments[0], arguments[1]);
				}
			} catch (e) {}
		}
		return this.historylist;
	}

	this.historylist = this.get_searchhistory();

	//this.trace = function(genre) {
	//	for (var i = 0; i < this.historylist.length; i++) {
	//		fb.trace(this.historylist[i][0])
	//	}
	//};

	this.on_mouse = function(event, x, y, delta) {
		switch (event) {
		case "lbtn_down":
			//this.loupe_bt.checkstate("down", x, y);
			this.src_switch.checkstate("down", x, y);
			this.inputbox.check("down", x, y);
			if (this.inputbox.text.length > 0 || ppt.showreset) this.reset_bt.checkstate("down", x, y);
			break;
		case "lbtn_up":
			//if (this.loupe_bt.checkstate("up", x, y) == ButtonStates.hover) {
			//	Show_Menu_Searchbox(x, y);
			//}
			if (this.src_switch.checkstate("up", x, y) == ButtonStates.hover) {
				ppt.source = ppt.source + 1;
				if (ppt.source > 3) ppt.source = 1;
				window.SetProperty("Search Source", ppt.source);
				if(ppt.source == 3){
					this.inputbox.autovalidation = false;
				} else{
					this.inputbox.autovalidation = ppt.autosearch;
				}
				this.inputbox.empty_text = "";
				this.src_switch.changeTooltip(this.getTooltip());
				
				this.repaint();
			}
			this.inputbox.check("up", x, y);
			if (this.inputbox.text.length > 0 || ppt.showreset) {
				if (this.reset_bt.checkstate("up", x, y) == ButtonStates.hover) {
					this.inputbox.text = "";
					this.inputbox.offset = 0;
					g_sendResponse();
					this.repaint();
				}
			}
			break;
		case "lbtn_dblclk":
			this.inputbox.check("dblclk", x, y);
			break;
		case "rbtn_down":
			if (this.src_switch.checkstate("up", x, y) == ButtonStates.hover) {
				Show_Menu_Searchbox(x, y);
			}
			this.inputbox.check("right", x, y);
			break;
		case "move":
			//var bt_state_1 = this.loupe_bt.checkstate("move", x, y);
			var bt_state_2 = this.src_switch.checkstate("move", x, y);
			this.inputbox.check("move", x, y);
			if (this.inputbox.text.length > 0 || ppt.showreset) var bt_state_3 = this.reset_bt.checkstate("move", x, y);
			return (this.inputbox.hover/* || bt_state_1 == ButtonStates.hover*/ || bt_state_2 == ButtonStates.hover || bt_state_3 == ButtonStates.hover);
			break;
		case "leave":
			//this.loupe_bt.checkstate("leave", 0, 0);
			this.src_switch.checkstate("leave", 0, 0);
			this.inputbox.check("leave", 0, 0);
			this.reset_bt.checkstate("leave", 0, 0);
		}
	}

	this.on_key = function(event, vkey) {
		switch (event) {
		case "down":
			this.inputbox.on_key_down(vkey);
			break;
		}
	}

	this.on_char = function(code) {
		this.inputbox.on_char(code);
	}

	this.on_focus = function(is_focused) {
		this.inputbox.on_focus(is_focused);
	}
}

function g_sendResponse() {
	var s1 = g_searchbox.inputbox.text;
	var s2 = s1.toLowerCase();
	var pl_to_remove = new Array;

	// 空文本直接返回
	if (s2.length <= 0) return true;
	// 保存搜索记录
	g_searchbox.historyadd(s1);
	g_searchbox.save_searchhistory(g_searchbox.historylist);

	if (ppt.source == 1) {

		var handle_list = plman.GetPlaylistItems(plman.ActivePlaylist);
		var count = handle_list.Count;
		var pid = -1;
		var tf_artist = fb.TitleFormat("%artist%");
		var tf_album = fb.TitleFormat("%album%");
		var tf_title = fb.TitleFormat("%title%");
		var tf_genre = fb.TitleFormat("%genre%");
		var tf_date = fb.TitleFormat("%date%");
		var tf_comment = fb.TitleFormat("%comment%");
		var start = 0;

		if (oldsearch == s2) {
			start = oldpid;
		} else {
			oldsearch = s2;
			oldpid = 0;
		}

		for (var i = start; i < count; i++) {
			if ((ppt.scope == 0 || ppt.scope == 1) && tf_artist.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppt.scope == 0 || ppt.scope == 2) && tf_title.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppt.scope == 0 || ppt.scope == 3) && tf_album.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppt.scope == 0 || ppt.scope == 4) && tf_genre.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppt.scope == 0 || ppt.scope == 5) && tf_date.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppt.scope == 0 || ppt.scope == 6) && tf_comment.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if (i == count - 1) {
				oldpid = 0;
			}
		}

		// 找到后选定项目
		if (pid >= 0) {
			var focusedTrackId = pid;
			plman.ClearPlaylistSelection(plman.ActivePlaylist);
			plman.SetPlaylistSelectionSingle(plman.ActivePlaylist, focusedTrackId, true);
			plman.SetPlaylistFocusItem(plman.ActivePlaylist, focusedTrackId);
		};

		handle_list.Dispose();
	} else if (ppt.source == 3) {
		if (oldsearch != s1) {
			oldsearch = s1;
		}
		NetSearch(s2, 1);
	} else if (ppt.source == 2) {
		// 搜索列表索引
		var isFound = false;
		var total = plman.PlaylistCount;
		for (var i = 0; i < total; i++) {
			if (plman.GetPlaylistName(i).substr(0, 4) == "搜索 [") {
				if (!ppt.multiple) {
					if (!isFound) {
						var plIndex = i;
						isFound = true;
					};
					pl_to_remove.push(i);
				}
			}
		}

		if (isFound && !ppt.multiple) {
			var r = pl_to_remove.length - 1;
			while (r >= 0) {
				plman.RemovePlaylist(pl_to_remove[r]);
				r--;
			}
			plIndex = plman.PlaylistCount;
		} else {
			plIndex = total;
		}

		var scopecases = {
			0: "",
			1: "%artist% HAS ",
			2: "%album% HAS ",
			3: "%title% HAS ",
			4: "%genre% HAS ",
			5: "%date% HAS ",
			6: "%comment% HAS "
		};
		if (scopecases[ppt.scope]) {
			fb.CreateAutoPlaylist(plIndex, "搜索 [" + s1 + "]", scopecases[ppt.scope] + s1, "", 0);
		} else {
			fb.CreateAutoPlaylist(plIndex, "搜索 [" + s1 + "]", s1, "", 0);
		};

		// 转换自动列表为普通列表
		plman.DuplicatePlaylist(plIndex, "搜索 [" + s1 + "]");
		plman.RemovePlaylist(plIndex);
		plman.ActivePlaylist = plIndex;
	}
}

//=================================================// 搜索框菜单

function Show_Menu_Searchbox(x, y) {
	var MF_SEPARATOR = 0x00000800;
	var MF_STRING = 0x00000000;
	var MF_GRAYED = 0x00000001;
	var MF_DISABLED = 0x00000002;
	var MF_POPUP = 0x00000010;
	var idx;

	var _menu = window.CreatePopupMenu();
	if (typeof x == "undefined") x = ww;
	if (typeof y == "undefined") y = 30;
	var SearchModeMenu = window.CreatePopupMenu();
	SearchModeMenu.AppendMenuItem(MF_STRING, 21, "列表");
	SearchModeMenu.AppendMenuItem(MF_STRING, 22, "媒体库");
	SearchModeMenu.AppendMenuItem(MF_STRING, 23, "网络");
	SearchModeMenu.CheckMenuRadioItem(21, 23, ppt.source + 20);
	SearchModeMenu.AppendTo(_menu, MF_STRING, "搜索模式");
	var SearchHistoryMenu = window.CreatePopupMenu();

	for (var i = g_searchbox.historylist.length - 1; i >= 0; i--) {
		SearchHistoryMenu.AppendMenuItem(MF_STRING, i + 51, g_searchbox.historylist[i][0].replace("&", "&&"));
	}
	if (g_searchbox.historylist.length == 0) {
		SearchHistoryMenu.AppendMenuItem(MF_GRAYED, 40, "无记录");
	} else {
		SearchHistoryMenu.AppendMenuSeparator();
		SearchHistoryMenu.AppendMenuItem(MF_STRING, ppt.historymaxitems + 60, "清除记录");
	}

	SearchHistoryMenu.AppendTo(_menu, MF_STRING, "搜索记录");

	_menu.AppendMenuSeparator();

	if (ppt.source == 1) {
		_menu.AppendMenuItem(MF_STRING, 1, "启用自动搜索");
		_menu.CheckMenuItem(1, ppt.autosearch ? 1 : 0);
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 2, "搜索:智能");
		_menu.AppendMenuItem(MF_STRING, 3, "搜索:艺术家");
		_menu.AppendMenuItem(MF_STRING, 4, "搜索:专辑");
		_menu.AppendMenuItem(MF_STRING, 5, "搜索:标题");
		_menu.AppendMenuItem(MF_STRING, 6, "搜索:流派");
		_menu.AppendMenuItem(MF_STRING, 7, "搜索:日期");
		_menu.AppendMenuItem(MF_STRING, 8, "搜索:注释");
		_menu.CheckMenuRadioItem(2, 8, ppt.scope + 2);
	} else if (ppt.source == 3) {
		_menu.AppendMenuItem(MF_STRING, 9, "保留之前的搜索列表");
		_menu.CheckMenuItem(9, ppt.multiple ? 1 : 0);
		_menu.AppendMenuSeparator();
		var SearchQualityMenu = window.CreatePopupMenu();
		SearchQualityMenu.AppendMenuItem(MF_STRING, 31, "128K MP3");
		SearchQualityMenu.AppendMenuItem(MF_STRING, 32, "320K MP3");
		SearchQualityMenu.AppendMenuItem(MF_STRING, 33, "无损格式");
		SearchQualityMenu.AppendMenuItem(MF_STRING, 34, "无损格式+320K MP3");
		SearchQualityMenu.AppendMenuItem(MF_STRING, 35, "全部 (高品质格式优先)");
		SearchQualityMenu.CheckMenuRadioItem(31, 35, ppt.quality + 30);
		SearchQualityMenu.AppendTo(_menu, MF_STRING, "搜索格式");

		var WebSearchMenu = window.CreatePopupMenu();
		WebSearchMenu.AppendMenuItem(MF_STRING, 11, "QQ音乐");
		WebSearchMenu.AppendMenuItem(MF_STRING, 12, "酷狗音乐");
		WebSearchMenu.AppendMenuItem(MF_STRING, 13, "酷我音乐");
		WebSearchMenu.CheckMenuRadioItem(11, 13, ppt.webnb + 10);
		WebSearchMenu.AppendTo(_menu, MF_STRING, "搜索来源");
		_menu.AppendMenuSeparator();
		var WebQQRanklistMenu = window.CreatePopupMenu();
		if(ppt.weblistarrname.length > 1){
			if(ppt.weblistarr1.length > 1){
				var WebQQRanklistMenuSub1 = window.CreatePopupMenu();
				for (var k = 0; k < ppt.weblistarr1.length; k++) {
					WebQQRanklistMenuSub1.AppendMenuItem(MF_STRING, 101+k, ppt.weblistarr1[k].split(":")[0]);
				}
				WebQQRanklistMenuSub1.AppendTo(WebQQRanklistMenu, MF_STRING, ppt.weblistarrname[0]);
			}
			if(ppt.weblistarr2.length > 1){
				var WebQQRanklistMenuSub2 = window.CreatePopupMenu();
				for (var k = 0; k < ppt.weblistarr2.length; k++) {
					WebQQRanklistMenuSub2.AppendMenuItem(MF_STRING, 150+k, ppt.weblistarr2[k].split(":")[0]);
				}
				WebQQRanklistMenuSub2.AppendTo(WebQQRanklistMenu, MF_STRING, ppt.weblistarrname[1]);
			}
			WebQQRanklistMenu.AppendMenuSeparator();
		}
		WebQQRanklistMenu.AppendMenuItem(MF_STRING, 100, "更新排行榜菜单");
		WebQQRanklistMenu.AppendTo(_menu, MF_STRING, "QQ音乐排行榜");
		
		var WebKGRanklistMenu = window.CreatePopupMenu();
		if(ppt.webkgranklistarr.length > 1){
			for (var i = 0; i < ppt.webkgranklistarr.length; i++) {
				WebKGRanklistMenu.AppendMenuItem(MF_STRING, 351+i, ppt.webkgranklistarr[i].split(":")[0]);
			}
			WebKGRanklistMenu.AppendMenuSeparator();
		}
		WebKGRanklistMenu.AppendMenuItem(MF_STRING, 350, "更新榜单菜单");
		WebKGRanklistMenu.AppendTo(_menu, MF_STRING, "酷狗音乐榜单");
		_menu.AppendMenuSeparator();
		var WebQQRadioMenu = window.CreatePopupMenu();
		if(ppt.webradiolistarr.length > 1){
			var p = 1;
			for (var i = 0; i < ppt.webradiolistarr.length; i++) {
				var WebRadiolistMenuSub = window.CreatePopupMenu();
				var sub = ppt.webradiolistarr[i].split(";")
				for (var k = 1; k < sub.length; k++) {
					WebRadiolistMenuSub.AppendMenuItem(MF_STRING, 200+p, sub[k].split(":")[0]);
					p+=1;
				}
				WebRadiolistMenuSub.AppendTo(WebQQRadioMenu, MF_STRING, sub[0].split(":")[0]);
			}
			WebQQRadioMenu.AppendMenuSeparator();
		}
		WebQQRadioMenu.AppendMenuItem(MF_STRING, 200, "更新QQ电台菜单");
		WebQQRadioMenu.AppendTo(_menu, MF_STRING, "QQ电台");
		
		
	} else if (ppt.source == 2) {
		var now_playing_track = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
		var quickSearchMenu = window.CreatePopupMenu();
		quickSearchMenu.AppendMenuItem(MF_STRING, 36, "相同艺术家");
		quickSearchMenu.AppendMenuItem(MF_STRING, 37, "相同专辑");
		quickSearchMenu.AppendMenuItem(MF_STRING, 38, "相同流派");
		quickSearchMenu.AppendMenuItem(MF_STRING, 39, "相同日期");
		quickSearchMenu.AppendTo(_menu, MF_STRING, "快速搜索...");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 1, "启用自动搜索");
		_menu.CheckMenuItem(1, ppt.autosearch ? 1 : 0);
		_menu.AppendMenuItem(MF_STRING, 9, "保留之前的搜索列表");
		_menu.CheckMenuItem(9, ppt.multiple ? 1 : 0);
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 2, "搜索:智能");
		_menu.AppendMenuItem(MF_STRING, 3, "搜索:艺术家");
		_menu.AppendMenuItem(MF_STRING, 4, "搜索:专辑");
		_menu.AppendMenuItem(MF_STRING, 5, "搜索:标题");
		_menu.AppendMenuItem(MF_STRING, 6, "搜索:流派");
		_menu.AppendMenuItem(MF_STRING, 7, "搜索:日期");
		_menu.AppendMenuItem(MF_STRING, 8, "搜索:注释");
		_menu.CheckMenuRadioItem(2, 8, ppt.scope + 2);
	}

	idx = _menu.TrackPopupMenu(search_x + 5, search_y + 20*zdpi);
	switch (true) {
	case (idx == 1):
		ppt.autosearch = !ppt.autosearch;
		g_searchbox.inputbox.autovalidation = ppt.autosearch;
		window.SetProperty("Search Box: Auto-validation", ppt.autosearch);
		break;
	case (idx >= 2 && idx <= 8):
		ppt.scope = idx - 2;
		window.SetProperty("Search Box: Scope", ppt.scope);
		break;
	case (idx == 9):
		ppt.multiple = !ppt.multiple;
		window.SetProperty("Search Box: Keep Playlist", ppt.multiple);
		break;
	case (idx >= 11 && idx <= 13):
		window.SetProperty("Search Source: Web: Number", ppt.webnb = idx - 10);
		if (ppt.source == 3) oldsearch = "";
		break;
	case (idx >= 21 && idx <= 23):
		window.SetProperty("Search Source", ppt.source = idx - 20);
		if(ppt.source == 3){
			g_searchbox.inputbox.autovalidation = false;
		} else{
			g_searchbox.inputbox.autovalidation = ppt.autosearch;
		}
		g_searchbox.inputbox.empty_text = "";
		g_searchbox.repaint();
		break;
	case (idx >= 31 && idx <= 35):
		window.SetProperty("Search Source: Quality", ppt.quality = idx - 30);
		break;
	case (idx == 36):
		quickSearch(now_playing_track, "artist");
		break;
	case (idx == 37):
		quickSearch(now_playing_track, "album");
		break;
	case (idx == 38):
		quickSearch(now_playing_track, "genre");
		break;
	case (idx == 39):
		quickSearch(now_playing_track, "date");
		break;
	case (idx >= 51 && idx <= ppt.historymaxitems + 51):
		g_searchbox.inputbox.text = g_searchbox.historylist[idx - 51][0];
		g_searchbox.on_char();
		g_searchbox.repaint();
		break;
	case (idx == ppt.historymaxitems + 60):
		g_searchbox.historyreset();
		break;
	case (idx == 100):
		GetQQRanklist();
		break;
	case ((idx >= 101 && idx <= 101+ppt.weblistarr1.length)):
		QQRanklist(idx, ppt.weblistarr1[idx-101].split(":")[1], ppt.weblistarr1[idx-101].split(":")[0]);
		break;
	case ((idx >= 150 && idx <= 150+ppt.weblistarr1.length)):
		QQRanklist(idx, ppt.weblistarr2[idx-150].split(":")[1], ppt.weblistarr2[idx-150].split(":")[0]);
		break;
	case (idx == 200):
		GetQQRadiolist();
		break;
	case ((idx >= 201 && idx <= 201+p)):
		QQRadiolist(ppt.webradiolistarr2[idx-201].split(":")[1],ppt.webradiolistarr2[idx-201].split(":")[0]);
		break;
	case (idx == 350):
		GetKGRankList();
		break;
	case ((idx >= 351 && idx <= 351+ppt.webkgranklistarr.length)):
		KGRankListid(ppt.webkgranklistarr[idx-351].split(":")[1],ppt.webkgranklistarr[idx-351].split(":")[0]);
		break;
	}
	SearchHistoryMenu.Dispose();
	SearchModeMenu.Dispose();
	_menu.Dispose();
}

//=================================================// 快速搜索

function quickSearch(metadb, search_function) {
	var playlist_index = -1;
	for (i = 0; i < plman.PlaylistCount; i++) {
		if (plman.GetPlaylistName(i) == "搜索结果") {
			playlist_index = i;
			break;
		}
	}
	if (playlist_index < 0) {
		plman.CreatePlaylist(plman.PlaylistCount, "搜索结果");
		playlist_index = plman.PlaylistCount - 1
	}
	plman.ActivePlaylist = playlist_index;
	plman.ClearPlaylist(playlist_index);


	var album_items = str = "";
	var tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");

	switch (search_function) {
	case 'artist':
		str = fb.TitleFormat("%artist%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%artist% IS " + trimstr(str));
		break;
	case 'album':
		str = fb.TitleFormat("%album%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%album% IS " + trimstr(str));
		break;
	case 'genre':
		str = fb.TitleFormat("%genre%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%genre% IS " + trimstr(str));
		break;
	case 'date':
		str = fb.TitleFormat("%date%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%date% IS " + trimstr(str));
		break;
	}
	album_items.OrderByFormat(tfo, 1);
	plman.InsertPlaylistItems(playlist_index, 0, album_items);
}

function trimstr(str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

//=================================================// 网络搜索

function clean_name(n) {
	if (!n) return;
	return n.replace(/[\/\:\*\?\"\<\>\|]/g, '').replace(/^\s+|\s+$/g, "");
}

function NetSearch(searchtext, pageid, switchpage) {
	SearchListName = clean_name(searchtext);
	//cachefile = fb.ProfilePath + "\\cache\\" + cachefileName + ".asx";
	//try {fso.DeleteFile(cachefile);}catch(e) {};
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在搜索网络...");
	//fb.trace(ppt.webnb);
	switch (ppt.webnb) {
		case 1:
			cachefile = fb.ProfilePath + "\\cache\\QQSearch.asx";
			try {fso.DeleteFile(cachefile);}catch(e) {};
			QQSearch(searchtext, pageid, switchpage);
			break;
		case 2:
			cachefile = fb.ProfilePath + "\\cache\\KGSearch.asx";
			try {fso.DeleteFile(cachefile);}catch(e) {};
			KGSearch(searchtext, pageid, switchpage);
			break;
		case 3:
			cachefile = fb.ProfilePath + "\\cache\\KWSearch.asx";
			try {fso.DeleteFile(cachefile);}catch(e) {};
			KWSearch(searchtext, pageid, switchpage);
			break;
		default:
			break;
	}
	Deltempfile(cachefile);
}

function QQSearch(searchtext, pageid, switchpage){
    var searchURL = "http://c.y.qq.com/soso/fcgi-bin/client_search_cp?format=json&t=0&loginUin=0&inCharset=GB2312&outCharset=utf-8&qqmusic_guid=12345&qqmusic_ver=1296&catZhida=0&p=" + pageid + "&n=" + ppt.pagesize + "&searchid=12345&w=" + encodeURIComponent(StringFilter(searchtext)) + "&remoteplace=sizer.newclient.song&new_json=1&lossless=0&aggr=1&cr=1&sem=0&force_zonghe=0&pcachetime=12345";
	//debug && fb.trace(searchURL);
	try {
		var xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var songid = [];
					var ret = json(xmlHttp.responseText)["data"]["song"]["list"];
					//fb.trace("搜索到的数量 > " + ret.length);
					if (ret.length > 0) {
						for (var i = 0; i < ret.length; i++) {
							songid[i] = {
								artist:ret[i].singer[0].name,
								song:ret[i].name,
								mid:ret[i].mid,
								strMediaMid:ret[i]["file"]["strMediaMid"],
								saac:ret[i]["file"]["size_aac"],
								s128:ret[i]["file"]["size_128"],
								s320:ret[i]["file"]["size_320"],
								sflac:ret[i]["file"]["size_flac"],
							}
						}
					}else{UpdateDone("已经是最后一页");return;}
					var filedata = '<asx version="3.0">\r\n\r\n';
					var url = "http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?json=3&guid=foobar2000&g_tk=938407465&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=GB2312&platform=yqq&jsonpCallback=&needNewCode=0";
					try {
						xmlHttp.open("GET",url,false);
						xmlHttp.send();
					} catch (e) {
						return;
					}
					
					if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
						//parse HTML
						var ret = json(xmlHttp.responseText.replace("jsonCallback","").replace(/\;|\(|\)/g, ""))["key"];
						for (var i = 0; i < songid.length; i++) {
							switch(ppt.quality){
								case 1:
									var qt = "M500";
									var ext = ".mp3";
									break;
								case 2:
									var qt = "M800";
									var ext = ".mp3";
									break;
								case 3:
									var qt = "F000";
									var ext = ".flac";
									break;
								case 4:
								default:
									var qt = (songid[i].sflac=="0")?"M800":"F000";
									var ext = (songid[i].sflac=="0")?".mp3":".flac";
									break;
								case 5:
									var qt = (songid[i].sflac=="0")?(songid[i].s320=="0")?"M500":"M800":"F000";
									var ext = (songid[i].sflac=="0")?(songid[i].s320=="0")?".mp3":".mp3":".flac";
									break;
							}
							if((songid[i].s128 != "0" && qt == "M500") || (songid[i].s320 != "0" && qt == "M800") || (songid[i].sflac != "0" && qt == "F000")){
								filedata = filedata + '<entry>\r\n'
								 + '<title>' + songid[i].song + '</title>\r\n'
								 + '<author>' + songid[i].artist + '</author>\r\n'
								 + '<ref href="' + "http://mobileoc.music.tc.qq.com/" + qt + songid[i].strMediaMid + ext + "?vkey=" + ret + "&guid=foobar2000&fromtag=53" + '"/>\r\n'
								 + '</entry>\r\n\r\n';
							 }
						}
					}
					filedata = filedata + "</asx>";
					SaveAs(filedata, cachefile);
					DisposeList("网搜", 4, SearchListName, pageid, switchpage);
					SetBoxText(null);
				}
			}
		}
	} catch(e) {
		fb.trace("搜索失败");
		SetBoxText(null);
	}
}

function KGSearch(searchtext, pageid, switchpage) {
	var content = encodeURIComponent(StringFilter(searchtext)) + '&page=' + pageid + '&pagesize=' + ppt.pagesize;
	var searchURL = 'http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=' + content;
	try {
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var songid = [];
					var ret = json(xmlHttp.responseText)["data"]["info"];
					if (ret.length > 0) {
						for (var i = 0; i < ret.length; i++) {
							switch(ppt.quality){
								case 1:
									var qt = ret[i].hash;
									break;
								case 2:
									var qt = ret[i]["320hash"];
									break;
								case 3:
									var qt = ret[i].sqhash;
									break;
								case 4:
								default:
									var qt = (ret[i].sqhash=="")?ret[i]["320hash"]:ret[i].sqhash;
									break;
								case 5:
									var qt = (ret[i].sqhash=="")?(ret[i]["320hash"]=="")?ret[i].hash:ret[i]["320hash"]:ret[i].sqhash;
									break;
							}
							if (qt == null || qt.length == 0) {
								continue;
							}
							songid.push({
								artist:ret[i].singername,
								song:ret[i].songname,
								hash:qt
							});
						}
					}else{UpdateDone("已经是最后一页");return;}
					var l = 0;
					if(songid.length > 0){
						var filedata = '<asx version="3.0">\r\n\r\n';
						var rex = new RegExp("play_url\":\"(.*?)\",","g");
						var url = "http://www.kugou.com/yy/index.php?r=play/getdata&hash=" + songid[l].hash;
						fb.trace(2,url);
						xmlHttp2.open("GET", url, true);
						xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
						xmlHttp2.send(null);
						xmlHttp2.onreadystatechange = function() {
							if (xmlHttp2.readyState == 4) {
								if (xmlHttp2.status == 200) {
									
									ret = rex.exec(reconvert(xmlHttp2.responseText));
									if(ret != null){
										filedata = filedata + '<entry>\r\n'
										 + '<title>' + songid[l].song + '</title>\r\n'
										 + '<author>' + songid[l].artist + '</author>\r\n'
										 + '<ref href="' + ret[1].replace(/\\/g, "") + '"/>\r\n'
										 + '</entry>\r\n\r\n';
									}
								}
								l++;
								if (l < songid.length){
									var URL_Timer = window.SetTimeout(function () {
										url = "http://www.kugou.com/yy/index.php?r=play/getdata&hash=" + songid[l].hash;
											xmlHttp2.open("GET", url, true);
											xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
											xmlHttp2.send(null);
										URL_Timer && window.ClearTimeout(URL_Timer);
									}, 5);
								}
								
								if (l == songid.length) {
									filedata = filedata + "</asx>";
									SaveAs(filedata, cachefile);
									DisposeList("网搜", 4, SearchListName, pageid, switchpage);
									SetBoxText(null);
								}
							}
						}
					}else{
						SetBoxText(null);
					}
				}
			}
		}
	} catch (e) {
		fb.trace("搜索失败");
		SetBoxText(null);
	}
}

function KWSearch(searchtext, pageid, switchpage){
    var searchURL = "http://player.kuwo.cn/webmusic/getsjplayinfo?flag=6&pn=" + pageid + "&pr=" + ppt.pagesize + "&type=music&key=" + encodeURIComponent(StringFilter(searchtext));
	try {
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var songid = [];
					var filedata = '<asx version="3.0">\r\n\r\n';
					var ret = json(xmlHttp.responseText.replace(/'/g, '"'))["list"];
					if(!ret){UpdateDone("已经是最后一页");return;}
					for (var i = 0; i < ret.length; i++) {
						songid[i] = {
							artist:ret[i].artist,
							song:ret[i].songName,
							url:"http://antiserver.kuwo.cn/anti.s?type=convert_url&response=url&rid=" + ret[i].rid + "&br=320kmp3&format=mp3"
						};
					}
					l = 0;
					debug && fb.trace(songid.length);
					url = songid[l].url;
					debug && fb.trace(l,url);
					xmlHttp2.open("GET", url, true);
					xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
					xmlHttp2.send(null);
					xmlHttp2.onreadystatechange = function() {
						if (xmlHttp2.readyState == 4) {
							if (xmlHttp2.status == 200) {
								filedata = filedata + '<entry>\r\n'
								 + '<title>' + songid[l].song + '</title>\r\n'
								 + '<author>' + songid[l].artist + '</author>\r\n'
								 + '<ref href="' + xmlHttp2.responseText + '"/>\r\n'
								 + '</entry>\r\n\r\n';
								 debug && fb.trace(l,songid[l].song,songid[l].artist,xmlHttp2.responseText)
							}
							l++;
							if (l < songid.length){
								var URL_Timer = window.SetTimeout(function () {
										url = songid[l].url;
										xmlHttp2.open("GET", url, true);
										xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
										xmlHttp2.send(null);
										URL_Timer && window.ClearTimeout(URL_Timer);
									}, 5);
							}	
							if (l == songid.length) {
								filedata = filedata + "</asx>";
								SaveAs(filedata, cachefile);
								DisposeList("网搜", 4, SearchListName, pageid, switchpage);
								SetBoxText(null);
							}
						}
					};
				}
			}
		}
	} catch(e) {
		fb.trace("搜索失败");
		SetBoxText(null);
		return;
	}
}

//=================================================// QQ音乐榜单
function GetQQRanklist(){
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在更新榜单菜单...");
    var searchURL = "https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_opt.fcg?page=index&format=html&tpl=macv4&v8debug=1";
	//debug && fb.trace(searchURL);
	try {
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var listid = "";
					var listidname = "";
					var ret = json(xmlHttp.responseText.replace(" jsonCallback(","").replace(/\n/g, "").replace("])", "]"));
					if (ret.length > 0) {
						for (var k = 0; k < ret.length; k++) {
							listid = "";
							if (k + 1 == ret.length) {
								listidname += ret[k].GroupName;
							}else{
								listidname += ret[k].GroupName + ";";
							}
							for (var i = 0; i < ret[k].List.length; i++) {
								if (ret[k].List[i].ListName == "巅峰榜·MV" || ret[k].List[i].ListName == "巅峰榜·K歌金曲") continue;
								var name_arr = ret[k].List[i].ListName.split("·");
								if (i + 1 == ret[k].List.length) {
									listid += name_arr[name_arr.length - 1] + ":" + ret[k].List[i].topID
								}else{
									listid += name_arr[name_arr.length - 1] + ":" + ret[k].List[i].topID + ";"
								}
								if (k + 1 == ret.length) {
									if(listid.charAt(listid.length-1) == ";") listid1 = listid.slice(0,listid.length-1);
									window.SetProperty("_PROPERTY: Search Source: Web: List Arr 2", listid1);
									ppt.weblistarr2 = window.GetProperty("_PROPERTY: Search Source: Web: List Arr 2", "").split(";")
								}else{
									if(listid.charAt(listid.length-1) == ";") listid1 = listid.slice(0,listid.length-1);
									window.SetProperty("_PROPERTY: Search Source: Web: List Arr 1", listid1);
									ppt.weblistarr1 = window.GetProperty("_PROPERTY: Search Source: Web: List Arr 1", "").split(";")
								}
							}
						}
						window.SetProperty("_PROPERTY: Search Source: Web: List Arr Name", listidname);
						ppt.weblistarrname = window.GetProperty("_PROPERTY: Search Source: Web: List Arr Name", "").split(";")
					}else{UpdateDone("榜单没有内容");return;}
				}
			}
		}
		UpdateDone("榜单更新成功!");
	} catch(e) {
		fb.trace("更新失败");
		SetBoxText(null);
		return;
	}
}

function QQRanklist(idx, id, listname){
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在更新排行榜...");
	//cachefile = fb.ProfilePath + "\\cache\\" + listname + ".asx";
	cachefile = fb.ProfilePath + "\\cache\\RankList.asx";
	//debug && fb.trace(id,listname);
	switch(true){
		case (idx >= 101 && idx <= 101 + ppt.weblistarr1.length):
			var url = "https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?topid=" + id;
			break;
		case (idx >= 150 && idx <= 150 + ppt.weblistarr2.length):
			var url = "https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?topid=" + id;
			break;
	}
	//debug && fb.trace(url);
	try {
		xmlHttp.open("GET", url, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var songid = [];
					var ret = json(xmlHttp.responseText)["songlist"];
					//debug && fb.trace("搜索到的数量 > " + ret.length);
					if (ret.length > 0) {
						for (var i = 0; i < ret.length; i++) {
							songid[i] = {
								artist:ret[i].data.singer[0].name,
								song:ret[i].data.songname,
								mid:ret[i].data.songmid,
								strMediaMid:ret[i].data.strMediaMid,
								saac:ret[i]["data"]["size_aac"],
								s128:ret[i]["data"]["size_128"],
								s320:ret[i]["data"]["size_320"],
								sflac:ret[i]["data"]["size_flac"]
							}
						}
					}else{UpdateDone("排行榜无歌曲");return;}
					var filedata = '<asx version="3.0">\r\n\r\n';
					var url = "http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?json=3&guid=foobar2000&g_tk=938407465&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=GB2312&platform=yqq&jsonpCallback=&needNewCode=0";
					try {
						xmlHttp.open("GET",url,false);
						xmlHttp.send();
					} catch (e) {
						return;
					}
					
					if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
						//parse HTML
						var ret = json(xmlHttp.responseText.replace("jsonCallback","").replace(/\;|\(|\)/g, ""))["key"];
						for (var i = 0; i < songid.length; i++) {
							switch(ppt.quality){
								case 1:
									var qt = "M500";
									var ext = ".mp3";
									break;
								case 2:
									var qt = "M800";
									var ext = ".mp3";
									break;
								case 3:
									var qt = "F000";
									var ext = ".flac";
									break;
								case 4:
								default:
									var qt = (songid[i].sflac=="0")?"M800":"F000";
									var ext = (songid[i].sflac=="0")?".mp3":".flac";
									break;
								case 5:
									var qt = (songid[i].sflac=="0")?(songid[i].s320=="0")?"M500":"M800":"F000";
									var ext = (songid[i].sflac=="0")?(songid[i].s320=="0")?".mp3":".mp3":".flac";
									break;
							}
							if((songid[i].s128 != "0" && qt == "M500") || (songid[i].s320 != "0" && qt == "M800") || (songid[i].sflac != "0" && qt == "F000")){
								filedata = filedata + '<entry>\r\n'
								 + '<title>' + songid[i].song + '</title>\r\n'
								 + '<author>' + songid[i].artist + '</author>\r\n'
								 + '<ref href="' + "http://mobileoc.music.tc.qq.com/" + qt + songid[i].strMediaMid + ext + "?vkey=" + ret + "&guid=foobar2000&fromtag=53" + '"/>\r\n'
								 + '</entry>\r\n\r\n';
							 }
						}
					}
					filedata = filedata + "</asx>";
					SaveAs(filedata, cachefile);
					UpdateList("榜单 | " + listname);
					//DisposeList("排行榜", 5, listname, "");
					SetBoxText(null);
				}
			}
		}
	} catch(e) {
		SetBoxText(null);
		fb.trace("获取排行榜失败");
		return;
	}
	Deltempfile(cachefile);
}

//=================================================// 酷狗音乐榜单

function GetKGRankList(){
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在更新榜单菜单...");
    var searchURL = 'http://m.kugou.com/rank/list&json=true';
	//debug && fb.trace(searchURL);
	try {
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var listid = "";
					var src = reconvert(xmlHttp.responseText)
					var ret = json(src)["rank"]["list"];
					if (ret.length > 0) {
						listid = "";
						for (var i = 0; i < ret.length; i++) {
							if (i + 1 == ret.length) {
								listid += ret[i].rankname + ":" + ret[i].rankid;
							}else{
								listid += ret[i].rankname + ":" + ret[i].rankid + ";";
							}
							//debug && fb.trace(ret[i].rankname,ret[i].rankid);
						}
						window.SetProperty("_PROPERTY: Search Source: KG Rank List: List Arr", listid);
						ppt.webkgranklistarr = window.GetProperty("_PROPERTY: Search Source: KG Rank List: List Arr", "").split(";");
					}else{UpdateDone("榜单没有内容");return;}
				}
			}
		}
		UpdateDone("榜单更新成功!");
	} catch(e) {
		fb.trace("更新失败");
		return;
	}
}

function KGRankListid(id, listname){
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在更新排行榜...");
	cachefile = fb.ProfilePath + "\\cache\\RankList.asx";
    var songid = [];
    var searchURL = 'http://m.kugou.com/rank/info/?rankid=' + id + '&page=1&json=true';
	//debug && fb.trace(searchURL);
	try {
		var p = 1;
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var src = reconvert(xmlHttp.responseText);
					var ret = json(src)["songs"];
					//debug && fb.trace("共" + ret.total + "首","每页" + ret.pagesize + "首","共" + Math.ceil(ret.total/ret.pagesize) + "页")
					if (ret.list.length > 0) {
						for (var i = 0; i < ret.list.length; i++) {
							var qt = (ret.list[i].sqhash=="")?(ret.list[i]["320hash"]=="")?ret.list[i].hash:ret.list[i]["320hash"]:ret.list[i].sqhash
							if (qt == null || qt.length == 0) {
								continue;
							}
							songid.push({
								artist:ret.list[i].filename.split(" - ")[0],
								song:ret.list[i].filename.split(" - ")[1],
								hash:qt
							});
                            //debug && fb.trace(ret.list[i].filename.split(" - ")[0],ret.list[i].filename.split(" - ")[1],qt)
						}
					}else{UpdateDone("排行榜无歌曲");return;}
                    if (p < Math.ceil(ret.total/ret.pagesize)){
                        p++;
                        var URL_Timer = window.SetTimeout(function () {
                                url = 'http://m.kugou.com/rank/info/?rankid=' + id + '&page=' + p + '&json=true';
                                xmlHttp.open("GET", url, true);
                                xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
                                xmlHttp.send(null);
                                URL_Timer && window.ClearTimeout(URL_Timer);
                            }, 5);
					    return;
                    }
                    //debug && fb.trace(songid.length);
                    //return;
					var l = 0;
					var filedata = '<asx version="3.0">\r\n\r\n';
					var rex = new RegExp("play_url\":\"(.*?)\",","g");
					url = "http://www.kugou.com/yy/index.php?r=play/getdata&hash=" + songid[l].hash;
					//debug && fb.trace(l,url);
					xmlHttp2.open("GET", url, true);
					xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
					xmlHttp2.send(null);
					xmlHttp2.onreadystatechange = function() {
						if (xmlHttp2.readyState == 4) {
							if (xmlHttp2.status == 200) {
								ret = rex.exec(reconvert(xmlHttp2.responseText));
								if(ret != null){
									filedata = filedata + '<entry>\r\n'
									 + '<title>' + songid[l].song + '</title>\r\n'
									 + '<author>' + songid[l].artist + '</author>\r\n'
									 + '<ref href="' + ret[1].replace(/\\/g, "") + '"/>\r\n'
									 + '</entry>\r\n\r\n';
								}
							}
							l++;
							if (l < songid.length){
								var URL_Timer = window.SetTimeout(function () {
										url = "http://www.kugou.com/yy/index.php?r=play/getdata&hash=" + songid[l].hash;
										xmlHttp2.open("GET", url, true);
										xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
										xmlHttp2.send(null);
										//debug && fb.trace(l,url);
										URL_Timer && window.ClearTimeout(URL_Timer);
									}, 5);

							}
							if (l == songid.length) {
								filedata = filedata + "</asx>";
								SaveAs(filedata, cachefile);
								UpdateList("榜单 | " + listname);
								SetBoxText(null);
							}
						}
					};
				}
			}
		}
	} catch(e) {
		fb.trace("搜索失败");
		SetBoxText(null);
		return;
	}
	Deltempfile(cachefile);
}

//=================================================// QQ音乐电台

function GetQQRadiolist(){
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在更新电台菜单...");
    var searchURL = "https://c.y.qq.com/v8/fcg-bin/fcg_v8_radiolist.fcg?channel=radio";
	//debug && fb.trace(searchURL);
	try {
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var listid = "";
					var listidname = "";
					var ret = json(xmlHttp.responseText.replace("MusicJsonCallback(","").replace(/\n/g, "").replace("})", "}"))["data"]["data"]["groupList"];
					if (ret.length > 0) {
						listid = "";
						listid2 = "";
						for (var k = 0; k < ret.length; k++) {
							listid += ret[k].name + ": g;";
							for (var i = 0; i < ret[k].radioList.length; i++) {
								if (ret[k].radioList[i].radioName == "个性电台") continue;
								if (i + 1 == ret[k].radioList.length) {
									listid += ret[k].radioList[i].radioName + ":" + ret[k].radioList[i].radioId;
								}else{
									listid += ret[k].radioList[i].radioName + ":" + ret[k].radioList[i].radioId + ";";
								}
								if (k + 1 == ret.length && i + 1 == ret[k].radioList.length) {
									listid2 += ret[k].radioList[i].radioName + ":" + ret[k].radioList[i].radioId;
								}else{
									listid2 += ret[k].radioList[i].radioName + ":" + ret[k].radioList[i].radioId + ";";
								}
							}
							if (k + 1 == ret.length) {
							}else{
								listid += "|";
							}
						}
						window.SetProperty("_PROPERTY: Search Source: Web Radio: List Arr", listid);
						ppt.webradiolistarr = window.GetProperty("_PROPERTY: Search Source: Web Radio: List Arr", "").split("|");
						window.SetProperty("_PROPERTY: Search Source: Web Radio: List Arr 2", listid2);
						ppt.webradiolistarr2 = window.GetProperty("_PROPERTY: Search Source: Web Radio: List Arr 2", "").split(";");
						//RestoreBoxText(texttemp);
					}else{UpdateDone("电台没有内容");return;}
				}
			}
		}
		UpdateDone("电台更新成功!");
	} catch(e) {
		fb.trace("更新失败");
		return;
	}
}

function QQRadiolist(id, listname){
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在获取电台...");
	cachefile = fb.ProfilePath + "\\cache\\RadioList.asx";
	//debug && fb.trace(id,listname);
	var url = "https://u.y.qq.com/cgi-bin/musicu.fcg?data=%7B%22songlist%22%3A%7B%22module%22%3A%22pf.radiosvr%22%2C%22method%22%3A%22GetRadiosonglist%22%2C%22param%22%3A%7B%22id%22%3A" + id + "%2C%22firstplay%22%3A1%2C%22num%22%3A30%7D%7D%7D";
	//debug && fb.trace(url);
	try {
		xmlHttp.open("GET", url, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var songid = [];
					var ret = json(xmlHttp.responseText)["songlist"]["data"]["track_list"];
					debug && fb.trace("搜索到的数量 > " + ret.length);
					if (ret.length > 0) {
						for (var i = 0; i < ret.length; i++) {
							songid[i] = {
								artist:ret[i].singer[0].name,
								song:ret[i].name,
								mid:ret[i]["mid"],
								strMediaMid:ret[i]["file"]["media_mid"],
								saac:ret[i]["file"]["size_aac"],
								s128:ret[i]["file"]["size_128"],
								s320:ret[i]["file"]["size_320"],
								sflac:ret[i]["file"]["size_flac"]
							}
						}
					}else{UpdateDone("电台没有歌曲");return;}
					var filedata = '<asx version="3.0">\r\n\r\n';
					var url = "http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?json=3&guid=foobar2000&g_tk=938407465&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=GB2312&platform=yqq&jsonpCallback=&needNewCode=0";
					try {
						xmlHttp.open("GET",url,false);
						xmlHttp.send();
					} catch (e) {
						return;
					}
					
					if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
						//parse HTML
						var ret = json(xmlHttp.responseText.replace("jsonCallback","").replace(/\;|\(|\)/g, ""))["key"];
						if(ret == undefined || ret == null) {UpdateDone("出错！请稍后再试！");return;}
						for (var i = 0; i < songid.length; i++) {
							switch(ppt.quality){
								case 1:
									var qt = "M500";
									var ext = ".mp3";
									break;
								case 2:
									var qt = "M800";
									var ext = ".mp3";
									break;
								case 3:
									var qt = "F000";
									var ext = ".flac";
									break;
								case 4:
								default:
									var qt = (songid[i].sflac=="0")?"M800":"F000";
									var ext = (songid[i].sflac=="0")?".mp3":".flac";
									break;
								case 5:
									var qt = (songid[i].sflac=="0")?(songid[i].s320=="0")?"M500":"M800":"F000";
									var ext = (songid[i].sflac=="0")?(songid[i].s320=="0")?".mp3":".mp3":".flac";
									break;
							}
							if((songid[i].s128 != "0" && qt == "M500") || (songid[i].s320 != "0" && qt == "M800") || (songid[i].sflac != "0" && qt == "F000")){
								filedata = filedata + '<entry>\r\n'
								 + '<title>' + songid[i].song + '</title>\r\n'
								 + '<author>' + songid[i].artist + '</author>\r\n'
								 + '<ref href="' + "http://mobileoc.music.tc.qq.com/" + qt + songid[i].strMediaMid + ext + "?vkey=" + ret + "&guid=foobar2000&fromtag=53" + '"/>\r\n'
								 + '</entry>\r\n\r\n';
							 }
						}
					}
					filedata = filedata + "</asx>";
					SaveAs(filedata, cachefile);
					UpdateList("电台 | " + listname);
					SetBoxText(null);
				}
			}
		}
	} catch(e) {
		fb.trace("获取电台失败");
		return;
	}
	Deltempfile(cachefile);
}

function SetBoxText(text){
	if(text == null) text ="";
	g_searchbox.inputbox.text = text;
	g_searchbox.repaint();
}

function UpdateDone(text){
	SetBoxText(text);
	var Done = window.SetTimeout(function() {
		SetBoxText(null);
		Done && window.ClearTimeout(Done);
		Done = false;
	}, 4000);
}

function DisposeList(typename, namelen, listname, pageid, switchpage){
	if (switchpage) {
		var playlistIndex = plman.ActivePlaylist;
		plman.ClearPlaylist(playlistIndex);
		plman.AddLocations(playlistIndex, [cachefile]);
		plman.RenamePlaylist(playlistIndex, typename + " | " + listname + " | " + pageid);
	} else {
		if(pageid != null) var addpageid = " | " + pageid;
		else var addpageid = "";
		var pl_to_remove = new Array;
		var isFound = false;
		var total = plman.PlaylistCount;
		for (var i = 0; i < total; i++) {
			if (plman.GetPlaylistName(i).substr(0, namelen) == typename + " |") {
				if (!ppt.multiple) {
					if (!isFound) {
						var plIndex = i;
						isFound = true;
					}
					pl_to_remove.push(i);
				}
			}
		}
		if (isFound && !ppt.multiple) {
			var r = pl_to_remove.length - 1;
			while (r >= 0) {
				plman.RemovePlaylist(pl_to_remove[r]);
				r--;
			}
			plIndex = plman.PlaylistCount;
		} else {
			plIndex = total;
		}
		fb.CreatePlaylist(plIndex, typename + " | " + listname + addpageid);
		plman.AddLocations(plIndex, [cachefile]);
		plman.ActivePlaylist = plIndex;
	}
}

function UpdateList(listname){
	var isFound = false;
	var total = plman.PlaylistCount;
	for (var i = 0; i < total; i++) {
		if (plman.GetPlaylistName(i).substr(0, listname.length) == listname) {
			if (!isFound) {
				var plIndex = i;
				isFound = true;
			}
			break;
		}
	}
	if (isFound) {
		plman.ClearPlaylist(plIndex);
	} else {
		plIndex = total;
		fb.CreatePlaylist(plIndex, listname);
	}
	plman.AddLocations(plIndex, [cachefile]);
	plman.ActivePlaylist = plIndex;
}

function Deltempfile(tmpfile){
	var DelFile = window.SetTimeout(function() {
		try {
			fso.DeleteFile(tmpfile);
		}; catch(e) {};
		DelFile && window.ClearTimeout(DelFile);
		DelFile = false;
	}, 6000);
}

function SaveAs(str, file) {
	var ado = new ActiveXObject("ADODB.Stream");
	ado.Type = 2;
	ado.mode = 3;
	ado.Charset = "UTF-8";
	ado.open();
	try {
		ado.WriteText(str);
		ado.SaveToFile(file);
	} catch (e) {
		fb.trace("ADODB.Stream:写入文件失败。");
	}
	ado.flush();
	ado.Close();
}

function StringFilter(s) {
	s = s.replace(/\'|·|\&|–/g, "");
	//truncate all symbols
	s = s.replace(/\(.*?\)|\[.*?]|{.*?}|（.*?/g, "");
	s = s.replace(/[-/:-@[-`{-~]+/g, "");
	s = s.replace(/[\u2014\u2018\u201c\u2026\u3001\u3002\u300a\u300b\u300e\u300f\u3010\u3011\u30fb\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff5e\uffe5]+/g, "");
	return s;
}

function json(text) {
	try {
		var data = JSON.parse(text);
		return data;
	} catch (e) {
		return false;
	}
}

function reconvert(str){ 
	str = str.replace(/(\\u)(\w{1,4})/gi,function($0){ 
		return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g,"$2")),16))); 
	}); 
	str = str.replace(/(&#x)(\w{1,4});/gi,function($0){ 
		return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g,"$2"),16)); 
	}); 
	str = str.replace(/(&#)(\d{1,6});/gi,function($0){ 
		return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g,"$2"))); 
	}); 
	return str; 
}