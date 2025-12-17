try {
    console.log('Requiring openai...');
    require('openai');
    console.log('Requiring axios...');
    require('axios');
    console.log('Requiring fs...');
    require('fs');
    console.log('Requiring controller...');
    require('./controllers/convertController');
    console.log('Controller loaded successfully.');
} catch (error) {
    console.error('CRASH DETECTED:');
    console.error(error);
}
