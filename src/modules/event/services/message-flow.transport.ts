import * as http from 'http';

export function postJson(url: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const data = JSON.stringify(body);
      const options: http.RequestOptions = {
        hostname: parsedUrl.hostname,
        port:
          Number(parsedUrl.port) ||
          (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      };

      const request = http.request(options, (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
          responseBody += chunk.toString();
        });
        response.on('end', () => {
          try {
            resolve(responseBody ? JSON.parse(responseBody) : null);
          } catch {
            resolve(responseBody);
          }
        });
      });

      request.on('error', reject);
      request.write(data);
      request.end();
    } catch (error) {
      reject(error);
    }
  });
}
