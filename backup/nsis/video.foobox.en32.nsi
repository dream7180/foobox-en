﻿Unicode true

# Include
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "GetUserLevel.nsh"

#Var
Var PortableMode
Var ProfileDir
Var VersionCheckbox
Var CfgCheckbox
Var noAdmin
Var noConfig
Var initDestination
Var initVersion

#APP
!define /date ComplieTime "%y%m%d"
!define FBOX_VER "7.29+"
!define VER_DATE "20${ComplieTime}"
!define BUILD_NUM "1"

# Setup
Name "video panels for foobox"
OutFile "foobox-video_x86.en.${VER_DATE}.exe"
# VerInfo
VIProductVersion "${VER_DATE}.0.0.${BUILD_NUM}"
VIAddVersionKey "ProductName" "foobox video"
VIAddVersionKey "FileDescription" "video panels for foobox theme of foobar2000"
VIAddVersionKey "LegalCopyright" "https://github.com/dream7180"
VIAddVersionKey "FileVersion" "${VER_DATE}"
VIAddVersionKey  "ProductVersion" "${VER_DATE}.0"

# Compile
SetCompressor /SOLID lzma
SetCompressorDictSize 32
SetDatablockOptimize on
SetOverwrite try

# Runtime
Caption "Install video panels for foobox v${FBOX_VER} theme"
RequestExecutionLevel highest
ShowInstDetails show
DirText "Setup will detect the installation path of foobar2000. If foobar2000 is undetected or to install in another foobar2000 directory, click Browse and select the proper folder."
BrandingText "NSIS v3"

# --- MUI Settings Start ---
ReserveFile ".\common\installer\install7p.ico"
ReserveFile ".\common\installer\boxvideo.bmp"

# MUI
!define MUI_UI_COMPONENTSPAGE_SMALLDESC "${NSISDIR}\Contrib\UIs\modern_smalldesc.exe"
!define MUI_COMPONENTSPAGE_SMALLDESC

# Icon
!define MUI_ICON ".\common\installer\install7p.ico"
# Bitmap
!define MUI_WELCOMEFINISHPAGE_BITMAP ".\common\installer\boxvideo.bmp"

# - InstallPage -
!define MUI_ABORTWARNING

!define MUI_WELCOMEPAGE_TEXT "\
This installer will install extra video playback support including components and layout configs to existing foobox theme of foobar2000 audio player (x86).$\n$\n\
foobar2000 program and foobox theme are not contained, you should install foobar2000 and foobox theme (x86 version) before running this installer."

!define MUI_WELCOMEPAGE_LINK "Visit foobox on github"
!define MUI_WELCOMEPAGE_LINK_LOCATION "https://github.com/dream7180/foobox-en"
!insertmacro MUI_PAGE_WELCOME

# DirectoryPage
!define MUI_PAGE_CUSTOMFUNCTION_PRE Check_Dir
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE Dir_Leave
!define MUI_TEXT_DIRECTORY_SUBTITLE "Choose the directory where foobar2000.exe is located to install $(^NameDA)."
!insertmacro MUI_PAGE_DIRECTORY

#extra option page
Page Custom OptionsPageCreate OptionsPageLeave
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE Inst_pre
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_INSTFILES
!define MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) has been installed to foobar2000.$\r$\nFiles and components are located in foobar2000 program and profile folders, they can be removed with foobar2000 uninstaller.$\r$\n$\r$\nfoobox theme with video panel layouts are available via main menu 'View - Layout - Quick setup'.$\r$\n$\r$\nClick Finish to close Setup."
!define MUI_FINISHPAGE_LINK "Visit foobox on github"
!define MUI_FINISHPAGE_LINK_LOCATION "https://github.com/dream7180/foobox-en"
!insertmacro MUI_PAGE_FINISH
#language
!insertmacro MUI_LANGUAGE "English"

# --- Install Section ---

Section "foo_input_ffmpeg component - ffmpeg decoder wrapper" fooffmpeg
	SetOutPath "$ProfileDir\user-components\foo_input_ffmpeg"
	File ".\en\video\vx86\profile\user-components\foo_input_ffmpeg\*.*"
	${If} $noConfig = 0
		SetOutPath "$ProfileDir\configuration"
		File ".\en\video\vxcommon\profile\configuration\foo_input_ffmpeg.dll.cfg"
	${EndIf}
	SetOutPath "$INSTDIR\encoders\ffmpeg"
	File /r ".\common\vx86\profile\foo_youtube\ffmpeg\*.*"
SectionEnd

