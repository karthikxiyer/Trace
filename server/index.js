import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import linksRouter from './routes/links.js';
import tagsRouter from './routes/tags.js';
import searchRouter from './routes/search.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (origin, cb) => {
    const allowed = process.env.CLIENT_URL || '';
    if (
      !origin ||
      origin === allowed ||
      origin.startsWith('chrome-extension://') ||
      /^http:\/\/localhost:\d+$/.test(origin)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/links', linksRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/search', searchRouter);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
