import './scroll-hint.css';

export function ScrollHint() {
    return (
        <div className="scroll-hint">
            <span className="scroll-hint__text--desktop">Scroll to explore</span>
            <span className="scroll-hint__text--mobile">Scroll</span>
            <svg
                className="scroll-hint__icon"
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
