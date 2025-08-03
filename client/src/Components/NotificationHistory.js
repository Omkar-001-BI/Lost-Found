import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Stack, Typography, Button, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const NotificationHistory = () => {
  const user = JSON.parse(window.localStorage.getItem('user'));
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    if (user?._id) {
      setLoading(true);
      api.get(`/notifications/${user._id}`)
        .then(res => {
          setNotifications(res.data.notifications || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [user?._id]);

  const handleClearAll = async () => {
    if (user?._id) {
      await api.delete(`/notifications/user/${user._id}`);
      setNotifications([]);
    }
  };

  if (!user) return <Typography>Please log in to view your notification history.</Typography>;

  return (
    <Stack alignItems="center" spacing={3} pt={5}>
      <Typography variant="h4" color="primary">Notification History</Typography>
      <Button
        variant="outlined"
        color="error"
        disabled={notifications.length === 0}
        onClick={handleClearAll}
      >
        Clear All
      </Button>
      {loading ? (
        <CircularProgress />
      ) : notifications.length === 0 ? (
        <Typography>No notifications yet.</Typography>
      ) : (
        <Stack spacing={2} width="100%" maxWidth={600}>
          {notifications.map(n => (
            <Stack key={n._id} direction="row" spacing={2} alignItems="center" sx={{ background: n.isRead ? '#f5f5f5' : '#e3f2fd', borderRadius: 2, p: 2 }}>
              <Stack flex={1}>
                <Typography fontSize="16px">{n.message}</Typography>
                <Typography variant="caption" color="text.secondary">{new Date(n.createdAt).toLocaleString()}</Typography>
              </Stack>
              {n.itemId && n.itemName && n.itemType && (
                <Button size="small" component={Link} to={`/${n.itemName}?cid=${n.itemId}&type=${n.itemType}/false`}>
                  View
                </Button>
              )}
            </Stack>
          ))}
        </Stack>
      )}
      <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
        Back
      </Button>
    </Stack>
  );
};

export default NotificationHistory;