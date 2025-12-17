const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Simple 1x1 red pixel image in base64
const TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testOpenAIVisionModels() {
    console.log('Testing OpenAI Vision Models...\n');
    console.log('API Key:', OPENAI_API_KEY.substring(0, 20) + '...' + OPENAI_API_KEY.slice(-4));
    console.log('='.repeat(60));

    const modelsToTest = [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4-vision-preview',
        'gpt-4',
    ];

    const results = [];

    for (const model of modelsToTest) {
        console.log(`\n📸 Testing: ${model}`);
        console.log('-'.repeat(60));

        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'What color is this image? Just say the color name.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: TEST_IMAGE
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 50
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const answer = response.data.choices[0].message.content;
            console.log('✅ SUCCESS!');
            console.log('Response:', answer);
            console.log('Tokens used:', response.data.usage.total_tokens);

            results.push({
                model,
                status: '✅ WORKS',
                response: answer,
                tokens: response.data.usage.total_tokens
            });

        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            const errorCode = error.response?.data?.error?.code || 'unknown';

            console.log('❌ FAILED');
            console.log('Error:', errorMsg);
            console.log('Code:', errorCode);

            results.push({
                model,
                status: '❌ FAILED',
                error: errorMsg,
                code: errorCode
            });
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

    const working = results.filter(r => r.status === '✅ WORKS');
    const failed = results.filter(r => r.status === '❌ FAILED');

    if (working.length > 0) {
        console.log('\n✅ WORKING MODELS:');
        working.forEach(r => {
            console.log(`   - ${r.model} (${r.tokens} tokens)`);
        });
    }

    if (failed.length > 0) {
        console.log('\n❌ FAILED MODELS:');
        failed.forEach(r => {
            console.log(`   - ${r.model}: ${r.error}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 RECOMMENDATION:');
    if (working.length > 0) {
        const best = working[0];
        console.log(`Use "${best.model}" for best vision capabilities!`);
    } else {
        console.log('⚠️  No vision models are working with this API key.');
        console.log('You may need to upgrade your OpenAI account or check billing.');
    }
    console.log('='.repeat(60));
}

testOpenAIVisionModels();
