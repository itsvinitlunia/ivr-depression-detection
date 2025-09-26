const twilio = require('twilio');

exports.handler = async (event) => {
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Check if this is the initial call or a response to gathering input
    if (!event.body || event.body.length === 0) {
        // Initial call - greet and ask for input
        twiml.say('Hello, welcome to Virtual Buddy. We are here to listen and support you.');
        twiml.say('Please share how you are feeling or what you would like to talk about. Press the pound key when you are finished speaking.');
        
        // Record the user's message
        twiml.record({
            action: '/.netlify/functions/twilio-voice?step=process',
            method: 'POST',
            maxLength: 300, // 5 minutes max
            finishOnKey: '#',
            transcribe: false
        });
        
        twiml.say('Please start speaking now.');
        
    } else {
        // Parse the form data
        const params = new URLSearchParams(event.body);
        const step = params.get('step');
        
        if (step === 'process') {
            // Get the recording URL
            const recordingUrl = params.get('RecordingUrl');
            const callSid = params.get('CallSid');
            const fromNumber = params.get('From');
            
            // Save recording information
            console.log('Recording URL:', recordingUrl);
            console.log('Call SID:', callSid);
            console.log('From:', fromNumber);
            
            // DUMMY BACKEND ANALYSIS - RANDOM SEVERITY (1, 2, or 3)
            const severity = Math.floor(Math.random() * 3) + 1; // Returns 1, 2, or 3
            
            console.log('Dummy Analysis - Severity Level:', severity);
            
            // Store severity in a simple way (in production, use a database)
            // For now, we'll pass it to the SMS function via environment or database simulation
            // We'll simulate storing it by logging it - you'll replace this with actual database
            const analysisData = {
                callSid: callSid,
                phoneNumber: fromNumber,
                severity: severity,
                timestamp: new Date().toISOString()
            };
            
            console.log('Analysis Data:', JSON.stringify(analysisData));
            
            // Respond based on severity
            if (severity === 3) {
                twiml.say('Thank you for sharing. We detect that you might need immediate support. Please stay on the line while we connect you to help.');
                twiml.say('Help is on the way. You are not alone.');
            } else if (severity === 2) {
                twiml.say('Thank you for opening up. We hear you and want you to know that support is available. Check your phone for a helpful message.');
            } else {
                twiml.say('Thank you for sharing. Its good to express your feelings. We are sending you some resources that might help.');
            }
            
            twiml.pause({ length: 1 });
            twiml.say('Take care and remember you are not alone. Goodbye.');
            
            // Set status callback to trigger SMS after call ends
            twiml.hangup();
        }
    }
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml'
        },
        body: twiml.toString()
    };
};