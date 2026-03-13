const http = require('http');

const data = JSON.stringify({
    title: "Final Verification Issue",
    description: "Checking reporter_name and reporter_phone fields with reported_by as null.",
    category: "road_damage",
    priority: "critical",
    location: "Tech Park, Gate 4",
    latitude: 12.9716,
    longitude: 77.5946,
    reported_by: null,
    reporter_name: "John Doe",
    reporter_phone: "9876543210"
});

const options = {
    hostname: '127.0.0.1',
    port: 3010,
    path: '/api/issues',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => { responseBody += chunk; });
    res.on('end', () => {
        try {
            const result = JSON.parse(responseBody);
            console.log('Result:', result);
            if (result.reporter_name === 'John Doe' && result.priority === 'critical') {
                console.log('SUCCESS: All fields correctly stored and returned.');
            } else {
                console.log('FAILURE: Data mismatch or error returned.');
            }
        } catch (e) {
            console.log('Raw Response:', responseBody);
        }
    });
});

req.on('error', (error) => {
    console.error('Verification failed:', error);
});

req.write(data);
req.end();
