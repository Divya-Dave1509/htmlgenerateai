require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const models = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-latest",
    "claude-3-opus-20240229",
    "claude-3-haiku-20240307"
];

async function testModel(model) {
    console.log(`Testing model: ${model}...`);
    try {
        const response = await anthropic.messages.create({
            model: model,
            max_tokens: 10,
            messages: [{ role: "user", content: "Hello" }],
        });
        console.log(`✅ SUCCESS: ${model}`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${model}`);
        console.log(`   Error: ${error.status} - ${error.message}`);
        if (error.error && error.error.message) {
            console.log(`   Details: ${error.error.message}`);
        }
        return false;
    }
}

async function runTests() {
    console.log("Starting Model Access Tests...");
    console.log("API Key (masked): " + (process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 15) + "..." : "NOT SET"));

    for (const model of models) {
        await testModel(model);
    }
}

runTests();
