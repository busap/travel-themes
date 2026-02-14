import styles from './scroll-hint.module.scss';

export function ScrollHint() {
    return (
        <div className={styles.scrollHint}>
            <span className={styles.textDesktop}>Scroll to explore</span>
            <span className={styles.textMobile}>Scroll</span>
            <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </div>
    );
}
