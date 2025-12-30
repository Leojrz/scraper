# 🔍 Google Maps Lead Scraper

Aplicación web para hacer scraping de leads de negocios desde Google Maps. Extrae información de contacto incluyendo nombre, teléfono, email, website y redes sociales, con exportación a Excel.

![Lead Scraper Screenshot](https://i.imgur.com/placeholder.png)

## ✨ Características

- 🔎 Búsqueda por categoría, ciudad y país
- 📞 Extrae teléfono y dirección de Google Maps
- 📧 Busca emails en los websites de los negocios
- 📱 Detecta redes sociales (Instagram, Facebook, LinkedIn)
- 📊 Exporta a Excel con formato profesional
- ⚡ Progreso en tiempo real
- 🎨 Interfaz moderna con tema oscuro

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Leojrz/scraper.git
cd scraper

# Instalar dependencias
npm install

# Iniciar el servidor
npm start
```

## 📖 Uso

1. Abrir http://localhost:3000 en el navegador
2. Ingresar la categoría del negocio (ej: "plumber", "dentist", "restaurant")
3. Ingresar la ciudad y el país
4. Click en "Iniciar Scraping"
5. Esperar a que termine el proceso
6. Descargar el archivo Excel con los resultados

## 📊 Datos Extraídos

| Campo | Fuente |
|-------|--------|
| Nombre | Google Maps |
| Teléfono | Google Maps |
| Dirección | Google Maps |
| Website | Google Maps |
| Rating | Google Maps |
| Email | Website del negocio |
| Instagram | Website del negocio |
| Facebook | Website del negocio |
| LinkedIn | Website del negocio |

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express
- **Scraping**: Puppeteer (Chrome headless)
- **Excel**: ExcelJS
- **Frontend**: HTML/CSS/JS (Vanilla)

## ⚠️ Notas

- Google Maps tiene un límite de ~120 resultados por búsqueda
- Para obtener más leads, realiza búsquedas más específicas por zona
- El proceso puede tomar varios minutos dependiendo de la cantidad de negocios

## 📁 Estructura

```
scraper/
├── server.js              # Servidor Express
├── scraper/
│   ├── googleMaps.js      # Scraper de Google Maps
│   ├── websiteScraper.js  # Extractor de emails y redes
│   └── excelGenerator.js  # Generador de Excel
├── public/
│   ├── index.html         # Interfaz de usuario
│   ├── styles.css         # Estilos
│   └── app.js             # Lógica del frontend
└── output/                # Archivos Excel generados
```

## 📄 Licencia

MIT License
