const { Amplify } = require('aws-amplify');
const { signIn, fetchAuthSession } = require('aws-amplify/auth');

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'eu-north-1_QUaZ7e7OU',
      userPoolClientId: '66ako4srqdk2aghompd956bloa',
      region: 'eu-north-1',
    }
  }
});

async function testAuth() {
  try {
    console.log('Signing in...');
    const signInResult = await signIn({
      username: 'demo@junokit.com',
      password: 'TempPass123!'
    });
    
    if (signInResult.isSignedIn) {
      console.log('Getting auth session...');
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();
      
      console.log('Testing API call...');
      const response = await fetch('https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1/chat', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API Response status:', response.status);
      const responseText = await response.text();
      console.log('API Response:', responseText);
      
      if (response.ok) {
        console.log('✅ Authentication is working!');
      } else {
        console.log('❌ Still getting authentication error');
      }
    } else {
      console.log('Sign in not completed:', signInResult);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuth(); 