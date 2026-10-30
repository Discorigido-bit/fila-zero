import React from 'react'

export default function ConfigFaltando() {
  return (
    <div className="tela-cheia">
      <div className="card-login" style={{ maxWidth: 460, textAlign: 'left' }}>
        <h1>Firebase não configurado</h1>
        <p className="subtitulo">O site abriu, mas faltam as chaves do projeto.</p>
        <p style={{ fontSize: '.9rem' }}>
          Crie o arquivo <b>.env</b> na raiz do projeto (veja o <b>.env.example</b>) com as 4 variáveis
          <b> VITE_FIREBASE_*</b> e reinicie o <b>npm run dev</b>.
        </p>
        <p style={{ fontSize: '.9rem' }}>
          Na Vercel, cadastre as mesmas variáveis em <b>Settings, Environment Variables</b> e faça um novo deploy.
        </p>
      </div>
    </div>
  )
}
