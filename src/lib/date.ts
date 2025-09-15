export const isValidDate = (input: string) => {
  const date = new Date(input);
  return !isNaN(date.getTime());
};

export const addOneDay = (input: string) => {
  const date = new Date(input); // parses ISO string

  date.setDate(date.getDate() + 1); // add 1 day

  const output = date.toISOString().slice(0, 10);

  return output;
};

export const getDateFromString = (input: string) => {
  const [year, month, day] = input.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JavaScript
};
