// controllers/chatController.js
import axios from 'axios';

const MODEL_API = process.env.MODEL_API || 'http://localhost:7860';

export const askAI = async (req, res) => {
  const { query } = req.body;
  const user = req.user;
  const token = req.headers.authorization; // Get token from incoming request

  console.log('User:', user);
  console.log('Query:', query);

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: 'Query is required and must be a string.' });
  }

  if (!user || !token) {
    return res.status(401).json({ message: 'Unauthorized. User or token missing.' });
  }

  try {
    const response = await axios.post(
      `${MODEL_API}/api/ai/chat`,
      { query },
      {
        headers: {
          Authorization: token, // ✅ Forward token to Flask
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    if (err.response) {
      console.error('AI query error:', err.response.status, err.response.data);
      return res.status(err.response.status).json({
        message: 'AI service error.',
        error: err.response.data,
      });
    } else if (err.request) {
      console.error('No response received from AI service:', err.request);
      return res.status(502).json({ message: 'AI service not reachable.' });
    } else {
      console.error('Error in AI request setup:', err.message);
      return res.status(500).json({ message: 'Unexpected error.', error: err.message });
    }
  }
};
