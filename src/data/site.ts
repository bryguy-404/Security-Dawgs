export const contactEmail = 'luke@wyckoffconsulting.com';

export function contactLink(service = 'Threat Assessment') {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(`Security Dawgs — ${service}`)}&body=${encodeURIComponent(`Hi Luke,\n\nI'd like to learn more about ${service.toLowerCase()} with Security Dawgs.\n\nCompany:\nBest way to reach me:\n\nThanks!`)}`;
}

export const serviceInterests = {
  mdr: 'Free Threat Assessment',
  compliance: 'Free Compliance Review',
  'awareness-training': 'Free Phishing Test',
};
