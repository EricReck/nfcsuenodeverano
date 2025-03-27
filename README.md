# Sueño de Verano - Control NFC

Aplicación web para gestionar pulseras NFC en el evento Sueño de Verano. Permite controlar pagos, accesos y servicios mediante pulseras NFC.

## Características

- Lectura y escritura de pulseras NFC
- Gestión de balance para pagos
- Control de cena y entrega de pulseras
- Sistema de ropero
- Interfaz moderna y responsive
- Diseño optimizado para dispositivos móviles

## Requisitos

- Dispositivo con capacidad NFC (smartphone o tablet)
- Navegador web moderno con soporte para Web NFC API
- Conexión HTTPS (requerido para Web NFC API)
- Pulseras NFC compatibles con NDEF

## Uso

1. Abre la aplicación en un dispositivo con NFC habilitado
2. Acerca una pulsera NFC al dispositivo
3. La aplicación mostrará la información almacenada en la pulsera
4. Puedes editar cualquier campo:
   - Nombre del portador
   - Balance
   - Estado de la cena
   - Estado de entrega de la pulsera
   - Número de ropero
5. Para añadir saldo:
   - Pulsa el botón "+" junto al campo de balance
   - Introduce la cantidad a añadir
   - Confirma la operación
6. Guarda los cambios pulsando el botón "Guardar"

## Notas Importantes

- La aplicación debe ejecutarse en un servidor HTTPS para que funcione la API Web NFC
- Los datos se almacenan localmente en el dispositivo
- Se recomienda hacer copias de seguridad periódicas de los datos
- La aplicación está optimizada para uso móvil

## Soporte Técnico

Para cualquier problema o consulta técnica, contacta con el equipo de soporte del evento. 