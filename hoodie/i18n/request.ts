import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Static imports for production compatibility
import enMessages from '../messages/en.json';
import arMessages from '../messages/ar.json';

const messages = {
  en: enMessages,
  ar: arMessages,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: messages[locale as keyof typeof messages],
    timeZone: 'Asia/Amman'
  };
});
