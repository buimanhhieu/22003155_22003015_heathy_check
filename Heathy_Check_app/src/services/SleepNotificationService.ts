import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lazy import để tránh lỗi khi module chưa sẵn sàng
let Notifications: any = null;

const getNotifications = async () => {
    if (!Notifications) {
        const NotifModule = await import('expo-notifications');
        // expo-notifications có thể export default hoặc named exports
        Notifications = NotifModule.default || NotifModule;

        // Cấu hình notification handler
        if (Notifications && Notifications.setNotificationHandler) {
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                }),
            });
        }
    }
    return Notifications;
};

export interface SleepSchedule {
    bedtime: string; // Format: "HH:mm"
    wakeup: string; // Format: "HH:mm"
}

class SleepNotificationService {
    private bedtimeNotificationId: string | null = null;
    private wakeupNotificationId: string | null = null;

    // Khởi tạo và yêu cầu quyền
    async initialize(): Promise<boolean> {
        try {
            const Notif = await getNotifications();

            // Yêu cầu quyền thông báo
            const { status: existingStatus } = await Notif.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notif.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Notification permission not granted');
                return false;
            }

            // Cấu hình notification channels cho Android
            if (Platform.OS === 'android') {
                // Channel cho bedtime (nhẹ nhàng hơn)
                await Notif.setNotificationChannelAsync('sleep-bedtime', {
                    name: 'Bedtime Reminder',
                    importance: Notif.AndroidImportance.HIGH,
                    vibrationPattern: [0, 500, 300, 500], // Rung nhẹ
                    lightColor: '#FF231F7C',
                    sound: 'default',
                    enableVibrate: true,
                });

                // Channel cho wakeup alarm (mạnh như báo thức)
                await Notif.setNotificationChannelAsync('sleep-wakeup', {
                    name: 'Wake Up Alarm',
                    importance: Notif.AndroidImportance.HIGH,
                    // Vibration pattern dài và mạnh như báo thức: rung 1s, nghỉ 0.5s, lặp lại nhiều lần
                    vibrationPattern: [0, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000],
                    lightColor: '#FF9800',
                    sound: 'default', // Sẽ dùng default alarm sound
                    enableVibrate: true,
                });
            }

            // Load và schedule lại các thông báo đã lưu
            await this.loadAndScheduleNotifications();

            return true;
        } catch (error) {
            console.error('Error initializing sleep notifications:', error);
            return false;
        }
    }

    // Lưu schedule vào AsyncStorage
    private async saveSchedule(schedule: SleepSchedule): Promise<void> {
        try {
            await AsyncStorage.setItem('sleepSchedule', JSON.stringify(schedule));
        } catch (error) {
            console.error('Error saving sleep schedule:', error);
        }
    }

    // Load schedule từ AsyncStorage
    private async loadSchedule(): Promise<SleepSchedule | null> {
        try {
            const scheduleString = await AsyncStorage.getItem('sleepSchedule');
            if (scheduleString) {
                return JSON.parse(scheduleString);
            }
            return null;
        } catch (error) {
            console.error('Error loading sleep schedule:', error);
            return null;
        }
    }

    // Lưu notification IDs
    private async saveNotificationIds(): Promise<void> {
        try {
            const ids = {
                bedtime: this.bedtimeNotificationId,
                wakeup: this.wakeupNotificationId,
            };
            await AsyncStorage.setItem('sleepNotificationIds', JSON.stringify(ids));
        } catch (error) {
            console.error('Error saving notification IDs:', error);
        }
    }

    // Load notification IDs
    private async loadNotificationIds(): Promise<{ bedtime: string | null; wakeup: string | null }> {
        try {
            const idsString = await AsyncStorage.getItem('sleepNotificationIds');
            if (idsString) {
                return JSON.parse(idsString);
            }
            return { bedtime: null, wakeup: null };
        } catch (error) {
            console.error('Error loading notification IDs:', error);
            return { bedtime: null, wakeup: null };
        }
    }

    // Hủy tất cả thông báo cũ
    private async cancelExistingNotifications(): Promise<void> {
        try {
            const Notif = await getNotifications();
            const ids = await this.loadNotificationIds();

            if (ids.bedtime) {
                try {
                    await Notif.cancelScheduledNotificationAsync(ids.bedtime);
                    console.log(`[SleepNotification] Canceled bedtime notification: ${ids.bedtime}`);
                } catch (error) {
                    console.warn(`[SleepNotification] Could not cancel bedtime notification ${ids.bedtime}:`, error);
                }
            }
            if (ids.wakeup) {
                try {
                    await Notif.cancelScheduledNotificationAsync(ids.wakeup);
                    console.log(`[SleepNotification] Canceled wakeup notification: ${ids.wakeup}`);
                } catch (error) {
                    console.warn(`[SleepNotification] Could not cancel wakeup notification ${ids.wakeup}:`, error);
                }
            }

            // Hủy tất cả notifications liên quan đến sleep để đảm bảo không còn notification cũ
            try {
                const allNotifications = await Notif.getAllScheduledNotificationsAsync();
                console.log(`[SleepNotification] Found ${allNotifications.length} scheduled notifications`);
                let canceledCount = 0;
                for (const notif of allNotifications) {
                    const notifContent = notif.content as any;
                    const title = notifContent?.title || '';
                    if (title.includes('giờ đi ngủ') || title.includes('giờ thức dậy') ||
                        title.includes('Đã đến giờ đi ngủ') || title.includes('Đã đến giờ thức dậy')) {
                        try {
                            await Notif.cancelScheduledNotificationAsync(notif.identifier);
                            canceledCount++;
                            console.log(`[SleepNotification] Canceled old sleep notification: ${notif.identifier} - ${title}`);
                        } catch (cancelError) {
                            console.warn(`[SleepNotification] Could not cancel notification ${notif.identifier}:`, cancelError);
                        }
                    }
                }
                console.log(`[SleepNotification] Canceled ${canceledCount} old sleep notifications`);
            } catch (error) {
                console.warn('[SleepNotification] Error canceling all sleep notifications:', error);
            }

            // KHÔNG hủy tất cả notifications vì có thể ảnh hưởng đến notifications khác
            // Chỉ hủy các notifications liên quan đến sleep
        } catch (error) {
            console.error('[SleepNotification] Error canceling existing notifications:', error);
        }
    }

    // Tính toán thời gian trigger cho notification
    private calculateTriggerTime(timeString: string, isBedtime: boolean = false): Date {
        const [hours, minutes] = timeString.split(':').map(Number);
        const now = new Date();
        const trigger = new Date();
        trigger.setHours(hours, minutes, 0, 0);
        trigger.setSeconds(0);
        trigger.setMilliseconds(0);

        // Nếu thời gian đã qua trong ngày hôm nay, schedule cho ngày mai
        if (trigger.getTime() <= now.getTime()) {
            trigger.setDate(trigger.getDate() + 1);
        }

        console.log(`[SleepNotification] Scheduling ${isBedtime ? 'bedtime' : 'wakeup'} notification for:`, {
            timeString,
            triggerTime: trigger.toLocaleString('vi-VN'),
            hours,
            minutes,
        });

        return trigger;
    }

    // Lên lịch thông báo đi ngủ
    private async scheduleBedtimeNotification(bedtime: string): Promise<string | null> {
        try {
            const Notif = await getNotifications();
            const [hours, minutes] = bedtime.split(':').map(Number);

            // Tính toán thời gian hiện tại
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentSecond = now.getSeconds();

            // Tính toán thời gian trigger cho hôm nay
            const todayTrigger = new Date();
            todayTrigger.setHours(hours, minutes, 0, 0);
            todayTrigger.setSeconds(0);
            todayTrigger.setMilliseconds(0);

            // Tính khoảng cách thời gian (milliseconds)
            let timeDiff = todayTrigger.getTime() - now.getTime();

            const notificationConfig: any = {
                content: {
                    title: '🛏️ Đã đến giờ đi ngủ',
                    body: `Đã đến ${bedtime} - Hãy chuẩn bị đi ngủ để có một giấc ngủ ngon!`,
                    sound: true,
                    priority: Notif.AndroidNotificationPriority.HIGH,
                },
            };

            // Android: sử dụng channelId
            if (Platform.OS === 'android') {
                notificationConfig.content.channelId = 'sleep-bedtime';
            }

            // QUAN TRỌNG: Kiểm tra kỹ để tránh trigger ngay
            // Tăng threshold lên 15 phút để đảm bảo không trigger ngay
            // Nếu thời gian đã qua hôm nay HOẶC quá gần (<= 15 phút), schedule cho ngày mai
            const MIN_DELAY_MS = 900000; // 15 phút
            const isPastOrTooClose = timeDiff <= MIN_DELAY_MS;

            if (isPastOrTooClose) {
                // Đã qua hoặc quá gần - schedule cho ngày mai bằng date trigger
                const tomorrowTrigger = new Date();
                tomorrowTrigger.setDate(tomorrowTrigger.getDate() + 1);
                tomorrowTrigger.setHours(hours, minutes, 0, 0);
                tomorrowTrigger.setSeconds(0);
                tomorrowTrigger.setMilliseconds(0);

                notificationConfig.trigger = {
                    date: tomorrowTrigger,
                    repeats: false,
                };

                console.warn(`[SleepNotification] Bedtime ${bedtime} is ${timeDiff <= 0 ? 'past' : 'too close'} (current: ${currentHour}:${currentMinute}:${currentSecond}, diff: ${Math.round(timeDiff / 60000)} min), scheduling for tomorrow at ${tomorrowTrigger.toLocaleString('vi-VN')}`);
            } else {
                // Đủ xa trong tương lai (hơn 15 phút) - schedule cho hôm nay
                notificationConfig.trigger = {
                    date: todayTrigger,
                    repeats: false,
                };

                console.log(`[SleepNotification] Scheduled bedtime notification for today at ${todayTrigger.toLocaleString('vi-VN')} (in ${Math.round(timeDiff / 60000)} minutes)`);
            }

            // Chỉ schedule 1 notification - đảm bảo không duplicate
            const notificationId = await Notif.scheduleNotificationAsync(notificationConfig);
            console.log(`[SleepNotification] Bedtime notification scheduled with ID: ${notificationId}, trigger: ${JSON.stringify(notificationConfig.trigger)}`);

            return notificationId;
        } catch (error) {
            console.error('[SleepNotification] Error scheduling bedtime notification:', error);
            return null;
        }
    }

    // Lên lịch thông báo thức dậy - dạng báo thức với rung và chuông mạnh
    private async scheduleWakeupNotification(wakeup: string): Promise<string | null> {
        try {
            const Notif = await getNotifications();
            const [hours, minutes] = wakeup.split(':').map(Number);

            // Tính toán thời gian hiện tại
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentSecond = now.getSeconds();

            // Tính toán thời gian trigger cho hôm nay
            const todayTrigger = new Date();
            todayTrigger.setHours(hours, minutes, 0, 0);
            todayTrigger.setSeconds(0);
            todayTrigger.setMilliseconds(0);

            // Tính khoảng cách thời gian (milliseconds)
            let timeDiff = todayTrigger.getTime() - now.getTime();

            const notificationConfig: any = {
                content: {
                    title: '☀️ Đã đến giờ thức dậy',
                    body: `Đã đến ${wakeup} - Chúc bạn một ngày mới tràn đầy năng lượng!`,
                    sound: true,
                    priority: Notif.AndroidNotificationPriority.HIGH,
                },
            };

            // Android: sử dụng channelId riêng cho wakeup alarm với vibration mạnh
            if (Platform.OS === 'android') {
                notificationConfig.content.channelId = 'sleep-wakeup';
            }

            // QUAN TRỌNG: Kiểm tra kỹ để tránh trigger ngay
            // Tăng threshold lên 15 phút để đảm bảo không trigger ngay
            // Nếu thời gian đã qua hôm nay HOẶC quá gần (<= 15 phút), schedule cho ngày mai
            const MIN_DELAY_MS = 900000; // 15 phút
            const isPastOrTooClose = timeDiff <= MIN_DELAY_MS;

            if (isPastOrTooClose) {
                // Đã qua hoặc quá gần - schedule cho ngày mai bằng date trigger
                const tomorrowTrigger = new Date();
                tomorrowTrigger.setDate(tomorrowTrigger.getDate() + 1);
                tomorrowTrigger.setHours(hours, minutes, 0, 0);
                tomorrowTrigger.setSeconds(0);
                tomorrowTrigger.setMilliseconds(0);

                notificationConfig.trigger = {
                    date: tomorrowTrigger,
                    repeats: false,
                };

                console.warn(`[SleepNotification] Wakeup ${wakeup} is ${timeDiff <= 0 ? 'past' : 'too close'} (current: ${currentHour}:${currentMinute}:${currentSecond}, diff: ${Math.round(timeDiff / 60000)} min), scheduling for tomorrow at ${tomorrowTrigger.toLocaleString('vi-VN')}`);
            } else {
                // Đủ xa trong tương lai (hơn 15 phút) - schedule cho hôm nay
                notificationConfig.trigger = {
                    date: todayTrigger,
                    repeats: false,
                };

                console.log(`[SleepNotification] Scheduled wakeup notification for today at ${todayTrigger.toLocaleString('vi-VN')} (in ${Math.round(timeDiff / 60000)} minutes)`);
            }

            // Chỉ schedule 1 notification - đảm bảo không duplicate
            const notificationId = await Notif.scheduleNotificationAsync(notificationConfig);
            console.log(`[SleepNotification] Wakeup notification scheduled with ID: ${notificationId}, trigger: ${JSON.stringify(notificationConfig.trigger)}`);

            return notificationId;
        } catch (error) {
            console.error('[SleepNotification] Error scheduling wakeup notification:', error);
            return null;
        }
    }

    // Cập nhật schedule và lên lịch lại thông báo
    async updateSchedule(schedule: SleepSchedule): Promise<boolean> {
        try {
            // Validate schedule
            if (!schedule.bedtime || !schedule.wakeup) {
                console.error('[SleepNotification] Invalid schedule:', schedule);
                return false;
            }

            // Kiểm tra xem bedtime và wakeup có khác nhau không
            if (schedule.bedtime === schedule.wakeup) {
                console.warn('[SleepNotification] Bedtime and wakeup cannot be the same time');
                return false;
            }

            console.log('[SleepNotification] Updating schedule:', schedule);

            // Hủy thông báo cũ trước - đảm bảo hủy hết
            console.log('[SleepNotification] Step 1: Canceling existing notifications...');
            await this.cancelExistingNotifications();

            // Đợi lâu hơn để đảm bảo notifications cũ đã được hủy hoàn toàn
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Kiểm tra lại xem đã hủy hết chưa - kiểm tra nhiều lần để đảm bảo
            for (let i = 0; i < 3; i++) {
                try {
                    const Notif = await getNotifications();
                    const remainingNotifications = await Notif.getAllScheduledNotificationsAsync();
                    const sleepNotifications = remainingNotifications.filter((notif: any) => {
                        const title = notif.content?.title || '';
                        return title.includes('giờ đi ngủ') || title.includes('giờ thức dậy') ||
                            title.includes('Đã đến giờ đi ngủ') || title.includes('Đã đến giờ thức dậy');
                    });
                    if (sleepNotifications.length > 0) {
                        console.warn(`[SleepNotification] Attempt ${i + 1}: Still found ${sleepNotifications.length} sleep notifications, canceling again...`);
                        for (const notif of sleepNotifications) {
                            try {
                                await Notif.cancelScheduledNotificationAsync(notif.identifier);
                                console.log(`[SleepNotification] Canceled notification: ${notif.identifier}`);
                            } catch (cancelError) {
                                console.warn(`[SleepNotification] Could not cancel ${notif.identifier}:`, cancelError);
                            }
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        console.log(`[SleepNotification] All sleep notifications canceled successfully after ${i + 1} attempt(s)`);
                        break;
                    }
                } catch (error) {
                    console.warn(`[SleepNotification] Error checking remaining notifications (attempt ${i + 1}):`, error);
                }
            }

            // Lên lịch thông báo mới - đảm bảo schedule riêng biệt
            console.log('[SleepNotification] Step 2: Scheduling new notifications...');

            // Schedule bedtime notification (chỉ 1 lần)
            this.bedtimeNotificationId = await this.scheduleBedtimeNotification(schedule.bedtime);
            await new Promise(resolve => setTimeout(resolve, 500)); // Đợi giữa các notification

            // Schedule wakeup notification (chỉ 1 lần)
            this.wakeupNotificationId = await this.scheduleWakeupNotification(schedule.wakeup);
            await new Promise(resolve => setTimeout(resolve, 500)); // Đợi sau khi schedule xong

            // Lưu schedule và notification IDs
            await this.saveSchedule(schedule);
            await this.saveNotificationIds();

            console.log('[SleepNotification] ✅ Sleep notifications scheduled successfully:', {
                bedtime: schedule.bedtime,
                wakeup: schedule.wakeup,
                bedtimeId: this.bedtimeNotificationId,
                wakeupId: this.wakeupNotificationId,
            });

            return true;
        } catch (error) {
            console.error('[SleepNotification] ❌ Error updating sleep schedule:', error);
            return false;
        }
    }

    // Load và schedule lại các thông báo đã lưu
    private async loadAndScheduleNotifications(): Promise<void> {
        try {
            const schedule = await this.loadSchedule();
            if (schedule && schedule.bedtime && schedule.wakeup) {
                // Chỉ load và schedule lại nếu có schedule hợp lệ
                // KHÔNG gọi updateSchedule để tránh duplicate scheduling
                // Chỉ schedule lại nếu chưa có notifications
                const ids = await this.loadNotificationIds();
                if (!ids.bedtime || !ids.wakeup) {
                    console.log('[SleepNotification] No existing notifications found, scheduling from saved schedule');
                    await this.updateSchedule(schedule);
                } else {
                    console.log('[SleepNotification] Existing notifications found, skipping auto-schedule');
                }
            }
        } catch (error) {
            console.error('Error loading and scheduling notifications:', error);
        }
    }

    // Hủy tất cả thông báo
    async cancelAllNotifications(): Promise<void> {
        try {
            await this.cancelExistingNotifications();
            this.bedtimeNotificationId = null;
            this.wakeupNotificationId = null;
            await AsyncStorage.removeItem('sleepNotificationIds');
            await AsyncStorage.removeItem('sleepSchedule');
        } catch (error) {
            console.error('Error canceling all notifications:', error);
        }
    }

    // Lấy schedule hiện tại
    async getCurrentSchedule(): Promise<SleepSchedule | null> {
        return await this.loadSchedule();
    }
}

export const sleepNotificationService = new SleepNotificationService();

