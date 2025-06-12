const { Amplify } = require('aws-amplify');
const { signIn, fetchAuthSession } = require('aws-amplify/auth');

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'eu-north-1_QUaZ7e7OU',
      userPoolClientId: '66ako4srqdk2aghompd956bloa',
      region: 'eu-north-1',
    }
  }
});

async function getToken() {
  try {
    const signInResult = await signIn({
      username: 'demo@junokit.com',
      password: 'TempPass123!'
    });
    
    if (signInResult.isSignedIn) {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();
      console.log(accessToken);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getToken(); 