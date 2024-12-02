import { ClerkProvider, SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from "react";

export default function App() {

  const { isLoaded, isSignedIn, getToken, userId } = useAuth();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [authorized, setAuthorized]= useState<boolean>(false);

  useEffect(() => {
    const connectWebSocket = async () => {
      if (isSignedIn) {
        const token = await getToken();
        
        const urlParams= new URLSearchParams(window.location.search)
        const clientToken= urlParams.get('client_token')
        const authResults = {userId: userId}

        if (token) {
          const socket = new WebSocket('ws://127.0.0.1:4444');            // Replace with your WebSocket server URL
          socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'authenticate', userId: userId, client_token: clientToken })); //send token to socket server
          };

          socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'authenticated') {
              setAuthorized(true);                                      // WebSocket server authenticated the token
            } else if (data.type === 'error') {
              setAuthorized(false);
            }
          };

          setWs(socket);

          return () => {
            socket.close();
          };
        }
      }
    };

    connectWebSocket();
  }, [isSignedIn, getToken]);


  return (
    <header className='flex justify-center'>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>

        LOGIN SUCCESSFUL
      </SignedIn>
    </header>
  );
}



