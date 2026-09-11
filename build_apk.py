import os
import sys
import shutil
import zipfile
import subprocess
from PIL import Image, ImageDraw, ImageFont

# Define Toolchain Paths
JAVA_HOME = r"C:\Program Files\Android\Android Studio\jbr"
JAVAC = r"C:\Program Files\Android\Android Studio\jbr\bin\javac.exe"
KEYTOOL = r"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
SDK_DIR = r"C:\Users\user\AppData\Local\Android\Sdk"
ANDROID_JAR = os.path.join(SDK_DIR, r"platforms\android-37.0\android.jar")
BUILD_TOOLS = os.path.join(SDK_DIR, r"build-tools\37.0.0")

AAPT2 = os.path.join(BUILD_TOOLS, "aapt2.exe")
D8 = os.path.join(BUILD_TOOLS, "d8.bat")
ZIPALIGN = os.path.join(BUILD_TOOLS, "zipalign.exe")
APKSIGNER = os.path.join(BUILD_TOOLS, "apksigner.bat")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.join(BASE_DIR, "android_project")
BUILD_DIR = os.path.join(BASE_DIR, "build_tmp")

def setup_project_files():
    print("[1/7] Setting up Android project structure...")
    os.makedirs(PROJECT_DIR, exist_ok=True)
    os.makedirs(os.path.join(PROJECT_DIR, "res", "values"), exist_ok=True)
    os.makedirs(os.path.join(PROJECT_DIR, "res", "mipmap-hdpi"), exist_ok=True)
    os.makedirs(os.path.join(PROJECT_DIR, "res", "mipmap-xhdpi"), exist_ok=True)
    os.makedirs(os.path.join(PROJECT_DIR, "res", "mipmap-xxhdpi"), exist_ok=True)
    os.makedirs(os.path.join(PROJECT_DIR, "src", "com", "gameguardian", "guide"), exist_ok=True)
    os.makedirs(os.path.join(PROJECT_DIR, "assets"), exist_ok=True)

    # 1. AndroidManifest.xml
    manifest_content = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.gameguardian.guide"
    android:versionCode="100"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="GameGuardian Guide"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar"
        android:hardwareAccelerated="true">

        <activity
            android:name="com.gameguardian.guide.MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>"""

    with open(os.path.join(PROJECT_DIR, "AndroidManifest.xml"), "w", encoding="utf-8") as f:
        f.write(manifest_content)

    # 2. Strings & Values
    strings_content = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">GameGuardian Guide</string>
</resources>"""
    with open(os.path.join(PROJECT_DIR, "res", "values", "strings.xml"), "w", encoding="utf-8") as f:
        f.write(strings_content)

    # 3. MainActivity.java
    java_code = """package com.gameguardian.guide;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

public class MainActivity extends Activity {
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Dark Theme Status Bar Color
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(0xFF07090E);

        mWebView = new WebView(this);
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setBuiltInZoomControls(false);

        mWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        mWebView.setWebViewClient(new WebViewClient());
        mWebView.setWebChromeClient(new WebChromeClient());

