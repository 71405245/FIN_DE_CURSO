@echo off
echo ==================================================
echo   Iniciando SonarQube con Java 17 (Compatible)
echo ==================================================

set SONAR_JAVA_PATH=C:\sonarqube\jdk17\jdk-17.0.11+9\bin\java.exe

echo SONAR_JAVA_PATH=%SONAR_JAVA_PATH%
echo.

call C:\sonarqube\sonarqube-10.7.0.96327\bin\windows-x86-64\StartSonar.bat
