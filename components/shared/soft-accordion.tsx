import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface SoftAccordionProps {
  className?: string
  items: { answer: string; question: string }[]
}

export function SoftAccordion({ className, items }: SoftAccordionProps) {
  return (
    <Accordion
      className={cn("soft-accordion mx-auto max-w-3xl", className)}
      collapsible
      type="single"
    >
      {items.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
