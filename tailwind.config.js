export default {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",        // App Router inside src
        "./src/pages/**/*.{js,ts,jsx,tsx}",      // Pages Router inside src
        "./src/components/**/*.{js,ts,jsx,tsx}", // Components inside src
    ],
    theme: {
        extend: {
            colors: {
                testred: "#ff0000",
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-15px)' },
                },
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
            },
        },
    },
}
