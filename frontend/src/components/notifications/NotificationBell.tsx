import React, { useEffect, useState, useRef, useCallback } from "react";
import type { Notificacion } from "../../types";
import {
  fetchNotificaciones,
  countUnread,
  markAsRead,
  markAllAsRead,
} from "../../services/notificacionesService";
import { supabase } from "../../supabaseClient";

interface Props {
  userId: string;
}

const TIPO_ICONS: Record<string, string> = {
  postulacion: "\uD83D\uDCE9",
  mensaje: "\uD83D\uDCAC",
  aceptacion: "\u2705",
  rechazo: "\u274C",
  pago: "\uD83D\uDCB0",
  sistema: "\u2699\uFE0F",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
  return new Date(dateStr).toLocaleDateString("es-CL");
}

const NotificationBell: React.FC<Props> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [items, count] = await Promise.all([
        fetchNotificaciones(userId),
        countUnread(userId),
      ]);
      setNotifications(items);
      setUnreadCount(count);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscription for new notifications
  useEffect(() => {
    const channel = supabase
      .channel(`notificaciones:${userId}`)
      .on(
        "postgres_changes" as never,
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
          filter: `usuario_id=eq.${userId}`,
        } as never,
        (payload: { new: Record<string, unknown> }) => {
          const newNotif = payload.new as unknown as Notificacion;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-grey-600 hover:bg-grey-100 hover:text-primary transition-colors"
        aria-label="Notificaciones"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-error rounded-full leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-grey-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-grey-100 bg-grey-50">
            <h3 className="text-sm font-semibold text-dark">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Marcar todas como le&iacute;das
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto divide-y divide-grey-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-grey-400 text-sm">
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => {
                    if (!notif.leida) handleMarkAsRead(notif.id);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-grey-50 ${
                    !notif.leida ? "bg-indigo/5" : ""
                  }`}
                >
                  {/* Icon */}
                  <span className="text-lg mt-0.5 flex-shrink-0">
                    {TIPO_ICONS[notif.tipo] || "\uD83D\uDD14"}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        !notif.leida
                          ? "font-semibold text-dark"
                          : "text-grey-700"
                      }`}
                    >
                      {notif.titulo}
                    </p>
                    {notif.mensaje && (
                      <p className="text-xs text-grey-500 mt-0.5 line-clamp-2">
                        {notif.mensaje}
                      </p>
                    )}
                    <p className="text-[11px] text-grey-400 mt-1">
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.leida && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
