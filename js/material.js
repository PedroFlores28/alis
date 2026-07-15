// material.js — generar material con IA + descargar PDF

async function generateMaterial({ student, type, difficulty, count, analysis }) {
  const client = window.supabaseClient;
  if (!client) throw new Error("Supabase no disponible");

  const { data: sessionData } = await client.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Inicia sesión de nuevo para generar material.");

  const cneb = typeof cnebForStudent === "function" ? cnebForStudent(student) : null;
  const url = (window.ALIS_CONFIG?.supabaseUrl || "") + "/functions/v1/generate-material";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      apikey: window.ALIS_CONFIG?.supabaseKey || "",
    },
    body: JSON.stringify({
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        subject: student.subject,
        subjectId: student.subjectId,
        focus: student.focus,
      },
      cneb: cneb
        ? {
            competence: cneb.competence,
            capacity: cneb.capacity,
            performance: cneb.performance,
          }
        : null,
      type,
      difficulty,
      count,
      analysis: analysis
        ? {
            topicTitle: analysis.topicTitle,
            next: analysis.next,
            obs: analysis.obs,
            summary: analysis.summary,
          }
        : null,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || ("Error generando material " + res.status));
  if (!json.material) throw new Error("Respuesta vacía del generador.");
  return json.material;
}

function safePdfName(name) {
  return String(name || "material")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "material";
}

function downloadMaterialPdf(material, student) {
  const JsPDF = window.jspdf?.jsPDF;
  if (!JsPDF) throw new Error("No se pudo cargar el generador de PDF. Recarga la página.");

  const doc = new JsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (need) => {
    if (y + need > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const write = (text, size, style) => {
    doc.setFont("helvetica", style || "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(text || ""), maxW);
    ensureSpace(lines.length * (size * 0.4) + 2);
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.4) + 2;
  };

  const typeLabel = { practica: "Práctica", quiz: "Quiz", reto: "Reto" }[material.type] || "Práctica";

  write("ALIS — Material de refuerzo", 14, "bold");
  write(`${typeLabel} · ${material.topic || material.title || "Tema"}`, 12, "bold");
  write(
    `Alumno: ${student?.name || ""}  |  Área: ${student?.subject || ""}  |  Competencia: ${student?.competenceLabel || student?.competenceId || ""}`,
    10,
    "normal"
  );
  write(`Dificultad: ${material.difficulty || ""}  ·  ${ (material.exercises || []).length } ejercicios`, 10, "normal");
  y += 2;

  (material.exercises || []).forEach((ex, i) => {
    write(`${ex.n || i + 1}) ${ex.prompt}`, 11, "bold");
    y += 3;
  });

  if (material.teacherNotes) {
    y += 4;
    write("Notas para el docente", 11, "bold");
    write(material.teacherNotes, 9, "italic");
  }

  // Clave en página aparte (opcional)
  const answers = (material.exercises || []).filter((ex) => ex.answer);
  if (answers.length) {
    doc.addPage();
    y = margin;
    write("Clave de respuestas (solo docente)", 12, "bold");
    y += 2;
    answers.forEach((ex, i) => {
      write(`${ex.n || i + 1}) ${ex.answer}`, 10, "normal");
    });
  }

  const file = `alis-${safePdfName(student?.name)}-${safePdfName(material.topic)}.pdf`;
  doc.save(file);
  return file;
}

Object.assign(window, { generateMaterial, downloadMaterialPdf });
