const { GoogleGenerativeAI } = require("@google/generative-ai");
const Course = require("../models/Course.model");
const Lesson = require("../models/Lesson.model");
const User = require("../models/User.model");
const Enrollment = require("../models/Enrollment.model");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

async function generateSummary(text) {
  try {

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    
    const prompt = `Por favor, genera un resumen conciso del siguiente texto, 
                    destacando los puntos principales y manteniéndolo claro y coherente: 
                    
                    ${text}`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    return response.text();
  } catch (error) {

    throw new Error("Error al generar el resumen");
  }
}

async function generateShortContent(topic) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Por favor, genera un contenido breve y preciso sobre el siguiente tema, 
                    destacando lo más relevante de manera clara y concisa:

                    ${topic}`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    return response.text();
  } catch (error) {
    throw new Error("Error al generar el contenido corto");
  }
}

async function chatbot(question, userId) {
  try {
    // Obtener el usuario y su rol
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    let courses, lessons;
    // Filtrar información según el rol
    switch (user.role) {
      case 'admin':
        // Admins pueden ver toda la información
        courses = await Course.find({}).populate('professor', 'name').populate('lessons');
        lessons = await Lesson.find({}).populate('course', 'title');
        /* enrollments = await Enrollment.find({}).populate('course', 'title'); */
        break;
        
      case 'profesor':
        // Profesores ven sus propios cursos y lecciones
        courses = await Course.find({ professor: userId });
        const professorCourseIds = courses.map(course => course._id);
        lessons = await Lesson.find({ course: { $in: professorCourseIds } });
        break;
        
      case 'estudiante':
        // Estudiantes ven solo los cursos en los que están inscritos
        const enrollments = await Enrollment.find({ student: userId })
          .populate('course');
        courses = enrollments.map(enrollment => enrollment.course);
        lessons = await Lesson.find({ 
          course: { $in: courses.map(course => course._id) }
        });
        break;
        
      default:
        throw new Error("Rol de usuario no válido");
    }
    console.log("contenido de cursos", courses)
    // Crear contexto personalizado según el rol ${user.role === 'admin' ? `- Profesor: ${course.professor.username}` : ''}
    const context = `
      ${user.role === 'admin' ? 'Información completa del sistema' : 
       user.role === 'professor' ? 'Información de tus cursos' : 
       'Información de tus cursos inscritos'}:

      Cursos disponibles:
      ${courses.map(course => `
        - ${course.title}
        - Descripción: ${course.description}
        - Categoría: ${course.category}
        - Duración: ${course.duration}
        - Idioma: ${course.language}
        - Precio: ${course.price}
        - Lecciones:${course.lessons.join()}
        - ${user.role === 'admin' ? `- Profesor: ${course.professor.name}` : ''}
      `).join('\n')}

      Lecciones disponibles:
      ${lessons.map(lesson => `
        - ${lesson.title}
        - Contenido: ${lesson.content && lesson.content.substring(0, 100)}...
      `).join('\n')}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
      Actúa como un asistente académico experto para un ${user.role}.
      Usa la siguiente información filtrada según el rol del usuario
      para responder la pregunta. Si la información no está disponible
      en el contexto, indica que no tienes acceso a esa información.

      Contexto:
      ${context}

      Pregunta del usuario:
      ${question}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error en chatbot:", error);
    throw new Error("Error al procesar la pregunta");
  }
}

module.exports = {
  generateSummary,
  generateShortContent,
  chatbot
};