Section "Video panel foo-youtube" VideoYoutube
	;SectionIn 2
	
	;remove old version files
	;IfFileExists "$INSTDIR\encoders\video\LAVFilters" 0 +6
	;${If} $noAdmin = 0
		;UnRegDLL "$INSTDIR\encoders\video\LAVFilters\LAVSplitter.ax"
		;UnRegDLL "$INSTDIR\encoders\video\LAVFilters\LAVVideo.ax"
		;UnRegDLL "$INSTDIR\encoders\video\LAVFilters\LAVAudio.ax"
	;${EndIf}
	;RMDir /r "$INSTDIR\encoders\video"
	;RMDir /r "$ProfileDir\foo_youtube"
	;install new file
	SetOutPath "$ProfileDir\user-components\foo_youtube"
	File ".\common\vx86\profile\user-components\foo_youtube\*.*"
	File ".\common\vxcommon\foo_youtube\*.*"
	${If} $noConfig = 0
		SetOutPath "$ProfileDir"
		File ".\en\video\vx86\profile\theme.fth"
		SetOutPath "$ProfileDir\configuration"
		${If} $noAdmin = 0
			File /oname=foo_youtube.dll.cfg ".\en\video\vxcommon\profile\configuration\foo_youtube_admin.dll.cfg"
		${Else}
			File /oname=foo_youtube.dll.cfg ".\en\video\vxcommon\profile\configuration\foo_youtube_noadmin.dll.cfg"
		${EndIf}
	${EndIf}
	SetOutPath "$INSTDIR\themes"
	File ".\en\video\vx86\themes\foobox-7 + biography + video (youtube).fth"
	File ".\en\video\vx86\themes\foobox-7 + video (youtube).fth"
	IfFileExists "$ProfileDir\foobox\version6" 0 +6
	SetOutPath "$INSTDIR\themes"
	File ".\en\video\vx86_v6\themes\foobox-6 + biography + video (youtube).fth"
	File ".\en\video\vx86_v6\themes\foobox-6 + video (youtube).fth"
	SetOutPath "$ProfileDir"
	File ".\en\video\vx86_v6\profile\theme.fth"
	SetOutPath "$ProfileDir\foo_youtube"
	File /r ".\common\vx86\profile\foo_youtube\*.*"
	File /r ".\en\video\vx86\profile\foo_youtube\*.*"
	File ".\common\vxcommon\youtube-dl.exe"
	${If} $noAdmin = 0
		ExecWait '"$SYSDIR\regsvr32.exe" /s "$ProfileDir\foo_youtube\LAVFilters\LAVSplitter.ax"'
		ExecWait '"$SYSDIR\regsvr32.exe" /s "$ProfileDir\foo_youtube\LAVFilters\LAVVideo.ax"'
		ExecWait '"$SYSDIR\regsvr32.exe" /s "$ProfileDir\foo_youtube\LAVFilters\LAVAudio.ax"'
	${EndIf}
	SetOutPath "$INSTDIR"
	${If} $PortableMode = 0
        File "/oname=LavFilters assistant.bat" ".\en\video\vxcommon\lavassist\LavFilters_assistant_0.bat"
	${ElseIf} $PortableMode = 1
        File "/oname=LavFilters assistant.bat" ".\en\video\vxcommon\lavassist\LavFilters_assistant_1.bat"
	${Else}
		File "/oname=LavFilters assistant.bat" ".\en\video\vxcommon\lavassist\LavFilters_assistant_2.bat"
    ${EndIf}
SectionEnd

Section /o "Video panel foo-mpv" VideoMPV
	SetOutPath "$ProfileDir\user-components\foo_mpv"
	File /r ".\en\video\vx86\profile\user-components\foo_mpv\*.*"
	${If} $noConfig = 0
		SetOutPath "$ProfileDir\configuration"
		File ".\en\video\vxcommon\profile\configuration\foo_mpv.dll.cfg"
	${EndIf}
	SetOutPath "$INSTDIR\themes"
	File ".\en\video\vx86\themes\foobox-7 + biography + video (mpv).fth"
	File ".\en\video\vx86\themes\foobox-7 + video (mpv).fth"
	IfFileExists "$ProfileDir\foobox\version6" 0 +4
	SetOutPath "$INSTDIR\themes"
	File ".\en\video\vx86_v6\themes\foobox-6 + biography + video (mpv).fth"
	File ".\en\video\vx86_v6\themes\foobox-6 + video (mpv).fth"
	SetOutPath "$ProfileDir\mpv"
	File /r ".\en\video\vxcommon\profile\*.*"
SectionEnd

