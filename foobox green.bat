@echo off
color 0a
:MENU
CLS
>nul 2>&1 REG.exe query "HKU\S-1-5-19" || (
    ECHO SET UAC = CreateObject^("Shell.Application"^) > "%TEMP%\Getadmin.vbs"
    ECHO UAC.ShellExecute "%~f0", "%1", "", "runas", 1 >> "%TEMP%\Getadmin.vbs"
    "%TEMP%\Getadmin.vbs"
    DEL /f /q "%TEMP%\Getadmin.vbs" 2>nul
    Exit /b
)
ECHO.
ECHO.==== green foobox ====
ECHO.
ECHO. 1 Register components (ShellExt and sacd decoder, if exist)
ECHO. 2 Create desktop shortcut
ECHO.---------------------------
ECHO. 3 Unregister components
ECHO. 4 Delete desktop shortcut
ECHO.---------------------------
ECHO. 5 Exit
ECHO.
echo. Input item number£º
set /p ID=
if "%ID%"=="1" call :cmd1
if "%ID%"=="2" call :cmd2
if "%ID%"=="3" call :cmd3
if "%ID%"=="4" call :cmd4
if "%ID%"=="5" call exit
set "ID="

:cmd1
regsvr32.exe "%~dp0ShellExt32.dll"
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (regsvr32.exe "%~dp0ShellExt64.dll")
if exist "%~dp0profile\user-components\foo_input_sacd\dsd_transcoder_x64.dll" (regsvr32.exe "%~dp0profile\user-components\foo_input_sacd\dsd_transcoder_x64.dll")
echo Press any key to return to menu
goto backtomenu

:cmd3
regsvr32.exe /u "%~dp0ShellExt32.dll"
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (regsvr32.exe /u "%~dp0ShellExt64.dll")
if exist "%~dp0profile\user-components\foo_input_sacd\dsd_transcoder_x64.dll" (regsvr32.exe /u "%~dp0profile\user-components\foo_input_sacd\dsd_transcoder_x64.dll")
echo Press any key to return to menu
goto backtomenu

:cmd2
set scname=foobar2000.lnk
set scpath=%~dp0
set scexec=%~dp0foobar2000.exe
mshta VBScript:Execute("Set a=CreateObject(""WScript.Shell""):Set b=a.CreateShortcut(a.SpecialFolders(""Desktop"") & ""\%scname%""):b.TargetPath=""%scexec%"":b.WorkingDirectory=""%scpath%"":b.Save:close")
echo Desktop shortcut created. Press any key to return to menu
goto backtomenu

:cmd4
ping -n 2 127.1>nul
del /f /q "%userprofile%"\Desktop\"foobar2000.lnk"
::del /f /q "%userprofile%"\×ÀÃæ\"foobar2000.lnk"
echo Desktop shortcut deleted. Press any key to return to menu
goto backtomenu

:backtomenu
PAUSE >NUL
GOTO MENU