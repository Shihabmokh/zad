package com.zad.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

/** يجدول تنبيهين يوميين: الأمن السيبراني صباحاً، والمعرفة العامة مساءً. */
object AlarmScheduler {
    const val PREFS = "zad_prefs"
    const val KEY_MORNING = "morning"   // "HH:mm"
    const val KEY_EVENING = "evening"
    const val EXTRA_TRACK = "track"      // "cyber" | "general"

    private const val REQ_MORNING = 1001
    private const val REQ_EVENING = 1002

    fun saveTimes(ctx: Context, morning: String, evening: String) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString(KEY_MORNING, morning)
            .putString(KEY_EVENING, evening)
            .apply()
    }

    fun scheduleAll(ctx: Context) {
        val p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val morning = p.getString(KEY_MORNING, "11:00") ?: "11:00"
        val evening = p.getString(KEY_EVENING, "22:00") ?: "22:00"
        schedule(ctx, morning, "cyber", REQ_MORNING)
        schedule(ctx, evening, "general", REQ_EVENING)
    }

    private fun schedule(ctx: Context, hhmm: String, track: String, req: Int) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val parts = hhmm.split(":")
        val hour = parts.getOrNull(0)?.toIntOrNull() ?: 11
        val min = parts.getOrNull(1)?.toIntOrNull() ?: 0

        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, min)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= System.currentTimeMillis()) add(Calendar.DAY_OF_MONTH, 1)
        }

        val intent = Intent(ctx, AlarmReceiver::class.java).apply {
            putExtra(EXTRA_TRACK, track)
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pi = PendingIntent.getBroadcast(ctx, req, intent, flags)

        // تنبيه لمرة واحدة يُعاد جدولته عند إطلاقه (يتجنّب إذن التنبيه الدقيق)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.timeInMillis, pi)
        } else {
            am.set(AlarmManager.RTC_WAKEUP, cal.timeInMillis, pi)
        }
    }
}
