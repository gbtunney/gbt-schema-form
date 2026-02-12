import express from 'express'

// This file boots an Express server that would proxy requests to the operator API.
// In a real implementation you would import your router from @operator/api and mount it.
const app = express()

app.get('/', (req, res) => {
    res.send('Operator API server placeholder')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Operator API listening on port ${port}`)
})
