import OpenAI from 'openai'

const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
})

const response = await client.responses.create({
    input: 'Are semicolons optional in JavaScript?',
    instructions: 'You are a coding assistant that talks like a pirate',
    model: 'gpt-5.2',
})

console.log(response.output_text)
