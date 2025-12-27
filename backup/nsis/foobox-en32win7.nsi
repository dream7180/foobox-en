Unicode true

# Include
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "GetUserLevel.nsh"

#Var
Var ProfileDir
Var VersionCheckbox
Var CfgCheckbox
Var noAdmin
Var noConfig
Var initDestination
Var initVersion
Var FontDir

#APP
!define FBOX_VER "8.7"
!define BUILD_NUM "1"

# Setup
Name "foobox"
OutFile "foobox_x86.en.v${FBOX_VER}-win7-${BUILD_NUM}.exe"
# VerInfo
VIProductVersion "${FBOX_VER}.0.${BUILD_NUM}.win7"
VIAddVersionKey "ProductName" "foobox"
VIAddVersionKey "FileDescription" "foobox DUI theme for foobar2000"
VIAddVersionKey "LegalCopyright" "https://github.com/dream7180"
VIAddVersionKey "FileVersion" "${FBOX_VER}"
VIAddVersionKey  "ProductVersion" "${FBOX_VER}"

# Compile
SetCompressor /SOLID lzma
SetCompressorDictSize 32
SetDatablockOptimize on
SetOverwrite try

# Runtime
Caption "foobox v${FBOX_VER} [Win7] setup for foobar2000 (x86)"
RequestExecutionLevel highest
ShowInstDetails show
DirText "Setup will detect the installation path of foobar2000. If foobar2000 is undetected or to install in another foobar2000 directory, click Browse and select the proper folder." "" "" "Select root directory of foobar2000 to install $(^NameDA):"
BrandingText "NSIS v3"

# --- MUI Settings Start ---
ReserveFile ".\common\installer\install8.ico"
ReserveFile ".\common\installer\foobox8.bmp"

# MUI
!define MUI_UI_COMPONENTSPAGE_SMALLDESC "${NSISDIR}\Contrib\UIs\modern_smalldesc.exe"
!define MUI_COMPONENTSPAGE_SMALLDESC

# Icon
!define MUI_ICON ".\common\installer\install8.ico"
# Bitmap
!define MUI_WELCOMEFINISHPAGE_BITMAP ".\common\installer\foobox8.bmp"

# - InstallPage -
!define MUI_ABORTWARNING

!define MUI_WELCOMEPAGE_TEXT "\
foobox is a feature-rich Default User Interface (DUI) theme for foobar2000 audio player based on JSplitter (Spider Monkey Panel version). It is user-friendly, powerful and runs in high efficiency.$\n$\n\
You should have foobar2000 (32-bit vresion) installed in your computer before extracting foobox theme into it.$\n$\n\
Note: This installer use legacy version of JSpliiter (3.7.x) to support Windows 7."

!define MUI_WELCOMEPAGE_LINK "Download the latest release of foobar2000"
!define MUI_WELCOMEPAGE_LINK_LOCATION "https://www.foobar2000.org"
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
!define MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) DUI theme has been installed to foobar2000.$\r$\nFiles of foobox are located in foobar2000 program and profile folders, they can be removed with foobar2000 uninstaller.$\r$\n$\r$\nClick Finish to close Setup."
!define MUI_FINISHPAGE_LINK "Visit foobox on github"
!define MUI_FINISHPAGE_LINK_LOCATION "https://github.com/dream7180/foobox-en"
!insertmacro MUI_PAGE_FINISH
#language
!insertmacro MUI_LANGUAGE "English"

# --- Install Section ---
Section "foobox theme and required components" fooboxCore
    SectionIn RO
	
	Delete "$INSTDIR\themes\foobox8 + biograph.fth"
	;RmDir /r "$ProfileDir\foobox\version6"
	
	SetOutPath "$INSTDIR\themes"
	File ".\en\xcommon\themes\*.*"
	File ".\en\x86\themes\*.*"
	
	SetOutPath "$ProfileDir\foobox"
	File /r ".\en\xcommon\foobox\*.*"
	
	SetOutPath "$ProfileDir\user-components\foo_enhanced_spectrum_analyzer"
	File ".\en\x86\profile\user-components\foo_enhanced_spectrum_analyzer\foo_enhanced_spectrum_analyzer.dll"
	
	SetOutPath "$ProfileDir\user-components\foo_playcount"
	File ".\en\x86\profile\user-components\foo_playcount\foo_playcount.dll"
	
	SetOutPath "$ProfileDir\user-components\foo_ui_hacks"
	File ".\en\x86\profile\user-components\foo_ui_hacks\foo_ui_hacks.dll"
	File ".\en\x86\profile\user-components\foo_ui_hacks\UIHacks.js"
	
	SetOutPath "$ProfileDir\user-components\foo_uie_jsplitter"
	File ".\en\win7\jsplitter-x86\*.*"
	
	SetOutPath "$ProfileDir\user-components\foo_uie_eslyric"
	File ".\common\eslyric\enable_script_control"
	SetOutPath "$ProfileDir\user-components\foo_uie_eslyric\skins"
	File /r ".\en\xcommon\eslyric_skins\*.*"
	
	SetOutPath "$ProfileDir\user-components\foo_uie_jsplitter"
	File /r ".\common\foo_uie_jsplitter\*.*"

	SetOutPath "$ProfileDir\user-components\foo_uie_eslyric"
	File ".\common\eslyric\x86\legacy\foo_uie_eslyric.dll"

	SetOutPath "$ProfileDir\foobox\script\html"
	File ".\common\scriptWin7\styles.css"

	SetOutPath "$ProfileDir\user-components\foo_uie_jsplitter\samples\packages"
	File /r ".\en\xcommon\biography-package\*.*"
	
	${If} $noConfig = 0
		SetOutPath "$ProfileDir"
		File ".\en\x86\profile\theme.fth"
	${EndIf}
	; install font
	Call CheckFontA
	${If} $FontDir != "NOINST"
		Call CheckFontU
	${EndIf}
	;MessageBox MB_OK "Fontdir is $FontDir."
	${If} $FontDir != "NOINST"
		SetOutPath "$FontDir"
		File ".\common\fontawesome-webfont.ttf"
	
		System::Call "gdi32::AddFontResource(t '$FontDir\fontawesome-webfont.ttf')"

		Push '$FontDir\fontawesome-webfont.ttf'
		Call GetFontName
		Pop $R0

		${If} $R0 != 'error'
			${If} $noAdmin = 0
				WriteRegStr HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" '$R0 (TrueType)' 'fontawesome-webfont.ttf'
			${Else}
				WriteRegStr HKCU "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" '$R0 (TrueType)' '$FontDir\fontawesome-webfont.ttf'
			${EndIf}
		${Else}
			System::Call "gdi32::RemoveFontResource(t '$FontDir\fontawesome-webfont.ttf')"
		${EndIf} 
	${EndIf}
