const axios = require('axios');

const CURSOR_API_KEY = 'key_3dc59158f1dde36124847fede27d0f239eb2ca47b4021b67c14ee2addfc07082';

async function testCursorOpenAICompatible() {
    console.log('Testing Cursor API with OpenAI-compatible endpoint...\n');

    // Try different possible base URLs
    const baseURLs = [
        'https://api.cursor.sh/v1',
        'https://api.cursor.com/v1',
        'https://cursor.sh/api/v1'
    ];

    for (const baseURL of baseURLs) {
        console.log(`\nTrying base URL: ${baseURL}`);
        try {
            const response = await axios.post(`${baseURL}/chat/completions`, {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'What is in this image? Just say "Test successful"'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 50
            }, {
                headers: {
                    'Authorization': `Bearer ${CURSOR_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ SUCCESS! Response:', JSON.stringify(response.data, null, 2));
            console.log('\n✅ This base URL works:', baseURL);
            return;
        } catch (error) {
            console.log(`❌ Failed with ${baseURL}:`, error.response?.status, error.response?.data?.error?.message || error.message);
        }
    }

    console.log('\n❌ None of the base URLs worked. The Cursor API key might not support OpenAI-compatible endpoints.');
    console.log('\nNote: Cursor API keys are typically for use within the Cursor IDE, not for external API calls.');
    console.log('You may need to use an OpenAI API key or Anthropic API key instead.');
}

testCursorOpenAICompatible();
