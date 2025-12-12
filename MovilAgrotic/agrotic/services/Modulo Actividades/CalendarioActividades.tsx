import React from 'react';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.']
};
LocaleConfig.defaultLocale = 'es';

interface CalendarioActividadesProps {
  onDateSelect: (date: string) => void;
  actividadesCounts: { [date: string]: number };
  selected: string;
}

const CalendarioActividades: React.FC<CalendarioActividadesProps> = ({ onDateSelect, actividadesCounts, selected }) => {
  const markedDates: MarkedDates = {};

  for (const date in actividadesCounts) {
    if (actividadesCounts[date] > 0) {
      markedDates[date] = { marked: true, dotColor: 'blue' };
    }
  }

  if (selected) {
    markedDates[selected] = { ...markedDates[selected], selected: true, selectedColor: '#2F95DC' };
  }

  return (
    <Calendar
      onDayPress={(day) => onDateSelect(day.dateString)}
      markedDates={markedDates}
      monthFormat={'MMMM yyyy'}
      theme={{
        todayTextColor: '#2F95DC',
      }}
    />
  );
};

export default CalendarioActividades;