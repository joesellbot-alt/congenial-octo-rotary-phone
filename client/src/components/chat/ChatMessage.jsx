import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 p-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {message.type === 'code' ? (
          <pre className="overflow-x-auto rounded bg-background/50 p-3 text-xs">
            <code>{message.content}</code>
          </pre>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {message.generatedFiles && (
          <div className="mt-2 border-t border-border/50 pt-2">
            <p className="text-xs font-medium opacity-70">Generated files:</p>
            <ul className="mt-1 space-y-0.5">
              {message.generatedFiles.map((file) => (
                <li key={file} className="text-xs opacity-60">
                  {file}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
