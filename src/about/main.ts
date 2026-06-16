import '../style.css'
import { createAboutApp } from './app'

const app = document.querySelector<HTMLDivElement>('#app')!
createAboutApp(app)
