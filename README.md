# Zalí Therapy App 🐟

Aplicación React para gestionar terapias con estimulación auditiva controlada por Bluetooth.

## 🚀 Características

- **Gestión de Pacientes**: Crear y administrar perfiles de pacientes
- **Control Bluetooth**: Conectarse a dispositivos Zalí para controlar la terapia
- **Joystick Virtual**: Control direccional del pez (arriba, abajo, izquierda, derecha)
- **Control de Velocidad**: 3 niveles de velocidad del nado
- **Estímulo Auditivo**: Activar sonidos terapéuticos
- **Historial de Métricas**: Registrar tiempos de adaptación y rutinas

## 📋 Requisitos

- Node.js 18.x o superior
- npm o yarn

## 💻 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/e24garduno-web/Zali-App.git
cd Zali-App

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app se abrirá en http://localhost:3000

## 🔨 Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 🌐 Despliegue en Netlify

### Opción 1: Conectar desde Netlify Dashboard
1. Ve a [netlify.com](https://netlify.com)
2. Haz clic en "New site from Git"
3. Conecta tu repositorio GitHub
4. Selecciona rama `main`
5. Build command: `npm run build`
6. Publish directory: `dist`
7. ¡Deploy!

### Opción 2: CLI de Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🔧 Configuración

### netlify.toml
El archivo `netlify.toml` contiene la configuración para Netlify:
- Build command: `npm run build`
- Publish directory: `dist`
- Redirecciones SPA configuradas

## 📱 Compatibilidad

- ✅ Chrome/Chromium (Bluetooth Web API)
- ✅ Edge (Bluetooth Web API)
- ✅ Opera (Bluetooth Web API)
- ⚠️ Firefox (soporte limitado de Bluetooth)
- ❌ Safari (sin soporte de Bluetooth Web API)

**Nota**: Bluetooth Web API requiere **HTTPS** en producción (Netlify lo proporciona automáticamente)

## 🎨 Stack Tecnológico

- **React** 18.2.0
- **Vite** 4.4.0
- **Tailwind CSS** 3.3.0
- **Lucide Icons** 0.263.1

## 📦 Dependencias

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "^0.263.1"
}
```

## 📄 Licencia

Privado

## 👤 Autor

e24garduno-web

---

**¿Problemas?** Revisa la consola del navegador (F12) para ver los logs de Bluetooth y depuración.
