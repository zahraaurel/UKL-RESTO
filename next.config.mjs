/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Jika frontend memanggil '/api-railway/something', 
        // Next.js akan otomatis mengarahkannya ke server Railway Anda
        source: '/api-railway/:path*',
        destination: 'https://ukl-restoran-production.up.railway.app/:path*',
      },
    ];
  },
};

export default nextConfig;