import * as React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
}

export const AddIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10 2.5a.75.75 0 0 1 .75.75v6h6a.75.75 0 0 1 0 1.5h-6v6a.75.75 0 0 1-1.5 0v-6h-6a.75.75 0 0 1 0-1.5h6v-6A.75.75 0 0 1 10 2.5z" />
    </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M15.3 4.7a.75.75 0 0 1 .03 1.06l-1.07 1.1A6.47 6.47 0 0 1 16.5 10c0 3.59-2.91 6.5-6.5 6.5A6.51 6.51 0 0 1 3.5 10c0-3.15 2.24-5.78 5.23-6.38a.75.75 0 0 1 .3 1.47C6.6 5.58 4.75 7.6 4.75 10c0 2.9 2.35 5.25 5.25 5.25s5.25-2.35 5.25-5.25c0-1.28-.46-2.45-1.23-3.37l-1.12 1.15a.75.75 0 0 1-1.28-.53V3.75c0-.41.34-.75.75-.75h3.5c.57 0 .86.69.46 1.1z" />
    </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M8.5 3a5.5 5.5 0 1 0 4.23 9.02l4.12 4.13a.75.75 0 0 0 1.06-1.06l-4.13-4.12A5.5 5.5 0 0 0 8.5 3zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" />
    </svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2v6a2 2 0 0 0 2 2h6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h6zm1.5.5V8a.5.5 0 0 0 .5.5h5.5l-6-6z" />
    </svg>
);