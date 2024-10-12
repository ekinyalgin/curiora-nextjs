import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ReportCategory } from '@prisma/client'

interface ReportModalProps {
      isOpen: boolean
      onClose: () => void
      onSubmit: (category: ReportCategory, description: string) => void
      type: 'post' | 'comment'
}

export function ReportModal({ isOpen, onClose, onSubmit, type }: ReportModalProps) {
      const [category, setCategory] = useState<ReportCategory | ''>('')
      const [description, setDescription] = useState('')

      const handleSubmit = () => {
            if (category) {
                  onSubmit(category as ReportCategory, description)
                  onClose()
                  setCategory('')
                  setDescription('')
            }
      }

      return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>Report {type}</DialogTitle>
                        </DialogHeader>
                        <Select onValueChange={(value) => setCategory(value as ReportCategory)}>
                              <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectItem value="SPAM">Spam or Advertisement</SelectItem>
                                    <SelectItem value="HATE_SPEECH">Hate Speech / Harassment</SelectItem>
                                    <SelectItem value="MISINFORMATION">Misleading or False Information</SelectItem>
                                    <SelectItem value="INAPPROPRIATE_LANGUAGE">Bad Language and Insults</SelectItem>
                                    <SelectItem value="INAPPROPRIATE_CONTENT">Inappropriate Content</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                        </Select>
                        <Textarea
                              placeholder="Additional details (optional)"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                        />
                        <DialogFooter>
                              <Button onClick={handleSubmit} disabled={!category}>
                                    Submit Report
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      )
}
