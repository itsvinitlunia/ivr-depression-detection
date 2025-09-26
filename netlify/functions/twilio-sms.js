const twilio = require('twilio');

// Simple in-memory store for demo purposes (use database in production)
const callDataStore = {};

exports.handler = async (event) => {
    const params = new URLSearchParams(event.body);
    const callStatus = params.get('CallStatus');
    const callSid = params.get('CallSid');
    const fromNumber = params.get('From');
    
    console.log('SMS Function Triggered - Call Status:', callStatus);
    console.log('Call SID:', callSid);
    console.log('From Number:', fromNumber);
    
    if (callStatus === 'completed') {
        // Call ended - time to send appropriate SMS
        
        // DUMMY: Generate random severity if not stored (for testing)
        let severity = callDataStore[callSid];
        
        if (!severity) {
            // If no severity stored, generate random one (1, 2, or 3)
            severity = Math.floor(Math.random() * 3) + 1;
            console.log('No stored severity found, using random:', severity);
        } else {
            console.log('Using stored severity:', severity);
        }
        
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        try {
            if (severity === 3) {
                // Severe case - notify emergency contact
                console.log('Sending emergency notifications for severity 3');
                
                await client.messages.create({
                    body: `URGENT: User ${fromNumber} has been identified as high risk for depression. Please reach out immediately. Call SID: ${callSid}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: process.env.EMERGENCY_CONTACT_NUMBER || fromNumber // Fallback to user's number for testing
                });
                
                // Also send message to user
                await client.messages.create({
                    body: 'We care about you. Help is available 24/7: National Suicide Prevention Lifeline: 988. You are not alone. ❤️',
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: fromNumber
                });
                
            } else if (severity === 2) {
                // Medium severity
                console.log('Sending medium severity message');
                
                await client.messages.create({
                    body: 'Thank you for reaching out. Tough times dont last, but tough people do. 🌈 Here is a helpful video: https://youtube.com/watch?v=uplift Stay strong!',
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: fromNumber
                });
                
            } else if (severity === 1) {
                // Low severity
                console.log('Sending low severity message');
                
                await client.messages.create({
                    body: 'Thanks for sharing! 😊 Small steps lead to big changes. Here is something to brighten your day: https://youtube.com/watch?v=happy Keep going!',
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: fromNumber
                });
            }
            
            console.log('SMS sent successfully for severity:', severity);
            
        } catch (error) {
            console.error('SMS sending error:', error);
        }
        
        // Clean up stored data
        delete callDataStore[callSid];
    }
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml'
        },
        body: '<Response></Response>'
    };
};

// Simple function to store severity (replace with database in production)
function storeSeverity(callSid, severity) {
    callDataStore[callSid] = severity;
}

// Simple function to retrieve severity (replace with database in production)
function getStoredSeverity(callSid) {
    return callDataStore[callSid];
}