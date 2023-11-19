# foobox
foobox is a DUI (Default User Interface) layout for [foobar2000](https://www.foobar2000.org), providing friendly & modern UI and extensive capability for library management, artwork support etc.
## [Develop]
The following third-party component are used:   
* [ESLyric](https://github.com/ESLyric/release) by ttsping;  
* [JSplitter](https://foobar2000.ru/forum/viewtopic.php?t=6378) based on [Spider Monkey Panel](https://github.com/TheQwertiest/foo_spider_monkey_panel);  
* [foo_enhanced_spectrum_analyzer] (https://hydrogenaud.io/index.php/topic,116014.0.html).  

The following excellent codes were modified and used:    
* JS Smooth Playlist Manager，WSH Pplaylist View，JS Smooth Browser by br3tt;  
* WSH Cover Panel by Jensen;  
* Search box by Asion;  
* [Biography](https://github.com/Wil-B/Biography) by Wil-B;
* Web Radio List maintained by [Fanmingming](https://github.com/fanmingming);
## [Installation]
> **Note** So far foobar2000 x64 is not supported due to the component JSplitter having x86 version only.

Unpack the latest release package and then:
* Copy "themes" folder to your foobar2000 installation directory;
* Copy all folders of "profile" to foobar2000 profile directory;
* Biography panel(Wil-B) requires [fontawesome-webfont.ttf](https://ghproxy.com/https://github.com/beakerbrowser/beakerbrowser.com/raw/master/fonts/fontawesome-webfont.ttf), copy it to  C:\Windows\Fonts

> **Note** for portable installation, foobar2000 profile is located under root directory of foobar2000.
> Directory structure:

<span style="display:block;text-align:left">![](info/portable.png)</span>

> **Note** for non-portable installation, foobar2000 profile is located in the user's data directory:\
> **C:\Users\YourUsername\AppData\Roaming\foobar2000** (version 1.x)\
> **C:\Users\YourUsername\AppData\Roaming\foobar2000-v2** (version 2.x)\
> Directory structure (2.x):

<span style="display:block;text-align:left">![](info/nonportable.png)</span>

## [Extra panel of video]
From version 7.16, foobox supports foo-youtube and foo-mpv video panel integration, but they are not included in standard release pack. As needed, you may download the video panel integration packs([github](https://github.com/dream7180/foobox-en/releases/tag/video) | [gitee](https://gitee.com/dream7180/foobox-en/releases/tag/video)), install them as per instruction (similar with above), and then you may switch various foobox layouts from "Main Menu -- View -- Layout -- Quick setup".

<span style="display:block;text-align:left">![](info/dui.png)</span>

## [Preview]

![alt text](info/screenshot-dark.jpg "foobox - DUI foobar2000 media player")

![alt text](info/screenshot-light.jpg "foobox - DUI foobar2000 media player")
