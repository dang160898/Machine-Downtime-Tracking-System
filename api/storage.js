import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN,
  automaticDeserialization: false,
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const key = req.query.key;
      if (!key) return res.status(400).json({ error: 'key is required' });
      const value = await redis.get(key);
      if (value === null || value === undefined) {
        return res.status(404).json({ error: 'not found' });
      }
      return res.status(200).json({ key, value });
    }

    if (req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'key is required' });
      await redis.set(key, value);
      return res.status(200).json({ key, value });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error('storage API error:', err);
    return res.status(500).json({ error: 'internal server error' });
  }
}
