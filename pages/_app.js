import { Amplify } from 'aws-amplify';
import { cognitoConfig } from '../lib/config';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognitoConfig.userPoolId,
      userPoolClientId: cognitoConfig.userPoolClientId,
      region: cognitoConfig.region
    }
  }
});

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
