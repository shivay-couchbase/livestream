'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Upload, Send, FileText } from "lucide-react"
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export function ChatWithPDF() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append('file', file)
  
      try {
        const response = await fetch('/api/ingestPdf', {
          method: 'POST',
          body: formData,
        })
  
        if (!response.ok) {
          throw new Error('Failed to upload and process PDF')
        }
  
        const result = await response.json()
        console.log('PDF processed:', result)
        // You might want to set some state here to indicate the PDF is ready for querying
      } catch (error) {
        console.error('Error processing PDF:', error)
        alert('Error processing PDF. Please try again.')
      }
    } else {
      alert('Please upload a PDF file')
    }
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { role: 'user', content: inputMessage }])
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputMessage }),
        })
  
        if (!response.ok) {
          throw new Error('Failed to get response from chat API')
        }
  
        const result = await response.json()
        setMessages(prev => [...prev, { role: 'bot', content: result.response }])
      } catch (error) {
        console.error('Error in chat:', error)
        setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' }])
      }
  
      setInputMessage('')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex flex-grow overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 p-4 flex flex-col overflow-hidden">
          {/* PDF Uploader */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                  </div>
                  <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} accept=".pdf" />
                </label>
              </div>
            </CardContent>
          </Card>
          
        {/* PDF Viewer */}
        <Card className="flex-grow overflow-hidden">
          <CardContent className="p-4 h-full">
            {pdfUrl ? (
              <div style={{ height: '100%' }}>
                <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200 rounded-lg">
                <p className="text-gray-400">No PDF uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="w-1/2 p-4 flex flex-col overflow-hidden">
          <Card className="flex-grow overflow-hidden">
            <CardContent className="p-4 flex flex-col h-full">
              <ScrollArea className="flex-grow mb-4">
                {messages.map((message, index) => (
                  <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {message.content}
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <Separator className="my-2" />
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-grow mr-2"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 px-6">
        <div className="container mx-auto flex flex-wrap justify-between items-center text-sm">
          <div className="w-full sm:w-auto text-center sm:text-left mb-2 sm:mb-0">
            Powered by:
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end space-x-4">
            <a href="https://www.couchbase.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">Couchbase</a>
            <a href="https://v0.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">V0</a>
            <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">Vercel</a>
            <a href="https://cursor.sh/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">Cursor</a>
          </div>
        </div>
      </footer>
    </div>
  )
}