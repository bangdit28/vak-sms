// ========================================================
// CLOUDFLARE WORKER: VAK-SMS WEBHOOK RECEIVER (UNLIMITED)
// ========================================================

// (Opsional) Jika ingin SMS langsung diteruskan ke Telegram pribadi:
const TELEGRAM_BOT_TOKEN = ""; // Isi jika punya, misal: "123456:ABC-DEF..."
const TELEGRAM_CHAT_ID = "";   // Isi ID chat Telegram kamu

export default {
  async fetch(request, env, ctx) {
    // Header CORS agar bisa dibaca dari APK / Web mana saja
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. KETIKA VAK-SMS MENGIRIM SMS (METODE POST)
    if (request.method === "POST") {
      try {
        const body = await request.json();
        
        // Data yang dikirim Vak-SMS:
        const idNum = body.idNum || "-";
        const tel = body.tel || "-";
        const code = body.smsCode || "-";
        const text = body.smsText || "-";

        console.log(`[SMS MASUK] ID: ${idNum} | No: ${tel} | OTP: ${code}`);

        // Jika kamu isi Bot Telegram, otomatis kirim notifikasi ke HP:
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
          const pesan = `🔔 *SMS BARU DITERIMA\\!*\n\n` +
                        `🆔 *ID:* \`${idNum}\`\n` +
                        `📱 *Nomor:* \`+${tel}\`\n` +
                        `🔑 *Kode OTP:* \`${code}\`\n` +
                        `📩 *SMS:* _${text}_\n`;

          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: pesan,
              parse_mode: "MarkdownV2"
            })
          });
        }

        return new Response(JSON.stringify({ status: "success", received: body }), {
          status: 200,
          headers: corsHeaders
        });

      } catch (err) {
        return new Response(JSON.stringify({ status: "error", message: err.message }), {
          status: 400,
          headers: corsHeaders
        });
      }
    }

    // 2. KETIKA LINK DIBUKA DI BROWSER BIASA (METODE GET)
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Vak-SMS Webhook Active</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { background: #0B0F19; color: #38BDF8; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #131A2B; padding: 30px; border-radius: 16px; border: 1px solid #1E293B; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color: #4ADE80; margin-top:0;">⚡ Cloudflare Webhook Online</h2>
          <p style="color: #94A3B8;">Siap menerima notifikasi SMS dari Vak-SMS tanpa batas 50!</p>
        </div>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
};
