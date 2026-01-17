"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { toast } from "sonner";

export default function RealtimeNotifications({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return;

    // Debug Log: Check if keys exist
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY ;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!key || !cluster) {
      console.error("Pusher Keys missing in .env.local!");
      return;
    }

    // Connect
    // 'true' logs debug info to the browser console
    Pusher.logToConsole = false; 

    const pusher = new Pusher(key, {
      cluster: cluster,
    });

    // Subscribe
    const channelName = `user-${userId}`;
    const channel = pusher.subscribe(channelName);
    console.log(`Subscribed to channel: ${channelName}`);

    // Listen
    channel.bind("notification", (data: any) => {
      console.log("Event Received:", data); // Check console when booking
      
      // Play Sound
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(e => console.log("Audio play blocked"));

      toast(data.title, {
        description: data.message,
        duration: 5000,
        style: {
            background: '#1e293b',
            color: 'white',
            border: '1px solid #334155'
        }
      });
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [userId]);

  return null;
}