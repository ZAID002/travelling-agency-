const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 3000 });
    console.log('your url is:', tunnel.url);
    
    tunnel.on('close', () => {
      console.log('tunnel closed');
    });
  } catch (err) {
    console.error('Error starting tunnel:', err);
  }
})();
