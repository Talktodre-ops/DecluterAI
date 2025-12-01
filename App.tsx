import React, { useState, useRef, useEffect } from 'react';
import { Message, AppState } from './types';
import { organizationService, fileToGenerativePart } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { UploadIcon, SendIcon, SparklesIcon, PhotoIcon, TrashIcon, BotIcon } from './components/Icons';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        alert("Please upload an image file.");
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Initial Organization Request (Start Chat)
  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setAppState(AppState.CHATTING);
    setIsLoading(true);

    try {
      const base64Image = await fileToGenerativePart(selectedFile);
      const userText = "Analyze this room and give me organization tips.";

      const initialMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: userText,
        image: base64Image,
        timestamp: Date.now()
      };

      setMessages([initialMessage]);
      
      // Reset file selection in UI after sending, as it's now in the chat history
      clearFile();

      const responseText = await organizationService.sendMessage(userText, base64Image);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error analyzing the image. Please try again.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Follow-up Chat
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isLoading) return;

    const currentText = inputValue;
    const currentFile = selectedFile;
    
    setInputValue('');
    clearFile(); // Clear staging area
    setIsLoading(true);

    let base64Image: string | undefined;
    if (currentFile) {
        base64Image = await fileToGenerativePart(currentFile);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: currentText || (currentFile ? "Analyze this new image." : ""),
      image: base64Image,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const responseText = await organizationService.sendMessage(
          currentText || "Analyze this image.", 
          base64Image
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
       const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, something went wrong. Please check your connection or try again.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-emerald-600">
          <SparklesIcon className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight text-slate-800">DeclutterAI</h1>
        </div>
        {appState === AppState.CHATTING && (
            <button 
                onClick={() => {
                    setAppState(AppState.WELCOME);
                    setMessages([]);
                    organizationService.startNewSession();
                }}
                className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
            >
                New Session
            </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative max-w-5xl mx-auto w-full flex flex-col">
        
        {appState === AppState.WELCOME ? (
          // Welcome View
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center animate-fade-in">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg rotate-3 transition-transform hover:rotate-6">
                <PhotoIcon className="w-10 h-10" />
             </div>
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
               Organize your space with AI
             </h2>
             <p className="text-slate-500 max-w-md mb-10 text-lg">
               Upload a photo of your messy room, shelf, or closet. We'll give you a personalized decluttering plan and answer your questions.
             </p>

             <div className="w-full max-w-md">
                <label 
                  className={`
                    flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer 
                    transition-all duration-300 group
                    ${previewUrl ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50'}
                  `}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {previewUrl ? (
                        <div className="relative w-full h-full p-4">
                            <img src={previewUrl} alt="Preview" className="h-48 object-contain rounded-lg shadow-sm" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Change Photo</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <UploadIcon className="w-10 h-10 mb-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                            <p className="mb-2 text-sm text-slate-500 font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-slate-400">SVG, PNG, JPG (max. 10MB)</p>
                        </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileSelect} 
                  />
                </label>

                {previewUrl && (
                  <button
                    onClick={handleStartAnalysis}
                    className="mt-6 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                        <span className="animate-pulse">Analyzing...</span>
                    ) : (
                        <>
                           <SparklesIcon className="w-5 h-5" />
                           Analyze Room
                        </>
                    )}
                  </button>
                )}
             </div>
          </div>
        ) : (
          // Chat View
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                 <div className="flex w-full justify-start mb-6 animate-pulse">
                    <div className="flex max-w-[80%] items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                            <BotIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                            <div className="flex space-x-1 h-5 items-center">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
               {/* File Preview Staged in Chat */}
               {previewUrl && (
                 <div className="mb-3 relative inline-block">
                    <img src={previewUrl} alt="Staged" className="h-20 w-auto rounded-lg border border-slate-200 shadow-sm" />
                    <button 
                        onClick={clearFile}
                        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow border border-slate-200 hover:bg-red-50"
                    >
                        <TrashIcon className="w-3 h-3" />
                    </button>
                 </div>
               )}

               <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                    title="Upload image"
                  >
                    <PhotoIcon className="w-6 h-6" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask follow-up questions..."
                    className="flex-1 px-4 py-3 bg-slate-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 placeholder-slate-400 transition-all"
                  />
                  
                  <button
                    type="submit"
                    disabled={isLoading || (!inputValue.trim() && !selectedFile)}
                    className="p-3 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                  >
                    <SendIcon className="w-5 h-5" />
                  </button>
               </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;