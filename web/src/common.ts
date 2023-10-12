import { KredsClient } from '@kreds/client';

export const apiUrl = new URL('/api/v1/', window.location.href).toString();

export const kreds = new KredsClient({
  url: new URL('/kreds/', window.location.href),
  prefix: 'pushfarm_',
});

export function iOSVersion() {
  if ((window as any).MSStream) {
    // There is some iOS in Windows Phone...
    // https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
    return false;
  }

  const match = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);

  if (match !== undefined && match !== null) {
    return [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3] || '0', 10),
    ];
  }

  return false;
}

const deviceNameMatch = [
  { match: /Android/i, name: 'Android Phone' },
  { match: /iPhone/i, name: 'iPhone' },
  { match: /iPad/i, name: 'iPad' },
  { match: /CrOS/i, name: 'Chrome OS' },
  { match: /Macintosh/i, name: 'Mac' },
  { match: /Windows/i, name: 'Windows PC' },
  { match: /Linux/i, name: 'Linux PC' },
];

export function defaultDeviceName() {
  for (const nameMatch of deviceNameMatch) {
    if (navigator.userAgent.match(nameMatch.match)) {
      return nameMatch.name;
    }
  }

  return 'Unknown';
}

export const copy = (text: string) => {
  try {
    const area = document.createElement('textarea');
    area.value = text;

    area.ariaHidden = 'true';

    area.style.all = 'unset';

    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '0';
    area.style.clip = 'rect(0, 0, 0, 0)';

    area.style.whiteSpace = 'pre';
    area.style.userSelect = 'text';

    document.body.appendChild(area);
    area.focus();
    area.select();

    document.execCommand('copy');
    document.body.removeChild(area);
  } catch (e) {}
};
