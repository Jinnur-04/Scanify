import multer from 'multer';

const storage = multer.memoryStorage(); // use buffer instead of disk

const upload = multer({ storage });

export default upload;
