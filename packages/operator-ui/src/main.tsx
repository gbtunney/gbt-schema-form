import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const doc = document.getElementById('root')
if (doc === null) {
    throw new Error('Root element not found')
}
createRoot(doc).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
/*
import { Client } from '@operator/api'
async function test() {
    console.log('Hello world')
    const client = new Client( optional custom implementation )
    const hello = await client.provide('get /hello', {
        name: 'y',
        nickname: 'x',
    })
}*/
