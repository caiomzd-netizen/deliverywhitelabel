import React from 'react';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  label?: string;
}

export default function QRCodeDisplay({ url, size = 180, label }: QRCodeDisplayProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=fff7ed&color=f97316`;

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={qrUrl}
        alt={`QR Code: ${url}`}
        width={size}
        height={size}
        className="rounded-2xl border-4 border-orange-100 bg-orange-50"
      />
      {label && (
        <p className="text-xs text-gray-500 text-center max-w-[200px] break-all leading-relaxed">
          {label}
        </p>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-mono text-orange-600 underline truncate max-w-[220px]"
      >
        {url}
      </a>
    </div>
  );
}
