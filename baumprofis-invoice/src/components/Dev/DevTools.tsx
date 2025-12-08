import React, { useState, useEffect } from 'react';
import { previewInvoicePdf } from '../../utils/pdfPreview';
import { Button, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Divider } from '@mui/material';
import { 
  Visibility as PreviewIcon, 
  Close as CloseIcon, 
  Keyboard as KeyboardIcon 
} from '@mui/icons-material';

interface DevToolsProps {
  isVisible?: boolean;
}

/**
 * Development tools component for PDF preview and debugging
 * Only shows in development mode
 */
export const DevTools: React.FC<DevToolsProps> = ({ isVisible = true }) => {
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P for PDF preview
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        previewInvoicePdf();
      }
      
      // Ctrl/Cmd + Shift + D for dev menu
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDevMenu(!showDevMenu);
      }
      
      // Escape to close dev menu
      if (event.key === 'Escape') {
        setShowDevMenu(false);
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDevMenu]);

  // Don't render in production or if explicitly hidden
  if (!isVisible || !import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button for PDF Preview */}
      <Fab
        color="primary"
        aria-label="PDF Preview"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1400, // Above Material-UI z-index
        }}
        onClick={() => previewInvoicePdf()}
        title="Preview PDF (Ctrl+Shift+P)"
      >
        <PreviewIcon />
      </Fab>

      {/* Development Menu Button */}
      <Fab
        color="secondary"
        aria-label="Development Menu"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 88,
          zIndex: 1400,
        }}
        onClick={() => setShowDevMenu(!showDevMenu)}
        title="Development Menu (Ctrl+Shift+D)"
      >
        <KeyboardIcon />
      </Fab>

      {/* Development Menu Dialog */}
      <Dialog 
        open={showDevMenu} 
        onClose={() => setShowDevMenu(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Development Tools</Typography>
            <Button 
              onClick={() => setShowDevMenu(false)}
              size="small"
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            
            {/* PDF Preview Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                PDF Template Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Preview the current PDF template with sample data without filling forms.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PreviewIcon />}
                onClick={() => {
                  previewInvoicePdf();
                  setShowDevMenu(false);
                }}
                fullWidth
              >
                Open PDF Preview
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                Shortcut: Ctrl+Shift+P
              </Typography>
            </Box>

            <Divider />

            {/* Debugging Tools */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Debugging Tools
              </Typography>
              <Button
                variant="outlined"
                startIcon={<KeyboardIcon />}
                onClick={() => setShowKeyboardShortcuts(true)}
                fullWidth
              >
                Keyboard Shortcuts
              </Button>
            </Box>

            <Divider />

            {/* Development Info */}
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Development Mode:</strong> This panel is only visible in development mode.
                Changes to PDF templates will be reflected immediately in the preview.
              </Typography>
            </Box>

          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowDevMenu(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog 
        open={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Keyboard Shortcuts</Typography>
            <Button 
              onClick={() => setShowKeyboardShortcuts(false)}
              size="small"
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1}>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
              <Typography variant="body2">Preview PDF Template</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <kbd style={{ padding: '2px 6px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}>
                  Ctrl
                </kbd>
                <kbd style={{ padding: '2px 6px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}>
                  Shift
                </kbd>
                <kbd style={{ padding: '2px 6px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}>
                  P
                </kbd>
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
              <Typography variant="body2">Open Development Menu</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <kbd style={{ padding: '2px 6px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}>
                  Ctrl
                </kbd>
                <kbd style={{ padding: '2px 6px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}>
                  Shift
                </kbd>
                <kbd style={{ padding: '2px 6px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}>
                  D
                </kbd>
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
              <Typography variant="body2">Close Menus</Typography>
              <kbd style={{ padding: '2px 6px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}>
                Esc
              </kbd>
            </Box>

          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowKeyboardShortcuts(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DevTools;
