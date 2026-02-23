import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, Loader2, ArrowUp } from 'lucide-react';
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
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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

        if (msg.tool_calls && msg.tool_calls.length > 0) {
          apiMessages.push({
            role: 'assistant',
            content: msg.content || null,
            tool_calls: msg.tool_calls,
          });

          for (const tc of msg.tool_calls) {
            const result = await executeToolCall(tc);
            apiMessages.push({ role: 'tool', tool_call_id: tc.id, content: result });
          }

          await queryClient.invalidateQueries({ queryKey: ['verticals'] });
          await queryClient.invalidateQueries({ queryKey: ['all-blocks'] });
          await queryClient.invalidateQueries({ queryKey: ['blocks'] });
          await queryClient.invalidateQueries({ queryKey: ['tasks'] });
          await queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
          await queryClient.invalidateQueries({ queryKey: ['home-all-tasks'] });
          continue;
        }

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

  const hasMessages = messages.length > 0;

  // Collapsed: inline command bar. Expanded: slide-up panel.
  return (
    <>
      {/* Backdrop */}
      {open && hasMessages && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 pointer-events-none",
        open && hasMessages && "pb-0"
      )}>
        <div className={cn(
          "pointer-events-auto w-full transition-all duration-300 ease-out",
          open && hasMessages
            ? "max-w-2xl bg-card border border-border rounded-t-2xl shadow-2xl flex flex-col max-h-[70vh]"
            : "max-w-xl"
        )}>
          {/* Messages area — only when expanded */}
          {open && hasMessages && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Helix AI</span>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                      onClick={() => setMessages([])}
                    >
                      Clear
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setOpen(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
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
                        'max-w-[80%] text-sm',
                        msg.role === 'user'
                          ? 'bg-primary/10 text-foreground rounded-2xl rounded-br-sm px-3.5 py-2'
                          : 'text-foreground'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>p]:leading-relaxed [&>ul]:my-1 [&>ol]:my-1 text-[13px]">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <span className="text-[13px]">{msg.content}</span>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Input bar — always visible at bottom */}
          <div className={cn(
            "flex items-center gap-2",
            open && hasMessages
              ? "px-3 py-2.5 border-t border-border/50"
              : "bg-muted/80 border border-border/80 rounded-xl shadow-md px-3 py-2 backdrop-blur-sm"
          )}>
            {!open && (
              <Sparkles className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => { if (!open) setOpen(true); }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
              }}
              placeholder={open ? "Tell Helix what to do..." : "Ask Helix to add a task..."}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
              disabled={loading}
            />
            {(input.trim() || loading) && (
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  input.trim() && !loading
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
