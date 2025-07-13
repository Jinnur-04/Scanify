// controllers/chatController.js
import axios from 'axios';

export const askAI = async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: 'Query is required and must be a string.' });
  }

  try {
    const response = await axios.post('http://localhost:7860/api/ai/chat', { query });
    return res.status(200).json(response.data);
  } catch (err) {
    console.error('AI query error:', err.message);
    return res.status(500).json({ message: 'Something went wrong.', error: err.message });
  }
};
