export function getRandomElement<T>(array: Array<T>): T | undefined {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
