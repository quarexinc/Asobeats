"use client";

/** MP3 dosyasını tarayıcıda çözer */
export async function decodeAudio(file: Blob): Promise<AudioBuffer> {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const buf = await file.arrayBuffer();
    return await ctx.decodeAudioData(buf);
  } finally {
    ctx.close().catch(() => undefined);
  }
}

/** Dalga formu için tepe değerleri (0-1). from/length saniye cinsinden (isteğe bağlı aralık) */
export function computePeaks(buffer: AudioBuffer, count = 160, from = 0, length?: number): number[] {
  const channels = Math.min(buffer.numberOfChannels, 2);
  const data = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c));
  const s0 = Math.max(0, Math.floor(from * buffer.sampleRate));
  const total = Math.min(buffer.length - s0, length ? Math.floor(length * buffer.sampleRate) : buffer.length);
  const block = Math.floor(total / count) || 1;
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    let sum = 0;
    let n = 0;
    const start = s0 + i * block;
    // her blokta RMS: daha "müzikal" görünen bir dalga verir
    for (let j = start; j < start + block && j < s0 + total; j += 16) {
      let v = 0;
      for (const ch of data) v += Math.abs(ch[j]);
      v /= channels;
      sum += v * v;
      n++;
    }
    peaks.push(Math.sqrt(sum / (n || 1)));
  }
  const max = Math.max(...peaks, 0.0001);
  return peaks.map((p) => Math.round((p / max) * 1000) / 1000);
}

/** Dosyanın en enerjik 15 saniyesini bulur (nakarat/drop çoğu zaman burada) */
export function suggestPreviewStart(buffer: AudioBuffer, length = 15): number {
  if (buffer.duration <= length) return 0;
  const peaks = computePeaks(buffer, Math.ceil(buffer.duration)); // ~1 sn'lik bloklar
  const win = length;
  let best = 0;
  let bestSum = -1;
  // ilk %10 ve son %10'u atla (intro/outro)
  const from = Math.floor(peaks.length * 0.1);
  const to = Math.max(from, peaks.length - win - Math.floor(peaks.length * 0.05));
  for (let s = from; s <= to; s++) {
    let sum = 0;
    for (let k = 0; k < win; k++) sum += peaks[s + k] ?? 0;
    if (sum > bestSum) {
      bestSum = sum;
      best = s;
    }
  }
  return Math.min(best, Math.floor(buffer.duration - length));
}

/** 15 saniyelik demo üretir (yumuşak giriş/çıkış ile WAV) */
export function makePreview(buffer: AudioBuffer, start: number, length = 15): Blob {
  const rate = buffer.sampleRate;
  const channels = Math.min(buffer.numberOfChannels, 2);
  const s0 = Math.max(0, Math.floor(start * rate));
  const len = Math.min(Math.floor(length * rate), buffer.length - s0);
  const fadeIn = Math.floor(0.25 * rate);
  const fadeOut = Math.floor(1.5 * rate);

  const out: Float32Array[] = [];
  for (let c = 0; c < channels; c++) {
    const src = buffer.getChannelData(c).subarray(s0, s0 + len);
    const dst = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      let g = 1;
      if (s0 > 0 && i < fadeIn) g = i / fadeIn;
      if (i > len - fadeOut) g = Math.min(g, (len - i) / fadeOut);
      dst[i] = src[i] * g;
    }
    out.push(dst);
  }
  return encodeWav(out, rate);
}

function encodeWav(channels: Float32Array[], sampleRate: number): Blob {
  const numCh = channels.length;
  const len = channels[0].length;
  const bytesPerSample = 2;
  const dataSize = len * numCh * bytesPerSample;
  const buf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buf);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  w(8, "WAVE");
  w(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numCh * bytesPerSample, true);
  view.setUint16(32, numCh * bytesPerSample, true);
  view.setUint16(34, 16, true);
  w(36, "data");
  view.setUint32(40, dataSize, true);
  let o = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([buf], { type: "audio/wav" });
}
