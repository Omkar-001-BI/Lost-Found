import PhotoCamera from '@mui/icons-material/PhotoCamera';
import React, { useState } from "react";
import api from '../api/axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Paper,
  Grid,
  Button,
  Typography,
  Stack,
  TextField,
  Select,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControl,
  Box,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import { Field, Formik, Form } from 'formik';
import { Link } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase.js';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const LostItem = () => {
  const [progress, setProgress] = useState(0);
  const [loading, setloading] = useState(false);
  const usertoken = window.localStorage.getItem("token");
  const getUserId = () => {
    const user = JSON.parse(window.localStorage.getItem('user'));
    return user ? user._id : null;
  };
  const config = { headers: { token: usertoken } };
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);

  const schema = Yup.object().shape({
    name: Yup.string().required('Item name is required'),
    description: Yup.string().required('Description is required'),
    type: Yup.string().required('Item type is required'),
    location: Yup.string().required('Location is required'),
    date: Yup.string().required('Date is required'),
    number: Yup.string().required('Phone number is required'),
  });

  const handleImageUpload = (e) => {
    setImage(e.target.files);
    // Preview
    const files = Array.from(e.target.files);
    setImagePreview(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (error) {
      const errorMessages = error.inner.map((err) => err.message);
      toast.error(errorMessages.join('\n'), { position: "bottom-right", autoClose: 1000 });
      setSubmitting(false);
      return;
    }
    if (!image || image.length === 0) {
      toast.error('Please upload at least one image', { position: "bottom-right", autoClose: 1000 });
      setSubmitting(false);
      return;
    }
    setloading(true);
    const promises = [];
    for (let i = 0; i < image.length; i++) {
      const img = image[i];
      const storageRef = ref(storage, `/images/${img.name}`);
      const fileRef = ref(storageRef, img.name);
      const uploadTask = uploadBytesResumable(fileRef, img);
      const promise = new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const uploaded = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(uploaded);
          },
          (error) => { reject(error); },
          () => {
            getDownloadURL(uploadTask.snapshot.ref)
              .then((imgUrl) => { resolve(imgUrl); })
              .catch((error) => { reject(error); });
          }
        );
      });
      promises.push(promise);
    }
    Promise.all(promises)
      .then((urls) => {
        const newItem = { ...values, img: urls, userId: getUserId() };
        api.post('/Items/newItem', newItem, config)
          .then(() => {
            toast.success('Wohoo 🤩! Item listed successfully.', { position: "bottom-right", autoClose: 1000 });
            setloading(false);
            window.location.href = "/mylistings";
          })
          .catch((error) => {
            toast.error('Oops 🙁! Something went wrong.', { position: "bottom-right", autoClose: 1000 });
            setloading(false);
          });
      })
      .catch(() => {
        toast.error('Oops 🙁! Something went wrong.', { position: "bottom-right", autoClose: 1000 });
        setloading(false);
      });
    setSubmitting(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: 'spring' }}>
        <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
          <Typography variant="h4" color="primary" fontWeight={700} mb={2} align="center">
            Post a Lost or Found Item
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Formik
            initialValues={{
              name: '',
              userId: getUserId(),
              description: '',
              type: '',
              location: '',
              date: '',
              number: '',
            }}
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
              <Form autoComplete="off">
                <Stack spacing={3}>
                  {/* Item Details */}
                  <Typography variant="h6" color="primary">Item Details</Typography>
                  <TextField
                    label="Item Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                  <FormControl fullWidth error={touched.type && Boolean(errors.type)}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      label="Type"
                      name="type"
                      value={values.type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="Lost">Lost</MenuItem>
                      <MenuItem value="Found">Found</MenuItem>
                    </Select>
                    <FormHelperText>{touched.type && errors.type}</FormHelperText>
                  </FormControl>
                  <TextField
                    label="Location"
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location && Boolean(errors.location)}
                    helperText={touched.location && errors.location}
                    fullWidth
                  />
                  <DatePicker
                    label="Date"
                    value={values.date ? dayjs(values.date) : null}
                    onChange={val => setFieldValue('date', val ? val.format('YYYY-MM-DD') : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="date"
                        error={touched.date && Boolean(errors.date)}
                        helperText={touched.date && errors.date}
                        fullWidth
                      />
                    )}
                  />
                  {/* Contact Info */}
                  <Typography variant="h6" color="primary">Contact Info</Typography>
                  <TextField
                    label="Phone Number"
                    name="number"
                    value={values.number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.number && Boolean(errors.number)}
                    helperText={touched.number && errors.number}
                    fullWidth
                  />
                  {/* Image Upload */}
                  <Typography variant="h6" color="primary">Upload Images</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                  >
                    Upload Images
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {imagePreview.map((src, idx) => (
                      <Box key={idx} component="img" src={src} alt="preview" sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'cover', boxShadow: 1 }} />
                    ))}
                  </Stack>
                  {loading && <LinearProgress variant="determinate" value={progress} sx={{ my: 1 }} />}
                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting || loading}
                    sx={{ borderRadius: 3, fontWeight: 600 }}
                  >
                    {loading ? 'Uploading...' : 'Post Item'}
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>
          </LocalizationProvider>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default LostItem;