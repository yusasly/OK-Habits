# Prompts Utilizados.
## Primer Prompt:
>Adopta el rol de un desarrollador full-stack con experiencia en boostrap 5. Estructura como comenzar un proyecto de applicación web de Habit Loop con estos requerimentos:

**Requerimientos Técnicos Generales**:
1. Maquetación y Arquitectura Visual (Bootstrap 5)

Importación de Bootstrap 5 mediante CDN oficial en su versión CSS y JS Bundle.

**Jerarquía estructural obligatoria**: `container` => `row` => `col-*`. Queda prohibido el uso de columnas sueltas fuera de una fila.

**Adaptabilidad móvil completa utilizando el sistema de 12 columnas**: col-12 para dispositivos móviles y prefijos responsivos (`col-md-*, col-lg-*`) para tabletas y escritorio.

Barra de navegación responsiva (`navbar`) con menú colapsable funcional (`navbar-toggler`).

**Regla de estilo**: Prohibido el uso de hojas de estilo externas (`<link rel="stylesheet" href="...">` personalizadas) o bloques `<style>`. El espaciado (`m-*`, `p-*`), color, tipografía y alineación deben resolverse exclusivamente con clases utilitarias nativas de Bootstrap.

2. Lógica y Dinamismo (JavaScript Nativo)

**Manipulación dinámica del DOM**: inserción, edición, filtrado y eliminación de elementos visuales sin recargar la página.
Validación nativa de formularios mediante JavaScript antes de persistir la información.
**Consola de desarrollador limpia**: cero excepciones o errores en rojo durante el flujo de uso.

3. Persistencia de Datos en el Cliente

Implementación de almacenamiento local mediante localStorage o IndexedDB.

**Prueba de persistencia**: al presionar F5 o cerrar y abrir el navegador, todos los datos registrados por el usuario deben conservarse intactos en la interfaz.

4. Estándares de Accesibilidad, Usabilidad y Copyright

Todas las imágenes deben provenir de repositorios con licencia libre (Unsplash, Pexels o CC0) y contener obligatoriamente el atributo `alt="..."` descriptivo.

**Contraste cromático y legibilidad**: la prueba de Accessibility en Google Lighthouse (F12) debe arrojar un puntaje igual o superior a 85/100.

**Arquitectura de información clara**: un único `<h1>` por vista, jerarquía visual coherente y navegación intuitiva sin sobrecarga cognitiva.

## Segundo prompt:

> Ahora que conoces los requerimentos realiza lo siguiente:

Mobile-first con visualización para destopk también (responsive). Quiero un diseño moderno y que se adapte a los niveles de contraste requeridos. En el header incluye el título de la app llamada **“OK Habits”** y un navbar-toggler de lado (`aside`) traslúcido con opacidad bg-opacity-75 que incluya las secciones de **“Hábitos”**, **“Racha”**, **“Calendario”** y **“Configuración”**. En la página inicial de **"Hábitos"**, coloca el único `<h1>`: **“Empieza con un hábito”**, se mostrará la lista de hábitos donde cada hábito consistirá en una tarjeta. Las tarjetas de los hábitos orientadas de forma horizontal (`grid column`) deben contener un ícono que se pueda seleccionar relacionado al hábito, seguido del nombre del hábito, un checkbox que se rellenen cada que se marque completar hábito del color verde éxito (al presionar en el hábito se marca y se desmarca la casilla) se van seleccionando uno por uno por cada día que se realicen. Por default debe haber un hábito editable pre-hecho con una gota de agua como icono y el nombre de **“Tomar agua”**. Para agregar un hábito debe haber un botón con un ícono de **“+”** en forma de círculo que abrirá un apartado como ventana emergente (`modal`) donde pida los siguientes datos: **“Seleccionar ícono”** (en la cual, al presionar, aparecerán los íconos seleccionables de **“Bootstrap 5 / Icons / real-world”**), agrega una opción de elegir el color en el que se mostrará el hábito, un `textarea` con el placeholder: “Nombra tu hábito” y un botón (`btn-primary`) de “Guardar hábito”. Al instante se agregará como un nuevo hábito dentro de la lista de hábitos.

Debajo de ellos dos tarjetas divididas en el largo de la página cada una con `col-5` dejando un margen `mx-2`. En las cuales, la primera tarjeta (ambas centradas, `justify-content`) será la racha donde se mostrará el icono: "`<a href="https://www.flaticon.es/iconos-gratis/fuego" title="fuego iconos">Fuego iconos creados por Magnific - Flaticon</a>`" como imagen principal con el `alt=...` descriptivo `"Racha activa"` y debajo un subtitulo `<h2>` llamado "Racha" y la cantidad de racha activa. La segunda será el calendario donde se muestre el mes y un botón de "Ver calendario". El calendario será interactivo y se pueda editar desde ahí los dias anteriores. Agrega tambien en configuracion las funciones de accesibilidad para miopía y dislexia, asi como la configuración para elegir el tema con las opciones de "light", "dark" y "auto", y una forma de importar y exportar datos por medio de JSON. Y que todos los elementos tengan un margen en relación con la pantalla (`mx-1` o `mx-2`)
Separa el js del archivo html.
### Fuente utilizada para dislexia:
**OpenDyslexic** is a free typeface and font intended to mitigate some of the common reading errors caused by dyslexia. The typeface was created by Abbie Gonzalez, who released it through an open-source license.