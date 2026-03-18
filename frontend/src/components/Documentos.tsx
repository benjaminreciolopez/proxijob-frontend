import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";

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

const Documentos: React.FC<Props> = ({ usuarioId }) => {
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
    // eslint-disable-next-line
  }, [usuarioId]);

  const fetchDocs = async () => {
    const { data, error } = await supabase
      .from("documentos")
      .select("*")
      .eq("usuario_id", usuarioId)
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
      toast.error("No estas autenticado.");
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
          <strong>{formData.titulo}</strong>
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
    const confirmar = confirm("Eliminar este documento?");
    if (!confirmar) return;
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
      setDocumentos((prev) => prev.filter((doc) => doc.id !== id));
      await fetchDocs();
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

  const renderDoc = (doc: Documento) =>
    editandoId === doc.id ? (
      <div className="space-y-3">
        <select
          value={formData.tipo}
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Selecciona tipo</option>
          <option value="titulo">Titulo</option>
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
          className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="success" onClick={guardarCambios}>Guardar</Button>
          <Button size="sm" variant="ghost" onClick={cancelarEdicion}>Cancelar</Button>
        </div>
      </div>
    ) : (
      <>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-medium text-grey-800 capitalize">{doc.tipo}</span>
            <span className="text-grey-400 mx-1.5">-</span>
            <span className="text-sm text-grey-600">{doc.titulo}</span>
          </div>
        </div>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 text-sm text-primary hover:text-primary-dark underline"
        >
          Ver documento
        </a>
        {seleccionado === doc.id && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-grey-200">
            <Button size="sm" variant="outline" onClick={() => iniciarEdicion(doc)}>Editar</Button>
            <Button size="sm" variant="danger" onClick={() => eliminarDocumento(doc.id, doc.url)}>Eliminar</Button>
          </div>
        )}
      </>
    );

  const filtrarDocs = (tipos: string[]) =>
    documentos
      .filter((d) => tipos.includes(d.tipo))
      .filter((d) =>
        tipoFiltro === "todos"
          ? true
          : d.tipo === tipoFiltro.trim().toLowerCase()
      );

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-grey-800 mb-4">Mis Documentos</h3>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-grey-200 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            required
            className="rounded-md border border-grey-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">Selecciona tipo</option>
            <option value="titulo">Titulo</option>
            <option value="certificado">Certificado</option>
            <option value="licencia">Licencia</option>
            <option value="curso">Curso</option>
            <option value="experiencia">Experiencia</option>
            <option value="proyecto">Proyecto</option>
            <option value="otro">Otro</option>
          </select>
          <input
            type="text"
            placeholder="Titulo o descripcion"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
            className="rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            required
            className="text-sm text-grey-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
          />
          <Button type="submit" variant="primary" size="sm">
            Anadir
          </Button>
        </div>
      </form>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-grey-600">Filtrar por tipo:</label>
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="rounded-md border border-grey-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
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

      {documentos.length === 0 ? (
        <EmptyState
          icon="📎"
          title="Sin documentos"
          description="No has subido ningun documento todavia."
        />
      ) : (
        <div className="space-y-6">
          {/* Titulaciones y Certificados */}
          {documentos.some((d) =>
            ["titulo", "certificado", "licencia", "curso"].includes(d.tipo)
          ) &&
            filtrarDocs(["titulo", "certificado", "licencia", "curso"]).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-grey-700 mb-3 uppercase tracking-wide">
                  Titulaciones y Certificados
                </h4>
                <div className="space-y-3">
                  {filtrarDocs(["titulo", "certificado", "licencia", "curso"]).map(
                    (doc) => (
                      <motion.div
                        key={doc.id}
                        onClick={() =>
                          setSeleccionado(seleccionado === doc.id ? null : doc.id)
                        }
                        className={`bg-white rounded-lg border border-grey-200 shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                          seleccionado === doc.id ? "ring-2 ring-primary/20 bg-grey-50" : ""
                        }`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {renderDoc(doc)}
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Experiencia y Otros */}
          {documentos.some((d) =>
            ["experiencia", "proyecto", "otro"].includes(d.tipo)
          ) &&
            filtrarDocs(["experiencia", "proyecto", "otro"]).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-grey-700 mb-3 uppercase tracking-wide">
                  Experiencia y Otros
                </h4>
                <div className="space-y-3">
                  {filtrarDocs(["experiencia", "proyecto", "otro"]).map((doc) => (
                    <motion.div
                      key={doc.id}
                      onClick={() =>
                        setSeleccionado(seleccionado === doc.id ? null : doc.id)
                      }
                      className={`bg-white rounded-lg border border-grey-200 shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                        seleccionado === doc.id ? "ring-2 ring-primary/20 bg-grey-50" : ""
                      }`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderDoc(doc)}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Documentos;
