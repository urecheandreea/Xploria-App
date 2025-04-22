/** @type {import('tailwindcss').Config} */

const withMT = require('@material-tailwind/react/utils/withMT');

module.exports = withMT({
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                carousel: '#1f2326',
                formAuth: '#f0f0f0',
                turq: '#11aabe',
                inputColor: '#f6f6f6',
                cardColor: '#1f2326',
            },
            fontFamily: {
                poppins: ['Poppins', 'sans-serif'],
            },
        },
        plugins: [],
    },
});
