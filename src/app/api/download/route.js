import { NextResponse } from 'next/server';
import axios from 'axios';

// Ganti delay dari baileys dengan native JS agar ringan di Vercel
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ytdown(url, type) {
  try {
    // 1. Request awal ke proxy
    const { data } = await axios.post(
      'https://ytdown.to/proxy.php',
      new URLSearchParams({ url }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
      }
    );

    if (!data.api) throw new Error('Gagal mendapatkan respon API awal.');

    const api = data.api;
    const media = api.mediaItems.find((m) => m.type.toLowerCase() === type.toLowerCase());

    if (!media) throw new Error(`Tipe media '${type}' tidak ditemukan.`);

    // 2. Polling status download
    let attempts = 0;
    const maxAttempts = 10; // Batas looping agar Vercel tidak timeout (max 60 detik)

    while (attempts < maxAttempts) {
      const { data: res } = await axios.get(media.mediaUrl);

      if (res.error === 'METADATA_NOT_FOUND') {
         throw new Error('Metadata tidak ditemukan.');
      }

      // Cek status selesai
      if (res.percent === 'Completed' && res.fileUrl !== 'In Processing...') {
        return {
          info: {
            title: api.title,
            desc: api.description,
            thumbnail: api.imagePreviewUrl,
            views: api.mediaStats?.viewsCount,
            uploader: api.userInfo?.name,
            quality: media.mediaQuality,
            duration: media.mediaDuration,
            extension: media.mediaExtension,
            size: media.mediaFileSize,
          },
          download: res.fileUrl,
        };
      }

      attempts++;
      await delay(3000); // Tunggu 3 detik sebelum cek lagi
    }

    throw new Error('Waktu proses habis (Timeout). Coba lagi nanti.');

  } catch (error) {
    throw error;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, type = 'video' } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL tidak boleh kosong' }, { status: 400 });
    }

    const result = await ytdown(url, type);
    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
