require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
    console.error('❌ No ANTHROPIC_API_KEY found in .env');
    process.exit(1);
}

const anthropic = new Anthropic({ apiKey });

const models = [
    'claude-3-haiku-20240307',
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229'
];

async function testModel(model) {
    console.log(`\nTesting ${model}...`);
    try {
        const msg = await anthropic.messages.create({
            model: model,
            max_tokens: 10,
            messages: [{ role: "user", content: "Hello" }]
        });
        console.log(`✅ ${model}: SUCCESS`);
        return true;
    } catch (error) {
        console.log(`❌ ${model}: FAILED`);
        console.log(`   Error: ${error.status} - ${error.error?.message || error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('Starting Model Compatibility Check...');
    for (const model of models) {
        await testModel(model);
    }
}

runTests();
