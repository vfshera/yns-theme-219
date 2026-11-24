import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import type { FAQCategory } from "./faq-data";

/** One FAQ category's questions. Open/closed state is owned by Base UI. */
export function FaqAccordion({ category }: { category: FAQCategory }) {
  return (
    <Accordion>
      {category.questions.map((item, index) => (
        <AccordionItem
          key={`${category.id}-${index}`}
          value={`${category.id}-${index}`}
        >
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
