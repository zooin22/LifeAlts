// Metro 응답에서 ngrok-host:8081 → ngrok-host 로 URL 재작성
const http = require('http');
const net = require('net');

const HOST = process.env.NGROK_HOST;
if (!HOST) { console.error('NGROK_HOST 환경변수 필요'); process.exit(1); }
const FROM = HOST + ':8081';

const server = http.createServer((req, res) => {
  const opts = {
    hostname: 'localhost', port: 8081,
    path: req.url, method: req.method,
    headers: { ...req.headers, host: 'localhost:8081' },
  };
  const pr = http.request(opts, (metro) => {
    const ct = metro.headers['content-type'] || '';
    if (ct.includes('json') || ct.includes('plain')) {
      const chunks = [];
      metro.on('data', c => chunks.push(c));
      metro.on('end', () => {
        let text = Buffer.concat(chunks).toString('utf8');
        text = text.split(FROM).join(HOST);
        // http → https (Android blocks cleartext non-localhost traffic)
        text = text.split('http://' + HOST).join('https://' + HOST);
        const h = { ...metro.headers, 'content-length': Buffer.byteLength(text) };
        delete h['content-encoding'];
        res.writeHead(metro.statusCode, h);
        res.end(text);
      });
    } else {
      res.writeHead(metro.statusCode, metro.headers);
      metro.pipe(res);
    }
  });
  req.pipe(pr);
  pr.on('error', e => { res.writeHead(502); res.end(e.message); });
});

// WebSocket (live reload) 프록시
server.on('upgrade', (req, sock, head) => {
  const c = net.connect(8081, 'localhost', () => {
    const headers = Object.entries({ ...req.headers, host: 'localhost:8081' })
      .map(([k, v]) => `${k}: ${v}`).join('\r\n');
    c.write(`${req.method} ${req.url} HTTP/1.1\r\n${headers}\r\n\r\n`);
    if (head?.length) c.write(head);
    c.pipe(sock);
    sock.pipe(c);
  });
  c.on('error', () => sock.destroy());
  sock.on('error', () => c.destroy());
});

server.listen(8082, () => console.log(`Proxy ready: :8082 → Metro:8081 (rewriting ${FROM} → ${HOST})`));
