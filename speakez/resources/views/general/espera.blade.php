@extends('layouts.principal')
@section('titulo', 'Esperando')
@section('contenido')
    <div class="espera">
        <h1>Esperando...</h1>
        <p>Estamos procesando tu solicitud. Por favor, espera un momento.</p>
        <img src="{{ asset('img/espera.gif') }}" alt="Esperando" class="espera-gif">
    </div>
@endsection
