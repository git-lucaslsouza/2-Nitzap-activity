export default async function handler(req, res) {
  if (req.method === 'POST') {
    const body = req.body;
    console.log('Received data:', body);

    // Aqui você pode processar os inArguments do SFMC
    res.status(200).json({ message: 'Custom activity executed with success', received: body });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}