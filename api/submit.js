const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { q1_name, q2_fluoride, q3_image, q4_image } = req.body || {};

    if (!q1_name || !q2_fluoride || !q3_image || !q4_image) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error } = await supabase.from('responses').insert([
      {
        q1_name: String(q1_name).slice(0, 200),
        q2_fluoride: String(q2_fluoride).slice(0, 50),
        q3_image: String(q3_image).slice(0, 50),
        q4_image: String(q4_image).slice(0, 50),
      },
    ]);

    if (error) throw error;

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit error:', err);
    res.status(500).json({ error: '伺服器錯誤，請稍後再試' });
  }
};
