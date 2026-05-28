##### DAY 1

##### 

###### Tech Stack:-



* Frontend: Next.js and Tailwind CSS
* &#x20;Backend: Flask 
* &#x20;Database :Supabase 
* &#x20;Speech Recognition API: Deepgram (Free)



###### System Architecture:-



* frontend(client side)=Built with Next.js, it handles the user interface using Tailwind CSS for a responsive design\[cite: 1]. It uses the browser's `navigator.mediaDevices` API to capture microphone audio, manages the recording state, and sends the audio files to the backend using the Fetch API



* backend(server side)=A Python Flask server that acts as the bridge\[cite: 1]. It utilizes CORS to safely communicate with the frontend, receives the audio file uploads via a POST route, and forwards the audio to the Speech-to-Text API to retrieve and return the transcript

###### 

###### Wireframes \& Design:-

* screen 1(recorder)=A clean interface featuring a Start/Stop recording button alongside a live text display area for the real-time transcript
* screen 2(history)=A dashboard displaying a list of past recording sessions

DAY 2
create a custome ui using a tailwand css


