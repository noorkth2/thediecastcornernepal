'use client'

import { useRef, useState } from 'react'
import { Upload, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { bulkImportProducts } from '@/app/admin/products/actions'
import { useRouter } from 'next/navigation'

// A simple but robust CSV parser handling commas inside quotes
function parseCSV(csvText: string) {
  const lines = csvText.split('\n')
  if (lines.length < 2) return []

  const result = []
  const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''))

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const obj: any = {}
    const currentline = lines[i]
    let inQuotes = false
    let val = ''
    let j = 0

    for (const char of currentline) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        obj[headers[j]] = val.trim().replace(/^"|"$/g, '')
        val = ''
        j++
      } else {
        val += char
      }
    }
    obj[headers[j]] = val.trim().replace(/^"|"$/g, '')
    
    // Only add if there is a title (basic validation)
    if (obj.title) {
      result.push(obj)
    }
  }

  return result
}

export function ProductBulkImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setError(null)
    setSuccess(null)

    try {
      const text = await file.text()
      const data = parseCSV(text)
      
      if (data.length === 0) {
        throw new Error('No valid products found in the CSV.')
      }

      const res = await bulkImportProducts(data)
      
      if (!res.success) {
        throw new Error(res.error || 'Failed to import products')
      }

      setSuccess(`Successfully imported ${res.count} products!`)
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred while importing.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {error && <span className="text-sm text-red-400 font-medium">{error}</span>}
      {success && <span className="text-sm text-green-400 font-medium">{success}</span>}
      
      <a 
        href="/products_template.csv" 
        download 
        className="text-xs text-brand-gold hover:underline flex items-center gap-1 font-medium"
      >
        <Download className="w-3 h-3" /> Template
      </a>
      
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <Button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        variant="secondary"
        className="flex items-center gap-2 text-sm px-4 py-2.5 h-auto bg-surface-elevated hover:bg-surface-border text-white border-none"
      >
        {isImporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {isImporting ? 'Importing...' : 'Bulk Import (CSV)'}
      </Button>
    </div>
  )
}
