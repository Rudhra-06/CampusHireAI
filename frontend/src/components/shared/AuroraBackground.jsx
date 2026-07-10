import { motion } from 'framer-motion';

export default function AuroraBackground({ children, className = '' }) {
    return (
        <div className={`aurora-shell ${className}`.trim()}>
            <motion.div
                className="aurora-blob aurora-blob-a"
                animate={{ x: [0, 24, 0], y: [0, -18, 0], scale: [1, 1.04, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="aurora-blob aurora-blob-b"
                animate={{ x: [0, -30, 0], y: [0, 24, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="aurora-blob aurora-blob-c"
                animate={{ x: [0, 16, 0], y: [0, 12, 0], scale: [1, 1.02, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            {children}
        </div>
    );
}
