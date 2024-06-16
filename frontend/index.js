import React from 'react'
import App from './components/App'
import './styles/reset.css'
import './styles/styles.css'
import { BrowserRouter as Router} from 'react-router-dom'
import { createRoot } from 'react-dom/client'


const domNode = document.getElementById('root')
const root = createRoot(domNode)

root.render(
    <Router>
<App />
 </Router>
 );
