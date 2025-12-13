import React from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Container
} from '@mui/material'
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material'

interface ErrorInfo {
  componentStack: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Box sx={{ mb: 3 }}>
              <ErrorIcon
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 2,
                }}
              />
              <Typography variant="h4" component="h1" gutterBottom color="error">
                Oops! Etwas ist schiefgelaufen
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Ein unerwarteter Fehler ist aufgetreten. Versuchen Sie es bitte erneut.
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Fehler:</strong> {this.state.error?.message}
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
                size="large"
              >
                Erneut versuchen
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                size="large"
              >
                Seite neu laden
              </Button>
            </Box>

            {/* Development error details */}
            {import.meta.env.DEV && this.state.errorInfo && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Entwicklungsdetails:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: 'grey.100',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  <Typography variant="body2" component="pre">
                    {this.state.error?.stack}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Container>
      )
    }

    // Render children normally when there's no error
    return this.props.children
  }
}

export default ErrorBoundary
