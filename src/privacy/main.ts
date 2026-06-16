import '../style.css'
import { createPrivacyApp } from './app'

const app = document.querySelector<HTMLDivElement>('#app')!
createPrivacyApp(app)
