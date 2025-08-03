import React, { useEffect, useState } from "react";
import { Stack, Typography, Button, Box, Card, CardContent, useTheme, Chip, Avatar, Divider } from '@mui/material';
import { Search, ReportProblem, Chat, TrendingUp, People, VerifiedUser, EmojiEvents, Category, LocationOn, AccessTime } from '@mui/icons-material';
import { motion } from 'framer-motion';
import lostImg from '../img/lost.svg';
import featureImg from '../img/feature.svg';
import mailImg from '../img/mail.svg';
import listItemImg from '../img/list-item.svg';
import notificationImg from '../img/notification.svg';
import earthImg from '../img/earth.svg';
import featureBgImg from '../img/feature.svg';
import api from '../api/axios';

const featureCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, type: 'spring' }
  })
};

const Home = () => {
  const theme = useTheme();
  const isLoggedIn = JSON.parse(window.localStorage.getItem('user'));

  // State for recent items
  const [recentItems, setRecentItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Mock statistics - in a real app, these would come from your backend
  const stats = [
    { number: "2,847", label: "Items Recovered", icon: <EmojiEvents color="primary" /> },
    { number: "15,234", label: "Active Users", icon: <People color="primary" /> },
    { number: "98%", label: "Success Rate", icon: <TrendingUp color="primary" /> },
    { number: "24/7", label: "Support Available", icon: <VerifiedUser color="primary" /> }
  ];

  // Mock testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
      text: "Found my lost phone within 2 hours! The community here is amazing.",
      rating: 5
    },
    {
      name: "Mike Chen",
      avatar: "https://i.pravatar.cc/150?img=2", 
      text: "Helped someone find their lost wallet. The chat feature made it so easy to connect.",
      rating: 5
    },
    {
      name: "Emma Davis",
      avatar: "https://i.pravatar.cc/150?img=3",
      text: "Lost my keys at the mall, posted here, and got them back the same day!",
      rating: 5
    }
  ];

  // Item categories
  const categories = [
    { name: "Electronics", icon: "📱", count: 156, color: "#2196F3" },
    { name: "Jewelry", icon: "💍", count: 89, color: "#FF9800" },
    { name: "Documents", icon: "📄", count: 234, color: "#4CAF50" },
    { name: "Clothing", icon: "👕", count: 312, color: "#9C27B0" },
    { name: "Pets", icon: "🐕", count: 45, color: "#F44336" },
    { name: "Other", icon: "📦", count: 178, color: "#607D8B" }
  ];

  useEffect(() => {
    api.get("/items")
      .then(res => {
        // Show the latest 6 items (reverse for most recent first)
        const items = (res.data.items || []).reverse().slice(0, 6);
        setRecentItems(items);
        setLoadingItems(false);
      })
      .catch(() => setLoadingItems(false));
  }, []);

  const handleButtonClick = () => {
    if (isLoggedIn) {
      window.location.href = "/postitem";
    } else {
      window.location.href = "/log-in";
    }
  };
  const handleButtonClickLost = () => {
    if (isLoggedIn) {
      window.location.href = "/lostitems";
    } else {
      window.location.href = "/log-in";
    }
  };
  const handleButtonClickFound = () => {
    if (isLoggedIn) {
      window.location.href = "/founditems";
    } else {
      window.location.href = "/log-in";
    }
  };

  const handleItemClick = (item) => {
    // Navigate to item detail page (same as LostItems/FoundItems)
    window.location.href = `/item?cid=${item._id}&type=${item.userId && isLoggedIn && item.userId._id === isLoggedIn._id}`;
  };

  return (
    <Box width="100%" minHeight="100vh" bgcolor={theme.palette.background.default} pb={8}>
      {/* Hero Section */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="center"
        spacing={6}
        px={{ xs: 2, md: 8 }}
        py={{ xs: 6, md: 12 }}
        sx={{
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          position: 'relative',
          overflow: 'hidden',
          color: 'white'
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }}
        />
        
        <Stack spacing={4} flex={1} alignItems={{ xs: 'center', md: 'flex-start' }} sx={{ zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, type: 'spring' }}
            style={{ width: '100%' }}
          >
            <Chip 
              label="Trusted by 15,000+ users" 
              color="primary" 
              variant="filled" 
              sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Typography variant="h2" fontWeight={700} textAlign={{ xs: 'center', md: 'left' }} sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Lost & Found
            </Typography>
            <Typography variant="h2" fontWeight={700} textAlign={{ xs: 'center', md: 'left' }} sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Made Simple
            </Typography>
            <Typography variant="h5" textAlign={{ xs: 'center', md: 'left' }} mt={2} sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Reunite with your lost items or help others find what they've lost. 
              Join our community of helpful people making the world a better place.
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, type: 'spring' }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
              <Button
                onClick={handleButtonClick}
                variant="contained"
                size="large"
                sx={{ 
                  borderRadius: 3, 
                  px: 4, 
                  fontWeight: 600, 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                Post Lost/Found Item
              </Button>
              <Button
                onClick={handleButtonClickLost}
                variant="outlined"
                size="large"
                sx={{ 
                  borderRadius: 3, 
                  px: 4, 
                  fontWeight: 600, 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Browse Lost Items
              </Button>
            </Stack>
          </motion.div>
        </Stack>
        
        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
          >
            <Box
              component="img"
              src="https://i.ibb.co/9Z8qTQj/bg2.png"
              alt="Lost and Found Illustration"
              sx={{ 
                maxWidth: '100%', 
                height: 'auto', 
                borderRadius: 4, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
              }}
            />
          </motion.div>
        </Box>
      </Stack>

      {/* Statistics Section */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={4} 
        py={6} 
        px={4} 
        bgcolor="white"
        sx={{ 
          transform: 'translateY(-50px)', 
          mx: 2, 
          borderRadius: 4, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 2
        }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            style={{ flex: 1, textAlign: 'center' }}
          >
            <Stack alignItems="center" spacing={1}>
              <Box sx={{ fontSize: 48, color: 'primary.main' }}>
                {stat.icon}
              </Box>
              <Typography variant="h3" fontWeight={700} color="primary">
                {stat.number}
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                {stat.label}
              </Typography>
            </Stack>
          </motion.div>
        ))}
      </Stack>

      {/* Features Section */}
      <Stack alignItems="center" spacing={4} py={8} px={2} bgcolor={theme.palette.background.paper} mx="auto" maxWidth={1200} sx={{ position: 'relative', overflow: 'hidden' }}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
          How It Works
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" maxWidth={600} mb={4}>
          Our simple 3-step process makes it easy to report and find lost items
        </Typography>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} width="100%" justifyContent="center" flexWrap="wrap">
          {[
            {
              icon: <Box component="img" src={lostImg} alt="Report Lost or Found" sx={{ height: 64, mb: 1 }} />, 
              title: '1. Report Lost or Found',
              desc: 'Quickly post about lost or found items with detailed descriptions and clear photos.'
            },
            {
              icon: <Box component="img" src={featureImg} alt="Browse & Search" sx={{ height: 64, mb: 1 }} />, 
              title: '2. Browse & Search',
              desc: "Explore all listings with powerful search and filter options to find what you're looking for."
            },
            {
              icon: <Box component="img" src={mailImg} alt="Chat Securely" sx={{ height: 64, mb: 1 }} />, 
              title: '3. Connect & Reunite',
              desc: 'Chat securely with other users to arrange item return. Your privacy is protected.'
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={featureCardVariants}
              style={{ flex: '1 1 300px', minWidth: 300, margin: 8 }}
            >
              <Card sx={{ 
                borderRadius: 4, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" justifyContent="center" mb={3}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} align="center" mb={2}>{feature.title}</Typography>
                  <Typography color="text.secondary" align="center" lineHeight={1.6}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>
      </Stack>

      {/* Categories Section */}
      <Stack alignItems="center" spacing={4} py={8} px={2} bgcolor="#f8fafc" mx="auto" maxWidth={1200}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
          Popular Categories
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" maxWidth={600} mb={4}>
          Find items by category or browse all listings
        </Typography>
        
        <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => handleButtonClickLost()}
              >
                <CardContent sx={{ p: 3, textAlign: 'center', minWidth: 120 }}>
                  <Typography variant="h3" mb={1}>{category.icon}</Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>{category.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{category.count} items</Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>
      </Stack>

      {/* Testimonials Section */}
      <Stack alignItems="center" spacing={4} py={8} px={2} bgcolor="white" mx="auto" maxWidth={1200}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
          Success Stories
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" maxWidth={600} mb={4}>
          See how our community helps people every day
        </Typography>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} width="100%">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              style={{ flex: 1 }}
            >
              <Card sx={{ 
                borderRadius: 4, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Box display="flex" alignItems="center" spacing={2}>
                      <Avatar src={testimonial.avatar} sx={{ width: 56, height: 56 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600}>{testimonial.name}</Typography>
                        <Box display="flex" spacing={0.5}>
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Typography key={i} color="warning.main">★</Typography>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.6} fontStyle="italic">
                      "{testimonial.text}"
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>
      </Stack>

      {/* Recent Items Section */}
      <Stack alignItems="center" spacing={4} py={8} px={2} bgcolor="#f8fafc" mx="auto" maxWidth={1200}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
          Recent Lost & Found Items
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" maxWidth={600} mb={4}>
          Latest items posted by our community
        </Typography>
        
        {loadingItems ? (
          <Typography>Loading...</Typography>
        ) : recentItems.length === 0 ? (
          <Stack alignItems="center" spacing={2}>
            <Typography color="text.secondary">No items have been listed yet.</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleButtonClick}
              sx={{ borderRadius: 3, px: 4 }}
            >
              Be the First to Post
            </Button>
          </Stack>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center" flexWrap="wrap">
            {recentItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Box
                  onClick={() => handleItemClick(item)}
                  sx={{
                    width: 200,
                    height: 220,
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={Array.isArray(item.img) ? item.img[0] : item.img}
                    alt={item.name}
                    sx={{ width: '100%', height: 120, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Typography fontWeight={600} fontSize={16} noWrap>{item.name}</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip 
                        label={item.type} 
                        size="small" 
                        color={item.type === 'Lost' ? 'error' : 'success'}
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Stack>
        )}
        
        <Button 
          variant="outlined" 
          color="primary" 
          size="large"
          onClick={handleButtonClickLost}
          sx={{ borderRadius: 3, px: 4, mt: 2 }}
        >
          View All Items
        </Button>
      </Stack>

      {/* CTA Section */}
      <Stack 
        alignItems="center" 
        spacing={4} 
        py={8} 
        px={4} 
        bgcolor="primary.main"
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }}
      >
        <Typography variant="h3" fontWeight={700} textAlign="center">
          Ready to Help Someone Today?
        </Typography>
        <Typography variant="h6" textAlign="center" maxWidth={600} sx={{ opacity: 0.9 }}>
          Join thousands of people who are making a difference by helping others find their lost items
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            onClick={handleButtonClick}
            variant="contained"
            size="large"
            sx={{ 
              borderRadius: 3, 
              px: 6, 
              py: 2,
              fontWeight: 600, 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            Post an Item Now
          </Button>
          <Button
            onClick={handleButtonClickLost}
            variant="outlined"
            size="large"
            sx={{ 
              borderRadius: 3, 
              px: 6, 
              py: 2,
              fontWeight: 600, 
              borderColor: 'white', 
              color: 'white',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Browse Items
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Home;
