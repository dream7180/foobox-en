//common script
window.DrawMode = 1;//1-D2D,0-GDI
var cfgexist = 1;
var cfg_map = { // 内置默认值（类型即归一化基准：数字键强制 Number，字符串键强制 String）
	winFrame: 2,
	LineHeight: 33,
	ScrollStep: 3,
	sys_scrollbar: 0,
	color_bycover: 1,
	cbkg_bycover: 1,
	color_noesl: 0,
	color_threshold: 5,
	cbkg_chroma: 4,
	rating2tag: 0,
	show_menu: 1,
	show_extrabtn: 1,
	libbtn_fuc: 1,
	colorful_seek: 1,
	track_edit_app: "",
	title_add: "$if2(%codec_profile% | ,)$info(encoding) | %channels% | $if2($info(bitspersample) bits | ,)%bitrate% kbps | %samplerate% Hz"
};
(function read_common_cfg() { // common.cfg：JSON 文本，仅 jsplaylist 面板写入，其余面板只读
	try {
		var saved = JSON.parse(utils.ReadTextFile(fb.ProfilePath + "foobox\\data\\common.cfg").replace(/^\uFEFF/, ""));
		for (var k in cfg_map) {
			if (saved[k] !== undefined) {
				cfg_map[k] = typeof cfg_map[k] == "number" ? Number(saved[k]) : String(saved[k]); // 防手改类型错乱
			}
		}
	} catch (e) { // 文件不存在或损坏：由 jsplaylist 写入默认值
		cfgexist = 0;
	}
})();
if (cfg_map.winFrame != fb.Window.FrameStyle) fb.Window.FrameStyle = cfg_map.winFrame;
if (!fb.Window.MainMenuHidden) fb.Window.MainMenuHidden = true;
if (!fb.Window.StatusBarHidden) fb.Window.StatusBarHidden = true;
