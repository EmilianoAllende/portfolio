/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'static1.pocketnowimages.com',
            },
            {
                protocol: 'https',
                hostname: 'e7.pngegg.com',
            },
            {
                protocol: 'https',
                hostname: 'img.freepik.com',
            },
            {
                protocol: 'https',
                hostname: 'purepng.com',
            },
            {
                protocol: 'https',
                hostname: 'wallpapers.com',
            },
            {
                protocol: 'https',
                hostname: 'maximstore.com',
            },
            {
                protocol: 'https',
                hostname: 'www.apple.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn-ipoint.waugi.com.ar',
            },
        ],
    },
};

export default nextConfig;