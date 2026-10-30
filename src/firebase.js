import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Se o .env (ou as variáveis da Vercel) não estiverem preenchidos, o app mostra um aviso
// em vez de quebrar com tela branca.
export const firebaseConfigurado = Boolean(config.apiKey && config.projectId && config.appId)

let auth = null
let db = null
let persistenciaPronta = Promise.resolve()

if (firebaseConfigurado) {
  const app = initializeApp(config)
  auth = getAuth(app)
  // Sessão POR ABA: dá para testar aluno, cantina e responsável logados ao mesmo tempo
  // em abas diferentes. Para manter o login ao fechar o navegador, troque por browserLocalPersistence.
  persistenciaPronta = setPersistence(auth, browserSessionPersistence).catch(() => {})
  db = getFirestore(app)
}

export { auth, db, persistenciaPronta }
