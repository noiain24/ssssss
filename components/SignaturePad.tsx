'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'

export interface SignaturePadRef {
  clear: () => void
  getSignature: () => string
  isEmpty: () => boolean
}

interface SignaturePadProps {
  onSignatureChange?: (signature: string) => void
  initialSignature?: string
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSignatureChange, initialSignature }, ref) => {
    const signatureRef = useRef<SignatureCanvas>(null)

    useImperativeHandle(ref, () => ({
      clear: () => {
        signatureRef.current?.clear()
        onSignatureChange?.('')
      },
      getSignature: () => {
        if (signatureRef.current?.isEmpty()) return ''
        return signatureRef.current?.toDataURL() || ''
      },
      isEmpty: () => signatureRef.current?.isEmpty() ?? true,
    }))

    const handleEnd = () => {
      const signature = signatureRef.current?.toDataURL() || ''
      onSignatureChange?.(signature)
    }

    const handleClear = () => {
      signatureRef.current?.clear()
      onSignatureChange?.('')
    }

    return (
      <div className="space-y-2">
        <div className="relative border-2 border-dashed border-border rounded-lg bg-muted/30 touch-none">
          {initialSignature && !signatureRef.current ? (
            <img 
              src={initialSignature} 
              alt="Signature" 
              className="w-full h-[150px] object-contain"
            />
          ) : (
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: 'w-full h-[150px] rounded-lg',
                style: { width: '100%', height: '150px' }
              }}
              backgroundColor="transparent"
              penColor="#1f2937"
              onEnd={handleEnd}
            />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="w-full"
        >
          <Eraser className="w-4 h-4 mr-2" />
          ล้างลายเซ็น
        </Button>
      </div>
    )
  }
)

SignaturePad.displayName = 'SignaturePad'

export default SignaturePad
