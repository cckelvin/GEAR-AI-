
import http from 'http';
import handler from './api/index';

const server = http.createServer(async (req, res) => {
  // Add Express-like helpers for the handler
  (res as any).status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  (res as any).json = (data: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };
  (res as any).send = (data: any) => {
    res.end(data);
    return res;
  };

  // Minimal body parsing for POST
  if (req.method === 'POST') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    try {
      (req as any).body = JSON.parse(body);
    } catch (e) {
      (req as any).body = {};
    }
  }

  try {
    await handler(req, res);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Dev server running on http://localhost:3000');
});
