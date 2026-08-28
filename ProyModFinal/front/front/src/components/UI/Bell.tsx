"use client";

import { useState, useRef } from 'react';
import { Bell as BellIcon, X } from "lucide-react";
import { useNotificationStore } from "@/stores/notificationStore";
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const Bell = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative text-white p-2 rounded-md hover:bg-white/10 transition-colors"
        aria-label="Notificaciones"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold text-gray-800">Notificaciones</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm p-4 text-center">No hay notificaciones.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {notifications.map(notif => (
                <li key={notif.id} className="p-3 hover:bg-gray-50">
                  <p className="font-semibold text-sm text-gray-800">{notif.title}</p>
                  <p className="text-xs text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(notif.createdAt, { addSuffix: true, locale: es })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};