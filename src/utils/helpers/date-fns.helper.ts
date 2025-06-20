import { parse, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function parseDateFromFrenchLabel(label: string): Date {
  return parse(label, 'EEEE d MMMM yyyy', new Date(), { locale: fr });
}

export function parseIsoDate(dateString: string): Date {
  return parseISO(dateString);
}
