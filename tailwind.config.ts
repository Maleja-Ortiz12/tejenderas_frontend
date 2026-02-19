import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'grey-light': '#fff2d0',
        'pink-hot': '#FE6196',
        'red-pink': '#FF2C69',
        teal: '#1EA49D',
        lime: '#CBE65B',
        graphite: '#000000',
        white: '#ffffff',
      },
    },
  },
  plugins: [],
};

export default config;
