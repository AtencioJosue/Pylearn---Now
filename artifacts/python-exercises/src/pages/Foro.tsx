import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { MessageCircle, Plus, X, Image as ImageIcon, Send, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const api = (path: string) => `${BASE}/api${path}`;

interface Post {
  id: number;
  user_id: string;
  author_name: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  comment_count: number;
}

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "justo ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function PostDetail({ postId, onBack }: { postId: number; onBack: () => void }) {
  const { user } = useUser();
  const [post, setPost] = useState<Post & { comments: Comment[] } | null>(null);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const res = await fetch(api(`/forum/posts/${postId}`));
    if (res.ok) setPost(await res.json());
  };

  useEffect(() => { load(); }, [postId]);

  const sendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    setSending(true);
    await fetch(api(`/forum/posts/${postId}/comments`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, author_name: user.name, content: comment.trim() }),
    });
    setComment("");
    setSending(false);
    load();
  };

  if (!post) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-medium transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Volver al foro
      </button>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold">{post.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-bold text-foreground">{post.author_name}</span> · {timeAgo(post.created_at)}
            </p>
          </div>
        </div>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
        {post.image_url && (
          <img src={post.image_url} alt="Imagen del post" className="max-w-full rounded-2xl border border-border" />
        )}
      </div>

      <div className="space-y-4 mb-6">
        <h2 className="font-display font-bold text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          {post.comments.length} respuestas
        </h2>
        {post.comments.length === 0 && (
          <p className="text-muted-foreground text-center py-6 bg-muted/30 rounded-2xl">
            Sé el primero en responder este post.
          </p>
        )}
        {post.comments.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/50">
            <p className="text-sm font-bold text-foreground mb-1">{c.author_name} <span className="text-muted-foreground font-normal">· {timeAgo(c.created_at)}</span></p>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={sendComment} className="bg-white rounded-2xl p-4 shadow-sm border border-border/50">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Escribe tu respuesta..."
            rows={3}
            className="w-full resize-none border-none outline-none bg-transparent text-foreground font-medium"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!comment.trim() || sending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              Responder
            </button>
          </div>
        </form>
      ) : (
        <p className="text-center text-muted-foreground text-sm">Regístrate para comentar.</p>
      )}
    </div>
  );
}

export function Foro() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    const res = await fetch(api("/forum/posts"));
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    await fetch(api("/forum/posts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        author_name: user.name,
        title: newTitle.trim(),
        content: newContent.trim(),
        image_url: newImageUrl.trim() || undefined,
      }),
    });
    setNewTitle(""); setNewContent(""); setNewImageUrl("");
    setShowCreate(false);
    setCreating(false);
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {selectedPost ? (
          <PostDetail postId={selectedPost} onBack={() => setSelectedPost(null)} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                  <MessageCircle className="w-8 h-8 text-primary" />
                  Foro de la comunidad
                </h1>
                <p className="text-muted-foreground mt-1">Haz preguntas, comparte recursos y ayuda a otros estudiantes.</p>
              </div>
              {user && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo post
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Cargando posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-border/50">
                <MessageCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-bold text-muted-foreground">El foro está vacío</p>
                <p className="text-sm text-muted-foreground mt-1">¡Sé el primero en publicar algo!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, i) => (
                  <motion.button
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedPost(post.id)}
                    className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-lg leading-tight truncate">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-bold text-foreground">{post.author_name}</span> · {timeAgo(post.created_at)}
                        </p>
                        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{post.content}</p>
                      </div>
                      {post.image_url && (
                        <img src={post.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comment_count} respuesta{post.comment_count !== 1 ? "s" : ""}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal crear post */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl">Nuevo post</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createPost} className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">Título</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="¿Cuál es tu pregunta o tema?"
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none font-medium transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Contenido</label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Describe tu duda, comparte código o explica tu problema con detalle..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none font-medium transition-colors resize-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  URL de imagen (opcional)
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none font-medium transition-colors"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border-2 border-border font-bold hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim() || !newContent.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : <Send className="w-4 h-4" />}
                  Publicar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