/*
Section -Post
    # 获取安装目录读写权限
    AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
	Delete "$INSTDIR\lastfmhosts.bat"
SectionEnd
*/
Function .onInit
	System::Call 'SHCore::SetProcessDpiAwareness(i 1)i.R0'
	StrCpy $InstDir $initDestination
	
	# 创建互斥防止重复运行
    System::Call `kernel32::CreateMutex(i0,i0,t"foobox_installer")i.r1?e`
    Pop $R0
    StrCmp $R0 0 +3
    MessageBox MB_OK|MB_ICONEXCLAMATION "Installer is running!"
    Abort
FunctionEnd

Function .onVerifyInstDir
	IfFileExists $INSTDIR\foobar2000.exe PathGood
    Abort
	PathGood:
FunctionEnd

Function Check_Dir
SetShellVarContext current
${If} $initDestination != ""
	StrCpy $InstDir $initDestination
${Else}
	ReadRegStr $INSTDIR HKLM "Software\foobar2000" "InstallDir"
${EndIf}
FunctionEnd

Function Dir_Leave
	StrCpy $PortableMode 0
	IfFileExists $INSTDIR\portable_mode_enabled 0 +2
	StrCpy $PortableMode 1
	${If} $PortableMode = 0
		StrCpy $ProfileDir "$APPDATA\foobar2000-v2"
	${Else}
		StrCpy $ProfileDir "$InstDir\profile"
	${EndIf}
FunctionEnd

Function OptionsPageCreate
Call CheckUser
StrCpy $initDestination $InstDir ; If the user clicks BACK on the directory page we will remember their mode specific directory
!insertmacro MUI_HEADER_TEXT "Options and Notes" "Important: First ensure 32-bit foobar2000 and foobox theme already installed."
nsDialogs::Create 1018
${NSD_CreateLabel} 10u 0u 95% 10u "Installing or updating video panels will not change any core settings of foobar2000."

${If} $noAdmin = 1
	;SectionSetFlags ${LastfmHosts} 0
	;SectionSetText ${LastfmHosts} ""
	${NSD_CreateLabel} 10u 15u 90% 20u "* You have no administrator privileges, some settings will be ignored. It will not affect adding video support to foobox theme."
${EndIf}
${NSD_CreateCheckbox} 10u 40u 90% 10u "Install for foobar2000 version 1.x"
Pop $VersionCheckbox
${If} $initVersion = "1"
	${NSD_Check} $VersionCheckbox
${EndIf}
${NSD_CreateLabel} 20u 50u 90% 20u "If you intend to install for elder foobar2000 v1.x, this option shall be checked."
${NSD_CreateCheckbox} 10u 80u 90% 10u "Do not install configure files"
Pop $CfgCheckbox
${If} $noConfig = 1
	${NSD_Check} $CfgCheckbox
${EndIf}
${NSD_CreateLabel} 20u 92u 90% 30u "If checked, cfg files for input_ffmpeg, foo_youtube, foo_mpv will not be copied. Be careful, keep unchecked if not sure!"
nsDialogs::Show
FunctionEnd

Function OptionsPageLeave
${NSD_GetState} $VersionCheckbox $0
${If} $0 = ${BST_CHECKED}
	StrCpy $initVersion "1"
	StrCpy $PortableMode 1
	IfFileExists $INSTDIR\user_profiles_enabled 0 +2
		StrCpy $PortableMode 2
	${If} $PortableMode = 2
		StrCpy $ProfileDir "$APPDATA\foobar2000"
	${Else}
		StrCpy $ProfileDir "$InstDir\profile"
	${EndIf}
${Else}
	StrCpy $initVersion "2"
${EndIf}
${NSD_GetState} $CfgCheckbox $0
${If} $0 = ${BST_CHECKED}
    StrCpy $noConfig 1
${Else}
	StrCpy $noConfig 0
${EndIf}
FunctionEnd

Function Inst_pre
IfFileExists $ProfileDir\foobox PathGood
MessageBox MB_OK "foobox theme is not found in foobar2000, please cancel this installation. You need to download and install foobox theme first."
Abort
PathGood:
ExecWait "$\"$INSTDIR\foobar2000.exe$\" /quiet /quit"
FunctionEnd

Function CheckUser
Pop $0
Pop $R0
ReadEnvStr $R0 "USERNAME"
${GetUserLevel} $0 $R0
${If} $0 != 2
	StrCpy $noAdmin 1
${Else}
	StrCpy $noAdmin 0
${EndIf}
FunctionEnd

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
	!insertmacro MUI_DESCRIPTION_TEXT ${fooffmpeg} "Make foobar2000 being able to recognize and decode video formats with custom ffmpeg decoder."
	!insertmacro MUI_DESCRIPTION_TEXT ${VideoYoutube} "foo-youtube component with layouts and related applications."
	!insertmacro MUI_DESCRIPTION_TEXT ${VideoMPV} "foo-mpv component and layout."
!insertmacro MUI_FUNCTION_DESCRIPTION_END
