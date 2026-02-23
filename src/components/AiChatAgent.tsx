import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useVerticals, useCreateVertical } from '@/hooks/useVerticals';
import { useCreateBlock } from '@/hooks/useBlocks';
import { useCreateTask } from '@/hooks/useTasks';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };
type ToolCall = {
  id: string;
  function: { name: string; arguments: string };
};

export function AiChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: verticals = [] } = useVerticals();
  const queryClient = useQueryClient();
  const createVertical = useCreateVertical();
  const createBlock = useCreateBlock();
  const createTask = useCreateTask();

  // Fetch all blocks for context
  const verticalIds = verticals.map(v => v.id);
  const { data: allBlocks = [] } = useQuery({
    queryKey: ['all-blocks', verticalIds],
    queryFn: async () => {
      if (verticalIds.length === 0) return [];
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .in('vertical_id', verticalIds)
        .eq('archived', false);
      if (error) throw error;
      return data;
    },
    enabled: verticalIds.length > 0,
  });

  const getContext = useCallback(() => ({
    verticals: verticals.map(v => ({
      id: v.id,
      name: v.name,
      color: v.color,
      blocks: allBlocks
        .filter(b => b.vertical_id === v.id)
        .map(b => ({ id: b.id, name: b.name })),
    })),
  }), [verticals, allBlocks]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const executeToolCall = async (toolCall: ToolCall): Promise<string> => {
    const args = JSON.parse(toolCall.function.arguments);
    const name = toolCall.function.name;

    try {
      if (name === 'create_vertical') {
        const result = await new Promise<any>((resolve, reject) => {
          createVertical.mutate(
            { name: args.name, color: args.color },
            { onSuccess: resolve, onError: reject }
          );
        });
        return JSON.stringify({ success: true, id: result.id, name: result.name });
      }

      if (name === 'create_block') {
        const result = await new Promise<any>((resolve, reject) => {
          createBlock.mutate(
            { vertical_id: args.vertical_id, name: args.name },
            { onSuccess: resolve, onError: reject }
          );
        });
        return JSON.stringify({ success: true, id: result.id, name: result.name });
      }

      if (name === 'create_task') {
        const taskData: any = { block_id: args.block_id, title: args.title };
        if (args.due_date) taskData.due_date = args.due_date;

        const result = await new Promise<any>((resolve, reject) => {
          createTask.mutate(taskData, { onSuccess: resolve, onError: reject });
        });
        toast.success(`Task "${args.title}" created!`);
        return JSON.stringify({ success: true, id: result.id, title: result.title });
      }

      return JSON.stringify({ error: `Unknown tool: ${name}` });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || 'Tool execution failed' });
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Msg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      let apiMessages: any[] = newMessages.map(m => ({ role: m.role, content: m.content }));
      let continueLoop = true;

      while (continueLoop) {
        const resp = await supabase.functions.invoke('task-chat', {
          body: { messages: apiMessages, context: getContext() },
        });

        if (resp.error) throw new Error(resp.error.message);
        const data = resp.data;

        const choice = data.choices?.[0];
        if (!choice) throw new Error('No response from AI');

        const msg = choice.message;

        // Handle tool calls
        if (msg.tool_calls && msg.tool_calls.length > 0) {
          // Add assistant message with tool calls to conversation
          apiMessages.push({
            role: 'assistant',
            content: msg.content || null,
            tool_calls: msg.tool_calls,
          });

          // Execute each tool call
          for (const tc of msg.tool_calls) {
            const result = await executeToolCall(tc);
            apiMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: result,
            });
          }

          // Invalidate queries so context is fresh
          await queryClient.invalidateQueries({ queryKey: ['verticals'] });
          await queryClient.invalidateQueries({ queryKey: ['all-blocks'] });
          await queryClient.invalidateQueries({ queryKey: ['blocks'] });
          await queryClient.invalidateQueries({ queryKey: ['tasks'] });
          await queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
          await queryClient.invalidateQueries({ queryKey: ['home-all-tasks'] });

          // Continue the loop to get the AI's follow-up response
          continue;
        }

        // Regular text response
        if (msg.content) {
          setMessages(prev => [...prev, { role: 'assistant', content: msg.content }]);
        }
        continueLoop = false;
      }
    } catch (e: any) {
      console.error('Chat error:', e);
      toast.error(e.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
          aria-label="Open AI assistant"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-health-high animate-pulse" />
              <span className="text-sm font-semibold text-foreground">Helix AI</span>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-2">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">Tell me to add a task and I'll guide you through it.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Add a task..."
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                disabled={loading}
              />
              <Button
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
