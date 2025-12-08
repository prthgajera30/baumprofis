import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/Auth/LoginForm'
import { InvoiceForm } from './components/Invoice/InvoiceForm'
import DevTools from './components/Dev/DevTools'

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  AlertTitle,
  Paper
} from '@mui/material'
import { ExitToApp as LogoutIcon } from '@mui/icons-material'

function App() {
  const { user, loading, logout } = useAuth()

  // Create mock user for development mode
  const mockUser = {
    email: 'dev@baumprofis.com',
    uid: 'dev-user-123'
  }

  // Check for development mode and use mock user
  const isDevMode = typeof window !== 'undefined' && localStorage.getItem('dev-mode') === 'true'
  const currentUser = isDevMode ? mockUser : user

  if (loading && !isDevMode) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!currentUser) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          py: 8
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Baumprofis Invoice Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Professionelle Rechnungserstellung für Baumpflege & Gartenarbeiten
            </Typography>
          </Paper>

          <Alert severity="warning" sx={{ mb: 4 }}>
            <AlertTitle>⚠️ Firebase nicht konfiguriert</AlertTitle>
            Siehe Konsole für Einrichtungsanweisungen
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => {
                  localStorage.setItem('dev-mode', 'true')
                  window.location.reload()
                }}
              >
                Entwicklungsmodus - Login umgehen
              </Button>
            </Box>
          </Alert>

          <LoginForm />
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Baumprofis Invoice Platform
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            Willkommen, {currentUser.email}
          </Typography>
          <IconButton
            color="inherit"
            onClick={async () => {
              if (isDevMode) {
                localStorage.removeItem('dev-mode')
                window.location.reload()
              } else {
                await logout()
              }
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <InvoiceForm />
      </Container>
      
      {/* Development Tools - only visible in development mode */}
      <DevTools />
    </Box>
  )
}

export default App
