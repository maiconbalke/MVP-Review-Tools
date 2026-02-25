import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import BottomSheet from "@/components/BottomSheet";

interface CreatePostSheetProps {
  open: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const CreatePostSheet = ({ open, onClose, onPostCreated }: CreatePostSheetProps) => {
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.slice(0, 10 - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePublish = async () => {
    if (!user || (images.length === 0 && !caption.trim())) return;
    setSaving(true);

    try {
      // Upload images to storage
      const uploadedUrls: string[] = [];
      for (const img of images) {
        const ext = img.file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(path, img.file);

        if (uploadError) {
          toast({ title: "Erro ao enviar imagem", description: uploadError.message, variant: "destructive" });
          setSaving(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }

      // Create post
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          caption: caption.trim() || null,
          image_url: uploadedUrls[0] || null,
        })
        .select("id")
        .single();

      if (postError || !post) {
        toast({ title: "Erro ao criar post", variant: "destructive" });
        setSaving(false);
        return;
      }

      // Insert media entries
      if (uploadedUrls.length > 0) {
        await supabase.from("post_media").insert(
          uploadedUrls.map((url, i) => ({
            post_id: post.id,
            media_url: url,
            position: i,
          }))
        );
      }

      toast({ title: "Post publicado!" });
      setCaption("");
      setImages([]);
      onPostCreated?.();
      onClose();
    } catch {
      toast({ title: "Erro inesperado", variant: "destructive" });
    }
    setSaving(false);
  };

  const reset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setCaption("");
    setImages([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      title="Nova publicação"
      onClose={handleClose}
      onConfirm={handlePublish}
      confirmLabel="Publicar"
    >
      <div className="space-y-4">
        {/* Image grid */}
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
              <img src={img.preview} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-foreground" />
              </button>
            </div>
          ))}
          {images.length < 10 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs">Adicionar</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />

        {/* Caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Escreva uma legenda..."
          rows={4}
          className="w-full bg-secondary/50 rounded-lg border border-border p-3 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none transition-colors"
        />

        {saving && (
          <div className="flex justify-center py-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default CreatePostSheet;
