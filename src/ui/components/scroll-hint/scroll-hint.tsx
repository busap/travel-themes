export function ScrollHint() {
    return (
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 flex items-center gap-2 text-zinc-500 text-xs sm:text-sm pointer-events-none">
            <span className="hidden sm:inline">Scroll to explore</span>
            <span className="sm:hidden">Scroll</span>
            <svg
                className="w-4 h-4 sm:w-5 sm:h-5 animate-[bounce-horizontal_1s_ease-in-out_infinite]"
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
