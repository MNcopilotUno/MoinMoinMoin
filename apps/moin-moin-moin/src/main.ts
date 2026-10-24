import { mount } from 'svelte';
import '@moin/assets/fonts.css';
import '@moin/assets/palette.css';
import './app.css';
import App from './App.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('#app missing');
export default mount(App, { target });