        mWebView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}"""
    with open(os.path.join(PROJECT_DIR, "src", "com", "gameguardian", "guide", "MainActivity.java"), "w", encoding="utf-8") as f:
        f.write(java_code)

    # 4. Copy Web Assets to Assets Folder
    assets_dir = os.path.join(PROJECT_DIR, "assets")
    for file_name in ["index.html", "style.css", "app.js"]:
        src_path = os.path.join(BASE_DIR, file_name)
        if os.path.exists(src_path):
            shutil.copy(src_path, os.path.join(assets_dir, file_name))

    # 5. Generate Icon (PNG)
    generate_app_icon(os.path.join(PROJECT_DIR, "res", "mipmap-hdpi", "ic_launcher.png"), 72)
    generate_app_icon(os.path.join(PROJECT_DIR, "res", "mipmap-xhdpi", "ic_launcher.png"), 96)
    generate_app_icon(os.path.join(PROJECT_DIR, "res", "mipmap-xxhdpi", "ic_launcher.png"), 144)

def generate_app_icon(path, size):
    img = Image.new("RGBA", (size, size), (7, 9, 14, 255))
    draw = ImageDraw.Draw(img)
    margin = int(size * 0.15)
    # Outer Glow / Border
    draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=int(size * 0.2), fill=(16, 22, 36, 255), outline=(0, 242, 254, 255), width=int(size*0.04))
    # Shield / GG Icon Symbol
    cx, cy = size / 2, size / 2
    r = size * 0.22
    draw.polygon([(cx, cy - r), (cx + r, cy - r*0.5), (cx + r*0.8, cy + r*0.7), (cx, cy + r), (cx - r*0.8, cy + r*0.7), (cx - r, cy - r*0.5)], fill=(0, 242, 254, 255))
    img.save(path)

def get_env():
    env = os.environ.copy()
    env["JAVA_HOME"] = JAVA_HOME
    env["PATH"] = os.path.join(JAVA_HOME, "bin") + ";" + env.get("PATH", "")
    return env

def build_apk():
    os.makedirs(BUILD_DIR, exist_ok=True)
    env = get_env()

    # 1. AAPT2 Compile
    print("[2/7] Compiling Android Resources with AAPT2...")
    compiled_res = os.path.join(BUILD_DIR, "compiled_res.zip")
    res_dir = os.path.join(PROJECT_DIR, "res")
    cmd_compile = [AAPT2, "compile", "--dir", res_dir, "-o", compiled_res]
    subprocess.check_call(cmd_compile, env=env)

    # 2. AAPT2 Link
    print("[3/7] Linking Resources & Manifest with AAPT2...")
    base_apk = os.path.join(BUILD_DIR, "base.apk")
    manifest = os.path.join(PROJECT_DIR, "AndroidManifest.xml")
    gen_dir = os.path.join(BUILD_DIR, "gen")
    os.makedirs(gen_dir, exist_ok=True)
    cmd_link = [
        AAPT2, "link", "-o", base_apk,
        "-I", ANDROID_JAR,
        "--manifest", manifest,
        "--java", gen_dir,
        compiled_res
    ]
    subprocess.check_call(cmd_link, env=env)

    # 3. Java Compile
    print("[4/7] Compiling Java Source Files with javac...")
    classes_dir = os.path.join(BUILD_DIR, "classes")
    os.makedirs(classes_dir, exist_ok=True)
    java_file = os.path.join(PROJECT_DIR, "src", "com", "gameguardian", "guide", "MainActivity.java")
    cmd_javac = [
        JAVAC, "-cp", ANDROID_JAR,
        "-d", classes_dir,
        java_file
    ]
    subprocess.check_call(cmd_javac, env=env)

    # 4. D8 Compile Classes to DEX
    print("[5/7] Converting Java Classes to DEX bytecode with D8...")
    class_file = os.path.join(classes_dir, "com", "gameguardian", "guide", "MainActivity.class")
    dex_dir = os.path.join(BUILD_DIR, "dex")
    os.makedirs(dex_dir, exist_ok=True)
    cmd_d8 = [
        D8, "--lib", ANDROID_JAR,
        "--output", dex_dir,
        class_file
    ]
    subprocess.check_call(cmd_d8, env=env)

    # 5. Pack DEX and Assets into base.apk
    print("[6/7] Bundling classes.dex & web assets into APK...")
    dex_file = os.path.join(dex_dir, "classes.dex")
    assets_dir = os.path.join(PROJECT_DIR, "assets")

    with zipfile.ZipFile(base_apk, "a") as z:
        z.write(dex_file, "classes.dex")
        for root, dirs, files in os.walk(assets_dir):
            for f in files:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, assets_dir)
                z.write(full_path, f"assets/{rel_path}")

    # 6. Zipalign & Sign
    print("[7/7] ZipAligning & Signing Android APK...")
    aligned_apk = os.path.join(BASE_DIR, "GameGuardianGuide.apk")
    cmd_zipalign = [ZIPALIGN, "-f", "4", base_apk, aligned_apk]
    subprocess.check_call(cmd_zipalign, env=env)

    # Keytool Debug Keystore
    keystore = os.path.join(BUILD_DIR, "debug.keystore")
    if not os.path.exists(keystore):
        cmd_keytool = [
            KEYTOOL, "-genkeypair", "-keystore", keystore,
            "-storepass", "android", "-alias", "androiddebugkey",
            "-keypass", "android", "-keyalg", "RSA", "-keysize", "2048",
            "-validity", "10000", "-dname", "CN=Android Debug,O=Android,C=US"
        ]
        subprocess.check_call(cmd_keytool, env=env)

    cmd_sign = [
        APKSIGNER, "sign",
        "--ks", keystore,
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        "--ks-key-alias", "androiddebugkey",
        aligned_apk
    ]
    subprocess.check_call(cmd_sign, env=env)

    print("\n==================================================")
    print("SUCCESS! Android APK generated successfully:")
    print("File Path:", aligned_apk)
    print("==================================================")

if __name__ == "__main__":
    setup_project_files()
    build_apk()
