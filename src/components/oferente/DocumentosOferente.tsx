import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Documento {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  url: string;
  created_at: string;
}

interface Props {
  usuarioId: string;
}

const DocumentosOferente: React.FC<Props> = ({ usuarioId }) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo: "",
    titulo: "",
    url: "",
  });

  useEffect(() => {
    if (usuarioId && usuarioId.length > 0) {
      fetchDocs();
    }
  }, [usuarioId]);

  const fetchDocs = async () => {
    const { data, error } = await supabase
      .from("documentos")
      .select("*")
      .eq("usuario_id", usuarioId) // ✅ IMPORTANTE
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar documentos.");
      console.error(error.message);
    } else {
      setDocumentos(data || []);
    }
  };

  const subirArchivo = async (): Promise<string | null> => {
    if (!archivo) return null;
    const nombre = `${usuarioId}/${Date.now()}_${archivo.name}`;
    const { error } = await supabase.storage
      .from("documentos")
      .upload(nombre, archivo);

    if (error) {
      toast.error("Error al subir el archivo");
      return null;
    }

    const url = supabase.storage.from("documentos").getPublicUrl(nombre)
      .data.publicUrl;
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("No estás autenticado.");
      return;
    }

    const urlSubida = await subirArchivo();
    if (!urlSubida) return;

    const { error } = await supabase.from("documentos").insert([
      {
        usuario_id: user.id,
        tipo: formData.tipo.trim().toLowerCase(),
        titulo: formData.titulo,
        url: urlSubida,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      toast.error("Error al guardar el documento.");
    } else {
      toast.success(
        <>
          📎 <strong>{formData.titulo}</strong>
          <br />
          Tipo: {formData.tipo}
        </>,
        { duration: 4000 }
      );
      setFormData({ tipo: "", titulo: "", url: "" });
      setArchivo(null);
      setTipoFiltro("todos");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchDocs();
    }
  };

  const eliminarDocumento = async (id: string, url: string) => {
    const confirmar = confirm("¿Eliminar este documento?");
    if (!confirmar) return;
    console.log("🗑️ Eliminando documento con id:", id);

    const parts = url.split("/");
    const nombreArchivo = decodeURIComponent(parts.slice(-2).join("/"));

    const { error: errorStorage } = await supabase.storage
      .from("documentos")
      .remove([nombreArchivo]);

    if (errorStorage) {
      console.warn("No se pudo eliminar del Storage:", errorStorage.message);
    }

    const { error } = await supabase.from("documentos").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar de la base de datos.");
    } else {
      toast.success("Documento eliminado.");
      setDocumentos((prev) => prev.filter((doc) => doc.id !== id)); // ✅ actualización inmediata
      await fetchDocs(); // ✅ sincronización completa
    }
  };

  const iniciarEdicion = (doc: Documento) => {
    setEditandoId(doc.id);
    setFormData({ tipo: doc.tipo, titulo: doc.titulo, url: doc.url });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormData({ tipo: "", titulo: "", url: "" });
  };

  const guardarCambios = async () => {
    if (!editandoId) return;

    const { error } = await supabase
      .from("documentos")
      .update({
        tipo: formData.tipo.trim().toLowerCase(),
        titulo: formData.titulo,
        url: formData.url,
      })
      .eq("id", editandoId);

    if (error) {
      toast.error("No se pudo actualizar.");
    } else {
      toast.success("Documento actualizado.");
      cancelarEdicion();
      fetchDocs();
    }
  };

  const estiloDoc = {
    border: "1px solid #ccc",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
  };

  const renderDoc = (doc: Documento) =>
    editandoId === doc.id ? (
      <>
        <select
          value={formData.tipo}
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
        >
          <option value="">Selecciona tipo</option>
          <option value="título">Título</option>
          <option value="certificado">Certificado</option>
          <option value="licencia">Licencia</option>
          <option value="curso">Curso</option>
          <option value="experiencia">Experiencia</option>
          <option value="proyecto">Proyecto</option>
          <option value="otro">Otro</option>
        </select>
        <input
          type="text"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
        />
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
        />
        <br />
        <button onClick={guardarCambios}>💾 Guardar</button>
        <button onClick={cancelarEdicion}>❌ Cancelar</button>
      </>
    ) : (
      <>
        <strong>{doc.tipo}</strong> — {doc.titulo}
        <br />
        <a href={doc.url} target="_blank" rel="noopener noreferrer">
          Ver documento
        </a>
        {seleccionado === doc.id && (
          <>
            <br />
            <button onClick={() => iniciarEdicion(doc)}>✏️ Editar</button>
            <button onClick={() => eliminarDocumento(doc.id, doc.url)}>
              🗑️ Eliminar
            </button>
          </>
        )}
      </>
    );

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>📎 Mis Documentos</h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
        <select
          value={formData.tipo}
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          required
        >
          <option value="">Selecciona tipo</option>
          <option value="título">Título</option>
          <option value="certificado">Certificado</option>
          <option value="licencia">Licencia</option>
          <option value="curso">Curso</option>
          <option value="experiencia">Experiencia</option>
          <option value="proyecto">Proyecto</option>
          <option value="otro">Otro</option>
        </select>
        <input
          type="text"
          placeholder="Título o descripción"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          required
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          required
        />
        <button type="submit">Añadir</button>
      </form>

      <div style={{ marginBottom: "1rem" }}>
        <label>🔽 Filtrar por tipo: </label>
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
        >
          <option value="todos">Todos</option>
          {[...new Set(documentos.map((d) => d.tipo.trim().toLowerCase()))].map(
            (tipo) => (
              <option key={tipo} value={tipo}>
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </option>
            )
          )}
        </select>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {/* 🔽 Titulaciones y Certificados */}
        {documentos.some((d) =>
          ["título", "certificado", "licencia", "curso"].includes(d.tipo)
        ) && (
          <>
            <h4>📜 Titulaciones y Certificados</h4>
            {documentos.filter(
              (d) =>
                ["título", "certificado", "licencia", "curso"].includes(
                  d.tipo
                ) &&
                (tipoFiltro === "todos" ||
                  d.tipo === tipoFiltro.trim().toLowerCase())
            ).length > 0 && (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {documentos
                  .filter((d) =>
                    ["título", "certificado", "licencia", "curso"].includes(
                      d.tipo
                    )
                  )
                  .filter((d) =>
                    tipoFiltro === "todos"
                      ? true
                      : d.tipo === tipoFiltro.trim().toLowerCase()
                  )
                  .map((doc) => (
                    <motion.li
                      key={doc.id}
                      onClick={() =>
                        setSeleccionado(seleccionado === doc.id ? null : doc.id)
                      }
                      style={{
                        ...estiloDoc,
                        backgroundColor:
                          seleccionado === doc.id ? "#f9f9f9" : "white",
                        cursor: "pointer",
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderDoc(doc)}
                    </motion.li>
                  ))}
              </ul>
            )}
          </>
        )}

        {/* 🔽 Experiencia y Otros */}
        {documentos.some((d) =>
          ["experiencia", "proyecto", "otro"].includes(d.tipo)
        ) && (
          <>
            <h4>🛠️ Experiencia y Otros</h4>
            {documentos.filter(
              (d) =>
                ["experiencia", "proyecto", "otro"].includes(d.tipo) &&
                (tipoFiltro === "todos" ||
                  d.tipo === tipoFiltro.trim().toLowerCase())
            ).length > 0 && (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {documentos
                  .filter((d) =>
                    ["experiencia", "proyecto", "otro"].includes(d.tipo)
                  )
                  .filter((d) =>
                    tipoFiltro === "todos"
                      ? true
                      : d.tipo === tipoFiltro.trim().toLowerCase()
                  )
                  .map((doc) => (
                    <motion.li
                      key={doc.id}
                      onClick={() =>
                        setSeleccionado(seleccionado === doc.id ? null : doc.id)
                      }
                      style={{
                        ...estiloDoc,
                        backgroundColor:
                          seleccionado === doc.id ? "#f9f9f9" : "white",
                        cursor: "pointer",
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderDoc(doc)}
                    </motion.li>
                  ))}
              </ul>
            )}
          </>
        )}
      </ul>
    </div>
  );
};
export default DocumentosOferente;
