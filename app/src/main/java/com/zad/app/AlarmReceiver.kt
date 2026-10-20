package com.zad.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val track = intent.getStringExtra(AlarmScheduler.EXTRA_TRACK) ?: "general"
        showNotification(context, track)
        // أعد جدولة تنبيه اليوم التالي
        AlarmScheduler.scheduleAll(context)
    }

    private fun showNotification(ctx: Context, track: String) {
        val channelId = "zad_daily"
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(channelId, "زاد اليومي", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "تذكير بموضوع اليوم"
            }
            nm.createNotificationChannel(ch)
        }

        val cyber = track == "cyber"
        val title = if (cyber) "زادك في الأمن السيبراني جاهز" else "زاد المساء بين يديك"
        val text = if (cyber)
            "موضوع اليوم في الأمن السيبراني ينتظرك. دقائق تقربك من هدفك."
        else
            "موضوع جديد يفتح لك باباً في المعرفة. اقرأه قبل النوم."

        val openIntent = Intent(ctx, MainActivity::class.java).apply {
            putExtra(AlarmScheduler.EXTRA_TRACK, track)
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pi = PendingIntent.getActivity(ctx, if (cyber) 11 else 22, openIntent, flags)

        val notif = NotificationCompat.Builder(ctx, channelId)
            .setSmallIcon(R.drawable.ic_notify)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setColor(if (cyber) 0xFF1F6F68.toInt() else 0xFFB78A2E.toInt())
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pi)
            .build()

        try {
            nm.notify(if (cyber) 101 else 102, notif)
        } catch (e: SecurityException) {
            // إذن الإشعارات غير ممنوح
        }
    }
}
