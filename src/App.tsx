import { useState, useEffect, useId, useCallback } from 'react'
import { 
  Button, 
  Card, 
  CardHeader, 
  Text, 
  Textarea,
  Slider,
  Label,
  makeStyles,
  tokens,
  MessageBar,
  Toast,
  ToastTitle,
  Toaster,
  useToastController,
  ColorPicker,
  ColorArea,
  ColorSlider,
  AlphaSlider,
  Popover,
  PopoverTrigger,
  PopoverSurface
} from '@fluentui/react-components'
import { ArrowDownload24Regular, QrCode24Regular, ErrorCircle24Regular, Copy24Regular } from '@fluentui/react-icons'
import { TinyColor } from '@ctrl/tinycolor'
import DOMPurify from 'dompurify'
import QRCode from 'qrcode'
import './App.css'

// Define QR code options
interface QROptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  width: number
  margin: number
  color: {
    dark: string
    light: string
  }
}

interface ValidationError {
  message: string
  type: 'error' | 'warning'
}

const useStyles = makeStyles({
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    alignItems: 'start',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '24px',
    },
  },
  inputSection: {
    height: 'fit-content',
  },
  inputCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  qrSection: {
    height: 'fit-content',
  },
  qrCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    minHeight: '400px',
    justifyContent: 'center',
  },
  qrCanvas: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    maxWidth: '100%',
    height: 'auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  textInput: {
    minHeight: '120px',
    width: '100%',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr 1fr',
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
      gap: '16px',
    },
  },
  optionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  colorInputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  placeholderArea: {
    padding: '60px 20px',
    border: `2px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  colorPickerContainer: {
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  previewColor: {
    margin: '10px 0',
    width: '50px',
    height: '50px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  colorPickerRow: {
    display: 'flex',
    gap: '10px',
  },
  colorSliders: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  colorPickerButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  footer: {
    marginTop: 'auto',
    padding: '20px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    fontSize: '14px',
  },
  footerLink: {
    color: '#3A5233',
    textDecoration: 'none',
    fontWeight: '500',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
})

function App() {
  const [inputText, setInputText] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [validationError, setValidationError] = useState<ValidationError | null>(null)
  const [options, setOptions] = useState<QROptions>({
    errorCorrectionLevel: 'H', // Always use highest error correction
    width: 256,
    margin: 4,
    color: {
      dark: '#3A5233',
      light: '#FFFFFF'
    }
  })
  
  // Color picker state management
  const [foregroundColorOpen, setForegroundColorOpen] = useState(false)
  const [backgroundColorOpen, setBackgroundColorOpen] = useState(false)
  const [previewForegroundColor, setPreviewForegroundColor] = useState(() => {
    const color = new TinyColor('#3A5233')
    const hsv = color.toHsv()
    return { h: hsv.h, s: hsv.s * 100, v: hsv.v * 100, a: hsv.a || 1 }
  })
  const [previewBackgroundColor, setPreviewBackgroundColor] = useState(() => {
    const color = new TinyColor('#FFFFFF')
    const hsv = color.toHsv()
    return { h: hsv.h, s: hsv.s * 100, v: hsv.v * 100, a: hsv.a || 1 }
  })
  
  // Rate limiting state
  const [lastGenerationTime, setLastGenerationTime] = useState(0)
  const [generationCount, setGenerationCount] = useState(0)
  
  // API mode state
  const [apiMode, setApiMode] = useState(false)
  
  const styles = useStyles()
  const toasterId = useId()
  const { dispatchToast } = useToastController(toasterId)
  
  const notify = (message: string, intent: "success" | "error" = "success") =>
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { position: "bottom-end", intent, timeout: 3000 }
    )

  // Sanitize input text to prevent XSS and other attacks
  const sanitizeInput = useCallback((text: string): string => {
    // First, use DOMPurify to clean any HTML/script content
    const cleaned = DOMPurify.sanitize(text, { 
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true // Keep text content but remove tags
    })
    
    // Remove any remaining potentially dangerous characters using a safer approach
    const cleanText = cleaned.split('').filter(char => {
      const code = char.charCodeAt(0)
      // Allow most characters but block dangerous control characters
      // Keep: tab(9), newline(10), carriage return(13)
      return !(
        (code >= 0 && code <= 8) ||    // Block \0 to \b
        (code === 11) ||               // Block \v (vertical tab)
        (code === 12) ||               // Block \f (form feed)
        (code >= 14 && code <= 31) ||  // Block \x0E to \x1F
        (code === 127)                 // Block DEL
      )
    }).join('')
    
    return cleanText.trim()
  }, [])

  // Handle URL parameters for API mode
  const handleUrlParameters = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const text = urlParams.get('text')
    const width = urlParams.get('width')
    const errorLevel = urlParams.get('error')
    const foreground = urlParams.get('fg') || urlParams.get('foreground')
    const background = urlParams.get('bg') || urlParams.get('background')
    
    // If text parameter is present, switch to API mode
    if (text) {
      setApiMode(true)
      
      try {
        // Sanitize the input text
        const sanitizedText = sanitizeInput(text)
        
        // Build options from URL parameters
        const qrOptions: QROptions = {
          errorCorrectionLevel: (errorLevel as 'L' | 'M' | 'Q' | 'H') || 'H',
          width: width ? Math.min(Math.max(parseInt(width), 128), 1024) : 256,
          margin: 4,
          color: {
            dark: foreground || '#3A5233',
            light: background || '#FFFFFF'
          }
        }
        
        // Generate QR code
        const dataUrl = await QRCode.toDataURL(sanitizedText, {
          errorCorrectionLevel: qrOptions.errorCorrectionLevel,
          width: qrOptions.width,
          margin: qrOptions.margin,
          color: qrOptions.color,
        })
        
        // Return base64 data in JSON format
        const apiResponse = {
          success: true,
          image: dataUrl,
          input: sanitizedText,
          options: qrOptions
        }
        
        // Return minimal HTML with just the JSON for easier extraction
        document.open()
        document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>QR API Response</title></head><body><script type="application/json" id="api-response">${JSON.stringify(apiResponse)}</script><pre>${JSON.stringify(apiResponse, null, 2)}</pre></body></html>`)
        document.close()
        
      } catch (error) {
        console.error('URL parameter QR generation failed:', error)
        
        // Return JSON error response
        const errorResponse = {
          success: false,
          error: 'Failed to generate QR code',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
        
        // Return minimal HTML with error JSON
        document.open()
        document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>QR API Error</title></head><body><script type="application/json" id="api-response">${JSON.stringify(errorResponse)}</script><pre>${JSON.stringify(errorResponse, null, 2)}</pre></body></html>`)
        document.close()
      }
    }
  }, [sanitizeInput])

  // Enhanced input validation with security checks
  const validateInput = useCallback((text: string): ValidationError | null => {
    // Sanitize input first
    const sanitizedText = sanitizeInput(text)
    
    if (!sanitizedText.trim()) {
      return null // Empty is allowed, just won't generate QR
    }
    
    // Check if sanitization removed content (potential attack)
    if (text.length !== sanitizedText.length) {
      return {
        message: 'Input contained invalid characters that were removed. Please use plain text only.',
        type: 'warning'
      }
    }
    
    // Check for maximum length
    if (sanitizedText.length > 2953) {
      return {
        message: 'Text is too long. Maximum 2953 characters allowed for QR codes.',
        type: 'error'
      }
    }
    
    // Check for potentially dangerous content patterns
    const dangerousPatterns = [
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /<script/i,
      /on\w+\s*=/i, // Event handlers like onclick=
      /<iframe/i,
      /<object/i,
      /<embed/i
    ]
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitizedText)) {
        return {
          message: 'Input contains potentially unsafe content. Please use plain text only.',
          type: 'error'
        }
      }
    }
    
    // Check for excessive control characters using a safer approach
    const controlCharCount = sanitizedText.split('').filter(char => {
      const code = char.charCodeAt(0)
      return (code >= 0 && code <= 31) || (code >= 127 && code <= 159)
    }).length
    
    if (controlCharCount > 10) {
      return {
        message: 'Input contains too many control characters.',
        type: 'warning'
      }
    }
    
    if (sanitizedText.length > 1000) {
      return {
        message: 'Long text may result in complex QR codes that are harder to scan.',
        type: 'warning'
      }
    }
    
    return null
  }, [sanitizeInput])

  const generateQRCode = useCallback(async () => {
    try {
      // Sanitize input before processing
      const sanitizedText = sanitizeInput(inputText)
      
      const qrCodeOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel,
        width: Math.min(Math.max(options.width, 128), 1024), // Constrain width for security
        margin: Math.min(Math.max(options.margin, 0), 10), // Constrain margin
        color: options.color,
      }
      
      const dataUrl = await QRCode.toDataURL(sanitizedText, qrCodeOptions)
      
      // Validate generated data URL
      if (!dataUrl.startsWith('data:image/png;base64,')) {
        throw new Error('Invalid QR code format generated')
      }
      
      setQrDataUrl(dataUrl)
      
      // Update rate limiting counters only after successful generation
      const now = Date.now()
      setLastGenerationTime(now)
      setGenerationCount(prev => prev + 1)
    } catch (error) {
      // Log detailed error for debugging but show generic message to user
      console.error('QR code generation failed:', error instanceof Error ? error.message : 'Unknown error')
      setValidationError({
        message: 'Failed to generate QR code. Please try with different text.',
        type: 'error'
      })
      setQrDataUrl('') // Clear any existing QR code
    }
  }, [inputText, options, sanitizeInput])

  // Generate QR code whenever input text or options change (with debouncing)
  useEffect(() => {
    const error = validateInput(inputText)
    setValidationError(error)
    
    if (inputText.trim() && (!error || error.type === 'warning')) {
      // Simple debouncing instead of complex rate limiting
      const timeoutId = setTimeout(() => {
        const now = Date.now()
        
        // Reset counter if more than 1 minute has passed
        if (lastGenerationTime === 0 || (now - lastGenerationTime) > 60000) {
          setGenerationCount(0)
        }
        
        // Check rate limits: max 100 generations per minute 
        if (generationCount >= 100 && (now - lastGenerationTime) < 60000) {
          setValidationError({
            message: 'Rate limit exceeded. Please wait before generating more QR codes.',
            type: 'warning'
          })
          return
        }
        
        generateQRCode()
      }, 500) // 300ms debounce
      
      return () => clearTimeout(timeoutId)
    } else {
      setQrDataUrl('')
    }
  }, [inputText, options, validateInput, generateQRCode, generationCount, lastGenerationTime])

  // Check URL parameters on component mount for API mode
  useEffect(() => {
    handleUrlParameters()
  }, [handleUrlParameters])

  const downloadQRCode = () => {
    if (!qrDataUrl || !qrDataUrl.startsWith('data:image/png;base64,')) {
      notify("Invalid QR code data", "error")
      return
    }
    
    try {
      const link = document.createElement('a')
      // Sanitize filename - remove potentially dangerous characters
      const timestamp = Date.now()
      const sanitizedFilename = `qr-code-${timestamp}.png`.replace(/[^a-zA-Z0-9.-]/g, '')
      
      link.download = sanitizedFilename
      link.href = qrDataUrl
      link.style.display = 'none' // Hide the link
      
      // Add to DOM, click, then remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      notify("QR Code downloaded successfully")
    } catch (error) {
      console.error('Download failed:', error instanceof Error ? error.message : 'Unknown error')
      notify("Failed to download QR code", "error")
    }
  }

  const copyToClipboard = async () => {
    if (!qrDataUrl || !qrDataUrl.startsWith('data:image/png;base64,')) {
      notify("Invalid QR code data", "error")
      return
    }
    
    // Check if clipboard API is available and secure context
    if (!navigator.clipboard || !window.isSecureContext) {
      notify("Clipboard access requires HTTPS", "error")
      return
    }
    
    try {
      const response = await fetch(qrDataUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch QR code data')
      }
      
      const blob = await response.blob()
      
      // Validate blob type
      if (blob.type !== 'image/png') {
        throw new Error('Invalid image format')
      }
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      
      notify("QR Code copied to clipboard")
    } catch (error) {
      console.error('Clipboard copy failed:', error instanceof Error ? error.message : 'Unknown error')
      
      // Secure fallback - only copy if the data URL is valid
      try {
        if (qrDataUrl.startsWith('data:image/png;base64,')) {
          await navigator.clipboard.writeText(qrDataUrl)
          notify("QR Code data copied to clipboard")
        } else {
          throw new Error('Invalid data format')
        }
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError instanceof Error ? fallbackError.message : 'Unknown error')
        notify("Failed to copy to clipboard", "error")
      }
    }
  }

  // If in API mode, don't render the normal UI (it will be replaced by API result)
  if (apiMode) {
    return <div>Loading API result...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text as="h1" size={900} weight="bold" style={{ color: '#3A5233' }}>
          <QrCode24Regular style={{ marginRight: '8px' }} />
          QRtichoke - a QR Code Generator
        </Text>
        <br />
        <Text as="p" size={400} style={{ marginTop: '16px', color: '#4A6741' }}>
          Generate custom QR codes with various options and download them instantly
        </Text>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.inputSection}>
          <Card className={styles.inputCard}>
            <CardHeader
              header={<Text weight="semibold" size={600}>Input & Options</Text>}
            />
            
            <div className={styles.optionItem}>
              <Label htmlFor="text-input" weight="semibold" size="large">
                Text or URL to encode:
              </Label>
              <Textarea
                id="text-input"
                placeholder="Enter text, URL, or any data to generate QR code..."
                value={inputText}
                onChange={(_, data) => setInputText(data.value)}
                className={styles.textInput}
                resize="none"
              />
              
              {validationError && (
                <MessageBar
                  intent={validationError.type === 'error' ? 'error' : 'warning'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ErrorCircle24Regular />
                    {validationError.message}
                  </div>
                </MessageBar>
              )}
            </div>

            <div className={styles.optionsGrid}>
              <div className={styles.optionItem}>
                <Label htmlFor="size-slider" weight="semibold">
                  Size: {options.width}px
                </Label>
                <Slider
                  id="size-slider"
                  min={128}
                  max={512}
                  step={32}
                  value={options.width}
                  onChange={(_, data) => {
                    setOptions(prev => ({ ...prev, width: data.value }))
                  }}
                />
              </div>

              <div className={styles.colorInputContainer}>
                <Label weight="semibold">
                  Foreground Color:
                </Label>
                <Popover
                  open={foregroundColorOpen}
                  onOpenChange={(_, data) => setForegroundColorOpen(data.open)}
                >
                  <PopoverTrigger disableButtonEnhancement>
                    <Button
                      appearance="outline"
                      style={{ 
                        width: '100%',
                        height: '40px',
                        backgroundColor: options.color.dark,
                        color: options.color.dark === '#FFFFFF' ? '#000000' : '#FFFFFF',
                        border: `2px solid ${tokens.colorNeutralStroke1}`,
                        borderRadius: tokens.borderRadiusSmall,
                        justifyContent: 'flex-start',
                        paddingLeft: '12px'
                      }}
                    >
                      {options.color.dark}
                    </Button>
                  </PopoverTrigger>
                  <PopoverSurface>
                    <div className={styles.colorPickerContainer}>
                      <ColorPicker
                        color={previewForegroundColor}
                        onColorChange={(_, data) => {
                          setPreviewForegroundColor({ ...data.color, a: data.color.a ?? 1 })
                        }}
                      >
                        <ColorArea
                          inputX={{ "aria-label": "Saturation" }}
                          inputY={{ "aria-label": "Brightness" }}
                        />
                        <div className={styles.colorPickerRow}>
                          <div className={styles.colorSliders}>
                            <ColorSlider aria-label="Hue" />
                            <AlphaSlider aria-label="Alpha" />
                          </div>
                          <div
                            className={styles.previewColor}
                            style={{
                              backgroundColor: new TinyColor(previewForegroundColor).toRgbString(),
                            }}
                          />
                        </div>
                      </ColorPicker>
                      <div className={styles.colorPickerButtons}>
                        <Button
                          appearance="primary"
                          onClick={() => {
                            const hexColor = new TinyColor(previewForegroundColor).toHexString()
                            setOptions(prev => ({
                              ...prev,
                              color: { ...prev.color, dark: hexColor }
                            }))
                            setForegroundColorOpen(false)
                          }}
                        >
                          OK
                        </Button>
                        <Button
                          onClick={() => {
                            setForegroundColorOpen(false)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </PopoverSurface>
                </Popover>
              </div>

              <div className={styles.colorInputContainer}>
                <Label weight="semibold">
                  Background Color:
                </Label>
                <Popover
                  open={backgroundColorOpen}
                  onOpenChange={(_, data) => setBackgroundColorOpen(data.open)}
                >
                  <PopoverTrigger disableButtonEnhancement>
                    <Button
                      appearance="outline"
                      style={{ 
                        width: '100%',
                        height: '40px',
                        backgroundColor: options.color.light,
                        color: options.color.light === '#FFFFFF' ? '#000000' : '#FFFFFF',
                        border: `2px solid ${tokens.colorNeutralStroke1}`,
                        borderRadius: tokens.borderRadiusSmall,
                        justifyContent: 'flex-start',
                        paddingLeft: '12px'
                      }}
                    >
                      {options.color.light}
                    </Button>
                  </PopoverTrigger>
                  <PopoverSurface>
                    <div className={styles.colorPickerContainer}>
                      <ColorPicker
                        color={previewBackgroundColor}
                        onColorChange={(_, data) => {
                          setPreviewBackgroundColor({ ...data.color, a: data.color.a ?? 1 })
                        }}
                      >
                        <ColorArea
                          inputX={{ "aria-label": "Saturation" }}
                          inputY={{ "aria-label": "Brightness" }}
                        />
                        <div className={styles.colorPickerRow}>
                          <div className={styles.colorSliders}>
                            <ColorSlider aria-label="Hue" />
                            <AlphaSlider aria-label="Alpha" />
                          </div>
                          <div
                            className={styles.previewColor}
                            style={{
                              backgroundColor: new TinyColor(previewBackgroundColor).toRgbString(),
                            }}
                          />
                        </div>
                      </ColorPicker>
                      <div className={styles.colorPickerButtons}>
                        <Button
                          appearance="primary"
                          onClick={() => {
                            const hexColor = new TinyColor(previewBackgroundColor).toHexString()
                            setOptions(prev => ({
                              ...prev,
                              color: { ...prev.color, light: hexColor }
                            }))
                            setBackgroundColorOpen(false)
                          }}
                        >
                          OK
                        </Button>
                        <Button
                          onClick={() => {
                            setBackgroundColorOpen(false)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </PopoverSurface>
                </Popover>
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.qrSection}>
          <Card className={styles.qrCard}>
            <CardHeader
              header={<Text weight="semibold" size={600}>Generated QR Code</Text>}
            />
            
            {qrDataUrl ? (
              <>
                <img 
                  src={qrDataUrl} 
                  alt="Generated QR Code" 
                  className={styles.qrCanvas}
                />
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    appearance="primary"
                    icon={<ArrowDownload24Regular />}
                    onClick={downloadQRCode}
                    size="large"
                    style={{ 
                      backgroundColor: '#FF7B54',
                      borderColor: '#FF7B54',
                      minWidth: '180px'
                    }}
                  >
                    Download QR Code
                  </Button>
                  <Button
                    appearance="outline"
                    icon={<Copy24Regular />}
                    onClick={copyToClipboard}
                    size="large"
                    style={{ 
                      minWidth: '180px',
                      borderColor: '#3A5233',
                      color: '#3A5233'
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              </>
            ) : (
              <div className={styles.placeholderArea}>
                <QrCode24Regular style={{ fontSize: '48px' }} />
                <Text size={400}>Enter text above to generate QR code</Text>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <Text size={300}>
            QRtichoke v{__APP_VERSION__}
          </Text>
          <Text size={300}>•</Text>
          <a 
            href="https://www.gotgreens.farm/broadfork" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Got Greens 🤝 Broadfork
          </a>
          <Text size={300}>•</Text>
          <a 
            href="https://github.com/gg-platform/QRtichoke" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            GitHub
          </a>
        </div>
      </footer>
      
      <Toaster
        toasterId={toasterId}
        position="bottom-start"
        pauseOnHover
        pauseOnWindowBlur
      />
    </div>
  )
}

export default App
