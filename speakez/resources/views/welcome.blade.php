@extends('layouts.principal')
@section('titulo', 'SpeakEz')
@section('contenido')
    <h1>Bienvenido a SpeakEz</h1>
    <p>Esta es una aplicación para turistas.</p>
    <p>¡Disfruta!</p>
    <div>
        <h2>Lugares para turistear</h2>
        <ul>
            <li><a href="https://www.visitmexico.com/es/destinos-principales/ciudad-de-mexico">Ciudad de México</a></li>
            <li><a href="https://www.visitmexico.com/es/destinos-principales/guadalajara">Guadalajara</a></li>
            <li><a href="https://www.visitmexico.com/es/destinos-principales/monterrey">Monterrey</a></li>
            <li><a href="https://www.visitmexico.com/es/destinos-principales/cancun">Cancún</a></li>
        </ul>
    </div>
    <div>
        <h2>Comida típica</h2>
        <ul>
            <li>Tacos</li>
            <li>Enchiladas</li>
            <li>Chiles en nogada</li>
            <li>Mole</li>
        </ul>
    </div>
    <div>
        <p>Temperatura</p>
        <p>La temperatura promedio en México es de 25°C.</p>
        <p>Fecha y hora: 25/04/2025 10:28 p.m</p>
    </div>
@endsection
