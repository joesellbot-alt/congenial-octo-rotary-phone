import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '@/hooks/useStore';
import { api } from '@/api/client';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const STARTER_PROMPTS = [
  'Build me a task management app with teams and deadlines',
  'Create an e-commerce store with product catalog and checkout',
  'Build a CRM with contact management and sales pipeline',
  'Create a project management tool with kanban boards',
  'Build a SaaS dashboard with user analytics and billing',
  'Create a booking/scheduling app with calendar integration',
];

export default function BuilderChat() {
  const { projectId } = useParams();
  const { messages, isGenerating, addMessage, setGenerating, setMessages } = useChatStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      api.get(`/projects/${projectId}/messages`).then(setMessages).catch(() => {});
    } else {
      setMessages([]);
    }
  }, [projectId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content) => {
    const userMessage = { role: 'user', content, timestamp: Date.now() };
    addMessage(userMessage);
    setGenerating(true);

    try {
      const response = await api.post('/ai/generate', {
        message: content,
        projectId: projectId || null,
        history: messages,
      });

      addMessage({
        role: 'assistant',
        content: response.message,
        generatedFiles: response.generatedFiles,
        timestamp: Date.now(),
      });

      if (response.projectId && !projectId) {
        window.history.replaceState(null, '', `/build/${response.projectId}`);
      }
    } catch (error) {
      toast.error(error.message || 'Generation failed');
      addMessage({
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">
          {projectId ? 'Continue Building' : 'Build a New App'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Describe what you want and the AI will generate it
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8">
            <Sparkles className="mb-4 h-12 w-12 text-primary/50" />
            <h2 className="mb-2 text-xl font-semibold">What would you like to build?</h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Describe your app idea and I&apos;ll generate a complete full-stack application
            </p>
            <div className="grid max-w-2xl gap-2 sm:grid-cols-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="rounded-md border p-3 text-left text-sm transition-colors hover:bg-accent"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isGenerating && (
              <div className="flex gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                </div>
                <div className="rounded-lg bg-muted px-4 py-3">
                  <p className="text-sm text-muted-foreground">Generating your app...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput onSend={handleSend} isLoading={isGenerating} />
    </div>
  );
}