SectionEnd

Section "File format icons" Icons
	SetOutPath "$INSTDIR\icons"
	File /r ".\common\icons\*.*"
SectionEnd

Section -Post
    # 获取安装目录读写权限
    AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
SectionEnd

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
	IfFileExists $INSTDIR\vcruntime140_1.dll 0 +3
	MessageBox MB_OK|MB_ICONEXCLAMATION "64 bit foobar2000 detected, please choose 32 bit instead."
	Abort
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
	StrCpy $ProfileDir "$APPDATA\foobar2000-v2"
	IfFileExists $INSTDIR\portable_mode_enabled 0 +2
	StrCpy $ProfileDir "$InstDir\profile"
FunctionEnd

Function OptionsPageCreate
#Call CheckWinver
Call CheckUser
StrCpy $initDestination $InstDir ; If the user clicks BACK on the directory page we will remember their mode specific directory
!insertmacro MUI_HEADER_TEXT "Options and Notes" "Important: 32-bit foobar2000 is required."
nsDialogs::Create 1018
${NSD_CreateLabel} 10u 0u 90% 10u "Installing or updating foobox will not change any core settings of foobar2000."

IfFileExists $INSTDIR\icons\*.* +3 0
	SectionSetFlags ${Icons} 0
	SectionSetText ${Icons} ""
	
${NSD_CreateCheckbox} 10u 30u 90% 10u "Install for foobar2000 version 1.x"
Pop $VersionCheckbox
${If} $initVersion = "1"
	${NSD_Check} $VersionCheckbox
${EndIf}
${NSD_CreateLabel} 20u 40u 90% 20u "If you intend to install for elder foobar2000 v1.x, this option shall be checked."
${NSD_CreateCheckbox} 10u 65u 90% 10u "Do not install theme configure files"
Pop $CfgCheckbox
${If} $noConfig = 1
	${NSD_Check} $CfgCheckbox
${EndIf}
${NSD_CreateLabel} 20u 75u 90% 20u "If checked, theme.fth will not be copied. Caution: keep unchecked if unsure!"
;EnableWindow $CfgCheckbox 0
nsDialogs::Show
FunctionEnd

Function OptionsPageLeave
${NSD_GetState} $VersionCheckbox $0
${If} $0 = ${BST_CHECKED}
	StrCpy $initVersion "1"
	StrCpy $ProfileDir "$InstDir\profile"
	IfFileExists $INSTDIR\user_profiles_enabled 0 +2
	StrCpy $ProfileDir "$APPDATA\foobar2000"
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
ExecWait "$\"$INSTDIR\foobar2000.exe$\" /quiet /quit"
FunctionEnd

Function CheckUser
Pop $0
Pop $R0
ReadEnvStr $R0 "USERNAME"
${GetUserLevel} $0 $R0
${If} $0 != 2
	StrCpy $noAdmin 1
	StrCpy $FontDir "$PROFILE\AppData\Local\Microsoft\Windows\Fonts"
${Else}
	StrCpy $noAdmin 0
	StrCpy $FontDir "$FONTS"
${EndIf}
FunctionEnd

Function CheckFontA
Pop $0
ClearErrors
ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" "FontAwesome (TrueType)"
IfErrors INSTOK 0
${IF} $0 != ""
	StrCpy $FontDir "NOINST"
${ENDIF}
INSTOK:
FunctionEnd

Function CheckFontU
Pop $0
ClearErrors
ReadRegStr $0 HKCU "SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" "FontAwesome (TrueType)"
IfErrors INSTOK 0
${IF} $0 != ""
	StrCpy $FontDir "NOINST"
${ENDIF}
INSTOK:
FunctionEnd

Function GetFontName
    Exch $R0
    Push $R1
    Push $R2

    System::Call *(i${NSIS_MAX_STRLEN})i.R1
    System::Alloc ${NSIS_MAX_STRLEN}
    Pop $R2
    System::Call gdi32::GetFontResourceInfoW(wR0,iR1,iR2,i1)i.R0
    ${If} $R0 == 0
    StrCpy $R0 error
    ${Else} 
    System::Call *$R2(&w${NSIS_MAX_STRLEN}.R0)
    ${EndIf}
    System::Free $R1
    System::Free $R2

    Pop $R2
    Pop $R1
    Exch $R0
FunctionEnd

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
	!insertmacro MUI_DESCRIPTION_TEXT ${fooboxCore} "Files and components required by foobox DUI theme."
	!insertmacro MUI_DESCRIPTION_TEXT ${Icons} "Replacing the icons for file format associations with foobox themed icons."
!insertmacro MUI_FUNCTION_DESCRIPTION_END
