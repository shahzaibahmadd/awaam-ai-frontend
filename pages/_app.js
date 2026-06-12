import { AuthProvider } from '../context/AuthContext';
import '../src/styles/globals.css'; // Your Tailwind styles

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;