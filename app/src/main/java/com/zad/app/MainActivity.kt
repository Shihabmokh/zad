package com.zad.app

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts

class MainActivity : ComponentActivity() {

    private lateinit var web: WebView
    private var pendingTrack: String? = null
    private var pageReady = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // اطلب إذن الإشعارات على أندرويد 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerForActivityResult(ActivityResultContracts.RequestPermission()) {}
                .launch(android.Manifest.permission.POST_NOTIFICATIONS)
        }

        web = WebView(this)
        setContentView(web)

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
            textZoom = 100
            mediaPlaybackRequiresUserGesture = false
        }
        WebView.setWebContentsDebuggingEnabled(false)

        web.addJavascriptInterface(Bridge(), "AndroidBridge")

        web.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                pageReady = true
                pendingTrack?.let { openTrack(it); pendingTrack = null }
            }
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                // اترك روابط الويب الخارجية للمتصفح
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    try { startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))) } catch (_: Exception) {}
                    return true
                }
                return false
            }
        }

        web.loadUrl("file:///android_asset/www/index.html")

        handleIntent(intent)

        // جدولة مبدئية بالقيم الافتراضية إن لم تُضبط بعد
        AlarmScheduler.scheduleAll(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val track = intent?.getStringExtra(AlarmScheduler.EXTRA_TRACK) ?: return
        if (pageReady) openTrack(track) else pendingTrack = track
    }

    private fun openTrack(track: String) {
        web.evaluateJavascript("window.ZadOpen && window.ZadOpen('$track');", null)
    }

    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }

    /** الجسر: JavaScript يستدعي AndroidBridge.setAlarms(...) */
    inner class Bridge {
        @JavascriptInterface
        fun setAlarms(morning: String, evening: String) {
            AlarmScheduler.saveTimes(applicationContext, morning, evening)
            AlarmScheduler.scheduleAll(applicationContext)
        }
    }
}
