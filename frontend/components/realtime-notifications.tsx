"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RealtimeNotifications({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!key || !cluster) {
      console.error("Pusher Keys missing in .env.local!");
      return;
    }

    
    Pusher.logToConsole = process.env.NODE_ENV === 'development'; 

    const pusher = new Pusher(key, {
      cluster: cluster,
    });

    const channelName = `user-${userId}`;
    const channel = pusher.subscribe(channelName);

    // Bind to the notification event
    channel.bind("notification", (data: any) => {
      // 1. UPDATE SIDEBAR BADGE
      window.dispatchEvent(new Event("new-notification"));
      router.refresh();

      // 3. PLAY NOTIFICATION SOUND
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(() => console.log("Audio playback was prevented by browser policy."));

      // 4. SHOW TOAST
      toast.success(data.title, {
        description: data.message,
        duration: 8000,
        // ACTION BUTTON ON THE TOAST
        action: {
          label: "View Now",
          onClick: () => {
            const role = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).role.toLowerCase() : "";
            if (data.type === "APPOINTMENT") router.push(`/dashboard/${role}/appointments`);
            if (data.type === "CASE") router.push(`/dashboard/${role}/cases/${data.referenceId}`);
          }
        },
        style: { background: '#0f172a', color: '#fff' }
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId, router]);

  return null;
}