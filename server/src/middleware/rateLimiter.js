// Rate limiter mémoire simple (sans dépendance externe), par IP.
// Protège les routes sensibles (login/register) contre le brute-force et le spam.

function rateLimiter({ windowMs, max }) {
  const hits = new Map(); // ip → [timestamps]

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const timestamps = (hits.get(ip) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= max) {
      return res.status(429).json({ error: 'Trop de tentatives, réessayez plus tard.' });
    }

    timestamps.push(now);
    hits.set(ip, timestamps);
    next();
  };
}

module.exports = { rateLimiter };
