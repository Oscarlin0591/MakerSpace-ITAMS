import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { getItems } from '../service/item_service';
import { useNotifications } from '../contexts/notifications';
import { API_BASE_URL } from '../types';

/**
 * Renders nothing — exists only to drive low-stock toasts from any page.
 * Mounted once inside BrowserRouter so it can navigate and receive SSE events
 * regardless of which route the user is currently viewing.
 */
export function NotificationListener() {
  const { syncNotifications } = useNotifications();
  const navigate = useNavigate();
  const [cookies] = useCookies(['token']);

  useEffect(() => {
    const token = cookies.token as string | undefined;
    if (!token) return;

    // Fetches current items, runs threshold check, and fires toasts for any new
    // crossings. syncNotifications deduplicates so repeated calls never re-toast
    // an item that already has an active or ignored notification.
    const checkAndToast = async () => {
      try {
        const items = await getItems();
        const toToast = syncNotifications(items);
        toToast.forEach((item) => {
          const id = `low-stock-${item.itemID}`;
          toast.warn(
            `Low stock: "${item.itemName}" is at ${item.quantity} (threshold: ${item.lowThreshold})`,
            {
              toastId: id,
              // Clicking the toast body (not ✕) dismisses it and opens the notification page
              onClick: () => {
                toast.dismiss(id);
                navigate('/notifications');
              },
              style: { cursor: 'pointer' },
            },
          );
        });
      } catch (err) {
        console.error('Notification check failed:', err);
      }
    };

    // Run once on app load to catch any items already below threshold
    checkAndToast();

    // Open an SSE stream so inventory_item changes trigger an immediate re-check.
    // This is what makes toasts fire the moment a quantity drops, not just on page load.
    const eventSource = new EventSource(
      `${API_BASE_URL}/events?token=${encodeURIComponent(token)}`,
    );

    eventSource.addEventListener('inventory_change', () => {
      checkAndToast();
    });

    eventSource.onerror = (err) => {
      console.error('Notification SSE error:', err);
    };

    // Close the stream on logout (token clears) or unmount
    return () => eventSource.close();
  }, [cookies.token, syncNotifications, navigate]);

  return null;
}
