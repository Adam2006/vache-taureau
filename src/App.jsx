import { useState, useCallback } from 'react'
import HomeScreen from './screens/HomeScreen.jsx'
import SetupScreen from './screens/SetupScreen.jsx'
import SecretScreen from './screens/SecretScreen.jsx'
import InviteScreen from './screens/InviteScreen.jsx'
import GameScreen from './screens/GameScreen.jsx'
import WinScreen from './screens/WinScreen.jsx'

const SCREENS = ['home', 'setup', 'secret', 'invite', 'game', 'win']

export default function App() {
  const [screen, setScreen] = useState('home')
  const [direction, setDirection] = useState('forward')

  const [config, setConfig] = useState({
    mode: 'human',
    digits: 4,
    timeLimit: 3,   // minutes
    joinCode: null,
  })
  const [playerSecret, setPlayerSecret] = useState('')
  const [gameResult, setGameResult] = useState(null)
  const [gameId, setGameId] = useState(null)
  const [role, setRole] = useState(null) // 'creator' | 'joiner'

  const navigate = useCallback((to, dir = 'forward') => {
    setDirection(dir)
    setScreen(to)
  }, [])

  const goBack = useCallback(() => {
    const idx = SCREENS.indexOf(screen)
    if (idx > 0) navigate(SCREENS[idx - 1], 'back')
  }, [screen, navigate])

  const transClass = direction === 'forward' ? 'screen-enter' : 'screen-back-enter'
  const screenProps = {
    navigate, goBack, config, setConfig,
    playerSecret, setPlayerSecret,
    gameResult, setGameResult,
    gameId, setGameId,
    role, setRole,
  }

  return (
    <div style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
      {screen === 'home'   && <HomeScreen   key="home"   {...screenProps} className={transClass} />}
      {screen === 'setup'  && <SetupScreen  key="setup"  {...screenProps} className={transClass} />}
      {screen === 'secret' && <SecretScreen key="secret" {...screenProps} className={transClass} />}
      {screen === 'invite' && <InviteScreen key="invite" {...screenProps} className={transClass} />}
      {screen === 'game'   && <GameScreen   key="game"   {...screenProps} className={transClass} />}
      {screen === 'win'    && <WinScreen    key="win"    {...screenProps} className={transClass} />}
    </div>
  )
}
