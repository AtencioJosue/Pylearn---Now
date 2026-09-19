import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ChevronLeft,
  Heart,
  Image as ImageIcon,
  Link2,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  Upload,
  X,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const api = (path: string) => `${BASE}/api${path}`;

async function apiError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error.trim()) return body.error;
  } catch {
    // The server did not return JSON. The user-facing fallback is clearer.
  }
  return fallback;
}

function readableError(error: unknown, fallback: string) {
  if (error instanceof TypeError && /fetch/i.test(error.message))
    return fallback;
  return error instanceof Error && error.message ? error.message : fallback;
}

interface Post {
  id: number;
  user_id: string;
  author_name: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  comment_count: number;
  likes_count?: number;
  liked_by?: string[];
}

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
  likes_count?: number;
  liked_by?: string[];
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "justo ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function PostDetail({
  postId,
  onBack,
}: {
  postId: number;
  onBack: () => void;
}) {
  const { user } = useUser();
  const [post, setPost] = useState<(Post & { comments: Comment[] }) | null>(
    null,
  );
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(api(`/forum/posts/${postId}`));
      if (!res.ok)
        throw new Error(
          await apiError(res, "No se pudo abrir esta publicación."),
        );
      setPost(await res.json());
    } catch (loadError) {
      setError(
        readableError(
          loadError,
          "No pudimos conectar con el foro. Revisa el servidor e inténtalo otra vez.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    setPost(null);
    setActionError("");
    void load();
  }, [load]);

  const sendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    setSending(true);
    setActionError("");
    try {
      const res = await fetch(api(`/forum/posts/${postId}/comments`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          author_name: user.name,
          content: comment.trim(),
        }),
      });
      if (!res.ok)
        throw new Error(
          await apiError(res, "No se pudo publicar la respuesta."),
        );
      setComment("");
      await load();
    } catch (sendError) {
      setActionError(
        readableError(
          sendError,
          "No pudimos publicar tu respuesta. Inténtalo de nuevo.",
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const likePost = async () => {
    if (!user || !post) return;
    if (post.liked_by?.includes(user.id)) return;
    const previous = post;
    setActionError("");
    setPost({
      ...post,
      likes_count: (post.likes_count || 0) + 1,
      liked_by: [...(post.liked_by || []), user.id],
    });
    try {
      const res = await fetch(api(`/forum/posts/${postId}/like`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (!res.ok)
        throw new Error(await apiError(res, "No se pudo guardar tu reacción."));
    } catch (likeError) {
      setPost(previous);
      setActionError(
        readableError(likeError, "No pudimos guardar tu reacción."),
      );
    }
  };

  const likeComment = async (commentId: number) => {
    if (!user || !post) return;
    const c = post.comments.find((item) => item.id === commentId);
    if (!c || c.liked_by?.includes(user.id)) return;
    const previous = post;
    setActionError("");
    setPost({
      ...post,
      comments: post.comments.map((item) =>
        item.id === commentId
          ? {
              ...item,
              likes_count: (item.likes_count || 0) + 1,
              liked_by: [...(item.liked_by || []), user.id],
            }
          : item,
      ),
    });
    try {
      const res = await fetch(api(`/forum/comments/${commentId}/like`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (!res.ok)
        throw new Error(await apiError(res, "No se pudo guardar tu reacción."));
    } catch (likeError) {
      setPost(previous);
      setActionError(
        readableError(likeError, "No pudimos guardar tu reacción."),
      );
    }
  };

  if (loading && !post)
    return (
      <div className="text-center py-12 text-muted-foreground">Cargando...</div>
    );
  if (!post)
    return (
      <div className="pylearn-card py-12 px-6 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
        <p className="font-bold text-[var(--texto-principal)]">
          {error || "No se pudo abrir esta publicación."}
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[var(--linea-conexion)] font-bold text-[var(--texto-principal)]"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Volver al foro
      </button>

      {(error || actionError) && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-[var(--texto-principal)]"
        >
          {actionError || error}
        </div>
      )}

      <div className="pylearn-card mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold">{post.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-bold text-foreground">
                {post.author_name}
              </span>{" "}
              · {timeAgo(post.created_at)}
            </p>
          </div>
        </div>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-4">
          {post.content}
        </p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Imagen del post"
            className="max-w-full rounded-2xl border border-border mb-4"
          />
        )}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
          <button
            onClick={likePost}
            disabled={!user || post.liked_by?.includes(user.id)}
            className={`flex items-center gap-1.5 font-bold transition-colors ${
              post.liked_by?.includes(user?.id ?? "")
                ? "text-red-500"
                : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart
              className="w-5 h-5"
              fill={
                post.liked_by?.includes(user?.id ?? "")
                  ? "currentColor"
                  : "none"
              }
            />
            <span>{post.likes_count || 0}</span>
          </button>
        </div>
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
        {post.comments.map((c) => (
          <div key={c.id} className="pylearn-card p-4 rounded-2xl">
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm font-bold text-[var(--texto-principal)]">
                {c.author_name}{" "}
                <span className="text-[var(--texto-principal)] opacity-50 font-normal">
                  · {timeAgo(c.created_at)}
                </span>
              </p>
              <button
                onClick={() => likeComment(c.id)}
                disabled={!user || c.liked_by?.includes(user.id)}
                className={`flex items-center gap-1 text-sm font-bold transition-colors ${
                  c.liked_by?.includes(user?.id ?? "")
                    ? "text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={
                    c.liked_by?.includes(user?.id ?? "")
                      ? "currentColor"
                      : "none"
                  }
                />
                <span>{c.likes_count || 0}</span>
              </button>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {c.content}
            </p>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={sendComment} className="pylearn-card p-4 rounded-2xl">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu respuesta..."
            rows={3}
            className="w-full resize-none border-none outline-none bg-transparent text-[var(--texto-principal)] placeholder-[var(--texto-principal)]/40 font-medium"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!comment.trim() || sending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              {sending ? "Enviando..." : "Responder"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-center text-muted-foreground text-sm">
          Regístrate para comentar.
        </p>
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
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [imageError, setImageError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [createError, setCreateError] = useState("");

  const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Selecciona un archivo de imagen válido.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(
        `La imagen es muy grande (${(file.size / 1024 / 1024).toFixed(1)} MB). El límite es 2 MB.`,
      );
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNewImageUrl(reader.result as string);
    };
    reader.onerror = () => {
      setImageError("No se pudo leer la imagen. Prueba con otro archivo.");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(api("/forum/posts"));
      if (!res.ok)
        throw new Error(
          await apiError(res, "No se pudieron cargar las publicaciones."),
        );
      setPosts(await res.json());
    } catch (error) {
      setLoadError(
        readableError(
          error,
          "No pudimos conectar con el foro. Comprueba que el servidor esté funcionando.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch(api("/forum/posts"), {
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
      if (!res.ok)
        throw new Error(await apiError(res, "No se pudo publicar el post."));
      setNewTitle("");
      setNewContent("");
      setNewImageUrl("");
      setImageMode("file");
      setImageError("");
      setShowCreate(false);
      await loadPosts();
    } catch (error) {
      setCreateError(
        readableError(
          error,
          "No pudimos publicar el post. Inténtalo otra vez.",
        ),
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="min-h-screen page-bg" style={{ minHeight: "100dvh" }}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          {selectedPost ? (
            <PostDetail
              postId={selectedPost}
              onBack={() => setSelectedPost(null)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-display font-bold flex items-center gap-3 text-[var(--texto-principal)]">
                    <MessageCircle className="w-8 h-8 text-primary" />
                    Foro de la comunidad
                  </h1>
                  <p className="text-[var(--texto-principal)] opacity-70 mt-1">
                    Haz preguntas, comparte recursos y ayuda a otros
                    estudiantes.
                  </p>
                </div>
                {user && (
                  <button
                    onClick={() => {
                      setCreateError("");
                      setShowCreate(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Nuevo post
                  </button>
                )}
              </div>

              {loadError && (
                <div
                  role="alert"
                  className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-[var(--texto-principal)]"
                >
                  <span>{loadError}</span>
                  <button
                    type="button"
                    onClick={() => void loadPosts()}
                    className="inline-flex items-center gap-1.5 font-bold"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                  </button>
                </div>
              )}

              {loading ? (
                <div className="text-center py-12 text-[var(--texto-principal)] opacity-60">
                  Cargando posts...
                </div>
              ) : posts.length === 0 ? (
                !loadError && (
                  <div className="text-center py-16 pylearn-card">
                    <MessageCircle className="w-12 h-12 text-[var(--texto-principal)] opacity-30 mx-auto mb-3" />
                    <p className="font-bold text-[var(--texto-principal)]">
                      El foro está vacío
                    </p>
                    <p className="text-sm text-[var(--texto-principal)] opacity-60 mt-1">
                      ¡Sé el primero en publicar algo!
                    </p>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {posts.map((post, i) => (
                    <motion.button
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedPost(post.id)}
                      className="w-full text-left pylearn-card hover:border-primary/30 hover:shadow-md transition-all p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-lg leading-tight truncate text-[var(--texto-principal)]">
                            {post.title}
                          </h3>
                          <p className="text-sm text-[var(--texto-principal)] opacity-60 mt-1">
                            <span className="font-bold text-[var(--texto-principal)]">
                              {post.author_name}
                            </span>{" "}
                            · {timeAgo(post.created_at)}
                          </p>
                          <p className="text-[var(--texto-principal)] opacity-70 text-sm mt-2 line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-[var(--linea-conexion)]"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm font-bold">
                        <div className="flex items-center gap-1.5 text-red-500">
                          <Heart
                            className="w-4 h-4"
                            fill={
                              post.liked_by?.includes(user?.id ?? "")
                                ? "currentColor"
                                : "none"
                            }
                          />
                          <span>{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--texto-principal)] opacity-75">
                          <MessageCircle className="w-4 h-4" />
                          <span>
                            {post.comment_count} respuesta
                            {post.comment_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal crear post */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowCreate(false)}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-[var(--bg-tarjetas)] text-[var(--texto-principal)] rounded-3xl p-6 w-full max-w-lg shadow-2xl border-4 border-[var(--linea-conexion)] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl text-[var(--texto-principal)]">
                Nuevo post
              </h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-2 rounded-full hover:bg-[var(--bg-general)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--texto-principal)]" />
              </button>
            </div>
            <form onSubmit={createPost} className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block text-[var(--texto-principal)]">
                  Título
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="¿Cuál es tu pregunta o tema?"
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl border-2 bg-[var(--bg-general)] text-[var(--texto-principal)] border-[var(--linea-conexion)] focus:border-primary outline-none font-medium transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block text-[var(--texto-principal)]">
                  Contenido
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe tu duda, comparte código o explica tu problema con detalle..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border-2 bg-[var(--bg-general)] text-[var(--texto-principal)] border-[var(--linea-conexion)] focus:border-primary outline-none font-medium transition-colors resize-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-2 flex items-center gap-2 text-[var(--texto-principal)]">
                  <ImageIcon className="w-4 h-4" />
                  Imagen (opcional)
                </label>
                <div className="flex gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode("file");
                      setNewImageUrl("");
                      setImageError("");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      imageMode === "file"
                        ? "bg-primary/20 text-primary"
                        : "text-[var(--texto-principal)] opacity-70 hover:bg-[var(--bg-general)]"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Subir archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode("url");
                      setNewImageUrl("");
                      setImageError("");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      imageMode === "url"
                        ? "bg-primary/20 text-primary"
                        : "text-[var(--texto-principal)] opacity-70 hover:bg-[var(--bg-general)]"
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" /> URL
                  </button>
                </div>
                {imageMode === "file" ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-bold file:cursor-pointer hover:file:bg-primary/20 transition-colors cursor-pointer text-[var(--texto-principal)]"
                    />
                    {imageError && (
                      <p className="mt-2 text-sm font-medium text-red-500">
                        {imageError}
                      </p>
                    )}
                    {!imageError &&
                      newImageUrl &&
                      newImageUrl.startsWith("data:") && (
                        <img
                          src={newImageUrl}
                          alt="Vista previa"
                          className="mt-2 max-h-32 rounded-xl border border-[var(--linea-conexion)] object-contain"
                        />
                      )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border-2 bg-[var(--bg-general)] text-[var(--texto-principal)] border-[var(--linea-conexion)] focus:border-primary outline-none font-medium transition-colors"
                  />
                )}
              </div>
              {createError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-[var(--texto-principal)]"
                >
                  {createError}
                </p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl border-2 border-[var(--linea-conexion)] text-[var(--texto-principal)] font-bold hover:bg-[var(--bg-general)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim() || !newContent.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Publicar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
