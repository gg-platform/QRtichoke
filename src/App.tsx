import { useState, useEffect, useId } from 'react'
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
  const sanitizeInput = (text: string): string => {
    // First, use DOMPurify to clean any HTML/script content
    const cleaned = DOMPurify.sanitize(text, { 
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true // Keep text content but remove tags
    })
    
    // Remove any remaining potentially dangerous characters
    return cleaned
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters except \t, \n, \r
      .trim()
  }

  // Enhanced input validation with security checks
  const validateInput = (text: string): ValidationError | null => {
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
      /\<iframe/i,
      /\<object/i,
      /\<embed/i
    ]
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitizedText)) {
        return {
          message: 'Input contains potentially unsafe content. Please use plain text only.',
          type: 'error'
        }
      }
    }
    
    // Check for excessive control characters
    const controlCharCount = (sanitizedText.match(/[\x00-\x1F\x7F-\x9F]/g) || []).length
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
  }

  // Generate QR code whenever input text or options change
  useEffect(() => {
    const error = validateInput(inputText)
    setValidationError(error)
    
    if (inputText.trim() && (!error || error.type === 'warning')) {
      // Implement rate limiting
      const now = Date.now()
      const timeSinceLastGeneration = now - lastGenerationTime
      
      // Reset count if more than 1 minute has passed
      if (timeSinceLastGeneration > 60000) {
        setGenerationCount(0)
      }
      
      // Check rate limits: max 30 generations per minute
      if (generationCount >= 30 && timeSinceLastGeneration < 60000) {
        setValidationError({
          message: 'Rate limit exceeded. Please wait before generating more QR codes.',
          type: 'warning'
        })
        return
      }
      
      // Check minimum interval: 100ms between generations
      if (timeSinceLastGeneration < 100) {
        setTimeout(() => generateQRCode(), 100 - timeSinceLastGeneration)
        return
      }
      
      generateQRCode()
    } else {
      setQrDataUrl('')
    }
  }, [inputText, options])

  const generateQRCode = async () => {
    try {
      // Update rate limiting counters
      const now = Date.now()
      setLastGenerationTime(now)
      setGenerationCount(prev => prev + 1)
      
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
    } catch (error) {
      // Log detailed error for debugging but show generic message to user
      console.error('QR code generation failed:', error instanceof Error ? error.message : 'Unknown error')
      setValidationError({
        message: 'Failed to generate QR code. Please try with different text.',
        type: 'error'
      })
      setQrDataUrl('') // Clear any existing QR code
    }
  }

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text as="h1" size={900} weight="bold" style={{ color: '#3A5233' }}>
          <QrCode24Regular style={{ marginRight: '8px' }} />
          QR Code Generator
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
