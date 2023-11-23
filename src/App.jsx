import {useEffect, useState} from 'react';
import axios from 'axios';
import {Box, Button, Modal, TextField, Tooltip, Typography} from "@mui/material";

const App = () => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        background: 'white',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const JSON_LINK_API_KEY = 'pk_897190148ccb6e9c45120460f998ed27bfefa6c7'
    const [audioUrl, setAudioUrl] = useState(null);
    const [websiteUrl, setWebsiteUrl] = useState(null);
    const [websiteMetaImage, setWebsiteMetaImage] = useState("");
    const [websiteContent, setWebsiteContent] = useState(null);
    const [isClickedFetchButton, setIsClickedFetchButton] = useState(false);
    const [open, setOpen] = useState(false);
    const [storedKey, setStoredKey] = useState('');

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const getStoredKey = localStorage.getItem('openAIKey');
        if (getStoredKey) {
            setStoredKey(getStoredKey);
        }
    }, []);

    const handleKeyChange = (event) => {
        if (event.target.value.length === 51) {
            localStorage.setItem('openAIKey', event.target.value);
            setStoredKey(event.target.value);
            setOpen(false);
        }
    };

    useEffect(() => {
        if(!isClickedFetchButton) return;
        const fetchAudio = async (text) => {
            try {
                const response = await axios.post(
                    'https://api.openai.com/v1/audio/speech',
                    {
                        model: 'tts-1',
                        input: text,
                        voice: 'alloy',
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${storedKey}`,
                            'Content-Type': 'application/json',
                        },
                        responseType: 'arraybuffer',
                    }
                );

                const blob = new Blob([response.data], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setIsClickedFetchButton(false);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const getWebsiteMetaImageData = async () => {
            const apiUrl = `https://jsonlink.io/api/extract?url=${websiteUrl}&api_key=${JSON_LINK_API_KEY}`;

            try {
                const response = await axios.get(apiUrl);
                const data = response.data;
                setWebsiteMetaImage(data.images[0])
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const getWebsiteContentData = async () => {
            const options = {
                method: 'GET',
                url: 'https://read3.p.rapidapi.com/api/readability',
                params: {
                    format: 'json',
                    url: websiteUrl
                },
                headers: {
                    'X-RapidAPI-Key': '7aa50ba672msh37b38cdeef9bf7ep17b06fjsn8d40b725cc93',
                    'X-RapidAPI-Host': 'read3.p.rapidapi.com'
                }
            };

            try {
                const response = await axios.request(options);
                setWebsiteContent(response.data);
                fetchAudio(response.data.textContent);
            } catch (error) {
                console.error(error);
            }
        };

        getWebsiteContentData();
        getWebsiteMetaImageData();
    }, [isClickedFetchButton, websiteUrl]);

    return (
    <>
        <div className="flex flex-col items-center justify-center min-h-screen">
            <span className="mb-2 text-xl font-bold">
                Transform Any Website into a Podcast
            </span>
            <span className="mb-2">
                <a href="https://twitter.com/miracsengonul" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-foreground tracking-tight hover:tracking-wide transition-all">
                    @miracsengonul
                </a>
            </span>
            <div className="bg-white rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md">
                { websiteContent && (
                    <div className="flex flex-col space-y-1.5 p-6 pb-0 mb-0">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight text-center">
                            {websiteContent.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                            {websiteContent.byline}
                        </p>
                    </div>
                )}
                <div className="p-6 rounded-lg">
                    <img
                        src={websiteMetaImage ? websiteMetaImage : './logo2.png'}
                        alt="Album Cover"
                        width="300"
                        height="300"
                        className="aspect-square mx-auto rounded-lg object-cover shadow-md"
                    />
                    <h2 className="text-md font-semibold text-center my-8">
                        Enter your website link
                    </h2>
                    <input onChange={(event)=> setWebsiteUrl(event.target.value)} autoComplete='off' placeholder="https://medium.com/@user/xxxxxx" className="w-full border border-input bg-background rounded-md px-4 py-2 mb-6 text-sm text-zinc-500 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                    <div className="flex items-center justify-center gap-4">
                        { !storedKey && (
                            <Tooltip title="You need to enter your OpenAI API Key to generate audio files.">
                                <button
                                    className="inline-flex opacity-60 items-center group justify-center text-sm font-medium ring-offset-background transition-colors cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-6 w-6"
                                    >
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                </button>
                            </Tooltip>
                        )}
                        { !isClickedFetchButton && storedKey && (
                            <button onClick={() => setIsClickedFetchButton(true)}
                                    className="inline-flex items-center group justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6 group-hover:fill-black"
                                >
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            </button>
                        )}
                        { isClickedFetchButton && !audioUrl && (
                            <div className="mt-4 flex justify-center items-center">
                                <div role="status">
                                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin fill-black" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        )
                        }
                        <button onClick={handleOpen}
                                className="inline-flex items-center group justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8">
                            OpenAI API Key 🔑
                        </button>
                    </div>
                    {audioUrl && (
                        <div className="mt-6 flex flex-col items-center">
                            <label htmlFor="volume" className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                                File
                            </label>
                            <audio autoPlay controls src={audioUrl} />
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="flex flex-col items-center justify-center">
           <div className="p-4 bg-white rounded-lg border bg-card text-card-foreground shadow-sm w-full">
               <div className="mb-4">
                   Supported languages
               </div>
               <div className="font-light grid grid-cols-2 place-items-center md:grid-cols-5 md:grid-cols-9 md:pl-4 md:place-items-start gap-4 text-left">
                   <div>🇦🇲 Armenian</div>
                   <div>🇦🇿 Azerbaijani</div>
                   <div>🇧🇾 Belarusian</div>
                   <div>🇧🇦 Bosnian</div>
                   <div>🇧🇬 Bulgarian</div>
                   <div>🇨🇦 Catalan</div>
                   <div>🇨🇳 Chinese</div>
                   <div>🇭🇷 Croatian</div>
                   <div>🇨🇿 Czech</div>
                   <div>🇩🇰 Danish</div>
                   <div>🇳🇱 Dutch</div>
                   <div>🇬🇧 English</div>
                   <div>🇪🇪 Estonian</div>
                   <div>🇫🇮 Finnish</div>
                   <div>🇫🇷 French</div>
                   <div>🇪🇸 Galician</div>
                   <div>🇩🇪 German</div>
                   <div>🇬🇷 Greek</div>
                   <div>🇮🇱 Hebrew</div>
                   <div>🇮🇳 Hindi</div>
                   <div>🇭🇺 Hungarian</div>
                   <div>🇮🇸 Icelandic</div>
                   <div>🇮🇩 Indonesian</div>
                   <div>🇮🇹 Italian</div>
                   <div>🇯🇵 Japanese</div>
                   <div>🇰🇿 Kannada</div>
                   <div>🇰🇿 Kazakh</div>
                   <div>🇰🇷 Korean</div>
                   <div>🇱🇻 Latvian</div>
                   <div>🇱🇹 Lithuanian</div>
                   <div>🇲🇰 Macedonian</div>
                   <div>🇲🇾 Malay</div>
                   <div>🇲🇭 Marathi</div>
                   <div>🇳🇿 Maori</div>
                   <div>🇳🇵 Nepali</div>
                   <div>🇳🇴 Norwegian</div>
                   <div>🇮🇷 Persian</div>
                   <div>🇵🇱 Polish</div>
                   <div>🇵🇹 Portuguese</div>
                   <div>🇷🇴 Romanian</div>
                   <div>🇷🇺 Russian</div>
                   <div>🇷🇸 Serbian</div>
                   <div>🇸🇰 Slovak</div>
                   <div>🇸🇮 Slovenian</div>
                   <div>🇪🇸 Spanish</div>
                   <div>🇸🇼 Swahili</div>
                   <div>🇸🇪 Swedish</div>
                   <div>🇵🇭 Tagalog</div>
                   <div>🇹🇭 Tamil</div>
                   <div>🇹🇭 Thai</div>
                   <div>🇹🇷 Turkish</div>
                   <div>🇺🇦 Ukrainian</div>
                   <div>🇵🇰 Urdu</div>
                   <div>🇻🇳 Vietnamese</div>
                   <div>🏴󠁧󠁢󠁷󠁬󠁳󠁿 Welsh</div>
               </div>
           </div>
        </div>
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Enter your OpenAI API Key
                </Typography>
                <Typography sx={{ mt: 1 }} variant="caption">
                    We do not store your API key; it is solely used for generating audio files. You can verify this in the local storage.
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }} className="flex flex-col gap-4">
                    <TextField id="outlined-basic" label="Api Key" variant="outlined" value={storedKey} onChange={handleKeyChange} />
                </Typography>
            </Box>
        </Modal>
    </>
    );
};

export default App;
