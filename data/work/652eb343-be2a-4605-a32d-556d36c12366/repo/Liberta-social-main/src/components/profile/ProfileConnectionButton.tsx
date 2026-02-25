import { Button } from "@/components/ui/button";
import { Check, UserPlus, Clock } from "lucide-react";
import type { ConnectionState } from "@/hooks/useConnectionStatus";

interface ProfileConnectionButtonProps {
  state: ConnectionState;
  loading: boolean;
  onRequest: () => void;
  onAccept: () => void;
  onReject: () => void;
}

const ProfileConnectionButton = ({
  state,
  loading,
  onRequest,
  onAccept,
  onReject,
}: ProfileConnectionButtonProps) => {
  if (loading) {
    return (
      <div className="flex justify-center gap-3 px-6">
        <Button variant="outline" className="rounded-full px-6" disabled>
          Carregando…
        </Button>
      </div>
    );
  }

  switch (state) {
    case "none":
      return (
        <div className="flex justify-center gap-3 px-6">
          <Button
            onClick={onRequest}
            className="rounded-full px-6 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Solicitar Conexão
          </Button>
        </div>
      );

    case "sent":
      return (
        <div className="flex justify-center gap-3 px-6">
          <Button variant="outline" className="rounded-full px-6" disabled>
            <Clock className="w-4 h-4 mr-1" />
            Solicitação enviada
          </Button>
        </div>
      );

    case "received":
      return (
        <div className="flex justify-center gap-3 px-6">
          <Button
            onClick={onAccept}
            className="rounded-full px-6 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Aceitar
          </Button>
          <Button variant="outline" className="rounded-full px-6" onClick={onReject}>
            Recusar
          </Button>
        </div>
      );

    case "connected":
      return (
        <div className="flex justify-center gap-3 px-6">
          <Button variant="outline" className="rounded-full px-6" disabled>
            <Check className="w-4 h-4 mr-1" />
            Conectados
          </Button>
        </div>
      );
  }
};

export default ProfileConnectionButton;
