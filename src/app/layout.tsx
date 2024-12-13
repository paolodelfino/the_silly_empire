import Layout from "@/components/Layout";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  themeColor: "black",
  colorScheme: "dark",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export const metadata: Metadata = {
  title: "The Silly Empire",
  description: "",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-square70x70logo": "/mstile-icon-128.png",
    "msapplication-square150x150logo": "/mstile-icon-270.png",
    "msapplication-square310x310logo": "/mstile-icon-558.png",
    "msapplication-wide310x150logo": "/mstile-icon-558-270.png",
  },
  icons: [
    {
      rel: "icon",
      type: "image/png",
      sizes: "196x196",
      url: "/favicon-196.png",
    },
    { rel: "apple-touch-icon", url: "/apple-icon-180.png" },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-2048-2732.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1668-2388.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1536-2048.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1488-2266.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1640-2360.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1668-2224.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1620-2160.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1320-2868.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1206-2622.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1290-2796.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1179-2556.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1284-2778.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1170-2532.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1125-2436.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1242-2688.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-828-1792.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-1242-2208.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-750-1334.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      url: "/apple-splash-dark-640-1136.jpg",
      media:
        "(prefers-color-scheme: dark) and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex bg-black font-sans text-white antialiased`}
        style={{
          textRendering: "optimizeLegibility",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
