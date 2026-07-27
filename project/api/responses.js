const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const password = req.headers['x-admin-password'];
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: '密碼錯誤或未提供密碼' });
    return;
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .order('submitted_at', { ascending: true });

    if (error) throw error;

    res.status(200).json({ responses: data });
  } catch (err) {
    console.error('responses error:', err);
    res.status(500).json({ error: '伺服器錯誤，請稍後再試' });
  }
};
