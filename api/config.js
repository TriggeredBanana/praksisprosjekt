export default function handler(req, res) {
  // Kun tillat GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Hent environment variables
  const config = {
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID
  };

  // Sjekk om alle nødvendige variabler er satt
  if (!config.publicKey || !config.serviceId || !config.templateId) {
    return res.status(500).json({ 
      message: 'Server configuration error',
      missing: {
        publicKey: !config.publicKey,
        serviceId: !config.serviceId,
        templateId: !config.templateId
      }
    });
  }

  // Set caching headers (disse er ikke sensitive data)
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  
  // Send konfigurasjonen
  res.status(200).json(config);
}
