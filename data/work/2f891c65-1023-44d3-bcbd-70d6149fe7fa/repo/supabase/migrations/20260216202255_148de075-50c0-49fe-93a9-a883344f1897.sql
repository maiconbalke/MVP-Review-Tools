
-- Create connections table for bilateral connection system
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT connections_no_self CHECK (requester_id <> receiver_id),
  CONSTRAINT connections_unique_pair UNIQUE (requester_id, receiver_id)
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Users can see connections they're part of
CREATE POLICY "Users can view own connections"
ON public.connections FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Users can create connection requests
CREATE POLICY "Users can request connections"
ON public.connections FOR INSERT
WITH CHECK (auth.uid() = requester_id AND status = 'pending');

-- Receiver can update (accept/reject), requester can cancel
CREATE POLICY "Users can update own connections"
ON public.connections FOR UPDATE
USING (auth.uid() = receiver_id OR auth.uid() = requester_id);

-- Either party can delete
CREATE POLICY "Users can delete own connections"
ON public.connections FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Add trigger for updated_at
CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add cover_url column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Add indexes
CREATE INDEX idx_connections_requester ON public.connections(requester_id);
CREATE INDEX idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX idx_connections_status ON public.connections(status);
