<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/principal.css') }}">
    <title>@yield('titulo')</title>
    @yield('estilos')
</head>
<header>
    <x-menu></x-menu>
</header>

<body>
    <div class="contenedor-contenido">
        @yield('contenido')
    </div>
</body>
<footer>
    <p>&copy; 2025 SpeakEz. Todos los derechos reservados.</p>
</footer>

</html>
