import { useEffect } from "react";
import { supabase } from "../supabaseClient";

interface RealtimeOptions {
  channelName: string;
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onEvent: (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => void;
}

export function useRealtimeSubscription({
  channelName,
  table,
  event = "*",
  filter,
  onEvent,
}: RealtimeOptions) {
  useEffect(() => {
    const channelConfig: Record<string, unknown> = {
      event,
      schema: "public",
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as never,
        channelConfig as never,
        (payload: unknown) => onEvent(payload as { new: Record<string, unknown>; old: Record<string, unknown> })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, table, event, filter]);
}
