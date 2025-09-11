import { addMonths, format, parse } from 'date-fns';

export const getMonthList = (startMonth, endMonth) => {
  if (!startMonth || !endMonth) {
    return [];
  }
  
  const startDate = parse(startMonth, 'yyyyMM', new Date());
  const endDate = parse(endMonth, 'yyyyMM', new Date());
  const dates = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(format(currentDate, 'yyyyMM'));
    currentDate = addMonths(currentDate, 1);
  }

  return dates;
};