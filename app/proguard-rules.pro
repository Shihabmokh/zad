# الإبقاء على واجهة الجسر بين JavaScript وأندرويد
-keepclassmembers class com.zad.app.MainActivity$Bridge {
    @android.webkit.JavascriptInterface <methods>;
}
