import type { CSSProperties } from 'react';

const iconStyle: CSSProperties = {
    width: '1.15em', height: '1.15em', display: 'inline-block',
    verticalAlign: '-0.18em', flexShrink: 0,
};

export default function MetadataIcon({ type }: { type: 'user' | 'calendar' | 'delete' | 'arrow' }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true" focusable="false">
        {type === 'delete' ? <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></> : type === 'arrow' ? <path d="m9 5 7 7-7 7" /> : type === 'user' ? <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2Z" /></> : <>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2M8 18h2" />
        </>}
    </svg>;
}
