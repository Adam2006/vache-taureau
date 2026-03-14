import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import app from './config.js'

const db = getFirestore(app)
const gamesRef = collection(db, 'games')

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Create a new game in Firestore.
 * Returns { gameId, code }
 */
export async function createGame(config, playerSecret) {
  const code = generateCode()
  const gameDoc = doc(gamesRef)
  await setDoc(gameDoc, {
    code,
    digits: config.digits,
    timeLimit: config.timeLimit,
    status: 'waiting',
    turn: 'creator',
    creatorSecret: playerSecret,
    joinerSecret: null,
    creatorGuesses: [],
    joinerGuesses: [],
    winner: null,
    createdAt: serverTimestamp(),
  })
  return { gameId: gameDoc.id, code }
}

/**
 * Join a game by invite code.
 * Returns { gameId, role: 'joiner' }
 * Throws if no game found or game already started.
 */
export async function joinGame(code, playerSecret) {
  const q = query(gamesRef, where('code', '==', code), where('status', '==', 'waiting'))
  const snap = await getDocs(q)
  if (snap.empty) {
    throw new Error('Aucune partie trouvée avec ce code.')
  }
  const gameDoc = snap.docs[0]
  await updateDoc(gameDoc.ref, {
    joinerSecret: playerSecret,
    status: 'playing',
  })
  return { gameId: gameDoc.id, role: 'joiner' }
}

/**
 * Listen to real-time updates on a game document.
 * Returns an unsubscribe function.
 */
export function listenToGame(gameId, callback) {
  return onSnapshot(doc(db, 'games', gameId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() })
    }
  })
}

/**
 * Submit a guess: append to the player's guess array and flip the turn.
 */
export async function submitGuess(gameId, role, guess, result) {
  const field = role === 'creator' ? 'creatorGuesses' : 'joinerGuesses'
  const nextTurn = role === 'creator' ? 'joiner' : 'creator'
  await updateDoc(doc(db, 'games', gameId), {
    [field]: arrayUnion({ guess, taureaux: result.taureaux, vaches: result.vaches }),
    turn: nextTurn,
  })
}

/**
 * Set the winner and mark the game as finished.
 */
export async function setWinner(gameId, winner) {
  await updateDoc(doc(db, 'games', gameId), {
    winner,
    status: 'finished',
  })
}
