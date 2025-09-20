// app/api/uader/facultades/[id]/carreras/route.ts
import { NextRequest, NextResponse } from "next/server";

type tParams = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: tParams }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
  }

  const facultad = id;

  let carreras: { id: string; nombre: string }[] = [];
  if (facultad === "FCG") {
    // carrerasFCG
    carreras = [
      { id: "admin_pub", nombre: "Licenciatura en Administración Pública" },
      { id: "admin_emp", nombre: "Licenciatura en Administración de Empresas" },
      { id: "admin", nombre: "Tecnicatura en Administración" },
      { id: "archivologia", nombre: "Licenciatura en Archivología" },
      { id: "archivologia_tecn", nombre: "Tecnicatura en Archivología" },
      { id: "bibliotecologia", nombre: "Licenciatura en Bibliotecología" },
      { id: "bibliotecologia_tecn", nombre: "Tecnicatura en Bibliotecología" },
      {
        id: "comercio_internacional",
        nombre: "Licenciatura en Comercio Internacional",
      },
      {
        id: "comercio_internacional_tecn",
        nombre: "Tecnicatura en Comercio Internacional",
      },
      { id: "economia", nombre: "Licenciatura en Economía" },
      { id: "economia_prof", nombre: "Profesorado en Economía" },
      {
        id: "gastronomia",
        nombre: "Licenciatura en Gerenciamiento de Servicios Gastronómicos",
      },
      {
        id: "gastronomia_tecn",
        nombre: "Tecnicatura en Gerenciamiento de Servicios Gastronómicos",
      },
      {
        id: "guia_turismo",
        nombre: "Tecnicatura Universitaria en Guía de Turismo",
      },
      { id: "marketing", nombre: "Licenciatura en Marketing" },
      { id: "marketing_tecn", nombre: "Tecnicatura en Marketing" },
      { id: "museologia", nombre: "Tecnicatura en Museología" },
      { id: "turismo", nombre: "Licenciatura en Turismo" },
      { id: "turismo_tecn", nombre: "Tecnicatura en Turismo" },
    ];
  } else if (facultad === "FCyT") {
    // carrerasFCyT
    carreras = [
      // Tecnicaturas
      { id: "analisis_sistemas", nombre: "Análisis de Sistemas" },
      { id: "acuicultura", nombre: "Tecnicatura en Acuicultura" },
      { id: "balistica", nombre: "Tecnicatura en Balística" },
      { id: "documentologia", nombre: "Tecnicatura en Documentología" },
      { id: "papiloscopia", nombre: "Tecnicatura en Papiloscopía" },
      {
        id: "automatizacion_industrial",
        nombre:
          "Tecnicatura Universitaria en Automatización y Control de Procesos Industriales",
      },
      {
        id: "planeamiento_industrial",
        nombre: "Tecnicatura Universitaria en Planeamiento Industrial",
      },
      {
        id: "produccion_agropecuaria",
        nombre: "Tecnicatura Universitaria en Producción Agropecuaria",
      },
      {
        id: "granja_avicola",
        nombre: "Tecnicatura Universitaria en Granja y Producción Avícola",
      },
      {
        id: "produccion_porcina",
        nombre: "Tecnicatura Universitaria en Producción Porcina",
      },
      {
        id: "gestion_ambiental",
        nombre: "Tecnicatura Universitaria en Gestión Ambiental",
      },

      // Profesorados
      { id: "prof_biologia", nombre: "Profesorado Universitario en Biología" },
      { id: "prof_fisica", nombre: "Profesorado Universitario en Física" },
      { id: "prof_quimica", nombre: "Profesorado Universitario en Química" },
      {
        id: "prof_educacion_tec",
        nombre: "Profesorado Universitario en Educación Tecnológica",
      },
      {
        id: "prof_matematica",
        nombre: "Profesorado Universitario en Matemática",
      },
      {
        id: "prof_educacion_tic",
        nombre:
          "Profesorado Universitario en Educación Secundaria y Superior en Tecnologías de la Información y la Comunicación",
      },

      // Licenciaturas
      {
        id: "accidentologia_vial",
        nombre: "Licenciatura en Accidentología Vial",
      },
      {
        id: "automatizacion_industrial",
        nombre:
          "Licenciatura en Automatización y Control de Procesos Industriales",
      },
      { id: "biologia", nombre: "Licenciatura en Biología" },
      { id: "criminalistica", nombre: "Licenciatura en Criminalística" },
      { id: "gestion_ambiental", nombre: "Licenciatura en Gestión Ambiental" },
      {
        id: "produccion_agropecuaria",
        nombre: "Licenciatura en Producción Agropecuaria",
      },
      {
        id: "sistemas_informacion",
        nombre: "Licenciatura en Sistemas de Información",
      },

      // Ingenierías
      { id: "telecomunicaciones", nombre: "Ingeniería en Telecomunicaciones" },

      // Posgrados
      {
        id: "educacion_cientifica",
        nombre: "Especialización en Educación Científica",
      },
      {
        id: "gestion_proyectos_software",
        nombre: "Especialización en Gestión de Proyectos de Software",
      },
      {
        id: "geomatica_riesgos_ambientales",
        nombre:
          "Maestría Profesional en Geomática Aplicada a la Gestión de Riesgos Ambientales",
      },
    ];
  } else if (facultad === "FCVyS") {
    // carrerasFCVyS
    carreras = [
      // Licenciaturas
      { id: "enfermeria", nombre: "Licenciatura en Enfermería" },
      {
        id: "bioimagenes",
        nombre: "Licenciatura en Producción de Bioimágenes",
      },
      {
        id: "actividad_fisica",
        nombre: "Licenciatura en Actividad Física y Deporte",
      },
      {
        id: "higiene_seguridad",
        nombre: "Licenciatura en Higiene y Seguridad Laboral",
      },

      // Tecnicaturas
      { id: "enfermeria_universitaria", nombre: "Enfermería Universitaria" },
      { id: "podologia", nombre: "Podología Universitaria" },
      { id: "analisis_clinicos", nombre: "Tecnicatura en Análisis Clínicos" },
      {
        id: "protesis_dental",
        nombre: "Tecnicatura Universitaria en Prótesis Dental",
      },
      {
        id: "higiene_salud_animal",
        nombre: "Tecnicatura en Higiene y Salud Animal",
      },
      {
        id: "higiene_seguridad_laboral",
        nombre: "Tecnicatura en Higiene y Seguridad Laboral",
      },
      {
        id: "produccion_bioimagenes",
        nombre: "Tecnicatura en Producción de Bioimágenes",
      },
      {
        id: "actividad_fisica_deporte",
        nombre: "Tecnicatura Universitaria en Actividad Física y Deporte",
      },

      // Profesorados
      {
        id: "prof_educacion_fisica",
        nombre: "Profesorado Universitario de Educación Física",
      },
    ];
  } else if (facultad === "FHAyCS") {
    // carrerasFHAyCS
    carreras = [
      // Licenciaturas
      { id: "artes_visuales", nombre: "Licenciatura en Artes Visuales" },
      { id: "psicologia", nombre: "Licenciatura en Psicología" },
      { id: "canto_popular", nombre: "Licenciatura en Canto Popular" },
      {
        id: "interpretacion_instrumental",
        nombre: "Licenciatura en Interpretación Instrumental (solo Guitarra)",
      },
      { id: "canto_lirico", nombre: "Licenciatura en Canto Lírico" },
      { id: "historia", nombre: "Licenciatura en Historia" },
      { id: "filosofia", nombre: "Licenciatura en Filosofía" },
      { id: "geografia", nombre: "Licenciatura en Geografía" },
      { id: "ciencias_sociales", nombre: "Licenciatura en Ciencias Sociales" },

      // Profesorados
      {
        id: "prof_educacion_inicial",
        nombre: "Profesorado en Educación Inicial",
      },
      {
        id: "prof_educacion_primaria",
        nombre: "Profesorado en Educación Primaria",
      },
      {
        id: "prof_educacion_inicial_rural",
        nombre: "Profesorado en Educación Inicial con Orientación Rural",
      },
      {
        id: "prof_educacion_primaria_rural",
        nombre: "Profesorado en Educación Primaria con Orientación Rural",
      },
      {
        id: "prof_ciencias_sociales",
        nombre: "Profesorado en Ciencias Sociales",
      },
      { id: "prof_geografia", nombre: "Profesorado en Geografía" },
      { id: "prof_psicologia", nombre: "Profesorado en Psicología" },
      { id: "prof_historia", nombre: "Profesorado en Historia" },
      { id: "prof_filosofia", nombre: "Profesorado en Filosofía" },
      { id: "prof_frances", nombre: "Profesorado en Francés" },
      {
        id: "prof_lengua_literatura",
        nombre: "Profesorado en Lengua y Literatura",
      },
      { id: "prof_ingles", nombre: "Profesorado en Inglés" },
      { id: "prof_italiano", nombre: "Profesorado en Italiano" },
      {
        id: "prof_educacion_especial",
        nombre: "Profesorado Universitario en Educación Especial",
      },
      { id: "prof_portugues", nombre: "Profesorado en Portugués" },
      { id: "prof_musica", nombre: "Profesorado Universitario en Música" },
      { id: "prof_canto_lirico", nombre: "Profesorado en Canto Lírico" },
      { id: "prof_instrumento", nombre: "Profesorado de Instrumento" },
      { id: "prof_teatro", nombre: "Profesorado en Teatro" },

      // Tecnicaturas
      {
        id: "acompaniamiento_terapeutico",
        nombre: "Tecnicatura Universitaria en Acompañamiento Terapéutico",
      },
      {
        id: "psicogerontologia",
        nombre: "Tecnicatura Universitaria en Psicogerontología",
      },

      // Traductorados
      { id: "traductor_frances", nombre: "Traductorado en Francés" },
      { id: "traductor_italiano", nombre: "Traductorado Público de Italiano" },
    ];
  } else {
    // Facultad no reconocida
    return NextResponse.json(
      { error: "Facultad no reconocida." },
      { status: 400 }
    );
  }

  return NextResponse.json({ carreras });
}
